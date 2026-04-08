const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

let score = 0;
let lives = 5;
let leaves = [];
let basket = { x: canvas.width / 2 - 40, y: canvas.height - 50, width: 80, height: 20, speed: 7 };
let gameOver = false;
let animationId; // store the animation frame id

// Generate random leaves
function createLeaf() {
    const size = Math.random() * 20 + 20;
    const leaf = {
        x: Math.random() * (canvas.width - size),
        y: -size,
        size: size,
        speed: Math.random() * 2 + 2,
        color: `hsl(${Math.random() * 40 + 20}, 80%, 50%)`
    };
    leaves.push(leaf);
}

// Draw basket
function drawBasket() {
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
}

// Draw leaves
function drawLeaves() {
    leaves.forEach(leaf => {
        ctx.fillStyle = leaf.color;
        ctx.beginPath();
        ctx.ellipse(leaf.x, leaf.y, leaf.size / 2, leaf.size / 3, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw score and lives
function drawScoreboard() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

// Detect collision
function checkCollision(leaf) {
    return leaf.x < basket.x + basket.width &&
           leaf.x + leaf.size > basket.x &&
           leaf.y + leaf.size / 3 > basket.y &&
           leaf.y < basket.y + basket.height;
}

// Update game state
function update() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Add leaves randomly
    if (Math.random() < 0.02) createLeaf();

    // Update leaf positions - iterate backwards for safe removal
    for (let i = leaves.length - 1; i >= 0; i--) {
        const leaf = leaves[i];
        leaf.y += leaf.speed;
        if (checkCollision(leaf)) {
            score += 10;
            leaves.splice(i, 1);
        } else if (leaf.y > canvas.height) {
            lives--;
            leaves.splice(i, 1);
            if (lives <= 0) gameOver = true;
        }
    }

    drawLeaves();
    drawBasket();
    drawScoreboard();

    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    } else {
        animationId = requestAnimationFrame(update);
    }
}

// Basket controls
document.addEventListener('keydown', e => {
    if (e.key === "ArrowLeft" && basket.x > 0) basket.x -= basket.speed;
    if (e.key === "ArrowRight" && basket.x + basket.width < canvas.width) basket.x += basket.speed;
});

// Mouse movement
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    basket.x = e.clientX - rect.left - basket.width / 2;
    if (basket.x < 0) basket.x = 0;
    if (basket.x + basket.width > canvas.width) basket.x = canvas.width - basket.width;
});

// Restart button
document.getElementById('restartBtn').addEventListener('click', () => {
    cancelAnimationFrame(animationId); // Stop any existing loop
    score = 0;
    lives = 5;
    leaves = [];
    basket.x = canvas.width / 2 - 40;
    gameOver = false;
    animationId = requestAnimationFrame(update); // Start a fresh loop
});

// Start game
animationId = requestAnimationFrame(update);
