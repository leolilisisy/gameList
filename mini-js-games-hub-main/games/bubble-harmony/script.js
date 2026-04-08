const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');

const bgMusic = document.getElementById('background-music');
const popSound = document.getElementById('pop-sound');

let bubbles = [];
let obstacles = [];
let animationId;
let score = 0;
let gameRunning = false;

function random(min, max) {
    return Math.random() * (max - min) + min;
}

class Bubble {
    constructor() {
        this.x = random(50, canvas.width - 50);
        this.y = canvas.height + 50;
        this.radius = random(20, 40);
        this.speed = random(1, 3);
        this.color = `hsl(${random(0, 360)}, 100%, 60%)`;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.fill();
    }

    update() {
        this.y -= this.speed;
        if (this.y + this.radius < 0) {
            this.y = canvas.height + this.radius;
            this.x = random(50, canvas.width - 50);
        }
        this.draw();
    }
}

class Obstacle {
    constructor() {
        this.x = random(0, canvas.width - 30);
        this.y = random(50, canvas.height - 200);
        this.width = 30;
        this.height = 30;
        this.color = 'red';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

function spawnBubbles() {
    if (bubbles.length < 8) bubbles.push(new Bubble());
}

function spawnObstacles() {
    if (obstacles.length < 3) obstacles.push(new Obstacle());
}

canvas.addEventListener('click', (e) => {
    if (!gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        const dist = Math.hypot(clickX - bubble.x, clickY - bubble.y);
        if (dist < bubble.radius) {
            bubbles.splice(i, 1);
            score += 10;
            scoreEl.textContent = score;
            popSound.currentTime = 0;
            popSound.play();
        }
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spawnBubbles();
    spawnObstacles();

    bubbles.forEach(b => b.update());
    obstacles.forEach(o => o.draw());

    animationId = requestAnimationFrame(animate);
}

startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        bgMusic.play();
        animate();
    }
});

pauseBtn.addEventListener('click', () => {
    if (gameRunning) {
        gameRunning = false;
        bgMusic.pause();
        cancelAnimationFrame(animationId);
    }
});

restartBtn.addEventListener('click', () => {
    gameRunning = false;
    bgMusic.pause();
    bgMusic.currentTime = 0;
    bubbles = [];
    obstacles = [];
    score = 0;
    scoreEl.textContent = score;
    cancelAnimationFrame(animationId);
    animate();
    gameRunning = true;
    bgMusic.play();
});
