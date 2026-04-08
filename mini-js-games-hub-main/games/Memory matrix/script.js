let level = 1;
let score = 0;
let pattern = [];
let playerMoves = [];
let canClick = false;

const gridEl = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const retryBtn = document.getElementById("retryBtn");
const statusEl = document.getElementById("status");
const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");

startBtn.addEventListener("click", startGame);
nextBtn.addEventListener("click", nextLevel);
retryBtn.addEventListener("click", retryLevel);

function startGame() {
  level = 1;
  score = 0;
  levelEl.textContent = level;
  scoreEl.textContent = score;
  nextBtn.disabled = true;
  retryBtn.disabled = true;
  createGrid(level + 2);
  startPattern();
}

function nextLevel() {
  level++;
  levelEl.textContent = level;
  nextBtn.disabled = true;
  retryBtn.disabled = true;
  createGrid(level + 2);
  startPattern();
}

function retryLevel() {
  nextBtn.disabled = true;
  retryBtn.disabled = true;
  createGrid(level + 2);
  startPattern();
}

function createGrid(size) {
  gridEl.innerHTML = "";
  gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    gridEl.appendChild(cell);
  }
}

function startPattern() {
  const cells = [...gridEl.children];
  const gridSize = Math.sqrt(cells.length);
  const patternCount = Math.min(gridSize + 1, cells.length);
  pattern = [];

  // Choose random unique pattern
  while (pattern.length < patternCount) {
    const r = Math.floor(Math.random() * cells.length);
    if (!pattern.includes(r)) pattern.push(r);
  }

  statusEl.textContent = "Memorize the glowing tiles!";
  showPattern(cells);
}

function showPattern(cells) {
  let i = 0;
  canClick = false;
  playerMoves = [];

  const interval = setInterval(() => {
    if (i > 0) cells[pattern[i - 1]].classList.remove("active");
    if (i < pattern.length) {
      cells[pattern[i]].classList.add("active");
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        cells.forEach((c) => c.classList.remove("active"));
        statusEl.textContent = "Now reproduce the pattern!";
        canClick = true;
      }, 400);
    }
  }, 600);
}

function handleClick(e) {
  if (!canClick) return;
  const index = Number(e.target.dataset.index);
  const cell = e.target;

  playerMoves.push(index);
  const currentIndex = playerMoves.length - 1;

  if (index === pattern[currentIndex]) {
    cell.classList.add("correct");
    setTimeout(() => cell.classList.remove("correct"), 300);
    if (playerMoves.length === pattern.length) {
      score += level * 10;
      scoreEl.textContent = score;
      statusEl.textContent = "✅ Correct! Get ready for the next level!";
      canClick = false;
      nextBtn.disabled = false;
      retryBtn.disabled = true;
    }
  } else {
    cell.classList.add("wrong");
    statusEl.textContent = "❌ Wrong tile! Try again.";
    canClick = false;
    retryBtn.disabled = false;
  }
}
