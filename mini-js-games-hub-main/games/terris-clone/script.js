// --- Canvas Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextPieceCanvas');
const nextCtx = nextCanvas.getContext('2d');

// --- DOM Elements ---
const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');
const startButton = document.getElementById('start-button');
const gameOverMessage = document.getElementById('game-over-message');
const finalScoreSpan = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// --- Game Configuration ---
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30; // 300px width / 10 cols = 30px
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// --- Tetrominoes (Shapes) ---
// Each color is tied to the block type/index. 0 is empty.
const COLORS = [
    '#000000', // 0: Empty/Black
    '#00FFFF', // 1: I (Cyan)
    '#0000FF', // 2: J (Blue)
    '#FFA500', // 3: L (Orange)
    '#FFFF00', // 4: O (Yellow)
    '#008000', // 5: S (Green)
    '#800080', // 6: T (Purple)
    '#FF0000', // 7: Z (Red)
];

// Shapes represented as 4x4 matrices (using color index 1-7)
const SHAPES = [
    null, // Index 0 is null/empty
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0, 0], [2, 2, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // J
    [[0, 0, 3, 0], [3, 3, 3, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // L
    [[0, 4, 4, 0], [0, 4, 4, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // O
    [[0, 5, 5, 0], [5, 5, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // S
    [[0, 6, 0, 0], [6, 6, 6, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // T
    [[7, 7, 0, 0], [0, 7, 7, 0], [0, 0, 0, 0], [0, 0, 0, 0]], // Z
];

// --- Game State Variables ---
let board; // The main 2D grid (COLS x ROWS)
let currentPiece; // The currently falling piece object
let nextPiece;    // The piece to fall next
let score = 0;
let lines = 0;
let level = 1;
let dropCounter = 0;
let dropInterval = 1000; // Time in ms between automatic drops
let lastTime = 0;
let isGameOver = false;

// --- Piece Class ---
class Piece {
    constructor(shapeIndex) {
        this.shapeIndex = shapeIndex;
        this.matrix = SHAPES[shapeIndex];
        // Starting position: top row, center column
        this.x = Math.floor(COLS / 2) - Math.floor(this.matrix[0].length / 2);
        this.y = 0;
    }
}

// --- Core Game Functions ---

/**
 * Creates the initial empty game grid.
 * @returns {Array<Array<number>>} The 2D grid array.
 */
function createBoard() {
    const matrix = [];
    while (matrix.length < ROWS) {
        matrix.push(new Array(COLS).fill(0));
    }
    return matrix;
}

/**
 * Gets a random piece (1-7) and returns a new Piece object.
 * @returns {Piece} A new Tetromino piece.
 */
function getRandomPiece() {
    const randIndex = Math.floor(Math.random() * (SHAPES.length - 1)) + 1; // 1 to 7
    return new Piece(randIndex);
}

/**
 * Draws a single block on the canvas.
 * @param {number} x - Column index.
 * @param {number} y - Row index.
 * @param {number} colorIndex - Index into the COLORS array.
 */
function drawBlock(ctxToUse, x, y, colorIndex) {
    if (colorIndex === 0) return; // Don't draw empty space

    const color = COLORS[colorIndex];
    ctxToUse.fillStyle = color;
    ctxToUse.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Add border/highlight for depth
    ctxToUse.strokeStyle = '#fff';
    ctxToUse.lineWidth = 1;
    ctxToUse.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

/**
 * Main drawing function to render the board and the current piece.
 */
function draw() {
    // 1. Clear main canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw static blocks on the board
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            drawBlock(ctx, x, y, value);
        });
    });

    // 3. Draw the falling piece
    currentPiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, value);
            }
        });
    });
}

/**
 * Draws the next piece in the side panel.
 */
function drawNextPiece() {
    nextCtx.fillStyle = '#eee';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    nextPiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Center the piece in the preview box
                const offsetX = (nextCanvas.width / 2) - (nextPiece.matrix[0].length / 2 * BLOCK_SIZE) + BLOCK_SIZE/2;
                const offsetY = (nextCanvas.height / 2) - (nextPiece.matrix.length / 2 * BLOCK_SIZE);
                
                // Use a smaller block size for the preview (15px)
                const PREVIEW_BLOCK_SIZE = BLOCK_SIZE / 2;
                
                const color = COLORS[value];
                nextCtx.fillStyle = color;
                nextCtx.fillRect(
                    offsetX + x * PREVIEW_BLOCK_SIZE, 
                    offsetY + y * PREVIEW_BLOCK_SIZE, 
                    PREVIEW_BLOCK_SIZE, 
                    PREVIEW_BLOCK_SIZE
                );
            }
        });
    });
}


// --- Collision and Movement ---

/**
 * Checks if the current piece can be placed at its current (x, y) coordinates
 * without colliding with the static board or walls.
 * @param {Array<Array<number>>} matrix - The piece's matrix.
 * @param {number} offsetX - The piece's x position.
 * @param {number} offsetY - The piece's y position.
 * @returns {boolean} True if a collision exists, false otherwise.
 */
function checkCollision(matrix, offsetX, offsetY) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < matrix[y].length; ++x) {
            if (matrix[y][x] !== 0) {
                const boardY = offsetY + y;
                const boardX = offsetX + x;
                
                // Check if block is outside the board (top/bottom/sides)
                if (boardY < 0 || boardY >= ROWS || boardX < 0 || boardX >= COLS) {
                    return true;
                }
                
                // Check collision with other static blocks
                if (board[boardY] && board[boardY][boardX] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * Locks the current piece into the static board when it hits the bottom or another piece.
 */
function mergePiece() {
    currentPiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[currentPiece.y + y][currentPiece.x + x] = value;
            }
        });
    });

    // Check for game over (if the piece merged above the top of the well)
    if (currentPiece.y < 0) {
        isGameOver = true;
        endGame();
        return;
    }

    // Set the new falling piece
    currentPiece = nextPiece;
    nextPiece = getRandomPiece();
    drawNextPiece();
    
    // Check for an immediate collision for the new piece (Game Over)
    if (checkCollision(currentPiece.matrix, currentPiece.x, currentPiece.y)) {
        isGameOver = true;
        endGame();
    }
}

/**
 * Moves the current piece horizontally (left or right).
 * @param {number} direction - -1 for left, 1 for right.
 */
function movePiece(direction) {
    if (isGameOver) return;
    currentPiece.x += direction;
    if (checkCollision(currentPiece.matrix, currentPiece.x, currentPiece.y)) {
        // Revert move if collision occurs
        currentPiece.x -= direction;
    }
}

/**
 * Rotates the piece's matrix 90 degrees clockwise and handles wall kicks/collision.
 */
function rotatePiece() {
    if (isGameOver) return;
    const oldMatrix = currentPiece.matrix;
    const p = currentPiece;

    // 1. Matrix Transposition (swap rows and columns)
    for (let y = 0; y < p.matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [p.matrix[x][y], p.matrix[y][x]] = [p.matrix[y][x], p.matrix[x][y]];
        }
    }

    // 2. Reverse each row (to complete the 90-degree rotation)
    p.matrix.forEach(row => row.reverse());
    
    // 3. Collision check and Wall Kick
    // Try to nudge the piece away from a collision (basic wall kick)
    let offset = 1;
    while (checkCollision(p.matrix, p.x, p.y)) {
        p.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1)); // Try +1, -2, +3, -4...
        if (offset > p.matrix[0].length) {
            // Revert rotation if wall kick fails
            p.matrix = oldMatrix; 
            p.x = p.x - (offset - 1); // Revert last successful offset
            return;
        }
    }
}

/**
 * Handles the automatic or forced downward movement of the piece.
 * @param {number} [speed=1] - Multiplier for score calculation on soft drops.
 */
function dropPiece(speed = 1) {
    if (isGameOver) return;
    currentPiece.y++;
    
    if (checkCollision(currentPiece.matrix, currentPiece.x, currentPiece.y)) {
        currentPiece.y--; // Revert move
        mergePiece();
        checkLines();
    } else if (speed > 1) {
        // Add score for soft drop (player pushing down)
        score += speed;
        updateScore();
    }
    dropCounter = 0; // Reset drop counter after a successful or failed drop
}

// --- Line Clearance and Scoring ---

/**
 * Checks for and clears any completed lines, then updates the score.
 */
function checkLines() {
    let linesCleared = 0;
    
    // Iterate from the bottom row up
    outer: for (let y = ROWS - 1; y >= 0; --y) {
        // Check if the row is full (no 0s)
        for (let x = 0; x < COLS; ++x) {
            if (board[y][x] === 0) {
                continue outer; // Not a full line, move to the next row up
            }
        }

        // Line is full: Clear the line and shift everything above it down
        const row = board.splice(y, 1)[0].fill(0); // Remove the full row
        board.unshift(row); // Add a new empty row to the top
        y++; // Re-check the current row index, as it now contains the row that was just above the cleared one
        
        linesCleared++;
    }

    if (linesCleared > 0) {
        lines += linesCleared;
        
        // Basic Tetris scoring system: 100 * level * linesCleared^2
        const points = [0, 40, 100, 300, 1200];
        score += points[linesCleared] * level;
        
        updateScore();
        updateLevel();
    }
}

/**
 * Updates the score and line count displays.
 */
function updateScore() {
    scoreElement.textContent = score;
    linesElement.textContent = lines;
}

/**
 * Updates the game level and drop speed based on lines cleared.
 */
function updateLevel() {
    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel > level) {
        level = newLevel;
        // Increase drop speed: e.g., 50ms faster per level
        dropInterval = Math.max(100, 1000 - (level - 1) * 50);
        console.log(`Level Up! Level: ${level}, Drop Interval: ${dropInterval}ms`);
    }
}

/**
 * Game over handler.
 */
function endGame() {
    cancelAnimationFrame(lastTime);
    finalScoreSpan.textContent = score;
    gameOverMessage.classList.remove('hidden');
    // Remove controls listeners
    document.removeEventListener('keydown', handleKeyPress);
}

// --- Game Initialization and Loop ---

/**
 * Resets the game state and starts the main loop.
 */
function startGame() {
    board = createBoard();
    currentPiece = getRandomPiece();
    nextPiece = getRandomPiece();
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 1000;
    isGameOver = false;
    updateScore();
    drawNextPiece();
    gameOverMessage.classList.add('hidden');
    startButton.classList.add('hidden'); // Hide start button
    
    // Add controls listeners
    document.addEventListener('keydown', handleKeyPress);

    // Start the game loop
    requestAnimationFrame(update);
}

/**
 * The main update loop for falling blocks and timing.
 * @param {DOMHighResTimeStamp} time - The current time provided by rAF.
 */
function update(time = 0) {
    if (isGameOver) return;
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    
    // Check if it's time for the automatic drop
    if (dropCounter > dropInterval) {
        dropPiece();
    }

    draw();
    requestAnimationFrame(update);
}

// --- Event Handlers (Controls) ---

function handleKeyPress(e) {
    if (isGameOver) return;

    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            movePiece(-1);
            break;
        case 'ArrowRight':
            e.preventDefault();
            movePiece(1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            // Soft drop: move down faster and get some points
            dropPiece(5); 
            break;
        case 'ArrowUp':
        case 'x':
        case 'X':
            e.preventDefault();
            rotatePiece();
            break;
        case 'z':
        case 'Z':
            e.preventDefault();
            // Reverse rotation (optional, but good practice)
            // For simplicity, we'll keep it as rotate for now, or you could implement a dedicated reverse rotation here.
            rotatePiece(); 
            break;
    }
}

// --- Initial Setup and Button Listeners ---
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Draw the initial board (empty)
document.addEventListener('DOMContentLoaded', () => {
    board = createBoard();
    // Use an empty piece for initial draw before game starts
    currentPiece = new Piece(1);
    currentPiece.matrix = [[0]];
    nextPiece = new Piece(1);
    drawNextPiece();
    draw();
});