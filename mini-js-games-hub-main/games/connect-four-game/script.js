// --- Game Constants ---
const ROWS = 6;
const COLS = 7;
const PLAYER1 = 1;
const PLAYER2 = 2;
const EMPTY = 0;
const WIN_COUNT = 4;

// --- DOM Elements ---
const boardEl = document.getElementById('board');
const turnIndicator = document.getElementById('turn-indicator');
const resetButton = document.getElementById('reset-button');

// --- Game State Variables ---
let board = [];
let currentPlayer = PLAYER1;
let gameOver = false;

// --- Game Initialization ---

/**
 * Initializes the board, the game state, and the UI.
 */
function initGame() {
    // Reset the board to an empty 2D array
    board = Array(ROWS).fill(0).map(() => Array(COLS).fill(EMPTY));
    currentPlayer = PLAYER1;
    gameOver = false;
    boardEl.innerHTML = ''; // Clear previous board
    boardEl.classList.remove('game-over');

    // Draw the UI board cells
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.column = c;
            
            // Add an inner div for the disc (allows styling the hole and the disc separately)
            const disc = document.createElement('div');
            disc.classList.add('cell-disc');
            cell.appendChild(disc);

            // Only add the click handler to the top row visually, but logic targets the column
            if (r === 0) {
                cell.addEventListener('click', () => dropDisc(c));
            }
            boardEl.appendChild(cell);
        }
    }
    updateUI();
}

/**
 * Updates the turn indicator and board classes.
 */
function updateUI() {
    if (gameOver) {
        boardEl.classList.add('game-over');
        return;
    }

    if (currentPlayer === PLAYER1) {
        turnIndicator.textContent = "Player 1's Turn (Red)";
        turnIndicator.style.color = 'var(--player1-color)';
        boardEl.classList.remove('player2-turn');
    } else {
        turnIndicator.textContent = "Player 2's Turn (Yellow)";
        turnIndicator.style.color = 'var(--player2-color)';
        boardEl.classList.add('player2-turn');
    }
}

// --- Piece Placement and Gravity ---

/**
 * Handles the player dropping a disc into a column.
 * @param {number} col - The column index (0-6).
 */
function dropDisc(col) {
    if (gameOver) return;

    // Find the lowest empty row in the selected column
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === EMPTY) {
            row = r;
            break;
        }
    }

    // If the column is full, do nothing
    if (row === -1) {
        alert("Column is full!");
        return;
    }

    // 1. Place the disc in the board array
    board[row][col] = currentPlayer;

    // 2. Update the UI
    const cellEl = boardEl.querySelector(`.cell[data-row="${row}"][data-column="${col}"] .cell-disc`);
    cellEl.classList.add(`player${currentPlayer}`);
    
    // 3. Check for win condition
    if (checkWin(row, col)) {
        gameOver = true;
        turnIndicator.textContent = `Player ${currentPlayer} Wins! 🎉`;
        turnIndicator.style.color = currentPlayer === PLAYER1 ? 'var(--player1-color)' : 'var(--player2-color)';
        boardEl.classList.add('game-over');
    } else if (isBoardFull()) {
        gameOver = true;
        turnIndicator.textContent = "It's a Draw! 🤝";
        turnIndicator.style.color = 'black';
        boardEl.classList.add('game-over');
    } else {
        // 4. Switch player
        currentPlayer = currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1;
        updateUI();
    }
}

/**
 * Checks if the board is completely filled (a draw).
 * @returns {boolean} True if the board is full.
 */
function isBoardFull() {
    return board[0].every(cell => cell !== EMPTY);
}

// --- Win Condition Logic (The Main Challenge) ---

/**
 * Checks all four possible directions for a win starting from the last dropped piece.
 * @param {number} r - The row index of the last piece.
 * @param {number} c - The column index of the last piece.
 * @returns {boolean} True if a win is found.
 */
function checkWin(r, c) {
    const player = board[r][c];

    // Array of all 8 direction vectors: [dr, dc]
    const directions = [
        [0, 1],   // Horizontal (Right)
        [1, 0],   // Vertical (Down)
        [1, 1],   // Diagonal (Down-Right)
        [1, -1]   // Diagonal (Down-Left)
    ];

    for (const [dr, dc] of directions) {
        // We only check 4 directions and reverse the check to cover all 8.
        // E.g., checking [0, 1] (Right) and [0, -1] (Left) is combined into one check.
        
        let count = 1; // Start with the dropped piece
        let winningCells = [{r, c}];

        // Check forward direction
        for (let i = 1; i < WIN_COUNT; i++) {
            const nextR = r + dr * i;
            const nextC = c + dc * i;

            if (
                nextR >= 0 && nextR < ROWS && 
                nextC >= 0 && nextC < COLS &&
                board[nextR][nextC] === player
            ) {
                count++;
                winningCells.push({r: nextR, c: nextC});
            } else {
                break;
            }
        }

        // Check backward direction (reverse of the vector)
        for (let i = 1; i < WIN_COUNT; i++) {
            const nextR = r - dr * i;
            const nextC = c - dc * i;

            if (
                nextR >= 0 && nextR < ROWS && 
                nextC >= 0 && nextC < COLS &&
                board[nextR][nextC] === player
            ) {
                count++;
                winningCells.push({r: nextR, c: nextC});
            } else {
                break;
            }
        }

        if (count >= WIN_COUNT) {
            highlightWin(winningCells);
            return true;
        }
    }

    return false;
}

/**
 * Highlights the four winning discs on the board.
 * @param {Array<Object>} cells - Array of {r, c} objects for the winning line.
 */
function highlightWin(cells) {
    cells.forEach(pos => {
        const cellEl = boardEl.querySelector(`.cell[data-row="${pos.r}"][data-column="${pos.c}"]`);
        if (cellEl) {
            cellEl.classList.add('winning-cell');
        }
    });
}

// --- Event Listeners ---
resetButton.addEventListener('click', initGame);

// --- Game Start ---
initGame();