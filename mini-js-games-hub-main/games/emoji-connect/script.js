const emojis = ["🍎","🍎","🍌","🍌","🍇","🍇","🍉","🍉","🍓","🍓","🍒","🍒","🥝","🥝","🍑","🍑"];
let firstSelection = null;
let secondSelection = null;
let moves = 0;

const grid = document.getElementById("grid");
const movesDisplay = document.getElementById("moves");
const message = document.getElementById("message");
const resetBtn = document.getElementById("reset");

// Shuffle function
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Initialize Grid
function initGrid() {
  const shuffled = shuffle([...emojis]);
  grid.innerHTML = "";
  shuffled.forEach((emoji, index) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.emoji = emoji;
    cell.dataset.index = index;
    cell.textContent = emoji;
    cell.addEventListener("click", handleClick);
    grid.appendChild(cell);
  });
  firstSelection = null;
  secondSelection = null;
  moves = 0;
  movesDisplay.textContent = moves;
  message.textContent = "";
}

function handleClick(e) {
  const cell = e.currentTarget;
  if (cell.classList.contains("matched") || cell.classList.contains("selected")) return;

  cell.classList.add("selected");

  if (!firstSelection) {
    firstSelection = cell;
  } else if (!secondSelection) {
    secondSelection = cell;
    moves++;
    movesDisplay.textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  if (firstSelection.dataset.emoji === secondSelection.dataset.emoji) {
    firstSelection.classList.add("matched");
    secondSelection.classList.add("matched");
    firstSelection.classList.remove("selected");
    secondSelection.classList.remove("selected");
    firstSelection = null;
    secondSelection = null;
    checkWin();
  } else {
    setTimeout(() => {
      firstSelection.classList.remove("selected");
      secondSelection.classList.remove("selected");
      firstSelection = null;
      secondSelection = null;
    }, 800);
  }
}

function checkWin() {
  const matched = document.querySelectorAll(".cell.matched");
  if (matched.length === emojis.length) {
    message.textContent = `🎉 You Won in ${moves} moves!`;
  }
}

// Reset Game
resetBtn.addEventListener("click", initGrid);

// Start Game
initGrid();
