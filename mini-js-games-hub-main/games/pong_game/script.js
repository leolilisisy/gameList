// --- 1. Canvas Setup and Constants ---
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

// Set Canvas Dimensions
canvas.width = 700;
canvas.height = 500;

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const MAX_SCORE = 5;

// --- 2. Game Objects ---
class Paddle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = PADDLE_WIDTH;
        this.height = PADDLE_HEIGHT;
        this.color = 'WHITE';
        this.speed = 5;
        this.dy = 0; // vertical velocity
        this.score = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        // Simple boundary check
        this.y += this.dy;
        if (this.y < 0) {
            this.y = 0;
        } else if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
        }
    }
}

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = BALL_SIZE;
        this.color = 'WHITE';
        this.resetSpeed();
    }
    
    // Resets ball position and direction
    resetSpeed() {
        this.speed = 5;
        
        // Random horizontal direction (+/- 1)
        const directionX = Math.random() < 0.5 ? 1 : -1;
        
        // Random vertical angle (slight, not completely flat)
        let angle = Math.random() * (Math.PI / 4) - (Math.PI / 8); // +/- 22.5 degrees
        
        this.dx = directionX * this.speed * Math.cos(angle);
        this.dy = this.speed * Math.sin(angle);
        
        // Center position
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.fillRect(this.x, this.y, this.size, this.size); // Drawing as a square for classic Pong look
        ctx.closePath();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
}

// Instantiate game objects
const player = new Paddle(10, canvas.height / 2 - PADDLE_HEIGHT / 2);
const computer = new Paddle(canvas.width - PADDLE_WIDTH - 10, canvas.height / 2 - PADDLE_HEIGHT / 2);
const ball = new Ball(canvas.width / 2, canvas.height / 2);

// --- 3. Game Logic Functions ---

// Function to draw the middle net and scores
function drawCourt() {
    // Draw scores
    ctx.fillStyle = 'WHITE';
    ctx.font = '40px Arial';
    ctx.fillText(player.score, canvas.width / 4, 40);
    ctx.fillText(computer.score, canvas.width * 3 / 4 - 20, 40);

    // Draw dashed center line (net)
    ctx.beginPath();
    ctx.setLineDash([10, 10]); // Dash length, space length
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = 'WHITE';
    ctx.stroke();
    ctx.setLineDash([]); // Reset line style
}

// Handles ball collision with top/bottom walls
function checkWallCollision() {
    // Top wall
    if (ball.y < 0) {
        ball.y = 0;
        ball.dy *= -1;
    }
    // Bottom wall
    if (ball.y + ball.size > canvas.height) {
        ball.y = canvas.height - ball.size;
        ball.dy *= -1;
    }
}

// A simple AABB (Axis-Aligned Bounding Box) collision check
function collides(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.size > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.size > obj2.y;
}

// Function to handle ball-paddle collision and angle calculation
function checkPaddleCollision(paddle) {
    if (collides(ball, paddle)) {
        // 1. Reverse horizontal direction
        ball.dx *= -1.05; // Increase speed slightly with each hit
        
        // 2. Calculate bounce angle
        // Where did the ball hit on the paddle? (-0.5 top, 0 center, +0.5 bottom)
        const relativeIntersectY = (paddle.y + (paddle.height / 2)) - (ball.y + (ball.size / 2));
        const normalizedRelativeIntersection = relativeIntersectY / (paddle.height / 2);
        const maxBounceAngle = Math.PI / 3; // 60 degrees

        // Adjust vertical velocity based on hit location
        const bounceAngle = normalizedRelativeIntersection * maxBounceAngle;
        
        ball.dx = Math.cos(bounceAngle) * ball.speed * (paddle === player ? 1 : -1);
        ball.dy = Math.sin(bounceAngle) * ball.speed * -1;
        
        // Ensure ball is outside of paddle to prevent sticky collision
        if (paddle === player) {
            ball.x = paddle.x + paddle.width;
        } else {
            ball.x = paddle.x - ball.size;
        }
    }
}

// Handles scoring and game reset
function checkScore() {
    // Player missed (Computer scores)
    if (ball.x < 0) {
        computer.score++;
        ball.resetSpeed();
    } 
    // Computer missed (Player scores)
    else if (ball.x + ball.size > canvas.width) {
        player.score++;
        ball.resetSpeed();
    }
    
    // Check for game winner
    if (player.score >= MAX_SCORE || computer.score >= MAX_SCORE) {
        endGame();
    }
}

// Simple AI Logic for the Computer Paddle
function updateAI() {
    // Simple logic: if ball is moving towards the computer, try to track it.
    if (ball.dx > 0) {
        const targetY = ball.y - PADDLE_HEIGHT / 2;
        
        // Move paddle towards the ball's center position
        if (computer.y + computer.height / 2 < ball.y - 15) {
            computer.dy = computer.speed * 0.9; // AI is slightly slower
        } else if (computer.y + computer.height / 2 > ball.y + 15) {
            computer.dy = -computer.speed * 0.9;
        } else {
            computer.dy = 0; // Stop when aligned
        }
    } else {
        // If ball is moving away, slowly return to the center
        const center = canvas.height / 2 - PADDLE_HEIGHT / 2;
        if (computer.y < center - 5) {
            computer.dy = computer.speed * 0.5;
        } else if (computer.y > center + 5) {
            computer.dy = -computer.speed * 0.5;
        } else {
            computer.dy = 0;
        }
    }
    computer.update();
}

// --- 4. Game Loop and Control ---

let gameRunning = false;

function loop() {
    if (!gameRunning) return;

    // 1. CLEAR THE CANVAS (Essential for animation)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 2. UPDATE POSITIONS
    player.update();
    updateAI(); // Update computer paddle position
    ball.update();

    // 3. HANDLE COLLISIONS & SCORE
    checkWallCollision();
    checkPaddleCollision(player);
    checkPaddleCollision(computer);
    checkScore();

    // 4. DRAW EVERYTHING
    drawCourt();
    player.draw();
    computer.draw();
    ball.draw();

    // Request the next frame to continue the loop
    requestAnimationFrame(loop);
}

function endGame() {
    gameRunning = false;
    startScreen.classList.remove('hidden');
    startButton.textContent = player.score >= MAX_SCORE ? 
        'YOU WIN! Click to Play Again' : 
        'GAME OVER! Click to Play Again';
}

function startGame() {
    // Reset scores
    player.score = 0;
    computer.score = 0;
    
    // Reset paddle positions
    player.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    computer.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    
    // Reset ball
    ball.resetSpeed();
    
    // Start game
    startScreen.classList.add('hidden');
    gameRunning = true;
    loop(); // Start the game loop
}

// --- 5. Event Listeners (Player Controls) ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W') {
        player.dy = -player.speed;
    } else if (e.key === 's' || e.key === 'S') {
        player.dy = player.speed;
    }
});

document.addEventListener('keyup', (e) => {
    if ((e.key === 'w' || e.key === 'W') && player.dy < 0) {
        player.dy = 0;
    } else if ((e.key === 's' || e.key === 'S') && player.dy > 0) {
        player.dy = 0;
    }
});

// Start button listener
startButton.addEventListener('click', startGame);

// Draw the initial screen before the game starts
drawCourt();