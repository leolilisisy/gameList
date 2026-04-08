const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const timerDisplay = document.getElementById("timer");
const message = document.getElementById("message");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");

const zombieSound = document.getElementById("zombie-hit");
const humanSound = document.getElementById("human-hit");
const bgMusic = document.getElementById("bg-music");

let score = 0;
let lives = 3;
let timeLeft = 60;
let gameInterval;
let spawnInterval;
let paused = false;

function randomPosition(max) {
  return Math.floor(Math.random() * (max - 70));
}

function spawnCharacter() {
  if (paused) return;
  const char = document.createElement("div");
  const isZombie = Math.random() < 0.7;
  char.classList.add("character", isZombie ? "zombie" : "human");

  char.style.top = `${randomPosition(gameArea.offsetHeight)}px`;
  char.style.left = `${randomPosition(gameArea.offsetWidth)}px`;

  gameArea.appendChild(char);

  char.addEventListener("click", () => {
    if (isZombie) {
      score += 10;
      zombieSound.play();
    } else {
      lives -= 1;
      humanSound.play();
    }
    updateHUD();
    char.remove();
  });

  setTimeout(() => char.remove(), 1500);
}

function updateHUD() {
  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;
  if (lives <= 0) endGame("💀 Game Over!");
}

function gameTimer() {
  if (paused) return;
  timeLeft--;
  timerDisplay.textContent = timeLeft;
  if (timeLeft <= 0) endGame("⏰ Time’s Up!");
}

function startGame() {
  if (gameInterval) return;
  bgMusic.volume = 0.3;
  bgMusic.play();
  message.textContent = "";
  paused = false;
  gameInterval = setInterval(gameTimer, 1000);
  spawnInterval = setInterval(spawnCharacter, 800);
}

function pauseGame() {
  paused = !paused;
  if (paused) {
    message.textContent = "⏸️ Paused";
    bgMusic.pause();
  } else {
    message.textContent = "";
    bgMusic.play();
  }
}

function restartGame() {
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  score = 0;
  lives = 3;
  timeLeft = 60;
  paused = false;
  gameArea.innerHTML = "";
  updateHUD();
  message.textContent = "";
  gameInterval = null;
  startGame();
}

function endGame(text) {
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  bgMusic.pause();
  message.textContent = text;
  const characters = document.querySelectorAll(".character");
  characters.forEach(c => c.remove());
  gameInterval = null;
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", restartGame);
