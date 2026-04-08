document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements & Constants ---
    const character = document.getElementById('character');
    const head = document.getElementById('head');
    const torso = document.getElementById('torso');
    const lThigh = document.getElementById('left-thigh');
    const lShin = document.getElementById('left-shin');
    const rThigh = document.getElementById('right-thigh');
    const rShin = document.getElementById('right-shin');
    const stage = document.getElementById('stage');
    
    const distanceDisplay = document.getElementById('distance-display');
    const lastKeyDisplay = document.getElementById('last-key-display');
    const feedbackMessage = document.getElementById('feedback-message');
    const startButton = document.getElementById('start-button');

    const STAGE_WIDTH = stage.clientWidth;
    
    // --- 2. GAME STATE VARIABLES ---
    let gameActive = false;
    let characterX = 50;
    let distance = 0;
    let lastKeyPressed = ''; // Tracks the last key pressed ('Q' or 'W')
    
    // Physics/Movement settings
    let legAngle = { left: 5, right: -5 }; // Current rotation angle of the thighs
    let legVelocity = { left: 0, right: 0 }; // Current angular velocity
    let torque = 10; // Force applied on key press
    let angularFriction = 0.95;
    let maxAngle = 60; // Max forward/backward rotation
    let horizontalSpeed = 0.5; // Base movement per frame
    let fallThreshold = 45; // Angle threshold for falling

    // Game loop timing
    let animationFrameId = null;

    // --- 3. CORE PHYSICS LOOP ---

    /**
     * The main game loop using requestAnimationFrame.
     */
    function gameLoop() {
        if (!gameActive) return;

        // 1. Apply Angular Friction/Gravity (legs naturally fall back towards 0)
        ['left', 'right'].forEach(side => {
            const thigh = side === 'left' ? lThigh : rThigh;
            
            // Apply angular velocity to angle
            legAngle[side] += legVelocity[side];
            
            // Apply friction
            legVelocity[side] *= angularFriction;
            
            // Apply angle back toward center (gravity/balance effect)
            legVelocity[side] += (-legAngle[side] * 0.05); 
            
            // Constrain angles
            legAngle[side] = Math.min(Math.max(legAngle[side], -maxAngle), maxAngle);

            // Update CSS transform for thigh
            thigh.style.transform = `rotate(${legAngle[side]}deg)`;
            
            // Update CSS transform for shin (follows thigh, simple joint simulation)
            const shin = side === 'left' ? lShin : rShin;
            shin.style.transform = `rotate(${-legAngle[side] * 1.5}deg)`; // Kick shin back/forward more aggressively
        });

        // 2. Check for Fall (Game Over)
        if (Math.abs(legAngle.left) >= fallThreshold || Math.abs(legAngle.right) >= fallThreshold) {
            endGame(false);
            return;
        }

        // 3. Apply Horizontal Movement (Walk/Run)
        // Movement is proportional to how fast the legs are moving/out of sync
        const speedFactor = Math.abs(legAngle.left) + Math.abs(legAngle.right);
        characterX += (speedFactor / 50) * horizontalSpeed;
        distance += (speedFactor / 50) * horizontalSpeed;
        
        // 4. Update DOM
        character.style.left = `${characterX}px`;
        distanceDisplay.textContent = distance.toFixed(1);
        
        // 5. Continue Loop
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // --- 4. CONTROL HANDLERS ---

    /**
     * Applies torque to the specified leg upon key press.
     * @param {string} key - 'Q' or 'W'.
     */
    function applyTorque(key) {
        if (!gameActive) return;

        const side = key === 'Q' ? 'left' : 'right';
        const angleFactor = key === 'Q' ? 1 : -1; // Q applies forward force (+), W applies backward force (-)

        // Prevent spamming the same key repeatedly without alternation
        if (key === lastKeyPressed) {
            // Apply heavy penalty or skip
            // feedbackMessage.textContent = '❌ Must alternate keys!';
            return; 
        }

        // Apply torque/force to the angular velocity
        legVelocity[side] += angleFactor * torque * 0.1;
        
        // Tilt the head/torso slightly for humorous effect
        torso.style.transform = `rotate(${angleFactor * 5}deg)`;
        head.style.transform = `rotate(${angleFactor * 5}deg)`;
        setTimeout(() => {
             torso.style.transform = 'rotate(0deg)';
             head.style.transform = 'rotate(0deg)';
        }, 100);

        lastKeyPressed = key;
        lastKeyDisplay.textContent = key;
        feedbackMessage.textContent = 'WALK!';
    }
    
    // --- 5. GAME FLOW ---
    
    function startGame() {
        if (gameActive) return;
        
        // Reset state
        characterX = 50;
        distance = 0;
        legAngle = { left: 5, right: -5 };
        legVelocity = { left: 0, right: 0 };
        lastKeyPressed = '';
        gameActive = true;
        
        startButton.disabled = true;
        feedbackMessage.textContent = 'Press Q and W now!';
        
        gameLoop(); // Start the physics simulation
    }

    function endGame(win) {
        gameActive = false;
        cancelAnimationFrame(animationFrameId);

        if (!win) {
            // Player fell down
            feedbackMessage.innerHTML = `🤕 **Ouch! You fell!** Distance: ${distance.toFixed(1)}m`;
            feedbackMessage.style.color = '#e74c3c';
            
            // Visual fall animation
            character.style.top = `${STAGE_WIDTH - 20}px`;
            character.style.transform = `rotate(90deg)`;

        } else {
            // Success condition (not implemented, but good practice)
        }
        
        startButton.textContent = 'RETRY';
        startButton.disabled = false;
    }


    // --- 6. EVENT LISTENERS ---

    startButton.addEventListener('click', startGame);

    // Keyboard Listener
    document.addEventListener('keydown', (e) => {
        if (!gameActive) return;
        
        if (e.code === 'KeyQ' && e.repeat === false) {
            applyTorque('Q');
        } else if (e.code === 'KeyW' && e.repeat === false) {
            applyTorque('W');
        }
    });
    
    // Initial setup
    character.style.left = `${characterX}px`;
});