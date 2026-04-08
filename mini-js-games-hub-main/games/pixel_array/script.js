document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('puzzleCanvas');
    const ctx = canvas.getContext('2d');
    const messageDisplay = document.getElementById('game-message');
    const memoryHint = document.getElementById('memory-hint');

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    
    // Global variables to store the original (solved) and current pixel data
    let originalImageData;
    let currentImageData;

    // --- 1. Initialization and Setup ---

    /**
     * Draws a simple pattern onto the canvas to serve as the target image.
     */
    function drawOriginalImage() {
        // Draw a simple, asymmetric pattern for easy recognition and testing
        ctx.fillStyle = '#FF5733'; // Red-Orange
        ctx.fillRect(0, 0, WIDTH / 2, HEIGHT / 2);
        
        ctx.fillStyle = '#33FF57'; // Green
        ctx.fillRect(WIDTH / 2, 0, WIDTH / 2, HEIGHT / 2);
        
        ctx.fillStyle = '#3357FF'; // Blue
        ctx.fillRect(0, HEIGHT / 2, WIDTH / 2, HEIGHT / 2);
        
        ctx.fillStyle = '#FF33A1'; // Pink
        ctx.fillRect(WIDTH / 2, HEIGHT / 2, WIDTH / 2, HEIGHT / 2);
        
        // Add a line or circle for asymmetry (makes reversal more noticeable)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(WIDTH / 4, HEIGHT / 4, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Gets the current pixel array from the canvas.
     */
    function getCanvasData() {
        return ctx.getImageData(0, 0, WIDTH, HEIGHT);
    }

    /**
     * Puts the current pixel array back onto the canvas.
     */
    function putCanvasData(imageData) {
        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Generates the scrambled starting state and kicks off the game.
     */
    function startGame() {
        drawOriginalImage();
        
        // 1. Store the solved state
        originalImageData = getCanvasData();

        // 2. Perform a random sequence of transformations to create the puzzle
        currentImageData = new ImageData(new Uint8ClampedArray(originalImageData.data), WIDTH, HEIGHT);
        let scrambleCount = 0;
        
        // Apply 2-3 random transformations
        for (let i = 0; i < 3; i++) {
            const randomTransform = Math.floor(Math.random() * 3);
            if (randomTransform === 0) {
                applyReverse(currentImageData);
                scrambleCount++;
            } else if (randomTransform === 1) {
                applyChannelShift(currentImageData);
                scrambleCount++;
            } else if (randomTransform === 2) {
                applyInvert(currentImageData);
                scrambleCount++;
            }
        }
        
        putCanvasData(originalImageData); // Show original for memory
        messageDisplay.textContent = `Scrambling the image with ${scrambleCount} operations...`;
        
        // Show the scrambled image after a 3-second memory window
        setTimeout(() => {
            putCanvasData(currentImageData);
            memoryHint.classList.add('hidden');
            messageDisplay.textContent = "Start solving the puzzle!";
        }, 3000);
    }

    // --- 2. Transformation Functions (Core Game Mechanics) ---

    /**
     * Reverses the entire 1D pixel array. This results in an image that is
     * flipped horizontally and vertically (180 degree rotation).
     */
    function applyReverse(imageData) {
        // Must convert to regular Array for Array.prototype.reverse(), then back.
        const dataArray = Array.from(imageData.data);
        const reversedArray = dataArray.reverse();
        
        // Update the original Uint8ClampedArray
        imageData.data.set(reversedArray);
    }

    /**
     * Shifts the color channels R->G, G->B, B->R for every pixel.
     * Alpha channel (A) remains unchanged.
     * Array structure: [R, G, B, A, R, G, B, A, ...]
     */
    function applyChannelShift(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const R = data[i];
            const G = data[i + 1];
            const B = data[i + 2];
            // A = data[i + 3] (unchanged)
            
            // Perform the shift: R gets G's value, G gets B's, B gets R's
            data[i]     = G; // New R
            data[i + 1] = B; // New G
            data[i + 2] = R; // New B
        }
    }

    /**
     * Inverts the image colors by subtracting each channel value from 255.
     * Alpha channel (A) remains unchanged (255 - 255 = 0, which would make it invisible).
     */
    function applyInvert(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i]     = 255 - data[i];     // Invert R
            data[i + 1] = 255 - data[i + 1]; // Invert G
            data[i + 2] = 255 - data[i + 2]; // Invert B
            // data[i + 3] (Alpha) is left alone
        }
    }
    
    // --- 3. Win Condition and Event Handling ---

    /**
     * Compares the current pixel array against the original solved pixel array.
     */
    function checkWinCondition() {
        // Compare the raw data buffers for exact match
        const currentData = currentImageData.data;
        const originalData = originalImageData.data;
        
        if (currentData.length !== originalData.length) return false;

        let match = true;
        for (let i = 0; i < currentData.length; i++) {
            if (currentData[i] !== originalData[i]) {
                match = false;
                break;
            }
        }
        
        if (match) {
            messageDisplay.textContent = "✅ PUZZLE SOLVED! The pixel arrays match! 🎉";
            // Optional: Disable buttons
        } else {
            messageDisplay.textContent = "Puzzle state updated. Keep trying!";
        }
    }

    // Attach transformation buttons to functions
    document.getElementById('btn-reverse').addEventListener('click', () => {
        applyReverse(currentImageData);
        putCanvasData(currentImageData);
        checkWinCondition();
    });

    document.getElementById('btn-channel-shift').addEventListener('click', () => {
        applyChannelShift(currentImageData);
        putCanvasData(currentImageData);
        checkWinCondition();
    });

    document.getElementById('btn-invert').addEventListener('click', () => {
        applyInvert(currentImageData);
        putCanvasData(currentImageData);
        checkWinCondition();
    });

    document.getElementById('btn-reset').addEventListener('click', startGame);

    // Start the game!
    startGame();
});