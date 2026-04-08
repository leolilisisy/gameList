// Math Game Script
// Solve math problems quickly

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var timerDisplay = document.getElementById('timer');
var scoreDisplay = document.getElementById('score');
var restartBtn = document.getElementById('restart');
var messageDiv = document.getElementById('message');

var currentProblem = '';
var correctAnswer = 0;
var options = [];
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
    scoreDisplay.textContent = 'Score: ' + score;
    generateProblem();
    startTimer();
    draw();
}

// Generate a random math problem
function generateProblem() {
    var num1 = Math.floor(Math.random() * 20) + 1;
    var num2 = Math.floor(Math.random() * 20) + 1;
    var operations = ['+', '-', '*'];
    var op = operations[Math.floor(Math.random() * operations.length)];
    
    if (op === '+') {
        correctAnswer = num1 + num2;
        currentProblem = num1 + ' + ' + num2;
    } else if (op === '-') {
        // Ensure positive result
        if (num1 < num2) {
            var temp = num1;
            num1 = num2;
            num2 = temp;
        }
        correctAnswer = num1 - num2;
        currentProblem = num1 + ' - ' + num2;
    } else if (op === '*') {
        // Smaller numbers for multiplication
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        correctAnswer = num1 * num2;
        currentProblem = num1 + ' × ' + num2;
    }
    
    // Generate options
    options = [];
    var correctIndex = Math.floor(Math.random() * 4);
    for (var i = 0; i < 4; i++) {
        if (i === correctIndex) {
            options.push(correctAnswer);
        } else {
            var wrongAnswer;
            do {
                wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
            } while (wrongAnswer === correctAnswer || wrongAnswer < 0);
            options.push(wrongAnswer);
        }
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the problem
    ctx.fillStyle = '#000';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(currentProblem + ' = ?', canvas.width / 2, 100);
    
    // Draw the options
    for (var i = 0; i < options.length; i++) {
        var x = 150 + (i % 2) * 250;
        var y = 200 + Math.floor(i / 2) * 100;
        
        // Draw button background
        ctx.fillStyle = '#e1bee7';
        ctx.fillRect(x - 50, y - 25, 100, 50);
        ctx.strokeStyle = '#7b1fa2';
        ctx.strokeRect(x - 50, y - 25, 100, 50);
        
        // Draw the number
        ctx.fillStyle = '#000';
        ctx.font = '24px Arial';
        ctx.fillText(options[i], x, y + 8);
    }
}

// Handle canvas click
canvas.addEventListener('click', function(event) {
    if (!gameRunning) return;
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    
    // Check which option was clicked
    for (var i = 0; i < options.length; i++) {
        var optX = 150 + (i % 2) * 250;
        var optY = 200 + Math.floor(i / 2) * 100;
        if (x >= optX - 50 && x <= optX + 50 && y >= optY - 25 && y <= optY + 25) {
            if (options[i] === correctAnswer) {
                score++;
                scoreDisplay.textContent = 'Score: ' + score;
                messageDiv.textContent = 'Correct!';
                messageDiv.style.color = 'green';
            } else {
                messageDiv.textContent = 'Wrong!';
                messageDiv.style.color = 'red';
            }
            setTimeout(generateProblem, 1000);
            draw();
            break;
        }
    }
});

// Start the timer
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(function() {
        timeLeft--;
        timerDisplay.textContent = 'Time: ' + timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameRunning = false;
            messageDiv.textContent = 'Time\'s up! Final Score: ' + score;
            messageDiv.style.color = 'purple';
        }
    }, 1000);
}

// Restart button
restartBtn.addEventListener('click', initGame);

// Start the game
initGame();