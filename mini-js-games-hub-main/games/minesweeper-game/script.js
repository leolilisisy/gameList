// --- 1. Game Configuration ---
const GRID_SIZE = 10; // e.g., 9x9 grid
const NUM_MINES = 10; // Number of mines to place

// --- 2. DOM Elements ---
const gameBoard = document.getElementById('game-board');
const minesLeftDisplay = document.getElementById('mines-left');
const gameStatusDisplay = document.getElementById('game-status');
const timerDisplay = document.getElementById('timer');
const resetButton = document.getElementById('resetButton');

// --- 3. Game State Variables ---
let board = []; // 2D array to store cell objects
let cells = []; // 1D array of DOM cell elements
let minesLocated = 0; // Flags placed on suspected mines
let revealedCount = 0; // Number of non-mine cells revealed
let gameOver = false;
let gameStarted = false;
let timerInterval;
let secondsElapsed = 0;

// --- 4. Cell Object (Constructor or Class) ---
// We'll create objects for each cell to store its state
class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.isMine = false;
        this.isRevealed = false;
        this.isFlagged = false;
        this.mineCount = 0; // Number of adjacent mines
        this.element = null; // Reference to the DOM element
    }
}

// --- 5. Game Initialization ---

function createBoard() {
    gameBoard.innerHTML = ''; // Clear existing board
    gameBoard.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`; // Set grid columns

    board = [];
    cells = [];
    minesLocated = 0;
    revealedCount = 0;
    gameOver = false;
    gameStarted = false;
    secondsElapsed = 0;
    clearInterval(timerInterval); // Stop any running timer

    minesLeftDisplay.textContent = `Mines: ${NUM_MINES}`;
    gameStatusDisplay.textContent = '';
    timerDisplay.textContent = `Time: 0`;

    // Initialize 2D board array and create DOM elements
    for (let r = 0; r < GRID_SIZE; r++) {
        board[r] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            const cellObj = new Cell(r, c);
            board[r][c] = cellObj;

            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.dataset.row = r;
            cellElement.dataset.col = c;
            cellElement.addEventListener('click', () => handleClick(r, c));
            cellElement.addEventListener('contextmenu', (e) => handleRightClick(e, r, c)); // Right-click for flagging

            cellObj.element = cellElement; // Store DOM element reference in cell object
            gameBoard.appendChild(cellElement);
            cells.push(cellElement); // Add to 1D array for easier iteration if needed
        }
    }
}

// Places mines randomly on the board
function placeMines(firstClickRow, firstClickCol) {
    let minesPlaced = 0;
    while (minesPlaced < NUM_MINES) {
        const r = Math.floor(Math.random() * GRID_SIZE);
        const c = Math.floor(Math.random() * GRID_SIZE);

        // Ensure mine is not placed on the first clicked cell or its immediate neighbors
        const isNearFirstClick = (Math.abs(r - firstClickRow) <= 1 && Math.abs(c - firstClickCol) <= 1);

        if (!board[r][c].isMine && !isNearFirstClick) {
            board[r][c].isMine = true;
            minesPlaced++;
        }
    }
}

// Calculates the number of adjacent mines for each non-mine cell
function calculateMineCounts() {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (!board[r][c].isMine) {
                let count = 0;
                // Check all 8 neighbors
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue; // Skip self

                        const nr = r + dr;
                        const nc = c + dc;

                        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && board[nr][nc].isMine) {
                            count++;
                        }
                    }
                }
                board[r][c].mineCount = count;
            }
        }
    }
}

// --- 6. Game Logic Handlers ---

// Starts the game timer
function startTimer() {
    secondsElapsed = 0;
    timerDisplay.textContent = `Time: ${secondsElapsed}`;
    timerInterval = setInterval(() => {
        secondsElapsed++;
        timerDisplay.textContent = `Time: ${secondsElapsed}`;
    }, 1000);
}

// Handles a left-click on a cell
function handleClick(row, col) {
    if (gameOver || board[row][col].isRevealed || board[row][col].isFlagged) {
        return;
    }

    // First click logic: place mines and start timer
    if (!gameStarted) {
        placeMines(row, col);
        calculateMineCounts();
        startTimer();
        gameStarted = true;
    }

    if (board[row][col].isMine) {
        revealAllMines();
        endGame(false); // Player hit a mine
    } else {
        revealCell(row, col);
        checkWinCondition();
    }
}

// Handles a right-click (contextmenu) on a cell to flag/unflag
function handleRightClick(event, row, col) {
    event.preventDefault(); // Prevent browser context menu
    if (gameOver || board[row][col].isRevealed) {
        return;
    }

    const cell = board[row][col];
    if (cell.isFlagged) {
        cell.isFlagged = false;
        cell.element.classList.remove('flagged');
        minesLocated--;
    } else if (minesLocated < NUM_MINES) { // Only allow flagging if mines are left
        cell.isFlagged = true;
        cell.element.classList.add('flagged');
        minesLocated++;
    }
    minesLeftDisplay.textContent = `Mines: ${NUM_MINES - minesLocated}`;
    checkWinCondition();
}

// Recursively reveals empty cells
function revealCell(row, col) {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE || board[row][col].isRevealed || board[row][col].isFlagged) {
        return; // Out of bounds or already revealed/flagged
    }

    const cell = board[row][col];
    cell.isRevealed = true;
    cell.element.classList.add('revealed');
    revealedCount++;

    if (cell.isMine) { // Should not happen if `handleClick` logic is correct, but good for safety
        cell.element.classList.add('mine');
        return;
    }

    if (cell.mineCount > 0) {
        cell.element.textContent = cell.mineCount;
        cell.element.classList.add(`num-${cell.mineCount}`); // Add class for color styling
        return;
    }

    // If it's an empty cell (mineCount === 0), recursively reveal neighbors
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            revealCell(row + dr, col + dc); // Recursive call
        }
    }
}

// Reveals all mine locations when game ends (lose)
function revealAllMines() {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = board[r][c];
            if (cell.isMine && !cell.isFlagged) {
                cell.element.classList.add('mine');
                cell.element.textContent = ''; // Clear flag emoji if any
            } else if (!cell.isMine && cell.isFlagged) {
                cell.element.classList.add('mine-incorrect'); // Mark incorrectly flagged
            } else if (cell.isMine && cell.isFlagged) {
                cell.element.classList.add('mine-correct'); // Mark correctly flagged
            }
        }
    }
}

// Checks if the player has won
function checkWinCondition() {
    const totalNonMines = (GRID_SIZE * GRID_SIZE) - NUM_MINES;

    // Win condition 1: All non-mine cells are revealed
    if (revealedCount === totalNonMines) {
        endGame(true);
    } 
    // Win condition 2 (Alternative for advanced Minesweeper):
    // All mines are correctly flagged AND all non-mine cells are revealed.
    // This current implementation implies non-mines are always revealed by clicking.
    // If you want to enable flagging as a primary win condition, this needs adjustment.
}

// Ends the game (win/lose)
function endGame(win) {
    gameOver = true;
    clearInterval(timerInterval); // Stop the timer

    if (win) {
        gameStatusDisplay.textContent = 'YOU WIN! 🎉';
        gameStatusDisplay.classList.add('win');
        // Optionally, flag all remaining mines automatically
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = board[r][c];
                if (cell.isMine && !cell.isFlagged) {
                    cell.isFlagged = true;
                    cell.element.classList.add('flagged');
                    cell.element.classList.add('mine-correct'); // Visual feedback for auto-flag
                }
            }
        }
        minesLeftDisplay.textContent = `Mines: 0`; // All mines accounted for
    } else {
        gameStatusDisplay.textContent = 'GAME OVER! 💀';
        gameStatusDisplay.classList.add('lose');
    }
}

// --- 7. Event Listeners ---
resetButton.addEventListener('click', createBoard);

// --- 8. Initialization ---
createBoard();