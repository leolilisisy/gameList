document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME DATA (DIFFERENCE COORDINATES) ---
    // Coordinates are normalized to the top-left corner (0, 0) of the image.
    // The values (X, Y) are in pixels, corresponding to the CSS image size (400x300).
    const differences = [
        { x: 50, y: 50, found: false },     // Top-left area
        { x: 350, y: 80, found: false },    // Top-right area
        { x: 150, y: 250, found: false },   // Bottom-middle area
        { x: 280, y: 180, found: false }    // Center area
        // NOTE: You must match these coordinates to your actual image differences!
    ];

    // --- 2. DOM Elements & Constants ---
    const imageRightOverlay = document.querySelector('#image-right .clickable-overlay');
    const puzzleArea = document.getElementById('puzzle-area');
    const scoreSpan = document.getElementById('score');
    const timerSpan = document.getElementById('timer');
    const feedbackMessage = document.getElementById('feedback-message');
    const startButton = document.getElementById('start-button');

    const IMAGE_WIDTH = 400; // Must match CSS variable
    const IMAGE_HEIGHT = 300; // Must match CSS variable
    const TOTAL_DIFFERENCES = differences.length;
    const CLICK_TOLERANCE = 30; // Max distance in pixels for a successful click

    // --- 3. Game State Variables ---
    let score = 0;
    let timeLeft = 0;
    let timerInterval = null;
    let gameActive = false;

    // --- 4. CORE FUNCTIONS ---

    /**
     * Initializes the game state and UI for a new round.
     */
    function initGame() {
        // Reset state
        score = 0;
        timeLeft = 60; // 60 seconds
        gameActive = true;
        scoreSpan.textContent = score;
        timerSpan.textContent = timeLeft;
        feedbackMessage.textContent = 'Find the differences! Clicks on the right image are checked.';
        startButton.textContent = 'Restart';
        
        // Reset difference state and remove markers
        differences.forEach(d => d.found = false);
        document.querySelectorAll('.difference-marker').forEach(m => m.remove());
        
        // Add markers for the right image (initially hidden)
        renderDifferenceMarkers();

        // Start timer
        startTimer();
    }
    
    /**
     * Creates and attaches the hidden markers to the puzzle area for later display.
     */
    function renderDifferenceMarkers() {
        const rightImage = document.getElementById('image-right');
        
        // Get the offset of the right image relative to the puzzle-area container
        // This is needed because markers are positioned absolutely within #puzzle-area
        const puzzleAreaRect = puzzleArea.getBoundingClientRect();
        const rightImageRect = rightImage.getBoundingClientRect();
        
        const offsetLeft = rightImageRect.left - puzzleAreaRect.left;
        const offsetTop = rightImageRect.top - puzzleAreaRect.top;

        differences.forEach((diff, index) => {
            const marker = document.createElement('div');
            marker.classList.add('difference-marker');
            marker.setAttribute('data-index', index);
            
            // Set the absolute position within the #puzzle-area container
            marker.style.left = `${diff.x + offsetLeft}px`;
            marker.style.top = `${diff.y + offsetTop}px`;
            
            puzzleArea.appendChild(marker);
        });
    }

    /**
     * Starts the countdown timer.
     */
    function startTimer() {
        clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = timeLeft;

            if (timeLeft <= 0) {
                endGame(false); // Time's up!
            }
        }, 1000);
    }

    /**
     * Handles the click event on the right image overlay.
     */
    function handleImageClick(event) {
        if (!gameActive) return;

        // Get the coordinates relative to the top-left of the image itself
        const clickX = event.offsetX;
        const clickY = event.offsetY;

        let differenceFound = false;

        differences.forEach((diff, index) => {
            // Calculate the distance between the click point and the difference point
            const dx = clickX - diff.x;
            const dy = clickY - diff.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if the click is within the tolerance radius AND if the difference hasn't been found yet
            if (distance <= CLICK_TOLERANCE && !diff.found) {
                diff.found = true;
                differenceFound = true;
                score++;
                scoreSpan.textContent = score;

                // Highlight the found difference on the screen
                const marker = document.querySelector(`.difference-marker[data-index="${index}"]`);
                if (marker) {
                    marker.classList.add('found');
                }
                
                feedbackMessage.textContent = `✅ Found one! (${TOTAL_DIFFERENCES - score} left)`;
                
                // Check win condition
                if (score === TOTAL_DIFFERENCES) {
                    endGame(true);
                }
            }
        });

        if (!differenceFound && score < TOTAL_DIFFERENCES) {
            feedbackMessage.textContent = `❌ Miss! Keep looking.`;
        }
    }

    /**
     * Ends the game and displays the final status.
     */
    function endGame(win) {
        gameActive = false;
        clearInterval(timerInterval);
        
        if (win) {
            feedbackMessage.innerHTML = '🏆 **PUZZLE SOLVED!** You found all the differences.';
            feedbackMessage.style.color = '#4CAF50';
        } else {
            feedbackMessage.innerHTML = '⌛ **TIME\'S UP!** Game Over.';
            feedbackMessage.style.color = '#f44336';
            // Show all markers that were missed
            document.querySelectorAll('.difference-marker:not(.found)').forEach(m => m.style.opacity = 0.5);
        }
    }

    // --- 5. EVENT LISTENERS ---
    
    // Listen for clicks only on the right image's overlay
    imageRightOverlay.addEventListener('click', handleImageClick);
    
    startButton.addEventListener('click', () => {
        if (gameActive) {
            // Restart functionality
            clearInterval(timerInterval);
            initGame();
        } else {
            initGame();
        }
    });

    // Initial setup message
    feedbackMessage.textContent = `Ready to find ${TOTAL_DIFFERENCES} differences?`;
});