document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME DATA ---
    const clueSet = [
        { clue1: "A deep sleep", clue2: "The opposite of war", answer: "Peace" },
        { clue1: "A metallic element", clue2: "What you write with", answer: "Lead" },
        { clue1: "The highest number on a clock", clue2: "The zodiac sign of the archer", answer: "Sagittarius" },
        { clue1: "A type of financial loan", clue2: "What a dog pulls", answer: "Sled" },
        { clue1: "Where the sun sets", clue2: "Not East", answer: "West" },
        { clue1: "Used to unlock a door", clue2: "A low area between hills", answer: "Key" }
    ];

    // --- 2. DOM Elements ---
    const clueOneDisplay = document.getElementById('clue-one');
    const clueTwoDisplay = document.getElementById('clue-two');
    const playerInput = document.getElementById('player-input');
    const submitButton = document.getElementById('submit-button');
    const feedbackMessage = document.getElementById('feedback-message');
    const scoreDisplay = document.getElementById('score-display');
    const totalRoundsDisplay = document.getElementById('total-rounds');
    const startButton = document.getElementById('start-button');
    const nextButton = document.getElementById('next-button');

    // --- 3. GAME STATE VARIABLES ---
    let currentRounds = []; // Shuffled array of clues for the current game
    let currentRoundIndex = 0;
    let score = 0;
    let gameActive = false;
    
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
     * Normalizes a string for comparison (lowercase, trim whitespace).
     */
    function normalizeString(str) {
        return str.toLowerCase().trim();
    }

    // --- 5. CORE GAME FUNCTIONS ---

    /**
     * Initializes the game by shuffling clues and resetting score.
     */
    function startGame() {
        gameActive = true;
        shuffleArray(clueSet);
        currentRounds = clueSet;
        totalRoundsDisplay.textContent = currentRounds.length;
        
        currentRoundIndex = 0;
        score = 0;
        scoreDisplay.textContent = score;

        startButton.style.display = 'none';
        nextButton.style.display = 'none';
        
        loadClue();
    }

    /**
     * Loads the next set of clues onto the screen.
     */
    function loadClue() {
        if (currentRoundIndex >= currentRounds.length) {
            endGame();
            return;
        }

        const currentClue = currentRounds[currentRoundIndex];
        
        // Update display
        clueOneDisplay.textContent = currentClue.clue1;
        clueTwoDisplay.textContent = currentClue.clue2;
        feedbackMessage.textContent = 'Enter the single word that connects them!';
        feedbackMessage.style.color = '#343a40';
        
        // Enable input
        playerInput.value = '';
        playerInput.disabled = false;
        submitButton.disabled = false;
        playerInput.focus();
        nextButton.style.display = 'none';
    }

    /**
     * Checks the player's guess against the correct answer.
     */
    function checkGuess() {
        const currentClue = currentRounds[currentRoundIndex];
        const playerGuess = playerInput.value;

        // Normalize both strings
        const normalizedGuess = normalizeString(playerGuess);
        const normalizedAnswer = normalizeString(currentClue.answer);

        // Disable input after submission
        playerInput.disabled = true;
        submitButton.disabled = true;

        if (normalizedGuess === normalizedAnswer) {
            score++;
            scoreDisplay.textContent = score;
            feedbackMessage.innerHTML = '🎉 **CORRECT!** You connected the clues.';
            feedbackMessage.style.color = '#28a745';
        } else {
            feedbackMessage.innerHTML = `❌ **INCORRECT.** The connecting word was: **${currentClue.answer}**`;
            feedbackMessage.style.color = '#dc3545';
        }
        
        // Prepare for next round
        nextButton.style.display = 'block';
    }

    /**
     * Moves the game to the next clue.
     */
    function nextClue() {
        currentRoundIndex++;
        loadClue();
    }

    /**
     * Ends the game and shows the final score.
     */
    function endGame() {
        gameActive = false;
        clueOneDisplay.textContent = 'GAME OVER!';
        clueTwoDisplay.textContent = '';
        feedbackMessage.innerHTML = `
            <h2>GAME COMPLETE!</h2>
            <p>Final Score: <strong>${score} out of ${currentRounds.length}</strong>.</p>
        `;
        feedbackMessage.style.color = '#ffc107';
        nextButton.style.display = 'none';
        
        startButton.textContent = 'PLAY AGAIN';
        startButton.style.display = 'block';
    }

    // --- 6. EVENT LISTENERS ---

    startButton.addEventListener('click', startGame);
    nextButton.addEventListener('click', nextClue);
    submitButton.addEventListener('click', checkGuess);
    
    // Allow 'Enter' key to submit the guess
    playerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !submitButton.disabled) {
            checkGuess();
        }
    });

    // Initial message
    clueOneDisplay.textContent = 'A single word...';
    clueTwoDisplay.textContent = '...connects these two ideas.';
});