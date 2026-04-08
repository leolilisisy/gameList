// Color Harmony Game
const gridSize = 4;
const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
let grid = [];
let target = [];
let selectedTile = null;
let moves = 0;
let level = 1;
let maxMoves = null;
let blockers = new Set();

const gridElement = document.getElementById('grid');
const targetElement = document.getElementById('targetPalette');
const levelElement = document.getElementById('level');
const movesElement = document.getElementById('moves');
const statusElement = document.getElementById('status');
const shuffleBtn = document.getElementById('shuffleBtn');
const resetBtn = document.getElementById('resetBtn');
const nextBtn = document.getElementById('nextBtn');

function initGame() {
  createTarget();
  createGrid();
  shuffleGrid();
  updateUI();
  selectedTile = null;
  moves = 0;
  updateMoves();
  statusElement.textContent = '';
  nextBtn.style.display = 'none';
}

function createTarget() {
  target = [];
  for (let i = 0; i < gridSize; i++) {
    target.push(colors[Math.floor(Math.random() * colors.length)]);
  }
  renderTarget();
}

function renderTarget() {
  targetElement.innerHTML = '';
  target.forEach(color => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.style.backgroundColor = color;
    targetElement.appendChild(tile);
  });
}

function createGrid() {
  grid = [];
  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = target[j]; // start with target arrangement
    }
  }
  // Add some random tiles
  for (let i = 0; i < gridSize * gridSize / 2; i++) {
    const r1 = Math.floor(Math.random() * gridSize);
    const c1 = Math.floor(Math.random() * gridSize);
    const r2 = Math.floor(Math.random() * gridSize);
    const c2 = Math.floor(Math.random() * gridSize);
    [grid[r1][c1], grid[r2][c2]] = [grid[r2][c2], grid[r1][c1]];
  }
  renderGrid();
}

function renderGrid() {
  gridElement.innerHTML = '';
  gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.style.backgroundColor = grid[i][j];
      tile.dataset.row = i;
      tile.dataset.col = j;
      if (blockers.has(`${i}-${j}`)) {
        tile.classList.add('blocker');
      } else {
        tile.addEventListener('click', () => handleTileClick(i, j));
      }
      gridElement.appendChild(tile);
    }
  }
}

function handleTileClick(row, col) {
  if (selectedTile) {
    if (selectedTile.row === row && selectedTile.col === col) {
      // Deselect
      document.querySelector(`[data-row="${row}"][data-col="${col}"]`).classList.remove('selected');
      selectedTile = null;
    } else if (isAdjacent(selectedTile.row, selectedTile.col, row, col)) {
      // Swap
      swapTiles(selectedTile.row, selectedTile.col, row, col);
      moves++;
      updateMoves();
      document.querySelector(`[data-row="${selectedTile.row}"][data-col="${selectedTile.col}"]`).classList.remove('selected');
      selectedTile = null;
      checkWin();
    } else {
      // Select new
      document.querySelector(`[data-row="${selectedTile.row}"][data-col="${selectedTile.col}"]`).classList.remove('selected');
      document.querySelector(`[data-row="${row}"][data-col="${col}"]`).classList.add('selected');
      selectedTile = {row, col};
    }
  } else {
    // Select
    document.querySelector(`[data-row="${row}"][data-col="${col}"]`).classList.add('selected');
    selectedTile = {row, col};
  }
}

function isAdjacent(r1, c1, r2, c2) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

function swapTiles(r1, c1, r2, c2) {
  [grid[r1][c1], grid[r2][c2]] = [grid[r2][c2], grid[r1][c1]];
  renderGrid();
}

function shuffleGrid() {
  for (let i = 0; i < 100; i++) {
    const r1 = Math.floor(Math.random() * gridSize);
    const c1 = Math.floor(Math.random() * gridSize);
    const r2 = Math.floor(Math.random() * gridSize);
    const c2 = Math.floor(Math.random() * gridSize);
    if (isAdjacent(r1, c1, r2, c2) && !blockers.has(`${r1}-${c1}`) && !blockers.has(`${r2}-${c2}`)) {
      swapTiles(r1, c1, r2, c2);
    }
  }
  moves = 0;
  updateMoves();
}

function checkWin() {
  for (let j = 0; j < gridSize; j++) {
    if (grid[0][j] !== target[j]) return;
  }
  // Win
  statusElement.textContent = 'Level Complete!';
  nextBtn.style.display = 'inline-block';
  // Animate matched tiles
  document.querySelectorAll('.tile').forEach(tile => {
    const row = parseInt(tile.dataset.row);
    if (row === 0) tile.classList.add('matched');
  });
}

function updateUI() {
  levelElement.textContent = `Level: ${level}`;
  if (maxMoves) {
    movesElement.textContent = `Moves: ${moves}/${maxMoves}`;
  } else {
    movesElement.textContent = `Moves: ${moves}`;
  }
}

function updateMoves() {
  updateUI();
  if (maxMoves && moves >= maxMoves) {
    statusElement.textContent = 'Out of moves! Try again.';
    resetBtn.style.display = 'inline-block';
  }
}

function nextLevel() {
  level++;
  blockers.clear();
  if (level > 5) {
    // Add blockers
    const numBlockers = Math.min(level - 5, 4);
    for (let i = 0; i < numBlockers; i++) {
      let r, c;
      do {
        r = Math.floor(Math.random() * gridSize);
        c = Math.floor(Math.random() * gridSize);
      } while (blockers.has(`${r}-${c}`));
      blockers.add(`${r}-${c}`);
    }
  }
  if (level > 10) {
    maxMoves = 50 - (level - 10) * 5;
  } else {
    maxMoves = null;
  }
  initGame();
}

shuffleBtn.addEventListener('click', shuffleGrid);
resetBtn.addEventListener('click', initGame);
nextBtn.addEventListener('click', nextLevel);

initGame();
