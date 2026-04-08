document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME DATA ---
    // Palettes are arrays of Hex color codes. The game removes one randomly.
    const colorPalettes = [
        ["#4F5D75", "#B0A8B9", "#D0B8C8", "#F6E4A8", "#E69A8D"], // Muted/Dusty
        ["#FF6B6B", "#FFD93D", "#6BCB77", "#4895EF", "#70A1FF"], // Primary/Vibrant
        ["#2C3E50", "#E74C3C", "#F39C12", "#16A085", "#3498DB"], // Flat UI Colors
        ["#000000", "#555555", "#AAAAAA", "#CCCCCC", "#FFFFFF"], // Monochrome
        ["#FFC0CB", "#FFD700", "#7CFC00", "#00FFFF", "#8A2BE2"]  // Bright & Fun
    ];

    // --- 2. GAME STATE VARIABLES ---
    let currentRounds = []; // Shuffled array of palettes
    let currentRoundIndex = 0;
    let score = 0;
    let gameActive = false;
    let correctAnswer = '';

    // --- 3. DOM Elements ---
    const paletteDisplay = document.getElementById('palette-display');
    const optionsContainer = document.getElementById('options-container');
    const feedbackMessage = document.getElementById('feedback-message');
    const scoreSpan = document.getElementById('score');
    const totalRoundsSpan = document.getElementById('total-rounds');
    const startButton = document.getElementById('start-button');
    const nextButton = document.getElementById('next-button');

    // --- 4. UTILITY FUNCTIONS ---

    /**
     * Shuffles an array in place (Fisher-Yates).
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    /**
     * Finds a unique, random incorrect color that is not in the current palette.
     * For simplicity, this uses a pool of *all* colors from all palettes.
     */
    function getUniqueIncorrectColor(currentPalette) {
        const allColors = colorPalettes.flat();
        let incorrectColor = '';
        
        do {
            const randomIndex = Math.floor(Math.random() * allColors.length);
            incorrectColor = allColors[randomIndex];
        } while (currentPalette.includes(incorrectColor)); // Ensure it's not the answer or a displayed color

        return incorrectColor;
    }

    // --- 5. CORE GAME FUNCTIONS ---

    /**
     * Initializes the game setup.
     */
    function startGame() {
        gameActive = true;
        shuffleArray(colorPalettes);
        currentRounds = colorPalettes;
        totalRoundsSpan.textContent = currentRounds.length;
        
        currentRoundIndex = 0;
        score = 0;
        scoreSpan.textContent = score;

        startButton.style.display = 'none';
        nextButton.style.display = 'none';
        loadRound();
    }

    /**
     * Loads the next palette puzzle.
     */
    function loadRound() {
        if (currentRoundIndex >= currentRounds.length) {
            endGame();
            return;
        }

        const originalPalette = [...currentRounds[currentRoundIndex]]; // Use a copy
        
        // 1. Determine the missing color (the answer)
        const missingIndex = Math.floor(Math.random() * originalPalette.length);
        correctAnswer = originalPalette[missingIndex];
        
        // 2. Create the displayed palette (with one missing slot)
        const displayedPalette = originalPalette.slice(0, missingIndex)
                                    .concat(['MISSING'])
                                    .concat(originalPalette.slice(missingIndex + 1));
        
        // 3. Generate Options (1 correct + 3 incorrect)
        let options = [correctAnswer];
        while (options.length < 4) {
            const incorrectColor = getUniqueIncorrectColor(originalPalette);
            if (!options.includes(incorrectColor)) {
                options.push(incorrectColor);
            }
        }
        shuffleArray(options); // Shuffle the final options

        // 4. Update UI
        renderPalette(displayedPalette);
        renderOptions(options);

        feedbackMessage.textContent = 'Which color completes the scheme?';
        feedbackMessage.style.color = '#333';
        nextButton.style.display = 'none';
    }

    /**
     * Renders the main palette display.
     */
    function renderPalette(palette) {
        paletteDisplay.innerHTML = '';
        palette.forEach(color => {
            const swatch = document.createElement('div');
            swatch.classList.add('color-swatch');
            if (color === 'MISSING') {
                swatch.classList.add('missing-swatch');
                swatch.setAttribute('data-color', 'MISSING');
            } else {
                swatch.style.backgroundColor = color;
                swatch.setAttribute('data-color', color);
            }
            paletteDisplay.appendChild(swatch);
        });
    }

    /**
     * Renders the clickable guess options.
     */
    function renderOptions(options) {
        optionsContainer.innerHTML = '';
        options.forEach(color => {
            const swatch = document.createElement('div');
            swatch.classList.add('option-swatch');
            swatch.style.backgroundColor = color;
            swatch.setAttribute('data-guess', color);
            swatch.addEventListener('click', handleGuess);
            optionsContainer.appendChild(swatch);
        });
    }
    
    /**
     * Handles a click on an option swatch.
     */
    function handleGuess(event) {
        if (!gameActive || event.target.classList.contains('disabled')) return;
        
        const guess = event.target.getAttribute('data-guess');

        // 1. Disable all options immediately
        document.querySelectorAll('.option-swatch').forEach(swatch => {
            swatch.classList.add('disabled');
            swatch.removeEventListener('click', handleGuess);
        });
        
        // 2. Check and provide feedback
        if (guess === correctAnswer) {
            score++;
            scoreSpan.textContent = score;
            event.target.classList.add('correct-guess');
            feedbackMessage.textContent = '✨ CORRECT! You have a great eye for color.';
            feedbackMessage.style.color = '#4CAF50';
        } else {
            event.target.classList.add('incorrect-guess');
            feedbackMessage.textContent = `❌ INCORRECT. The missing color was: ${correctAnswer}`;
            feedbackMessage.style.color = '#f44336';
            
            // Highlight the correct answer
            document.querySelectorAll('.option-swatch').forEach(swatch => {
                if (swatch.getAttribute('data-guess') === correctAnswer) {
                    swatch.classList.add('correct-guess');
                }
            });
        }
        
        // 3. Reveal the missing color in the main palette
        const missingSwatch = document.querySelector('.missing-swatch');
        if (missingSwatch) {
            missingSwatch.style.backgroundColor = correctAnswer;
            missingSwatch.classList.remove('missing-swatch');
            missingSwatch.style.border = '3px solid #ff9800'; // Highlight the revealed color
        }

        // 4. Prepare for next round
        nextButton.style.display = 'block';
    }

    /**
     * Ends the game and shows the final score.
     */
    function endGame() {
        gameActive = false;
        paletteDisplay.innerHTML = '<p>Game Over!</p>';
        optionsContainer.innerHTML = '';
        feedbackMessage.textContent = `Final Score: ${score} / ${currentRounds.length}.`;
        feedbackMessage.style.color = '#6a0572';
        nextButton.style.display = 'none';
        
        startButton.textContent = 'PLAY AGAIN';
        startButton.style.display = 'block';
    }

    // --- 6. EVENT LISTENERS ---

    startButton.addEventListener('click', startGame);
    nextButton.addEventListener('click', () => {
        currentRoundIndex++;
        loadRound();
    });

    // Initial check to prevent errors
    if(colorPalettes.length > 0) {
        totalRoundsSpan.textContent = colorPalettes.length;
    }
});