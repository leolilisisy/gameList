const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const tilesEl = document.getElementById("tiles");
const restartBtn = document.getElementById("restartBtn");

const gridSize = 20;
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;

let player, enemies, grid, score;

function initGame() {
  grid = Array(rows)
    .fill()
    .map(() => Array(cols).fill(null));

  player = { x: 10, y: 10, color: "#4ade80", direction: "RIGHT" };
  enemies = [
    { x: 20, y: 15, color: "#f87171", direction: "LEFT" },
    { x: 5, y: 25, color: "#60a5fa", direction: "DOWN" },
  ];

  score = 0;
  updateStats();
}

function updateStats() {
  scoreEl.textContent = score;
  tilesEl.textContent = countClaimedTiles();
}

function countClaimedTiles() {
  return grid.flat().filter((cell) => cell === player.color).length;
}

function drawGrid() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = grid[y][x] || "#1f2937";
      ctx.fillRect(x * gridSize, y * gridSize, gridSize - 1, gridSize - 1);
    }
  }
}

function moveEntity(entity) {
  switch (entity.direction) {
    case "UP":
      entity.y--;
      break;
    case "DOWN":
      entity.y++;
      break;
    case "LEFT":
      entity.x--;
      break;
    case "RIGHT":
      entity.x++;
      break;
  }

  // Wrap around edges
  if (entity.x < 0) entity.x = cols - 1;
  if (entity.y < 0) entity.y = rows - 1;
  if (entity.x >= cols) entity.x = 0;
  if (entity.y >= rows) entity.y = 0;
}

function handleInput(e) {
  const key = e.key.toLowerCase();
  if (key === "w" || e.key === "ArrowUp") player.direction = "UP";
  else if (key === "s" || e.key === "ArrowDown") player.direction = "DOWN";
  else if (key === "a" || e.key === "ArrowLeft") player.direction = "LEFT";
  else if (key === "d" || e.key === "ArrowRight") player.direction = "RIGHT";
}

document.addEventListener("keydown", handleInput);

function update() {
  moveEntity(player);
  grid[player.y][player.x] = player.color;
  score++;

  enemies.forEach((enemy) => {
    moveEntity(enemy);
    grid[enemy.y][enemy.x] = enemy.color;
    // Collision detection
    if (enemy.x === player.x && enemy.y === player.y) {
      gameOver();
    }
  });

  updateStats();
}

function render() {
  drawGrid();
  ctx.fillStyle = player.color;
  ctx.fillRect(
    player.x * gridSize,
    player.y * gridSize,
    gridSize - 1,
    gridSize - 1
  );

  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(
      enemy.x * gridSize,
      enemy.y * gridSize,
      gridSize - 1,
      gridSize - 1
    );
  });
}

let gameLoop;
function startGame() {
  initGame();
  clearInterval(gameLoop);
  gameLoop = setInterval(() => {
    update();
    render();
  }, 120);
}

function gameOver() {
  clearInterval(gameLoop);
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "28px Poppins";
  ctx.textAlign = "center";
  ctx.fillText("💥 Game Over! 💥", canvas.width / 2, canvas.height / 2 - 20);
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}

restartBtn.addEventListener("click", startGame);
startGame();
