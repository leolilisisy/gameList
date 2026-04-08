// Number Game Script
// Tap numbers in ascending order

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var timerDisplay = document.getElementById('timer');
var scoreDisplay = document.getElementById('score');
var restartBtn = document.getElementById('restart');
var messageDiv = document.getElementById('message');

var numbers = [];
var currentTarget = 1;
var score = 0;
var timeLeft = 30;
var timerInterval;
var gameRunning = true;

// Number class
function NumberObj(value, x, y) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.size = 25;
    this.clicked = false;
}

// Initialize the game
function initGame() {
    numbers = [];
    currentTarget = 1;
    score = 0;
    timeLeft = 30;
    gameRunning = true;
    messageDiv.textContent = '';
    scoreDisplay.textContent = 'Next: ' + currentTarget;
    
    // Create numbers 1-20
    var positions = [];
    for (var i = 1; i <= 20; i++) {
        var x, y;
        do {
            x = Math.random() * (canvas.width - 100) + 50;
            y = Math.random() * (canvas.height - 100) + 50;
        } while (positions.some(function(pos) {
            return Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2) < 60;
        }));
        positions.push({ x: x, y: y });
        numbers.push(new NumberObj(i, x, y));
    }
    
    startTimer();
    draw();
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (var i = 0; i < numbers.length; i++) {
        var num = numbers[i];
        if (!num.clicked) {
            ctx.fillStyle = '#e65100';
            ctx.beginPath();
            ctx.arc(num.x, num.y, num.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
            
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(num.value, num.x, num.y + 7);
        }
    }
}

// Handle canvas click
canvas.addEventListener('click', function(event) {
    if (!gameRunning) return;
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    
    for (var i = 0; i < numbers.length; i++) {
        var num = numbers[i];
        if (!num.clicked) {
            var dx = x - num.x;
            var dy = y - num.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < num.size) {
                if (num.value === currentTarget) {
                    num.clicked = true;
                    currentTarget++;
                    score = currentTarget - 1;
                    scoreDisplay.textContent = 'Next: ' + currentTarget;
                    messageDiv.textContent = 'Good!';
                    messageDiv.style.color = 'green';
                    setTimeout(function() {
                        messageDiv.textContent = '';
                    }, 500);
                    draw();
                } else {
                    messageDiv.textContent = 'Wrong number!';
                    messageDiv.style.color = 'red';
                    setTimeout(function() {
                        messageDiv.textContent = '';
                    }, 1000);
                }
                break;
            }
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
            messageDiv.textContent = 'Time\'s up! Highest number: ' + score;
            messageDiv.style.color = 'orange';
        }
    }, 1000);
}

// Restart button
restartBtn.addEventListener('click', initGame);

// Start the game
initGame();