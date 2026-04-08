// --- Game Setup and Constants ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restartButton');

const GRID_SIZE = 20; // Size of each snake segment and food item
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

let snake;
let food;
let direction; // 'up', 'down', 'left', 'right'
let score;
let gameInterval;
let gameSpeed = 150; // Milliseconds per frame, lower is faster
let changingDirection = false; // To prevent rapid direction changes in one frame

// --- Initialization Function ---
function initGame() {
    snake = [
        { x: 10 * GRID_SIZE, y: 10 * GRID_SIZE } // Starting head position
    ];
    direction = 'right';
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    restartButton.style.display = 'none';
    
    generateFood();
    if (gameInterval) clearInterval(gameInterval); // Clear any existing interval
    gameInterval = setInterval(gameLoop, gameSpeed);
    changingDirection = false; // Reset for new game
    draw(); // Initial draw
}

// --- Game Logic Functions ---

/**
 * Generates a new food item at a random, unoccupied grid position.
 */
function generateFood() {
    let newFoodX, newFoodY;
    let collisionWithSnake;

    do {
        newFoodX = Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)) * GRID_SIZE;
        newFoodY = Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)) * GRID_SIZE;

        collisionWithSnake = snake.some(segment => segment.x === newFoodX && segment.y === newFoodY);
    } while (collisionWithSnake);

    food = { x: newFoodX, y: newFoodY };
}

/**
 * Updates the snake's position, checks for collisions, and handles food consumption.
 */
function updateGame() {
    // Create new head based on current direction
    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up':
            head.y -= GRID_SIZE;
            break;
        case 'down':
            head.y += GRID_SIZE;
            break;
        case 'left':
            head.x -= GRID_SIZE;
            break;
        case 'right':
            head.x += GRID_SIZE;
            break;
    }

    // Add new head to the front of the snake
    snake.unshift(head);

    // Check for collisions
    if (checkCollision(head)) {
        gameOver();
        return;
    }

    // Check if food was eaten
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = `Score: ${score}`;
        generateFood(); // Generate new food
        // Snake grows: don't remove tail in this step
    } else {
        snake.pop(); // Remove tail segment if no food was eaten
    }

    changingDirection = false; // Allow direction change for next frame
}

/**
 * Checks if the snake's head has collided with boundaries or its own body.
 * @param {object} head - The current head coordinates of the snake.
 * @returns {boolean} True if a collision occurred, false otherwise.
 */
function checkCollision(head) {
    // Collision with walls
    const hitLeftWall = head.x < 0;
    const hitRightWall = head.x >= CANVAS_WIDTH;
    const hitTopWall = head.y < 0;
    const hitBottomWall = head.y >= CANVAS_HEIGHT;

    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
        return true;
    }

    // Collision with self (start checking from the 4th segment to avoid immediate self-collision)
    for (let i = 4; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

/**
 * Handles game over state, stops the game loop, and shows restart button.
 */
function gameOver() {
    clearInterval(gameInterval); // Stop the game loop
    alert(`Game Over! Your Score: ${score}`);
    restartButton.style.display = 'block';
}

// --- Rendering Functions ---

/**
 * Clears the canvas.
 */
function clearCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

/**
 * Draws a single segment of the snake.
 * @param {object} segment - An object with x and y coordinates.
 */
function drawSnakeSegment(segment, color = '#61afef') { // Blue color for snake
    ctx.fillStyle = color;
    ctx.strokeStyle = '#282c34'; // Darker border for segments
    ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
    ctx.strokeRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
}

/**
 * Draws the food item.
 */
function drawFood() {
    ctx.fillStyle = '#e06c75'; // Red color for food
    ctx.strokeStyle = '#282c34';
    ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
    ctx.strokeRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
}

/**
 * Main draw function, called every frame.
 */
function draw() {
    clearCanvas();
    drawFood();
    // Draw each snake segment
    snake.forEach((segment, index) => {
        // You could vary color for head vs body if desired
        drawSnakeSegment(segment, index === 0 ? '#98c379' : '#61afef'); // Green head, blue body
    });
}

// --- Main Game Loop ---
function gameLoop() {
    updateGame();
    draw();
}

// --- Event Listeners ---

/**
 * Handles arrow key presses to change the snake's direction.
 */
function changeDirection(event) {
    if (changingDirection) return; // Prevent multiple direction changes per game tick

    const keyPressed = event.key;
    const goingUp = direction === 'up';
    const goingDown = direction === 'down';
    const goingLeft = direction === 'left';
    const goingRight = direction === 'right';

    // Prevent immediate reverse direction
    if (keyPressed === 'ArrowLeft' && !goingRight) {
        direction = 'left';
        changingDirection = true;
    } else if (keyPressed === 'ArrowRight' && !goingLeft) {
        direction = 'right';
        changingDirection = true;
    } else if (keyPressed === 'ArrowUp' && !goingDown) {
        direction = 'up';
        changingDirection = true;
    } else if (keyPressed === 'ArrowDown' && !goingUp) {
        direction = 'down';
        changingDirection = true;
    }
}

document.addEventListener('keydown', changeDirection);
restartButton.addEventListener('click', initGame);

// --- Start the Game ---
initGame();