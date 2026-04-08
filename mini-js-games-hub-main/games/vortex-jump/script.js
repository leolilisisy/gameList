const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 600;

const jumpSound = document.getElementById("jumpSound");
const hitSound = document.getElementById("hitSound");
const levelUpSound = document.getElementById("levelUpSound");

let gameInterval;
let obstacles = [];
let bulbs = [];
let score = 0;
let gravity = 0.6;
let player = { x: 200, y: 500, radius: 15, dy: 0, color: "#0ff" };
let gameRunning = false;

// Controls
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", pauseGame);
document.getElementById("resumeBtn").addEventListener("click", resumeGame);
document.getElementById("restartBtn").addEventListener("click", restartGame);
canvas.addEventListener("click", jump);

function jump() {
  if (!gameRunning) return;
  player.dy = -10;
  jumpSound.play();
}

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  obstacles = [];
  bulbs = [];
  score = 0;
  player.y = 500;
  player.dy = 0;
  gameInterval = requestAnimationFrame(gameLoop);
}

function pauseGame() {
  gameRunning = false;
  cancelAnimationFrame(gameInterval);
}

function resumeGame() {
  if (!gameRunning) {
    gameRunning = true;
    gameInterval = requestAnimationFrame(gameLoop);
  }
}

function restartGame() {
  pauseGame();
  startGame();
}

function spawnObstacle() {
  const x = Math.random() * 350 + 25;
  const size = Math.random() * 80 + 30;
  obstacles.push({ x, y: -size, width: size, height: 20, color: "#ff0" });
}

function spawnBulb() {
  const x = Math.random() * 350 + 25;
  const y = -20;
  bulbs.push({ x, y, radius: 8, color: "#0f0" });
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.shadowColor = "#0ff";
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.closePath();
}

function drawObstacles() {
  obstacles.forEach((o) => {
    ctx.beginPath();
    ctx.fillStyle = o.color;
    ctx.shadowColor = "#ff0";
    ctx.shadowBlur = 15;
    ctx.fillRect(o.x, o.y, o.width, o.height);
    ctx.closePath();
  });
}

function drawBulbs() {
  bulbs.forEach((b) => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.shadowColor = "#0f0";
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.closePath();
  });
}

function checkCollision() {
  // Obstacles
  for (let o of obstacles) {
    if (
      player.x + player.radius > o.x &&
      player.x - player.radius < o.x + o.width &&
      player.y + player.radius > o.y &&
      player.y - player.radius < o.y + o.height
    ) {
      hitSound.play();
      pauseGame();
      alert("Game Over! Score: " + score);
      return true;
    }
  }
  // Bulbs
  bulbs.forEach((b, index) => {
    let dist = Math.hypot(player.x - b.x, player.y - b.y);
    if (dist < player.radius + b.radius) {
      bulbs.splice(index, 1);
      score += 1;
      levelUpSound.play();
    }
  });
  return false;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.dy += gravity;
  player.y += player.dy;

  // Spawn obstacles and bulbs
  if (Math.random() < 0.02) spawnObstacle();
  if (Math.random() < 0.03) spawnBulb();

  obstacles.forEach((o) => o.y += 2 + score * 0.05);
  bulbs.forEach((b) => b.y += 2 + score * 0.05);

  drawPlayer();
  drawObstacles();
  drawBulbs();

  if (checkCollision()) return;

  document.getElementById("score").textContent = score;
  gameInterval = requestAnimationFrame(gameLoop);
}
