// Balloon Burst Game Script
// Click to pop balloons and score points

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var timerDisplay = document.getElementById('timer');
var scoreDisplay = document.getElementById('score');
var restartBtn = document.getElementById('restart');
var messageDiv = document.getElementById('message');

var balloons = [];
var score = 0;
var timeLeft = 30;
var timerInterval;
var gameRunning = true;

// Balloon class
function Balloon(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = 30;
    this.clicked = false;
}

// Initialize the game
function initGame() {
    balloons = [];
    score = 0;
    timeLeft = 30;
    gameRunning = true;
    messageDiv.textContent = '';
    scoreDisplay.textContent = 'Score: ' + score;
    spawnBalloons();
    startTimer();
    draw();
}

// Spawn some balloons
function spawnBalloons() {
    var numBalloons = 5 + Math.floor(Math.random() * 5); // 5 to 10 balloons
    for (var i = 0; i < numBalloons; i++) {
        var x = Math.random() * (canvas.width - 60) + 30;
        var y = Math.random() * (canvas.height - 60) + 30;
        var colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        var color = colors[Math.floor(Math.random() * colors.length)];
        balloons.push(new Balloon(x, y, color));
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < balloons.length; i++) {
        var balloon = balloons[i];
        if (!balloon.clicked) {
            ctx.beginPath();
            ctx.arc(balloon.x, balloon.y, balloon.radius, 0, Math.PI * 2);
            ctx.fillStyle = balloon.color;
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
            // Draw string
            ctx.beginPath();
            ctx.moveTo(balloon.x, balloon.y + balloon.radius);
            ctx.lineTo(balloon.x, balloon.y + balloon.radius + 20);
            ctx.stroke();
        }
    }
    if (gameRunning) {
        requestAnimationFrame(draw);
    }
}

// Check if click is on a balloon
function checkClick(x, y) {
    for (var i = balloons.length - 1; i >= 0; i--) {
        var balloon = balloons[i];
        var dx = x - balloon.x;
        var dy = y - balloon.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < balloon.radius && !balloon.clicked) {
            balloon.clicked = true;
            score++;
            scoreDisplay.textContent = 'Score: ' + score;
            // Remove balloon and spawn a new one
            balloons.splice(i, 1);
            spawnNewBalloon();
            break;
        }
    }
}

// Spawn a single new balloon
function spawnNewBalloon() {
    var x = Math.random() * (canvas.width - 60) + 30;
    var y = Math.random() * (canvas.height - 60) + 30;
    var colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    var color = colors[Math.floor(Math.random() * colors.length)];
    balloons.push(new Balloon(x, y, color));
}

// Handle canvas click
canvas.addEventListener('click', function(event) {
    if (!gameRunning) return;
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    checkClick(x, y);
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
            messageDiv.style.color = 'blue';
        }
    }, 1000);
}

// Restart button
restartBtn.addEventListener('click', initGame);

// Start the game
initGame();