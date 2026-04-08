document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CANVAS SETUP ---
    const canvas = document.getElementById('plinko-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set fixed dimensions
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 600;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // --- 2. DOM Elements ---
    const dropButton = document.getElementById('drop-button');
    const resetButton = document.getElementById('reset-button');
    const totalScoreDisplay = document.getElementById('total-score');
    const lastDropScoreDisplay = document.getElementById('last-drop-score');
    const feedbackMessage = document.getElementById('feedback-message');

    // --- 3. PHYSICS & GAME STATE CONSTANTS ---
    const BALL_RADIUS = 8;
    const PEG_RADIUS = 5;
    const GRAVITY = 0.4;
    const FRICTION = 0.9; // Horizontal friction (air resistance)
    const RESTITUTION = 0.8; // Bounciness factor (how much velocity is retained)
    const SCORE_SLOTS = [10, 50, 100, 50, 10]; // Scores for the bottom slots (5 slots)
    const SCORE_SLOT_WIDTH = CANVAS_WIDTH / SCORE_SLOTS.length;

    // Game State
    let ball = null; // Stores the current ball object {x, y, vx, vy}
    let pegs = []; // Array of peg coordinates {x, y}
    let totalScore = 0;
    let animationFrameId = null;

    // --- 4. GAME OBJECTS & INITIALIZATION ---

    /**
     * Creates the arrangement of pegs on the board.
     */
    function createPegs() {
        pegs = [];
        const startY = 100;
        const rows = 10;
        const spacingX = 40;
        const spacingY = 45;
        
        for (let r = 0; r < rows; r++) {
            // Alternate the starting position of each row for the zig-zag pattern
            const offsetX = (r % 2 === 0) ? 0 : spacingX / 2;
            const numPegs = Math.floor((CANVAS_WIDTH - offsetX * 2) / spacingX) - 1;

            for (let i = 0; i < numPegs; i++) {
                pegs.push({
                    x: offsetX + spacingX + i * spacingX,
                    y: startY + r * spacingY
                });
            }
        }
    }

    /**
     * Initializes a new ball object at the top center.
     */
    function dropNewBall() {
        if (ball !== null) return; // Only one ball at a time

        ball = {
            x: CANVAS_WIDTH / 2,
            y: 0,
            vx: (Math.random() - 0.5) * 2, // Initial small random horizontal velocity
            vy: 0, // Initial vertical velocity
            active: true
        };
        
        dropButton.disabled = true;
        feedbackMessage.textContent = 'Ball in play...';
        
        // Start the game loop
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // --- 5. PHYSICS LOOP ---

    /**
     * The main simulation loop (called repeatedly by rAF).
     */
    function gameLoop() {
        if (!ball || !ball.active) {
            cancelAnimationFrame(animationFrameId);
            return;
        }

        // 1. Clear and Draw
        draw();

        // 2. Apply Physics
        ball.vy += GRAVITY; // Apply gravity (vertical acceleration)
        ball.vx *= FRICTION; // Apply friction (slows horizontal movement)
        
        ball.x += ball.vx;
        ball.y += ball.vy;

        // 3. Check Collisions (Pegs)
        pegs.forEach(peg => {
            const dx = ball.x - peg.x;
            const dy = ball.y - peg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const minDistance = BALL_RADIUS + PEG_RADIUS;

            if (distance < minDistance) {
                // COLLISION OCCURRED: Reverse/deflect velocity
                
                // Calculate the normal vector (line from peg center to ball center)
                const normalX = dx / distance;
                const normalY = dy / distance;

                // Calculate the impact velocity along the normal
                const impactVelocity = ball.vx * normalX + ball.vy * normalY;

                // If the impact velocity is positive, the objects are separating or just touching
                if (impactVelocity > 0) return; 

                // Resolve collision (apply impulse perpendicular to the normal)
                const impulseX = impactVelocity * normalX * (1 + RESTITUTION);
                const impulseY = impactVelocity * normalY * (1 + RESTITUTION);

                // Apply the reflection and restitution (bounce)
                ball.vx -= impulseX;
                ball.vy -= impulseY;
                
                // Separate objects to prevent sticking (push ball back by the overlap amount)
                const overlap = minDistance - distance;
                ball.x += normalX * overlap;
                ball.y += normalY * overlap;
            }
        });

        // 4. Check Boundary (Side walls)
        if (ball.x < BALL_RADIUS || ball.x > CANVAS_WIDTH - BALL_RADIUS) {
            ball.vx *= -RESTITUTION; // Reverse horizontal velocity
            ball.x = Math.max(BALL_RADIUS, Math.min(CANVAS_WIDTH - BALL_RADIUS, ball.x));
        }

        // 5. Check Scoring (Bottom)
        if (ball.y >= CANVAS_HEIGHT - BALL_RADIUS) {
            scoreDrop();
            return;
        }

        requestAnimationFrame(gameLoop);
    }

    // --- 6. DRAWING FUNCTIONS ---

    /**
     * Clears the canvas and draws all game elements (pegs, score slots, ball).
     */
    function draw() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw Score Slots
        ctx.fillStyle = '#95a5a6';
        for (let i = 0; i < SCORE_SLOTS.length; i++) {
            const x = i * SCORE_SLOT_WIDTH;
            ctx.fillRect(x, CANVAS_HEIGHT - 30, SCORE_SLOT_WIDTH, 30);
            
            // Draw score text
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(SCORE_SLOTS[i], x + SCORE_SLOT_WIDTH / 2, CANVAS_HEIGHT - 10);
            ctx.fillStyle = '#333';
        }

        // Draw Pegs
        ctx.fillStyle = '#34495e';
        pegs.forEach(peg => {
            ctx.beginPath();
            ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Ball
        if (ball && ball.active) {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // --- 7. SCORING ---

    /**
     * Calculates the score when the ball lands at the bottom.
     */
    function scoreDrop() {
        // Find which slot the ball landed in
        const slotIndex = Math.floor(ball.x / SCORE_SLOT_WIDTH);
        const scoreAwarded = SCORE_SLOTS[slotIndex] || 0; // Use 0 for out-of-bounds safety

        totalScore += scoreAwarded;
        
        // Update DOM
        totalScoreDisplay.textContent = totalScore;
        lastDropScoreDisplay.textContent = scoreAwarded;
        feedbackMessage.textContent = `Scored ${scoreAwarded}! Total: ${totalScore}.`;

        // End the ball's life and re-enable the drop button
        ball.active = false;
        ball = null;
        dropButton.disabled = false;
        
        // Final draw to remove the ball from the canvas
        draw(); 
    }

    // --- 8. EVENT LISTENERS AND INITIAL SETUP ---

    dropButton.addEventListener('click', dropNewBall);
    
    resetButton.addEventListener('click', () => {
        totalScore = 0;
        totalScoreDisplay.textContent = 0;
        lastDropScoreDisplay.textContent = '--';
        feedbackMessage.textContent = 'Score reset. Ready to drop!';
    });

    // Initial setup
    createPegs();
    draw(); // Draw the empty board
});