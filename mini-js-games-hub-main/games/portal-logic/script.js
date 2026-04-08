const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 60;
const rows = 8;
const cols = 8;

const player = { x: 0, y: 0, color: "cyan" };
let gameRunning = false;

const portalSound = document.getElementById("portalSound");
const moveSound = document.getElementById("moveSound");
const winSound = document.getElementById("winSound");

const goal = { x: 7, y: 7 };
const obstacles = [
  { x: 3, y: 3 },
  { x: 4, y: 3 },
  { x: 2, y: 5 },
];

const portals = [
  { x: 1, y: 1, link: { x: 6, y: 2 }, color: "violet" },
  { x: 6, y: 2, link: { x: 1, y: 1 }, color: "violet" },
  { x: 5, y: 5, link: { x: 2, y: 6 }, color: "lime" },
  { x: 2, y: 6, link: { x: 5, y: 5 }, color: "lime" },
];

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.strokeStyle = "#003";
      ctx.strokeRect(c * tileSize, r * tileSize, tileSize, tileSize);
    }
  }

  // Obstacles
  obstacles.forEach(o => {
    ctx.fillStyle = "red";
    ctx.shadowColor = "red";
    ctx.shadowBlur = 15;
    ctx.fillRect(o.x * tileSize + 10, o.y * tileSize + 10, tileSize - 20, tileSize - 20);
  });

  // Portals
  portals.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x * tileSize + tileSize / 2, p.y * tileSize + tileSize / 2, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 25;
  });

  // Goal
  ctx.fillStyle = "gold";
  ctx.shadowColor = "yellow";
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(goal.x * tileSize + tileSize / 2, goal.y * tileSize + tileSize / 2, 15, 0, Math.PI * 2);
  ctx.fill();

  // Player
  ctx.fillStyle = player.color;
  ctx.shadowColor = "cyan";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(player.x * tileSize + tileSize / 2, player.y * tileSize + tileSize / 2, 12, 0, Math.PI * 2);
  ctx.fill();
}

function movePlayer(dx, dy) {
  if (!gameRunning) return;

  const newX = player.x + dx;
  const newY = player.y + dy;

  // Out of bounds
  if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) return;

  // Collision with obstacle
  if (obstacles.some(o => o.x === newX && o.y === newY)) return;

  player.x = newX;
  player.y = newY;
  moveSound.play();

  // Check for portal
  const portal = portals.find(p => p.x === player.x && p.y === player.y);
  if (portal) {
    portalSound.play();
    player.x = portal.link.x;
    player.y = portal.link.y;
  }

  // Check goal
  if (player.x === goal.x && player.y === goal.y) {
    winSound.play();
    gameRunning = false;
    alert("🎉 You reached the goal!");
  }

  drawGrid();
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "w": movePlayer(0, -1); break;
    case "ArrowDown":
    case "s": movePlayer(0, 1); break;
    case "ArrowLeft":
    case "a": movePlayer(-1, 0); break;
    case "ArrowRight":
    case "d": movePlayer(1, 0); break;
  }
});

document.getElementById("startBtn").addEventListener("click", () => {
  gameRunning = true;
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  gameRunning = false;
});

document.getElementById("restartBtn").addEventListener("click", () => {
  player.x = 0;
  player.y = 0;
  gameRunning = true;
  drawGrid();
});

drawGrid();
