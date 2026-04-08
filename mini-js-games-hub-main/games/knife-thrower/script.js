const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');

const hitSound = document.getElementById('hitSound');
const throwSound = document.getElementById('throwSound');
const gameOverSound = document.getElementById('gameOverSound');

let animationId;
let paused = false;

// Board
const board = {
    x: canvas.width/2,
    y: 200,
    radius: 80,
    knives: [],
    rotation: 0,
    speed: 0.02
};

let currentKnife = { x: canvas.width/2, y: 550, width: 5, height: 30 };
let knivesStuck = [];
let score = 0;

function drawBoard() {
    ctx.save();
    ctx.translate(board.x, board.y);
    ctx.rotate(board.rotation);
    ctx.fillStyle = '#333';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, board.radius, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw stuck knives
    knivesStuck.forEach(k => {
        ctx.fillStyle = '#fff';
        ctx.fillRect(-k.width/2, -board.radius - k.height, k.width, k.height);
    });

    ctx.restore();
}

function drawKnife() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(currentKnife.x - currentKnife.width/2, currentKnife.y - currentKnife.height, currentKnife.width, currentKnife.height);
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function checkCollision() {
    // Check angular collision
    for (let k of knivesStuck) {
        let angle = Math.atan2(0 - board.y, currentKnife.x - board.x); // approximate
        // simple distance check
        if(Math.abs(angle) < 0.1) {
            return true;
        }
    }
    return false;
}

function throwKnife() {
    throwSound.play();
    let hit = false;
    let knifeInterval = setInterval(() => {
        currentKnife.y -= 15;
        if(currentKnife.y <= board.y + board.radius) {
            if(checkCollision()) {
                gameOver();
                clearInterval(knifeInterval);
                return;
            } else {
                knivesStuck.push({...currentKnife});
                currentKnife.y = 550;
                score++;
                hitSound.play();
                document.getElementById('score').textContent = `Score: ${score}`;
                clearInterval(knifeInterval);
                return;
            }
        }
        draw();
    }, 20);
}

function draw() {
    clear();
    drawBoard();
    drawKnife();
}

function update() {
    if(!paused){
        board.rotation += board.speed;
        draw();
        animationId = requestAnimationFrame(update);
    }
}

function gameOver() {
    gameOverSound.play();
    alert(`Game Over! Score: ${score}`);
    cancelAnimationFrame(animationId);
}

startBtn.addEventListener('click', () => {
    paused = false;
    update();
});

pauseBtn.addEventListener('click', () => {
    paused = true;
});

resumeBtn.addEventListener('click', () => {
    if(paused){
        paused = false;
        update();
    }
});

restartBtn.addEventListener('click', () => {
    paused = false;
    knivesStuck = [];
    currentKnife.y = 550;
    score = 0;
    document.getElementById('score').textContent = `Score: ${score}`;
    update();
});

canvas.addEventListener('click', throwKnife);

// Initial draw
draw();
