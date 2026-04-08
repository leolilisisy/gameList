document.addEventListener('DOMContentLoaded', () => {
    const krusher = document.getElementById('krusher');
    const goal = document.getElementById('goal');
    const gameContainer = document.getElementById('game-container');
    const platforms = document.querySelectorAll('.text-platform');
    const messageDisplay = document.getElementById('game-message');
    const resetButton = document.getElementById('reset-button');

    // Control Elements
    const sizeSlider = document.getElementById('size-slider');
    const spacingSlider = document.getElementById('spacing-slider');
    const sizeVal = document.getElementById('size-val');
    const spacingVal = document.getElementById('spacing-val');

    // --- Game State & Physics ---
    let gameState = {
        isRunning: true,
        posX: 20, // Krusher initial X position (relative to container)
        posY: 50, // Krusher initial Y position
        vY: 0,    // Vertical velocity (gravity effect)
        g: 0.3    // Gravity acceleration
    };
    
    const KRUSHER_SIZE = 20;

    // --- Utility Functions ---

    /**
     * Reads the current position and dimensions of an element as rendered by the browser.
     * This is the "physics" engine.
     */
    function getRect(element) {
        const rect = element.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();
        
        return {
            left: rect.left - containerRect.left,
            top: rect.top - containerRect.top,
            right: rect.right - containerRect.left,
            bottom: rect.bottom - containerRect.top,
            width: rect.width,
            height: rect.height
        };
    }

    /**
     * Standard AABB collision check.
     */
    function checkAABBCollision(rect1, rect2) {
        return rect1.left < rect2.right &&
               rect1.right > rect2.left &&
               rect1.top < rect2.bottom &&
               rect1.bottom > rect2.top;
    }

    // --- Game Loop and Physics ---

    function checkCollisions() {
        const krusherRect = {
            left: gameState.posX,
            top: gameState.posY,
            right: gameState.posX + KRUSHER_SIZE,
            bottom: gameState.posY + KRUSHER_SIZE,
            width: KRUSHER_SIZE,
            height: KRUSHER_SIZE
        };

        // 1. Check Goal Collision
        if (checkAABBCollision(krusherRect, getRect(goal))) {
            endGame("✅ MISSION COMPLETE! Typography master!");
            return;
        }

        // 2. Check Floor Collision (Loss Condition)
        if (krusherRect.bottom >= gameContainer.clientHeight) {
            endGame("❌ FAILURE: You hit the floor!");
            return;
        }

        // 3. Check Platform Collisions (The main interaction)
        platforms.forEach(platform => {
            const platformRect = getRect(platform);
            
            if (checkAABBCollision(krusherRect, platformRect)) {
                
                // If the Krusher is moving down and hits the top of the platform
                if (gameState.vY > 0 && krusherRect.bottom <= platformRect.top + gameState.vY) {
                    
                    // Snap Krusher to the top of the platform
                    gameState.vY = 0;
                    gameState.posY = platformRect.top - KRUSHER_SIZE; 
                    
                } else {
                    // Collision from side or below (usually a loss condition or bounce)
                    endGame("❌ CRASH! You hit the side of a text block!");
                }
            }
        });
    }

    function updateKrusherPosition() {
        // Apply gravity to velocity
        gameState.vY += gameState.g;
        
        // Apply velocity to position
        gameState.posY += gameState.vY;
        
        // Update DOM position
        krusher.style.top = `${gameState.posY}px`;
        krusher.style.left = `${gameState.posX}px`;
    }

    function gameLoop() {
        if (!gameState.isRunning) return;

        updateKrusherPosition();
        checkCollisions();

        requestAnimationFrame(gameLoop);
    }

    // --- 4. Control Logic (The Text Manipulation) ---

    // Listener for Font Size (Vertical Movement)
    sizeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        const platform = document.getElementById('platform-size');
        
        platform.style.fontSize = `${value}px`;
        sizeVal.textContent = `${value}px`;
        
        // Re-check physics immediately after changing the platform's dimensions
        checkCollisions();
    });

    // Listener for Letter Spacing (Horizontal Gap)
    spacingSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        const platform = document.getElementById('platform-spacing');

        platform.style.letterSpacing = `${value}px`;
        spacingVal.textContent = `${value}px`;
        
        // Re-check physics immediately
        checkCollisions();
    });

    // --- Game Management ---
    
    function endGame(message) {
        gameState.isRunning = false;
        messageDisplay.textContent = message;
    }

    function resetGame() {
        gameState.isRunning = true;
        gameState.posX = 20;
        gameState.posY = 50;
        gameState.vY = 0;
        messageDisplay.textContent = "Game reset. Start manipulating!";
        krusher.style.top = `${gameState.posY}px`;
        krusher.style.left = `${gameState.posX}px`;
        
        // Reset controls to initial state
        sizeSlider.value = 30;
        spacingSlider.value = 0;
        document.getElementById('platform-size').style.fontSize = '30px';
        document.getElementById('platform-spacing').style.letterSpacing = '0px';
        sizeVal.textContent = '30px';
        spacingVal.textContent = '0px';

        requestAnimationFrame(gameLoop);
    }

    resetButton.addEventListener('click', resetGame);

    // Initial setup and start
    resetGame();
});