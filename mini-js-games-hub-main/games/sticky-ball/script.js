const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

// Load sounds
const jumpSound = document.getElementById("jumpSound");
const hitSound = document.getElementById("hitSound");
const bgMusic = document.getElementById("bgMusic");

// Game variables
let gravity = 0.6;
let isPaused = false;
let gameRunning = false;
let keys = { left: false, right: false, up: false };

const ball = {
  x: 100,
  y: 350,
  radius: 20,
  dx: 0,
  dy: 0,
  sticky: false,
  color: "rgba(0,255,255,0.9)"
};

const obstacles = [
  { x: 300, y: 400, width: 100, height: 20 },
  { x: 500, y: 350, width: 100, height: 20 },
  { x: 700, y: 300, width: 80, height: 20 },
  { x: 400, y: 250, width: 80, height: 20 },
  { x: 650, y: 200, width: 100, height: 20 },
];

function drawBall() {
  const glow = ctx.createRadialGradient(ball.x, ball.y, 5, ball.x, ball.y, 25);
  glow.addColorStop(0, "cyan");
  glow.addColorStop(1, "rgba(0,255,255,0)");
  ctx.beginPath();
  ctx.fillStyle = glow;
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function drawObstacles() {
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#0ff";
  obstacles.forEach(o => {
    ctx.fillStyle = "#00ffff44";
    ctx.fillRect(o.x, o.y, o.width, o.height);
    ctx.strokeStyle = "#0ff";
    ctx.strokeRect(o.x, o.y, o.width, o.height);
  });
}

function update() {
  if (!gameRunning || isPaused) return;

  ball.dy += gravity;
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ground
  if (ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius;
    ball.dy = 0;
  }

  // Wall stick logic
  if (ball.sticky) {
    ball.dy *= 0.9;
  }

  // Collisions
  obstacles.forEach(o => {
    if (
      ball.x + ball.radius > o.x &&
      ball.x - ball.radius < o.x + o.width &&
      ball.y + ball.radius > o.y &&
      ball.y - ball.radius < o.y + o.height
    ) {
      ball.dy = -10;
      hitSound.play();
    }
  });

  // Movement
  if (keys.left) ball.dx = -4;
  else if (keys.right) ball.dx = 4;
  else ball.dx = 0;

  // Ceiling bounce
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.dy = 2;
  }

  draw();
  requestAnimationFrame(update);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawObstacles();
  drawBall();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") keys.left = true;
  if (e.key === "ArrowRight" || e.key === "d") keys.right = true;
  if ((e.key === "ArrowUp" || e.key === "w") && ball.dy === 0) {
    ball.dy = -12;
    jumpSound.play();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
  if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
});

document.getElementById("startBtn").onclick = () => {
  if (!gameRunning) {
    bgMusic.play();
    gameRunning = true;
    update();
  }
};

document.getElementById("pauseBtn").onclick = () => {
  isPaused = !isPaused;
  document.getElementById("pauseBtn").textContent = isPaused ? "▶️ Resume" : "⏸️ Pause";
  if (!isPaused) update();
};

document.getElementById("restartBtn").onclick = () => {
  ball.x = 100;
  ball.y = 350;
  ball.dy = 0;
  gameRunning = true;
  isPaused = false;
  bgMusic.currentTime = 0;
  bgMusic.play();
  update();
};

document.getElementById("muteBtn").onclick = () => {
  bgMusic.muted = !bgMusic.muted;
  hitSound.muted = bgMusic.muted;
  jumpSound.muted = bgMusic.muted;
  document.getElementById("muteBtn").textContent = bgMusic.muted ? "🔊 Unmute" : "🔇 Mute";
};
