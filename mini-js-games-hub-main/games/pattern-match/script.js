// Pattern Match Game Script
// Memorize and match patterns

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var timerDisplay = document.getElementById('timer');
var scoreDisplay = document.getElementById('score');
var restartBtn = document.getElementById('restart');
var messageDiv = document.getElementById('message');

var currentPattern = [];
var options = [];
var correctIndex = 0;
var score = 0;
var timeLeft = 30;
var timerInterval;
var gameRunning = true;
var showingPattern = true;

// Shape types
var shapes = ['circle', 'square', 'triangle'];
var colors = ['red', 'blue', 'green', 'yellow', 'purple'];

// Initialize the game
function initGame() {
    score = 0;
    timeLeft = 30;
    gameRunning = true;
    showingPattern = true;
    messageDiv.textContent = '';
    scoreDisplay.textContent = 'Score: ' + score;
    generatePattern();
    startTimer();
    draw();
}

// Generate a random pattern
function generatePattern() {
    currentPattern = [];
    for (var i = 0; i < 3; i++) {
        var shape = shapes[Math.floor(Math.random() * shapes.length)];
        var color = colors[Math.floor(Math.random() * colors.length)];
        currentPattern.push({ shape: shape, color: color });
    }
    
    // Generate options
    options = [];
    correctIndex = Math.floor(Math.random() * 4);
    for (var i = 0; i < 4; i++) {
        if (i === correctIndex) {
            options.push(currentPattern.slice());
        } else {
            var wrongPattern = [];
            for (var j = 0; j < 3; j++) {
                var shape = shapes[Math.floor(Math.random() * shapes.length)];
                var color = colors[Math.floor(Math.random() * colors.length)];
                wrongPattern.push({ shape: shape, color: color });
            }
            options.push(wrongPattern);
        }
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (showingPattern) {
        // Draw the pattern to memorize
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Memorize this pattern:', canvas.width / 2, 50);
        
        for (var i = 0; i < currentPattern.length; i++) {
            drawShape(currentPattern[i], 150 + i * 100, 120, 30);
        }
        
        ctx.fillText('Click anywhere to continue', canvas.width / 2, 200);
    } else {
        // Draw the options
        ctx.fillStyle = '#000';
        ctx.font = '18px Arial';
        ctx.fillText('Which one matches?', canvas.width / 2, 50);
        
        for (var i = 0; i < options.length; i++) {
            var x = 100 + (i % 2) * 250;
            var y = 120 + Math.floor(i / 2) * 150;
            
            // Draw option background
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(x - 60, y - 40, 120, 80);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(x - 60, y - 40, 120, 80);
            
            // Draw the pattern
            for (var j = 0; j < options[i].length; j++) {
                drawShape(options[i][j], x - 30 + j * 30, y, 15);
            }
        }
    }
}

// Draw a shape
function drawShape(item, x, y, size) {
    ctx.fillStyle = item.color;
    if (item.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    } else if (item.shape === 'square') {
        ctx.fillRect(x - size, y - size, size * 2, size * 2);
    } else if (item.shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x + size, y + size);
        ctx.closePath();
        ctx.fill();
    }
}

// Handle canvas click
canvas.addEventListener('click', function(event) {
    if (!gameRunning) return;
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    
    if (showingPattern) {
        showingPattern = false;
        draw();
    } else {
        // Check which option was clicked
        for (var i = 0; i < options.length; i++) {
            var optX = 100 + (i % 2) * 250;
            var optY = 120 + Math.floor(i / 2) * 150;
            if (x >= optX - 60 && x <= optX + 60 && y >= optY - 40 && y <= optY + 40) {
                if (i === correctIndex) {
                    score++;
                    scoreDisplay.textContent = 'Score: ' + score;
                    messageDiv.textContent = 'Correct!';
                    messageDiv.style.color = 'green';
                } else {
                    messageDiv.textContent = 'Wrong!';
                    messageDiv.style.color = 'red';
                }
                setTimeout(nextRound, 1000);
                break;
            }
        }
    }
});

// Next round
function nextRound() {
    showingPattern = true;
    generatePattern();
    draw();
}

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
            messageDiv.style.color = 'blue';
        }
    }, 1000);
}

// Restart button
restartBtn.addEventListener('click', initGame);

// Start the game
initGame();