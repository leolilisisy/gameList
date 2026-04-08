const letters = ["A", "B", "C", "D", "E"];
const gridSize = 5;
let selectedLetter = "A";
const table = document.getElementById("logic-grid");
const message = document.getElementById("message");

// Create the grid dynamically
function createGrid() {
  table.innerHTML = "";
  for (let r = 0; r < gridSize; r++) {
    const row = document.createElement("tr");
    for (let c = 0; c < gridSize; c++) {
      const cell = document.createElement("td");
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => selectCell(cell));
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

// Handle cell selection and letter input
function selectCell(cell) {
  const letter = prompt("Enter a letter (A-E):", "A");
  if (!letters.includes(letter)) return;
  cell.textContent = letter;
  cell.classList.remove("correct", "wrong");
}

// Validate grid based on clues
function checkSolution() {
  let correct = true;

  // Reset cell colors
  document.querySelectorAll("td").forEach(cell => {
    cell.classList.remove("correct", "wrong");
  });

  const grid = [];
  for (let r = 0; r < gridSize; r++) {
    grid[r] = [];
    for (let c = 0; c < gridSize; c++) {
      grid[r][c] = table.rows[r].cells[c].textContent;
    }
  }

  // Clue 1: Row 1 must contain exactly one "A"
  const row1 = grid[0];
  const countA = row1.filter(l => l === "A").length;
  if (countA !== 1) {
    correct = false;
    row1.forEach((_, c) => table.rows[0].cells[c].classList.add("wrong"));
  } else {
    row1.forEach((_, c) => {
      if (table.rows[0].cells[c].textContent === "A") table.rows[0].cells[c].classList.add("correct");
    });
  }

  // Clue 2: Column 3 cannot have "B"
  for (let r = 0; r < gridSize; r++) {
    const cell = table.rows[r].cells[2];
    if (cell.textContent === "B") {
      correct = false;
      cell.classList.add("wrong");
    } else if (cell.textContent) cell.classList.add("correct");
  }

  // Clue 3: Two "C"s diagonally
  let diagCount = 0;
  for (let i = 0; i < gridSize; i++) {
    if (grid[i][i] === "C") diagCount++;
  }
  if (diagCount !== 2) {
    correct = false;
    for (let i = 0; i < gridSize; i++) {
      if (grid[i][i] === "C") table.rows[i].cells[i].classList.add("wrong");
    }
  } else {
    for (let i = 0; i < gridSize; i++) {
      if (grid[i][i] === "C") table.rows[i].cells[i].classList.add("correct");
    }
  }

  // Clue 4: No duplicates in any row or column
  for (let r = 0; r < gridSize; r++) {
    const rowSet = new Set();
    for (let c = 0; c < gridSize; c++) {
      const val = grid[r][c];
      if (!val) continue;
      if (rowSet.has(val)) {
        table.rows[r].cells[c].classList.add("wrong");
        correct = false;
      } else {
        rowSet.add(val);
      }
    }
  }
  for (let c = 0; c < gridSize; c++) {
    const colSet = new Set();
    for (let r = 0; r < gridSize; r++) {
      const val = grid[r][c];
      if (!val) continue;
      if (colSet.has(val)) {
        table.rows[r].cells[c].classList.add("wrong");
        correct = false;
      } else {
        colSet.add(val);
      }
    }
  }

  if (correct) {
    message.textContent = "🎉 Congratulations! All clues satisfied!";
    message.style.color = "green";
  } else {
    message.textContent = "⚠️ Some clues are not satisfied. Check highlighted cells.";
    message.style.color = "red";
  }
}

// Reset grid
function resetGrid() {
  createGrid();
  message.textContent = "";
}

// Event listeners
document.getElementById("check-btn").addEventListener("click", checkSolution);
document.getElementById("reset-btn").addEventListener("click", resetGrid);

// Initialize
createGrid();
