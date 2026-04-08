document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME DATA ---
    // NOTE: This list is highly truncated for demonstration. 
    // A real game would require a list of thousands of common words.
    const ALL_WORDS = [
        "apple", "orange", "elephant", "tiger", "rabbit", "train", "night", 
        "house", "eagle", "stone", "island", "doctor", "robot", "time", 
        "music", "cat", "dog", "goat", "table", "chair", "tree", "river",
        "earth", "hotel", "lamp", "money", "zebra", "balloon", "north",
        "hello", "open", "nest", "tank", "kite", "easy", "yellow", "wagon"
    ].map(word => word.toUpperCase()); // Convert to uppercase for case-insensitive matching

    // --- 2. DOM Elements ---
    const lastWordDisplay = document.getElementById('last-word');
    const nextLetterDisplay = document.getElementById('next-letter');
    const playerInput = document.getElementById('player-input');
    const submitButton = document.getElementById('submit-button');
    const feedbackMessage = document.getElementById('feedback-message');
    const startButton = document.getElementById('start-button');
    const wordCountDisplay = document.getElementById('word-count');

    // --- 3. GAME STATE VARIABLES ---
    let usedWords = new Set();
    let currentWord = "";
    let gameActive = false;
    let turn = 'player'; // Player always starts the chain for the first word
    
    // --- 4. UTILITY FUNCTIONS ---

    /**
     * Checks if a word exists in the master word list.
     */
    function isWordValid(word) {
        return ALL_WORDS.includes(word);
    }
    
    /**
     * Finds a valid word for the computer to play.
     */
    function findComputerWord(startLetter) {
        const potentialWords = ALL_WORDS.filter(word => 
            word.startsWith(startLetter) && !usedWords.has(word)
        );
        
        if (potentialWords.length === 0) {
            return null; // Computer loses
        }
        
        // Return a random word from the potential list
        const randomIndex = Math.floor(Math.random() * potentialWords.length);
        return potentialWords[randomIndex];
    }

    // --- 5. CORE GAME FUNCTIONS ---

    /**
     * Initializes or restarts the game.
     */
    function initGame() {
        gameActive = true;
        usedWords.clear();
        currentWord = "";
        
        startButton.textContent = 'RESTART';
        playerInput.disabled = false;
        submitButton.disabled = false;
        
        wordCountDisplay.textContent = usedWords.size;
        
        // Computer plays the first word, player must respond to its last letter.
        const firstWord = findComputerWord('A'); // Arbitrarily start the chain with 'A'
        if (firstWord) {
            playTurn(firstWord); // Start the chain
            playerInput.focus();
        } else {
             feedbackMessage.textContent = 'Error: Cannot start the game.';
             endGame();
        }
    }

    /**
     * Handles the player's submission and validation.
     */
    function handlePlayerSubmit() {
        if (!gameActive || turn !== 'player') return;

        const rawInput = playerInput.value.trim().toUpperCase();
        playerInput.value = ''; // Clear input immediately
        
        if (rawInput.length < 3) {
            feedbackMessage.textContent = "Word must be at least 3 letters long.";
            return;
        }

        const requiredLetter = currentWord.slice(-1);

        // 1. Check Chain Rule
        if (!rawInput.startsWith(requiredLetter)) {
            feedbackMessage.textContent = `Word must start with the letter "${requiredLetter}".`;
            return;
        }

        // 2. Check Duplication
        if (usedWords.has(rawInput)) {
            feedbackMessage.textContent = "Word has already been used! Try another.";
            return;
        }

        // 3. Check Validity
        if (!isWordValid(rawInput)) {
            feedbackMessage.textContent = "That word is not recognized in our dictionary.";
            return;
        }

        // --- SUCCESSFUL PLAYER TURN ---
        playTurn(rawInput);
        
        // Hand turn to computer after a short delay
        turn = 'computer';
        playerInput.disabled = true;
        submitButton.disabled = true;
        feedbackMessage.textContent = "Computer is thinking...";
        
        setTimeout(computerTurn, 1500);
    }

    /**
     * Updates the display and game state for a successful turn.
     */
    function playTurn(newWord) {
        currentWord = newWord;
        usedWords.add(currentWord);
        
        const lastLetter = currentWord.slice(-1);
        
        lastWordDisplay.textContent = currentWord;
        nextLetterDisplay.innerHTML = `Your word must start with: **${lastLetter}**`;
        wordCountDisplay.textContent = usedWords.size;
        
        // Re-enable player controls if it's not the computer's turn yet
        if (turn !== 'computer') {
            playerInput.disabled = false;
            submitButton.disabled = false;
            feedbackMessage.textContent = "Enter your word!";
        }
    }

    /**
     * Logic for the computer's turn.
     */
    function computerTurn() {
        const requiredLetter = currentWord.slice(-1);
        const computerWord = findComputerWord(requiredLetter);

        if (computerWord) {
            // Computer found a word
            playTurn(computerWord);
            turn = 'player';
            playerInput.disabled = false;
            submitButton.disabled = false;
            playerInput.focus();
            feedbackMessage.textContent = `Computer plays: ${computerWord}! Your turn!`;
        } else {
            // Computer loses
            endGame('computer');
        }
    }

    /**
     * Stops the game and displays the winner.
     */
    function endGame(loser) {
        gameActive = false;
        playerInput.disabled = true;
        submitButton.disabled = true;
        
        if (loser === 'computer') {
            feedbackMessage.innerHTML = `🏆 **YOU WIN!** The computer couldn't find a word starting with "${currentWord.slice(-1)}".`;
            feedbackMessage.style.color = '#2ecc71';
        } else {
            feedbackMessage.innerHTML = `😭 **GAME OVER.** Invalid word. The computer wins. Final score: ${usedWords.size} words.`;
            feedbackMessage.style.color = '#e74c3c';
        }
    }

    // --- 6. EVENT LISTENERS ---
    
    startButton.addEventListener('click', initGame);
    submitButton.addEventListener('click', handlePlayerSubmit);
    
    playerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !submitButton.disabled) {
            handlePlayerSubmit();
        }
    });

    // Initial message
    lastWordDisplay.textContent = 'Word Chain Challenge';
    nextLetterDisplay.textContent = 'Click START to begin!';
});