// Spectral Sprint Game Script
// Run through ghostly realms, phasing through walls at the right moments.

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game variables
let player = { x: 100, y: 400, vy: 0, onGround: true, phasing: false };
let walls = [];
let obstacles = [];
let score = 0;
let gameRunning = true;
let cameraX = 0;

// Constants
const gravity = 0.6;
const jumpStrength = -15;
const groundY = 400;
const scrollSpeed = 5;

// Initialize game
function init() {
    // Create initial walls and obstacles
    createWall(300, true);
    createWall(500, false);
    createWall(700, true);
    createObstacle(400);
    createObstacle(600);

    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Player physics
    player.vy += gravity;
    player.y += player.vy;

    if (player.y >= groundY) {
        player.y = groundY;
        player.vy = 0;
        player.onGround = true;
    }

    // Move camera
    cameraX += scrollSpeed;
    score = Math.floor(cameraX / 10);

    // Move walls and obstacles
    walls.forEach(wall => wall.x -= scrollSpeed);
    obstacles.forEach(obs => obs.x -= scrollSpeed);

    // Remove off-screen elements
    walls = walls.filter(wall => wall.x > -100);
    obstacles = obstacles.filter(obs => obs.x > -100);

    // Add new elements
    if (Math.random() < 0.02) createWall(canvas.width + cameraX + 50, Math.random() < 0.5);
    if (Math.random() < 0.01) createObstacle(canvas.width + cameraX + 50);

    // Check collisions
    checkCollisions();
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#333';
    ctx.fillRect(0, groundY + 20, canvas.width, canvas.height - groundY - 20);

    // Draw walls
    walls.forEach(wall => {
        if (wall.ghostly) {
            ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
        } else {
            ctx.fillStyle = '#666';
        }
        ctx.fillRect(wall.x - cameraX, wall.y, wall.width, wall.height);
    });

    // Draw obstacles
    ctx.fillStyle = '#ff0000';
    obstacles.forEach(obs => {
        ctx.beginPath();
        ctx.moveTo(obs.x - cameraX + 10, groundY + 20);
        ctx.lineTo(obs.x - cameraX + 20, groundY);
        ctx.lineTo(obs.x - cameraX + 30, groundY + 20);
        ctx.closePath();
        ctx.fill();
    });

    // Draw player
    if (player.phasing) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    } else {
        ctx.fillStyle = '#ffffff';
    }
    ctx.fillRect(player.x, player.y, 20, 20);

    // Update score
    scoreElement.textContent = 'Distance: ' + score;
}

// Handle input
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && player.onGround) {
        player.vy = jumpStrength;
        player.onGround = false;
    }
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        player.phasing = true;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        player.phasing = false;
    }
});

// Create wall
function createWall(x, ghostly) {
    walls.push({ x: x, y: groundY - 100, width: 20, height: 100, ghostly: ghostly });
}

// Create obstacle
function createObstacle(x) {
    obstacles.push({ x: x });
}

// Check collisions
function checkCollisions() {
    // Player with walls
    walls.forEach(wall => {
        if (player.x < wall.x - cameraX + wall.width && player.x + 20 > wall.x - cameraX &&
            player.y < wall.y + wall.height && player.y + 20 > wall.y) {
            if (!wall.ghostly || !player.phasing) {
                gameRunning = false;
                alert('Collision! Game Over. Distance: ' + score);
            }
        }
    });

    // Player with obstacles
    obstacles.forEach(obs => {
        if (player.x < obs.x - cameraX + 30 && player.x + 20 > obs.x - cameraX &&
            player.y + 20 > groundY) {
            gameRunning = false;
            alert('Hit obstacle! Game Over. Distance: ' + score);
        }
    });
}

// Start the game
init();