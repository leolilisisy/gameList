const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;

let pegs = [];
let balls = [];
let score = 0;

const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');

class Peg {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
  }
}

class Ball {
  constructor(x, y, radius, color, speedY) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.speedX = 0;
    this.speedY = speedY;
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX;

    // collision with pegs
    for (let peg of pegs) {
      const dx = this.x - peg.x;
      const dy = this.y - peg.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.radius + peg.radius) {
        this.speedY = -this.speedY * 0.8;
        this.speedX = (Math.random() - 0.5) * 6;
        score += 10;
        scoreEl.textContent = score;
        peg.color = "#fff"; // flash peg
        setTimeout(() => (peg.color = randomColor()), 200);
      }
    }

    // bounce from walls
    if (this.x < this.radius || this.x > canvas.width - this.radius)
      this.speedX = -this.speedX;

    // floor
    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.speedY = 0;
      this.speedX = 0;
    }

    // gravity
    this.speedY += 0.2;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
  }
}

function randomColor() {
  const colors = ["#ff4081", "#00e5ff", "#76ff03", "#ffea00", "#ff9100"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function setupPegs() {
  pegs = [];
  const rows = 8;
  const cols = 10;
  const spacingX = 40;
  const spacingY = 50;
  const offsetX = 40;
  const offsetY = 100;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = offsetX + col * spacingX + (row % 2 === 0 ? 0 : spacingX / 2);
      const y = offsetY + row * spacingY;
      pegs.push(new Peg(x, y, 6, randomColor()));
    }
  }
}

function drawPegs() {
  pegs.forEach((peg) => peg.draw());
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  balls.push(new Ball(x, 20, 8, randomColor(), 4));
});

restartBtn.addEventListener("click", () => {
  score = 0;
  scoreEl.textContent = 0;
  balls = [];
  setupPegs();
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPegs();
  balls.forEach((ball) => {
    ball.update();
    ball.draw();
  });
  requestAnimationFrame(animate);
}

// Initialize
setupPegs();
animate();
