const boardSize = 4;
let board = [];
const boardContainer = document.getElementById('game-board');
const statusText = document.getElementById('status');

function initBoard() {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  addRandomTile();
  addRandomTile();
  drawBoard();
}

function drawBoard() {
  boardContainer.innerHTML = '';
  board.flat().forEach(value => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    if (value !== 0) {
      tile.textContent = value;
      tile.dataset.value = value;
    }
    boardContainer.appendChild(tile);
  });
}

function addRandomTile() {
  const empty = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === 0) empty.push({ r, c });
    }
  }
  if (empty.length === 0) return;
  const { r, c } = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function move(direction) {
  let rotated = false;
  let moved = false;

  if (direction === 'up') board = rotateLeft(board);
  if (direction === 'down') board = rotateRight(board);
  if (direction === 'right') board = board.map(row => row.reverse());

  const newBoard = board.map(row => {
    const filtered = row.filter(v => v);
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        filtered[i + 1] = 0;
      }
    }
    const compacted = filtered.filter(v => v);
    while (compacted.length < boardSize) compacted.push(0);
    if (JSON.stringify(compacted) !== JSON.stringify(row)) moved = true;
    return compacted;
  });

  board = newBoard;

  if (direction === 'up') board = rotateRight(board);
  if (direction === 'down') board = rotateLeft(board);
  if (direction === 'right') board = board.map(row => row.reverse());

  if (moved) {
    addRandomTile();
    drawBoard();
    checkGameOver();
  }
}

function rotateLeft(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[row.length - 1 - i]));
}

function rotateRight(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

function checkGameOver() {
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === 0) return;
      if (c < boardSize - 1 && board[r][c] === board[r][c + 1]) return;
      if (r < boardSize - 1 && board[r][c] === board[r + 1][c]) return;
    }
  }
  statusText.textContent = 'Game Over 😭';
}

document.addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    move(e.key.replace('Arrow', '').toLowerCase());
  }
});

initBoard();
