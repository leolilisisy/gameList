// --- Constants and DOM Elements ---
const BOARD_SIZE = 4;
const TOTAL_TILES = BOARD_SIZE * BOARD_SIZE; // 16 tiles
const EMPTY_TILE_VALUE = TOTAL_TILES; // The 16th tile is the empty space

const boardElement = document.getElementById('puzzle-board');
const movesDisplay = document.getElementById('moves');
const timeDisplay = document.getElementById('time');
const resetButton = document.getElementById('reset-button');
const playAgainButton = document.getElementById('play-again-button');
const winMessage = document.getElementById('win-message');
const finalMovesSpan = document.getElementById('final-moves');
const finalTimeSpan = document.getElementById('final-time');

// Game state variables
let boardState = []; // 1D array representing the 4x4 grid (1 to 16)
let moves = 0;
let timerInterval;
let timeElapsed = 0;
let isGameRunning = false;

// --- Core Game Logic ---

/**
 * Initializes the board by generating a solvable state and rendering it.
 */
function initializeBoard() {
    // 1. Reset Game State
    moves = 0;
    timeElapsed = 0;
    isGameRunning = true;
    movesDisplay.textContent = 'Moves: 0';
    timeDisplay.textContent = 'Time: 0s';
    winMessage.classList.add('hidden');
    clearInterval(timerInterval);

    // 2. Generate a random, solvable board state
    boardState = generateSolvableBoard();

    // 3. Render the board to the DOM
    renderBoard();
    
    // 4. Start the timer
    startTimer();

    // 5. Attach event listeners for arrow keys
    document.addEventListener('keydown', handleKeyPress);
}

/**
 * Generates a shuffled 1D array that is guaranteed to be solvable.
 * Solvability Logic:
 * * For a 4x4 grid (N is even):
 * - If the number of inversions is ODD, the puzzle is solvable if the empty space (row counting from bottom) is on an EVEN row.
 * - If the number of inversions is EVEN, the puzzle is solvable if the empty space (row counting from bottom) is on an ODD row.
 * * Simplified Rule (N even): Solvable if (Inversions + Empty_Row_from_Bottom) is EVEN.
 * * Inversion Count: The number of times a larger tile precedes a smaller tile.
 */
function generateSolvableBoard() {
    const tiles = Array.from({ length: TOTAL_TILES }, (_, i) => i + 1); // [1, 2, ..., 16]
    let shuffled;
    let inversions;
    let emptyRowFromBottom;
    let isSolvable = false;

    while (!isSolvable) {
        // 1. Basic shuffle (Fisher-Yates)
        shuffled = [...tiles];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // 2. Calculate Inversions
        inversions = 0;
        for (let i = 0; i < TOTAL_TILES - 1; i++) {
            if (shuffled[i] === EMPTY_TILE_VALUE) continue;
            for (let j = i + 1; j < TOTAL_TILES; j++) {
                if (shuffled[j] === EMPTY_TILE_VALUE) continue;
                if (shuffled[i] > shuffled[j]) {
                    inversions++;
                }
            }
        }
        
        // 3. Find Empty Tile Position
        const emptyIndex = shuffled.indexOf(EMPTY_TILE_VALUE);
        // Row index from 0 to 3
        const emptyRow = Math.floor(emptyIndex / BOARD_SIZE);
        // Row index counting from the bottom (1-indexed: 4, 3, 2, 1)
        emptyRowFromBottom = BOARD_SIZE - emptyRow;

        // 4. Solvability Check: (Inversions + Empty_Row_from_Bottom) must be EVEN
        isSolvable = (inversions + emptyRowFromBottom) % 2 === 0;
    }
    
    return shuffled;
}

/**
 * Renders the current boardState array to the DOM.
 */
function renderBoard() {
    boardElement.innerHTML = ''; // Clear existing tiles

    boardState.forEach((value, index) => {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.dataset.value = value;
        tile.dataset.index = index; // Store current position

        if (value === EMPTY_TILE_VALUE) {
            tile.classList.add('empty-tile');
            tile.textContent = ''; // Empty text
        } else {
            tile.textContent = value;
            tile.addEventListener('click', handleTileClick);
        }

        boardElement.appendChild(tile);
    });
}

/**
 * Handles the logic for moving a tile when clicked.
 * @param {Event} event - The click event.
 */
function handleTileClick(event) {
    if (!isGameRunning) return;
    
    const clickedTile = event.target;
    // Current 1D index of the clicked tile
    const tileIndex = parseInt(clickedTile.dataset.index);
    
    // Find the current 1D index of the empty tile (value 16)
    const emptyIndex = boardState.indexOf(EMPTY_TILE_VALUE);
    
    // Check if the clicked tile is adjacent to the empty space
    if (isAdjacent(tileIndex, emptyIndex)) {
        swapTiles(tileIndex, emptyIndex);
        checkWinCondition();
    }
}

/**
 * Handles tile movement using Arrow Keys.
 * @param {Event} event - The keydown event.
 */
function handleKeyPress(event) {
    if (!isGameRunning) return;
    
    const emptyIndex = boardState.indexOf(EMPTY_TILE_VALUE);
    let targetIndex = -1;

    switch (event.key) {
        case 'ArrowUp':
            // The tile *above* the empty space moves *down* into the empty space.
            targetIndex = emptyIndex + BOARD_SIZE; 
            break;
        case 'ArrowDown':
            // The tile *below* the empty space moves *up* into the empty space.
            targetIndex = emptyIndex - BOARD_SIZE;
            break;
        case 'ArrowLeft':
            // The tile to the *left* of the empty space moves *right* into the empty space.
            targetIndex = emptyIndex + 1;
            break;
        case 'ArrowRight':
            // The tile to the *right* of the empty space moves *left* into the empty space.
            targetIndex = emptyIndex - 1;
            break;
        default:
            return; // Ignore other keys
    }
    
    // Prevent default scrolling behavior for arrow keys
    event.preventDefault(); 
    
    if (targetIndex >= 0 && targetIndex < TOTAL_TILES) {
        // Must also ensure the move is valid (e.g., preventing wraps from right to left)
        if (isAdjacent(targetIndex, emptyIndex)) {
             swapTiles(targetIndex, emptyIndex);
             checkWinCondition();
        }
    }
}

/**
 * Checks if two indices in the 1D array correspond to adjacent positions in the 2D grid.
 * @param {number} idx1 - First index.
 * @param {number} idx2 - Second index.
 * @returns {boolean} True if adjacent.
 */
function isAdjacent(idx1, idx2) {
    const row1 = Math.floor(idx1 / BOARD_SIZE);
    const col1 = idx1 % BOARD_SIZE;
    const row2 = Math.floor(idx2 / BOARD_SIZE);
    const col2 = idx2 % BOARD_SIZE;

    // Adjacent if rows are the same and columns differ by 1 (horizontal move)
    // OR if columns are the same and rows differ by 1 (vertical move)
    const isHorizontal = row1 === row2 && Math.abs(col1 - col2) === 1;
    const isVertical = col1 === col2 && Math.abs(row1 - row2) === 1;

    return isHorizontal || isVertical;
}

/**
 * Swaps the values of two tiles in the boardState array and updates the DOM.
 * @param {number} tileIndex - Index of the tile being moved.
 * @param {number} emptyIndex - Index of the empty space.
 */
function swapTiles(tileIndex, emptyIndex) {
    // 1. Update the 1D state array
    [boardState[tileIndex], boardState[emptyIndex]] = 
    [boardState[emptyIndex], boardState[tileIndex]];

    // 2. Update the DOM elements' positions/values
    const tileElement = boardElement.children[tileIndex];
    const emptyElement = boardElement.children[emptyIndex];
    
    // Swap the elements in the DOM (this is the cleanest way to move them visually)
    boardElement.insertBefore(tileElement, emptyElement);
    boardElement.insertBefore(emptyElement, boardElement.children[tileIndex]);
    
    // Re-assign the data-index attribute to reflect the new position for click handler
    tileElement.dataset.index = emptyIndex;
    emptyElement.dataset.index = tileIndex;
    
    // 3. Update moves count
    moves++;
    movesDisplay.textContent = `Moves: ${moves}`;
}

/**
 * Starts the game timer.
 */
function startTimer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        timeDisplay.textContent = `Time: ${timeElapsed}s`;
    }, 1000);
}

/**
 * Checks if the board is in the solved state (1, 2, 3, ..., 15, 16).
 */
function checkWinCondition() {
    const isSolved = boardState.every((value, index) => value === index + 1);

    if (isSolved) {
        clearInterval(timerInterval);
        isGameRunning = false;
        
        // Remove keyboard listener
        document.removeEventListener('keydown', handleKeyPress);

        // Display win message
        finalMovesSpan.textContent = moves;
        finalTimeSpan.textContent = timeElapsed;
        winMessage.classList.remove('hidden');
    }
}

// --- Event Listeners ---
resetButton.addEventListener('click', initializeBoard);
playAgainButton.addEventListener('click', initializeBoard);


// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', initializeBoard);