const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const movesEl = document.getElementById("moves");
const swapSound = document.getElementById("swap-sound");
const matchSound = document.getElementById("match-sound");
const errorSound = document.getElementById("error-sound");

const rows = 8;
const cols = 8;
let grid = [];
let score = 0;
let moves = 30;
let firstGem = null;
let paused = false;

const gemColors = ["#ff4757", "#3742fa", "#2ed573", "#ffa502", "#70a1ff", "#ff6b81"];
const obstacleChance = 0.08; // 8% obstacles

function createBoard() {
  board.innerHTML = "";
  grid = [];

  for (let r = 0; r < rows; r++) {
    let row = [];
    for (let c = 0; c < cols; c++) {
      const gem = document.createElement("div");
      gem.classList.add("gem");

      if (Math.random() < obstacleChance) {
        gem.classList.add("obstacle");
        gem.style.background = "gray";
        row.push("X");
      } else {
        const color = gemColors[Math.floor(Math.random() * gemColors.length)];
        gem.style.background = color;
        row.push(color);
      }

      gem.dataset.row = r;
      gem.dataset.col = c;
      gem.addEventListener("click", () => selectGem(gem));

      board.appendChild(gem);
    }
    grid.push(row);
  }
}

function selectGem(gem) {
  if (paused || gem.classList.contains("obstacle")) return;

  if (!firstGem) {
    firstGem = gem;
    gem.style.boxShadow = "0 0 20px #00ffff";
  } else {
    const r1 = +firstGem.dataset.row, c1 = +firstGem.dataset.col;
    const r2 = +gem.dataset.row, c2 = +gem.dataset.col;

    const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;

    if (isAdjacent) {
      swapSound.play();
      swapGems(r1, c1, r2, c2);
      moves--;
      movesEl.textContent = moves;
    } else {
      errorSound.play();
    }

    firstGem.style.boxShadow = "0 0 10px rgba(255,255,255,0.4)";
    firstGem = null;
  }
}

function swapGems(r1, c1, r2, c2) {
  const temp = grid[r1][c1];
  grid[r1][c1] = grid[r2][c2];
  grid[r2][c2] = temp;
  renderBoard();
  checkMatches();
}

function renderBoard() {
  const gems = board.children;
  for (let i = 0; i < gems.length; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const color = grid[r][c];
    gems[i].style.background = color === "X" ? "gray" : color;
    gems[i].className = color === "X" ? "gem obstacle" : "gem";
  }
}

function checkMatches() {
  let matched = [];

  // Check horizontal and vertical
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 2; c++) {
      if (grid[r][c] !== "X" && grid[r][c] === grid[r][c + 1] && grid[r][c] === grid[r][c + 2]) {
        matched.push([r, c], [r, c + 1], [r, c + 2]);
      }
    }
  }
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 2; r++) {
      if (grid[r][c] !== "X" && grid[r][c] === grid[r + 1][c] && grid[r][c] === grid[r + 2][c]) {
        matched.push([r, c], [r + 1, c], [r + 2, c]);
      }
    }
  }

  if (matched.length > 0) {
    matchSound.play();
    removeMatches(matched);
  }
}

function removeMatches(matched) {
  matched.forEach(([r, c]) => {
    grid[r][c] = null;
    score += 10;
  });
  scoreEl.textContent = score;
  dropGems();
}

function dropGems() {
  for (let c = 0; c < cols; c++) {
    for (let r = rows - 1; r >= 0; r--) {
      if (grid[r][c] === null) {
        for (let k = r - 1; k >= 0; k--) {
          if (grid[k][c] !== null && grid[k][c] !== "X") {
            grid[r][c] = grid[k][c];
            grid[k][c] = null;
            break;
          }
        }
      }
    }
  }
  refillBoard();
  renderBoard();
  checkMatches();
}

function refillBoard() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = gemColors[Math.floor(Math.random() * gemColors.length)];
      }
    }
  }
}

// Buttons
document.getElementById("start-btn").onclick = () => { paused = false; };
document.getElementById("pause-btn").onclick = () => { paused = !paused; };
document.getElementById("restart-btn").onclick = () => { score = 0; moves = 30; createBoard(); renderBoard(); };

createBoard();
