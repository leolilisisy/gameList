const maze = document.getElementById("maze");
const player = document.getElementById("player");
const goal = document.getElementById("goal");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const message = document.getElementById("message");
const trailCanvas = document.getElementById("trail");
const ctx = trailCanvas.getContext("2d");

trailCanvas.width = maze.offsetWidth;
trailCanvas.height = maze.offsetHeight;

let x = 10, y = 10;
let speed = 3;
let gameActive = false;
let walls = [];

function createWalls() {
  const wallData = [
    { x: 0, y: 80, w: 200, h: 10 },
    { x: 100, y: 160, w: 200, h: 10 },
    { x: 0, y: 240, w: 200, h: 10 },
    { x: 200, y: 0, w: 10, h: 200 }
  ];

  wallData.forEach(data => {
    const wall = document.createElement("div");
    wall.classList.add("wall");
    Object.assign(wall.style, {
      left: `${data.x}px`,
      top: `${data.y}px`,
      width: `${data.w}px`,
      height: `${data.h}px`,
    });
    maze.appendChild(wall);
    walls.push(wall);
  });
}

function resetGame() {
  player.style.left = "10px";
  player.style.top = "10px";
  x = 10;
  y = 10;
  ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
}

function startGame() {
  startBtn.disabled = true;
  restartBtn.disabled = false;
  message.textContent = "Navigate carefully!";
  resetGame();
  gameActive = true;
}

function restartGame() {
  message.textContent = "Maze restarted!";
  resetGame();
}

function movePlayer(e) {
  if (!gameActive) return;

  let nextX = x;
  let nextY = y;

  if (e.key === "ArrowUp") nextY -= speed;
  if (e.key === "ArrowDown") nextY += speed;
  if (e.key === "ArrowLeft") nextX -= speed;
  if (e.key === "ArrowRight") nextX += speed;

  if (!checkCollision(nextX, nextY)) {
    x = nextX;
    y = nextY;
    player.style.left = x + "px";
    player.style.top = y + "px";
    drawTrail();
  }

  if (reachedGoal()) {
    message.textContent = "✨ You escaped the maze!";
    gameActive = false;
  }
}

function checkCollision(nextX, nextY) {
  const playerRect = {
    left: nextX,
    top: nextY,
    right: nextX + 20,
    bottom: nextY + 20,
  };

  return walls.some(wall => {
    const rect = wall.getBoundingClientRect();
    const mazeRect = maze.getBoundingClientRect();
    const wx = rect.left - mazeRect.left;
    const wy = rect.top - mazeRect.top;
    const wr = wx + rect.width;
    const wb = wy + rect.height;

    return (
      playerRect.right > wx &&
      playerRect.left < wr &&
      playerRect.bottom > wy &&
      playerRect.top < wb
    );
  });
}

function reachedGoal() {
  const playerRect = player.getBoundingClientRect();
  const goalRect = goal.getBoundingClientRect();
  return !(
    playerRect.right < goalRect.left ||
    playerRect.left > goalRect.right ||
    playerRect.bottom < goalRect.top ||
    playerRect.top > goalRect.bottom
  );
}

function drawTrail() {
  ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
  ctx.beginPath();
  ctx.arc(x + 10, y + 10, 6, 0, Math.PI * 2);
  ctx.fill();
}

document.addEventListener("keydown", movePlayer);
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

createWalls();
resetGame();
