const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameRunning = false;
let paused = false;
let score = 0;
let snowball = { x: 400, y: 400, r: 20, vx: 2, vy: 0 };
let flakes = [];
let obstacles = [];
let keys = {};
let gravity = 0.1;
let friction = 0.99;
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;

// Sounds
const flakeSound = document.getElementById("flake-sound");
const hitSound = document.getElementById("hit-sound");
const jumpSound = document.getElementById("jump-sound");
let muted = false;

// Generate random flakes
function spawnFlake() {
    flakes.push({ x: Math.random() * canvasWidth, y: -20, r: 5 + Math.random() * 5 });
}

// Generate obstacles
function spawnObstacle() {
    obstacles.push({ x: Math.random() * canvasWidth, y: -30, w: 30, h: 30 });
}

// Draw Snowball with glow
function drawSnowball() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(snowball.x, snowball.y, snowball.r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.restore();
}

// Draw flakes
function drawFlakes() {
    flakes.forEach(f => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = "#a2d5f2";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 10;
        ctx.fill();
    });
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(o => {
        ctx.fillStyle = "#ff4c4c";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 15;
        ctx.fillRect(o.x, o.y, o.w, o.h);
    });
}

// Update positions
function update() {
    if (!gameRunning || paused) return;

    // Snowball physics
    snowball.vy += gravity;
    snowball.x += snowball.vx;
    snowball.y += snowball.vy;
    snowball.vx *= friction;
    snowball.vy *= friction;

    // Control
    if (keys["ArrowLeft"] || keys["a"]) snowball.vx -= 0.2;
    if (keys["ArrowRight"] || keys["d"]) snowball.vx += 0.2;
    if ((keys[" "] || keys["Space"]) && snowball.y >= canvasHeight - snowball.r - 1) {
        snowball.vy = -5;
        if (!muted) jumpSound.play();
    }

    // Keep inside canvas
    if (snowball.x < snowball.r) snowball.x = snowball.r;
    if (snowball.x > canvasWidth - snowball.r) snowball.x = canvasWidth - snowball.r;
    if (snowball.y > canvasHeight - snowball.r) snowball.y = canvasHeight - snowball.r;

    // Flakes movement
    flakes.forEach((f, i) => {
        f.y += 2;
        // Collision
        let dx = snowball.x - f.x;
        let dy = snowball.y - f.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < snowball.r + f.r) {
            flakes.splice(i,1);
            snowball.r += 1;
            score += 10;
            if (!muted) flakeSound.play();
        }
        if (f.y > canvasHeight) flakes.splice(i,1);
    });

    // Obstacles movement
    obstacles.forEach((o, i) => {
        o.y += 2;
        if (
            snowball.x + snowball.r > o.x &&
            snowball.x - snowball.r < o.x + o.w &&
            snowball.y + snowball.r > o.y &&
            snowball.y - snowball.r < o.y + o.h
        ) {
            obstacles.splice(i,1);
            snowball.r -= 2;
            score -= 5;
            if (!muted) hitSound.play();
            if (snowball.r < 10) {
                alert("Game Over! Final Score: " + score);
                resetGame();
            }
        }
        if (o.y > canvasHeight) obstacles.splice(i,1);
    });
}

// Draw everything
function draw() {
    ctx.clearRect(0,0,canvasWidth,canvasHeight);
    drawSnowball();
    drawFlakes();
    drawObstacles();
    document.getElementById("score").textContent = score;
}

// Game Loop
function gameLoop() {
    update();
    draw();
    if (gameRunning) requestAnimationFrame(gameLoop);
}

// Spawn flakes and obstacles
setInterval(spawnFlake, 800);
setInterval(spawnObstacle, 1500);

// Controls
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

// Buttons
document.getElementById("start-btn").onclick = () => { gameRunning = true; paused = false; gameLoop(); };
document.getElementById("pause-btn").onclick = () => { paused = !paused; };
document.getElementById("restart-btn").onclick = resetGame;
document.getElementById("mute-btn").onclick = () => { muted = !muted; alert(muted ? "Muted" : "Sound On"); };

// Reset Game
function resetGame() {
    gameRunning = false;
    paused = false;
    snowball = { x: 400, y: 400, r: 20, vx: 2, vy: 0 };
    flakes = [];
    obstacles = [];
    score = 0;
    draw();
}
