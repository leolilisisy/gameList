// Fishing Frenzy Game
// Click to catch fish swimming by - different sizes worth different points

// DOM elements
const canvas = document.getElementById('fishing-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');
const levelEl = document.getElementById('current-level');
const timerEl = document.getElementById('time-left');
const caughtEl = document.getElementById('caught-count');
const messageEl = document.getElementById('message');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const HOOK_SIZE = 10;

// Game variables
let gameRunning = false;
let gamePaused = false;
let score = 0;
let level = 1;
let timeLeft = 60;
let fishCaught = 0;
let hookX = CANVAS_WIDTH / 2;
let hookY = CANVAS_HEIGHT - 50;
let fish = [];
let animationId;
let lastFishSpawn = 0;

// Fish types with different properties
const fishTypes = [
    { name: 'small', size: 20, speed: 1, points: 10, color: '#FF6B6B' },
    { name: 'medium', size: 30, speed: 1.5, points: 25, color: '#4ECDC4' },
    { name: 'large', size: 40, speed: 2, points: 50, color: '#45B7D1' },
    { name: 'rare', size: 25, speed: 0.8, points: 100, color: '#F9CA24' }
];

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
canvas.addEventListener('mousemove', moveHook);
canvas.addEventListener('click', castLine);

// Start the game
function startGame() {
    // Reset everything
    score = 0;
    level = 1;
    timeLeft = 60;
    fishCaught = 0;
    fish = [];
    gameRunning = true;
    gamePaused = false;

    // Update UI
    scoreEl.textContent = score;
    levelEl.textContent = level;
    timerEl.textContent = timeLeft;
    caughtEl.textContent = fishCaught;
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
    // Spawn new fish
    if (Date.now() - lastFishSpawn > 2000 - level * 100) {
        spawnFish();
        lastFishSpawn = Date.now();
    }

    // Move fish
    fish.forEach(f => {
        f.x += f.speed;
    });

    // Remove fish that swam off screen
    fish = fish.filter(f => f.x < CANVAS_WIDTH + 50);

    // Update timer
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 0) {
        gameOver();
    }
}

// Spawn a random fish
function spawnFish() {
    const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    const y = Math.random() * (CANVAS_HEIGHT - 100) + 50; // Random depth

    fish.push({
        x: -50,
        y: y,
        ...type
    });
}

// Move hook with mouse
function moveHook(event) {
    const rect = canvas.getBoundingClientRect();
    hookX = event.clientX - rect.left;
    hookY = event.clientY - rect.top;
}

// Cast line (try to catch fish)
function castLine() {
    if (!gameRunning || gamePaused) return;

    // Check if hook is near any fish
    fish.forEach((f, index) => {
        const distance = Math.sqrt((f.x - hookX) ** 2 + (f.y - hookY) ** 2);
        if (distance < f.size / 2 + HOOK_SIZE) {
            // Caught a fish!
            catchFish(f, index);
        }
    });
}

// Catch a fish
function catchFish(fishData, index) {
    // Remove fish from array
    fish.splice(index, 1);

    // Add score
    score += fishData.points;
    fishCaught++;

    // Update UI
    scoreEl.textContent = score;
    caughtEl.textContent = fishCaught;

    // Show catch message
    messageEl.textContent = `Caught a ${fishData.name} fish! +${fishData.points} points`;
    setTimeout(() => messageEl.textContent = '', 1500);

    // Level up every 10 fish
    if (fishCaught > 0 && fishCaught % 10 === 0) {
        level++;
        levelEl.textContent = level;
        messageEl.textContent = `Level ${level}! Fish are faster now!`;
        setTimeout(() => messageEl.textContent = '', 2000);
    }
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

// Game over
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    messageEl.textContent = `Time's up! Final Score: ${score} (${fishCaught} fish caught)`;
    pauseBtn.style.display = 'none';
    resetBtn.style.display = 'inline-block';
}

// Reset game
function resetGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    score = 0;
    level = 1;
    fishCaught = 0;
    scoreEl.textContent = score;
    levelEl.textContent = level;
    caughtEl.textContent = fishCaught;
    messageEl.textContent = '';
    resetBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// Draw the game
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw water effect
    ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, Math.random() * 30 + 10, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw fish
    fish.forEach(f => {
        drawFish(f);
    });

    // Draw hook
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(hookX, hookY, HOOK_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Draw fishing line
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hookX, hookY);
    ctx.lineTo(hookX, CANVAS_HEIGHT);
    ctx.stroke();
}

// Draw a fish
function drawFish(f) {
    ctx.fillStyle = f.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // Fish body (ellipse)
    ctx.beginPath();
    ctx.ellipse(f.x, f.y, f.size, f.size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Fish tail
    ctx.beginPath();
    ctx.moveTo(f.x - f.size, f.y);
    ctx.lineTo(f.x - f.size - 10, f.y - 5);
    ctx.lineTo(f.x - f.size - 10, f.y + 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fish eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(f.x + f.size / 3, f.y - f.size / 4, 3, 0, Math.PI * 2);
    ctx.fill();
}

// I really enjoyed making this fishing game
// The mouse interaction feels smooth and the different fish sizes add nice variety
// Maybe I'll add sound effects or different fishing rods later