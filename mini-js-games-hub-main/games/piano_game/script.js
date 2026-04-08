const gameContainer = document.getElementById('game-container');
const tileArea = document.getElementById('tile-area');
const scoreDisplay = document.getElementById('score');
const messageDisplay = document.getElementById('message');
const startButton = document.getElementById('start-button');
const targetLine = document.getElementById('target-line');

// Game constants
const TILE_WIDTH = 50;
const TILE_HEIGHT = 50;
// Must match --tile-fall-duration in CSS, but in milliseconds
const FALL_DURATION_MS = 2000; 
const TARGET_LINE_BOTTOM = 50; // Must match bottom in CSS for target-line
const HIT_TOLERANCE_PX = 10; // How close to the line the tile must be clicked

let score = 0;
let isGameRunning = false;
let tileCreationInterval;

// --- Utility Function to Get Tile Position ---
/**
 * Calculates the current bottom position of a falling tile.
 * @param {HTMLElement} tile The tile element.
 * @returns {number} The distance from the bottom of the game-container to the bottom of the tile.
 */
function getTileBottomPosition(tile) {
    const gameHeight = gameContainer.clientHeight;
    // Get the current vertical translation value from the CSS 'transform'
    const style = window.getComputedStyle(tile);
    const matrix = new DOMMatrixReadOnly(style.transform);
    const currentY = matrix.m42; // Y-translation component

    // The animation is from 0 (top) to (gameHeight - TILE_HEIGHT) (bottom)
    // Distance from the top of the container to the top of the tile is currentY
    // Distance from the bottom of the container to the bottom of the tile is:
    // (gameHeight) - (currentY + TILE_HEIGHT)
    return gameHeight - (currentY + TILE_HEIGHT);
}


// --- Game Core Logic ---

/**
 * Creates and starts the animation for a new falling tile.
 */
function createFallingTile() {
    if (!isGameRunning) return;

    const newTile = document.createElement('div');
    newTile.classList.add('tile');
    
    // Random horizontal position
    const maxLeft = tileArea.clientWidth - TILE_WIDTH;
    const randomLeft = Math.floor(Math.random() * (maxLeft / TILE_WIDTH)) * TILE_WIDTH; 
    newTile.style.left = `${randomLeft}px`;
    
    // Add click listener
    newTile.addEventListener('click', () => handleTileClick(newTile));

    tileArea.appendChild(newTile);
    
    // Start the falling animation after a brief delay to ensure it's in the DOM
    setTimeout(() => {
        newTile.classList.add('falling');
    }, 50); 
    
    // Set a timeout for when the tile should have reached the target line
    const hitTime = FALL_DURATION_MS;
    setTimeout(() => {
        checkMissedTile(newTile);
    }, hitTime);
}

/**
 * Handles the player clicking a tile.
 * @param {HTMLElement} tile The tile element that was clicked.
 */
function handleTileClick(tile) {
    if (!isGameRunning || !tile.classList.contains('falling')) return;

    const tileBottom = getTileBottomPosition(tile);

    // Check if the tile is within the hit tolerance of the target line
    const targetCenter = TARGET_LINE_BOTTOM + (targetLine.clientHeight / 2);
    const tileBottomCenter = tileBottom + (TILE_HEIGHT / 2);

    const distance = Math.abs(tileBottomCenter - targetCenter);

    if (distance <= HIT_TOLERANCE_PX) {
        // HIT!
        score++;
        scoreDisplay.textContent = score;
        tile.remove(); // Remove the tile on hit
        // Optional: brief visual feedback
        gameContainer.style.borderColor = '#00ffaa'; 
        setTimeout(() => gameContainer.style.borderColor = '#61dafb', 100);

    } else {
        // MISS! Clicked too early or too late
        tile.style.backgroundColor = 'red';
        tile.removeEventListener('click', handleTileClick); // Prevent double-loss
        endGame('Missed the target window! Game Over.');
    }
}

/**
 * Checks if a tile was missed by reaching the end of its animation.
 * @param {HTMLElement} tile The tile element to check.
 */
function checkMissedTile(tile) {
    // If the tile is still in the DOM and the game is running, it was missed
    if (isGameRunning && tileArea.contains(tile)) {
        tile.style.backgroundColor = 'red';
        endGame('A tile was missed! Game Over.');
    }
}

/**
 * Starts the game loop.
 */
function startGame() {
    score = 0;
    scoreDisplay.textContent = score;
    messageDisplay.textContent = 'Game On!';
    isGameRunning = true;
    startButton.style.display = 'none';
    
    // Clear any previous tiles
    tileArea.innerHTML = ''; 

    // Start generating tiles every 1.5 seconds
    tileCreationInterval = setInterval(createFallingTile, 1500); 
}

/**
 * Ends the game and displays the final score.
 * @param {string} message The game over message to display.
 */
function endGame(message) {
    isGameRunning = false;
    clearInterval(tileCreationInterval);
    messageDisplay.textContent = `${message} Final Score: ${score}`;
    startButton.textContent = 'Play Again';
    startButton.style.display = 'block';

    // Stop all falling tiles immediately
    document.querySelectorAll('.tile.falling').forEach(tile => {
        tile.style.animationPlayState = 'paused';
        tile.style.cursor = 'default';
        tile.removeEventListener('click', handleTileClick);
    });
}


// --- Event Listener ---
startButton.addEventListener('click', startGame);