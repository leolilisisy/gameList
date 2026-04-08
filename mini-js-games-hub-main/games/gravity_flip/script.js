document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements & Constants ---
    const player = document.getElementById('player');
    const levelArea = document.getElementById('level-area');
    const platforms = document.querySelectorAll('.platform');
    const restartButton = document.getElementById('restart-button');
    const messageDisplay = document.getElementById('message');

    const LEVEL_WIDTH = 500;
    const LEVEL_HEIGHT = 500;
    const PLAYER_SIZE = 30;

    // --- 2. PHYSICS & GAME STATE ---
    let gameActive = false;
    let gravityDirection = 1; // 1 = down, -1 = up
    
    // Player state (x/y in pixels, vy in pixels/frame)
    let playerX = 50;
    let playerY = 550 - PLAYER_SIZE; // Start on the floor
    let playerVY = 0; // Vertical velocity
    let isGrounded = true; 
    let moveLeft = false;
    let moveRight = false;

    // Physics constants
    const GRAVITY = 0.5; // Vertical acceleration
    const JUMP_VELOCITY = 10;
    const HORIZONTAL_SPEED = 4;
    const FRICTION = 0.9; // Horizontal friction (simplification)
    
    let lastTime = 0; // Used for requestAnimationFrame timestamp

    // --- 3. GAME LOOP ---

    /**
     * The main game loop using requestAnimationFrame for smooth physics simulation.
     */
    function gameLoop(timestamp) {
        if (!gameActive) return;

        // Calculate delta time (dt) for frame-rate independent physics (simplified here)
        const dt = (timestamp - lastTime) / 1000 * 60; // dt ≈ 1 if 60fps
        lastTime = timestamp;

        // 1. Apply Gravity (Acceleration)
        playerVY += GRAVITY * gravityDirection * dt;
        
        // 2. Apply Horizontal Movement (Deceleration/Input)
        if (moveLeft) playerX = Math.max(0, playerX - HORIZONTAL_SPEED * dt);
        if (moveRight) playerX = Math.min(LEVEL_WIDTH - PLAYER_SIZE, playerX + HORIZONTAL_SPEED * dt);
        
        // 3. Apply Vertical Movement (Velocity)
        playerY += playerVY * dt;

        // 4. Collision Detection (The most complex part)
        const collisionData = checkCollisions();
        
        if (collisionData.collided) {
            // Adjust position to just outside the platform
            playerY = collisionData.yAdjust; 
            
            // Stop velocity and mark as grounded
            playerVY = 0;
            isGrounded = true;
        } else {
            isGrounded = false;
        }
        
        // 5. Check Boundary Collision (Ceiling/Floor)
        if (playerY >= LEVEL_HEIGHT - PLAYER_SIZE) {
            playerY = LEVEL_HEIGHT - PLAYER_SIZE;
            playerVY = 0;
            isGrounded = true;
        } else if (playerY <= 0) {
            playerY = 0;
            playerVY = 0;
            isGrounded = true;
        }

        // 6. Check Win Condition
        if (checkWin()) {
            endGame(true);
            return;
        }

        // 7. Update DOM (Render)
        render();

        // Continue loop
        requestAnimationFrame(gameLoop);
    }

    /**
     * Iterates through all platforms and checks for player intersection.
     * @returns {{collided: boolean, yAdjust: number}} Collision result.
     */
    function checkCollisions() {
        let collided = false;
        let yAdjust = playerY;

        const playerRect = {
            top: playerY,
            bottom: playerY + PLAYER_SIZE,
            left: playerX,
            right: playerX + PLAYER_SIZE
        };

        for (const platform of platforms) {
            const platformRect = platform.getBoundingClientRect();
            // Get coordinates relative to the game area, not the viewport
            const containerRect = levelArea.getBoundingClientRect();
            const pTop = platformRect.top - containerRect.top;
            const pBottom = platformRect.bottom - containerRect.top;
            const pLeft = platformRect.left - containerRect.left;
            const pRight = platformRect.right - containerRect.left;

            // Simplified AABB (Axis-Aligned Bounding Box) collision check
            const overlapX = playerRect.right > pLeft && playerRect.left < pRight;

            if (overlapX) {
                // Collision coming from ABOVE (Gravity Down: playerVY > 0)
                if (gravityDirection === 1 && playerVY >= 0 && 
                    playerRect.bottom >= pTop && playerRect.bottom <= pTop + 10) { 
                    
                    collided = true;
                    yAdjust = pTop - PLAYER_SIZE;
                    break;
                }
                
                // Collision coming from BELOW (Gravity Up: playerVY < 0)
                if (gravityDirection === -1 && playerVY <= 0 && 
                    playerRect.top <= pBottom && playerRect.top >= pBottom - 10) { 
                    
                    collided = true;
                    yAdjust = pBottom;
                    break;
                }
            }
        }

        return { collided, yAdjust };
    }

    /**
     * Checks if the player has touched the goal platform.
     */
    function checkWin() {
        const goal = document.querySelector('.platform.goal');
        if (!goal) return false;
        
        const goalRect = goal.getBoundingClientRect();
        const containerRect = levelArea.getBoundingClientRect();
        
        const gTop = goalRect.top - containerRect.top;
        const gBottom = goalRect.bottom - containerRect.top;
        const gLeft = goalRect.left - containerRect.left;
        const gRight = goalRect.right - containerRect.left;

        return (
            playerX < gRight &&
            playerX + PLAYER_SIZE > gLeft &&
            playerY < gBottom &&
            playerY + PLAYER_SIZE > gTop
        );
    }

    /**
     * Updates the player's position in the DOM.
     */
    function render() {
        player.style.left = `${playerX}px`;
        player.style.top = `${playerY}px`;
        
        // Rotate player visually to indicate gravity direction
        player.style.transform = gravityDirection === 1 ? 'rotate(0deg)' : 'rotate(180deg)';
    }
    
    /**
     * Changes the gravity direction and applies an initial impulse (simulated jump).
     */
    function flipGravity() {
        if (!gameActive) return;
        
        gravityDirection *= -1; // Flip between 1 and -1
        
        // Give a little push upwards/downwards when gravity flips to simulate jump
        playerVY = -JUMP_VELOCITY * gravityDirection * 0.5; // Half jump velocity

        // Change color briefly for visual feedback
        player.style.backgroundColor = gravityDirection === 1 ? '#e74c3c' : '#3498db';
    }

    /**
     * Stops the game and displays the result.
     */
    function endGame(win) {
        gameActive = false;
        cancelAnimationFrame(requestAnimationFrame(gameLoop));
        
        if (win) {
            messageDisplay.innerHTML = '🏆 **LEVEL COMPLETE!**';
            messageDisplay.style.color = '#2ecc71';
        }
    }

    // --- 4. EVENT LISTENERS AND INITIAL SETUP ---
    
    function init() {
        // Reset player position and physics
        playerX = 50;
        playerY = 550 - PLAYER_SIZE; 
        playerVY = 0;
        gravityDirection = 1;
        isGrounded = true;
        gameActive = true;
        
        messageDisplay.textContent = 'Press SPACE to flip gravity! Reach the GOAL.';
        messageDisplay.style.color = '#bdc3c7';
        player.style.backgroundColor = '#e74c3c';
        
        render(); // Initial render
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    // Keyboard controls for horizontal movement and gravity flip
    document.addEventListener('keydown', (e) => {
        if (!gameActive) return;

        if (e.code === 'Space') {
            e.preventDefault();
            flipGravity();
        } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            moveLeft = true;
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            moveRight = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            moveLeft = false;
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            moveRight = false;
        }
    });

    restartButton.addEventListener('click', init);

    // Start the game loop
    init();
});