const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

let score = 0;
let gameRunning = true;
let player = { x: canvas.width / 2, y: canvas.height - 50, width: 30, height: 20 };
let stars = [];
let asteroids = [];
let keys = {};

class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.speed = 2;
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            stars = stars.filter(s => s !== this);
        }
    }

    draw() {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        // Add sparkle effect
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x - 3, this.y - 3, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 3, this.y - 3, 2, 0, Math.PI * 2);
        ctx.arc(this.x - 3, this.y + 3, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 3, this.y + 3, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    collidesWith(player) {
        return this.x < player.x + player.width &&
               this.x + this.radius * 2 > player.x &&
               this.y < player.y + player.height &&
               this.y + this.radius * 2 > player.y;
    }
}

class Asteroid {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 20 + 15;
        this.speed = Math.random() * 2 + 1;
        this.rotation = 0;
        this.rotationSpeed = Math.random() * 0.1 - 0.05;
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        if (this.y > canvas.height) {
            asteroids = asteroids.filter(a => a !== this);
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = '#666666';
        ctx.beginPath();
        // Irregular asteroid shape
        ctx.moveTo(0, -this.size);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = this.size * (0.8 + Math.random() * 0.4);
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    collidesWith(player) {
        return this.x - this.size < player.x + player.width &&
               this.x + this.size > player.x &&
               this.y - this.size < player.y + player.height &&
               this.y + this.size > player.y;
    }
}

function drawPlayer() {
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function update() {
    // Move player
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= 5;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += 5;
    }

    // Update stars
    stars.forEach(star => {
        star.update();
        if (star.collidesWith(player)) {
            score += 10;
            scoreElement.textContent = score;
            stars = stars.filter(s => s !== star);
        }
    });

    // Update asteroids
    asteroids.forEach(asteroid => {
        asteroid.update();
        if (asteroid.collidesWith(player)) {
            gameOver();
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    stars.forEach(star => star.draw());
    asteroids.forEach(asteroid => asteroid.draw());
}

function gameLoop() {
    if (gameRunning) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

function createStar() {
    const x = Math.random() * (canvas.width - 30) + 15;
    stars.push(new Star(x, -10));
}

function createAsteroid() {
    const x = Math.random() * (canvas.width - 30) + 15;
    asteroids.push(new Asteroid(x, -30));
}

function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
}

function restartGame() {
    score = 0;
    scoreElement.textContent = score;
    player.x = canvas.width / 2;
    stars = [];
    asteroids = [];
    gameRunning = true;
    gameOverElement.classList.add('hidden');
    gameLoop();
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

restartBtn.addEventListener('click', restartGame);

// Start spawning objects
setInterval(createStar, 1500);
setInterval(createAsteroid, 3000);

// Start the game
gameLoop();