const canvas = document.getElementById("sandCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

let particles = [];
let isPaused = false;
let isRunning = false;

const sandSound = document.getElementById("sandSound");
const resetSound = document.getElementById("resetSound");

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = 2;
    this.vy = 0;
  }

  update() {
    if (this.y + this.size < canvas.height) {
      this.vy += 0.2;
      this.y += this.vy;

      // Check collision
      const below = particles.find(p => Math.abs(p.x - this.x) < this.size && Math.abs(p.y - (this.y + this.size)) < this.size);
      if (below) {
        this.y -= this.vy;
        this.vy = 0;
        // slide slightly
        this.x += (Math.random() - 0.5) * 2;
      }
    } else {
      this.vy = 0;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

function addSand(x, y) {
  for (let i = 0; i < 5; i++) {
    const color = `hsl(${40 + Math.random() * 30}, 100%, 60%)`;
    particles.push(new Particle(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10, color));
  }
}

canvas.addEventListener("mousedown", (e) => {
  if (!isRunning) return;
  sandSound.play();
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  addSand(x, y);
  const interval = setInterval(() => {
    if (!isPaused) addSand(x, y);
  }, 50);

  const stop = () => {
    clearInterval(interval);
    canvas.removeEventListener("mouseup", stop);
  };
  canvas.addEventListener("mouseup", stop);
});

function animate() {
  if (!isPaused) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
  }
  requestAnimationFrame(animate);
}

document.getElementById("startBtn").addEventListener("click", () => {
  isRunning = true;
  isPaused = false;
  sandSound.play();
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  isPaused = !isPaused;
});

document.getElementById("resetBtn").addEventListener("click", () => {
  particles = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  resetSound.play();
});

animate();
