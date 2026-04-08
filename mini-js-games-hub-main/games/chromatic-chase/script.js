// Chromatic Chase Game Script
// Chase shifting colors through a dynamic landscape, matching hues to unlock paths.

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game variables
let player = { x: 50, y: 300, color: 'red', speed: 3 };
let zones = [];
let orbs = [];
let goal = { x: 750, y: 300, width: 30, height: 30 };
let score = 0;
let gameRunning = true;
let colorCycle = 0;

// Colors
const colors = ['red', 'green', 'blue', 'yellow'];

// Initialize game
function init() {
    // Create zones
    zones.push({ x: 0, y: 0, width: 200, height: 600, color: 'red' });
    zones.push({ x: 200, y: 0, width: 200, height: 600, color: 'green' });
    zones.push({ x: 400, y: 0, width: 200, height: 600, color: 'blue' });
    zones.push({ x: 600, y: 0, width: 200, height: 600, color: 'yellow' });

    // Create orbs
    orbs.push({ x: 150, y: 150, color: 'green' });
    orbs.push({ x: 350, y: 450, color: 'blue' });
    orbs.push({ x: 550, y: 150, color: 'yellow' });
    orbs.push({ x: 750, y: 450, color: 'red' });

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
    // Move player
    updatePlayer();

    // Shift colors
    colorCycle++;
    if (colorCycle % 100 === 0) {
        zones.forEach(zone => {
            const currentIndex = colors.indexOf(zone.color);
            zone.color = colors[(currentIndex + 1) % colors.length];
        });
    }

    // Check zone collision
    let currentZone = null;
    zones.forEach(zone => {
        if (player.x >= zone.x && player.x < zone.x + zone.width &&
            player.y >= zone.y && player.y < zone.y + zone.height) {
            currentZone = zone;
        }
    });

    // If not matching color, reset position
    if (currentZone && player.color !== currentZone.color) {
        player.x = 50;
        player.y = 300;
    }

    // Check orb collection
    orbs.forEach((orb, i) => {
        if (Math.abs(player.x - orb.x) < 20 && Math.abs(player.y - orb.y) < 20) {
            player.color = orb.color;
            orbs.splice(i, 1);
            score += 10;
        }
    });

    // Check goal
    if (player.x > goal.x && player.x < goal.x + goal.width &&
        player.y > goal.y && player.y < goal.y + goal.height) {
        gameRunning = false;
        alert('You reached the goal! Score: ' + score);
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#001100';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw zones
    zones.forEach(zone => {
        ctx.fillStyle = zone.color;
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
    });

    // Draw orbs
    orbs.forEach(orb => {
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw goal
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);

    // Draw player
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Update score
    scoreElement.textContent = 'Score: ' + score;
}

// Handle input
let keys = {};
document.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
});

// Move player
function updatePlayer() {
    if (keys.w) player.y = Math.max(player.y - player.speed, 0);
    if (keys.s) player.y = Math.min(player.y + player.speed, canvas.height);
    if (keys.a) player.x = Math.max(player.x - player.speed, 0);
    if (keys.d) player.x = Math.min(player.x + player.speed, canvas.width);
}

// Start the game
init();