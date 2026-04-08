const movingBar = document.querySelector(".moving-bar");
const targetZone = document.querySelector(".target-zone");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");

const hitSound = document.getElementById("hit-sound");
const missSound = document.getElementById("miss-sound");
const bgMusic = document.getElementById("bg-music");

let score = 0;
let level = 1;
let isRunning = false;
let animationId = null;
let speed = 3;
let direction = 1;
let position = 0;

function startGame() {
  if (!isRunning) {
    isRunning = true;
    bgMusic.volume = 0.3;
    bgMusic.play();
    animateBar();
    statusEl.textContent = "Running...";
  }
}

function animateBar() {
  const barAreaWidth = document.querySelector(".bar-area").offsetWidth;
  const barWidth = movingBar.offsetWidth;

  position += direction * speed;
  if (position <= 0 || position >= barAreaWidth - barWidth) {
    direction *= -1;
  }
  movingBar.style.left = position + "px";

  animationId = requestAnimationFrame(animateBar);
}

function stopBar() {
  if (!isRunning) return;

  cancelAnimationFrame(animationId);
  const targetRect = targetZone.getBoundingClientRect();
  const barRect = movingBar.getBoundingClientRect();
  const overlap = Math.min(targetRect.right, barRect.right) - Math.max(targetRect.left, barRect.left);

  if (overlap > 0) {
    hitSound.play();
    const accuracy = overlap / targetRect.width;
    const points = Math.round(accuracy * 100);
    score += points;
    statusEl.textContent = `🎯 Perfect! +${points}`;
    if (points > 90) {
      level++;
      speed += 0.5;
    }
  } else {
    missSound.play();
    statusEl.textContent = "❌ Missed!";
    score = Math.max(0, score - 50);
  }

  scoreEl.textContent = score;
  levelEl.textContent = level;
  isRunning = false;
}

function pauseGame() {
  if (isRunning) {
    cancelAnimationFrame(animationId);
    bgMusic.pause();
    isRunning = false;
    statusEl.textContent = "Paused";
  }
}

function resumeGame() {
  if (!isRunning) {
    bgMusic.play();
    isRunning = true;
    animateBar();
    statusEl.textContent = "Resumed";
  }
}

function restartGame() {
  cancelAnimationFrame(animationId);
  position = 0;
  score = 0;
  level = 1;
  speed = 3;
  movingBar.style.left = "0px";
  scoreEl.textContent = score;
  levelEl.textContent = level;
  statusEl.textContent = "Restarted!";
  bgMusic.currentTime = 0;
  bgMusic.play();
  isRunning = true;
  animateBar();
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
resumeBtn.addEventListener("click", resumeGame);
restartBtn.addEventListener("click", restartGame);
document.body.addEventListener("keydown", (e) => {
  if (e.code === "Space") stopBar();
});
document.body.addEventListener("click", stopBar);
