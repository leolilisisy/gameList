const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-value');
const levelEl = document.getElementById('level-value');
const nextColorEl = document.getElementById('next-color');

const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
const bubbleRadius = 15;
const rows = 8;
const cols = 12;
let bubbles = [];
let shooter = { x: canvas.width / 2, y: canvas.height - 30, angle: 0 };
let currentBubble = null;
let nextBubble = null;
let score = 0;
let level = 1;
let gameRunning = true;

function init() {
    bubbles = [];
    generateLevel();
    currentBubble = createBubble(shooter.x, shooter.y);
    nextBubble = createBubble(0, 0);
    updateNextColor();
    score = 0;
    level = 1;
    gameRunning = true;
    scoreEl.textContent = score;
    levelEl.textContent = level;
    gameLoop();
}

function generateLevel() {
    bubbles = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols - (row % 2); col++) {
            const x = col * bubbleRadius * 2 + (row % 2) * bubbleRadius + bubbleRadius;
            const y = row * bubbleRadius * 1.7 + bubbleRadius;
            if (Math.random() < 0.7) { // 70% chance to place bubble
                bubbles.push({
                    x, y, color: colors[Math.floor(Math.random() * colors.length)],
                    row, col, attached: true
                });
            }
        }
    }
}

function createBubble(x, y) {
    return {
        x, y, vx: 0, vy: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        attached: false
    };
}

function update() {
    if (!gameRunning) return;

    // Update current bubble
    if (currentBubble) {
        currentBubble.x += currentBubble.vx;
        currentBubble.y += currentBubble.vy;

        // Bounce off walls
        if (currentBubble.x <= bubbleRadius || currentBubble.x >= canvas.width - bubbleRadius) {
            currentBubble.vx *= -1;
        }

        // Check collision with top
        if (currentBubble.y <= bubbleRadius) {
            currentBubble.vy *= -1;
        }

        // Check collision with other bubbles
        for (let bubble of bubbles) {
            if (bubble.attached) {
                const dx = currentBubble.x - bubble.x;
                const dy = currentBubble.y - bubble.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < bubbleRadius * 2) {
                    attachBubble(currentBubble, bubble);
                    break;
                }
            }
        }

        // Check if bubble went off screen
        if (currentBubble.y > canvas.height) {
            gameOver();
        }
    }
}

function attachBubble(bubble, target) {
    bubble.attached = true;
    bubble.vx = 0;
    bubble.vy = 0;

    // Snap to nearest grid position
    const row = Math.round((bubble.y - bubbleRadius) / (bubbleRadius * 1.7));
    const col = Math.round((bubble.x - (row % 2) * bubbleRadius - bubbleRadius) / (bubbleRadius * 2));
    bubble.x = col * bubbleRadius * 2 + (row % 2) * bubbleRadius + bubbleRadius;
    bubble.y = row * bubbleRadius * 1.7 + bubbleRadius;
    bubble.row = row;
    bubble.col = col;

    bubbles.push(bubble);

    // Check for matches
    const matches = findMatches(bubble);
    if (matches.length >= 3) {
        popBubbles(matches);
    } else {
        // Load next bubble
        currentBubble = nextBubble;
        currentBubble.x = shooter.x;
        currentBubble.y = shooter.y;
        nextBubble = createBubble(0, 0);
        updateNextColor();
    }

    // Check level complete
    if (bubbles.filter(b => b.attached).length === 0) {
        levelComplete();
    }

    // Check game over
    if (bubbles.some(b => b.attached && b.y > canvas.height - 100)) {
        gameOver();
    }
}

function findMatches(startBubble) {
    const matches = [];
    const visited = new Set();
    const queue = [startBubble];

    while (queue.length > 0) {
        const bubble = queue.shift();
        if (visited.has(bubble)) continue;
        visited.add(bubble);

        matches.push(bubble);

        // Check adjacent bubbles
        for (let other of bubbles) {
            if (other.attached && other.color === bubble.color && !visited.has(other)) {
                const dx = Math.abs(bubble.x - other.x);
                const dy = Math.abs(bubble.y - other.y);
                if (dx < bubbleRadius * 2.1 && dy < bubbleRadius * 2.1) {
                    queue.push(other);
                }
            }
        }
    }

    return matches;
}

function popBubbles(matches) {
    matches.forEach(bubble => {
        const index = bubbles.indexOf(bubble);
        if (index > -1) bubbles.splice(index, 1);
    });
    score += matches.length * 10;

    // Check for floating bubbles
    const attached = new Set();
    const toCheck = bubbles.filter(b => b.attached && b.y <= bubbleRadius * 2);
    while (toCheck.length > 0) {
        const bubble = toCheck.shift();
        attached.add(bubble);
        for (let other of bubbles) {
            if (other.attached && !attached.has(other)) {
                const dx = Math.abs(bubble.x - other.x);
                const dy = Math.abs(bubble.y - other.y);
                if (dx < bubbleRadius * 2.1 && dy < bubbleRadius * 2.1) {
                    toCheck.push(other);
                }
            }
        }
    }

    // Remove floating bubbles
    bubbles = bubbles.filter(b => attached.has(b) || !b.attached);
    score += (bubbles.length - attached.size) * 5;

    scoreEl.textContent = score;
}

function levelComplete() {
    level++;
    levelEl.textContent = level;
    document.getElementById('level-complete').style.display = 'block';
    gameRunning = false;
}

function gameOver() {
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('final-score').textContent = `Final Score: ${score}`;
    gameRunning = false;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bubbles
    bubbles.forEach(bubble => {
        if (bubble.attached) {
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubbleRadius, 0, Math.PI * 2);
            ctx.fillStyle = bubble.color;
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
        }
    });

    // Draw current bubble
    if (currentBubble) {
        ctx.beginPath();
        ctx.arc(currentBubble.x, currentBubble.y, bubbleRadius, 0, Math.PI * 2);
        ctx.fillStyle = currentBubble.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
    }

    // Draw shooter
    ctx.beginPath();
    ctx.arc(shooter.x, shooter.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();

    // Draw aim line
    if (gameRunning) {
        ctx.beginPath();
        ctx.moveTo(shooter.x, shooter.y);
        ctx.lineTo(shooter.x + Math.cos(shooter.angle) * 50, shooter.y + Math.sin(shooter.angle) * 50);
        ctx.strokeStyle = '#000';
        ctx.stroke();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Input handling
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    shooter.angle = Math.atan2(mouseY - shooter.y, mouseX - shooter.x);
});

canvas.addEventListener('click', () => {
    if (gameRunning && currentBubble && currentBubble.vx === 0 && currentBubble.vy === 0) {
        const speed = 8;
        currentBubble.vx = Math.cos(shooter.angle) * speed;
        currentBubble.vy = Math.sin(shooter.angle) * speed;
    }
});

// Touch controls
canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;
    shooter.angle = Math.atan2(touchY - shooter.y, touchX - shooter.x);
});

canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (gameRunning && currentBubble && currentBubble.vx === 0 && currentBubble.vy === 0) {
        const speed = 8;
        currentBubble.vx = Math.cos(shooter.angle) * speed;
        currentBubble.vy = Math.sin(shooter.angle) * speed;
    }
});

document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('game-over').style.display = 'none';
    init();
});

document.getElementById('next-level-btn').addEventListener('click', () => {
    document.getElementById('level-complete').style.display = 'none';
    generateLevel();
    currentBubble = nextBubble;
    currentBubble.x = shooter.x;
    currentBubble.y = shooter.y;
    nextBubble = createBubble(0, 0);
    updateNextColor();
    gameRunning = true;
});

function updateNextColor() {
    nextColorEl.style.backgroundColor = nextBubble.color;
}

init();