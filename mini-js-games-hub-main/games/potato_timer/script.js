document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements ---
    const startButton = document.getElementById('start-button');
    const passButton = document.getElementById('pass-button');
    const messageDisplay = document.getElementById('message');
    const statusDisplay = document.getElementById('status-display');

    // --- 2. Game Variables ---
    let timerId = null; // Will hold the ID returned by setTimeout
    const MIN_TIME_MS = 3000; // Minimum countdown time (3 seconds)
    const MAX_TIME_MS = 8000; // Maximum countdown time (8 seconds)

    // --- 3. Functions ---

    /**
     * Generates a random integer time (in milliseconds) within the defined range.
     * @returns {number} The random time in milliseconds.
     */
    function getRandomTime() {
        // Formula: Math.random() * (max - min) + min
        return Math.floor(Math.random() * (MAX_TIME_MS - MIN_TIME_MS + 1)) + MIN_TIME_MS;
    }

    /**
     * Sets the game state to 'playing' and starts the random countdown.
     */
    function startGame() {
        // Reset and prepare UI
        messageDisplay.textContent = '🔥 The potato is HOT! PASS it quick!';
        statusDisplay.classList.add('hot');
        startButton.disabled = true;
        passButton.disabled = false;

        // 1. Get a random time limit
        const randomTime = getRandomTime();
        console.log(`New countdown set for ${randomTime / 1000} seconds.`);

        // 2. Start the timer (the "explosion" countdown)
        timerId = setTimeout(() => {
            handleExplosion();
        }, randomTime);
    }

    /**
     * Executes when the timer runs out. The player loses.
     */
    function handleExplosion() {
        // Clear the timer (though it has already executed, this is good practice)
        clearTimeout(timerId);
        
        // Update UI for explosion state
        messageDisplay.textContent = '💥 BOOM! The potato exploded! You were too slow!';
        messageDisplay.style.color = '#ff4500'; // Set text color to red/orange
        statusDisplay.classList.remove('hot');
        statusDisplay.style.backgroundColor = '#4a0000'; // Make background darker
        
        // Reset controls
        startButton.textContent = 'PLAY AGAIN';
        startButton.disabled = false;
        passButton.disabled = true;
    }

    /**
     * Executes when the "Pass" button is clicked. The player survives this round.
     */
    function handlePass() {
        if (!timerId) return; // Ignore clicks if the game isn't running

        // 1. Stop the current timer (successfully passed)
        clearTimeout(timerId);
        timerId = null;

        // 2. Update UI for successful pass
        messageDisplay.textContent = '✅ Phew! You passed the potato!';
        messageDisplay.style.color = '#4CAF50'; // Set text color to green
        statusDisplay.classList.remove('hot');
        statusDisplay.style.backgroundColor = '#1a1a1a';
        
        // 3. Reset controls and prepare for next round
        startButton.textContent = 'START NEXT ROUND';
        startButton.disabled = false;
        passButton.disabled = true;
    }

    // --- 4. Event Listeners ---

    startButton.addEventListener('click', startGame);
    passButton.addEventListener('click', handlePass);
});