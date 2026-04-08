const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

let score = 0;
let bubbles = [];
let gameRunning = true;

const colors = [
    { color: 'red', points: 1 },
    { color: 'blue', points: 2 },
    { color: 'green', points: 3 },
    { color: 'yellow', points: 5 },
    { color: 'purple', points: 10 }
];

class Bubble {
    constructor(x, y, radius, color, points) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.points = points;
        this.speed = Math.random() * 1 + 0.5; // Slow floating up
        this.opacity = 0.7;
    }

    update() {
        this.y -= this.speed;
        if (this.y + this.radius < 0) {
            // Remove bubble if it goes off screen
            bubbles = bubbles.filter(b => b !== this);
        }
    }

    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    isClicked(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }
}

function createBubble() {
    const x = Math.random() * (canvas.width - 100) + 50;
    const y = canvas.height + 50;
    const radius = Math.random() * 30 + 20;
    const colorObj = colors[Math.floor(Math.random() * colors.length)];
    bubbles.push(new Bubble(x, y, radius, colorObj.color, colorObj.points));
}

function update() {
    bubbles.forEach(bubble => bubble.update());
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bubbles.forEach(bubble => bubble.draw());
}

function gameLoop() {
    if (gameRunning) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    bubbles.forEach((bubble, index) => {
        if (bubble.isClicked(mouseX, mouseY)) {
            score += bubble.points;
            scoreElement.textContent = score;
            bubbles.splice(index, 1);
        }
    });
});

// Spawn bubbles every 2 seconds
setInterval(createBubble, 2000);

// Start the game
gameLoop();