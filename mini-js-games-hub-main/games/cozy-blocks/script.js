const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 600;

let blocks = [];
let baseWidth = 200;
let blockHeight = 25;
let speed = 3;
let currentX = 100;
let direction = 1;
let score = 0;
let isDropping = false;
let gameOver = false;

const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

// Initialize base block
blocks.push({ x: 100, y: canvas.height - blockHeight, width: baseWidth });

function drawBlock(block, color) {
  ctx.fillStyle = color || "#90caf9";
  ctx.fillRect(block.x, block.y, block.width, blockHeight);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(block.x, block.y, block.width, blockHeight);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw stacked blocks
  blocks.forEach((block, index) => {
    const shade = 180 + index * 2;
    drawBlock(block, `hsl(${shade}, 70%, 70%)`);
  });

  // Draw moving block
  if (!gameOver) {
    ctx.fillStyle = "#42a5f5";
    ctx.fillRect(currentX, getNextY(), blocks[blocks.length - 1].width, blockHeight);
  }

  // Update moving block position
  if (!isDropping && !gameOver) {
    currentX += speed * direction;
    if (currentX + blocks[blocks.length - 1].width > canvas.width || currentX < 0) {
      direction *= -1;
    }
  }

  // Display score
  scoreDisplay.textContent = score;

  requestAnimationFrame(draw);
}

function getNextY() {
  return canvas.height - (blocks.length + 1) * blockHeight;
}

function dropBlock() {
  if (isDropping || gameOver) return;
  isDropping = true;

  const prev = blocks[blocks.length - 1];
  const newY = getNextY();
  const newX = currentX;
  const overlap = Math.min(prev.x + prev.width, newX + prev.width) - Math.max(prev.x, newX);

  if (overlap > 0) {
    const newWidth = overlap;
    const alignedX = Math.max(prev.x, newX);
    blocks.push({ x: alignedX, y: newY, width: newWidth });

    // Perfect alignment bonus
    if (Math.abs(prev.x - newX) < 5) {
      score += 5;
    } else {
      score += 1;
    }

    speed += 0.2;
    isDropping = false;
  } else {
    // No overlap → Game Over
    gameOver = true;
    restartBtn.classList.remove("hidden");
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "28px Poppins";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
  }
}

function restartGame() {
  blocks = [{ x: 100, y: canvas.height - blockHeight, width: baseWidth }];
  currentX = 100;
  direction = 1;
  score = 0;
  speed = 3;
  gameOver = false;
  restartBtn.classList.add("hidden");
  isDropping = false;
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowDown") dropBlock();
});
canvas.addEventListener("click", dropBlock);
restartBtn.addEventListener("click", restartGame);

draw();
