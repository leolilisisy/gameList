document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME DATA ---
    const wordDefinitions = [
        { word: "Nebula", definition: "A cloud of gas and dust in outer space, visible in the night sky." },
        { word: "Eloquent", definition: "Fluent or persuasive in speaking or writing." },
        { word: "Ephemeral", definition: "Lasting for a very short time." },
        { word: "Synergy", definition: "The interaction or cooperation of two or more agents to produce a combined effect greater than the sum of their separate effects." },
        { word: "Ambiguous", definition: "Open to more than one interpretation; having a double meaning." },
        { word: "Curious", definition: "Eager to know or learn something." }
    ];

    // --- 2. GAME STATE VARIABLES ---
    let currentRounds = []; // Shuffled array for the current game
    let currentRoundIndex = 0;
    let score = 0;
    let gameActive = false;

    // --- 3. DOM Elements ---
    const definitionDisplay = document.getElementById('definition-display');
    const lengthInput = document.getElementById('length-input');
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

    // --- 5. CORE GAME FUNCTIONS ---

    /**
     * Initializes the game.
     */
    function startGame() {
        gameActive = true;
        shuffleArray(wordDefinitions);
        currentRounds = wordDefinitions; // Use all definitions
        totalRoundsSpan.textContent = currentRounds.length;
        
        currentRoundIndex = 0;
        score = 0;
        scoreSpan.textContent = score;

        startButton.style.display = 'none';
        nextButton.style.display = 'none';
        loadRound();
    }

    /**
     * Loads the next word definition onto the screen.
     */
    function loadRound() {
        if (currentRoundIndex >= currentRounds.length) {
            endGame();
            return;
        }

        const roundData = currentRounds[currentRoundIndex];
        
        // Update display
        definitionDisplay.textContent = roundData.definition;
        feedbackMessage.textContent = 'Guess the number of letters in the word!';
        feedbackMessage.style.color = '#34495e';
        
        // Enable input
        lengthInput.value = '';
        lengthInput.disabled = false;
        submitButton.disabled = false;
        lengthInput.focus();
        nextButton.style.display = 'none';
    }

    /**
     * Checks the player's number guess against the actual word length.
     */
    function checkGuess() {
        const roundData = currentRounds[currentRoundIndex];
        const correctWord = roundData.word;
        const correctLength = correctWord.length;
        const playerGuess = parseInt(lengthInput.value);

        // Disable input after submission
        lengthInput.disabled = true;
        submitButton.disabled = true;

        if (isNaN(playerGuess)) {
             feedbackMessage.textContent = `Please enter a valid number. The word was **${correctWord}** (${correctLength} letters).`;
             feedbackMessage.style.color = '#e74c3c';
        } else if (playerGuess === correctLength) {
            score++;
            scoreSpan.textContent = score;
            feedbackMessage.textContent = `🎉 CORRECT! The word **${correctWord}** has ${correctLength} letters.`;
            feedbackMessage.style.color = '#2ecc71';
        } else {
            feedbackMessage.textContent = `❌ INCORRECT. The word **${correctWord}** has ${correctLength} letters (your guess: ${playerGuess}).`;
            feedbackMessage.style.color = '#e74c3c';
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
        definitionDisplay.textContent = 'GAME OVER!';
        feedbackMessage.textContent = `Final Score: ${score} / ${currentRounds.length}.`;
        feedbackMessage.style.color = '#1abc9c';
        nextButton.style.display = 'none';
        
        startButton.textContent = 'PLAY AGAIN';
        startButton.style.display = 'block';
    }

    // --- 6. EVENT LISTENERS ---

    startButton.addEventListener('click', startGame);
    nextButton.addEventListener('click', nextRound);
    submitButton.addEventListener('click', checkGuess);
    
    // Allow 'Enter' key to submit the guess
    lengthInput.addEventListener('keypress', (e) => {
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