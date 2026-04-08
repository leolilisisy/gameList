const game = document.getElementById("gameContainer");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");

let playerX = 180;
let score = 0;
let gameOver = false;

document.addEventListener("keydown", (e) => {
  if (gameOver) return;
  if (e.key === "ArrowLeft" && playerX > 0) playerX -= 20;
  if (e.key === "ArrowRight" && playerX < 360) playerX += 20;
  player.style.left = playerX + "px";
});

function createBlock() {
  if (gameOver) return;
  const block = document.createElement("div");
  block.classList.add("block");
  block.style.left = Math.floor(Math.random() * 10) * 40 + "px";
  game.appendChild(block);

  let blockY = 0;
  const fallSpeed = 4;

  function moveBlock() {
    if (gameOver) {
      block.remove();
      return;
    }

    blockY += fallSpeed;
    block.style.top = blockY + "px";

    // collision detection
    if (
      blockY + 40 >= 560 &&
      Math.abs(parseInt(block.style.left) - playerX) < 40
    ) {
      gameOver = true;
      alert("💀 Game Over! Your score: " + score);
      location.reload();
    }

    if (blockY > 600) {
      block.remove();
      score++;
      scoreDisplay.textContent = "Score: " + score;
    } else {
      requestAnimationFrame(moveBlock);
    }
  }

  requestAnimationFrame(moveBlock);
}

setInterval(createBlock, 800);
