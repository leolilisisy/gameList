const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");

const jumpSound = document.getElementById("jumpSound");
const lavaSound = document.getElementById("lavaSound");

let score = 0;
let lives = 3;
let gameInterval;
let paused = false;

const player = {
    x: 180,
    y: 500,
    width: 40,
    height: 40,
    dy: 0,
    color: "#00ffea",
    gravity: 0.5,
    jumpForce: -10
};

const lava = {
    y: 600,
    speed: 0.3,
    color: "#ff4500"
};

const platforms = [];
for (let i = 0; i < 6; i++) {
    platforms.push({
        x: Math.random() * 300,
        y: i * 100 + 100,
        width: 100,
        height: 20,
        color: "#fff700"
    });
}

// Controls
document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft") player.x -= 20;
    if (e.code === "ArrowRight") player.x += 20;
    if (e.code === "Space") {
        player.dy = player.jumpForce;
        jumpSound.play();
    }
});

// Game Functions
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.shadowColor = "#0ff";
    ctx.shadowBlur = 20;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
    platforms.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.shadowColor = "#ff0";
        ctx.shadowBlur = 15;
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
}

function drawLava() {
    ctx.fillStyle = lava.color;
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 30;
    ctx.fillRect(0, lava.y, canvas.width, canvas.height - lava.y);
}

function drawScore() {
    document.getElementById("score").textContent = "Score: " + Math.floor(score);
    document.getElementById("lives").textContent = "Lives: " + lives;
}

function update() {
    if (paused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gravity
    player.dy += player.gravity;
    player.y += player.dy;

    // Platforms collision
    platforms.forEach(p => {
        if (player.y + player.height > p.y && player.y + player.height < p.y + 10 &&
            player.x + player.width > p.x && player.x < p.x + p.width && player.dy > 0) {
            player.dy = player.jumpForce;
            score += 10;
            jumpSound.play();
        }
    });

    // Lava collision
    if (player.y + player.height > lava.y) {
        lives--;
        lavaSound.play();
        if (lives <= 0) {
            clearInterval(gameInterval);
            alert("Game Over! Final Score: " + Math.floor(score));
            return;
        } else {
            player.y = 500;
            player.dy = 0;
        }
    }

    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Lava rising
    lava.y -= lava.speed;

    drawPlatforms();
    drawPlayer();
    drawLava();
    drawScore();
}

// Controls
startBtn.addEventListener("click", () => {
    clearInterval(gameInterval);
    gameInterval = setInterval(update, 20);
});

pauseBtn.addEventListener("click", () => paused = true);
resumeBtn.addEventListener("click", () => paused = false);
restartBtn.addEventListener("click", () => {
    score = 0;
    lives = 3;
    lava.y = 600;
    player.y = 500;
    player.dy = 0;
    paused = false;
});
