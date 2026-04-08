const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth * 0.8;
canvas.height = 500;

const connectSound = document.getElementById("connect-sound");
const winSound = document.getElementById("win-sound");
const bgMusic = document.getElementById("bg-music");

let cubes = [];
let lines = [];
let isRunning = false;
let paused = false;

class Cube {
  constructor(x, y, radius, color, id) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.id = id;
    this.active = false;
  }

  draw() {
    ctx.beginPath();
    ctx.shadowBlur = this.active ? 30 : 10;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.active ? this.color : "rgba(0,255,255,0.3)";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

function createCubes() {
  cubes = [];
  const positions = [
    [150, 250],
    [350, 150],
    [550, 250],
    [350, 350]
  ];
  for (let i = 0; i < positions.length; i++) {
    cubes.push(new Cube(positions[i][0], positions[i][1], 25, "#00ffff", i));
  }
}

function drawLines() {
  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#00ffff";
  lines.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  });
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawLines();
  cubes.forEach(c => c.draw());
}

canvas.addEventListener("click", (e) => {
  if (!isRunning || paused) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  let clicked = null;

  cubes.forEach(cube => {
    const dx = cube.x - mouseX;
    const dy = cube.y - mouseY;
    if (Math.sqrt(dx * dx + dy * dy) < cube.radius + 5) clicked = cube;
  });

  if (clicked) {
    connectSound.currentTime = 0;
    connectSound.play();
    clicked.active = true;
    if (lines.length > 0) {
      const last = lines[lines.length - 1][1];
      if (last !== clicked) lines.push([last, clicked]);
    } else {
      lines.push([clicked, clicked]);
    }

    if (lines.length === cubes.length - 1) {
      winSound.play();
      isRunning = false;
      alert("🎉 You aligned all cubes! Great job!");
    }
  }
});

document.getElementById("start-btn").addEventListener("click", () => {
  createCubes();
  lines = [];
  isRunning = true;
  paused = false;
  bgMusic.play();
  renderLoop();
});

document.getElementById("pause-btn").addEventListener("click", () => {
  paused = !paused;
  if (paused) bgMusic.pause();
  else bgMusic.play();
});

document.getElementById("restart-btn").addEventListener("click", () => {
  createCubes();
  lines = [];
  cubes.forEach(c => c.active = false);
  bgMusic.currentTime = 0;
  bgMusic.play();
  render();
});

function renderLoop() {
  if (!isRunning) return;
  render();
  if (!paused) requestAnimationFrame(renderLoop);
}
