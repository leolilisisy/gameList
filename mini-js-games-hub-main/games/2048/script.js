'use strict';

const SIZE = 4;
const boardElem = document.getElementById('board');
const scoreElem = document.getElementById('score');
const messageElem = document.getElementById('message');
const newGameBtn = document.getElementById('new-game');
const i18n = window.SiteI18n;

let grid = [];
let score = 0;
let tiles = []; // active tile DOM elements
let messageKey = null;

function setScoreText() {
  scoreElem.textContent = score;
}

function init() {
  grid = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  score = 0;
  setScoreText();
  boardElem.innerHTML = '';
  tiles = [];
  messageKey = null;
  // render background cells
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      boardElem.appendChild(cell);
    }
  }
  hideMessage();
  addRandomTile();
  addRandomTile();
  renderTiles(true);
}

function addRandomTile() {
  const empty = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r][c] === 0) empty.push([r,c]);
  if (!empty.length) return false;
  const [r,c] = empty[Math.floor(Math.random()*empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

function renderTiles(initial=false) {
  // remove old tile elems
  tiles.forEach(t => t.el.remove());
  tiles = [];

  // board position and cell size
  const rect = boardElem.getBoundingClientRect();
  const cell = boardElem.querySelector('.cell');
  const cellRect = cell.getBoundingClientRect();
  const gap = 10; // matches CSS
  for (let r=0;r<SIZE;r++){
    for (let c=0;c<SIZE;c++){
      const val = grid[r][c];
      if (!val) continue;
      const tile = document.createElement('div');
      tile.className = `tile tile-${val}`;
      const inner = document.createElement('div');
      inner.className = 'tile-inner';
      inner.textContent = val;
      tile.appendChild(inner);
      // absolute position over cell
      tile.style.width = `${cellRect.width}px`;
      tile.style.height = `${cellRect.height}px`;
      tile.style.left = `${cellRect.left - rect.left + c*(cellRect.width+gap)}px`;
      tile.style.top = `${cellRect.top - rect.top + r*(cellRect.height+gap)}px`;
      tile.style.transform = 'scale(1)';
      boardElem.appendChild(tile);
      tiles.push({el: tile, r, c});
      if (initial) {
        tile.style.transform = 'scale(0)';
        requestAnimationFrame(()=> tile.style.transform = 'scale(1)');
      }
    }
  }
}

function move(dir) {
  // dir: 'up','down','left','right'
  let moved = false;
  let mergedGrid = Array.from({length: SIZE}, () => Array(SIZE).fill(false));

  const loops = {
    left: {rStart:0,rEnd:SIZE,rStep:1,cStart:1,cEnd:SIZE,cStep:1},
    right: {rStart:0,rEnd:SIZE,rStep:1,cStart:SIZE-2,cEnd:-1,cStep:-1},
    up: {rStart:1,rEnd:SIZE,rStep:1,cStart:0,cEnd:SIZE,cStep:1},
    down: {rStart:SIZE-2,rEnd:-1,rStep:-1,cStart:0,cEnd:SIZE,cStep:1}
  }[dir];

  for (let r = loops.rStart; r !== loops.rEnd; r += loops.rStep) {
    for (let c = loops.cStart; c !== loops.cEnd; c += loops.cStep) {
      if (grid[r][c] === 0) continue;
      let rr = r, cc = c;
      while (true) {
        const nr = rr + (dir==='up'?-1:dir==='down'?1:0);
        const nc = cc + (dir==='left'?-1:dir==='right'?1:0);
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
        if (grid[nr][nc] === 0) {
          grid[nr][nc] = grid[rr][cc];
          grid[rr][cc] = 0;
          rr = nr; cc = nc;
          moved = true;
        } else if (grid[nr][nc] === grid[rr][cc] && !mergedGrid[nr][nc]) {
          grid[nr][nc] *= 2;
          grid[rr][cc] = 0;
          mergedGrid[nr][nc] = true;
          score += grid[nr][nc];
          setScoreText();
          moved = true;
          break;
        } else break;
      }
    }
  }

  if (moved) {
    addRandomTile();
    renderTiles();
    if (checkWin()) showMessage('game2048.win');
    else if (!hasMoves()) showMessage('game2048.gameOver');
  }
  return moved;
}

function checkWin() {
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) if (grid[r][c]===2048) return true;
  return false;
}

function hasMoves() {
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) if (grid[r][c]===0) return true;
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE-1;c++) if (grid[r][c]===grid[r][c+1]) return true;
  for (let c=0;c<SIZE;c++) for (let r=0;r<SIZE-1;r++) if (grid[r][c]===grid[r+1][c]) return true;
  return false;
}

function showMessage(key){
  messageKey = key;
  messageElem.textContent = i18n.t(key);
  messageElem.classList.remove('hidden');
}
function hideMessage(){
  messageKey = null;
  messageElem.classList.add('hidden');
}

// input handling
window.addEventListener('keydown', e => {
  const map = {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};
  if (map[e.key]) {
    e.preventDefault();
    const moved = move(map[e.key]);
  }
});

// touch swipe
let touchStart = null;
boardElem.addEventListener('touchstart', e => {
  const t = e.touches[0]; touchStart = {x: t.clientX, y: t.clientY};
});
boardElem.addEventListener('touchend', e => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) move('right');
    else if (dx < -30) move('left');
  } else {
    if (dy > 30) move('down');
    else if (dy < -30) move('up');
  }
  touchStart = null;
});

newGameBtn.addEventListener('click', init);

window.addEventListener('resize', ()=> renderTiles());
window.addEventListener('site-language-change', () => {
  if (messageKey) {
    messageElem.textContent = i18n.t(messageKey);
  }
});

// start
init();
