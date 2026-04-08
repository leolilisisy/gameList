const board = document.getElementById("board");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");

let cells = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = true;

function drawBoard() {
  board.innerHTML = "";
  cells.forEach((val, i) => {
    const div = document.createElement("div");
    div.classList.add("cell");
    div.textContent = val;
    div.addEventListener("click", () => cellClicked(i));
    board.appendChild(div);
  });
}

function cellClicked(i) {
  if (!running || cells[i] !== "") return;
  cells[i] = currentPlayer;
  drawBoard();
  if (checkWinner()) {
    statusText.textContent = `${currentPlayer} Wins! 🎉`;
    running = false;
  } else if (cells.every(c => c)) {
    statusText.textContent = "It's a Draw!";
    running = false;
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `${currentPlayer}'s turn`;
  }
}

function checkWinner() {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(([a,b,c]) => 
    cells[a] && cells[a] === cells[b] && cells[a] === cells[c]);
}

resetBtn.onclick = () => {
  cells.fill("");
  currentPlayer = "X";
  running = true;
  statusText.textContent = `${currentPlayer}'s turn`;
  drawBoard();
};

drawBoard();
statusText.textContent = `${currentPlayer}'s turn`;
