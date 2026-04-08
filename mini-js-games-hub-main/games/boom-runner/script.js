const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

const jumpSound = document.getElementById('jumpSound');
const hitSound = document.getElementById('hitSound');
const bgMusic = document.getElementById('bgMusic');

let player = { x: 50, y: 300, width: 40, height: 40, color: '#0ff', dy: 0, gravity: 0.7, jumpPower: -12 };
let obstacles = [];
let score = 0;
let lives = 3;
let gameInterval;
let isPaused = false;
let gameSpeed = 5;

// Create random obstacle
function createObstacle() {
    const height = Math.random() * 50 + 20;
    const y = canvas.height - height;
    obstacles.push({ x: canvas.width, y: y, width: 30, height: height, color: '#f00' });
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 20;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.shadowColor = '#f00';
        ctx.shadowBlur = 15;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
}

// Update obstacles
function updateObstacles() {
    obstacles.forEach(obs => obs.x -= gameSpeed);
    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);
}

// Collision detection
function checkCollision() {
    for (let obs of obstacles) {
        if (player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y) {
                lives--;
                hitSound.play();
                obstacles = [];
                if(lives <= 0) {
                    alert('Game Over! Score: ' + score);
                    resetGame();
                }
        }
    }
}

// Draw score & lives
function drawScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

// Update game
function updateGame() {
    if(isPaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update player
    player.dy += player.gravity;
    player.y += player.dy;
    if(player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
    }

    // Random obstacles
    if(Math.random() < 0.02) createObstacle();
    updateObstacles();

    // Draw everything
    drawPlayer();
    drawObstacles();
    checkCollision();
    drawScore();

    score++;
    requestAnimationFrame(updateGame);
}

// Controls
document.addEventListener('keydown', e => {
    if(e.code === 'Space' || e.code === 'ArrowUp') {
        if(player.y + player.height >= canvas.height) {
            player.dy = player.jumpPower;
            jumpSound.play();
        }
    }
});

startBtn.addEventListener('click', () => {
    if(!gameInterval) {
        bgMusic.play();
        updateGame();
    }
});

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    if(isPaused) bgMusic.pause();
    else bgMusic.play();
});

restartBtn.addEventListener('click', () => {
    resetGame();
    bgMusic.currentTime = 0;
    bgMusic.play();
});

// Reset game
function resetGame() {
    player.y = 300;
    player.dy = 0;
    obstacles = [];
    score = 0;
    lives = 3;
    isPaused = false;
    updateGame();
}
