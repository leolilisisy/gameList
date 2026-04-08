// Echo Chamber Game Script
// Bounce sound waves off walls to hit targets in this audio-visual puzzle.

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game variables
let player = { x: 400, y: 300 };
let waves = [];
let targets = [];
let walls = [];
let score = 0;
let gameRunning = true;

// Constants
const waveSpeed = 5;
const targetRadius = 20;

// Initialize game
function init() {
    // Create walls
    walls.push({ x: 100, y: 100, width: 600, height: 10 }); // Top
    walls.push({ x: 100, y: 490, width: 600, height: 10 }); // Bottom
    walls.push({ x: 100, y: 100, width: 10, height: 400 }); // Left
    walls.push({ x: 690, y: 100, width: 10, height: 400 }); // Right
    walls.push({ x: 300, y: 200, width: 200, height: 10 }); // Middle horizontal
    walls.push({ x: 400, y: 300, width: 10, height: 200 }); // Middle vertical

    // Create targets
    targets.push({ x: 200, y: 150, color: '#ff0000', frequency: 1 });
    targets.push({ x: 600, y: 150, color: '#00ff00', frequency: 2 });
    targets.push({ x: 200, y: 450, color: '#0000ff', frequency: 3 });
    targets.push({ x: 600, y: 450, color: '#ffff00', frequency: 4 });

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
    // Move waves
    waves.forEach(wave => {
        wave.x += wave.dx;
        wave.y += wave.dy;

        // Check wall collisions
        walls.forEach(wall => {
            if (wave.x > wall.x && wave.x < wall.x + wall.width &&
                wave.y > wall.y && wave.y < wall.y + wall.height) {
                // Bounce
                if (wave.dx > 0 && wave.x - wall.x < 5) wave.dx = -wave.dx;
                if (wave.dx < 0 && wall.x + wall.width - wave.x < 5) wave.dx = -wave.dx;
                if (wave.dy > 0 && wave.y - wall.y < 5) wave.dy = -wave.dy;
                if (wave.dy < 0 && wall.y + wall.height - wave.y < 5) wave.dy = -wave.dy;
            }
        });

        // Check target collisions
        targets.forEach((target, i) => {
            const dist = Math.sqrt((wave.x - target.x)**2 + (wave.y - target.y)**2);
            if (dist < targetRadius) {
                targets.splice(i, 1);
                score += 10;
                if (targets.length === 0) {
                    gameRunning = false;
                    alert('All targets destroyed! Score: ' + score);
                }
            }
        });
    });

    // Remove waves that are off-screen
    waves = waves.filter(wave => wave.x > 0 && wave.x < canvas.width && wave.y > 0 && wave.y < canvas.height);
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000022';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw walls
    ctx.fillStyle = '#666666';
    walls.forEach(wall => ctx.fillRect(wall.x, wall.y, wall.width, wall.height));

    // Draw targets
    targets.forEach(target => {
        ctx.fillStyle = target.color;
        ctx.beginPath();
        ctx.arc(target.x, target.y, targetRadius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw player
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw waves
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    waves.forEach(wave => {
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, 5, 0, Math.PI * 2);
        ctx.stroke();
    });

    // Update score
    scoreElement.textContent = 'Score: ' + score;
}

// Handle click
canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Launch wave towards mouse
    const dx = mouseX - player.x;
    const dy = mouseY - player.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 0) {
        waves.push({
            x: player.x,
            y: player.y,
            dx: (dx / dist) * waveSpeed,
            dy: (dy / dist) * waveSpeed
        });
    }
});

// Start the game
init();