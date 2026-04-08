// --- Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const highScoreDisplay = document.getElementById('high-score-display');

// --- Game Constants ---
const GRAVITY = 0.5; // Acceleration due to gravity
const JUMP_VELOCITY = -8; // Upward velocity on a flap/tap
const GAME_SPEED = 3; // Horizontal speed of the pipes
const PIPE_WIDTH = 50;
const PIPE_GAP = 150; // Vertical distance between top and bottom pipe

// --- Game State Variables ---
let bird = {
    x: 50,
    y: canvas.height / 2,
    radius: 12,
    velocity: 0,
    score: 0
};
let pipes = [];
let frameCount = 0;
let gameRunning = false;
let highScore = parseInt(localStorage.getItem('flappyHighScore')) || 0;

// Update High Score Display on load
highScoreDisplay.textContent = `High Score: ${highScore}`;

// --- Game Object Classes ---

/**
 * Represents a single pipe obstacle (top and bottom sections).
 * @param {number} x - The starting x-position of the pipe.
 */
class Pipe {
    constructor(x) {
        this.x = x;
        this.width = PIPE_WIDTH;
        
        // Randomly determine the position of the gap
        // Gap can be anywhere from 100px from the top to 100px from the bottom
        const minGapY = 100;
        const maxGapY = canvas.height - 100 - PIPE_GAP;
        this.gapY = Math.random() * (maxGapY - minGapY) + minGapY;

        this.scored = false;
    }

    // Move the pipe left and draw it
    update() {
        this.x -= GAME_SPEED;
        
        // Draw top pipe
        ctx.fillStyle = "#2ecc71"; // Green pipe color
        ctx.fillRect(this.x, 0, this.width, this.gapY);
        
        // Draw bottom pipe
        ctx.fillRect(this.x, this.gapY + PIPE_GAP, this.width, canvas.height - this.gapY - PIPE_GAP);
    }
}

// --- Game Logic Functions ---

/**
 * Handles the bird's jump action.
 */
function flap() {
    if (!gameRunning) {
        startGame();
        return;
    }
    // Set a strong upward velocity
    bird.velocity = JUMP_VELOCITY;
}

/**
 * Resets all game variables to their initial state.
 */
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.score = 0;
    pipes = [];
    frameCount = 0;
    gameRunning = false;

    // Draw the initial start screen
    draw();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Tap/Space to Start', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 20);
}

/**
 * Initiates the game loop.
 */
function startGame() {
    if (gameRunning) return;
    bird.score = 0; // Reset score for the new game
    gameRunning = true;
    loop(); // Start the animation loop
}

/**
 * Updates the high score and resets the game state.
 */
function gameOver() {
    gameRunning = false;

    // Update high score if current score is better
    if (bird.score > highScore) {
        highScore = bird.score;
        localStorage.setItem('flappyHighScore', highScore);
        highScoreDisplay.textContent = `High Score: ${highScore}`;
    }

    // Display Game Over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = '25px Arial';
    ctx.fillText(`Score: ${bird.score}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.font = '18px Arial';
    ctx.fillText('Tap or Press Space to Restart', canvas.width / 2, canvas.height / 2 + 50);

    // Set a brief delay before allowing a restart flap
    setTimeout(resetGame, 1000); 
}

/**
 * Checks for collisions with the pipes or the ground/ceiling.
 * @returns {boolean} True if a collision occurred, otherwise false.
 */
function checkCollision() {
    // 1. Collision with Ground or Ceiling
    if (bird.y + bird.radius >= canvas.height || bird.y - bird.radius <= 0) {
        return true;
    }

    // 2. Collision with Pipes
    for (const pipe of pipes) {
        const pipeRight = pipe.x + pipe.width;

        // Check if bird is horizontally between the pipes
        if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipeRight) {
            // Check collision with top pipe OR bottom pipe
            const hitTop = bird.y - bird.radius < pipe.gapY;
            const hitBottom = bird.y + bird.radius > pipe.gapY + PIPE_GAP;

            if (hitTop || hitBottom) {
                return true;
            }
        }
    }

    return false;
}

// --- Drawing Functions ---

/**
 * Draws the bird as a simple circle.
 */
function drawBird() {
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#f1c40f"; // Yellow bird color
    ctx.fill();
    ctx.strokeStyle = "#c0392b"; // Red outline
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

/**
 * Draws the current score on the screen.
 */
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(bird.score, 10, 40);
}

/**
 * Draws the ground boundary.
 */
function drawGround() {
    ctx.fillStyle = '#d2b48c'; // Tan color
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
}

/**
 * Clears the canvas and redraws all game elements.
 */
function draw() {
    // 1. Clear the canvas (or redraw background)
    ctx.fillStyle = "#70c5ce"; // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Pipes
    pipes.forEach(pipe => pipe.update());

    // 3. Draw Bird
    drawBird();

    // 4. Draw Score
    drawScore();

    // 5. Draw Ground (optional, but handles ground collision visually)
    drawGround();
}

// --- Game Loop (The Heart of the Game) ---

function loop() {
    if (!gameRunning) return;

    // 1. Physics: Apply gravity and update position
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // 2. Collision Check
    if (checkCollision()) {
        gameOver();
        return; // Stop the loop immediately
    }

    // 3. Pipe Generation
    // Generate a new pipe every ~90 frames (or about every 1.5 seconds at 60 FPS)
    if (frameCount % 90 === 0) {
        pipes.push(new Pipe(canvas.width));
    }

    // 4. Pipe Management & Scoring
    pipes.forEach(pipe => {
        // Scoring: Bird has passed the pipe's X position
        if (pipe.x + pipe.width < bird.x - bird.radius && !pipe.scored) {
            bird.score++;
            pipe.scored = true;
        }
    });

    // Remove off-screen pipes to maintain performance
    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    // 5. Drawing
    draw();

    // 6. Loop Continuation (Optimization)
    frameCount++;
    requestAnimationFrame(loop); // Calls the function on the next repaint
}


// --- Event Listeners (Controls) ---

// Spacebar control
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === ' ') {
        flap();
        e.preventDefault(); // Prevent page scrolling
    }
});

// Mouse/Touch control
canvas.addEventListener('mousedown', flap);
canvas.addEventListener('touchstart', flap);


// --- Initialization ---
resetGame();