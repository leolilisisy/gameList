// --- Game Setup and Constants ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const messageElement = document.getElementById('message');

// Game constants
const BALL_RADIUS = 8;
const PADDLE_HEIGHT = 15;
const PADDLE_WIDTH = 80;
const PADDLE_SPEED = 7;
const INITIAL_BALL_SPEED = 5;

// Brick layout constants
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 8;
const BRICK_WIDTH = (canvas.width - 20) / BRICK_COLUMN_COUNT - 5; // Calculate width based on canvas
const BRICK_HEIGHT = 15;
const BRICK_PADDING = 5;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 10;

// Game state variables
let score;
let lives;
let paddle;
let ball;
let bricks;
let gameRunning = false;
let gamePaused = true;
let keys = {
    left: false,
    right: false
};

// --- Object Setup Functions ---

/**
 * Initializes the paddle object.
 */
function initPaddle() {
    paddle = {
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        x: (canvas.width - PADDLE_WIDTH) / 2,
        y: canvas.height - PADDLE_HEIGHT - 10
    };
}

/**
 * Initializes the ball object.
 */
function initBall() {
    ball = {
        radius: BALL_RADIUS,
        x: canvas.width / 2,
        y: paddle.y - BALL_RADIUS,
        dx: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1), // Random horizontal start
        dy: -INITIAL_BALL_SPEED, // Always start moving up
        isStuck: true
    };
}

/**
 * Creates the 2D array of brick objects.
 */
function initBricks() {
    bricks = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
            const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
            
            // The status '1' means the brick is active and ready to be drawn
            bricks[c][r] = { x: brickX, y: brickY, status: 1, color: getColor(r) };
        }
    }
}

/**
 * Simple function to assign different colors per row.
 */
function getColor(row) {
    switch(row % 5) {
        case 0: return '#e06c75'; // Red
        case 1: return '#98c379'; // Green
        case 2: return '#61afef'; // Blue
        case 3: return '#d19a66'; // Yellow
        case 4: return '#c678dd'; // Purple
        default: return '#fff';
    }
}

// --- Game Control ---

/**
 * Starts a new game session.
 */
function startGame() {
    score = 0;
    lives = 3;
    gameRunning = true;
    gamePaused = true;
    updateStatus();
    initPaddle();
    initBricks();
    initBall();
    
    messageElement.innerHTML = "<h2>Press Space to Launch!</h2>";
    messageElement.classList.remove('hidden');

    // Start the continuous game loop
    requestAnimationFrame(gameLoop); 
}

/**
 * Resets the ball and checks for game over.
 */
function resetBall() {
    lives--;
    updateStatus();

    if (lives > 0) {
        initBall(); // Reset ball position and velocity
        gamePaused = true;
        messageElement.innerHTML = "<h2>Lost a Life! Press Space to Launch.</h2>";
        messageElement.classList.remove('hidden');
    } else {
        gameOver(false);
    }
}

/**
 * Handles win/lose game state.
 * @param {boolean} won - True if the player won, false if they lost.
 */
function gameOver(won) {
    gameRunning = false;
    if (won) {
        messageElement.innerHTML = `<h2>You Win! Final Score: ${score}</h2><p>Press Space to Restart</p>`;
    } else {
        messageElement.innerHTML = `<h2>Game Over! Final Score: ${score}</h2><p>Press Space to Restart</p>`;
    }
    messageElement.classList.remove('hidden');
}

/**
 * Updates the score and lives display.
 */
function updateStatus() {
    scoreElement.textContent = `Score: ${score}`;
    livesElement.textContent = `Lives: ${lives}`;
}

// --- Physics and Collision Detection ---

/**
 * Updates the ball's position and checks for collisions with walls and paddle.
 */
function updateBall() {
    if (ball.isStuck) {
        // Move the ball with the paddle before launching
        ball.x = paddle.x + paddle.width / 2;
        return;
    }

    // 1. Update position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 2. Wall collision (Top, Left, Right)
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx; // Reverse horizontal direction
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy; // Reverse vertical direction (top wall)
    }

    // 3. Bottom check (Game over for current ball)
    if (ball.y + ball.radius > canvas.height) {
        resetBall();
    }
    
    // 4. Paddle collision
    checkPaddleCollision();

    // 5. Brick collision
    checkBrickCollision();
}

/**
 * Checks for collision between the ball and the paddle, adjusting angle.
 */
function checkPaddleCollision() {
    // Basic vertical and horizontal overlap check
    const isOverlappingX = ball.x + ball.radius > paddle.x && ball.x - ball.radius < paddle.x + paddle.width;
    const isHittingY = ball.y + ball.radius >= paddle.y && ball.y < paddle.y + paddle.height;

    if (isOverlappingX && isHittingY && ball.dy > 0) {
        // Ball is falling (dy > 0) and hit the paddle
        
        // Calculate hit position relative to the paddle center (-1 to 1)
        const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);

        // Adjust horizontal direction (dx) based on the hit point
        // Max deflection angle is controlled by the INITIAL_BALL_SPEED, preventing extreme angles
        ball.dx = hitPoint * INITIAL_BALL_SPEED * 1.5; 
        
        // Reverse vertical direction
        ball.dy = -ball.dy;
    }
}

/**
 * Checks for and handles collisions between the ball and any active brick.
 */
function checkBrickCollision() {
    let bricksRemaining = 0;
    
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const b = bricks[c][r];
            
            if (b.status === 1) {
                bricksRemaining++;

                // AABB (Axis-Aligned Bounding Box) check for simple square brick collision
                const overlapX = ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + BRICK_WIDTH;
                const overlapY = ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + BRICK_HEIGHT;

                if (overlapX && overlapY) {
                    // Collision occurred!
                    b.status = 0; // Destroy the brick
                    score += 10;
                    updateStatus();
                    
                    // Simple Vertical Reversal: Reverse vertical direction (dy)
                    // (A more complex system would check collision side, but reversal is standard for Breakout clones)
                    ball.dy = -ball.dy;
                    
                    // Check for win condition
                    if (bricksRemaining - 1 === 0) {
                        gameOver(true);
                    }
                    
                    // Exit inner loops after the first brick hit in this frame
                    return; 
                }
            }
        }
    }
}

/**
 * Updates the paddle's position based on user input.
 */
function updatePaddle() {
    if (keys.left && paddle.x > 0) {
        paddle.x -= PADDLE_SPEED;
    }
    if (keys.right && paddle.x < canvas.width - paddle.width) {
        paddle.x += PADDLE_SPEED;
    }
}

// --- Drawing Functions ---

/**
 * Clears the canvas.
 */
function clearCanvas() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draws the ball.
 */
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#61afef'; // Blue ball
    ctx.fill();
    ctx.closePath();
}

/**
 * Draws the paddle.
 */
function drawPaddle() {
    ctx.fillStyle = '#e06c75'; // Red paddle
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

/**
 * Draws all active bricks.
 */
function drawBricks() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                ctx.fillStyle = b.color;
                ctx.fillRect(b.x, b.y, BRICK_WIDTH, BRICK_HEIGHT);
                
                // Add a simple border
                ctx.strokeStyle = '#000';
                ctx.strokeRect(b.x, b.y, BRICK_WIDTH, BRICK_HEIGHT);
            }
        }
    }
}

// --- Game Loop ---

/**
 * Main rendering and update loop using requestAnimationFrame.
 * @param {number} timestamp - The current time provided by the browser.
 */
function gameLoop(timestamp) {
    if (!gameRunning) return;

    // 1. Input and Update
    if (!gamePaused) {
        updatePaddle();
        updateBall();
    }

    // 2. Rendering
    clearCanvas();
    drawBricks();
    drawPaddle();
    drawBall();
    
    // 3. Continue the loop
    requestAnimationFrame(gameLoop);
}

// --- Event Handlers ---

function handleKeydown(event) {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        keys.left = true;
    } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        keys.right = true;
    } else if (event.key === ' ' || event.key.toLowerCase() === 'spacebar') {
        // Space bar launches the ball or restarts the game
        if (!gameRunning) {
            startGame();
        } else if (ball.isStuck) {
            ball.isStuck = false;
            gamePaused = false;
            messageElement.classList.add('hidden');
        }
    }
}

function handleKeyup(event) {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        keys.left = false;
    } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        keys.right = false;
    }
}

// Attach event listeners
document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);

// --- Start the Game (Initial setup) ---
startGame();