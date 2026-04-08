// ColorGrid - simple 2D rotate puzzle
(() => {
  const boardEl = document.getElementById('board');
  const sizeSelect = document.getElementById('size');
  const newGameBtn = document.getElementById('newGame');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const undoBtn = document.getElementById('undoBtn');
  const movesEl = document.getElementById('moves');
  const timeEl = document.getElementById('time');
  const selRowRadio = document.getElementById('selRow');
  const indexInput = document.getElementById('indexInput');
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const upBtn = document.getElementById('upBtn');
  const downBtn = document.getElementById('downBtn');
  const modal = document.getElementById('modal');
  const modalText = document.getElementById('modalText');
  const modalClose = document.getElementById('modalClose');
  const modalNew = document.getElementById('modalNew');
  const solveDemo = document.getElementById('solveDemo');

  let size = parseInt(sizeSelect.value, 10);
  let matrix = []; // current colors
  let solvedMatrix = [];
  const palette = [
    '#F6B042', // amber
    '#4FC3F7', // light blue
    '#A3E635', // lime
    '#F472B6', // pink
    '#8B5CF6', // violet
    '#34D399', // teal
    '#F87171', // red
    '#60A5FA'  // blue
  ];
  let moves = 0;
  let timerInterval = null;
  let startTime = null;
  let undoStack = [];

  function init() {
    size = parseInt(sizeSelect.value, 10);
    indexInput.max = size;
    indexInput.value = 1;
    moves = 0;
    movesEl.textContent = moves;
    resetTimer();
    undoStack = [];
    undoBtn.disabled = true;

    // build solved matrix: each row gets a unique color (wrap if needed)
    matrix = Array.from({length: size}, (_, r) =>
      Array.from({length: size}, (_, c) => palette[r % palette.length])
    );
    solvedMatrix = matrix.map(row => row.slice());
    renderGrid();
  }

  function startTimer() {
    if (timerInterval) return;
    startTime = Date.now();
    timerInterval = setInterval(() => {
      const diff = Date.now() - startTime;
      timeEl.textContent = formatTime(diff);
    }, 500);
  }

  function resetTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    timeEl.textContent = '00:00';
    startTime = null;
  }

  function formatTime(ms){
    const s = Math.floor(ms/1000);
    const mm = Math.floor(s/60).toString().padStart(2,'0');
    const ss = (s%60).toString().padStart(2,'0');
    return `${mm}:${ss}`;
  }

  function renderGrid() {
    // CSS grid columns
    boardEl.style.gridTemplateColumns = `repeat(${size}, var(--size))`;
    // clear
    boardEl.innerHTML = '';
    for (let r=0; r<size; r++){
      for (let c=0; c<size; c++){
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.background = matrix[r][c];
        tile.dataset.r = r;
        tile.dataset.c = c;
        // accessible label
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = `${r+1}.${c+1}`;
        tile.appendChild(label);

        // click to quick-select row/col
        tile.addEventListener('click', () => {
          if (selRowRadio.checked) {
            indexInput.value = r+1;
          } else {
            indexInput.value = c+1;
          }
        });

        boardEl.appendChild(tile);
      }
    }
  }

  function pushUndo() {
    // deep copy
    undoStack.push(matrix.map(row => row.slice()));
    undoBtn.disabled = false;
    if (undoStack.length > 100) undoStack.shift();
  }

  function undo() {
    if (!undoStack.length) return;
    matrix = undoStack.pop();
    renderGrid();
    moves = Math.max(0, moves-1);
    movesEl.textContent = moves;
    if (!undoStack.length) undoBtn.disabled = true;
  }

  function rotateRow(rowIndex, dir) {
    // dir: +1 = right, -1 = left
    pushUndo();
    startTimer();
    const r = rowIndex;
    const newRow = matrix[r].slice();
    for (let c=0;c<size;c++){
      newRow[(c+dir+size)%size] = matrix[r][c];
    }
    matrix[r] = newRow;
    moves++;
    movesEl.textContent = moves;
    renderGrid();
    checkSolved();
  }

  function rotateCol(colIndex, dir) {
    // dir: +1 = down, -1 = up
    pushUndo();
    startTimer();
    const c = colIndex;
    const newCol = Array(size);
    for (let r=0;r<size;r++){
      newCol[(r+dir+size)%size] = matrix[r][c];
    }
    for (let r=0;r<size;r++){
      matrix[r][c] = newCol[r];
    }
    moves++;
    movesEl.textContent = moves;
    renderGrid();
    checkSolved();
  }

  function isSolved() {
    // solved when matrix equals solvedMatrix exactly
    for (let r=0;r<size;r++){
      for (let c=0;c<size;c++){
        if (matrix[r][c] !== solvedMatrix[r][c]) return false;
      }
    }
    return true;
  }

  function checkSolved() {
    if (isSolved()) {
      // stop timer
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
      const time = startTime ? formatTime(Date.now() - startTime) : '00:00';
      modalText.innerHTML = `Moves: <strong>${moves}</strong><br/>Time: <strong>${time}</strong>`;
      modal.classList.remove('hidden');
    }
  }

  function shuffle(times=30) {
    // random rotations to scramble while preserving solvability
    pushUndo();
    startTimer();
    for (let i=0;i<times;i++){
      const rowOrCol = Math.random() < 0.5 ? 'row' : 'col';
      const idx = Math.floor(Math.random()*size);
      const dir = Math.random() < 0.5 ? 1 : -1;
      if (rowOrCol === 'row') rotateRowNoUndo(idx, dir);
      else rotateColNoUndo(idx, dir);
    }
    moves = 0;
    movesEl.textContent = moves;
    // after shuffle we clear undo (so undo doesn't revert to solved)
    undoStack = [];
    undoBtn.disabled = true;
    renderGrid();
  }

  // variants that don't push to undo or increment move (used by shuffle)
  function rotateRowNoUndo(rowIndex, dir) {
    const r = rowIndex;
    const newRow = matrix[r].slice();
    for (let c=0;c<size;c++){
      newRow[(c+dir+size)%size] = matrix[r][c];
    }
    matrix[r] = newRow;
  }
  function rotateColNoUndo(colIndex, dir) {
    const c = colIndex;
    const newCol = Array(size);
    for (let r=0;r<size;r++){
      newCol[(r+dir+size)%size] = matrix[r][c];
    }
    for (let r=0;r<size;r++){
      matrix[r][c] = newCol[r];
    }
  }

  // Attach handlers
  newGameBtn.addEventListener('click', () => {
    init();
  });
  sizeSelect.addEventListener('change', () => init());

  leftBtn.addEventListener('click', () => {
    const idx = parseInt(indexInput.value,10)-1;
    if (isNaN(idx) || idx < 0 || idx >= size) return alert('Index out of range');
    // if Row selected -> rotate left, else rotate top-to-bottom? We'll treat left/right as row rotates
    rotateRow(idx, -1);
  });
  rightBtn.addEventListener('click', () => {
    const idx = parseInt(indexInput.value,10)-1;
    if (isNaN(idx) || idx < 0 || idx >= size) return alert('Index out of range');
    rotateRow(idx, +1);
  });
  upBtn.addEventListener('click', () => {
    const idx = parseInt(indexInput.value,10)-1;
    if (isNaN(idx) || idx < 0 || idx >= size) return alert('Index out of range');
    rotateCol(idx, -1);
  });
  downBtn.addEventListener('click', () => {
    const idx = parseInt(indexInput.value,10)-1;
    if (isNaN(idx) || idx < 0 || idx >= size) return alert('Index out of range');
    rotateCol(idx, +1);
  });

  shuffleBtn.addEventListener('click', () => shuffle(size * 20));
  undoBtn.addEventListener('click', undo);

  modalClose.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  modalNew.addEventListener('click', () => {
    modal.classList.add('hidden');
    init();
  });

  solveDemo.addEventListener('click', async () => {
    // very simple demo: perform few random reverse moves to "demo" rotations
    // This is not an actual solver; it's just a visual demo of rotations.
    const steps = 8;
    for (let i=0;i<steps;i++){
      await delay(180);
      const rowOrCol = Math.random() < 0.5 ? 'row' : 'col';
      const idx = Math.floor(Math.random()*size);
      const dir = Math.random() < 0.5 ? 1 : -1;
      if (rowOrCol === 'row') rotateRowNoUndo(idx, dir);
      else rotateColNoUndo(idx, dir);
      renderGrid();
    }
    // increment move counter a bit to indicate demo did something
    moves += Math.floor(steps/2);
    movesEl.textContent = moves;
    // enable undo
    undoStack = []; undoBtn.disabled = true;
  });

  function delay(ms){ return new Promise(res => setTimeout(res, ms)); }

  // keyboard shortcuts for quick play
  document.addEventListener('keydown', (e) => {
    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); }
  });

  // initialize
  init();
})();
