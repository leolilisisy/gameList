const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

const connectSound = document.getElementById("connectSound");
const completeSound = document.getElementById("completeSound");

let stars = [];
let connections = [];
let currentLine = null;
let isPaused = false;
let mode = "free";
let hintVisible = false;

const NUM_STARS = 20;

// Generate random stars
function generateStars() {
  stars = [];
  for (let i = 0; i < NUM_STARS; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 3 + Math.random() * 2,
      glow: false,
    });
  }
}

generateStars();

// Draw all stars and connections
function draw() {
  if (isPaused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#00000033";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Glow stars
  stars.forEach((star) => {
    const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 20);
    gradient.addColorStop(0, star.glow ? "white" : "#7FDBFF");
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(star.x, star.y, 20, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw connections
  ctx.strokeStyle = "#00fff2";
  ctx.lineWidth = 2;
  connections.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  });

  // Current line while dragging
  if (currentLine) {
    ctx.beginPath();
    ctx.moveTo(currentLine.x1, currentLine.y1);
    ctx.lineTo(currentLine.x2, currentLine.y2);
    ctx.strokeStyle = "#ffcc00";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  requestAnimationFrame(draw);
}
draw();

// Handle interaction
let startStar = null;

canvas.addEventListener("mousedown", (e) => {
  if (isPaused) return;
  const star = getStar(e.clientX, e.clientY);
  if (star) {
    startStar = star;
    startStar.glow = true;
    connectSound.play();
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (startStar) {
    currentLine = { x1: startStar.x, y1: startStar.y, x2: e.clientX, y2: e.clientY };
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (!startStar) return;
  const endStar = getStar(e.clientX, e.clientY);
  if (endStar && endStar !== startStar) {
    connections.push([startStar, endStar]);
    completeSound.play();
  }
  startStar = null;
  currentLine = null;
});

function getStar(x, y) {
  return stars.find((s) => Math.hypot(s.x - x, s.y - y) < 20);
}

// Buttons
document.getElementById("pauseBtn").addEventListener("click", () => {
  isPaused = !isPaused;
  document.getElementById("status").textContent = isPaused ? "⏸️ Game Paused" : "✨ Keep Connecting!";
});

document.getElementById("restartBtn").addEventListener("click", () => {
  connections = [];
  generateStars();
  document.getElementById("status").textContent = "🔁 Restarted!";
});

document.getElementById("clearBtn").addEventListener("click", () => {
  connections = [];
  document.getElementById("status").textContent = "🧹 Cleared connections!";
});

document.getElementById("hintBtn").addEventListener("click", () => {
  if (mode !== "puzzle") return;
  hintVisible = !hintVisible;
  document.getElementById("status").textContent = hintVisible ? "💡 Hint visible!" : "💡 Hint hidden!";
});

document.getElementById("modeSelect").addEventListener("change", (e) => {
  mode = e.target.value;
  document.getElementById("status").textContent = `Mode: ${mode}`;
});

document.getElementById("playBtn").addEventListener("click", () => {
  isPaused = false;
  document.getElementById("status").textContent = "🎮 Playing!";
});
