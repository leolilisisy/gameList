const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const successSound = document.getElementById("success-sound");
const failSound = document.getElementById("fail-sound");
const drawSound = document.getElementById("draw-sound");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");

let isDrawing = false;
let isPaused = false;
let pathPoints = [];
let symbols = [];
let obstacles = [];
let currentLevel = 1;
let targetSequence = [];
let sequenceIndex = 0;

const LEVELS = {
  1: { symbols: 4, obstacles: 2 },
  2: { symbols: 6, obstacles: 3 },
  3: { symbols: 8, obstacles: 4 },
};

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function initLevel(level) {
  const { symbols: symCount, obstacles: obsCount } = LEVELS[level];
  symbols = [];
  obstacles = [];
  pathPoints = [];
  sequenceIndex = 0;

  for (let i = 0; i < symCount; i++) {
    symbols.push({
      x: random(50, 550),
      y: random(50, 550),
      label: i + 1,
    });
  }

  for (let i = 0; i < obsCount; i++) {
    obstacles.push({
      x: random(100, 500),
      y: random(100, 500),
      size: random(40, 60),
    });
  }

  targetSequence = symbols.map(s => s.label);
  drawGame();
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Obstacles
  ctx.fillStyle = "rgba(255,0,0,0.5)";
  obstacles.forEach(o => {
    ctx.beginPath();
    ctx.rect(o.x, o.y, o.size, o.size);
    ctx.fill();
  });

  // Symbols
  symbols.forEach((s, index) => {
    const glow = index === sequenceIndex ? 20 : 10;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 20, 0, Math.PI * 2);
    ctx.shadowBlur = glow;
    ctx.shadowColor = "#00eaff";
    ctx.fillStyle = "#00eaff";
    ctx.fill();
    ctx.font = "bold 16px Poppins";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.label, s.x, s.y);
  });

  // Path
  ctx.beginPath();
  ctx.strokeStyle = "#00ff99";
  ctx.lineWidth = 5;
  for (let i = 0; i < pathPoints.length - 1; i++) {
    ctx.moveTo(pathPoints[i].x, pathPoints[i].y);
    ctx.lineTo(pathPoints[i + 1].x, pathPoints[i + 1].y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function checkCollision(x, y) {
  return obstacles.some(o =>
    x > o.x && x < o.x + o.size && y > o.y && y < o.y + o.size
  );
}

canvas.addEventListener("mousedown", (e) => {
  if (isPaused) return;
  isDrawing = true;
  pathPoints = [{ x: e.offsetX, y: e.offsetY }];
  drawSound.play();
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing && !isPaused) {
    const x = e.offsetX;
    const y = e.offsetY;
    if (checkCollision(x, y)) {
      failSound.play();
      alert("❌ You hit an obstacle! Try again.");
      initLevel(currentLevel);
      return;
    }
    pathPoints.push({ x, y });
    drawGame();
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  validatePath();
});

function validatePath() {
  const lastPoint = pathPoints[pathPoints.length - 1];
  const target = symbols[sequenceIndex];
  if (!target) return;

  const distance = Math.hypot(target.x - lastPoint.x, target.y - lastPoint.y);
  if (distance < 30) {
    sequenceIndex++;
    if (sequenceIndex === symbols.length) {
      successSound.play();
      alert(`🎉 Level ${currentLevel} Complete!`);
      currentLevel++;
      if (currentLevel > Object.keys(LEVELS).length) {
        alert("🏆 You completed all levels!");
        currentLevel = 1;
      }
      initLevel(currentLevel);
    } else {
      successSound.play();
      drawGame();
    }
  } else {
    failSound.play();
    alert("⚠️ Wrong path, try again!");
    initLevel(currentLevel);
  }
}

startBtn.addEventListener("click", () => {
  isPaused = false;
  initLevel(currentLevel);
});

pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "▶️ Resume" : "⏸️ Pause";
});

restartBtn.addEventListener("click", () => {
  initLevel(currentLevel);
});
