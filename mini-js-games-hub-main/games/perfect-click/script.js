const line = document.querySelector(".line");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const speedEl = document.getElementById("speed");

const clickSound = document.getElementById("click-sound");
const perfectSound = document.getElementById("perfect-sound");
const failSound = document.getElementById("fail-sound");

let animationFrame;
let running = false;
let paused = false;
let direction = 1;
let linePos = 0;
let speed = 3;
let score = 0;
let combo = 0;

const target = document.querySelector(".target-zone");

function animateLine() {
  if (!running || paused) return;

  linePos += speed * direction;
  if (linePos >= 100 || linePos <= 0) direction *= -1;
  line.style.left = `${linePos}%`;

  animationFrame = requestAnimationFrame(animateLine);
}

function isPerfectHit() {
  const lineRect = line.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  return lineRect.left >= targetRect.left && lineRect.right <= targetRect.right;
}

document.body.addEventListener("click", () => {
  if (!running || paused) return;
  clickSound.play();
  if (isPerfectHit()) {
    perfectSound.play();
    score += 10;
    combo++;
    if (combo % 5 === 0) speed += 0.5;
    speedEl.textContent = `${speed.toFixed(1)}x`;
    target.style.boxShadow = "0 0 25px #0f0, 0 0 50px #0f0";
    setTimeout(() => target.style.boxShadow = "0 0 15px #0f0", 300);
  } else {
    failSound.play();
    combo = 0;
    speed = Math.max(3, speed - 0.5);
    target.style.boxShadow = "0 0 25px #f00, 0 0 50px #f00";
    setTimeout(() => target.style.boxShadow = "0 0 15px #0f0", 300);
  }
  scoreEl.textContent = score;
  comboEl.textContent = combo;
});

startBtn.addEventListener("click", () => {
  if (!running) {
    running = true;
    paused = false;
    animateLine();
  }
});

pauseBtn.addEventListener("click", () => {
  paused = !paused;
  if (!paused) animateLine();
});

restartBtn.addEventListener("click", () => {
  cancelAnimationFrame(animationFrame);
  running = false;
  paused = false;
  score = 0;
  combo = 0;
  speed = 3;
  direction = 1;
  linePos = 0;
  scoreEl.textContent = score;
  comboEl.textContent = combo;
  speedEl.textContent = `${speed}x`;
  line.style.left = "0%";
});
