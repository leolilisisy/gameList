const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let level = 1;
let gameInterval;
let paused = false;

const colors = ["#00FFFF", "#FF00FF", "#FFFF00", "#00FF00", "#FF4500"];
const pieces = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]]  // Z
];

let currentPiece = randomPiece();
let position = { x: 3, y: 0 };

const moveSound = document.getElementById("moveSound");
const rotateSound = document.getElementById("rotateSound");
const clearSound = document.getElementById("clearSound");
const bgMusic = document.getElementById("bgMusic");

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", togglePause);
document.getElementById("restartBtn").addEventListener("click", restartGame);
document.addEventListener("keydown", handleKeyPress);

function randomPiece() {
  const shape = pieces[Math.floor(Math.random() * pieces.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return { shape, color };
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  board.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        ctx.fillStyle = val;
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        ctx.shadowColor = val;
        ctx.shadowBlur = 10;
      }
    });
  });
  drawPiece();
}

function drawPiece() {
  currentPiece.shape.forEach((row, dy) => {
    row.forEach((val, dx) => {
      if (val) {
        ctx.fillStyle = currentPiece.color;
        ctx.fillRect((position.x + dx) * BLOCK_SIZE, (position.y + dy) * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
      }
    });
  });
}

function drop() {
  if (paused) return;
  position.y++;
  if (collision()) {
    position.y--;
    merge();
    clearRows();
    resetPiece();
  }
  drawBoard();
}

function collision() {
  return currentPiece.shape.some((row, dy) =>
    row.some((val, dx) => {
      if (!val) return false;
      const newX = position.x + dx;
      const newY = position.y + dy;
      return newX < 0 || newX >= COLS || newY >= ROWS || board[newY]?.[newX];
    })
  );
}

function merge() {
  currentPiece.shape.forEach((row, dy) => {
    row.forEach((val, dx) => {
      if (val) board[position.y + dy][position.x + dx] = currentPiece.color;
    });
  });
}

function clearRows() {
  let cleared = 0;
  board = board.filter(row => !row.every(cell => cell));
  while (board.length < ROWS) board.unshift(Array(COLS).fill(0));
  if (cleared > 0) {
    clearSound.play();
    score += cleared * 100;
    if (score % 500 === 0) level++;
    updateUI();
  }
}

function updateUI() {
  document.getElementById("score").textContent = score;
  document.getElementById("level").textContent = level;
}

function resetPiece() {
  currentPiece = randomPiece();
  position = { x: 3, y: 0 };
  if (collision()) {
    alert("Game Over 😭");
    restartGame();
  }
}

function handleKeyPress(e) {
  if (paused) return;
  switch (e.key) {
    case "ArrowLeft":
      position.x--;
      if (collision()) position.x++;
      moveSound.play();
      break;
    case "ArrowRight":
      position.x++;
      if (collision()) position.x--;
      moveSound.play();
      break;
    case "ArrowDown":
      drop();
      break;
    case "ArrowUp":
      rotate();
      rotateSound.play();
      break;
  }
  drawBoard();
}

function rotate() {
  const rotated = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(r => r[i])).reverse();
  const prev = currentPiece.shape;
  currentPiece.shape = rotated;
  if (collision()) currentPiece.shape = prev;
}

function startGame() {
  if (!gameInterval) {
    bgMusic.volume = 0.2;
    bgMusic.play();
    gameInterval = setInterval(drop, 700 - level * 50);
  }
}

function togglePause() {
  paused = !paused;
  document.getElementById("pauseBtn").textContent = paused ? "▶ Resume" : "⏸ Pause";
  if (paused) bgMusic.pause(); else bgMusic.play();
}

function restartGame() {
  clearInterval(gameInterval);
  gameInterval = null;
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  score = 0;
  level = 1;
  paused = false;
  bgMusic.pause();
  bgMusic.currentTime = 0;
  updateUI();
  drawBoard();
}
