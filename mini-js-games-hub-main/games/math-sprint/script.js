// --- DOM Elements ---
const equationElement = document.getElementById('equation');
const answerInput = document.getElementById('answer-input');
const scoreElement = document.getElementById('score');
const gameTimerElement = document.getElementById('game-timer');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restart-button');
const progressBar = document.getElementById('progress-bar');
const progressBarContainer = document.getElementById('progress-bar-container');

// --- Game Constants ---
const GAME_DURATION_SECONDS = 60;
const PROBLEM_TIME_LIMIT_MS = 3000; // 3 seconds per problem
const OPERATORS = ['+', '-', '*'];
const MAX_OPERAND = 12; // Max number used in equations

// --- Game State ---
let score = 0;
let timeLeft = GAME_DURATION_SECONDS;
let gameInterval; // For the main game timer
let problemTimeout; // For the per-problem timer
let currentProblem = {
    text: '',
    answer: 0
};
let gameActive = false;

// --- Equation Generation Logic ---

/**
 * Generates a simple arithmetic problem (A op B = ?).
 * Ensures results for subtraction are non-negative and multiplication is simple.
 */
function generateProblem() {
    let num1, num2, operator, result, text;

    // Select two random numbers
    num1 = Math.floor(Math.random() * MAX_OPERAND) + 1;
    num2 = Math.floor(Math.random() * MAX_OPERAND) + 1;
    operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];

    // Enforce simple constraints
    if (operator === '-') {
        // Ensure result is not negative
        if (num1 < num2) {
            [num1, num2] = [num2, num1]; // Swap them
        }
    } else if (operator === '*') {
        // Keep multiplication simple (e.g., max 9 * 9)
        num1 = Math.min(num1, 9);
        num2 = Math.min(num2, 9);
        if (num1 === 1) num1 = 2; // Avoid 1x
        if (num2 === 1) num2 = 2;
    }
    
    // Calculate the result
    switch (operator) {
        case '+':
            result = num1 + num2;
            break;
        case '-':
            result = num1 - num2;
            break;
        case '*':
            result = num1 * num2;
            break;
    }

    // Format the text display
    text = `${num1} ${operator} ${num2} = ?`;

    currentProblem.text = text;
    currentProblem.answer = result;

    equationElement.textContent = text;
}

// --- Game Flow and Timer Management ---

/**
 * Initializes and starts the main game timer.
 */
function startMainTimer() {
    gameInterval = setInterval(() => {
        timeLeft--;
        gameTimerElement.textContent = `Time Left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(gameInterval);
            gameOver();
        }
    }, 1000);
}

/**
 * Starts the timer for the current problem (progress bar).
 */
function startProblemTimer() {
    // 1. Reset progress bar visually
    progressBar.style.transition = 'none';
    progressBar.style.width = '100%';
    // Forces a reflow to apply 'none' before setting the transition
    progressBar.offsetWidth; 

    // 2. Start the width transition
    progressBar.style.transition = `width ${PROBLEM_TIME_LIMIT_MS / 1000}s linear`;
    progressBar.style.width = '0%';

    // 3. Set a timeout for when the problem expires
    problemTimeout = setTimeout(() => {
        // Time ran out!
        handleIncorrectAnswer(true);
    }, PROBLEM_TIME_LIMIT_MS);
}

/**
 * Moves to the next problem, resetting the problem timer.
 */
function nextProblem() {
    clearTimeout(problemTimeout);
    answerInput.value = '';
    answerInput.disabled = false;
    answerInput.focus();
    
    generateProblem();
    startProblemTimer();
}

/**
 * Called when the user submits an answer.
 */
function checkAnswer() {
    if (!gameActive) return;

    const userAnswer = parseInt(answerInput.value.trim());

    if (isNaN(userAnswer)) {
        // Allow user to clear input and try again without penalty
        return; 
    }

    if (userAnswer === currentProblem.answer) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer(false);
    }
}

/**
 * Handles a correct answer submission.
 */
function handleCorrectAnswer() {
    score++;
    scoreElement.textContent = `Score: ${score}`;
    messageElement.textContent = '✅ Correct!';
    messageElement.style.color = '#a6e3a1'; // Green

    // Immediately move to the next problem
    nextProblem();
}

/**
 * Handles an incorrect answer submission or a timeout.
 * @param {boolean} isTimeout - True if the time ran out.
 */
function handleIncorrectAnswer(isTimeout) {
    // No score penalty, just move on
    messageElement.textContent = isTimeout 
        ? `⏰ Time Out! The answer was ${currentProblem.answer}.`
        : `❌ Incorrect! The answer was ${currentProblem.answer}.`;
    messageElement.style.color = '#f38ba8'; // Pink/Red

    // Disable input briefly
    answerInput.disabled = true;
    
    // Give player a second to read the message, then continue
    setTimeout(nextProblem, 1000); 
}

/**
 * Ends the game and displays the final score.
 */
function gameOver() {
    gameActive = false;
    answerInput.disabled = true;
    clearTimeout(problemTimeout);
    
    // Stop the progress bar animation
    progressBar.style.width = '0%';
    progressBar.style.transition = 'none';

    messageElement.textContent = `Time's Up! Final Score: ${score}`;
    messageElement.style.color = '#d19a66';
    restartButton.classList.remove('hidden');
    
    // Hide progress bar for game over
    progressBarContainer.style.display = 'none';
}

/**
 * Resets all game state and starts the game.
 */
function startGame() {
    score = 0;
    timeLeft = GAME_DURATION_SECONDS;
    gameActive = true;
    
    // Reset DOM elements
    scoreElement.textContent = 'Score: 0';
    gameTimerElement.textContent = `Time Left: ${GAME_DURATION_SECONDS}s`;
    messageElement.textContent = '';
    restartButton.classList.add('hidden');
    progressBarContainer.style.display = 'block';

    // Start timers and the first problem
    startMainTimer();
    nextProblem();
}

// --- Event Handlers ---

/**
 * Handles 'Enter' key press on the input field.
 */
answerInput.addEventListener('keypress', function(event) {
    // Check for Enter key
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission
        checkAnswer();
    }
});

/**
 * Handles the initial start and restart button.
 */
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !gameActive) {
        startGame();
    }
});

restartButton.addEventListener('click', startGame);

// --- Initial Setup ---
// Set initial message
messageElement.textContent = 'Press Enter to Start!';
answerInput.disabled = true;