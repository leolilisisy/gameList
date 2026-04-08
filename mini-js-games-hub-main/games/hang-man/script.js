// --- Dictionary ---
const DICTIONARY = [
    "JAVASCRIPT", "HTML", "CSS", "PROGRAMMING", "COMPUTER", 
    "ALGORITHM", "FRAMEWORK", "VARIABLE", "FUNCTION", "DEVELOPER",
    "CODE", "FLOPPY", "CONNECT", "SCRAMBLE", "REACT", "NODE"
];

// Map of incorrect guesses count to the CSS element ID to reveal
const HANGMAN_PARTS = [
    'head',
    'body',
    'left-arm',
    'right-arm',
    'left-leg',
    'right-leg'
];
const MAX_GUESSES = HANGMAN_PARTS.length + 1; // 7 total guesses (6 parts + 1 initial mistake)


// --- DOM Elements ---
const wordDisplayEl = document.getElementById('word-display');
const guessedLettersEl = document.getElementById('guessed-letters');
const guessCountEl = document.getElementById('guess-count');
const messageEl = document.getElementById('message');
const newGameBtn = document.getElementById('new-game-btn');
const keyboardInput = document.getElementById('keyboard-input');

// --- Game State Variables ---
let selectedWord = '';
let visibleWord = [];
let guessedLetters = new Set();
let incorrectGuesses = 0;
let gameActive = false;

// --- Utility Functions ---

/**
 * Picks a random word from the dictionary.
 * @returns {string} The chosen word, converted to uppercase.
 */
function selectRandomWord() {
    const index = Math.floor(Math.random() * DICTIONARY.length);
    return DICTIONARY[index].toUpperCase();
}

/**
 * Initializes or resets the game state.
 */
function initGame() {
    selectedWord = selectRandomWord();
    visibleWord = Array(selectedWord.length).fill('_');
    guessedLetters.clear();
    incorrectGuesses = 0;
    gameActive = true;

    // Reset UI
    wordDisplayEl.textContent = visibleWord.join(' ');
    guessedLettersEl.textContent = '';
    guessCountEl.textContent = MAX_GUESSES;
    messageEl.textContent = "Guess a letter!";
    messageEl.style.color = 'black';
    newGameBtn.classList.add('hidden');
    
    // Hide all hangman parts
    HANGMAN_PARTS.forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });

    // Re-focus the hidden input to capture key presses
    keyboardInput.focus();
}

/**
 * Updates the word display with new correct guesses.
 */
function updateWordDisplay(letter) {
    let letterFound = false;
    for (let i = 0; i < selectedWord.length; i++) {
        if (selectedWord[i] === letter) {
            visibleWord[i] = letter;
            letterFound = true;
        }
    }
    wordDisplayEl.textContent = visibleWord.join(' ');
    return letterFound;
}

/**
 * Updates the hangman figure based on incorrect guesses.
 */
function drawHangman() {
    if (incorrectGuesses <= HANGMAN_PARTS.length) {
        // The index of the part to reveal is incorrectGuesses - 1
        const partId = HANGMAN_PARTS[incorrectGuesses - 1];
        if (partId) {
            document.getElementById(partId).classList.remove('hidden');
        }
    }
    guessCountEl.textContent = MAX_GUESSES - incorrectGuesses;
}

/**
 * Checks if the player has won or lost.
 */
function checkGameStatus() {
    // 1. Win condition: No more blanks left in the visible word
    if (!visibleWord.includes('_')) {
        messageEl.textContent = "YOU WON! 🎉";
        messageEl.style.color = 'var(--success-color)';
        gameActive = false;
    } 
    // 2. Loss condition: Max incorrect guesses reached
    else if (incorrectGuesses >= MAX_GUESSES) {
        messageEl.textContent = `GAME OVER! The word was: ${selectedWord}`;
        messageEl.style.color = 'var(--danger-color)';
        gameActive = false;
    }

    if (!gameActive) {
        newGameBtn.classList.remove('hidden');
    }
}

// --- Main Guess Handler ---

/**
 * Processes the player's letter guess.
 * @param {string} letter - The letter guessed by the player.
 */
function handleGuess(letter) {
    if (!gameActive) return;

    const char = letter.toUpperCase();

    // 1. Validation: Must be a single, new letter
    if (char.length !== 1 || !/[A-Z]/.test(char)) return;

    if (guessedLetters.has(char)) {
        messageEl.textContent = `You already guessed '${char}'.`;
        messageEl.style.color = 'orange';
        return;
    }
    
    guessedLetters.add(char);
    guessedLettersEl.textContent = Array.from(guessedLetters).join(', ');
    messageEl.textContent = "Keep guessing!";
    messageEl.style.color = 'black';


    // 2. Check if the letter is in the word
    const isCorrect = updateWordDisplay(char);

    if (!isCorrect) {
        incorrectGuesses++;
        drawHangman();
    }

    // 3. Check for win/loss
    checkGameStatus();
}

// --- Event Listeners ---

// Listen to key presses on the hidden input field
keyboardInput.addEventListener('input', (e) => {
    // Take the last character typed (since we set maxlength=1)
    const letter = e.data || e.target.value.slice(-1); 
    
    if (letter) {
        handleGuess(letter);
    }
    // Clear the input field after processing to allow next input
    e.target.value = ''; 
});

// Focus the hidden input when the page loads or the game container is clicked
window.onload = initGame;
document.addEventListener('click', () => {
    keyboardInput.focus();
});

newGameBtn.addEventListener('click', initGame);