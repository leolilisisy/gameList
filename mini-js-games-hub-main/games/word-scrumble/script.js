// --- DICTIONARY (Simple, small word list for demonstration) ---
// Note: In a real game, this would be much larger and stored externally.
const DICTIONARY = [
    "word", "draw", "road", "drow", "code", "rock", "core", "cook",
    "scramble", "able", "bale", "blame", "lame", "male", "ramble",
    "cat", "act", "rat", "art", "tar", "star", "rats", "arts",
    "time", "emit", "mite", "item", "met", "tie", "eat", "tea", "ate",
    "play", "lap", "lay", "pay", "pal", "yap", "alp",
    "read", "dear", "dare", "red", "ear", "era", "are"
];

// --- DOM Elements ---
const jumbledLettersEl = document.getElementById('jumbled-letters');
const wordInput = document.getElementById('word-input');
const submitBtn = document.getElementById('submit-btn');
const scrambleBtn = document.getElementById('scramble-btn');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const feedbackMsg = document.getElementById('feedback-msg');
const foundWordsList = document.getElementById('found-words-list');
const foundCountEl = document.getElementById('found-count');
const gameContainer = document.getElementById('game-container');


// --- Game State Variables ---
let currentPuzzle = "";
let availableWords = []; // Dictionary words that can be formed from the puzzle
let foundWords = new Set();
let score = 0;
let timeLeft = 60;
let timerInterval;

// --- Utility Functions ---

/**
 * Creates a frequency map (letter count) for a given string.
 * @param {string} str - The string to analyze.
 * @returns {Map<string, number>} A Map where keys are letters and values are counts.
 */
function getLetterCount(str) {
    const counts = new Map();
    for (const char of str.toLowerCase()) {
        counts.set(char, (counts.get(char) || 0) + 1);
    }
    return counts;
}

/**
 * Checks if a candidate word can be formed using only the letters in the puzzle string.
 * This is the core anagram validation logic.
 * @param {string} candidate - The word submitted by the player.
 * @param {string} puzzle - The jumbled letters available.
 * @returns {boolean} True if the word is a valid anagram of the puzzle's letters.
 */
function isValidAnagram(candidate, puzzle) {
    if (candidate.length === 0) return false;

    const puzzleCounts = getLetterCount(puzzle);
    const candidateCounts = getLetterCount(candidate);

    for (const [char, count] of candidateCounts) {
        // If the puzzle doesn't have the letter, or doesn't have enough of that letter
        if ((puzzleCounts.get(char) || 0) < count) {
            return false;
        }
    }
    return true;
}

/**
 * Shuffles a string (used to jumble the letters).
 * @param {string} str - The string to shuffle.
 * @returns {string} The shuffled string.
 */
function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}


// --- Game Logic ---

/**
 * Selects a base word and generates a new puzzle.
 */
function generatePuzzle() {
    // 1. Select a random long word from the dictionary as the base
    const baseWords = DICTIONARY.filter(w => w.length >= 6 && w.length <= 8);
    if (baseWords.length === 0) {
        alert("Dictionary too small to generate a puzzle!");
        return;
    }
    const baseWord = baseWords[Math.floor(Math.random() * baseWords.length)];
    
    // 2. Set the current puzzle and jumble the letters for display
    currentPuzzle = baseWord.toUpperCase();
    jumbledLettersEl.textContent = shuffleString(currentPuzzle);

    // 3. Find all possible words from this puzzle's letters
    availableWords = DICTIONARY.filter(word => 
        word.length >= 3 && isValidAnagram(word, currentPuzzle)
    );
    
    // 4. Reset game state
    score = 0;
    scoreEl.textContent = score;
    foundWords.clear();
    foundWordsList.innerHTML = '';
    foundCountEl.textContent = 0;
    feedbackMsg.textContent = "Find as many words as you can!";
}

/**
 * Updates the score based on the length of the submitted word.
 * Longer words yield more points.
 * @param {string} word - The valid submitted word.
 */
function updateScore(word) {
    let wordScore = 0;
    const len = word.length;
    
    if (len >= 6) wordScore = 15;
    else if (len === 5) wordScore = 8;
    else if (len === 4) wordScore = 4;
    else if (len === 3) wordScore = 2;
    
    score += wordScore;
    scoreEl.textContent = score;
}

/**
 * Handles the submission of a word by the player.
 */
function handleSubmit() {
    if (timeLeft <= 0) return;

    const word = wordInput.value.trim().toLowerCase();
    wordInput.value = ''; // Clear input field immediately

    if (word.length < 3) {
        showFeedback("Word must be at least 3 letters long.", 'red');
        return;
    }

    if (foundWords.has(word)) {
        showFeedback("You already found that word!", 'orange');
        return;
    }

    // 1. Check if the word can be formed from the puzzle letters (Anagram check)
    if (!isValidAnagram(word, currentPuzzle)) {
        showFeedback("This word cannot be formed from the letters.", 'red');
        return;
    }

    // 2. Check if the word is in the dictionary (Available words check)
    if (availableWords.includes(word)) {
        // SUCCESS!
        foundWords.add(word);
        updateScore(word);
        
        // Add word to the list
        const listItem = document.createElement('li');
        listItem.textContent = word;
        foundWordsList.appendChild(listItem);
        foundCountEl.textContent = foundWords.size;
        
        showFeedback(`+${scoreEl.textContent - score} points!`, 'green');

    } else {
        showFeedback("Not a valid word.", 'red');
    }
}

/**
 * Displays feedback to the player.
 * @param {string} message - The feedback text.
 * @param {string} color - The text color.
 */
function showFeedback(message, color) {
    feedbackMsg.textContent = message;
    feedbackMsg.style.color = color;
    
    // Clear feedback after 2 seconds
    clearTimeout(feedbackMsg.timeoutId);
    feedbackMsg.timeoutId = setTimeout(() => {
        feedbackMsg.textContent = "";
    }, 2000);
}

/**
 * Manages the game timer countdown.
 */
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 60;
    timerEl.textContent = timeLeft;
    gameContainer.classList.remove('disabled');
    wordInput.focus();

    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        if (timeLeft <= 10) {
            timerEl.style.color = 'red';
        } else {
            timerEl.style.color = 'black';
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver();
        }
    }, 1000);
}

/**
 * Ends the game and displays the final score.
 */
function gameOver() {
    gameContainer.classList.add('disabled');
    feedbackMsg.style.color = '#3498db';
    feedbackMsg.textContent = `Time's Up! Final Score: ${score}.`;
    timerEl.textContent = '0';
    wordInput.blur(); // Remove focus
    
    // Optional: Show the words the player missed
    const missedWords = availableWords.filter(word => !foundWords.has(word));
    // console.log(`Missed words: ${missedWords.join(', ')}`);
}


// --- Event Listeners ---

// Handle Enter key press on the input field
wordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handleSubmit();
    }
});

submitBtn.addEventListener('click', handleSubmit);
scrambleBtn.addEventListener('click', () => {
    generatePuzzle();
    startTimer();
});

// --- Initialization ---
generatePuzzle(); // Generate initial puzzle
// Don't start the timer immediately; wait for the player to click 'Scramble' or 'Submit'
feedbackMsg.textContent = "Click 'Scramble' to start the timer!";