document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements and Constants ---
    const movingTarget = document.getElementById('moving-target');
    const actionButton = document.getElementById('action-button');
    const scoreSpan = document.getElementById('score');
    const lastScoreSpan = document.getElementById('last-score');
    const feedbackMessage = document.getElementById('feedback-message');
    const trackContainer = document.getElementById('track-container');

    // Get track dimensions (must match CSS)
    const TRACK_WIDTH = trackContainer.clientWidth;
    const TARGET_SIZE = movingTarget.clientWidth;
    const HIT_ZONE_WIDTH = 50; // Must match CSS :root variable

    // Define the boundaries of the hit zone's *center*
    const HIT_ZONE_CENTER_START = (TRACK_WIDTH / 2) - (HIT_ZONE_WIDTH / 2);
    const HIT_ZONE_CENTER_END = (TRACK_WIDTH / 2) + (HIT_ZONE_WIDTH / 2);

    // Define the boundaries of the hit zone relative to the *target's left edge*
    const HIT_ZONE_START = HIT_ZONE_CENTER_START - (TARGET_SIZE / 2);
    const HIT_ZONE_END = HIT_ZONE_CENTER_END + (TARGET_SIZE / 2);
    
    const TRACK_END = TRACK_WIDTH - TARGET_SIZE; // Max valid 'left' position

    // --- 2. Game State Variables ---
    let score = 0;
    let position = 0; // Current 'left' position of the target
    let direction = 1; // 1 = right, -1 = left
    let speed = 2.5; // Pixels per frame
    let animationFrameId = null; // ID for requestAnimationFrame
    let gameActive = false;
    let lastTime = 0;

    // --- 3. Core Logic Functions ---

    /**
     * The main animation loop for movement, using requestAnimationFrame for smoothness.
     * @param {number} timestamp - Time provided by rAF (not used for movement here, but good practice)
     */
    function moveTarget(timestamp) {
        if (!gameActive) return;

        // Calculate the next position
        position += direction * speed;

        // --- Boundary Check ---
        if (position >= TRACK_END) {
            // Hit the right wall, reverse direction
            direction = -1;
            position = TRACK_END;
            // Optionally, increase speed slightly for difficulty
            speed += 0.05; 
        } else if (position <= 0) {
            // Hit the left wall, reverse direction
            direction = 1;
            position = 0;
            // Optionally, increase speed slightly
            speed += 0.05; 
        }

        // Apply position to the DOM
        movingTarget.style.left = `${position}px`;

        // Request the next frame
        animationFrameId = requestAnimationFrame(moveTarget);
    }

    /**
     * Initializes and starts the game.
     */
    function startGame() {
        if (gameActive) return;

        // Reset state
        gameActive = true;
        position = 0;
        direction = 1;
        speed = 2.5;
        
        actionButton.textContent = 'CLICK!';
        actionButton.disabled = false;
        feedbackMessage.textContent = 'Wait for the perfect moment...';

        // Start the animation loop
        lastTime = performance.now(); // Record start time for reaction calculation
        animationFrameId = requestAnimationFrame(moveTarget);
    }

    /**
     * Handles the button click to check if the target is in the hit zone.
     */
    function handleAction() {
        if (!gameActive) return;

        // Stop movement immediately
        cancelAnimationFrame(animationFrameId);
        gameActive = false;
        actionButton.disabled = true;

        // Check if the current position is within the target zone
        if (position >= HIT_ZONE_START && position <= HIT_ZONE_END) {
            score++;
            scoreSpan.textContent = score;

            // Calculate score based on proximity to the exact center
            const centerPosition = (TRACK_WIDTH / 2) - (TARGET_SIZE / 2);
            const deviation = Math.abs(position - centerPosition);
            
            // Score in ms (smaller is better). Max score for perfect hit is 1ms.
            // Normalize deviation to a range (e.g., 0 to 100) and scale it up.
            const maxDeviation = HIT_ZONE_END - centerPosition;
            const reactionScore = Math.round(100 * (deviation / maxDeviation)) + 1; // 1ms is perfect
            
            lastScoreSpan.textContent = `${reactionScore}ms`;

            feedbackMessage.innerHTML = `✅ **HIT!** Precision Score: ${reactionScore}ms.`;
            feedbackMessage.style.color = '#2ecc71';

        } else {
            feedbackMessage.innerHTML = `❌ **MISS!** You were outside the zone.`;
            feedbackMessage.style.color = '#e74c3c';
        }

        // Prepare for next round
        actionButton.textContent = 'RETRY';
        actionButton.disabled = false;
    }

    // --- 4. Event Listeners ---
    actionButton.addEventListener('click', () => {
        if (actionButton.textContent === 'START' || actionButton.textContent === 'RETRY') {
            startGame();
        } else if (actionButton.textContent === 'CLICK!') {
            handleAction();
        }
    });
    
    // Allow spacebar to act as the action button for quicker reaction time
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !actionButton.disabled) {
            e.preventDefault(); // Prevents default browser scrolling
            handleAction();
        }
    });
});