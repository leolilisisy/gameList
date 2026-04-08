const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restart-btn");

let playerPos = 180; // initial left position
let blocks = [];
let blockSpeed = 2;
let blockInterval = 2000;
let score = 0;
let gameOver = false;
let moveLeft = false;
let moveRight = false;

// Create player movement
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") moveLeft = true;
  if (e.key === "ArrowRight") moveRight = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") moveLeft = false;
  if (e.key === "ArrowRight") moveRight = false;
});

// Game loop
function update() {
  if (gameOver) return;

  // Move player
  if (moveLeft) playerPos -= 5;
  if (moveRight) playerPos += 5;
  if (playerPos < 0) playerPos = 0;
  if (playerPos > gameArea.clientWidth - 40) playerPos = gameArea.clientWidth - 40;
  player.style.left = playerPos + "px";

  // Move blocks
  blocks.forEach((block, index) => {
    let top = parseInt(block.style.top);
    block.style.top = top + blockSpeed + "px";

    // Check collision
    if (
      top + 40 >= gameArea.clientHeight - 10 &&
      parseInt(block.style.left) < playerPos + 40 &&
      parseInt(block.style.left) + 40 > playerPos
    ) {
      endGame();
    }

    // Remove blocks if out of view
    if (top > gameArea.clientHeight) {
      gameArea.removeChild(block);
      blocks.splice(index, 1);
      score++;
      scoreDisplay.textContent = score;
      // Gradually increase difficulty
      if (score % 5 === 0) blockSpeed += 0.5;
      if (score % 10 === 0 && blockInterval > 500) {
        clearInterval(blockSpawner);
        blockInterval -= 100;
        blockSpawner = setInterval(spawnBlock, blockInterval);
      }
    }
  });

  requestAnimationFrame(update);
}

// Spawn blocks
function spawnBlock() {
  const block = document.createElement("div");
  block.classList.add("block");
  const blockLeft = Math.floor(Math.random() * (gameArea.clientWidth - 40));
  block.style.left = blockLeft + "px";
  block.style.top = "0px";
  gameArea.appendChild(block);
  blocks.push(block);
}

// End game
function endGame() {
  gameOver = true;
  alert("Game Over! Your score: " + score);
}

// Restart game
restartBtn.addEventListener("click", () => {
  // Reset
  blocks.forEach(block => gameArea.removeChild(block));
  blocks = [];
  playerPos = 180;
  player.style.left = playerPos + "px";
  score = 0;
  blockSpeed = 2;
  blockInterval = 2000;
  scoreDisplay.textContent = score;
  gameOver = false;
  clearInterval(blockSpawner);
  blockSpawner = setInterval(spawnBlock, blockInterval);
  update();
});

// Start game
let blockSpawner = setInterval(spawnBlock, blockInterval);
update();
