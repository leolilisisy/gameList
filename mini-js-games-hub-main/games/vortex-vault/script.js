// Vortex Vault Game Script
// Dive into swirling vortices to collect treasures while avoiding suction traps.

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game variables
let player = { x: 400, y: 300, vx: 0, vy: 0, speed: 2 };
let vortices = [];
let treasures = [];
let traps = [];
let score = 0;
let gameRunning = true;
let inVortex = false;

// Constants
const friction = 0.95;

// Initialize game
function init() {
    // Create vortices
    vortices.push({ x: 200, y: 200, radius: 80, strength: 0.5 });
    vortices.push({ x: 600, y: 400, radius: 80, strength: 0.5 });

    // Create treasures
    treasures.push({ x: 150, y: 150 });
    treasures.push({ x: 650, y: 150 });
    treasures.push({ x: 150, y: 450 });
    treasures.push({ x: 650, y: 450 });

    // Create traps
    traps.push({ x: 400, y: 100, width: 50, height: 50 });
    traps.push({ x: 400, y: 500, width: 50, height: 50 });

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
    if (keys.ArrowUp) player.vy -= player.speed * 0.1;
    if (keys.ArrowDown) player.vy += player.speed * 0.1;
    if (keys.ArrowLeft) player.vx -= player.speed * 0.1;
    if (keys.ArrowRight) player.vx += player.speed * 0.1;

    // Apply vortex forces
    vortices.forEach(vortex => {
        const dx = vortex.x - player.x;
        const dy = vortex.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < vortex.radius) {
            inVortex = true;
            const force = vortex.strength / dist;
            player.vx += (dx / dist) * force;
            player.vy += (dy / dist) * force;
        }
    });

    // Apply friction
    player.vx *= friction;
    player.vy *= friction;

    // Move player
    player.x += player.vx;
    player.y += player.vy;

    // Keep in bounds
    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height;
    if (player.y > canvas.height) player.y = 0;

    // Check treasure collection
    treasures.forEach((treasure, i) => {
        if (Math.abs(player.x - treasure.x) < 20 && Math.abs(player.y - treasure.y) < 20) {
            treasures.splice(i, 1);
            score++;
            if (treasures.length === 0) {
                gameRunning = false;
                alert('All treasures collected! You win!');
            }
        }
    });

    // Check trap collision
    traps.forEach(trap => {
        if (player.x > trap.x && player.x < trap.x + trap.width &&
            player.y > trap.y && player.y < trap.y + trap.height) {
            gameRunning = false;
            alert('Sucked into a trap! Game Over. Treasures: ' + score);
        }
    });
}

// Draw everything
function draw() {
    // Clear canvas with water effect
    ctx.fillStyle = '#000022';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw vortices
    vortices.forEach(vortex => {
        ctx.strokeStyle = '#0080ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(vortex.x, vortex.y, vortex.radius, 0, Math.PI * 2);
        ctx.stroke();
        // Swirl effect
        ctx.beginPath();
        ctx.arc(vortex.x, vortex.y, vortex.radius * 0.5, 0, Math.PI * 2);
        ctx.stroke();
    });

    // Draw treasures
    ctx.fillStyle = '#ffff00';
    treasures.forEach(treasure => {
        ctx.beginPath();
        ctx.arc(treasure.x, treasure.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw traps
    ctx.fillStyle = '#ff0000';
    traps.forEach(trap => ctx.fillRect(trap.x, trap.y, trap.width, trap.height));

    // Draw player
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Update score
    scoreElement.textContent = 'Treasures: ' + score;
}

// Handle input
let keys = {};
document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Space' && inVortex) {
        // Jump out: teleport to random edge
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { player.x = 0; player.y = Math.random() * canvas.height; }
        else if (side === 1) { player.x = canvas.width; player.y = Math.random() * canvas.height; }
        else if (side === 2) { player.x = Math.random() * canvas.width; player.y = 0; }
        else { player.x = Math.random() * canvas.width; player.y = canvas.height; }
        player.vx = 0;
        player.vy = 0;
        inVortex = false;
    }
});
document.addEventListener('keyup', e => keys[e.code] = false);

// Start the game
init();