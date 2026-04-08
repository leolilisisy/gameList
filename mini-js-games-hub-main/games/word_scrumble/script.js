// --- 1. Game Data and Configuration ---
const wordList = [
    "apple", "banana", "orange", "grape", "kiwi",
    "coding", "javascript", "developer", "browser", "algorithm",
    "mountain", "ocean", "forest", "desert", "river"
];

const START_TIME_SECONDS = 30; // Game duration in seconds

// --- 2. Game State Variables ---
let currentWord = ""; // The correct, unscrambled word
let score = 0;
let timeLeft = START_TIME_SECONDS;
let timerInterval;
let gameActive = false;

// --- 3. DOM Element References ---
const scoreDisplay = document.getElementById('score-display');
const timerDisplay = document.getElementById('timer-display');
const scrambledWordDisplay = document.getElementById('scrambled-word');
const guessInput = document.getElementById('guess-input');
const submitButton = document.getElementById('submit-button');
const feedbackElement = document.getElementById('feedback');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const gameContainer = document.querySelector('.game-container'); // Need to show/hide quiz elements

// --- 4. Core Utility Functions ---

// Function to shuffle the letters of a word
function shuffleWord(word) {
    // Convert string to array, shuffle, then join back to string
    let letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
        // Fisher-Yates shuffle algorithm
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    const scrambled = letters.join('');
    
    // Ensure the scrambled word is not the same as the original word
    if (scrambled === word && word.length > 1) {
        // If it accidentally didn't shuffle, shuffle it again
        return shuffleWord(word);
    }
    
    return scrambled.toUpperCase();
}

// Loads a new random word and displays it
function loadNewWord() {
    // 1. Pick a random word
    const randomIndex = Math.floor(Math.random() * wordList.length);
    currentWord = wordList[randomIndex];
    
    // 2. Scramble and display
    const scrambled = shuffleWord(currentWord);
    scrambledWordDisplay.textContent = scrambled;
    
    // 3. Reset input/feedback
    guessInput.value = '';
    feedbackElement.textContent = '';
    feedbackElement.classList.remove('correct', 'incorrect');
    guessInput.focus();
}

// --- 5. Game Loop and Timer ---

function updateTimer() {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}`;
    
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame();
    }
}

function startGame() {
    // Reset state
    score = 0;
    timeLeft = START_TIME_SECONDS;
    gameActive = true;
    
    // Reset UI
    scoreDisplay.textContent = `Score: 0`;
    timerDisplay.textContent = `Time: ${START_TIME_SECONDS}`;
    gameOverScreen.classList.add('hidden');
    gameContainer.querySelector('.info-bar').classList.remove('hidden');
    gameContainer.querySelector('.scramble-area').classList.remove('hidden');
    gameContainer.querySelector('.input-area').classList.remove('hidden');
    feedbackElement.textContent = '';

    // Start timer
    timerInterval = setInterval(updateTimer, 1000);
    
    // Load first word
    loadNewWord();
}

function endGame() {
    gameActive = false;
    
    // Hide game elements
    gameContainer.querySelector('.info-bar').classList.add('hidden');
    gameContainer.querySelector('.scramble-area').classList.add('hidden');
    gameContainer.querySelector('.input-area').classList.add('hidden');
    feedbackElement.textContent = '';

    // Show game over screen
    finalScoreDisplay.textContent = `Your final score is: ${score} points!`;
    gameOverScreen.classList.remove('hidden');
}

// --- 6. Event Handlers ---

function handleSubmit() {
    if (!gameActive) return;
    
    const playerGuess = guessInput.value.toLowerCase().trim();
    
    if (playerGuess === currentWord) {
        // Correct Guess
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
        feedbackElement.textContent = '✅ Correct! +10 points!';
        feedbackElement.className = 'message correct';
        
        // Load the next word quickly
        setTimeout(loadNewWord, 500); 
    } else {
        // Incorrect Guess
        feedbackElement.textContent = '❌ Incorrect. Try again!';
        feedbackElement.className = 'message incorrect';
        
        // Clear input for another attempt
        guessInput.value = '';
        guessInput.focus();
    }
}

// --- 7. Event Listeners ---
submitButton.addEventListener('click', handleSubmit);
restartButton.addEventListener('click', startGame);

// Allow pressing 'Enter' key in the input field to submit the guess
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSubmit();
    }
});

// --- 8. Initialization ---
// Start the game immediately upon loading the script
startGame();