const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const jumpSound = document.getElementById("jumpSound");
const hitSound = document.getElementById("hitSound");
const bgMusic = document.getElementById("bgMusic");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreDisplay = document.getElementById("score");

let gravity = 0.6;
let player = { x: 100, y: 300, w: 40, h: 40, dy: 0, inverted: false };
let obstacles = [];
let speed = 5;
let score = 0;
let isRunning = false;
let isPaused = false;

const playerColor = "#00e6ff";

function drawPlayer() {
  ctx.fillStyle = playerColor;
  ctx.shadowBlur = 20;
  ctx.shadowColor = playerColor;
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.shadowBlur = 0;
}

function drawObstacles() {
  ctx.fillStyle = "#ff0066";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#ff0066";
  obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));
  ctx.shadowBlur = 0;
}

function createObstacle() {
  const size = Math.random() * 30 + 20;
  const y = Math.random() > 0.5 ? 0 : canvas.height - size;
  obstacles.push({ x: canvas.width, y: y, w: size, h: size });
}

function updateObstacles() {
  obstacles.forEach(o => (o.x -= speed));
  obstacles = obstacles.filter(o => o.x + o.w > 0);
  if (Math.random() < 0.02) createObstacle();
}

function detectCollision() {
  return obstacles.some(
    o =>
      player.x < o.x + o.w &&
      player.x + player.w > o.x &&
      player.y < o.y + o.h &&
      player.y + player.h > o.y
  );
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw floor/ceiling glow lines
  ctx.strokeStyle = "#00e6ff";
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#00e6ff";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(canvas.width, 0);
  ctx.moveTo(0, canvas.height);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.stroke();
  ctx.shadowBlur = 0;

  drawPlayer();
  drawObstacles();
}

function update() {
  if (!isRunning || isPaused) return;

  player.dy += player.inverted ? gravity : -gravity;
  player.y -= player.dy;

  // Flip limit
  if (player.y < 0) {
    player.y = 0;
    player.dy = 0;
  } else if (player.y + player.h > canvas.height) {
    player.y = canvas.height - player.h;
    player.dy = 0;
  }

  updateObstacles();

  if (detectCollision()) {
    hitSound.play();
    bgMusic.pause();
    isRunning = false;
    ctx.font = "40px Poppins";
    ctx.fillStyle = "#ff0066";
    ctx.fillText("Game Over!", canvas.width / 2 - 100, canvas.height / 2);
    return;
  }

  score++;
  speed += 0.001;
  scoreDisplay.textContent = score;

  draw();
  requestAnimationFrame(update);
}

document.addEventListener("keydown", e => {
  if (e.code === "Space" && isRunning && !isPaused) {
    player.inverted = !player.inverted;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
});

startBtn.addEventListener("click", () => {
  if (!isRunning) {
    bgMusic.currentTime = 0;
    bgMusic.play();
    isRunning = true;
    update();
  }
});

pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  if (isPaused) {
    bgMusic.pause();
    pauseBtn.textContent = "▶ Resume";
  } else {
    bgMusic.play();
    pauseBtn.textContent = "⏸ Pause";
    update();
  }
});

restartBtn.addEventListener("click", () => {
  obstacles = [];
  player = { x: 100, y: 300, w: 40, h: 40, dy: 0, inverted: false };
  speed = 5;
  score = 0;
  scoreDisplay.textContent = 0;
  isRunning = true;
  isPaused = false;
  bgMusic.currentTime = 0;
  bgMusic.play();
  update();
});
