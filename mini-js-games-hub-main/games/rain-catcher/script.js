const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 480;
canvas.height = 640;

let score = 0;
let lives = 3;
let highScore = localStorage.getItem('rainCatcherHigh') || 0;
let gameInterval;
let dropInterval = 1500;
let objects = [];
let gamePaused = false;

// Bucket
const bucket = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 60,
    width: 80,
    height: 40,
    speed: 7
};

// Controls
const keys = { left: false, right: false };
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
});
document.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
});

// Online Assets
const raindropImg = new Image();
raindropImg.src = 'https://i.ibb.co/F0KjXv5/raindrop.png';
const thunderImg = new Image();
thunderImg.src = 'https://i.ibb.co/qgqQXKz/thunder.png';
const bucketImg = new Image();
bucketImg.src = 'https://i.ibb.co/FxzM3kL/bucket.png';

// Sounds
const catchSound = new Audio('https://www.soundjay.com/button/beep-07.wav');
const thunderSound = new Audio('https://www.soundjay.com/button/beep-10.wav');

// Create falling objects
function createObject() {
    const typeChance = Math.random();
    let obj = { x: Math.random() * (canvas.width - 30), y: -30, vy: 3 + Math.random() * 2, width: 30, height: 30 };
    if (typeChance < 0.8) obj.type = 'raindrop';
    else obj.type = 'thunder';
    objects.push(obj);
}

// Collision detection
function isColliding(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
}

// Game loop
function gameLoop() {
    if (gamePaused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move bucket
    if (keys.left && bucket.x > 0) bucket.x -= bucket.speed;
    if (keys.right && bucket.x + bucket.width < canvas.width) bucket.x += bucket.speed;
    ctx.drawImage(bucketImg, bucket.x, bucket.y, bucket.width, bucket.height);

    // Draw & move objects
    objects.forEach((obj, i) => {
        obj.y += obj.vy;
        if (obj.type === 'raindrop') ctx.drawImage(raindropImg, obj.x, obj.y, obj.width, obj.height);
        else if (obj.type === 'thunder') ctx.drawImage(thunderImg, obj.x, obj.y, obj.width, obj.height);

        if (isColliding(bucket, obj)) {
            if (obj.type === 'raindrop') {
                score++;
                catchSound.play();
            } else if (obj.type === 'thunder') {
                lives--;
                thunderSound.play();
            }
            objects.splice(i, 1);
        } else if (obj.y > canvas.height) {
            objects.splice(i, 1);
        }
    });

    // Update Scoreboard
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('highscore').textContent = highScore;

    // Check game over
    if (lives <= 0) {
        clearInterval(gameInterval);
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('rainCatcherHigh', highScore);
        }
        alert('Game Over! Your Score: ' + score);
        restartGame();
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Controls buttons
document.getElementById('start-btn').addEventListener('click', () => {
    if (!gameInterval) gameInterval = setInterval(createObject, dropInterval);
    gamePaused = false;
    gameLoop();
});
document.getElementById('pause-btn').addEventListener('click', () => gamePaused = true);
document.getElementById('restart-btn').addEventListener('click', restartGame);

function restartGame() {
    score = 0;
    lives = 3;
    objects = [];
    gamePaused = true;
    clearInterval(gameInterval);
    gameInterval = null;
    gameLoop();
}
