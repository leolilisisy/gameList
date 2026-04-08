const gameArea = document.getElementById("game-area");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const hitSound = document.getElementById("hit-sound");
const successSound = document.getElementById("success-sound");

let score = 0;
let level = 1;
let obstacles = [];
let gameInterval;
let gamePaused = false;

function createObstacle() {
  const obs = document.createElement("div");
  obs.classList.add("obstacle");
  obs.style.left = Math.random() * (gameArea.offsetWidth - 50) + "px";
  obs.dataset.key = String.fromCharCode(65 + Math.floor(Math.random() * 6)); // A-F
  gameArea.appendChild(obs);
  obstacles.push(obs);
  obs.style.animationDuration = `${2 - level*0.1}s`; // faster as level increases
}

function moveObstacles() {
  obstacles.forEach((obs, index) => {
    let top = parseFloat(getComputedStyle(obs).top);
    top += 5;
    obs.style.top = top + "px";

    if (top >= gameArea.offsetHeight) {
      gameArea.removeChild(obs);
      obstacles.splice(index, 1);
    }
  });
}

function startGame() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    if (!gamePaused) {
      createObstacle();
      moveObstacles();
    }
  }, 1000 - level*50);
}

function pauseGame() {
  gamePaused = !gamePaused;
}

function restartGame() {
  obstacles.forEach(obs => obs.remove());
  obstacles = [];
  score = 0;
  level = 1;
  scoreEl.textContent = score;
  levelEl.textContent = level;
  startGame();
}

document.addEventListener("keydown", (e) => {
  obstacles.forEach((obs, index) => {
    if (e.key.toUpperCase() === obs.dataset.key) {
      hitSound.currentTime = 0;
      hitSound.play();
      score += 10;
      scoreEl.textContent = score;
      gameArea.removeChild(obs);
      obstacles.splice(index, 1);
      if (score % 50 === 0) {
        level += 1;
        levelEl.textContent = level;
        successSound.play();
      }
    }
  });
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", restartGame);
