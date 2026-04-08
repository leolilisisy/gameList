document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('track');
    const player = document.getElementById('player');
    const messageDisplay = document.getElementById('game-message');
    const speedDisplay = document.getElementById('game-speed');
    const livesDisplay = document.getElementById('lives-count');
    const PLAYER_OFFSET = 100; // Must match CSS --player-offset
    const PLAYER_WIDTH = 50; // Must match CSS player width

    // --- Game State ---
    let gameState = {
        isRunning: true,
        lives: 3,
        scrollRate: 1.0, // Multiplier for CSS scroll duration
        lastObstacleTime: 0,
        hoverTapActive: false // State needed for the two-part "Hover-Tap" event
    };

    // --- 1. Collision and Timing Check ---

    /**
     * Finds the obstacle currently closest to the player and within the "active" zone.
     * The active zone is defined by the player's position.
     */
    function getActiveTarget() {
        const obstacles = Array.from(document.querySelectorAll('.target:not(.passed)'));
        
        // Get current track position (requires reading CSS animation or transform)
        const trackStyle = window.getComputedStyle(track);
        const trackX = new WebKitCSSMatrix(trackStyle.transform).m41; // Get X translation

        let activeTarget = null;
        
        obstacles.forEach(obs => {
            const obsLeft = parseInt(obs.style.left) + trackX;
            
            // Obstacle is considered "active" if its right edge is past the player's left edge
            // and its left edge hasn't passed the player's right edge.
            const playerZoneStart = PLAYER_OFFSET;
            const playerZoneEnd = PLAYER_OFFSET + PLAYER_WIDTH;
            
            if (obsLeft < playerZoneEnd && obsLeft + obs.offsetWidth > playerZoneStart) {
                activeTarget = obs;
            }
        });
        
        // Highlight the currently active target for visual feedback
        document.querySelectorAll('.target').forEach(t => t.classList.remove('active'));
        if (activeTarget) {
            activeTarget.classList.add('active');
        }

        return activeTarget;
    }

    /**
     * Runs every frame to check for passive failures (hitting an obstacle).
     */
    function checkPassiveFail() {
        if (!gameState.isRunning) return;

        const activeTarget = getActiveTarget();

        // If an obstacle is in the player zone but hasn't been passed, it's a collision.
        if (activeTarget && !activeTarget.classList.contains('passed')) {
            // The obstacle passed through the player zone without the correct event
            failGame("Hit an obstacle!");
        }
    }

    // --- 2. Event Handling and Game Logic ---

    function handleSuccess(target) {
        if (!gameState.isRunning) return;

        target.classList.add('passed');
        messageDisplay.textContent = `SUCCESS! Executed ${target.dataset.event.toUpperCase()} perfectly!`;
        
        // Increase speed for momentum
        gameState.scrollRate += 0.05;
        track.style.animationDuration = `${20 / gameState.scrollRate}s`;
        speedDisplay.textContent = `${gameState.scrollRate.toFixed(2)}x`;
    }

    function failGame(reason) {
        if (!gameState.isRunning) return;

        gameState.lives--;
        livesDisplay.textContent = gameState.lives;
        messageDisplay.textContent = `FAIL! ${reason}`;

        if (gameState.lives <= 0) {
            gameState.isRunning = false;
            document.body.classList.add('stopped');
            messageDisplay.textContent = "GAME OVER! Ran out of lives.";
            // Stop the core game loop (the requestAnimationFrame call will handle the pause)
        } else {
            // Pause scrolling for a moment on collision
            document.body.classList.add('stopped');
            setTimeout(() => {
                document.body.classList.remove('stopped');
            }, 500); // 0.5 second penalty pause
        }
    }

    // Single global listener to handle all required events
    document.addEventListener('mousedown', handleEvents);
    document.addEventListener('dblclick', handleEvents);
    document.addEventListener('contextmenu', handleEvents);
    document.addEventListener('mouseover', handleEvents, true); // Use capture for mouseover
    document.addEventListener('mouseleave', handleEvents, true); // Use capture for mouseleave

    function handleEvents(event) {
        if (!gameState.isRunning) return;

        const target = getActiveTarget();
        if (!target) return;

        const requiredEvent = target.dataset.event;
        const eventType = event.type;
        
        // --- Core Event Prevention ---
        // This is crucial to keep the game immersive (e.g., stopping the right-click menu)
        if (eventType === 'contextmenu' || eventType === 'dblclick') {
            event.preventDefault(); 
        }

        // --- Standard Success Check ---
        if (requiredEvent === eventType) {
            handleSuccess(target);
            return;
        }

        // --- Complex 'Hover-Tap Bridge' Logic (mouseover + mousedown sequence) ---
        if (requiredEvent === 'hover-tap') {
            if (eventType === 'mouseover' && event.target.classList.contains('hover-tap-bridge')) {
                gameState.hoverTapActive = true;
                target.style.opacity = 1.0; // Visual feedback: platform appears
                messageDisplay.textContent = "Hover activated! Tap to complete!";
                return;
            } 
            
            if (eventType === 'mousedown' && gameState.hoverTapActive) {
                handleSuccess(target); // Success on tap if hover was active
                gameState.hoverTapActive = false;
                return;
            }
            
            if (eventType === 'mouseleave' && event.target.classList.contains('hover-tap-bridge')) {
                // If hover is lost before tap, the temporary platform is removed
                if (gameState.hoverTapActive) {
                    failGame("Hover lost! Bridge collapsed!");
                    target.style.opacity = 0.5;
                }
                gameState.hoverTapActive = false;
                return;
            }
        }
        
        // --- Failure: Wrong Event Type ---
        if (event.type === 'mousedown' || event.type === 'contextmenu' || event.type === 'dblclick') {
            // Only penalize if the click/right-click/double-click event was wrong
            failGame(`Wrong interaction: Expected ${requiredEvent.toUpperCase()}, got ${eventType.toUpperCase()}!`);
        }
    }


    // --- 3. Game Loop ---

    function gameLoop() {
        checkPassiveFail();
        if (gameState.isRunning) {
            requestAnimationFrame(gameLoop);
        }
    }
    
    // Initial setup:
    document.body.classList.remove('allow-context-menu'); // Ensure context menu is globally disabled
    
    // Start the game loop that checks for passive collisions
    requestAnimationFrame(gameLoop);
});