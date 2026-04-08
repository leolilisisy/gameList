// --- 1. Canvas Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScoreDisplay');
const restartButton = document.getElementById('restartButton');

// Set Canvas Dimensions (common runner game size)
canvas.width = 900;
canvas.height = 400;

// --- 2. Game Constants and Variables ---
const GRAVITY = 0.5;
const JUMP_STRENGTH = -10;
const OBSTACLE_SPEED = 4;
const OBSTACLE_SPAWN_INTERVAL = 1500; // milliseconds
const BACKGROUND_SPEED = 1;

let player;
let obstacles = [];
let gameActive = false;
let score = 0;
let lastObstacleTime = 0;
let animationFrameId; // To control the game loop

// --- 3. Game Objects (Classes) ---

// Player Character
class Player {
    constructor() {
        this.width = 30;
        this.height = 50;
        this.x = 50;
        this.y = canvas.height - this.height - 20; // Start on ground, 20px above actual bottom
        this.velocityY = 0;
        this.isOnGround = true;
        this.color = '#3498db'; // Blue
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        // Apply gravity
        this.velocityY += GRAVITY;
        this.y += this.velocityY;

        // Ground collision
        const groundLevel = canvas.height - this.height - 20; // Same as initial y
        if (this.y >= groundLevel) {
            this.y = groundLevel;
            this.velocityY = 0;
            this.isOnGround = true;
        }
    }

    jump() {
        if (this.isOnGround) {
            this.velocityY = JUMP_STRENGTH;
            this.isOnGround = false;
        }
    }
}

// Obstacle
class Obstacle {
    constructor(x) {
        this.width = 20 + Math.random() * 30; // Random width
        this.height = 20 + Math.random() * 40; // Random height
        this.x = x;
        this.y = canvas.height - this.height - 20; // Position on ground
        this.color = '#e74c3c'; // Red
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= OBSTACLE_SPEED;
    }
}

// --- 4. Game Setup and Initialization ---

function initGame() {
    // Reset all game state
    player = new Player();
    obstacles = [];
    score = 0;
    lastObstacleTime = 0;
    gameActive = false;

    // Hide game over screen, show start screen initially
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#87ceeb'; // Draw sky
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGround(); // Draw ground
    player.draw(); // Draw player at start
    drawScore();
}

// Draw the ground
function drawGround() {
    ctx.fillStyle = '#2ecc71'; // Green ground
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
}

// Draw current score
function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px "Press Start 2P"';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, canvas.width - 20, 30);
}

// --- 5. Main Game Loop ---

function gameLoop(currentTime) {
    if (!gameActive) return;

    // Calculate delta time (optional, for frame-rate independent movement)
    // let deltaTime = currentTime - lastFrameTime; 
    // lastFrameTime = currentTime;

    // 1. Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Background (e.g., sky and ground)
    ctx.fillStyle = '#87ceeb'; // Sky
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGround();

    // 3. Update Game Objects
    player.update();
    updateObstacles(currentTime); // Pass currentTime for spawn logic

    // 4. Check Collisions
    checkCollisions();

    // 5. Draw Game Objects
    player.draw();
    obstacles.forEach(obstacle => obstacle.draw());
    drawScore();

    // 6. Request next frame
    animationFrameId = requestAnimationFrame(gameLoop);

    // 7. Update Score
    score++; // Score increases simply by surviving more frames/time
}

function updateObstacles(currentTime) {
    // Spawn new obstacles
    if (currentTime - lastObstacleTime > OBSTACLE_SPAWN_INTERVAL) {
        obstacles.push(new Obstacle(canvas.width));
        lastObstacleTime = currentTime;
    }

    // Update existing obstacles and remove if off-screen
    obstacles = obstacles.filter(obstacle => {
        obstacle.update();
        return obstacle.x + obstacle.width > 0; // Keep if still on screen
    });
}

// AABB (Axis-Aligned Bounding Box) collision detection
function collides(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function checkCollisions() {
    obstacles.forEach(obstacle => {
        if (collides(player, obstacle)) {
            endGame(); // Player hit an obstacle
        }
    });
}

function endGame() {
    gameActive = false;
    cancelAnimationFrame(animationFrameId); // Stop the game loop

    // Show game over screen
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = `Your final score: ${Math.floor(score / 100)}!`; // Adjust score for display
}

// --- 6. Event Listeners (Input) ---

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameActive) {
        player.jump();
    }
});

startButton.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameActive = true;
    score = 0; // Reset score before starting new game
    requestAnimationFrame(gameLoop); // Start the game loop
});

restartButton.addEventListener('click', () => {
    initGame(); // Reset all game data and UI
    startScreen.classList.add('hidden'); // Ensure start screen is hidden
    gameActive = true; // Set game to active
    requestAnimationFrame(gameLoop); // Start the game loop again
});


// --- 7. Initialization ---
initGame();