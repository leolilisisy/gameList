const board = document.getElementById("board");
const movesDisplay = document.getElementById("moves");
const scoreDisplay = document.getElementById("score");
const gameOverScreen = document.getElementById("game-over");
const message = document.getElementById("message");
const playAgain = document.getElementById("play-again");
const reset = document.getElementById("reset");

let firstTile = null;
let secondTile = null;
let moves = 0;
let score = 0;

const icons = ["🍎", "🍌", "🍇", "🍓", "🍊", "🍉", "🍒", "🥝"];
let tiles = [...icons, ...icons];

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function createBoard() {
  board.innerHTML = "";
  shuffle(tiles);
  tiles.forEach((icon, index) => {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.dataset.icon = icon;
    tile.dataset.index = index;
    tile.addEventListener("click", handleTileClick);
    board.appendChild(tile);
  });
}

function handleTileClick(e) {
  const tile = e.target;

  if (tile.classList.contains("matched") || tile === firstTile) return;

  tile.textContent = tile.dataset.icon;

  if (!firstTile) {
    firstTile = tile;
  } else {
    secondTile = tile;
    moves++;
    movesDisplay.textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  if (firstTile.dataset.icon === secondTile.dataset.icon) {
    firstTile.classList.add("matched");
    secondTile.classList.add("matched");
    score += 10;
    scoreDisplay.textContent = score;
    resetSelection();
    checkWin();
  } else {
    setTimeout(() => {
      firstTile.textContent = "";
      secondTile.textContent = "";
      resetSelection();
    }, 700);
  }
}

function resetSelection() {
  firstTile = null;
  secondTile = null;
}

function checkWin() {
  const allMatched = document.querySelectorAll(".matched").length === tiles.length;
  if (allMatched) {
    showGameOver("🎉 You Won!");
  }
}

function showGameOver(text) {
  message.textContent = text;
  gameOverScreen.style.display = "block";
}

function restartGame() {
  moves = 0;
  score = 0;
  movesDisplay.textContent = moves;
  scoreDisplay.textContent = score;
  gameOverScreen.style.display = "none";
  resetSelection();
  createBoard();
}

playAgain.addEventListener("click", restartGame);
reset.addEventListener("click", restartGame);

createBoard();
