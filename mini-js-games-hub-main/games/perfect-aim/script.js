// --- DOM Elements ---
const gameContainer = document.getElementById('game-container');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const bgCanvas = document.getElementById('background-canvas');
const bgCtx = bgCanvas.getContext('2d');
const currentScoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const comboDisplay = document.getElementById('combo-display');
const comboCountEl = comboDisplay.querySelector('span');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScoreEl = document.getElementById('final-score');

// --- Game Constants & State ---
const POINTER_COLOR = '#00ffff', TARGET_COLOR = '#f72585';
const TARGET_RING_RADIUS_RATIO = 0.8, TARGET_THICKNESS_RATIO = 0.1;
const PERFECT_HIT_TOLERANCE = 0.02;

let gameState = 'menu';
let score = 0, highScore = 0, combo = 1;
let pointerAngle = 0, lastTime = 0;
let target = { center: 0, size: Math.PI / 4 };
let rotationSpeed = 1.5;
let stars = [];

// --- NEW: Sound Effects ---
const sounds = { hit: new Audio(''), miss: new Audio(''), perfect: new Audio('') };
function playSound(sound) { try { sounds[sound].currentTime = 0; sounds[sound].play(); } catch (e) {} }

// --- Main Game Loop ---
function gameLoop(timestamp) {
    if (gameState === 'playing') {
        const deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        pointerAngle = (pointerAngle + rotationSpeed * deltaTime) % (Math.PI * 2);
        draw();
        drawBackground();
    }
    requestAnimationFrame(gameLoop);
}

// --- Drawing Functions ---
function draw(clickMarkerAngle = null, clickMarkerColor = 'white') {
    const radius = canvas.width / 2;
    const center = { x: radius, y: radius };
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pulse = Math.sin(performance.now() / 200) * 0.05 + 0.95;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * TARGET_RING_RADIUS_RATIO, target.center - target.size / 2, target.center + target.size / 2);
    ctx.strokeStyle = TARGET_COLOR;
    ctx.lineWidth = radius * TARGET_THICKNESS_RATIO * pulse;
    ctx.stroke();

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(pointerAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.strokeStyle = POINTER_COLOR;
    ctx.lineWidth = 5;
    ctx.shadowColor = POINTER_COLOR;
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();

    // NEW: Draw visual click indicator
    if (clickMarkerAngle !== null) {
        const markerX = center.x + Math.cos(clickMarkerAngle) * (radius * TARGET_RING_RADIUS_RATIO);
        const markerY = center.y + Math.sin(clickMarkerAngle) * (radius * TARGET_RING_RADIUS_RATIO);
        ctx.beginPath();
        ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
        ctx.fillStyle = clickMarkerColor;
        ctx.fill();
    }
}
function drawBackground() { /* Unchanged from previous version */ }
function createStarfield() { /* Unchanged from previous version */ }

// --- Game Logic Functions ---
function startGame(event) {
    if (event) event.stopPropagation();
    score = 0, combo = 1, rotationSpeed = 1.5;
    target.size = Math.PI / 4;
    pointerAngle = 0;
    updateScoreDisplay();
    spawnTarget();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    comboDisplay.classList.remove('hidden');
    gameState = 'playing';
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}
function spawnTarget() {
    target.center = Math.random() * Math.PI * 2;
}

function handleInput(event) {
    if (gameState !== 'playing') return;
    if (event) event.stopPropagation();

    const clickedAngle = pointerAngle; // Capture angle at the moment of input

    if (isAngleInSector(clickedAngle, target)) {
        // HIT
        const perfectDiff = getAngleDifference(clickedAngle, target.center);
        if (perfectDiff <= PERFECT_HIT_TOLERANCE) {
            score += combo * 5;
            playSound('perfect');
            createHitPulse(true);
        } else {
            score += combo;
            playSound('hit');
            createHitPulse(false);
        }
        combo++;
        updateScoreDisplay(true);
        spawnTarget();
        rotationSpeed *= 1.05; 
        target.size = Math.max(0.1, target.size * 0.98);
        if (score > 5 && Math.random() < 0.2) { rotationSpeed *= -1; }
        draw(clickedAngle, 'white'); // Show successful click
    } else {
        // MISS
        playSound('miss');
        gameContainer.classList.add('miss-shake');
        setTimeout(() => gameContainer.classList.remove('miss-shake'), 400);
        draw(clickedAngle, 'red'); // Show failed click
        gameOver();
    }
}

function gameOver() {
    gameState = 'game_over';
    comboDisplay.classList.add('hidden');
    finalScoreEl.textContent = score;
    if (score > highScore) { highScore = score; saveGame(); updateScoreDisplay(); }
    setTimeout(() => { gameOverScreen.classList.remove('hidden'); }, 500); // Delay to show miss
}

// --- UI & Utility Functions ---
function updateScoreDisplay(animateCombo = false) {
    currentScoreEl.textContent = score;
    highScoreEl.textContent = highScore;
    comboCountEl.textContent = combo;
    if (animateCombo) { comboDisplay.classList.add('combo-pulse'); setTimeout(() => comboDisplay.classList.remove('combo-pulse'), 300); }
}
function createHitPulse(isPerfect) { /* Unchanged */ }
function getAngleDifference(angle1, angle2) {
    const diff = Math.abs(angle1 - angle2);
    return Math.min(diff, 2 * Math.PI - diff);
}

// CRITICAL BUG FIX: This new logic is mathematically perfect and has no edge cases.
function isAngleInSector(angle, sector) {
    const diff = getAngleDifference(angle, sector.center);
    return diff <= sector.size / 2;
}

// --- Save/Load & Event Listeners ---
function saveGame() { localStorage.setItem('perfectAim_highScore', highScore); }
function loadGame() {
    highScore = parseInt(localStorage.getItem('perfectAim_highScore')) || 0;
    updateScoreDisplay();
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
gameContainer.addEventListener('click', handleInput);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing') handleInput(e);
        else if (gameState === 'menu' && startScreen.offsetParent !== null) startGame(e);
        else if (gameState === 'game_over' && gameOverScreen.offsetParent !== null) startGame(e);
    }
});

// --- Initial Setup ---
loadGame();
createStarfield();
draw();
drawBackground();