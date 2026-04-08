/* Number Nexus - Sudoku (preset puzzles + solver + hint)
   Features:
   - Preset puzzles (easy/medium/hard)
   - Render board, allow typing 1-9, arrow navigation
   - Highlight conflicts in rows/cols/boxes
   - Timer, error counter
   - Hint fills one correct cell using solver
   - Check & Solve (auto-fill) for convenience
*/

// ----- Preset puzzles (0 = empty) -----
// Each is a 9x9 array flattened to 81 numbers
const PRESETS = {
  easy: [
    // easy example
    0,0,3, 0,2,0, 6,0,0,
    9,0,0, 3,0,5, 0,0,1,
    0,0,1, 8,0,6, 4,0,0,
    0,0,8, 1,0,2, 9,0,0,
    7,0,0, 0,0,0, 0,0,8,
    0,0,6, 7,0,8, 2,0,0,
    0,0,2, 6,0,9, 5,0,0,
    8,0,0, 2,0,3, 0,0,9,
    0,0,5, 0,1,0, 3,0,0
  ],
  medium: [
    0,0,0, 2,6,0, 7,0,1,
    6,8,0, 0,7,0, 0,9,0,
    1,9,0, 0,0,4, 5,0,0,
    8,2,0, 1,0,0, 0,4,0,
    0,0,4, 6,0,2, 9,0,0,
    0,5,0, 0,0,3, 0,2,8,
    0,0,9, 3,0,0, 0,7,4,
    0,4,0, 0,5,0, 0,3,6,
    7,0,3, 0,1,8, 0,0,0
  ],
  hard: [
    0,0,0, 0,0,0, 0,1,2,
    0,0,0, 0,0,7, 0,0,0,
    0,0,1, 0,9,0, 5,0,0,
    0,0,0, 5,0,0, 0,0,0,
    0,4,0, 0,0,0, 0,6,0,
    0,0,0, 0,0,3, 0,0,0,
    0,0,5, 0,2,0, 3,0,0,
    0,0,0, 8,0,0, 0,0,0,
    4,2,0, 0,0,0, 0,0,0
  ]
};

// state
let board = new Array(81).fill(0);     // current values
let given = new Array(81).fill(false); // fixed numbers
let selectedIndex = 0;
let timerInterval = null;
let secondsElapsed = 0;
let errors = 0;

// DOM
const boardEl = document.getElementById('board');
const newBtn = document.getElementById('newBtn');
const checkBtn = document.getElementById('checkBtn');
const hintBtn = document.getElementById('hintBtn');
const solveBtn = document.getElementById('solveBtn');
const difficultySel = document.getElementById('difficulty');
const timerEl = document.getElementById('timer');
const errorsEl = document.getElementById('errors');
const messageEl = document.getElementById('message');

// build board table
function buildBoard(){
  boardEl.innerHTML = '';
  for(let r=0;r<9;r++){
    const tr = document.createElement('tr');
    for(let c=0;c<9;c++){
      const td = document.createElement('td');
      // add bold borders for boxes
      if((c+1)%3===0 && c<8) td.classList.add('bold-right');
      if((r+1)%3===0 && r<8) td.classList.add('bold-bottom');

      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.tabIndex = 0;
      cell.dataset.index = r*9 + c;

      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.dataset.index = r*9 + c;

      // events
      cell.addEventListener('click', () => selectCell(Number(cell.dataset.index)));
      input.addEventListener('keydown', onKeyDown);
      input.addEventListener('input', onInput);

      cell.appendChild(input);
      td.appendChild(cell);
      tr.appendChild(td);
    }
    boardEl.appendChild(tr);
  }
}

// load preset into board
function loadPreset(preset){
  for(let i=0;i<81;i++){
    const val = preset[i] || 0;
    board[i] = val;
    given[i] = val !== 0;
  }
  renderBoard();
  resetTimer();
  startTimer();
  errors = 0;
  updateMeta();
  message('');
}

// render board to DOM
function renderBoard(){
  const inputs = boardEl.querySelectorAll('input');
  inputs.forEach(inp => {
    const idx = Number(inp.dataset.index);
    const val = board[idx];
    inp.value = val === 0 ? '' : String(val);
    inp.readOnly = given[idx];
    inp.className = '';
    if(given[idx]) inp.classList.add('given');
  });
  clearHighlights();
  highlightConflicts();
  highlightSelected();
}

// helpers: row/col/box indices
function rowOf(idx){ return Math.floor(idx/9); }
function colOf(idx){ return idx%9; }
function boxStart(idx){ const r = rowOf(idx), c = colOf(idx); return { br: Math.floor(r/3)*3, bc: Math.floor(c/3)*3 }; }

// validation utilities
function isValidPlacement(arr, idx, val){
  if(val===0) return true;
  const r = rowOf(idx), c = colOf(idx);
  // row
  for(let cc=0;cc<9;cc++){
    const id = r*9+cc;
    if(id!==idx && arr[id]===val) return false;
  }
  // col
  for(let rr=0;rr<9;rr++){
    const id = rr*9+c;
    if(id!==idx && arr[id]===val) return false;
  }
  // box
  const {br,bc} = boxStart(idx);
  for(let rr=br; rr<br+3; rr++){
    for(let cc=bc; cc<bc+3; cc++){
      const id = rr*9+cc;
      if(id!==idx && arr[id]===val) return false;
    }
  }
  return true;
}

// highlight conflicts
function highlightConflicts(){
  const inputs = boardEl.querySelectorAll('input');
  for(let i=0;i<81;i++){
    const val = board[i];
    if(val===0) continue;
    if(!isValidPlacement(board, i, val)){
      // mark all conflicting cells in row/col/box
      markConflict(i);
    }
  }
}
function markConflict(idx){
  const r = rowOf(idx), c = colOf(idx);
  // row
  for(let cc=0;cc<9;cc++) markCell(r*9+cc,'conflict');
  // col
  for(let rr=0;rr<9;rr++) markCell(rr*9+c,'conflict');
  // box
  const {br,bc} = boxStart(idx);
  for(let rr=br; rr<br+3; rr++){
    for(let cc=bc; cc<bc+3; cc++){
      markCell(rr*9+cc,'conflict');
    }
  }
}
function markCell(idx, cls){
  const input = boardEl.querySelector(input[data-index="${idx}"]);
  if(input) input.classList.add(cls);
}
function clearHighlights(){
  boardEl.querySelectorAll('input').forEach(i => i.classList.remove('conflict','selected','hint'));
}

// selection
function selectCell(idx){
  selectedIndex = idx;
  const input = boardEl.querySelector(input[data-index="${idx}"]);
  input.focus();
  input.select();
  clearHighlights();
  highlightSelected();
  highlightConflicts();
}
function highlightSelected(){
  const s = boardEl.querySelector(input[data-index="${selectedIndex}"]);
  if(s) s.classList.add('selected');
}

// keyboard input
function onKeyDown(e){
  const idx = Number(e.target.dataset.index);
  if(!isFinite(idx)) return;
  // navigation
  if(e.key === 'ArrowRight') { moveSelection(idx, 0, 1); e.preventDefault(); return; }
  if(e.key === 'ArrowLeft')  { moveSelection(idx, 0, -1); e.preventDefault(); return; }
  if(e.key === 'ArrowUp')    { moveSelection(idx, -1, 0); e.preventDefault(); return; }
  if(e.key === 'ArrowDown')  { moveSelection(idx, 1, 0); e.preventDefault(); return; }

  if(e.key === 'Backspace' || e.key === 'Delete') {
    setCell(idx, 0);
    e.target.value = '';
    e.preventDefault();
    return;
  }
  if(/^[1-9]$/.test(e.key)){
    setCell(idx, Number(e.key));
    e.target.value = e.key;
    e.preventDefault();
    return;
  }
}
function moveSelection(idx, dr, dc){
  const r = rowOf(idx)+dr, c = colOf(idx)+dc;
  if(r<0||r>8||c<0||c>8) return;
  selectCell(r*9+c);
}

// on manual input (paste or mobile)
function onInput(e){
  const val = e.target.value.trim();
  const idx = Number(e.target.dataset.index);
  if(val === '') { setCell(idx, 0); return; }
  const ch = val.slice(-1);
  if(/^[1-9]$/.test(ch)){
    e.target.value = ch;
    setCell(idx, Number(ch));
  } else {
    e.target.value = '';
    setCell(idx, 0);
  }
}

// set cell value (if not given)
function setCell(idx, val){
  if(given[idx]) return;
  const prev = board[idx];
  board[idx] = val;
  // check validity
  if(val !== 0 && !isValidPlacement(board, idx, val)){
    errors++;
    errorsEl.textContent = errors;
    message('Conflict detected. Check highlighted cells.', 'warn');
  } else {
    message('');
  }
  renderBoard();
}

// timer
function startTimer(){
  clearInterval(timerInterval);
  secondsElapsed = 0;
  timerInterval = setInterval(()=> {
    secondsElapsed++;
    timerEl.textContent = formatTime(secondsElapsed);
  },1000);
}
function resetTimer(){
  clearInterval(timerInterval);
  secondsElapsed = 0;
  timerEl.textContent = formatTime(0);
}
function formatTime(s){
  const mm = String(Math.floor(s/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  return ${mm}:${ss};
}

// --- solver (backtracking) ---
function findEmpty(arr){
  for(let i=0;i<81;i++) if(arr[i]===0) return i;
  return -1;
}
function solveSudoku(arr){
  const idx = findEmpty(arr);
  if(idx === -1) return true;
  for(let num=1;num<=9;num++){
    if(isValidPlacement(arr, idx, num)){
      arr[idx] = num;
      if(solveSudoku(arr)) return true;
      arr[idx] = 0;
    }
  }
  return false;
}
function getSolution(){
  const copy = board.slice();
  if(solveSudoku(copy)) return copy;
  // try solving from original preset (some puzzles are solvable)
  return null;
}

// hint: fill one empty cell with a correct number using solver from the preset state
function giveHint(){
  // use the solved version of the ORIGINAL preset (reconstruct by applying given numbers)
  const preset = board.map((v,i)=> given[i] ? v : 0);
  const sol = preset.slice();
  if(!solveSudoku(sol)){
    message('No solution available for hint.', 'warn');
    return;
  }
  // find an index that's empty in current board and fill with sol value
  const empties = [];
  for(let i=0;i<81;i++) if(board[i]===0) empties.push(i);
  if(empties.length===0){ message('Board already full.'); return; }
  const idx = empties[Math.floor(Math.random()*empties.length)];
  board[idx] = sol[idx];
  message('Filled one correct cell (hint).');
  renderBoard();
}

// check correctness
function checkBoard(){
  // any zero? if so warn
  if(board.some(v=>v===0)){ message('Board incomplete — fill all cells before final check.','warn'); return; }
  // validate all placements
  for(let i=0;i<81;i++){
    if(!isValidPlacement(board, i, board[i])) {
      message('There are conflicts — find highlighted cells.','warn');
      return;
    }
  }
  // solved
  clearInterval(timerInterval);
  message(🎉 Puzzle solved! Time: ${formatTime(secondsElapsed)} Errors: ${errors}, 'success');
}

// solve (fill entire board using solver)
function solveAndFill(){
  // start from given cells only so we avoid overwriting user entries with contradictory values
  const preset = board.map((v,i)=> given[i] ? v : 0);
  const sol = preset.slice();
  if(!solveSudoku(sol)){ message('No valid solution found.', 'warn'); return; }
  board = sol;
  renderBoard();
  clearInterval(timerInterval);
  message('Solved (filled entire board).', 'success');
}

// new puzzle loader
function newPuzzle(){
  const diff = difficultySel.value;
  const arr = PRESETS[diff];
  if(!arr) return;
  loadPreset(arr);
  message('New puzzle loaded. Good luck!');
}

// message helper
function message(txt='', type=''){
  messageEl.textContent = txt;
  messageEl.className = 'message' + (type ? ' ' + (type==='success' ? 'success' : 'warn') : '');
}

// update meta
function updateMeta(){ errorsEl.textContent = errors; timerEl.textContent = formatTime(secondsElapsed); }

// wire up
buildBoard();
newBtn.addEventListener('click', newPuzzle);
checkBtn.addEventListener('click', checkBoard);
hintBtn.addEventListener('click', giveHint);
solveBtn.addEventListener('click', solveAndFill);

// start with medium preset
loadPreset(PRESETS['medium']);

// allow clicking cell to select
boardEl.addEventListener('click', (e) => {
  const t = e.target.closest('.cell');
  if(!t) return;
  const idx = Number(t.dataset.index);
  selectCell(idx);
});
