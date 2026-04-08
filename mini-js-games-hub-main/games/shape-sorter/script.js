const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');

let shapes = [];
let score = 0;
let time = 30;
let gameRunning = true;

function createShape() {
    const types = ['circle', 'square'];
    const colors = ['red', 'blue'];
    const type = types[Math.floor(Math.random() * types.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * (canvas.width - 100) + 50;
    const y = Math.random() * (canvas.height - 100) + 50;
    const size = 30;
    shapes.push({ type, color, x, y, size });
}

function drawShape(shape) {
    ctx.fillStyle = shape.color;
    if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillRect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw divider
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText('Red', canvas.width / 4, 20);
    ctx.fillText('Blue', 3 * canvas.width / 4, 20);
    shapes.forEach(drawShape);
}

function updateTimer() {
    timerDisplay.textContent = `Time: ${time}`;
    if (time <= 0) {
        gameRunning = false;
        alert(`Time's up! Final score: ${score}`);
    } else {
        time--;
    }
}

canvas.addEventListener('click', (e) => {
    if (!gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        const dist = Math.sqrt((clickX - shape.x) ** 2 + (clickY - shape.y) ** 2);
        if (dist < shape.size / 2) {
            // Move to correct side
            if (shape.color === 'red') {
                shape.x = canvas.width / 4;
            } else {
                shape.x = 3 * canvas.width / 4;
            }
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
            shapes.splice(i, 1);
            createShape();
            break;
        }
    }
});

// Initialize
for (let i = 0; i < 5; i++) {
    createShape();
}
draw();

setInterval(() => {
    if (gameRunning) {
        updateTimer();
        draw();
    }
}, 1000);