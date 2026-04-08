document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements & Constants ---
    const clickTarget = document.getElementById('click-target');
    const messageDisplay = document.getElementById('message');
    const startButton = document.getElementById('start-button');
    const soundCue = document.getElementById('sound-cue');
    const lastReactionSpan = document.getElementById('last-reaction');
    const avgReactionSpan = document.getElementById('avg-reaction');

    // --- 2. Game State Variables ---
    let gameActive = false;
    let hasSoundPlayed = false;
    let startTime = 0;
    let timeoutId = null;
    let reactionTimes = [];

    // Timing Constants
    const MIN_DELAY_MS = 2000; // 2 seconds minimum wait
    const MAX_DELAY_MS = 5000; // 5 seconds maximum wait

    // --- 3. CORE LOGIC FUNCTIONS ---

    /**
     * Initializes the game and starts the random delay phase.
     */
    function startGame() {
        if (gameActive) return; // Prevent double-start
        
        gameActive = true;
        hasSoundPlayed = false;
        startButton.disabled = true;
        
        // Reset message/styles for the "WAIT" phase
        clickTarget.classList.remove('click-now');
        clickTarget.classList.add('wait');
        messageDisplay.textContent = 'WAIT...';
        messageDisplay.style.color = 'white';

        // 1. Calculate random delay
        const randomDelay = Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS) + MIN_DELAY_MS;
        
        console.log(`Sound scheduled in: ${randomDelay.toFixed(0)} ms`);

        // 2. Schedule the sound and state change
        timeoutId = setTimeout(triggerGo, randomDelay);
    }

    /**
     * Triggers the sound cue and marks the exact start time for reaction measurement.
     */
    function triggerGo() {
        if (!gameActive) return;

        // 1. Play the sound
        // Resetting current time ensures it plays fully every time
        soundCue.currentTime = 0; 
        soundCue.play().catch(error => {
            console.warn("Audio playback failed (usually due to browser restrictions). Game still proceeds.");
            // If sound fails, the visual cue must still work
        });

        // 2. Record the precise start time
        startTime = performance.now();
        hasSoundPlayed = true;

        // 3. Update visual cue
        clickTarget.classList.remove('wait');
        clickTarget.classList.add('click-now');
        messageDisplay.textContent = 'CLICK NOW!';
        messageDisplay.style.color = 'black';
    }

    /**
     * Handles the player's click on the target area.
     */
    function handleTargetClick() {
        if (!gameActive) return;

        if (!hasSoundPlayed) {
            // Premature click (false start)
            clearTimeout(timeoutId);
            endGame(0); // Pass 0 to signify a false start
        } else {
            // Valid click! Measure reaction time.
            const endTime = performance.now();
            const reactionTime = endTime - startTime;
            endGame(reactionTime);
        }
    }

    /**
     * Updates scores, displays results, and prepares for the next round.
     * @param {number} reactionTime - The measured time in milliseconds, or 0 for false start.
     */
    function endGame(reactionTime) {
        gameActive = false;
        startButton.disabled = false;
        clearTimeout(timeoutId); // Clear any remaining timeout
        
        // Reset styles
        clickTarget.classList.remove('wait', 'click-now');
        messageDisplay.style.color = 'white';
        
        if (reactionTime === 0) {
            // False Start
            lastReactionSpan.textContent = 'N/A';
            messageDisplay.textContent = '❌ FALSE START! Wait for the sound.';
            messageDisplay.style.color = '#e74c3c';
        } else {
            // Valid Reaction
            const roundedTime = reactionTime.toFixed(2);
            reactionTimes.push(reactionTime);
            
            lastReactionSpan.textContent = `${roundedTime} ms`;
            messageDisplay.textContent = `✅ Your time: ${roundedTime} ms`;
            
            // Update Average Score
            const total = reactionTimes.reduce((sum, time) => sum + time, 0);
            const average = total / reactionTimes.length;
            avgReactionSpan.textContent = `${average.toFixed(2)} ms`;
        }

        startButton.textContent = 'RETRY';
    }

    // --- 4. EVENT LISTENERS ---
    
    startButton.addEventListener('click', startGame);
    clickTarget.addEventListener('click', handleTargetClick);
    
    // Initial setup message
    messageDisplay.textContent = 'Click START to begin!';
});