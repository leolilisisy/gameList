// Race Track Game
// Race around the track, avoid obstacles, collect power-ups

// DOM elements
const canvas = document.getElementById('track-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');
const levelEl = document.getElementById('current-level');
const speedEl = document.getElementById('current-speed');
const lapEl = document.getElementById('current-lap');
const totalLapsEl = document.getElementById('total-laps');
const messageEl = document.getElementById('message');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CAR_WIDTH = 20;
const CAR_HEIGHT = 10;
const MAX_SPEED = 5;
const ACCELERATION = 0.2;
const FRICTION = 0.05;
const TURN_SPEED = 0.1;

// Game variables
let gameRunning = false;
let gamePaused = false;
let score = 0;
let level = 1;
let currentLap = 0;
let totalLaps = 3;
let car = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 100,
    angle: -Math.PI / 2, // Facing up
    speed: 0,
    vx: 0,
    vy: 0
};
let obstacles = [];
let powerUps = [];
let checkpoint = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 150, passed: false };
let animationId;
let keys = {};

// Track boundaries (simple oval shape)
const trackInner = [];
const trackOuter = [];

// Initialize track
function initTrack() {
    // Create oval track boundaries
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const innerRadiusX = 200;
    const innerRadiusY = 150;
    const outerRadiusX = 300;
    const outerRadiusY = 200;

    // Generate track points
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        // Inner boundary
        trackInner.push({
            x: centerX + Math.cos(angle) * innerRadiusX,
            y: centerY + Math.sin(angle) * innerRadiusY
        });
        // Outer boundary
        trackOuter.push({
            x: centerX + Math.cos(angle) * outerRadiusX,
            y: centerY + Math.sin(angle) * outerRadiusY
        });
    }
}

// Check if point is on track
function isOnTrack(x, y) {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

    // Simple check: between inner and outer radius
    return distance > 180 && distance < 320;
}

// Spawn obstacles and power-ups
function spawnItems() {
    obstacles = [];
    powerUps = [];

    // Spawn some obstacles
    for (let i = 0; i < 5 + level; i++) {
        let x, y;
        do {
            x = Math.random() * CANVAS_WIDTH;
            y = Math.random() * CANVAS_HEIGHT;
        } while (!isOnTrack(x, y) || Math.abs(x - car.x) < 100 || Math.abs(y - car.y) < 100);

        obstacles.push({ x, y, size: 15 });
    }

    // Spawn power-ups
    for (let i = 0; i < 3; i++) {
        let x, y;
        do {
            x = Math.random() * CANVAS_WIDTH;
            y = Math.random() * CANVAS_HEIGHT;
        } while (!isOnTrack(x, y));

        powerUps.push({ x, y, size: 12, type: 'speed' });
    }
}

// Start the game
function startGame() {
    score = 0;
    level = 1;
    currentLap = 0;
    car.x = CANVAS_WIDTH / 2;
    car.y = CANVAS_HEIGHT - 100;
    car.angle = -Math.PI / 2;
    car.speed = 0;
    car.vx = 0;
    car.vy = 0;
    checkpoint.passed = false;

    scoreEl.textContent = score;
    levelEl.textContent = level;
    lapEl.textContent = currentLap;
    totalLapsEl.textContent = totalLaps;
    messageEl.textContent = '';

    gameRunning = true;
    gamePaused = false;
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';

    spawnItems();
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
    // Handle input
    if (keys.ArrowUp) {
        car.speed = Math.min(car.speed + ACCELERATION, MAX_SPEED);
    } else if (keys.ArrowDown) {
        car.speed = Math.max(car.speed - ACCELERATION, -MAX_SPEED / 2);
    } else {
        car.speed *= (1 - FRICTION);
    }

    if (keys.ArrowLeft) {
        car.angle -= TURN_SPEED;
    }
    if (keys.ArrowRight) {
        car.angle += TURN_SPEED;
    }

    // Update velocity
    car.vx = Math.cos(car.angle) * car.speed;
    car.vy = Math.sin(car.angle) * car.speed;

    // Move car
    car.x += car.vx;
    car.y += car.vy;

    // Check track boundaries
    if (!isOnTrack(car.x, car.y)) {
        crash();
        return;
    }

    // Check obstacles
    for (let obstacle of obstacles) {
        const distance = Math.sqrt((car.x - obstacle.x) ** 2 + (car.y - obstacle.y) ** 2);
        if (distance < CAR_WIDTH / 2 + obstacle.size / 2) {
            crash();
            return;
        }
    }

    // Check power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        const distance = Math.sqrt((car.x - powerUp.x) ** 2 + (car.y - powerUp.y) ** 2);
        if (distance < CAR_WIDTH / 2 + powerUp.size / 2) {
            collectPowerUp(powerUp);
            powerUps.splice(i, 1);
        }
    }

    // Check checkpoint
    const checkpointDistance = Math.sqrt((car.x - checkpoint.x) ** 2 + (car.y - checkpoint.y) ** 2);
    if (checkpointDistance < 30) {
        if (!checkpoint.passed) {
            checkpoint.passed = true;
        }
    }

    // Check finish line (back at start)
    const finishDistance = Math.sqrt((car.x - CANVAS_WIDTH / 2) ** 2 + (car.y - (CANVAS_HEIGHT - 100)) ** 2);
    if (finishDistance < 30 && checkpoint.passed) {
        completeLap();
    }

    // Update speed display
    speedEl.textContent = Math.round(car.speed * 10);
}

// Collect power-up
function collectPowerUp(powerUp) {
    if (powerUp.type === 'speed') {
        car.speed = Math.min(car.speed + 2, MAX_SPEED);
        score += 50;
        messageEl.textContent = 'Speed boost!';
        setTimeout(() => messageEl.textContent = '', 1000);
    }
    scoreEl.textContent = score;
}

// Complete a lap
function completeLap() {
    currentLap++;
    checkpoint.passed = false;
    score += 100 * level;

    if (currentLap >= totalLaps) {
        levelComplete();
    } else {
        lapEl.textContent = currentLap;
        scoreEl.textContent = score;
        messageEl.textContent = `Lap ${currentLap} complete!`;
        setTimeout(() => messageEl.textContent = '', 2000);
    }
}

// Level complete
function levelComplete() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    level++;
    levelEl.textContent = level;
    messageEl.textContent = `All laps complete! Level ${level} unlocked.`;
    setTimeout(() => {
        messageEl.textContent = 'Get ready for next level...';
        setTimeout(() => {
            startGame();
        }, 2000);
    }, 3000);
}

// Crash
function crash() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    messageEl.textContent = 'Crashed! Game Over.';
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
        gameLoop();
    }
}

// Reset game
function resetGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    score = 0;
    level = 1;
    currentLap = 0;
    scoreEl.textContent = score;
    levelEl.textContent = level;
    lapEl.textContent = currentLap;
    messageEl.textContent = '';
    resetBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
}

// Draw the game
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw track
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw track boundaries (simplified)
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 200, 150, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 300, 200, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Draw obstacles
    ctx.fillStyle = '#e74c3c';
    obstacles.forEach(obstacle => {
        ctx.beginPath();
        ctx.arc(obstacle.x, obstacle.y, obstacle.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw power-ups
    ctx.fillStyle = '#f39c12';
    powerUps.forEach(powerUp => {
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw checkpoint
    ctx.fillStyle = '#9b59b6';
    ctx.fillRect(checkpoint.x - 15, checkpoint.y - 5, 30, 10);

    // Draw car
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(-CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT);
    ctx.restore();
}

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Initialize
initTrack();

// This racing game was challenging but fun
// The car physics took some tweaking to feel right
// Maybe add AI opponents or different track shapes later