const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const moveSound = document.getElementById("moveSound");
const hitSound = document.getElementById("hitSound");
const winSound = document.getElementById("winSound");

const width = canvas.width;
const height = canvas.height;

const cellSize = 25;
const rows = Math.floor(height / cellSize);
const cols = Math.floor(width / cellSize);

let trail = [];
let obstacles = [];
let player = { x: 0, y: 0 };
let goal = { x: cols - 1, y: rows - 1 };
let interval;
let paused = false;

// Generate random obstacles
function generateObstacles(count = 50) {
  obstacles = [];
  while (obstacles.length < count) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    if ((x === 0 && y === 0) || (x === goal.x && y === goal.y)) continue;
    obstacles.push({ x, y });
  }
}

// Draw the grid, trail, player, obstacles
function draw() {
  ctx.clearRect(0, 0, width, height);

  // Draw trail
  trail.forEach((cell, index) => {
    const alpha = (index + 1) / trail.length;
    ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
    ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
  });

  // Draw obstacles
  ctx.fillStyle = "#ff4444";
  obstacles.forEach(o => {
    ctx.fillRect(o.x * cellSize, o.y * cellSize, cellSize, cellSize);
  });

  // Draw player
  ctx.fillStyle = "#00ffff";
  ctx.fillRect(player.x * cellSize, player.y * cellSize, cellSize, cellSize);

  // Draw goal
  ctx.fillStyle = "#00ff00";
  ctx.fillRect(goal.x * cellSize, goal.y * cellSize, cellSize, cellSize);
}

// Move player
function move(dx, dy) {
  if (paused) return;
  const newX = player.x + dx;
  const newY = player.y + dy;

  if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) return;
  if (obstacles.find(o => o.x === newX && o.y === newY)) {
    hitSound.play();
    return;
  }

  player.x = newX;
  player.y = newY;
  trail.push({ x: player.x, y: player.y });
  moveSound.play();

  if (player.x === goal.x && player.y === goal.y) {
    clearInterval(interval);
    winSound.play();
    alert("🎉 You reached the goal!");
  }
  draw();
}

// Keyboard events
document.addEventListener("keydown", e => {
  switch (e.key) {
    case "ArrowUp": move(0, -1); break;
    case "ArrowDown": move(0, 1); break;
    case "ArrowLeft": move(-1, 0); break;
    case "ArrowRight": move(1, 0); break;
  }
});

// Game controls
document.getElementById("start-btn").addEventListener("click", () => {
  resetGame();
  draw();
  paused = false;
});

document.getElementById("pause-btn").addEventListener("click", () => paused = true);
document.getElementById("resume-btn").addEventListener("click", () => paused = false);
document.getElementById("restart-btn").addEventListener("click", () => resetGame());

function resetGame() {
  player = { x: 0, y: 0 };
  trail = [];
  generateObstacles(70);
  paused = false;
  draw();
}

// Initial setup
resetGame();
