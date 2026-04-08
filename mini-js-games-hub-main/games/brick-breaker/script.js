document.addEventListener('DOMContentLoaded', () => {
    // --- Canvas Setup ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const GAME_WIDTH = canvas.width;
    const GAME_HEIGHT = canvas.height;

    // --- DOM References ---
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    const startButton = document.getElementById('start-button');
    const gameMessage = document.getElementById('game-message');

    // --- Game State ---
    let score = 0;
    let lives = 3;
    let gameRunning = false;
    let animationFrameId;

    // --- Paddle Properties ---
    const PADDLE_HEIGHT = 10;
    const PADDLE_WIDTH = 75;
    let paddleX = (GAME_WIDTH - PADDLE_WIDTH) / 2;
    let rightPressed = false;
    let leftPressed = false;

    // --- Ball Properties ---
    const BALL_RADIUS = 10;
    let x = GAME_WIDTH / 2;
    let y = GAME_HEIGHT - 30;
    let dx = 2; // Initial horizontal speed
    let dy = -2; // Initial vertical speed (moving up)

    // --- Brick Properties ---
    const BRICK_ROW_COUNT = 5;
    const BRICK_COLUMN_COUNT = 5;
    const BRICK_WIDTH = 75;
    const BRICK_HEIGHT = 20;
    const BRICK_PADDING = 10;
    const BRICK_OFFSET_TOP = 30;
    const BRICK_OFFSET_LEFT = 30;
    let bricks = [];

    // --- Core Functions ---

    function initializeBricks() {
        bricks = [];
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            bricks[c] = [];
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 }; // status 1 = visible
            }
        }
    }

    function drawBricks() {
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                if (bricks[c][r].status === 1) {
                    const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                    const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                    
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                    ctx.fillStyle = "#0095DD"; // Blue bricks
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#FF4500"; // Orange ball
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, GAME_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillStyle = "#4CAF50"; // Green paddle
        ctx.fill();
        ctx.closePath();
    }

    function updateScoreAndLives() {
        scoreDisplay.textContent = score;
        livesDisplay.textContent = lives;
    }

    function collisionDetection() {
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                const b = bricks[c][r];
                if (b.status === 1) {
                    // Check if ball center is inside brick boundaries
                    if (x > b.x && x < b.x + BRICK_WIDTH && y > b.y && y < b.y + BRICK_HEIGHT) {
                        dy = -dy; // Reverse vertical direction
                        b.status = 0; // Mark brick as hit/destroyed
                        score += 10; // Increment score
                        updateScoreAndLives();

                        if (score === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT * 10) {
                            gameOver(true);
                            return;
                        }
                    }
                }
            }
        }
    }

    function movePaddle() {
        if (rightPressed && paddleX < GAME_WIDTH - PADDLE_WIDTH) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }
    }

    function draw() {
        if (!gameRunning) return;

        // Clear canvas for next frame
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        drawBricks();
        drawBall();
        drawPaddle();
        collisionDetection();
        movePaddle();

        // --- Ball Movement and Wall/Paddle Bounce ---
        
        // 1. Boundary bounce (Left/Right walls)
        if (x + dx > GAME_WIDTH - BALL_RADIUS || x + dx < BALL_RADIUS) {
            dx = -dx;
        }

        // 2. Boundary bounce (Top wall)
        if (y + dy < BALL_RADIUS) {
            dy = -dy;
        } 
        // 3. Paddle/Bottom logic
        else if (y + dy > GAME_HEIGHT - BALL_RADIUS - PADDLE_HEIGHT) {
            // Check collision with paddle
            if (x > paddleX && x < paddleX + PADDLE_WIDTH) {
                dy = -dy;
            } else {
                // Ball hits the bottom (missed paddle)
                lives--;
                updateScoreAndLives();
                
                if (lives === 0) {
                    gameOver(false);
                } else {
                    // Reset ball position for next life
                    x = GAME_WIDTH / 2;
                    y = GAME_HEIGHT - 30;
                    dx = 2; 
                    dy = -2;
                    paddleX = (GAME_WIDTH - PADDLE_WIDTH) / 2;
                }
            }
        }

        // Update ball position
        x += dx;
        y += dy;

        // Request next frame
        animationFrameId = requestAnimationFrame(draw);
    }

    function startGame() {
        if (gameRunning) return;
        
        // Reset full game state
        score = 0;
        lives = 3;
        initializeBricks();

        // Reset ball/paddle position
        x = GAME_WIDTH / 2;
        y = GAME_HEIGHT - 30;
        dx = 2;
        dy = -2;
        paddleX = (GAME_WIDTH - PADDLE_WIDTH) / 2;

        updateScoreAndLives();
        gameMessage.textContent = '';
        startButton.style.display = 'none';
        
        gameRunning = true;
        draw(); // Start the game loop
    }
    
    function gameOver(win) {
        gameRunning = false;
        cancelAnimationFrame(animationFrameId);
        gameMessage.textContent = win ? 'YOU WIN! 🎉 Final Score: ' + score : 'GAME OVER! 😭 Final Score: ' + score;
        startButton.textContent = 'Play Again';
        startButton.style.display = 'block';
    }


    // --- Event Handlers ---
    
    function keyDownHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            rightPressed = true;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            leftPressed = true;
        }
    }

    function keyUpHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            rightPressed = false;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            leftPressed = false;
        }
    }

    // --- Setup ---
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    startButton.addEventListener('click', startGame);

    // Initial setup message
    gameMessage.textContent = 'Press Start to Play!';
    updateScoreAndLives();
});