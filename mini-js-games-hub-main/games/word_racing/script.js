document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME DATA ---
    const raceTexts = [
        "The quick brown fox jumps over the lazy dog and runs away from the yellow cat.",
        "Programming is the art of telling another human being what one wants the computer to do.",
        "Every great design starts with an even better story. Consistency is key to user experience.",
        "Jaded wizards pluck ivy from the big quilt. Pack my box with five dozen liquor jugs."
    ];

    // --- 2. DOM Elements ---
    const targetTextElement = document.getElementById('target-text');
    const typingInput = document.getElementById('typing-input');
    const playerRacer = document.getElementById('player-racer');
    const opponentRacer = document.getElementById('opponent-racer');
    const messageElement = document.getElementById('message');
    const startButton = document.getElementById('start-button');

    // --- 3. GAME STATE VARIABLES ---
    let targetText = '';
    let targetLength = 0;
    let currentIndex = 0;
    let gameActive = false;
    let raceInterval = null;

    // --- 4. COMPUTER OPPONENT VARIABLES ---
    const OPPONENT_WPM = 40; // Target words per minute for opponent
    let opponentInterval = null;
    let opponentProgress = 0;
    let opponentSpeed = 0; // Calculated in initGame

    // --- 5. CORE FUNCTIONS ---

    /**
     * Initializes the game state and UI.
     */
    function initGame() {
        // 1. Pick and set new race text
        const randomIndex = Math.floor(Math.random() * raceTexts.length);
        targetText = raceTexts[randomIndex];
        targetLength = targetText.length;
        
        // 2. Calculate Opponent Speed (in characters per interval)
        // Avg Word Length: 5 chars + 1 space = 6 chars/word
        const charsPerMinute = OPPONENT_WPM * 6;
        // The opponent will take 60 seconds (600 intervals of 100ms) to type 60 WPM
        const timeToFinishMS = targetLength / (charsPerMinute / 60000); // Time in ms to type the whole text
        opponentSpeed = (100 / targetLength) / (timeToFinishMS / 100); // Percentage increase per 100ms interval
        
        // Reset state
        currentIndex = 0;
        opponentProgress = 0;
        typingInput.value = '';
        typingInput.disabled = false;
        playerRacer.style.left = '0%';
        opponentRacer.style.left = '0%';
        gameActive = true;
        
        // Render initial text (all characters are default color)
        targetTextElement.innerHTML = targetText;
        messageElement.textContent = 'Race started! Type carefully...';
        startButton.textContent = 'RESTART RACE';

        typingInput.focus();
        
        // Start opponent movement
        opponentInterval = setInterval(moveOpponent, 100);
    }

    /**
     * Handles key input and checks it against the target text.
     */
    function handleTypingInput() {
        if (!gameActive) return;

        const typedValue = typingInput.value;
        const currentLength = typedValue.length;

        // Prevent moving backwards past the current check point
        if (currentLength < currentIndex) {
            // User deleted text, allow it, but don't re-render movement.
            return;
        }

        // Check the newly typed character
        const charToCheck = typedValue[currentLength - 1];
        const targetChar = targetText[currentLength - 1];

        if (charToCheck === targetChar) {
            currentIndex = currentLength;
            updateTextDisplay();
            updateRacerPosition();
        } else {
            // Incorrect character, do not advance currentIndex, highlight error
            typingInput.classList.add('error');
            setTimeout(() => typingInput.classList.remove('error'), 100);
        }

        // Check for win condition
        if (currentIndex === targetLength) {
            endGame('player');
        }
    }

    /**
     * Updates the text display with green (correct) and red (incorrect) highlighting.
     */
    function updateTextDisplay() {
        const correctPart = `<span class="correct">${targetText.substring(0, currentIndex)}</span>`;
        const rest = targetText.substring(currentIndex);
        targetTextElement.innerHTML = correctPart + rest;
    }

    /**
     * Moves the player's racer based on typing progress.
     */
    function updateRacerPosition() {
        const progressPercent = (currentIndex / targetLength) * 100;
        // Subtract a small buffer (e.g., 5%) so the racer doesn't run off the right edge.
        playerRacer.style.left = Math.min(progressPercent, 95) + '%';
    }

    /**
     * Controls the opponent's smooth, automatic movement.
     */
    function moveOpponent() {
        if (!gameActive) {
            clearInterval(opponentInterval);
            return;
        }

        opponentProgress += opponentSpeed;
        
        // Subtract a small buffer (e.g., 5%)
        opponentRacer.style.left = Math.min(opponentProgress, 95) + '%'; 

        if (opponentProgress >= 100) {
            endGame('opponent');
        }
    }

    /**
     * Stops the game and declares the winner.
     */
    function endGame(winner) {
        if (!gameActive) return;

        gameActive = false;
        clearInterval(opponentInterval);
        typingInput.disabled = true;

        if (winner === 'player') {
            messageElement.innerHTML = '🏆 **YOU WIN!** You beat the computer!';
            messageElement.style.color = '#2ecc71';
        } else if (winner === 'opponent') {
            messageElement.innerHTML = '😭 **YOU LOSE.** The computer beat you!';
            messageElement.style.color = '#e74c3c';
        }
    }

    // --- 6. EVENT LISTENERS ---

    startButton.addEventListener('click', initGame);
    typingInput.addEventListener('input', handleTypingInput);

    // Load initial text when script loads
    targetTextElement.innerHTML = 'Ready to race? Click Start!';
});