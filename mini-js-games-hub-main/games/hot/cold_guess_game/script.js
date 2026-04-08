// --- DOM Elements ---
const gameGrid = document.getElementById('game-grid');
const hintText = document.getElementById('hint-text');
const guessesCountDisplay = document.getElementById('guesses-count');
const newGameButton = document.getElementById('new-game-button');

// --- Game Constants ---
const GRID_SIZE = 10; // Must match CSS :root variable
const MAX_DISTANCE = Math.sqrt((GRID_SIZE - 1) ** 2 + (GRID_SIZE - 1) ** 2);
const HIT_TOLERANCE = 0; // Exactly on the target

// --- Game State Variables ---
let targetPos = { x: -1, y: -1 }; // Hidden target coordinates
let guesses = 0;
let lastDistance = MAX_DISTANCE;
let isGameRunning = true;

// --- Core Game Logic ---

/**
 * Calculates the Euclidean distance between two points (a, b).
 * Distance = sqrt((x2-x1)^2 + (y2-y1)^2)
 * @param {{x: number, y: number}} p1 First coordinate.
 * @param {{x: number, y: number}} p2 Second coordinate (the target).
 * @returns {number} The Euclidean distance.
 */
function calculateDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    // We use distance squared to avoid the expensive Math.sqrt() 
    // for comparisons, but calculate the full distance for display/hit check.
    return Math.sqrt(dx * dx + dy * dy); 
}

/**
 * Initializes the game grid structure.
 */
function createGrid() {
    gameGrid.innerHTML = '';
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener('click', handleGuess);
            gameGrid.appendChild(cell);
        }
    }
}

/**
 * Handles the player's guess on a grid cell.
 * @param {Event} event The click event.
 */
function handleGuess(event) {
    if (!isGameRunning) return;

    const cell = event.target;
    const guessPos = {
        x: parseInt(cell.dataset.x),
        y: parseInt(cell.dataset.y)
    };
    
    // Clear previous last guess highlight
    const prevCell = document.querySelector('.last-guess');
    if (prevCell) {
        prevCell.classList.remove('last-guess');
    }
    
    // Highlight the current guess
    cell.classList.add('last-guess');

    guesses++;
    guessesCountDisplay.textContent = guesses;

    const currentDistance = calculateDistance(guessPos, targetPos);

    // 1. Check for Win Condition
    if (currentDistance <= HIT_TOLERANCE) {
        winGame(cell);
        return;
    }

    // 2. Determine Hint
    let hint = '';
    let color = '';

    if (currentDistance < lastDistance) {
        hint = "🔥 WARMEEER! You're getting closer!";
        color = '#bf616a'; // Red/Hot
    } else if (currentDistance > lastDistance) {
        hint = "🥶 COLDERRR. You moved farther away.";
        color = '#5e81ac'; // Blue/Cold
    } else {
        hint = "💧 SAME DISTANCE. Try another direction.";
        color = '#ebcb8b'; // Yellow/Neutral
    }

    hintText.textContent = hint;
    hintText.style.color = color;

    // Update the distance for the next comparison
    lastDistance = currentDistance; 
}

/**
 * Ends the game on a win.
 * @param {HTMLElement} finalCell The cell where the target was found.
 */
function winGame(finalCell) {
    isGameRunning = false;
    finalCell.classList.add('target');
    hintText.textContent = `🎯 FOUND IT in ${guesses} guesses!`;
    hintText.style.color = '#a3be8c';
    
    // Optional: Reveal the coordinates
    console.log(`Target was at (${targetPos.x}, ${targetPos.y})`);

    // Disable further clicks on the grid
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.removeEventListener('click', handleGuess);
        cell.style.cursor = 'default';
    });
}


// --- Game State Management ---

/**
 * Generates a random coordinate within the grid bounds.
 * @returns {{x: number, y: number}} A random coordinate object.
 */
function getRandomPosition() {
    return {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
    };
}

/**
 * Sets up a new game.
 */
function newGame() {
    isGameRunning = true;
    guesses = 0;
    targetPos = getRandomPosition();
    lastDistance = MAX_DISTANCE; // Reset to the farthest possible distance
    
    guessesCountDisplay.textContent = guesses;
    hintText.textContent = "Click anywhere on the grid to start!";
    hintText.style.color = '#fff';
    
    // Re-enable/reset grid cells
    createGrid(); 
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.style.cursor = 'pointer';
    });

    console.log("New game started. Target is hidden.");
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    newGameButton.addEventListener('click', newGame);
    newGame(); // Start the first game automatically
});