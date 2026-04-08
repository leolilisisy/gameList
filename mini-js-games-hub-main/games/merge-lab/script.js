const gridSize = 5;
let grid = [];
let score = 0;
let moves = 0;

const gridEl = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const movesEl = document.getElementById("moves");
const restartBtn = document.getElementById("restart");

// Initialize Grid
function initGrid() {
    gridEl.innerHTML = "";
    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener("click", () => selectCell(r, c));
            gridEl.appendChild(cell);
        }
    }
    spawnRandom();
    spawnRandom();
    updateUI();
}

// Spawn a new level-1 element in a random empty cell
function spawnRandom() {
    const emptyCells = [];
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (!grid[r][c]) emptyCells.push({ r, c });
        }
    }
    if (emptyCells.length === 0) return;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[r][c] = 1; // Level 1 element
}

// Track selected cell for merging
let selectedCell = null;

function selectCell(r, c) {
    const cellLevel = grid[r][c];
    if (!cellLevel) return;

    if (!selectedCell) {
        selectedCell = { r, c };
        highlightCell(r, c);
    } else {
        if (selectedCell.r === r && selectedCell.c === c) {
            selectedCell = null;
            removeHighlights();
        } else {
            mergeCells(selectedCell.r, selectedCell.c, r, c);
            selectedCell = null;
            removeHighlights();
        }
    }
}

// Highlight selected cell
function highlightCell(r, c) {
    removeHighlights();
    const cell = getCellElement(r, c);
    cell.style.border = "2px solid #333";
}

// Remove highlights
function removeHighlights() {
    document.querySelectorAll(".cell").forEach(cell => cell.style.border = "none");
}

// Get cell DOM element
function getCellElement(r, c) {
    return gridEl.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
}

// Merge logic
function mergeCells(r1, c1, r2, c2) {
    if (grid[r1][c1] !== grid[r2][c2]) return; // Only merge same level
    grid[r2][c2] += 1;
    grid[r1][c1] = null;
    score += grid[r2][c2] * 10;
    moves++;
    spawnRandom();
    updateUI();
}

// Update UI
function updateUI() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cellEl = getCellElement(r, c);
            const level = grid[r][c];
            cellEl.dataset.level = level || "";
            cellEl.textContent = level ? `L${level}` : "";
        }
    }
    scoreEl.textContent = score;
    movesEl.textContent = moves;
}

// Restart game
restartBtn.addEventListener("click", () => {
    score = 0;
    moves = 0;
    initGrid();
});

// Initialize game on load
initGrid();
