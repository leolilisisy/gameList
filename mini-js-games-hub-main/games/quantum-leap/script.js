// Quantum Leap Game Script
// This game lets you jump through quantum portals, avoiding obstacles and collecting energy particles.

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game variables
let player = { x: 100, y: 400, width: 20, height: 20, velocityY: 0, onGround: true };
let obstacles = [];
let particles = [];
let portals = [];
let score = 0;
let gameRunning = true;

// Constants
const gravity = 0.5;
const jumpStrength = -12;
const groundY = 400;
const scrollSpeed = 3;

// Initialize game
function init() {
    // Create initial obstacles and portals
    createObstacle(600);
    createPortal(800);
    createParticle(500);
    createParticle(700);

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
    player.velocityY += gravity;
    player.y += player.velocityY;

    if (player.y >= groundY) {
        player.y = groundY;
        player.velocityY = 0;
        player.onGround = true;
    }

    // Move obstacles, portals, particles left
    obstacles.forEach(ob => ob.x -= scrollSpeed);
    portals.forEach(p => p.x -= scrollSpeed);
    particles.forEach(p => p.x -= scrollSpeed);

    // Remove off-screen elements
    obstacles = obstacles.filter(ob => ob.x > -50);
    portals = portals.filter(p => p.x > -50);
    particles = particles.filter(p => p.x > -50);

    // Add new elements randomly
    if (Math.random() < 0.01) createObstacle(canvas.width + 50);
    if (Math.random() < 0.005) createPortal(canvas.width + 50);
    if (Math.random() < 0.02) createParticle(canvas.width + 50);

    // Check collisions
    checkCollisions();
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#001122';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#333';
    ctx.fillRect(0, groundY + 20, canvas.width, canvas.height - groundY - 20);

    // Draw player
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw obstacles
    ctx.fillStyle = '#ff0000';
    obstacles.forEach(ob => ctx.fillRect(ob.x, ob.y, ob.width, ob.height));

    // Draw portals
    ctx.fillStyle = '#800080';
    portals.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    // Draw particles
    ctx.fillStyle = '#ffff00';
    particles.forEach(p => ctx.beginPath(), ctx.arc(p.x, p.y, 5, 0, Math.PI * 2), ctx.fill());

    // Update score display
    scoreElement.textContent = 'Score: ' + score;
}

// Handle input
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && player.onGround) {
        player.velocityY = jumpStrength;
        player.onGround = false;
    }
});

// Create obstacle
function createObstacle(x) {
    obstacles.push({ x: x, y: groundY - 30, width: 20, height: 30 });
}

// Create portal
function createPortal(x) {
    portals.push({ x: x, y: groundY - 50, width: 30, height: 50 });
}

// Create particle
function createParticle(x) {
    particles.push({ x: x, y: Math.random() * 200 + 200 });
}

// Check collisions
function checkCollisions() {
    // Player with obstacles
    obstacles.forEach(ob => {
        if (player.x < ob.x + ob.width && player.x + player.width > ob.x &&
            player.y < ob.y + ob.height && player.y + player.height > ob.y) {
            gameRunning = false;
            alert('Game Over! Score: ' + score);
        }
    });

    // Player with portals
    portals.forEach(p => {
        if (player.x < p.x + p.width && player.x + player.width > p.x &&
            player.y < p.y + p.height && player.y + player.height > p.y) {
            // Teleport forward
            player.x += 200;
            score += 10;
        }
    });

    // Player with particles
    particles.forEach((p, index) => {
        if (Math.abs(player.x - p.x) < 15 && Math.abs(player.y - p.y) < 15) {
            particles.splice(index, 1);
            score += 5;
        }
    });
}

// Start the game
init();