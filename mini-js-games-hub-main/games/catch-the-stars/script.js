const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Canvas size
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Game variables
let catcher = {
    width: 80,
    height: 20,
    x: canvas.width / 2 - 40,
    y: canvas.height - 30,
    speed: 7
};

let stars = [];
let starSpeed = 2;
let spawnRate = 1500; // milliseconds
let lastSpawn = Date.now();
let score = 0;
let lives = 3;
let gameOver = false;

// DOM elements
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const restartBtn = document.getElementById("restartBtn");

// Catcher movement
let leftPressed = false;
let rightPressed = false;

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") leftPressed = true;
    if (e.key === "ArrowRight" || e.key === "d") rightPressed = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") leftPressed = false;
    if (e.key === "ArrowRight" || e.key === "d") rightPressed = false;
});

// Star class
class Star {
    constructor(x, y, radius = 10) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = "#ffeb3b";
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.y += starSpeed;
    }
}

// Spawn stars
function spawnStar() {
    const x = Math.random() * (canvas.width - 20) + 10;
    stars.push(new Star(x, -20));
}

// Collision detection
function checkCollision(star) {
    return (
        star.y + star.radius >= catcher.y &&
        star.x >= catcher.x &&
        star.x <= catcher.x + catcher.width
    );
}

// Game loop
function gameLoop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move catcher
    if (leftPressed && catcher.x > 0) catcher.x -= catcher.speed;
    if (rightPressed && catcher.x + catcher.width < canvas.width) catcher.x += catcher.speed;

    // Draw catcher
    ctx.fillStyle = "#ff4136";
    ctx.fillRect(catcher.x, catcher.y, catcher.width, catcher.height);

    // Spawn stars
    if (Date.now() - lastSpawn > spawnRate) {
        spawnStar();
        lastSpawn = Date.now();
    }

    // Update and draw stars
    stars.forEach((star, index) => {
        star.update();
        star.draw();

        if (checkCollision(star)) {
            score += 1;
            scoreEl.textContent = score;

            // Increase difficulty
            if (score % 5 === 0) starSpeed += 0.5;
            stars.splice(index, 1);
        } else if (star.y > canvas.height) {
            stars.splice(index, 1);
            lives -= 1;
            livesEl.textContent = lives;

            if (lives <= 0) {
                gameOver = true;
                alert(`Game Over! Your score: ${score}`);
            }
        }
    });

    requestAnimationFrame(gameLoop);
}

// Restart game
restartBtn.addEventListener("click", () => {
    stars = [];
    score = 0;
    lives = 3;
    starSpeed = 2;
    lastSpawn = Date.now();
    gameOver = false;
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    gameLoop();
});

// Start game
gameLoop();
