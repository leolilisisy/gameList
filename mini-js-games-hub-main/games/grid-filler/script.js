const gridEl = document.querySelector(".grid");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");

const moveSound = document.getElementById("move-sound");
const winSound = document.getElementById("win-sound");
const loseSound = document.getElementById("lose-sound");

const ROWS = 8;
const COLS = 8;
let tiles = [];
let filled = new Set();
let obstacles = new Set();
let currentPos = 0;
let isRunning = false;

// Generate grid
function createGrid() {
  gridEl.innerHTML = "";
  tiles = [];
  filled.clear();
  obstacles.clear();
  for (let i = 0; i < ROWS * COLS; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    // Add some random obstacles
    if (Math.random() < 0.1 && i !== 0) {
      tile.classList.add("obstacle");
      obstacles.add(i);
    }
    gridEl.appendChild(tile);
    tiles.push(tile);
  }
  currentPos = 0;
  tiles[currentPos].classList.add("filled");
  filled.add(currentPos);
  statusEl.textContent = "Game Started! Use Arrow Keys or WASD to move.";
}

// Move marker
function moveMarker(deltaRow, deltaCol) {
  if (!isRunning) return;
  const row = Math.floor(currentPos / COLS);
  const col = currentPos % COLS;
  let newRow = row + deltaRow;
  let newCol = col + deltaCol;
  if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) return;

  const newPos = newRow * COLS + newCol;
  if (filled.has(newPos) || obstacles.has(newPos)) {
    statusEl.textContent = "💀 You lost! Revisited tile or hit obstacle.";
    isRunning = false;
    loseSound.play();
    return;
  }

  currentPos = newPos;
  tiles[currentPos].classList.add("filled");
  filled.add(currentPos);
  moveSound.play();

  if (filled.size === ROWS * COLS - obstacles.size) {
    statusEl.textContent = "🎉 You won! Grid completely filled!";
    isRunning = false;
    winSound.play();
  }
}

// Key controls
document.addEventListener("keydown", (e) => {
  switch(e.key) {
    case "ArrowUp": moveMarker(-1,0); break;
    case "ArrowDown": moveMarker(1,0); break;
    case "ArrowLeft": moveMarker(0,-1); break;
    case "ArrowRight": moveMarker(0,1); break;
    case "w": moveMarker(-1,0); break;
    case "s": moveMarker(1,0); break;
    case "a": moveMarker(0,-1); break;
    case "d": moveMarker(0,1); break;
  }
});

// Buttons
startBtn.addEventListener("click", () => { isRunning = true; createGrid(); });
pauseBtn.addEventListener("click", () => { isRunning = false; statusEl.textContent = "Game Paused"; });
resumeBtn.addEventListener("click", () => { isRunning = true; statusEl.textContent = "Game Resumed"; });
restartBtn.addEventListener("click", () => { isRunning = true; createGrid(); });
