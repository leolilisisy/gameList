// --- Game Constants ---
const GAME_DURATION = 30; // seconds
const HOLE_COUNT = 9;
const MIN_MOLE_UP_TIME = 800; // milliseconds
const MAX_MOLE_UP_TIME = 1500; // milliseconds
const MIN_MOLE_DELAY = 500; // milliseconds before mole pops up next
const MAX_MOLE_DELAY = 2000;

// --- DOM Elements ---
const gameBoardEl = document.getElementById('game-board');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const startButton = document.getElementById('start-button');
const messageEl = document.getElementById('message');
const gameContainer = document.getElementById('game-container');

// --- Game State Variables ---
let score = 0;
let timeLeft = GAME_DURATION;
let gameInterval; // Interval for the main timer
let moleTimers = []; // Array to hold individual mole interval/timeouts
let holes = []; // Array of DOM hole elements

// --- Utility Functions ---

/**
 * Generates a random integer within a range.
 * @param {number} min - The minimum value (inclusive).
 * @param {number} max - The maximum value (inclusive).
 * @returns {number} A random integer.
 */
function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Finds a random hole that is currently NOT active (mole is down).
 * @returns {number} The index of a random, available hole.
 */
function pickRandomHole() {
    // Filter for holes that are not 'up'
    const availableIndices = holes
        .map((hole, index) => hole.classList.contains('up') ? -1 : index)
        .filter(index => index !== -1);
        
    if (availableIndices.length === 0) {
        return -1; // No holes available
    }

    const randomIndex = randomRange(0, availableIndices.length - 1);
    return availableIndices[randomIndex];
}

// --- Game Logic ---

/**
 * Makes a mole pop up in a specified hole for a set duration.
 * @param {number} index - The index of the hole to use.
 */
function popUpMole(index) {
    const hole = holes[index];
    const mole = hole.querySelector('.mole');

    // 1. Mole pops up
    hole.classList.add('up');

    // 2. Set timer for mole to go down (moleUpTime)
    const moleUpTime = randomRange(MIN_MOLE_UP_TIME, MAX_MOLE_UP_TIME);
    
    const downTimer = setTimeout(() => {
        // Mole goes down if it wasn't whacked
        hole.classList.remove('up');
        mole.classList.remove('whacked'); // Ensure whacked class is gone

        // 3. Set timer for the next time a mole should pop up in this hole (moleDelay)
        const moleDelay = randomRange(MIN_MOLE_DELAY, MAX_MOLE_DELAY);
        moleTimers[index] = setTimeout(() => {
            if (gameInterval) { // Only continue spawning if the game is still running
                popUpMole(index);
            }
        }, moleDelay);

    }, moleUpTime);

    // Store the timeout ID so we can clear it if the mole is whacked
    moleTimers[index] = downTimer;
}

/**
 * Spawns moles across the board by initializing the timers for all holes.
 */
function startMoleSpawning() {
    // Start initial mole pop-ups for all holes with a random delay
    for (let i = 0; i < HOLE_COUNT; i++) {
        const initialDelay = randomRange(500, 3000);
        moleTimers[i] = setTimeout(() => {
            if (gameInterval) {
                 popUpMole(i);
            }
        }, initialDelay);
    }
}


/**
 * Handles the click event on a mole hole.
 * @param {number} index - The index of the hole clicked.
 */
function whack(index) {
    if (!gameInterval) return; // Ignore clicks if game hasn't started or is over
    
    const hole = holes[index];
    const mole = hole.querySelector('.mole');

    if (hole.classList.contains('up')) {
        // Successful whack!
        score++;
        scoreEl.textContent = score;
        
        // Stop the mole's 'down' timer (it was whacked early)
        clearTimeout(moleTimers[index]);

        // Visual feedback
        mole.classList.add('whacked');
        hole.classList.remove('up');
        
        // Restart the spawning cycle for this mole after a brief pause
        const restartDelay = 500;
        moleTimers[index] = setTimeout(() => {
            mole.classList.remove('whacked');
            if (gameInterval) {
                popUpMole(index);
            }
        }, restartDelay);

    } else {
        // Missed, optional penalty or visual feedback can go here
        messageEl.textContent = "Missed!";
        setTimeout(() => messageEl.textContent = "Hit the moles before they disappear!", 500);
    }
}

/**
 * Manages the main game timer countdown.
 */
function startTimer() {
    gameInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(gameInterval);
            gameInterval = null;
            gameOver();
        }
    }, 1000);
}

/**
 * Initializes the game state and starts the action.
 */
function startGame() {
    if (gameInterval) return; // Already running

    // Reset State
    score = 0;
    timeLeft = GAME_DURATION;
    scoreEl.textContent = score;
    timerEl.textContent = timeLeft;
    gameContainer.classList.remove('game-stopped');
    startButton.textContent = "Whack!";
    messageEl.textContent = "Hit the moles before they disappear!";

    // Clear any previous timers
    moleTimers.forEach(timer => clearTimeout(timer));
    moleTimers = [];

    startTimer();
    startMoleSpawning();
}

/**
 * Ends the game and displays the results.
 */
function gameOver() {
    // Stop all mole spawning/despawning cycles
    moleTimers.forEach(timer => clearTimeout(timer));
    moleTimers = [];
    
    gameContainer.classList.add('game-stopped');
    startButton.textContent = "Play Again";
    messageEl.textContent = `Time's Up! Final Score: ${score}!`;
}

/**
 * Initial setup: creates the hole DOM elements.
 */
function createBoard() {
    for (let i = 0; i < HOLE_COUNT; i++) {
        const hole = document.createElement('div');
        hole.classList.add('hole');
        hole.dataset.index = i;

        const mole = document.createElement('div');
        mole.classList.add('mole');
        
        hole.appendChild(mole);
        gameBoardEl.appendChild(hole);
        
        // Add click listener
        hole.addEventListener('click', () => whack(i));
        
        holes.push(hole);
    }
    gameContainer.classList.add('game-stopped'); // Initially stop interaction
}

// --- Initialization and Event Listeners ---
startButton.addEventListener('click', startGame);
createBoard();