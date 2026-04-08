// --- 1. Game State and Constants ---
const GAME_STATE = {
    running: true,
    score: 0,
    playerY: 0, 
    velocityY: 0,
    gravity: 1,
    jumpVelocity: 18,
    isJumping: false,
    playerX: 50, // Fixed horizontal position for runner
    obstacleSpeed: 5,
    lastSpawnTime: 0,
    spawnInterval: 1500,
    lastFrameTime: performance.now()
};

const D = (id) => document.getElementById(id);
const $ = {
    player: D('player'),
    obstacleZone: D('obstacle-zone'),
    scoreDisplay: D('score'),
    fpsDisplay: D('fps'),
    gameContainer: D('game-container')
};

const PLAYER_HEIGHT = 40;
const PLAYER_WIDTH = 40;
const OBSTACLE_HEIGHT = 80;
const OBSTACLE_WIDTH = 80;
const CONTAINER_HEIGHT = 300;
const FLOOR_HEIGHT = 50;

// --- 2. Player Controls (Spacebar to Jump) ---

document.addEventListener('keydown', (e) => {
    if (!GAME_STATE.running) return;

    if (e.code === 'Space' && !GAME_STATE.isJumping) {
        GAME_STATE.isJumping = true;
        GAME_STATE.velocityY = GAME_STATE.jumpVelocity;
    }
});

// --- 3. Game Loop ---

function gameLoop(currentTime) {
    if (!GAME_STATE.running) return;

    const deltaTime = currentTime - GAME_STATE.lastFrameTime;
    
    // 1. FPS Calculation
    const fps = Math.round(1000 / deltaTime);
    $.fpsDisplay.textContent = fps;

    // 2. Player Movement (Jumping)
    if (GAME_STATE.isJumping) {
        GAME_STATE.playerY += GAME_STATE.velocityY;
        GAME_STATE.velocityY -= GAME_STATE.gravity;

        // Ground check
        if (GAME_STATE.playerY <= 0) {
            GAME_STATE.playerY = 0;
            GAME_STATE.isJumping = false;
            GAME_STATE.velocityY = 0;
        }
    }
    // Apply vertical movement using CSS transform
    $.player.style.transform = `translateY(${-GAME_STATE.playerY}px)`;

    // 3. Obstacle Management (Spawn, Move, Cleanup)
    handleObstacles(currentTime);

    // 4. Scoring
    GAME_STATE.score += 0.05;
    $.scoreDisplay.textContent = Math.floor(GAME_STATE.score);

    // 5. Check for Collision
    checkCollision();
    
    GAME_STATE.lastFrameTime = currentTime;
    requestAnimationFrame(gameLoop);
}

// --- 4. Obstacle Generation and Movement ---

function spawnObstacle() {
    // 80% chance for an obstacle, 20% for a power-up
    const obstacleType = Math.random() < 0.8 ? 'broken-image' : 'power-up';

    const obstacleWrapper = document.createElement('div');
    obstacleWrapper.classList.add('broken-obstacle');
    
    if (obstacleType === 'broken-image') {
        // THE BROKEN IMAGE TRICK
        const img = document.createElement('img');
        img.src = "bad-path-" + Math.random(); // Guarantees a failed load
        img.alt = "OBSTACLE 🚧"; // Alt text is visible
        img.dataset.type = 'obstacle';
        obstacleWrapper.appendChild(img);
        obstacleWrapper.style.left = `${$.gameContainer.offsetWidth}px`;
    } else {
        // THE UNSTYLED LINK POWER-UP
        const link = document.createElement('a');
        link.href = "#"; // Functional link
        link.textContent = "Click Here For 1UP!";
        link.classList.add('power-up');
        link.dataset.type = 'power-up';
        obstacleWrapper.appendChild(link);
        
        // Position power-up higher for jumping
        obstacleWrapper.style.bottom = `${FLOOR_HEIGHT + 10}px`; 
        obstacleWrapper.style.left = `${$.gameContainer.offsetWidth}px`;
    }
    
    $.obstacleZone.appendChild(obstacleWrapper);
}

function handleObstacles(currentTime) {
    // Spawn Logic
    if (currentTime - GAME_STATE.lastSpawnTime > GAME_STATE.spawnInterval) {
        spawnObstacle();
        GAME_STATE.lastSpawnTime = currentTime;
        // Increase difficulty (faster spawn, faster speed)
        GAME_STATE.spawnInterval = Math.max(800, GAME_STATE.spawnInterval - 5);
        GAME_STATE.obstacleSpeed = Math.min(15, GAME_STATE.obstacleSpeed + 0.01);
    }

    // Movement and Cleanup Logic
    const obstacles = document.querySelectorAll('.broken-obstacle');

    obstacles.forEach(el => {
        let currentX = parseFloat(el.style.left) || $.gameContainer.offsetWidth;
        currentX -= GAME_STATE.obstacleSpeed;
        el.style.left = `${currentX}px`;

        if (currentX < -OBSTACLE_WIDTH) {
            el.remove();
        }
    });
}

// --- 5. Collision Detection (AABB) ---

function checkCollision() {
    // Player's Hitbox (relative to container)
    const playerRect = {
        left: GAME_STATE.playerX,
        right: GAME_STATE.playerX + PLAYER_WIDTH,
        top: CONTAINER_HEIGHT - FLOOR_HEIGHT - PLAYER_HEIGHT - GAME_STATE.playerY,
        bottom: CONTAINER_HEIGHT - FLOOR_HEIGHT - GAME_STATE.playerY
    };

    const obstacles = document.querySelectorAll('.broken-obstacle'); 

    obstacles.forEach(wrapper => {
        const child = wrapper.firstChild; // The <img> or <a> element
        if (!child) return;

        const obstacleX = parseFloat(wrapper.style.left);
        
        // Obstacle's Hitbox (relative to container)
        const obstacleHitbox = {
            left: obstacleX,
            right: obstacleX + OBSTACLE_WIDTH,
            // Broken image/link elements are usually 80px tall and start at the floor
            top: CONTAINER_HEIGHT - FLOOR_HEIGHT - (child.classList.contains('power-up') ? 40 : OBSTACLE_HEIGHT), 
            bottom: CONTAINER_HEIGHT - FLOOR_HEIGHT
        };
        
        // AABB Collision Check
        const overlapX = playerRect.left < obstacleHitbox.right && playerRect.right > obstacleHitbox.left;
        const overlapY = playerRect.top < obstacleHitbox.bottom && playerRect.bottom > obstacleHitbox.top;

        if (overlapX && overlapY) {
            const type = child.dataset.type;
            
            if (type === 'obstacle') {
                gameOver();
            } else if (type === 'power-up') {
                // Collect power-up
                GAME_STATE.score += 50;
                $.scoreDisplay.textContent = Math.floor(GAME_STATE.score);
                wrapper.remove();
            }
        }
    });
}

function gameOver() {
    GAME_STATE.running = false;
    // Visually jarring Game Over screen
    const gameOverText = document.createElement('div');
    gameOverText.classList.add('game-over-text');
    gameOverText.textContent = `GAME OVER! Score: ${Math.floor(GAME_STATE.score)}`;
    $.gameContainer.appendChild(gameOverText);
    
    $.gameMessage.textContent = "Refresh to play again. You were defeated by poor rendering.";
}

// --- 6. Initialization ---

requestAnimationFrame(gameLoop);