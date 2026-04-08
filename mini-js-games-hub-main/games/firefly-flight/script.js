const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");

const scoreEl = document.getElementById("score");
const collectSound = document.getElementById("collect-sound");
const hitSound = document.getElementById("hit-sound");
const bgMusic = document.getElementById("bg-music");

let firefly = { x: 100, y: 250, radius: 15, glow: 20, speed: 4 };
let keys = {};
let obstacles = [];
let orbs = [];
let score = 0;
let gameInterval;
let running = false;

// Random number helper
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Create obstacles
function createObstacles() {
    obstacles = [];
    for (let i = 0; i < 5; i++) {
        obstacles.push({
            x: random(400, 1200),
            y: random(50, 450),
            width: 40,
            height: 40,
        });
    }
}

// Create orbs
function createOrbs() {
    orbs = [];
    for (let i = 0; i < 7; i++) {
        orbs.push({
            x: random(500, 1300),
            y: random(50, 450),
            radius: 10
        });
    }
}

// Draw firefly
function drawFirefly() {
    ctx.save();
    ctx.shadowBlur = firefly.glow;
    ctx.shadowColor = "yellow";
    ctx.beginPath();
    ctx.arc(firefly.x, firefly.y, firefly.radius, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.restore();
}

// Draw obstacles
function drawObstacles() {
    ctx.fillStyle = "red";
    obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.width, o.height));
}

// Draw orbs
function drawOrbs() {
    ctx.fillStyle = "lime";
    orbs.forEach(o => {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "lime";
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// Move firefly
function moveFirefly() {
    if (keys["ArrowUp"] || keys["w"]) firefly.y -= firefly.speed;
    if (keys["ArrowDown"] || keys["s"]) firefly.y += firefly.speed;
    if (keys["ArrowLeft"] || keys["a"]) firefly.x -= firefly.speed;
    if (keys["ArrowRight"] || keys["d"]) firefly.x += firefly.speed;

    // Boundaries
    firefly.x = Math.max(firefly.radius, Math.min(canvas.width - firefly.radius, firefly.x));
    firefly.y = Math.max(firefly.radius, Math.min(canvas.height - firefly.radius, firefly.y));
}

// Collision detection
function checkCollisions() {
    // Obstacles
    obstacles.forEach(o => {
        if (
            firefly.x + firefly.radius > o.x &&
            firefly.x - firefly.radius < o.x + o.width &&
            firefly.y + firefly.radius > o.y &&
            firefly.y - firefly.radius < o.y + o.height
        ) {
            hitSound.play();
            firefly.x = 100;
            firefly.y = 250;
            score = Math.max(0, score - 5);
        }
    });

    // Orbs
    orbs.forEach((orb, index) => {
        const dx = firefly.x - orb.x;
        const dy = firefly.y - orb.y;
        if (Math.sqrt(dx*dx + dy*dy) < firefly.radius + orb.radius) {
            collectSound.play();
            score += 10;
            orbs.splice(index, 1);
        }
    });
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFirefly();
    drawObstacles();
    drawOrbs();
    scoreEl.textContent = score;
}

// Game loop
function update() {
    moveFirefly();
    checkCollisions();
    draw();
}

// Start game
function startGame() {
    if (!running) {
        createObstacles();
        createOrbs();
        gameInterval = setInterval(update, 20);
        running = true;
        bgMusic.play();
    }
}

// Pause game
function pauseGame() {
    if (running) {
        clearInterval(gameInterval);
        running = false;
        bgMusic.pause();
    }
}

// Restart game
function restartGame() {
    firefly.x = 100;
    firefly.y = 250;
    score = 0;
    createObstacles();
    createOrbs();
    if (!running) startGame();
}

// Event listeners
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", restartGame);

window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);
