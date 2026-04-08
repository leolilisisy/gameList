document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CANVAS SETUP ---
    const canvas = document.getElementById('archery-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set fixed dimensions
    const CANVAS_WIDTH = 700;
    const CANVAS_HEIGHT = 400;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // --- 2. DOM Elements ---
    const shootButton = document.getElementById('shoot-button');
    const resetButton = document.getElementById('reset-button');
    const scoreDisplay = document.getElementById('score-display');
    const shotsDisplay = document.getElementById('shots-display');
    const angleDisplay = document.getElementById('angle-display');
    const powerDisplay = document.getElementById('power-display');
    const feedbackMessage = document.getElementById('feedback-message');

    // --- 3. PHYSICS & GAME STATE CONSTANTS ---
    const GRAVITY = 9.8; // m/s^2 (scaled for canvas units)
    const LAUNCH_X = 50; // Arrow starts at x=50
    const LAUNCH_Y = CANVAS_HEIGHT - 20; // Arrow starts near the bottom
    const ARROW_SIZE = 5;
    const TARGET_SIZE = 30;

    // Game State
    let target = { x: 600, y: CANVAS_HEIGHT - 20 - TARGET_SIZE/2, radius: TARGET_SIZE / 2 };
    let arrow = { x: LAUNCH_X, y: LAUNCH_Y, vx: 0, vy: 0, active: false };
    let initialAngleDeg = 45;
    let initialVelocity = 50; // Power level
    let shots = 0;
    let score = 0;
    
    let isDragging = false;
    let lastTime = 0;
    let animationFrameId = null;

    // --- 4. DRAWING FUNCTIONS ---

    /**
     * Draws the stationary elements (target, ground, bow/launcher).
     */
    function drawStaticElements() {
        // Ground
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);
        
        // Target (Board and Center)
        ctx.fillStyle = '#3498db';
        ctx.fillRect(target.x - target.radius, target.y - target.radius, TARGET_SIZE, TARGET_SIZE);
        
        ctx.fillStyle = '#e74c3c'; // Bullseye
        ctx.beginPath();
        ctx.arc(target.x, target.y, TARGET_SIZE * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Launcher/Bow Placeholder
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(LAUNCH_X, LAUNCH_Y);
        ctx.lineTo(LAUNCH_X + 10, LAUNCH_Y - 20);
        ctx.stroke();
    }
    
    /**
     * Draws the arrow, or the projected trajectory line.
     */
    function drawArrow() {
        if (!arrow.active) {
            // Draw Trajectory Preview
            drawTrajectoryPreview();
            return;
        }

        // Draw the moving arrow
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(arrow.x, arrow.y, ARROW_SIZE, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Calculates and draws the predicted path based on current angle and power.
     */
    function drawTrajectoryPreview() {
        const angleRad = initialAngleDeg * (Math.PI / 180);
        const V0 = initialVelocity;
        
        // Initial velocity components
        const Vx = V0 * Math.cos(angleRad);
        const Vy = -V0 * Math.sin(angleRad); // Negative because canvas Y increases downwards

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(LAUNCH_X, LAUNCH_Y);

        // Simulate path using time steps
        for (let t = 0; t < 10; t += 0.1) {
            // Projectile Motion Formulas
            const x = LAUNCH_X + Vx * t;
            const y = LAUNCH_Y + Vy * t + 0.5 * GRAVITY * t * t;
            
            if (y > CANVAS_HEIGHT) break; // Stop drawing when hitting the ground
            
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    /**
     * Clears the canvas and redraws all elements.
     */
    function draw() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawStaticElements();
        drawArrow();
    }

    // --- 5. GAME LOOP ---

    /**
     * The main simulation loop for arrow movement.
     */
    function gameLoop(timestamp) {
        if (!arrow.active) {
            draw();
            return;
        }

        const deltaTime = (timestamp - lastTime) / 1000; // Time in seconds since last frame
        lastTime = timestamp;

        // 1. Update Velocity (Apply Gravity)
        arrow.vy += GRAVITY * deltaTime * 50; // Scaling factor for visual speed

        // 2. Update Position
        arrow.x += arrow.vx * deltaTime * 50;
        arrow.y += arrow.vy * deltaTime * 50;

        // 3. Check for Termination (Hit Ground or Out of Bounds)
        if (arrow.y >= LAUNCH_Y || arrow.x > CANVAS_WIDTH) {
            checkHit();
            return;
        }
        
        // 4. Update DOM and Continue
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    // --- 6. INPUT AND CONTROL ---

    /**
     * Handles the mouse interaction for setting angle and power.
     */
    canvas.addEventListener('mousedown', (e) => {
        if (arrow.active) return;
        isDragging = true;
        shootButton.disabled = false;
        
        // Initial mouse position
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate power based on distance from launch point
        const dx = mouseX - LAUNCH_X;
        const dy = mouseY - LAUNCH_Y;
        
        // Calculate angle and power based on mouse direction relative to launch point
        updateLaunchParameters(dx, dy);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging || arrow.active) return;
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const dx = mouseX - LAUNCH_X;
        const dy = mouseY - LAUNCH_Y;
        
        updateLaunchParameters(dx, dy);
        draw(); // Redraw trajectory preview instantly
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    /**
     * Updates angle and power based on mouse movement delta.
     */
    function updateLaunchParameters(dx, dy) {
        // 1. Calculate Angle (limited to 0-90 degrees)
        // atan2(y, x) gives angle in radians
        let angleRad = Math.atan2(-dy, dx); // Use -dy because canvas Y is inverted
        let angleDeg = angleRad * (180 / Math.PI);

        // Limit angle between 0 and 90 degrees (must shoot upwards and right)
        if (angleDeg < 0) angleDeg = 0;
        if (angleDeg > 90) angleDeg = 90;

        initialAngleDeg = Math.round(angleDeg);

        // 2. Calculate Power (based on distance of drag)
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Scale distance to a reasonable power range (e.g., 20 to 100)
        let power = Math.min(100, Math.max(20, Math.round(distance / 2)));
        initialVelocity = power;

        // Update DOM display
        angleDisplay.textContent = `${initialAngleDeg}°`;
        powerDisplay.textContent = `${initialVelocity}`;
    }

    /**
     * Launches the arrow based on current settings.
     */
    function launchArrow() {
        if (arrow.active) return;

        shots++;
        shotsDisplay.textContent = shots;
        
        const angleRad = initialAngleDeg * (Math.PI / 180);

        // Calculate initial velocity components
        arrow.vx = initialVelocity * Math.cos(angleRad);
        arrow.vy = -initialVelocity * Math.sin(angleRad); // Negative for upward launch
        
        // Reset position and activate
        arrow.x = LAUNCH_X;
        arrow.y = LAUNCH_Y;
        arrow.active = true;
        shootButton.disabled = true;

        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    /**
     * Checks if the shot successfully hit the target area.
     */
    function checkHit() {
        arrow.active = false;
        
        // Distance from the arrow's final position to the center of the target
        const targetXCenter = target.x;
        const targetYCenter = target.y;

        const dx = arrow.x - targetXCenter;
        const dy = arrow.y - targetYCenter;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check for collision with the square target area
        if (arrow.x > targetXCenter - target.radius && arrow.x < targetXCenter + target.radius &&
            arrow.y > targetYCenter - target.radius && arrow.y < targetYCenter + target.radius) {
            
            // Hit! Award points based on accuracy (distance from bullseye)
            let points = 100 - Math.round(distance * 5); // Max 100 points, min 50

            score += points;
            scoreDisplay.textContent = score;
            feedbackMessage.innerHTML = `🎯 **HIT!** Scored ${points} points!`;
            feedbackMessage.style.color = '#2ecc71';
            
        } else {
            feedbackMessage.innerHTML = '❌ **MISS!** Try a different angle/power.';
            feedbackMessage.style.color = '#e74c3c';
        }
        
        // Redraw once to show the arrow's final resting place
        draw(); 
    }

    // --- 7. EVENT LISTENERS ---
    
    shootButton.addEventListener('click', launchArrow);
    
    resetButton.addEventListener('click', () => {
        score = 0;
        shots = 0;
        scoreDisplay.textContent = 0;
        shotsDisplay.textContent = 0;
        arrow.active = false;
        shootButton.disabled = false;
        feedbackMessage.textContent = 'Game reset. Ready to launch!';
        
        // Clear any ongoing animation
        cancelAnimationFrame(animationFrameId);
        
        // Draw initial state
        draw();
    });

    // Initial setup
    draw();
});