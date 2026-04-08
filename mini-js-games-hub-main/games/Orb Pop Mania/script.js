const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

const bubbles = [];
const colors = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"];
let shooter = { x: 240, y: 600, radius: 10, color: "#ff69b4", angle: 0 };
let firedBubble = null;
let score = 0;

function createBubble(x, y) {
  return {
    x,
    y,
    radius: 15,
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

function initGrid() {
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 8; col++) {
      bubbles.push(createBubble(30 + col * 55, 30 + row * 55));
    }
  }
}

function drawBubbles() {
  for (let b of bubbles) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();
  }
}

function drawShooter() {
  ctx.beginPath();
  ctx.arc(shooter.x, shooter.y, shooter.radius, 0, Math.PI * 2);
  ctx.fillStyle = shooter.color;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(shooter.x, shooter.y);
  ctx.lineTo(
    shooter.x + Math.cos(shooter.angle) * 30,
    shooter.y + Math.sin(shooter.angle) * 30
  );
  ctx.strokeStyle = "#fff";
  ctx.stroke();
}

function shootBubble() {
  if (!firedBubble) {
    firedBubble = {
      x: shooter.x,
      y: shooter.y,
      radius: 15,
      color: shooter.color,
      dx: Math.cos(shooter.angle) * 6,
      dy: Math.sin(shooter.angle) * 6,
    };
  }
}

function drawFiredBubble() {
  if (firedBubble) {
    firedBubble.x += firedBubble.dx;
    firedBubble.y += firedBubble.dy;

    if (firedBubble.x < 15 || firedBubble.x > canvas.width - 15)
      firedBubble.dx *= -1;

    for (let b of bubbles) {
      const dist = Math.hypot(firedBubble.x - b.x, firedBubble.y - b.y);
      if (dist < b.radius + firedBubble.radius) {
        const idx = bubbles.indexOf(b);
        bubbles.splice(idx, 1);
        score += 10;
        scoreDisplay.textContent = score;
        firedBubble = null;
        shooter.color = colors[Math.floor(Math.random() * colors.length)];
        return;
      }
    }

    if (firedBubble.y < 20) firedBubble = null;

    ctx.beginPath();
    ctx.arc(firedBubble.x, firedBubble.y, firedBubble.radius, 0, Math.PI * 2);
    ctx.fillStyle = firedBubble.color;
    ctx.fill();
  }
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const dx = e.clientX - rect.left - shooter.x;
  const dy = e.clientY - rect.top - shooter.y;
  shooter.angle = Math.atan2(dy, dx);
});

canvas.addEventListener("click", shootBubble);

restartBtn.addEventListener("click", () => {
  bubbles.length = 0;
  firedBubble = null;
  score = 0;
  scoreDisplay.textContent = score;
  initGrid();
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBubbles();
  drawShooter();
  drawFiredBubble();
  requestAnimationFrame(animate);
}

initGrid();
animate();
