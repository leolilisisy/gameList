// Word Screen Game Script
// Type words as fast as possible

var wordDisplay = document.getElementById('word-display');
var inputField = document.getElementById('input-field');
var timerDisplay = document.getElementById('timer');
var scoreDisplay = document.getElementById('score');
var restartBtn = document.getElementById('restart');
var messageDiv = document.getElementById('message');

var words = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'peach', 'quince', 'raspberry', 'strawberry', 'tangerine', 'ugli', 'vanilla', 'watermelon', 'xigua', 'yam', 'zucchini', 'algorithm', 'binary', 'cache', 'debug', 'encryption', 'firewall', 'gateway', 'hash', 'interface', 'javascript', 'kernel', 'lambda', 'middleware', 'namespace', 'object', 'protocol', 'query', 'router', 'server', 'token', 'unicode', 'variable', 'websocket', 'xml', 'yaml', 'zip'];
var currentWord = '';
var score = 0;
var timeLeft = 30;
var timerInterval;
var gameRunning = true;

// Initialize the game
function initGame() {
    score = 0;
    timeLeft = 30;
    gameRunning = true;
    messageDiv.textContent = '';
    scoreDisplay.textContent = 'Words: ' + score;
    inputField.value = '';
    inputField.disabled = false;
    inputField.focus();
    generateWord();
    startTimer();
}

// Generate a random word
function generateWord() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    wordDisplay.textContent = currentWord;
}

// Check input
function checkInput() {
    if (!gameRunning) return;
    var input = inputField.value.trim();
    if (input === currentWord) {
        score++;
        scoreDisplay.textContent = 'Words: ' + score;
        inputField.value = '';
        generateWord();
        messageDiv.textContent = 'Correct!';
        messageDiv.style.color = 'green';
        setTimeout(function() {
            messageDiv.textContent = '';
        }, 500);
    }
}

// Handle input
inputField.addEventListener('input', checkInput);

// Start the timer
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(function() {
        timeLeft--;
        timerDisplay.textContent = 'Time: ' + timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameRunning = false;
            inputField.disabled = true;
            messageDiv.textContent = 'Time\'s up! Final Score: ' + score;
            messageDiv.style.color = 'blue';
        }
    }, 1000);
}

// Restart button
restartBtn.addEventListener('click', initGame);

// Start the game
initGame();