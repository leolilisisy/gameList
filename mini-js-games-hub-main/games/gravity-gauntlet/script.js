// Gravity Gauntlet Game Script
// Manipulate gravity fields to guide a ball through challenging courses.

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game variables
let ball = { x: 100, y: 50, vx: 0, vy: 0, radius: 15 };
let platforms = [];
let gravityWells = [];
let goal = { x: 700, y: 550, width: 50, height: 50 };
let gameRunning = true;

// Constants
const gravity = 0.3;
const friction = 0.99;

// Initialize game
function init() {
    // Create platforms
    platforms.push({ x: 0, y: 100, width: 200, height: 10 });
    platforms.push({ x: 300, y: 200, width: 200, height: 10 });
    platforms.push({ x: 100, y: 300, width: 200, height: 10 });
    platforms.push({ x: 400, y: 400, width: 200, height: 10 });
    platforms.push({ x: 200, y: 500, width: 400, height: 10 });

    // Create gravity wells
    gravityWells.push({ x: 150, y: 150, radius: 50, active: false });
    gravityWells.push({ x: 450, y: 250, radius: 50, active: false });
    gravityWells.push({ x: 250, y: 350, radius: 50, active: false });
    gravityWells.push({ x: 550, y: 450, radius: 50, active: false });

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
    // Apply gravity
    ball.vy += gravity;

    // Apply gravity wells
    gravityWells.forEach(well => {
        if (well.active) {
            const dx = well.x - ball.x;
            const dy = well.y - ball.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 0) {
                const force = 0.5 / dist;
                ball.vx += (dx / dist) * force;
                ball.vy += (dy / dist) * force;
            }
        }
    });

    // Apply friction
    ball.vx *= friction;
    ball.vy *= friction;

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Check platform collisions
    platforms.forEach(platform => {
        if (ball.x + ball.radius > platform.x && ball.x - ball.radius < platform.x + platform.width &&
            ball.y + ball.radius > platform.y && ball.y - ball.radius < platform.y + platform.height) {
            if (ball.vy > 0) {
                ball.y = platform.y - ball.radius;
                ball.vy = 0;
            }
        }
    });

    // Check goal
    if (ball.x > goal.x && ball.x < goal.x + goal.width &&
        ball.y > goal.y && ball.y < goal.y + goal.height) {
        gameRunning = false;
        alert('You reached the goal!');
    }

    // Reset if off screen
    if (ball.y > canvas.height + 50) {
        ball.x = 100;
        ball.y = 50;
        ball.vx = 0;
        ball.vy = 0;
        gravityWells.forEach(well => well.active = false);
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = '#666666';
    platforms.forEach(platform => ctx.fillRect(platform.x, platform.y, platform.width, platform.height));

    // Draw gravity wells
    gravityWells.forEach(well => {
        ctx.fillStyle = well.active ? '#ff00ff' : '#800080';
        ctx.beginPath();
        ctx.arc(well.x, well.y, well.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw goal
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);

    // Draw ball
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Handle click
canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicked on a gravity well
    gravityWells.forEach(well => {
        const dist = Math.sqrt((mouseX - well.x)**2 + (mouseY - well.y)**2);
        if (dist < well.radius) {
            well.active = !well.active;
        }
    });
});

// Start the game
init();