// Emoji Hunt Game Script
// Find hidden emojis in the scene

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var timerDisplay = document.getElementById('timer');
var scoreDisplay = document.getElementById('score');
var restartBtn = document.getElementById('restart');
var messageDiv = document.getElementById('message');

var emojis = [];
var foundCount = 0;
var totalEmojis = 10;
var timeLeft = 30;
var timerInterval;
var gameRunning = true;

// Emoji class
function Emoji(x, y, emoji) {
    this.x = x;
    this.y = y;
    this.emoji = emoji;
    this.found = false;
    this.size = 20;
}

// Initialize the game
function initGame() {
    emojis = [];
    foundCount = 0;
    timeLeft = 30;
    gameRunning = true;
    messageDiv.textContent = '';
    scoreDisplay.textContent = 'Found: ' + foundCount + '/' + totalEmojis;
    
    // Create emojis
    var emojiList = ['😀', '😎', '🤔', '😍', '🤗', '😴', '🤤', '😜', '🤪', '😇'];
    for (var i = 0; i < totalEmojis; i++) {
        var x = Math.random() * (canvas.width - 40) + 20;
        var y = Math.random() * (canvas.height - 40) + 20;
        var emoji = emojiList[i];
        emojis.push(new Emoji(x, y, emoji));
    }
    
    startTimer();
    draw();
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw cluttered background
    for (var i = 0; i < 50; i++) {
        ctx.fillStyle = 'hsl(' + Math.random() * 360 + ', 50%, 70%)';
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 10 + Math.random() * 20, 10 + Math.random() * 20);
    }
    
    // Draw emojis (only if not found)
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    for (var i = 0; i < emojis.length; i++) {
        var emoji = emojis[i];
        if (!emoji.found) {
            ctx.fillText(emoji.emoji, emoji.x, emoji.y);
        }
    }
}

// Handle canvas click
canvas.addEventListener('click', function(event) {
    if (!gameRunning) return;
    var rect = canvas.getBoundingClientRect();
    var clickX = event.clientX - rect.left;
    var clickY = event.clientY - rect.top;
    
    for (var i = 0; i < emojis.length; i++) {
        var emoji = emojis[i];
        if (!emoji.found) {
            var dx = clickX - emoji.x;
            var dy = clickY - emoji.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < emoji.size) {
                emoji.found = true;
                foundCount++;
                scoreDisplay.textContent = 'Found: ' + foundCount + '/' + totalEmojis;
                if (foundCount === totalEmojis) {
                    gameRunning = false;
                    clearInterval(timerInterval);
                    messageDiv.textContent = 'Congratulations! You found all emojis!';
                    messageDiv.style.color = 'green';
                }
                draw();
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
            messageDiv.textContent = 'Time\'s up! Found: ' + foundCount + '/' + totalEmojis;
            messageDiv.style.color = 'orange';
        }
    }, 1000);
}

// Restart button
restartBtn.addEventListener('click', initGame);

// Start the game
initGame();