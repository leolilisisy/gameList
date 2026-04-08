var canvas = document.getElementById('game-canvas');
var ctx = canvas.getContext('2d');
var scoreEl = document.getElementById('score-value');
var finalScoreEl = document.getElementById('final-score');
var restartBtn = document.getElementById('restart-btn');
var playAgainBtn = document.getElementById('play-again-btn');
var gameOverDiv = document.getElementById('game-over');

var blocks = [];
var particles = [];
var currentBlock = null;
var score = 0;
var gameOver = false;
var gravity = 0.5;
var blockWidth = 100;
var blockHeight = 20;
var baseY = canvas.height - 50;
var cameraY = 0;
var colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#e67e22'];

function Block(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.vx = 0;
    this.vy = 0;
    this.stable = true;
    this.rotation = 0;
    this.rotationSpeed = 0;
}

Block.prototype.draw = function() {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2 - cameraY);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
};

Block.prototype.update = function() {
    if (!this.stable) {
        this.vy += gravity;
        this.y += this.vy;
        this.x += this.vx;
        this.rotation += this.rotationSpeed;
        if (this.y > canvas.height + 100) {
            gameOver = true;
        }
    }
};

function Particle(x, y, vx, vy, color, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
}

Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1;
    this.life--;
};

Particle.prototype.draw = function() {
    var alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y - cameraY, 4, 4);
    ctx.restore();
};

function createParticles(x, y, color) {
    for (var i = 0; i < 10; i++) {
        particles.push(new Particle(x + Math.random() * 20 - 10, y, (Math.random() - 0.5) * 5, -Math.random() * 5, color, 60));
    }
}

function init() {
    blocks = [];
    particles = [];
    currentBlock = new Block(canvas.width / 2 - blockWidth / 2, 50, blockWidth, blockHeight, colors[Math.floor(Math.random() * colors.length)]);
    score = 0;
    gameOver = false;
    cameraY = 0;
    updateScore();
    gameOverDiv.classList.add('hidden');
}

function updateScore() {
    scoreEl.textContent = score;
}

function placeBlock() {
    if (gameOver || !currentBlock) return;

    var prevBlock = blocks[blocks.length - 1];
    if (prevBlock) {
        var overlap = Math.min(currentBlock.x + currentBlock.width, prevBlock.x + prevBlock.width) - Math.max(currentBlock.x, prevBlock.x);
        if (overlap < currentBlock.width * 0.4) {
            // Misplaced, make it fall
            currentBlock.stable = false;
            currentBlock.vx = (Math.random() - 0.5) * 6;
            currentBlock.rotationSpeed = (Math.random() - 0.5) * 0.1;
            createParticles(currentBlock.x + currentBlock.width / 2, currentBlock.y, currentBlock.color);
        } else {
            // Adjust position and size
            currentBlock.x = Math.max(currentBlock.x, prevBlock.x);
            currentBlock.width = overlap;
            currentBlock.stable = true;
        }
    } else {
        currentBlock.stable = true;
    }

    blocks.push(currentBlock);
    score++;
    updateScore();

    // Adjust camera
    if (currentBlock.y - cameraY < 100) {
        cameraY = currentBlock.y - 100;
    }

    if (currentBlock.stable) {
        currentBlock = new Block(canvas.width / 2 - blockWidth / 2, currentBlock.y - blockHeight, blockWidth, blockHeight, colors[Math.floor(Math.random() * colors.length)]);
    } else {
        currentBlock = null;
    }
}

function update() {
    if (gameOver) return;

    blocks.forEach(function(block) {
        block.update();
    });

    if (currentBlock) {
        currentBlock.update();
    }

    particles = particles.filter(function(p) {
        p.update();
        return p.life > 0;
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky gradient
    var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#fff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw base
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, baseY - cameraY, canvas.width, canvas.height - baseY + cameraY);

    blocks.forEach(function(block) {
        block.draw();
    });

    if (currentBlock) {
        currentBlock.draw();
    }

    particles.forEach(function(p) {
        p.draw();
    });

    if (gameOver) {
        finalScoreEl.textContent = score;
        gameOverDiv.classList.remove('hidden');
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', function(e) {
    if (currentBlock && currentBlock.stable) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        currentBlock.x = x - currentBlock.width / 2;
        currentBlock.x = Math.max(0, Math.min(canvas.width - currentBlock.width, currentBlock.x));
    }
});

canvas.addEventListener('click', placeBlock);

restartBtn.addEventListener('click', init);
playAgainBtn.addEventListener('click', init);

init();
gameLoop();