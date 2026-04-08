const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameRunning = false;
let paused = false;

const ball = {
  x: 100,
  y: 250,
  radius: 10,
  color: "cyan",
  vx: 0,
  vy: 0,
  mass: 1
};

const magnets = [
  { x: 200, y: 100, type: "N" },
  { x: 600, y: 400, type: "S" }
];

const obstacles = [
  { x: 300, y: 200, w: 200, h: 20 },
  { x: 400, y: 350, w: 150, h: 20 }
];

const goal = { x: 720, y: 240, w: 40, h: 40 };

const bgMusic = document.getElementById("bgMusic");
const goalSound = document.getElementById("goalSound");
const hitSound = document.getElementById("hitSound");

let northActive = false;
let southActive = false;

// Controls
document.getElementById("startBtn").onclick = () => {
  gameRunning = true;
  paused = false;
  bgMusic.play();
  loop();
};

document.getElementById("pauseBtn").onclick = () => {
  paused = !paused;
};

document.getElementById("restartBtn").onclick = () => {
  resetGame();
};

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "n") northActive = true;
  if (e.key.toLowerCase() === "s") southActive = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key.toLowerCase() === "n") northActive = false;
  if (e.key.toLowerCase() === "s") southActive = false;
});

function resetGame() {
  ball.x = 100;
  ball.y = 250;
  ball.vx = 0;
  ball.vy = 0;
  gameRunning = false;
  paused = false;
  bgMusic.pause();
  bgMusic.currentTime = 0;
}

function applyMagneticForce() {
  magnets.forEach(mag => {
    const dx = mag.x - ball.x;
    const dy = mag.y - ball.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 250) {
      const force = (mag.type === "N" && northActive) || (mag.type === "S" && southActive)
        ? 1000 / (dist * dist)
        : 0;
      ball.vx += (dx / dist) * force * 0.1;
      ball.vy += (dy / dist) * force * 0.1;
    }
  });
}

function detectCollisions() {
  for (let obs of obstacles) {
    if (
      ball.x > obs.x &&
      ball.x < obs.x + obs.w &&
      ball.y > obs.y &&
      ball.y < obs.y + obs.h
    ) {
      hitSound.play();
      resetGame();
    }
  }

  if (
    ball.x > goal.x &&
    ball.x < goal.x + goal.w &&
    ball.y > goal.y &&
    ball.y < goal.y + goal.h
  ) {
    goalSound.play();
    alert("🎯 You reached the goal!");
    resetGame();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw magnets
  magnets.forEach(m => {
    ctx.beginPath();
    const color = m.type === "N" ? "red" : "blue";
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.arc(m.x, m.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Draw obstacles
  ctx.fillStyle = "#444";
  obstacles.forEach(o => {
    ctx.fillRect(o.x, o.y, o.w, o.h);
  });

  // Draw goal
  ctx.shadowBlur = 15;
  ctx.shadowColor = "lime";
  ctx.fillStyle = "lime";
  ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
  ctx.shadowBlur = 0;

  // Draw ball
  ctx.beginPath();
  ctx.shadowBlur = 20;
  ctx.shadowColor = "cyan";
  ctx.fillStyle = ball.color;
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function update() {
  applyMagneticForce();

  ball.x += ball.vx;
  ball.y += ball.vy;

  // Add drag
  ball.vx *= 0.97;
  ball.vy *= 0.97;

  // Wall bounce
  if (ball.x < 0 || ball.x > canvas.width) ball.vx *= -0.8;
  if (ball.y < 0 || ball.y > canvas.height) ball.vy *= -0.8;

  detectCollisions();
}

function loop() {
  if (!gameRunning) return;
  if (!paused) {
    update();
    draw();
  }
  requestAnimationFrame(loop);
}
