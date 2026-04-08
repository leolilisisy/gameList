const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-value');

let player = { x: 200, y: 500, vx: 0, vy: 0, w: 20, h: 20 };
let platforms = [];
let stars = [];
let score = 0;
let cameraY = 0;
const gravity = 0.5;
const jumpForce = -12;
const moveSpeed = 5;

function init() {
    platforms = [];
    stars = [];
    player = { x: 200, y: 500, vx: 0, vy: 0, w: 20, h: 20 };
    score = 0;
    cameraY = 0;
    generatePlatforms();
    generateStars();
    gameLoop();
}

function generatePlatforms() {
    platforms = [{ x: 150, y: 550, w: 100, h: 10 }];
    for (let i = 1; i < 20; i++) {
        platforms.push({
            x: Math.random() * (canvas.width - 100),
            y: 550 - i * 100,
            w: 100,
            h: 10
        });
    }
}

function generateStars() {
    for (let i = 0; i < 10; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 600,
            w: 10,
            h: 10
        });
    }
}

function update() {
    player.vy += gravity;
    player.x += player.vx;
    player.y += player.vy;

    // Wrap around screen
    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0;

    // Check platform collisions
    platforms.forEach(p => {
        if (player.vy > 0 && player.x < p.x + p.w && player.x + player.w > p.x &&
            player.y < p.y + p.h && player.y + player.h > p.y) {
            player.vy = jumpForce;
            score += 10;
        }
    });

    // Check star collisions
    stars = stars.filter(s => {
        if (player.x < s.x + s.w && player.x + player.w > s.x &&
            player.y < s.y + s.h && player.y + player.h > s.y) {
            score += 50;
            return false;
        }
        return true;
    });

    // Scroll camera
    if (player.y < 200) {
        cameraY += 200 - player.y;
        player.y = 200;
        platforms.forEach(p => p.y += 200 - player.y);
        stars.forEach(s => s.y += 200 - player.y);
    }

    // Game over
    if (player.y > canvas.height + 100) {
        init();
    }

    scoreEl.textContent = score;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = '#8B4513';
    platforms.forEach(p => {
        ctx.fillRect(p.x, p.y - cameraY, p.w, p.h);
    });

    // Draw stars
    ctx.fillStyle = '#FFD700';
    stars.forEach(s => {
        ctx.fillRect(s.x, s.y - cameraY, s.w, s.h);
    });

    // Draw player
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(player.x, player.y - cameraY, player.w, player.h);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Input handling
let keys = {};
document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'ArrowLeft') player.vx = -moveSpeed;
    if (e.code === 'ArrowRight') player.vx = moveSpeed;
});
document.addEventListener('keyup', e => {
    keys[e.code] = false;
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') player.vx = 0;
});

// Touch controls
let touchStartX = 0;
canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
});
canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    if (touchX < touchStartX - 10) player.vx = -moveSpeed;
    else if (touchX > touchStartX + 10) player.vx = moveSpeed;
    else player.vx = 0;
});
canvas.addEventListener('touchend', () => {
    player.vx = 0;
});

init();