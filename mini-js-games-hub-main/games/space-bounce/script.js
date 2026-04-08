const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

const bgMusic = document.getElementById("bgMusic");
const bounceSound = document.getElementById("bounceSound");
const powerSound = document.getElementById("powerSound");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreEl = document.getElementById("score");
const highscoreEl = document.getElementById("highscore");

let gameRunning = false;
let paused = false;
let score = 0;
let highscore = localStorage.getItem("spaceBounceHigh") || 0;
highscoreEl.textContent = highscore;

const player = {
  x: 400,
  y: 250,
  radius: 20,
  vy: 0,
  gravity: 0.4,
  color: "#0ff",
};

let planets = [];
let powerUps = [];
let obstacles = [];

function resetGame() {
  player.y = 250;
  player.vy = 0;
  planets = [];
  powerUps = [];
  obstacles = [];
  score = 0;
  scoreEl.textContent = score;
}

function createPlanet() {
  planets.push({
    x: Math.random() * canvas.width,
    y: Math.random() * (canvas.height - 100) + 50,
    radius: Math.random() * 20 + 30,
    color: "rgba(0,255,255,0.8)",
  });
}

function createObstacle() {
  obstacles.push({
    x: canvas.width,
    y: Math.random() * canvas.height,
    width: 30,
    height: 30,
    color: "red",
    speed: 3,
  });
}

function createPowerUp() {
  powerUps.push({
    x: canvas.width,
    y: Math.random() * canvas.height,
    radius: 15,
    color: "gold",
    speed: 2.5,
  });
}

function drawPlanet(p) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.shadowColor = "#0ff";
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.closePath();
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

function drawObstacle(o) {
  ctx.fillStyle = o.color;
  ctx.fillRect(o.x, o.y, o.width, o.height);
}

function drawPowerUp(p) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.shadowColor = "gold";
  ctx.shadowBlur = 20;
  ctx.fill();
}

function update() {
  if (!gameRunning || paused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.vy += player.gravity;
  player.y += player.vy;

  // Keep player in bounds
  if (player.y + player.radius > canvas.height) {
    player.y = canvas.height - player.radius;
    player.vy = -player.vy * 0.8;
    bounceSound.play();
  }

  planets.forEach((planet) => {
    planet.x -= 2;
    if (planet.x + planet.radius < 0) planets.splice(planets.indexOf(planet), 1);
    drawPlanet(planet);
  });

  obstacles.forEach((o, i) => {
    o.x -= o.speed;
    if (o.x + o.width < 0) obstacles.splice(i, 1);
    drawObstacle(o);

    if (
      player.x + player.radius > o.x &&
      player.x - player.radius < o.x + o.width &&
      player.y + player.radius > o.y &&
      player.y - player.radius < o.y + o.height
    ) {
      gameRunning = false;
      bgMusic.pause();
      alert("💥 You hit an obstacle! Final Score: " + score);
    }
  });

  powerUps.forEach((p, i) => {
    p.x -= p.speed;
    if (p.x + p.radius < 0) powerUps.splice(i, 1);
    drawPowerUp(p);

    let dx = player.x - p.x;
    let dy = player.y - p.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < player.radius + p.radius) {
      powerSound.play();
      score += 10;
      scoreEl.textContent = score;
      powerUps.splice(i, 1);
    }
  });

  drawPlayer();

  if (Math.random() < 0.02) createPlanet();
  if (Math.random() < 0.01) createObstacle();
  if (Math.random() < 0.008) createPowerUp();

  score++;
  scoreEl.textContent = score;

  if (score > highscore) {
    highscore = score;
    localStorage.setItem("spaceBounceHigh", highscore);
    highscoreEl.textContent = highscore;
  }

  requestAnimationFrame(update);
}

function startGame() {
  if (!gameRunning) {
    gameRunning = true;
    paused = false;
    bgMusic.play();
    update();
  }
}

function pauseGame() {
  paused = !paused;
  if (paused) {
    bgMusic.pause();
  } else {
    bgMusic.play();
    update();
  }
}

function restartGame() {
  resetGame();
  gameRunning = true;
  paused = false;
  bgMusic.currentTime = 0;
  bgMusic.play();
  update();
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", restartGame);

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    player.vy = -8;
    bounceSound.play();
  }
});
canvas.addEventListener("click", () => {
  player.vy = -8;
  bounceSound.play();
});
