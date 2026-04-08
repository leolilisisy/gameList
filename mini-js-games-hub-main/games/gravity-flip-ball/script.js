const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreEl = document.getElementById("score");

const jumpSound = document.getElementById("jumpSound");
const gameOverSound = document.getElementById("gameOverSound");

let ball = { x: 100, y: 200, radius: 15, vy: 0 };
let gravity = 0.5;
let obstacles = [];
let gameInterval;
let score = 0;
let isPaused = false;

function generateObstacle() {
  const gap = 100;
  const width = 20;
  const heightTop = Math.random() * 150 + 50;
  const heightBottom = canvas.height - heightTop - gap;
  obstacles.push({
    x: canvas.width,
    yTop: 0,
    hTop: heightTop,
    yBottom: canvas.height - heightBottom,
    hBottom: heightBottom,
    width,
  });
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#0ff";
  ctx.shadowColor = "#0ff";
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.closePath();
}

function drawObstacles() {
  obstacles.forEach(obs => {
    ctx.fillStyle = "#ff007f";
    ctx.shadowColor = "#ff007f";
    ctx.shadowBlur = 20;
    ctx.fillRect(obs.x, obs.yTop, obs.width, obs.hTop);
    ctx.fillRect(obs.x, obs.yBottom, obs.width, obs.hBottom);
  });
}

function updateObstacles() {
  obstacles.forEach(obs => obs.x -= 3);
  obstacles = obstacles.filter(obs => obs.x + obs.width > 0);
  if (obstacles.length === 0 || obstacles[obstacles.length-1].x < 300) {
    generateObstacle();
  }
}

function checkCollision() {
  for (let obs of obstacles) {
    if (ball.x + ball.radius > obs.x && ball.x - ball.radius < obs.x + obs.width) {
      if (ball.y - ball.radius < obs.hTop || ball.y + ball.radius > obs.yBottom) {
        gameOver();
      }
    }
  }
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    gameOver();
  }
}

function gameLoop() {
  if (isPaused) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ball.vy += gravity;
  ball.y += ball.vy;

  drawBall();
  drawObstacles();
  updateObstacles();
  checkCollision();

  score += 0.01;
  scoreEl.textContent = Math.floor(score);

  requestAnimationFrame(gameLoop);
}

function startGame() {
  ball = { x: 100, y: 200, radius: 15, vy: 0 };
  obstacles = [];
  score = 0;
  isPaused = false;
  generateObstacle();
  gameLoop();
}

function pauseGame() {
  isPaused = true;
}

function resumeGame() {
  if (isPaused) {
    isPaused = false;
    gameLoop();
  }
}

function restartGame() {
  isPaused = false;
  startGame();
}

function flipGravity() {
  ball.vy = -ball.vy - 5;
  jumpSound.play();
}

function gameOver() {
  gameOverSound.play();
  alert("Game Over! Score: " + Math.floor(score));
  restartGame();
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
resumeBtn.addEventListener("click", resumeGame);
restartBtn.addEventListener("click", restartGame);

document.addEventListener("keydown", flipGravity);
canvas.addEventListener("click", flipGravity);
