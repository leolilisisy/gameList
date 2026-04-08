// Pixel Pirate Game Script
// Sail the seas, battle enemy ships, and hunt for treasure.

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const healthElement = document.getElementById('health');

// Game variables
let player = { x: 400, y: 300, width: 30, height: 20, speed: 3, health: 100 };
let enemies = [];
let cannonballs = [];
let treasures = [];
let score = 0;
let gameRunning = true;
let keys = {};

// Constants
const enemySpeed = 1;
const cannonballSpeed = 5;
const treasureValue = 50;

// Initialize game
function init() {
    // Create initial enemies and treasures
    for (let i = 0; i < 3; i++) {
        createEnemy();
        createTreasure();
    }

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
    // Handle input
    if (keys.w) player.y = Math.max(player.y - player.speed, 0);
    if (keys.s) player.y = Math.min(player.y + player.speed, canvas.height - player.height);
    if (keys.a) player.x = Math.max(player.x - player.speed, 0);
    if (keys.d) player.x = Math.min(player.x + player.speed, canvas.width - player.width);

    // Move enemies
    enemies.forEach(enemy => {
        // Simple AI: move towards player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 0) {
            enemy.x += (dx / dist) * enemySpeed;
            enemy.y += (dy / dist) * enemySpeed;
        }
    });

    // Move cannonballs
    cannonballs.forEach(ball => {
        ball.x += ball.dx;
        ball.y += ball.dy;
    });

    // Remove off-screen cannonballs
    cannonballs = cannonballs.filter(ball =>
        ball.x > 0 && ball.x < canvas.width && ball.y > 0 && ball.y < canvas.height
    );

    // Check collisions
    checkCollisions();
}

// Draw everything
function draw() {
    // Clear canvas with sea effect
    ctx.fillStyle = '#001122';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player ship
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(player.x + 25, player.y + 5, 5, 10); // Sail

    // Draw enemies
    ctx.fillStyle = '#FF0000';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = '#000000';
        ctx.fillRect(enemy.x + 25, enemy.y + 5, 5, 10); // Enemy sail
        ctx.fillStyle = '#FF0000';
    });

    // Draw cannonballs
    ctx.fillStyle = '#000000';
    cannonballs.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw treasures
    ctx.fillStyle = '#FFD700';
    treasures.forEach(treasure => {
        ctx.beginPath();
        ctx.arc(treasure.x, treasure.y, 8, 0, Math.PI * 2);
        ctx.fill();
    });

    // Update displays
    scoreElement.textContent = 'Score: ' + score;
    healthElement.textContent = 'Health: ' + player.health;
}

// Handle input
document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'w') keys.w = true;
    if (e.key.toLowerCase() === 'a') keys.a = true;
    if (e.key.toLowerCase() === 's') keys.s = true;
    if (e.key.toLowerCase() === 'd') keys.d = true;
});

document.addEventListener('keyup', e => {
    if (e.key.toLowerCase() === 'w') keys.w = false;
    if (e.key.toLowerCase() === 'a') keys.a = false;
    if (e.key.toLowerCase() === 's') keys.s = false;
    if (e.key.toLowerCase() === 'd') keys.d = false;
});

canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Fire cannonball towards mouse
    const dx = mouseX - (player.x + player.width/2);
    const dy = mouseY - (player.y + player.height/2);
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 0) {
        cannonballs.push({
            x: player.x + player.width/2,
            y: player.y + player.height/2,
            dx: (dx / dist) * cannonballSpeed,
            dy: (dy / dist) * cannonballSpeed
        });
    }
});

// Create enemy
function createEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 30),
        y: Math.random() * (canvas.height - 20),
        width: 30,
        height: 20,
        health: 2
    });
}

// Create treasure
function createTreasure() {
    treasures.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
    });
}

// Check collisions
function checkCollisions() {
    // Cannonballs with enemies
    cannonballs.forEach((ball, bi) => {
        enemies.forEach((enemy, ei) => {
            if (ball.x > enemy.x && ball.x < enemy.x + enemy.width &&
                ball.y > enemy.y && ball.y < enemy.y + enemy.height) {
                cannonballs.splice(bi, 1);
                enemy.health--;
                if (enemy.health <= 0) {
                    enemies.splice(ei, 1);
                    score += 100;
                    createEnemy(); // Spawn new enemy
                }
            }
        });
    });

    // Player with treasures
    treasures.forEach((treasure, i) => {
        if (Math.abs(player.x + player.width/2 - treasure.x) < 20 &&
            Math.abs(player.y + player.height/2 - treasure.y) < 20) {
            treasures.splice(i, 1);
            score += treasureValue;
            createTreasure(); // Spawn new treasure
        }
    });

    // Player with enemies (collision damage)
    enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
            player.health -= 10;
            if (player.health <= 0) {
                gameRunning = false;
                alert('Your ship sank! Game Over. Score: ' + score);
            }
        }
    });
}

// Start the game
init();