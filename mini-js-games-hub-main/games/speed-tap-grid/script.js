const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");

const tapSound = document.getElementById("tap-sound");
const wrongSound = document.getElementById("wrong-sound");
const winSound = document.getElementById("win-sound");

let score = 0;
let lives = 3;
let interval;
let isPaused = false;
let activeIndex = -1;
const gridSize = 5; // 5x5 line
const cells = [];

function createGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < gridSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("grid-cell");
    cell.addEventListener("click", () => handleClick(i));
    grid.appendChild(cell);
    cells.push(cell);
  }
}

function randomActiveCell() {
  if (activeIndex >= 0) cells[activeIndex].classList.remove("active");
  activeIndex = Math.floor(Math.random() * gridSize);
  cells[activeIndex].classList.add("active");

  // Random obstacle
  const obstacleIndex = Math.floor(Math.random() * gridSize);
  if (obstacleIndex !== activeIndex) {
    cells[obstacleIndex].classList.add("obstacle");
  }
}

function handleClick(index) {
  if (isPaused) return;
  if (index === activeIndex) {
    score++;
    tapSound.play();
    scoreEl.textContent = score;
    nextTurn();
  } else if (cells[index].classList.contains("obstacle")) {
    lives--;
    wrongSound.play();
    livesEl.textContent = lives;
    if (lives <= 0) endGame();
  } else {
    lives--;
    wrongSound.play();
    livesEl.textContent = lives;
    if (lives <= 0) endGame();
  }
}

function nextTurn() {
  cells.forEach(c => c.classList.remove("active", "obstacle"));
  randomActiveCell();
}

function startGame() {
  score = 0;
  lives = 3;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  messageEl.textContent = "";
  createGrid();
  nextTurn();
  interval = setInterval(() => {
    if (!isPaused) nextTurn();
  }, 1500);
}

function pauseGame() {
  isPaused = true;
}

function resumeGame() {
  isPaused = false;
}

function restartGame() {
  clearInterval(interval);
  cells.forEach(c => c.classList.remove("active", "obstacle"));
  startGame();
}

function endGame() {
  clearInterval(interval);
  messageEl.textContent = `Game Over! Your score: ${score}`;
  winSound.play();
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
resumeBtn.addEventListener("click", resumeGame);
restartBtn.addEventListener("click", restartGame);
