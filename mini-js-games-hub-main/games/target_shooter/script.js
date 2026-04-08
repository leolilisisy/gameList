document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements & Constants ---
    const targetDot = document.getElementById('target-dot');
    const playingField = document.getElementById('playing-field');
    const startButton = document.getElementById('start-button');
    const scoreDisplay = document.getElementById('score-display');
    const missesDisplay = document.getElementById('misses-display');
    const feedbackMessage = document.getElementById('feedback-message');

    const FIELD_SIZE = 500;
    const DOT_SIZE = 40;
    const GAME_DURATION_ROUNDS = 10; // Total number of dots to hit
    const BASE_DISPLAY_TIME_MS = 1000; // Base time the dot is visible (1 second)

    // --- 2. GAME STATE VARIABLES ---
    let score = 0;
    let misses = 0;
    let roundsPlayed = 0;
    let gameActive = false;
    let timeoutId = null; // ID for the dot disappearance timer

    // --- 3. CORE LOGIC FUNCTIONS ---

    /**
     * Generates a new random position for the dot, ensuring it stays within the field.
     */
    function getNewRandomPosition() {
        const maxX = FIELD_SIZE - DOT_SIZE;
        const maxY = FIELD_SIZE - DOT_SIZE;

        const x = Math.floor(Math.random() * maxX);
        const y = Math.floor(Math.random() * maxY);

        return { x, y };
    }

    /**
     * Shows the dot at a new random location and starts the disappearance timer.
     */
    function showNewDot() {
        if (roundsPlayed >= GAME_DURATION_ROUNDS) {
            endGame();
            return;
        }

        const { x, y } = getNewRandomPosition();

        targetDot.style.left = `${x}px`;
        targetDot.style.top = `${y}px`;
        targetDot.style.display = 'block';

        roundsPlayed++;

        // Determine display time (can decrease with score/rounds for difficulty)
        // Let's keep it constant for simplicity in the base version
        const displayTime = BASE_DISPLAY_TIME_MS; 

        // Set timeout for dot disappearance (a "miss")
        timeoutId = setTimeout(handleMiss, displayTime);
    }

    /**
     * Handles the player clicking the dot successfully.
     */
    function handleHit() {
        if (!gameActive) return;

        // 1. Stop the disappearance timer immediately
        clearTimeout(timeoutId);
        
        // 2. Score and Hide
        score++;
        targetDot.style.display = 'none';
        
        // 3. Update Status
        scoreDisplay.textContent = score;
        feedbackMessage.textContent = `🎯 HIT! (${roundsPlayed} / ${GAME_DURATION_ROUNDS})`;
        feedbackMessage.style.color = '#2ecc71';

        // 4. Next Round (Start immediately)
        setTimeout(showNewDot, 200); // Small delay before the next dot appears
    }

    /**
     * Handles the dot disappearing before the player clicks it (a "miss").
     */
    function handleMiss() {
        if (!gameActive) return;
        
        // 1. Record Miss and Hide
        misses++;
        targetDot.style.display = 'none';
        
        // 2. Update Status
        missesDisplay.textContent = misses;
        feedbackMessage.innerHTML = `❌ MISS! Dot disappeared. (${roundsPlayed} / ${GAME_DURATION_ROUNDS})`;
        feedbackMessage.style.color = '#e74c3c';

        // 3. Check for game end or continue
        if (roundsPlayed >= GAME_DURATION_ROUNDS) {
            endGame();
        } else {
            setTimeout(showNewDot, 500); // Slightly longer delay after a miss
        }
    }

    // --- 4. GAME FLOW ---

    /**
     * Starts the overall game session.
     */
    function startGame() {
        // Reset state
        score = 0;
        misses = 0;
        roundsPlayed = 0;
        gameActive = true;
        
        scoreDisplay.textContent = score;
        missesDisplay.textContent = misses;
        startButton.disabled = true;
        startButton.textContent = 'Playing...';

        feedbackMessage.textContent = 'Get ready...';
        
        // Hide dot initially and then show the first one after a brief delay
        targetDot.style.display = 'none';
        setTimeout(showNewDot, 1000); 
    }

    /**
     * Ends the game and displays final results.
     */
    function endGame() {
        gameActive = false;
        clearTimeout(timeoutId);
        targetDot.style.display = 'none';
        
        const finalAccuracy = (score / roundsPlayed) * 100;

        feedbackMessage.innerHTML = `
            <h2>GAME OVER!</h2>
            <p>Final Score: <strong>${score} hits</strong> / ${misses} misses</p>
            <p>Accuracy: ${finalAccuracy.toFixed(1)}%</p>
        `;
        feedbackMessage.style.color = '#3498db'; // Blue final score color

        startButton.textContent = 'PLAY AGAIN';
        startButton.disabled = false;
    }

    // --- 5. EVENT LISTENERS ---

    startButton.addEventListener('click', startGame);

    // Attach click handler to the dot itself (only active when visible)
    targetDot.addEventListener('click', handleHit);

    // Initial setup
    feedbackMessage.textContent = `Ready for ${GAME_DURATION_ROUNDS} rounds!`;
});