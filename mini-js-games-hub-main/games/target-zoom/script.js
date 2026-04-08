const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');

const hitSound = document.getElementById('hit-sound');
const missSound = document.getElementById('miss-sound');
const gameOverSound = document.getElementById('gameover-sound');

let score = 0;
let lives = 3;
let gameRunning = false;
let paused = false;
let shrinkInterval;
let target;
let size = 100;
let spawnDelay = 1500;

function startGame() {
  resetGame();
  gameRunning = true;
  paused = false;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  restartBtn.disabled = false;
  spawnTarget();
}

function pauseGame() {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  if (paused) {
    clearInterval(shrinkInterval);
    if (target) target.remove();
  } else {
    spawnTarget();
  }
}

function restartGame() {
  clearInterval(shrinkInterval);
  resetGame();
  spawnTarget();
}

function resetGame() {
  score = 0;
  lives = 3;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  clearInterval(shrinkInterval);
  gameArea.innerHTML = '';
}

function spawnTarget() {
  if (!gameRunning || paused) return;

  target = document.createElement('div');
  target.classList.add('target');
  size = 100;

  const x = Math.random() * (gameArea.clientWidth - size);
  const y = Math.random() * (gameArea.clientHeight - size);
  target.style.width = size + 'px';
  target.style.height = size + 'px';
  target.style.left = x + 'px';
  target.style.top = y + 'px';
  gameArea.appendChild(target);

  target.addEventListener('click', hitTarget);

  shrinkInterval = setInterval(() => {
    if (paused || !gameRunning) return;
    size -= 3;
    target.style.width = size + 'px';
    target.style.height = size + 'px';
    if (size <= 0) {
      missTarget();
    }
  }, 60);
}

function hitTarget() {
  score++;
  scoreEl.textContent = score;
  hitSound.currentTime = 0;
  hitSound.play();
  clearInterval(shrinkInterval);
  target.remove();
  spawnDelay = Math.max(500, spawnDelay - 50);
  setTimeout(spawnTarget, 400);
}

function missTarget() {
  clearInterval(shrinkInterval);
  target.remove();
  lives--;
  livesEl.textContent = lives;
  missSound.currentTime = 0;
  missSound.play();

  if (lives <= 0) {
    endGame();
  } else {
    setTimeout(spawnTarget, 700);
  }
}

function endGame() {
  gameRunning = false;
  pauseBtn.disabled = true;
  startBtn.disabled = false;
  gameOverSound.play();
  alert(`💥 Game Over! Final Score: ${score}`);
}

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);
