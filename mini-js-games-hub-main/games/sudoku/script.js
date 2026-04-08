const board = document.getElementById("sudoku-board");

// Sample puzzle (0 = empty)
const puzzle = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

function createBoard() {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = document.createElement("input");
      cell.classList.add("cell");
      cell.maxLength = 1;

      if (puzzle[row][col] !== 0) {
        cell.value = puzzle[row][col];
        cell.disabled = true;
        cell.classList.add("prefilled");
      }

      cell.addEventListener("input", () => {
        const val = cell.value;
        if (!/^[1-9]$/.test(val)) {
          cell.value = "";
        }
      });

      board.appendChild(cell);
    }
  }
}

createBoard();