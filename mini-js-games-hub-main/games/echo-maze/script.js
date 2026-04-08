const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;

const echoSound = document.getElementById("echoSound");
const hitSound = document.getElementById("hitSound");
const collectSound = document.getElementById("collectSound");

let obstacles = [];
let collectibles = [];
let player = { x: 50, y: 50, radius: 10, speed: 3 };
let echoes = [];
let keys = {};
let gameInterval = null;
let isPaused = false;

// Generate obstacles randomly
function createObstacles(count = 10) {
    obstacles = [];
    for (let i = 0; i < count; i++) {
        obstacles.push({
            x: Math.random() * (canvas.width - 30) + 15,
            y: Math.random() * (canvas.height - 30) + 15,
            radius: 15
        });
    }
}

// Generate collectibles
function createCollectibles(count = 5) {
    collectibles = [];
    for (let i = 0; i < count; i++) {
        collectibles.push({
            x: Math.random() * (canvas.width - 20) + 10,
            y: Math.random() * (canvas.height - 20) + 10,
            radius: 8
        });
    }
}

// Emit echo
function emitEcho() {
    echoes.push({ x: player.x, y: player.y, radius: 0, alpha: 1 });
    echoSound.currentTime = 0;
    echoSound.play();
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = "#0ff";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(o => {
        ctx.strokeStyle = "#f00";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// Draw collectibles
function drawCollectibles() {
    collectibles.forEach(c => {
        ctx.fillStyle = "#ff0";
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw echoes
function drawEchoes() {
    echoes.forEach(e => {
        ctx.strokeStyle = `rgba(0,255,255,${e.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.stroke();
        e.radius += 2;
        e.alpha -= 0.02;
    });
    echoes = echoes.filter(e => e.alpha > 0);
}

// Collision detection
function checkCollisions() {
    obstacles.forEach(o => {
        let dx = player.x - o.x;
        let dy = player.y - o.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < player.radius + o.radius) {
            hitSound.currentTime = 0;
            hitSound.play();
        }
    });

    collectibles = collectibles.filter(c => {
        let dx = player.x - c.x;
        let dy = player.y - c.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < player.radius + c.radius) {
            collectSound.currentTime = 0;
            collectSound.play();
            return false;
        }
        return true;
    });
}

// Update player position
function updatePlayer() {
    if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

    // Boundaries
    if (player.x < player.radius) player.x = player.radius;
    if (player.x > canvas.width - player.radius) player.x = canvas.width - player.radius;
    if (player.y < player.radius) player.y = player.radius;
    if (player.y > canvas.height - player.radius) player.y = canvas.height - player.radius;
}

// Game loop
function gameLoop() {
    if (isPaused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawEchoes();
    drawObstacles();
    drawCollectibles();
    drawPlayer();
    checkCollisions();
}

// Key listeners
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === " " || e.key === "Enter") {
        emitEcho();
    }
});
document.addEventListener("keyup", (e) => { keys[e.key] = false; });

// Buttons
document.getElementById("start-btn").addEventListener("click", () => {
    createObstacles();
    createCollectibles();
    isPaused = false;
    if (!gameInterval) gameInterval = setInterval(gameLoop, 30);
    document.getElementById("status").textContent = "Game Started!";
});

document.getElementById("pause-btn").addEventListener("click", () => {
    isPaused = !isPaused;
    document.getElementById("status").textContent = isPaused ? "Paused" : "Playing";
});

document.getElementById("restart-btn").addEventListener("click", () => {
    player.x = 50; player.y = 50;
    createObstacles();
    createCollectibles();
    echoes = [];
    isPaused = false;
    document.getElementById("status").textContent = "Game Restarted!";
});
