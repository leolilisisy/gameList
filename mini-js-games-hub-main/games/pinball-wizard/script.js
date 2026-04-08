// Pinball Wizard Game
// Classic pinball with flippers, bumpers, and scoring

// DOM elements
const canvas = document.getElementById('pinball-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');
const ballsEl = document.getElementById('current-balls');
const multiplierEl = document.getElementById('current-multiplier');
const messageEl = document.getElementById('message');
const leftFlipperBtn = document.getElementById('left-flipper');
const rightFlipperBtn = document.getElementById('right-flipper');
const launchBtn = document.getElementById('launch-btn');
const resetBtn = document.getElementById('reset-btn');

// Game constants
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 800;
const GRAVITY = 0.3;
const FRICTION = 0.99;
const BALL_RADIUS = 8;

// Game variables
let gameRunning = false;
let score = 0;
let ballsLeft = 3;
let multiplier = 1;
let ball = null;
let flippers = [];
let bumpers = [];
let walls = [];
let animationId;

// Ball class
class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = BALL_RADIUS;
        this.active = true;
    }

    update() {
        if (!this.active) return;

        // Apply gravity
        this.vy += GRAVITY;

        // Apply friction
        this.vx *= FRICTION;
        this.vy *= FRICTION;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Check wall collisions
        this.checkWallCollisions();

        // Check flipper collisions
        this.checkFlipperCollisions();

        // Check bumper collisions
        this.checkBumperCollisions();

        // Check if ball is lost
        if (this.y > CANVAS_HEIGHT + 50) {
            this.active = false;
            ballLost();
        }
    }

    checkWallCollisions() {
        walls.forEach(wall => {
            if (this.circleLineCollision(wall)) {
                // Bounce off wall
                const normal = this.getNormal(wall);
                const dot = this.vx * normal.x + this.vy * normal.y;
                this.vx -= 2 * dot * normal.x;
                this.vy -= 2 * dot * normal.y;

                // Add some randomness to prevent sticking
                this.vx += (Math.random() - 0.5) * 0.5;
                this.vy += (Math.random() - 0.5) * 0.5;
            }
        });
    }

    checkFlipperCollisions() {
        flippers.forEach(flipper => {
            if (this.circleLineCollision(flipper.getLine())) {
                // Bounce off flipper
                const normal = this.getNormal(flipper.getLine());
                const dot = this.vx * normal.x + this.vy * normal.y;
                this.vx -= 2 * dot * normal.x;
                this.vy -= 2 * dot * normal.y;

                // Add flipper force
                const force = flipper.isActive ? 8 : 4;
                this.vx += normal.x * force;
                this.vy += normal.y * force;

                score += 10 * multiplier;
                updateScore();
            }
        });
    }

    checkBumperCollisions() {
        bumpers.forEach(bumper => {
            const dx = this.x - bumper.x;
            const dy = this.y - bumper.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + bumper.radius) {
                // Bounce off bumper
                const angle = Math.atan2(dy, dx);
                const force = 6;
                this.vx += Math.cos(angle) * force;
                this.vy += Math.sin(angle) * force;

                // Score points
                score += bumper.points * multiplier;
                updateScore();

                // Visual feedback
                bumper.hit = true;
                setTimeout(() => bumper.hit = false, 200);
            }
        });
    }

    circleLineCollision(line) {
        // Check if ball collides with line segment
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        const length = Math.sqrt(dx * dx + dy * dy);

        const dot = ((this.x - line.x1) * dx + (this.y - line.y1) * dy) / (length * length);

        let closestX, closestY;
        if (dot < 0) {
            closestX = line.x1;
            closestY = line.y1;
        } else if (dot > 1) {
            closestX = line.x2;
            closestY = line.y2;
        } else {
            closestX = line.x1 + dot * dx;
            closestY = line.y1 + dot * dy;
        }

        const distance = Math.sqrt((this.x - closestX) ** 2 + (this.y - closestY) ** 2);
        return distance < this.radius;
    }

    getNormal(line) {
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        return { x: -dy / length, y: dx / length };
    }

    draw() {
        if (!this.active) return;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Add shine effect
        ctx.fillStyle = '#ffff88';
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, this.radius / 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Flipper class
class Flipper {
    constructor(x, y, length, isLeft) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.angle = isLeft ? -Math.PI / 6 : Math.PI / 6;
        this.restAngle = this.angle;
        this.flipAngle = isLeft ? Math.PI / 4 : -Math.PI / 4;
        this.isLeft = isLeft;
        this.isActive = false;
    }

    activate() {
        this.isActive = true;
        this.angle = this.flipAngle;
    }

    deactivate() {
        this.isActive = false;
        this.angle = this.restAngle;
    }

    getLine() {
        const endX = this.x + Math.cos(this.angle) * this.length;
        const endY = this.y + Math.sin(this.angle) * this.length;
        return { x1: this.x, y1: this.y, x2: endX, y2: endY };
    }

    draw() {
        const line = this.getLine();
        ctx.strokeStyle = this.isActive ? '#ffff00' : '#ff6b35';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
    }
}

// Bumper class
class Bumper {
    constructor(x, y, radius, points) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.points = points;
        this.hit = false;
    }

    draw() {
        ctx.fillStyle = this.hit ? '#ffff00' : '#e74c3c';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw inner circle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize game objects
function initGame() {
    // Create walls (table boundaries)
    walls = [
        // Top
        { x1: 0, y1: 0, x2: CANVAS_WIDTH, y2: 0 },
        // Left
        { x1: 0, y1: 0, x2: 0, y2: CANVAS_HEIGHT },
        // Right
        { x1: CANVAS_WIDTH, y1: 0, x2: CANVAS_WIDTH, y2: CANVAS_HEIGHT },
        // Bottom (only partial for ball exit)
        { x1: 100, y1: CANVAS_HEIGHT, x2: CANVAS_WIDTH - 100, y2: CANVAS_HEIGHT },
        // Sloped walls
        { x1: 50, y1: 100, x2: 150, y2: 200 },
        { x1: CANVAS_WIDTH - 50, y1: 100, x2: CANVAS_WIDTH - 150, y2: 200 },
        { x1: 200, y1: 300, x2: 300, y2: 400 },
        { x1: CANVAS_WIDTH - 200, y1: 300, x2: CANVAS_WIDTH - 300, y2: 400 }
    ];

    // Create flippers
    flippers = [
        new Flipper(150, CANVAS_HEIGHT - 100, 80, true), // Left flipper
        new Flipper(CANVAS_WIDTH - 150, CANVAS_HEIGHT - 100, 80, false) // Right flipper
    ];

    // Create bumpers
    bumpers = [
        new Bumper(150, 250, 25, 50),
        new Bumper(CANVAS_WIDTH - 150, 250, 25, 50),
        new Bumper(CANVAS_WIDTH / 2, 350, 25, 100),
        new Bumper(200, 450, 20, 75),
        new Bumper(CANVAS_WIDTH - 200, 450, 20, 75)
    ];
}

// Game functions
function startGame() {
    if (ballsLeft <= 0) return;

    ball = new Ball(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 150);
    gameRunning = true;
    messageEl.textContent = 'Ball launched! Use flippers to keep it in play.';
    launchBtn.style.display = 'none';
}

function ballLost() {
    gameRunning = false;
    ballsLeft--;
    ballsEl.textContent = ballsLeft;

    if (ballsLeft > 0) {
        messageEl.textContent = `Ball lost! ${ballsLeft} balls remaining.`;
        setTimeout(() => {
            launchBtn.style.display = 'inline-block';
            messageEl.textContent = 'Press Launch Ball to continue.';
        }, 2000);
    } else {
        messageEl.textContent = 'Game Over! No balls remaining.';
        launchBtn.style.display = 'none';
    }
}

function updateScore() {
    scoreEl.textContent = score.toLocaleString();

    // Update multiplier based on score
    multiplier = Math.floor(score / 1000) + 1;
    multiplierEl.textContent = multiplier + 'x';
}

function resetGame() {
    gameRunning = false;
    score = 0;
    ballsLeft = 3;
    multiplier = 1;
    ball = null;

    scoreEl.textContent = score;
    ballsEl.textContent = ballsLeft;
    multiplierEl.textContent = multiplier + 'x';
    messageEl.textContent = 'New game started! Press Launch Ball to begin.';
    launchBtn.style.display = 'inline-block';
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw walls
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    walls.forEach(wall => {
        ctx.beginPath();
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.stroke();
    });

    // Draw bumpers
    bumpers.forEach(bumper => bumper.draw());

    // Draw flippers
    flippers.forEach(flipper => flipper.draw());

    // Update and draw ball
    if (ball) {
        ball.update();
        ball.draw();
    }

    animationId = requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyA') {
        flippers[0].activate();
        leftFlipperBtn.style.background = '#ffff00';
    }
    if (event.code === 'KeyD') {
        flippers[1].activate();
        rightFlipperBtn.style.background = '#ffff00';
    }
    if (event.code === 'Space' && !gameRunning && ballsLeft > 0) {
        event.preventDefault();
        startGame();
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'KeyA') {
        flippers[0].deactivate();
        leftFlipperBtn.style.background = '';
    }
    if (event.code === 'KeyD') {
        flippers[1].deactivate();
        rightFlipperBtn.style.background = '';
    }
});

leftFlipperBtn.addEventListener('mousedown', () => {
    flippers[0].activate();
    leftFlipperBtn.style.background = '#ffff00';
});

leftFlipperBtn.addEventListener('mouseup', () => {
    flippers[0].deactivate();
    leftFlipperBtn.style.background = '';
});

rightFlipperBtn.addEventListener('mousedown', () => {
    flippers[1].activate();
    rightFlipperBtn.style.background = '#ffff00';
});

rightFlipperBtn.addEventListener('mouseup', () => {
    flippers[1].deactivate();
    rightFlipperBtn.style.background = '';
});

launchBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

// Initialize and start
initGame();
gameLoop();
updateScore();

// This pinball game has realistic physics
// The flippers work well for controlling the ball
// Could add more features like ramps or special targets