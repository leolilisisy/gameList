const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreDisplay = document.getElementById("scoreDisplay");

const bgMusic = document.getElementById("bgMusic");
const hitSound = document.getElementById("hitSound");

let gameInterval;
let obstacles = [];
let score = 0;
let gameRunning = false;

const leaf = {
    x: canvas.width / 2 - 20,
    y: 50,
    width: 40,
    height: 40,
    color: "lime",
    speed: 5
};

function drawLeaf() {
    ctx.fillStyle = leaf.color;
    ctx.beginPath();
    ctx.ellipse(leaf.x + leaf.width/2, leaf.y + leaf.height/2, leaf.width/2, leaf.height/2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    // Glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = "lime";
}

function generateObstacle() {
    const width = Math.random() * 60 + 30;
    const x = Math.random() * (canvas.width - width);
    obstacles.push({ x: x, y: canvas.height, width: width, height: 20, color: "brown" });
}

function drawObstacles() {
    obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.shadowBlur = 15;
        ctx.shadowColor = "orange";
    });
}

function moveObstacles() {
    obstacles.forEach(obs => obs.y -= 2);
    obstacles = obstacles.filter(obs => obs.y + obs.height > 0);
}

function detectCollision() {
    for (let obs of obstacles) {
        if (
            leaf.x < obs.x + obs.width &&
            leaf.x + leaf.width > obs.x &&
            leaf.y < obs.y + obs.height &&
            leaf.y + leaf.height > obs.y
        ) {
            hitSound.play();
            endGame();
        }
    }
}

function updateScore() {
    score += 1;
    scoreDisplay.textContent = "Score: " + score;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    clearCanvas();
    drawLeaf();
    drawObstacles();
    moveObstacles();
    detectCollision();
    updateScore();
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        bgMusic.play();
        gameInterval = setInterval(gameLoop, 20);
        obstacleInterval = setInterval(generateObstacle, 1000);
    }
}

function pauseGame() {
    if (gameRunning) {
        clearInterval(gameInterval);
        clearInterval(obstacleInterval);
        gameRunning = false;
        bgMusic.pause();
    }
}

function restartGame() {
    pauseGame();
    obstacles = [];
    score = 0;
    leaf.x = canvas.width / 2 - 20;
    leaf.y = 50;
    scoreDisplay.textContent = "Score: 0";
    startGame();
}

function endGame() {
    pauseGame();
    alert("Game Over! Score: " + score);
}

// Keyboard controls
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") leaf.x -= leaf.speed;
    if (e.key === "ArrowRight") leaf.x += leaf.speed;
    leaf.x = Math.max(0, Math.min(canvas.width - leaf.width, leaf.x));
});

// Mouse / touch controls
canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    leaf.x = e.clientX - rect.left - leaf.width / 2;
});
canvas.addEventListener("touchmove", e => {
    const rect = canvas.getBoundingClientRect();
    leaf.x = e.touches[0].clientX - rect.left - leaf.width / 2;
});

// Button events
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", restartGame);
