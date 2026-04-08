// 1. Generate a random number between 1 and 100
let secretNumber = Math.floor(Math.random() * 100) + 1;

// 2. Get DOM elements
const guessInput = document.getElementById('guessInput');
const checkButton = document.getElementById('checkButton');
const feedback = document.getElementById('feedback');
const newGameButton = document.getElementById('newGameButton');

// 3. Game state variables
let gameOver = false;

// Function to handle a guess
function checkGuess() {
    // If the game is already over, do nothing
    if (gameOver) {
        return;
    }

    // Get the user's guess and convert it to a number
    const userGuess = parseInt(guessInput.value);
    
    // Simple validation
    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
        feedback.textContent = 'Please enter a valid number between 1 and 100.';
        feedback.style.color = '#dc3545'; // Red color for error
        return;
    }

    // Main game logic
    if (userGuess === secretNumber) {
        // Correct Guess
        feedback.textContent = `🎉 You got it! The number was ${secretNumber}!`;
        feedback.style.color = '#28a745'; // Green color for win
        endGame();
    } else if (userGuess < secretNumber) {
        // Too Low
        feedback.textContent = 'Too low! Try a higher number.';
        feedback.style.color = '#ffc107'; // Yellow/Orange color
    } else {
        // Too High
        feedback.textContent = 'Too high! Try a lower number.';
        feedback.style.color = '#ffc107'; // Yellow/Orange color
    }
    
    // Clear the input field after each guess
    guessInput.value = '';
    guessInput.focus(); // Keep the cursor in the input
}

// Function to end the current game
function endGame() {
    gameOver = true;
    checkButton.disabled = true; // Disable the Guess button
    newGameButton.classList.remove('hidden'); // Show the Play Again button
    guessInput.disabled = true; // Disable the input field
}

// Function to reset for a new game
function startNewGame() {
    // Reset state
    secretNumber = Math.floor(Math.random() * 100) + 1;
    gameOver = false;
    
    // Reset UI
    guessInput.value = '';
    feedback.textContent = '';
    feedback.style.color = '#555'; // Reset color
    checkButton.disabled = false;
    guessInput.disabled = false;
    newGameButton.classList.add('hidden');
    guessInput.focus();
    
    console.log(`New secret number generated: ${secretNumber}`);
}

// 4. Event Listeners
checkButton.addEventListener('click', checkGuess);
newGameButton.addEventListener('click', startNewGame);

// Allow pressing 'Enter' key in the input field to check the guess
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkGuess();
    }
});

// Optional: Log the number to the console for testing purposes
console.log(`Secret number generated (for testing): ${secretNumber}`);

// Start the game focused
guessInput.focus();