// Reflex Game Script
// Click targets as fast as possible

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var timerDisplay = document.getElementById('timer');
var scoreDisplay = document.getElementById('score');
var restartBtn = document.getElementById('restart');
var messageDiv = document.getElementById('message');

var target = null;
var score = 0;
var timeLeft = 30;
var timerInterval;
var gameRunning = true;

// Target class
function Target(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
}

// Initialize the game
function initGame() {
    target = null;
    score = 0;
    timeLeft = 30;
    gameRunning = true;
    messageDiv.textContent = '';
    scoreDisplay.textContent = 'Score: ' + score;
    spawnTarget();
    startTimer();
    draw();
}

// Spawn a new target
function spawnTarget() {
    if (!gameRunning) return;
    var x = Math.random() * (canvas.width - 100) + 50;
    var y = Math.random() * (canvas.height - 100) + 50;
    var radius = 25 + Math.random() * 25; // 25-50
    target = new Target(x, y, radius);
    draw();
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (target) {
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff5722';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK!', target.x, target.y + 5);
    }
}

// Handle canvas click
canvas.addEventListener('click', function(event) {
    if (!gameRunning || !target) return;
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var dx = x - target.x;
    var dy = y - target.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < target.radius) {
        score++;
        scoreDisplay.textContent = 'Score: ' + score;
        target = null;
        draw();
        // Spawn new target after random delay
        setTimeout(spawnTarget, 500 + Math.random() * 1500); // 0.5-2 seconds
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
            target = null;
            draw();
            messageDiv.textContent = 'Time\'s up! Final Score: ' + score;
            messageDiv.style.color = 'yellow';
        }
    }, 1000);
}

// Restart button
restartBtn.addEventListener('click', initGame);

// Start the game
initGame();