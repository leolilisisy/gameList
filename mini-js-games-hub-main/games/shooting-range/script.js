// Shooting Range Game
// Click to shoot targets and score points

// DOM elements
const canvas = document.getElementById('range-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');
const levelEl = document.getElementById('current-level');
const ammoEl = document.getElementById('current-ammo');
const timerEl = document.getElementById('time-left');
const messageEl = document.getElementById('message');
const startBtn = document.getElementById('start-btn');
const reloadBtn = document.getElementById('reload-btn');
const resetBtn = document.getElementById('reset-btn');

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

// Game variables
let gameRunning = false;
let score = 0;
let level = 1;
let ammo = 10;
let timeLeft = 30;
let targets = [];
let animationId;
let lastTargetSpawn = 0;

// Target types
const targetTypes = [
    { name: 'bullseye', size: 40, points: 50, color: '#e74c3c', speed: 0 },
    { name: 'moving', size: 30, points: 75, color: '#f39c12', speed: 2 },
    { name: 'bonus', size: 20, points: 100, color: '#27ae60', speed: 1 }
];

// Start the game
function startGame() {
    score = 0;
    level = 1;
    ammo = 10;
    timeLeft = 30;
    targets = [];

    scoreEl.textContent = score;
    levelEl.textContent = level;
    ammoEl.textContent = ammo;
    timerEl.textContent = timeLeft;
    messageEl.textContent = '';

    gameRunning = true;
    startBtn.style.display = 'none';
    reloadBtn.style.display = 'none';

    gameLoop();
    startTimer();
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;

    updateGame();
    drawGame();

    animationId = requestAnimationFrame(gameLoop);
}

// Update game state
function updateGame() {
    // Spawn new targets
    if (Date.now() - lastTargetSpawn > 2000 - level * 100) {
        spawnTarget();
        lastTargetSpawn = Date.now();
    }

    // Move targets
    targets.forEach(target => {
        if (target.type === 'moving') {
            target.x += target.speed;
            // Bounce off edges
            if (target.x <= target.size / 2 || target.x >= CANVAS_WIDTH - target.size / 2) {
                target.speed *= -1;
            }
        }
    });

    // Remove off-screen targets
    targets = targets.filter(target => target.x > -50 && target.x < CANVAS_WIDTH + 50);
}

// Spawn a random target
function spawnTarget() {
    const type = targetTypes[Math.floor(Math.random() * targetTypes.length)];
    const y = Math.random() * (CANVAS_HEIGHT - 100) + 50;
    let x;

    if (type.name === 'moving') {
        x = Math.random() < 0.5 ? -25 : CANVAS_WIDTH + 25;
    } else {
        x = Math.random() * (CANVAS_WIDTH - 100) + 50;
    }

    targets.push({
        x: x,
        y: y,
        ...type,
        lifetime: 0
    });
}

// Handle canvas click (shooting)
canvas.addEventListener('click', (event) => {
    if (!gameRunning) return;

    if (ammo <= 0) {
        messageEl.textContent = 'Out of ammo! Reload needed.';
        reloadBtn.style.display = 'inline-block';
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    ammo--;
    ammoEl.textContent = ammo;

    // Check if hit any target
    let hit = false;
    targets.forEach((target, index) => {
        const distance = Math.sqrt((clickX - target.x) ** 2 + (clickY - target.y) ** 2);
        if (distance < target.size / 2) {
            hitTarget(target, index);
            hit = true;
        }
    });

    if (!hit) {
        // Miss
        messageEl.textContent = 'Miss!';
        setTimeout(() => messageEl.textContent = '', 500);
    }

    if (ammo <= 0) {
        reloadBtn.style.display = 'inline-block';
    }
});

// Hit a target
function hitTarget(target, index) {
    targets.splice(index, 1);
    score += target.points;
    scoreEl.textContent = score;

    messageEl.textContent = `Hit! +${target.points} points`;
    setTimeout(() => messageEl.textContent = '', 1000);
}

// Reload ammo
function reloadAmmo() {
    if (score >= 50) {
        score -= 50;
        ammo = 10;
        scoreEl.textContent = score;
        ammoEl.textContent = ammo;
        reloadBtn.style.display = 'none';
        messageEl.textContent = 'Reloaded!';
        setTimeout(() => messageEl.textContent = '', 1000);
    } else {
        messageEl.textContent = 'Not enough points to reload!';
        setTimeout(() => messageEl.textContent = '', 2000);
    }
}

// Start timer
function startTimer() {
    const timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            levelComplete();
        }
    }, 1000);
}

// Level complete
function levelComplete() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    level++;
    levelEl.textContent = level;
    messageEl.textContent = `Time's up! Level ${level} unlocked.`;
    setTimeout(() => {
        messageEl.textContent = 'Get ready for next level...';
        setTimeout(() => {
            startGame();
        }, 2000);
    }, 3000);
}

// Reset game
function resetGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    score = 0;
    level = 1;
    ammo = 10;
    scoreEl.textContent = score;
    levelEl.textContent = level;
    ammoEl.textContent = ammo;
    timerEl.textContent = '30';
    messageEl.textContent = '';
    resetBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    reloadBtn.style.display = 'none';
}

// Draw the game
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50);

    // Draw targets
    targets.forEach(target => {
        ctx.fillStyle = target.color;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw target rings
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size / 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size / 8, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// Event listeners
startBtn.addEventListener('click', startGame);
reloadBtn.addEventListener('click', reloadAmmo);
resetBtn.addEventListener('click', resetGame);

// This shooting game was straightforward but fun
// The click-to-shoot mechanic works well with canvas
// Could add different weapons or target patterns later