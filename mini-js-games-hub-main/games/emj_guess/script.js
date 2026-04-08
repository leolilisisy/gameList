document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME DATA ---
    const emojiPhrases = [
        { emoji: "🍔🍟🥤", answer: "Fast Food", hint: "Category: Food" },
        { emoji: "☔️💃", answer: "Singing in the Rain", hint: "Category: Movie Title" },
        { emoji: "🐝👑", answer: "Bee Queen", hint: "Category: Phrase" },
        { emoji: "🍎🐛", answer: "Apple Worm", hint: "Category: Food/Object" },
        { emoji: "☕️⏰", answer: "Coffee Time", hint: "Category: Phrase" },
        { emoji: "🥶🧊", answer: "Ice Cold", hint: "Category: Adjective/Feeling" },
        { emoji: "👀", answer: "I See", hint: "Category: Phrase (Hint: What does it look like?)" }
    ];

    // --- 2. GAME STATE VARIABLES ---
    let currentRounds = []; // Shuffled array for the current game
    let currentRoundIndex = 0;
    let score = 0;
    let gameActive = false;

    // --- 3. DOM Elements ---
    const emojiDisplay = document.getElementById('emoji-display');
    const hintArea = document.getElementById('hint-area');
    const guessInput = document.getElementById('guess-input');
    const submitButton = document.getElementById('submit-button');
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
     * Normalizes a string for comparison (lowercase, remove non-alphanumeric).
     * This allows for more flexible user answers (e.g., "fast-food" vs "fast food").
     */
    function normalizeString(str) {
        return str.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    // --- 5. CORE GAME FUNCTIONS ---

    /**
     * Initializes the game.
     */
    function startGame() {
        gameActive = true;
        shuffleArray(emojiPhrases);
        currentRounds = emojiPhrases; // Use all phrases for the game
        totalRoundsSpan.textContent = currentRounds.length;
        
        currentRoundIndex = 0;
        score = 0;
        scoreSpan.textContent = score;

        startButton.style.display = 'none';
        nextButton.style.display = 'none';
        loadRound();
    }

    /**
     * Loads the next emoji phrase onto the screen.
     */
    function loadRound() {
        if (currentRoundIndex >= currentRounds.length) {
            endGame();
            return;
        }

        const roundData = currentRounds[currentRoundIndex];
        
        // Update display
        emojiDisplay.textContent = roundData.emoji;
        hintArea.textContent = `Hint: ${roundData.hint}`;
        feedbackMessage.textContent = 'Make your best guess!';
        feedbackMessage.style.color = '#333';
        
        // Enable input
        guessInput.value = '';
        guessInput.disabled = false;
        submitButton.disabled = false;
        guessInput.focus();
        nextButton.style.display = 'none';
    }

    /**
     * Checks the player's guess against the correct answer.
     */
    function checkGuess() {
        const roundData = currentRounds[currentRoundIndex];
        const correctAnswer = roundData.answer;
        const playerGuess = guessInput.value.trim();

        // Normalize both strings for comparison
        const normalizedGuess = normalizeString(playerGuess);
        const normalizedAnswer = normalizeString(correctAnswer);

        // Disable input after submission
        guessInput.disabled = true;
        submitButton.disabled = true;

        if (normalizedGuess === normalizedAnswer) {
            score++;
            scoreSpan.textContent = score;
            feedbackMessage.textContent = '🎉 CORRECT! Great job!';
            feedbackMessage.style.color = '#4caf50';
        } else {
            feedbackMessage.textContent = `❌ INCORRECT. The answer was: "${correctAnswer}"`;
            feedbackMessage.style.color = '#f44336';
        }
        
        // Prepare for next round
        nextButton.style.display = 'block';
    }

    /**
     * Moves the game to the next round.
     */
    function nextRound() {
        currentRoundIndex++;
        loadRound();
    }

    /**
     * Ends the game and shows the final score.
     */
    function endGame() {
        gameActive = false;
        emojiDisplay.textContent = 'GAME OVER!';
        hintArea.textContent = '';
        feedbackMessage.textContent = `Final Score: ${score} / ${currentRounds.length}.`;
        feedbackMessage.style.color = '#ff9800';
        nextButton.style.display = 'none';
        
        startButton.textContent = 'PLAY AGAIN';
        startButton.style.display = 'block';
    }

    // --- 6. EVENT LISTENERS ---

    startButton.addEventListener('click', startGame);
    nextButton.addEventListener('click', nextRound);
    submitButton.addEventListener('click', checkGuess);
    
    // Allow 'Enter' key to submit the guess
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !submitButton.disabled) {
            checkGuess();
        }
    });

    // Initial setup: check if the user clicks 'Enter' on start button
    startButton.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startGame();
        }
    });
});