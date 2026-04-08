const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

let board = Array.from({length: ROWS}, () => Array(COLS).fill(0));

let score = 0;
let level = 1;
let dropInterval = 800;
let dropCounter = 0;
let lastTime = 0;

const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF'
];

// Tetromino shapes
const SHAPES = [
  [],
  [[1,1,1],[0,1,0]],               // T
  [[2,2],[2,2]],                   // O
  [[0,3,3],[3,3,0]],               // S
  [[4,4,0],[0,4,4]],               // Z
  [[5,0,0],[5,5,5]],               // L
  [[0,0,6],[6,6,6]],               // J
  [[7,7,7,7]]                      // I
];

let currentPiece;

function randomPiece() {
  const typeId = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
  const shape = SHAPES[typeId];
  return {
    shape,
    x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2),
    y: 0,
    color: colors[typeId]
  };
}

function collide(board, piece) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x] !== 0 &&
         (board[y + piece.y] && board[y + piece.y][x + piece.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(board, piece) {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        board[y + piece.y][x + piece.x] = value;
      }
    });
  });
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

function playerRotate() {
  const rotated = rotate(currentPiece.shape);
  const oldX = currentPiece.x;
  let offset = 1;
  currentPiece.shape = rotated;
  while (collide(board, currentPiece)) {
    currentPiece.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > currentPiece.shape[0].length) {
      currentPiece.shape = rotate(rotate(rotate(currentPiece.shape)));
      currentPiece.x = oldX;
      return;
    }
  }
}

function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = '#000';
  ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw board
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) drawBlock(x, y, colors[value]);
    });
  });

  // Draw current piece
  currentPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) drawBlock(x + currentPiece.x, y + currentPiece.y, currentPiece.color);
    });
  });
}

function mergeAndReset() {
  merge(board, currentPiece);
  clearLines();
  currentPiece = randomPiece();
  if (collide(board, currentPiece)) {
    board.forEach(row => row.fill(0));
    score = 0;
    level = 1;
    dropInterval = 800;
    alert('Game Over! Restarting...');
  }
}

function clearLines() {
  let rowCount = 0;
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x] === 0) continue outer;
    }
    const row = board.splice(y, 1)[0].fill(0);
    board.unshift(row);
    rowCount++;
    y++;
  }
  if (rowCount > 0) {
    score += rowCount * 10;
    document.getElementById('score').textContent = score;
    if (score % 50 === 0) {
      level++;
      dropInterval *= 0.9; // speed up
      document.getElementById('level').textContent = level;
    }
  }
}

function playerDrop() {
  currentPiece.y++;
  if (collide(board, currentPiece)) {
    currentPiece.y--;
    mergeAndReset();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  currentPiece.x += dir;
  if (collide(board, currentPiece)) currentPiece.x -= dir;
}

document.getElementById('rotate').addEventListener('click', () => playerRotate());
document.getElementById('left').addEventListener('click', () => playerMove(-1));
document.getElementById('right').addEventListener('click', () => playerMove(1));
document.getElementById('down').addEventListener('click', () => playerDrop());
document.getElementById('restart').addEventListener('click', () => {
  board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  score = 0;
  level = 1;
  dropInterval = 800;
  currentPiece = randomPiece();
  document.getElementById('score').textContent = score;
  document.getElementById('level').textContent = level;
});

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') playerMove(-1);
  if (event.key === 'ArrowRight') playerMove(1);
  if (event.key === 'ArrowDown') playerDrop();
  if (event.key === 'ArrowUp') playerRotate();
});

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) playerDrop();
  draw();
  requestAnimationFrame(update);
}

currentPiece = randomPiece();
update();
