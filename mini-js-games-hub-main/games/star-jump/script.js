const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 480;
canvas.height = 700;

let stars = [];
let blackHoles = [];
let player = { x: canvas.width/2, y: canvas.height - 100, radius: 15, dy: 0 };
let gravity = 0.6;
let jumpPower = -12;
let score = 0;
let gameOver = false;

// Generate stars
function createStars() {
    for(let i = 0; i < 5; i++) {
        stars.push({
            x: Math.random() * (canvas.width-50) + 25,
            y: canvas.height - i*150 - 150,
            radius: 15
        });
    }
}

// Generate black holes
function createBlackHoles() {
    for(let i=0; i<3; i++) {
        blackHoles.push({
            x: Math.random() * (canvas.width-50) + 25,
            y: Math.random() * 400,
            radius: 25
        });
    }
}

function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI*2);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.closePath();
}

function drawStars() {
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI*2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    });
}

function drawBlackHoles() {
    blackHoles.forEach(bh => {
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, bh.radius, 0, Math.PI*2);
        ctx.fillStyle = 'purple';
        ctx.fill();
        ctx.closePath();
    });
}

function detectCollision(obj1, obj2) {
    let dx = obj1.x - obj2.x;
    let dy = obj1.y - obj2.y;
    let distance = Math.sqrt(dx*dx + dy*dy);
    return distance < obj1.radius + obj2.radius;
}

function update() {
    if(gameOver) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    player.dy += gravity;
    player.y += player.dy;

    // Check collision with stars
    stars.forEach(star => {
        if(detectCollision(player, star) && player.dy > 0) {
            player.dy = jumpPower;
            score++;
            document.getElementById('score').textContent = `Score: ${score}`;
            star.y = Math.random() * -100; // Reposition star above
            star.x = Math.random() * (canvas.width-50) + 25;
        }
    });

    // Check collision with black holes
    blackHoles.forEach(bh => {
        if(detectCollision(player, bh)) {
            gameOver = true;
            document.getElementById('score').textContent = `Game Over! Final Score: ${score}`;
        }
    });

    // Wrap player horizontally
    if(player.x - player.radius < 0) player.x = player.radius;
    if(player.x + player.radius > canvas.width) player.x = canvas.width - player.radius;

    // Game over if player falls
    if(player.y - player.radius > canvas.height) {
        gameOver = true;
        document.getElementById('score').textContent = `Game Over! Final Score: ${score}`;
    }

    drawStars();
    drawBlackHoles();
    drawPlayer();

    requestAnimationFrame(update);
}

document.addEventListener('keydown', e => {
    if(e.key === 'ArrowLeft') player.x -= 20;
    if(e.key === 'ArrowRight') player.x += 20;
    if(e.key === 'ArrowUp') player.dy = jumpPower;
});

canvas.addEventListener('click', () => {
    player.dy = jumpPower;
});

document.getElementById('restartBtn').addEventListener('click', () => {
    player = { x: canvas.width/2, y: canvas.height - 100, radius: 15, dy: 0 };
    stars = [];
    blackHoles = [];
    score = 0;
    gameOver = false;
    createStars();
    createBlackHoles();
    document.getElementById('score').textContent = `Score: ${score}`;
});

createStars();
createBlackHoles();
update();
