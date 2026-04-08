// Shape Shifter Game
// A simple game where you change shapes to navigate through obstacles

// Get DOM elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');
const levelEl = document.getElementById('current-level');
const messageEl = document.getElementById('message');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PLAYER_SIZE = 20;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_SPEED = 2;
const SHAPES = ['circle', 'square', 'triangle'];

// Game variables
let gameRunning = false;
let gamePaused = false;
let score = 0;
let level = 1;
let playerShape = 0; // 0: circle, 1: square, 2: triangle
let playerY = CANVAS_HEIGHT / 2;
let obstacles = [];
let animationId;
let lastObstacleTime = 0;

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeyPress);

// Start the game
function startGame() {
    // Reset everything
    score = 0;
    level = 1;
    playerShape = 0;
    playerY = CANVAS_HEIGHT / 2;
    obstacles = [];
    lastObstacleTime = 0;
    gameRunning = true;
    gamePaused = false;

    // Update UI
    scoreEl.textContent = score;
    levelEl.textContent = level;
    messageEl.textContent = '';
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';

    // Start game loop
    gameLoop();
}

// Main game loop
function gameLoop() {
    if (!gameRunning || gamePaused) return;

    updateGame();
    drawGame();

    animationId = requestAnimationFrame(gameLoop);
}

// Update game state
function updateGame() {
    // Move obstacles
    obstacles.forEach(obstacle => {
        obstacle.x -= OBSTACLE_SPEED + (level - 1) * 0.5; // Speed increases with level
    });

    // Remove off-screen obstacles
    obstacles = obstacles.filter(obstacle => obstacle.x > -OBSTACLE_WIDTH);

    // Add new obstacles
    if (Date.now() - lastObstacleTime > 2000 - level * 100) { // Spawn faster at higher levels
        addObstacle();
        lastObstacleTime = Date.now();
    }

    // Check collisions
    checkCollisions();

    // Increase score
    score += 1;
    scoreEl.textContent = score;

    // Level up every 1000 points
    if (score > 0 && score % 1000 === 0) {
        levelUp();
    }
}

// Add a new obstacle
function addObstacle() {
    const holeShape = Math.floor(Math.random() * 3); // Random hole shape
    const holeY = Math.random() * (CANVAS_HEIGHT - 100) + 50; // Random hole position

    obstacles.push({
        x: CANVAS_WIDTH,
        holeY: holeY,
        holeShape: holeShape
    });
}

// Check if player collides with obstacles
function checkCollisions() {
    const playerLeft = 50;
    const playerRight = playerLeft + PLAYER_SIZE;
    const playerTop = playerY - PLAYER_SIZE / 2;
    const playerBottom = playerY + PLAYER_SIZE / 2;

    for (let obstacle of obstacles) {
        // Check if obstacle is at player position
        if (obstacle.x < playerRight && obstacle.x + OBSTACLE_WIDTH > playerLeft) {
            // Check if player shape matches hole shape
            if (playerShape !== obstacle.holeShape) {
                // Check if player is in the hole area
                if (!(playerTop >= obstacle.holeY - 25 && playerBottom <= obstacle.holeY + 25)) {
                    gameOver();
                    return;
                }
            }
        }
    }
}

// Level up
function levelUp() {
    level++;
    levelEl.textContent = level;
    messageEl.textContent = `Level ${level}! Speed increased!`;
    setTimeout(() => messageEl.textContent = '', 2000);
}

// Game over
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    messageEl.textContent = `Game Over! Final Score: ${score}`;
    pauseBtn.style.display = 'none';
    resetBtn.style.display = 'inline-block';
}

// Toggle pause
function togglePause() {
    gamePaused = !gamePaused;
    if (gamePaused) {
        pauseBtn.textContent = 'Resume';
        messageEl.textContent = 'Game Paused';
    } else {
        pauseBtn.textContent = 'Pause';
        messageEl.textContent = '';
        gameLoop(); // Resume the loop
    }
}

// Reset game
function resetGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    score = 0;
    level = 1;
    scoreEl.textContent = score;
    levelEl.textContent = level;
    messageEl.textContent = '';
    resetBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// Handle key presses
function handleKeyPress(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        if (gameRunning && !gamePaused) {
            changeShape();
        }
    }
}

// Change player shape
function changeShape() {
    playerShape = (playerShape + 1) % 3;
}

// Draw the game
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw player
    drawShape(50, playerY, playerShape, PLAYER_SIZE, 'white');

    // Draw obstacles
    obstacles.forEach(obstacle => {
        // Draw obstacle body
        ctx.fillStyle = '#e17055';
        ctx.fillRect(obstacle.x, 0, OBSTACLE_WIDTH, CANVAS_HEIGHT);

        // Draw hole
        ctx.clearRect(obstacle.x, obstacle.holeY - 25, OBSTACLE_WIDTH, 50);
        // Draw hole border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.holeY - 25, OBSTACLE_WIDTH, 50);

        // Draw shape indicator in hole
        drawShape(obstacle.x + OBSTACLE_WIDTH / 2, obstacle.holeY, obstacle.holeShape, 15, 'rgba(255,255,255,0.7)');
    });
}

// Draw a shape at given position
function drawShape(x, y, shapeType, size, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    switch (shapeType) {
        case 0: // Circle
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 1: // Square
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
            break;
        case 2: // Triangle
            ctx.beginPath();
            ctx.moveTo(x, y - size / 2);
            ctx.lineTo(x - size / 2, y + size / 2);
            ctx.lineTo(x + size / 2, y + size / 2);
            ctx.closePath();
            ctx.fill();
            break;
    }
}

// I added this to make the game more interesting
// Maybe add some particle effects or sounds later
console.log('Shape Shifter game loaded!');