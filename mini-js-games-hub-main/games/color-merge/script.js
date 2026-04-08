const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart");

const gridSize = 4;
let score = 0;
let blocks = [];

const colors = ["#FF5733", "#33FF57", "#3357FF", "#F333FF", "#FFEB33"];
let targetColor = colors[Math.floor(Math.random() * colors.length)];

function initBoard() {
  board.innerHTML = "";
  blocks = [];
  score = 0;
  scoreEl.textContent = score;

  for (let i = 0; i < gridSize * gridSize; i++) {
    const block = document.createElement("div");
    block.classList.add("block");
    const color = colors[Math.floor(Math.random() * colors.length)];
    block.style.backgroundColor = color;
    block.dataset.color = color;
    block.addEventListener("click", () => mergeBlock(block));
    board.appendChild(block);
    blocks.push(block);
  }
}

function mergeBlock(selectedBlock) {
  const sameColorBlocks = blocks.filter(
    b => b.dataset.color === selectedBlock.dataset.color
  );

  if (sameColorBlocks.length < 2) {
    alert("Need at least 2 blocks of same color to merge!");
    return;
  }

  sameColorBlocks.forEach(b => {
    b.style.backgroundColor = targetColor;
    b.dataset.color = targetColor;
  });

  score += sameColorBlocks.length * 10;
  scoreEl.textContent = score;

  // Generate a new target color
  targetColor = colors[Math.floor(Math.random() * colors.length)];
}

restartBtn.addEventListener("click", initBoard);

// Initialize game on load
initBoard();
