document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements ---
    const gameButtons = document.querySelectorAll('.game-button');
    const startButton = document.getElementById('start-button');
    const levelDisplay = document.getElementById('level-display');
    const lengthDisplay = document.getElementById('length-display');
    const feedbackMessage = document.getElementById('feedback-message');

    // --- 2. GAME STATE VARIABLES ---
    let sequence = [];      // The computer's sequence of button IDs (e.g., [2, 1, 4])
    let playerSequence = [];// The sequence the player has clicked so far
    let level = 1;
    let gameActive = false;
    let playingSequence = false; // Flag to prevent player clicks during playback
    
    // Timing variables
    let playbackDuration = 800; // Duration each button is lit up (decreases with level)
    let maxClickTime = 1500;    // Max time allowed between player clicks (decreases with level)
    let clickTimeoutId = null;  // ID for the player click timer

    // --- 3. CORE LOGIC FUNCTIONS ---

    /**
     * Initializes the game for the first time or after a restart.
     */
    function initGame() {
        level = 1;
        gameActive = true;
        sequence = [];
        playerSequence = [];
        playbackDuration = 800;
        maxClickTime = 1500;
        
        startButton.textContent = 'RESTART';
        startButton.disabled = true;
        
        updateStatus();
        nextRound();
    }

    /**
     * Advances to the next round by increasing the sequence length and difficulty.
     */
    function nextRound() {
        stopClickTimer();
        playerSequence = [];
        playingSequence = true;
        disablePlayerInput();
        
        // Add a new random button ID (1-4) to the sequence
        const newButtonId = String(Math.floor(Math.random() * 4) + 1);
        sequence.push(newButtonId);
        
        // Increase difficulty every 3 levels
        if (level > 1 && (level - 1) % 3 === 0) {
            playbackDuration = Math.max(250, playbackDuration - 100);
            maxClickTime = Math.max(500, maxClickTime - 200);
            feedbackMessage.textContent = `Difficulty UP! Speed: ${playbackDuration}ms.`;
        } else {
            feedbackMessage.textContent = 'Watch closely...';
        }

        updateStatus();
        playSequence();
    }

    /**
     * Visually and temporally plays back the current sequence.
     */
    function playSequence() {
        let i = 0;
        const sequenceInterval = setInterval(() => {
            if (i < sequence.length) {
                const buttonId = sequence[i];
                lightUpButton(buttonId);
                i++;
            } else {
                // Sequence finished playing
                clearInterval(sequenceInterval);
                playingSequence = false;
                enablePlayerInput();
                feedbackMessage.textContent = 'Your turn! Repeat the sequence.';
                startClickTimer();
            }
        }, playbackDuration * 2); // Interval is twice the light-up duration
    }

    /**
     * Toggles the active class on a button for the playback duration.
     */
    function lightUpButton(buttonId) {
        const button = document.querySelector(`.game-button[data-id="${buttonId}"]`);
        if (button) {
            button.classList.add('active');
            setTimeout(() => {
                button.classList.remove('active');
            }, playbackDuration);
        }
    }

    // --- 4. PLAYER INPUT & VALIDATION ---

    /**
     * Handles the player's button click.
     */
    function handlePlayerClick(event) {
        if (!gameActive || playingSequence) return;
        
        stopClickTimer(); // Reset the timer on every successful click
        
        const clickedId = event.target.getAttribute('data-id');
        const expectedId = sequence[playerSequence.length];

        if (clickedId === expectedId) {
            // Correct click
            playerSequence.push(clickedId);
            feedbackMessage.textContent = `Good! (${playerSequence.length} / ${sequence.length})`;

            if (playerSequence.length === sequence.length) {
                // Full sequence correctly completed!
                level++;
                feedbackMessage.textContent = '🎉 CORRECT! Getting faster...';
                setTimeout(nextRound, 1000); // Start next round after a delay
            } else {
                // Correct but not finished, restart timer for next click
                startClickTimer();
            }
        } else {
            // Incorrect click
            endGame();
        }
    }

    // --- 5. TIMING AND CONTROL ---

    /**
     * Starts the timer for the player's next click.
     */
    function startClickTimer() {
        stopClickTimer(); // Clear any existing timer
        
        // Set a timeout to trigger loss if the player doesn't click in time
        clickTimeoutId = setTimeout(() => {
            endGame('timeout');
        }, maxClickTime);
    }

    /**
     * Stops the player's click timer.
     */
    function stopClickTimer() {
        clearTimeout(clickTimeoutId);
    }

    /**
     * Disables the game buttons during sequence playback.
     */
    function disablePlayerInput() {
        gameButtons.forEach(btn => btn.disabled = true);
    }

    /**
     * Enables the game buttons for player input.
     */
    function enablePlayerInput() {
        gameButtons.forEach(btn => btn.disabled = false);
    }

    /**
     * Updates the status display elements.
     */
    function updateStatus() {
        levelDisplay.textContent = level;
        lengthDisplay.textContent = sequence.length;
    }

    /**
     * Ends the game and resets the interface.
     */
    function endGame(reason) {
        stopClickTimer();
        gameActive = false;
        disablePlayerInput();
        startButton.disabled = false;
        
        if (reason === 'timeout') {
             feedbackMessage.innerHTML = `⏰ **TIME OUT!** You took too long. Final Level: ${level}.`;
        } else {
            feedbackMessage.innerHTML = `❌ **GAME OVER!** Incorrect sequence. Final Level: ${level}.`;
        }
        feedbackMessage.style.color = '#e74c3c';
        
        // Flash all buttons red to signal loss
        gameButtons.forEach(btn => {
            btn.classList.add('active');
            btn.style.backgroundColor = '#c0392b';
        });
        setTimeout(() => {
            gameButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.backgroundColor = ''; // Reset to CSS defined color
            });
        }, 800);
    }

    // --- 6. EVENT LISTENERS ---
    
    startButton.addEventListener('click', initGame);
    
    gameButtons.forEach(button => {
        button.addEventListener('click', handlePlayerClick);
    });

    // Initial setup
    disablePlayerInput();
});