const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameRunning = false;
let paused = false;
let bullets = [];
let enemies = [];
let tank;
let score = 0;

const shootSound = document.getElementById("shootSound");
const explosionSound = document.getElementById("explosionSound");
const bgMusic = document.getElementById("bgMusic");

class Tank {
  constructor() {
    this.x = canvas.width / 2 - 25;
    this.y = canvas.height - 60;
    this.width = 50;
    this.height = 30;
    this.speed = 5;
  }
  draw() {
    ctx.fillStyle = "lime";
    ctx.shadowColor = "lime";
    ctx.shadowBlur = 20;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.speedX = 4 * (Math.random() < 0.5 ? -1 : 1);
    this.speedY = -6;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Bounce on walls
    if (this.x <= 0 || this.x >= canvas.width) {
      this.speedX *= -1;
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "cyan";
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 30;
    this.alive = true;
  }
  draw() {
    if (this.alive) {
      ctx.fillStyle = "red";
      ctx.shadowColor = "red";
      ctx.shadowBlur = 15;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.shadowBlur = 0;
    }
  }
}

function createEnemies() {
  enemies = [];
  for (let i = 0; i < 6; i++) {
    let x = 80 + i * 120;
    let y = 60;
    enemies.push(new Enemy(x, y));
  }
}

function drawScore() {
  ctx.fillStyle = "#0ff";
  ctx.font = "20px Poppins";
  ctx.fillText(`Score: ${score}`, 10, 25);
}

function detectCollisions() {
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (
        e.alive &&
        b.x > e.x &&
        b.x < e.x + e.width &&
        b.y > e.y &&
        b.y < e.y + e.height
      ) {
        e.alive = false;
        bullets.splice(bi, 1);
        score += 10;
        explosionSound.play();
      }
    });
  });
}

function gameLoop() {
  if (!gameRunning || paused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  tank.draw();
  bullets.forEach((b) => {
    b.update();
    b.draw();
  });
  enemies.forEach((e) => e.draw());
  detectCollisions();
  drawScore();

  if (enemies.every((e) => !e.alive)) {
    ctx.fillStyle = "yellow";
    ctx.font = "30px Poppins";
    ctx.fillText("🎉 You Won!", canvas.width / 2 - 80, canvas.height / 2);
    bgMusic.pause();
    return;
  }

  requestAnimationFrame(gameLoop);
}

function startGame() {
  if (!gameRunning) {
    tank = new Tank();
    bullets = [];
    createEnemies();
    score = 0;
    bgMusic.play();
    gameRunning = true;
    paused = false;
    gameLoop();
  }
}

function pauseGame() {
  paused = !paused;
  if (!paused) gameLoop();
}

function restartGame() {
  bgMusic.pause();
  bgMusic.currentTime = 0;
  gameRunning = false;
  startGame();
}

document.addEventListener("keydown", (e) => {
  if (!tank) return;
  if (e.key === "ArrowLeft" || e.key === "a") tank.x -= tank.speed;
  if (e.key === "ArrowRight" || e.key === "d") tank.x += tank.speed;
  if (e.key === " " && gameRunning && !paused) {
    bullets.push(new Bullet(tank.x + tank.width / 2, tank.y));
    shootSound.play();
  }
});

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", pauseGame);
document.getElementById("restartBtn").addEventListener("click", restartGame);
