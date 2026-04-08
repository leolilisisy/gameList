document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements & Constants ---
    const playingField = document.getElementById('playing-field');
    const targetBox = document.getElementById('target-box');
    const hintMessage = document.getElementById('hint-message');
    const startButton = document.getElementById('start-button');
    const clickCountSpan = document.getElementById('click-count');

    const FIELD_SIZE = 400; // Must match CSS variable
    const TARGET_SIZE = 40; // Must match CSS variable
    const MAX_DISTANCE = Math.sqrt(FIELD_SIZE * FIELD_SIZE); // Max diagonal distance

    // --- 2. Game State Variables ---
    let targetX = 0; // Center X coordinate of the hidden box
    let targetY = 0; // Center Y coordinate of the hidden box
    let clicks = 0;
    let gameActive = false;

    // --- 3. CORE LOGIC FUNCTIONS ---

    /**
     * Generates a random, safe position for the center of the target box.
     */
    function setRandomTargetPosition() {
        // Range should be offset by half the target size to prevent it from clipping the edge
        const minPos = TARGET_SIZE / 2;
        const maxPos = FIELD_SIZE - (TARGET_SIZE / 2);

        targetX = Math.random() * (maxPos - minPos) + minPos;
        targetY = Math.random() * (maxPos - minPos) + minPos;

        // Apply absolute position to the target box element (it's hidden by default CSS)
        targetBox.style.left = `${targetX}px`;
        targetBox.style.top = `${targetY}px`;
        
        console.log(`Target center set at: (${targetX.toFixed(2)}, ${targetY.toFixed(2)})`);
    }

    /**
     * Calculates the distance between the mouse and the target center.
     * @param {number} mouseX - Mouse X coordinate relative to the playing field.
     * @param {number} mouseY - Mouse Y coordinate relative to the playing field.
     * @returns {number} The Euclidean distance.
     */
    function calculateDistance(mouseX, mouseY) {
        const dx = mouseX - targetX;
        const dy = mouseY - targetY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Provides "Hot/Cold" text feedback based on the distance.
     * @param {number} distance - The distance from the mouse to the target center.
     */
    function getHint(distance) {
        // Define ranges for feedback
        if (distance < 20) return { text: "🔥🔥 INCREDIBLY HOT! 🔥🔥", color: '#e74c3c' };
        if (distance < 50) return { text: "🔥 Very Hot!", color: '#f39c12' };
        if (distance < 100) return { text: "Warm", color: '#f1c40f' };
        if (distance < 200) return { text: "Cool", color: '#3498db' };
        return { text: "🥶 Ice Cold", color: '#95a5a6' };
    }

    /**
     * Handles the continuous mouse movement event over the playing field.
     */
    function handleMouseMove(event) {
        if (!gameActive) return;

        // event.offsetX/Y gives coordinates relative to the element (playingField)
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;

        const distance = calculateDistance(mouseX, mouseY);
        const hint = getHint(distance);

        hintMessage.textContent = hint.text;
        hintMessage.style.color = hint.color;
    }
    
    /**
     * Handles the successful click on the target box.
     */
    function handleTargetClick() {
        if (!gameActive) return;

        // Stop the game and animation loop
        gameActive = false;
        
        // Reveal the box and show winning message
        targetBox.classList.add('found');
        hintMessage.innerHTML = `🎉 **FOUND IT!** You found the box in ${clicks} clicks!`;
        hintMessage.style.color = '#2ecc71';
        
        startButton.textContent = 'Play Again';
        startButton.disabled = false;
        
        // Remove mousemove listener to stop giving hints
        playingField.removeEventListener('mousemove', handleMouseMove);
    }
    
    /**
     * Handles any click within the playing field (used for counting misses).
     */
    function handleFieldClick(event) {
        if (!gameActive) return;

        // Check if the click was *not* on the target box itself
        if (event.target.id !== 'target-box') {
            clicks++;
            clickCountSpan.textContent = clicks;
        }
        // Clicks on the target are handled by handleTargetClick
    }

    /**
     * Starts the game round.
     */
    function startGame() {
        // Reset all state
        clicks = 0;
        clickCountSpan.textContent = clicks;
        gameActive = true;
        targetBox.classList.remove('found');
        targetBox.style.display = 'block';
        startButton.disabled = true;
        
        setRandomTargetPosition();
        hintMessage.textContent = 'Move your mouse to feel the heat...';
        
        // Add listeners
        playingField.addEventListener('mousemove', handleMouseMove);
    }

    // --- 4. EVENT LISTENERS ---
    
    startButton.addEventListener('click', startGame);
    
    // Attach listener to the invisible target box
    targetBox.addEventListener('click', handleTargetClick);
    
    // Attach listener to the whole field to count total clicks (including misses)
    playingField.addEventListener('click', handleFieldClick);
    
    // Initial setup message
    hintMessage.textContent = 'Press START SEARCH to begin the round!';
});