const board = document.getElementById("board");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const i18n = window.SiteI18n;

let cells = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = true;

function renderStatus() {
  if (!running && cells.every((cell) => cell)) {
    return;
  }
  statusText.textContent = i18n.t("gameTic.turn", { player: currentPlayer });
}

function drawBoard() {
  board.innerHTML = "";
  cells.forEach((value, index) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.textContent = value;
    cell.addEventListener("click", () => cellClicked(index));
    board.appendChild(cell);
  });
}

function cellClicked(index) {
  if (!running || cells[index] !== "") return;
  cells[index] = currentPlayer;
  drawBoard();

  if (checkWinner()) {
    statusText.textContent = i18n.t("gameTic.win", { player: currentPlayer });
    running = false;
  } else if (cells.every((cell) => cell)) {
    statusText.textContent = i18n.t("gameTic.draw");
    running = false;
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    renderStatus();
  }
}

function checkWinner() {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  return wins.some(([a, b, c]) => cells[a] && cells[a] === cells[b] && cells[a] === cells[c]);
}

resetBtn.addEventListener("click", () => {
  cells.fill("");
  currentPlayer = "X";
  running = true;
  drawBoard();
  renderStatus();
});

window.addEventListener("site-language-change", renderStatus);

drawBoard();
renderStatus();
