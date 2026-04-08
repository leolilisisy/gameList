const gameArea = document.getElementById("game-area");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");

const clickSound = document.getElementById("click-sound");
const missSound = document.getElementById("miss-sound");
const bgMusic = document.getElementById("bg-music");

let score = 0;
let lives = 3;
let level = 1;
let gameInterval = null;
let spawnRate = 1200;
let isPaused = false;

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("pause-btn").addEventListener("click", togglePause);
document.getElementById("restart-btn").addEventListener("click", restartGame);

function startGame() {
  if (gameInterval) return;
  bgMusic.play();
  gameInterval = setInterval(spawnGhost, spawnRate);
}

function togglePause() {
  if (!gameInterval) return;
  isPaused = !isPaused;
  if (isPaused) {
    clearInterval(gameInterval);
    bgMusic.pause();
  } else {
    bgMusic.play();
    gameInterval = setInterval(spawnGhost, spawnRate);
  }
}

function restartGame() {
  clearInterval(gameInterval);
  bgMusic.currentTime = 0;
  bgMusic.pause();
  score = 0;
  lives = 3;
  level = 1;
  spawnRate = 1200;
  updateStats();
  gameArea.innerHTML = "";
  gameInterval = null;
  isPaused = false;
}

function spawnGhost() {
  const ghost = document.createElement("div");
  const isReal = Math.random() > 0.4;
  ghost.className = "ghost" + (isReal ? "" : " fake");

  const x = Math.random() * (gameArea.clientWidth - 80);
  const y = Math.random() * (gameArea.clientHeight - 80);
  ghost.style.left = `${x}px`;
  ghost.style.top = `${y}px`;

  gameArea.appendChild(ghost);

  ghost.addEventListener("click", () => {
    if (isReal) {
      clickSound.currentTime = 0;
      clickSound.play();
      score += 10;
    } else {
      missSound.currentTime = 0;
      missSound.play();
      score -= 5;
      lives--;
    }
    ghost.remove();
    updateStats();
  });

  setTimeout(() => {
    if (gameArea.contains(ghost)) {
      gameArea.removeChild(ghost);
      if (isReal) {
        lives--;
        updateStats();
      }
    }
  }, 800 - level * 50);

  if (score >= level * 100) nextLevel();
  if (lives <= 0) endGame();
}

function nextLevel() {
  level++;
  spawnRate = Math.max(400, spawnRate - 100);
  clearInterval(gameInterval);
  gameInterval = setInterval(spawnGhost, spawnRate);
}

function updateStats() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  levelEl.textContent = level;
}

function endGame() {
  clearInterval(gameInterval);
  bgMusic.pause();
  alert(`💀 Game Over!\nYour Score: ${score}`);
  restartGame();
}
