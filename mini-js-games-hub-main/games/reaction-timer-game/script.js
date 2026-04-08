// --- DOM Elements ---
const gameArea = document.getElementById('game-area');
const messageDisplay = document.getElementById('message');
const scoreDisplay = document.getElementById('score-display');

// --- Game State Variables ---
let currentState = 'start'; // 'start', 'wait', 'ready', 'result'
let timeoutId;
let startTime; // Stores the time when the screen turned green (Ready state)

// --- Helper Functions ---

/**
 * Changes the game state and updates the UI accordingly.
 * @param {string} newState - The new state ('start', 'wait', 'ready', 'result').
 */
function updateState(newState) {
    // Clean up old class and set the new one
    gameArea.className = '';
    gameArea.classList.add(newState);

    currentState = newState;

    // Update the on-screen message based on the state
    switch (newState) {
        case 'start':
            messageDisplay.textContent = 'Click anywhere to start.';
            break;
        case 'wait':
            messageDisplay.textContent = 'Wait for green...';
            break;
        case 'ready':
            // Record the precise time when the screen turns green
            startTime = performance.now();
            messageDisplay.textContent = 'CLICK NOW!';
            break;
        case 'result':
            // The message is set inside the handleClick function when a score is calculated
            break;
    }
}

/**
 * Initiates the waiting period and sets a random delay before turning green.
 */
function startWaitPhase() {
    // Clear any previous timeout to be safe
    clearTimeout(timeoutId);

    updateState('wait');

    // Generate a random delay between 1.5 and 4 seconds (1500ms to 4000ms)
    const randomDelay = Math.random() * (4000 - 1500) + 1500;

    // Set a timeout to change the state to 'ready' after the random delay
    timeoutId = setTimeout(() => {
        updateState('ready');
    }, randomDelay);
}


/**
 * Main game control function, called on every click/tap.
 */
function handleClick() {
    switch (currentState) {
        case 'start':
            // From the initial screen, start the waiting phase
            startWaitPhase();
            break;

        case 'wait':
            // Penalty for clicking before the screen turns green
            clearTimeout(timeoutId); // Stop the timer
            updateState('result');
            messageDisplay.textContent = 'TOO SOON! ⛔ Click to try again.';
            scoreDisplay.textContent = 'Your last score: Early Click Penalty!';
            break;

        case 'ready':
            // Player clicked at the right time! Calculate the score.
            const endTime = performance.now();
            const reactionTime = Math.round(endTime - startTime); // Round to nearest millisecond

            updateState('result');
            messageDisplay.textContent = `Your time: ${reactionTime} ms!`;
            scoreDisplay.textContent = `Your last score: ${reactionTime} ms`;
            break;

        case 'result':
            // From the result screen, reset to the initial state to play again
            updateState('start');
            break;
    }
}

// Initialize the game on load
updateState('start');