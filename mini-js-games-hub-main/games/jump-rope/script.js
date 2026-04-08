// Jump Rope Game Script
// Click to jump over swinging ropes

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var timerDisplay = document.getElementById('timer');
var scoreDisplay = document.getElementById('score');
var restartBtn = document.getElementById('restart');
var messageDiv = document.getElementById('message');

var player = { x: canvas.width / 2, y: canvas.height - 50, width: 20, height: 40, jumping: false, jumpHeight: 0 };
var ropes = [];
var score = 0;
var timeLeft = 30;
var timerInterval;
var gameRunning = true;

// Rope class
function Rope(y, speed) {
    this.y = y;
    this.x = 0;
    this.width = 10;
    this.height = 5;
    this.speed = speed;
    this.direction = 1; // 1 right, -1 left
}

// Initialize the game
function initGame() {
    ropes = [];
    score = 0;
    timeLeft = 30;
    gameRunning = true;
    player.jumping = false;
    player.jumpHeight = 0;
    messageDiv.textContent = '';
    scoreDisplay.textContent = 'Score: ' + score;
    // Create some ropes
    for (var i = 0; i < 3; i++) {
        var y = 100 + i * 80;
        var speed = 2 + Math.random() * 3;
        ropes.push(new Rope(y, speed));
    }
    startTimer();
    draw();
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    // Draw player
    ctx.fillStyle = '#2196f3';
    ctx.fillRect(player.x - player.width / 2, player.y - player.height - player.jumpHeight, player.width, player.height);
    
    // Draw ropes
    ctx.fillStyle = '#f44336';
    for (var i = 0; i < ropes.length; i++) {
        var rope = ropes[i];
        ctx.fillRect(rope.x, rope.y, rope.width, rope.height);
        ctx.fillRect(rope.x + canvas.width - rope.width, rope.y, rope.width, rope.height);
    }
    
    if (gameRunning) {
        update();
        requestAnimationFrame(draw);
    }
}

// Update game state
function update() {
    // Update ropes
    for (var i = 0; i < ropes.length; i++) {
        var rope = ropes[i];
        rope.x += rope.speed * rope.direction;
        if (rope.x > canvas.width / 2) {
            rope.direction = -1;
        }
        if (rope.x < 0) {
            rope.direction = 1;
        }
    }
    
    // Update player jump
    if (player.jumping) {
        player.jumpHeight += 5;
        if (player.jumpHeight > 100) {
            player.jumping = false;
        }
    } else {
        if (player.jumpHeight > 0) {
            player.jumpHeight -= 5;
        }
    }
    
    // Check collisions
    for (var i = 0; i < ropes.length; i++) {
        var rope = ropes[i];
        if (rope.y > player.y - player.height - player.jumpHeight && rope.y < player.y - player.jumpHeight) {
            if ((rope.x < player.x + player.width / 2 && rope.x + rope.width > player.x - player.width / 2) ||
                (rope.x + canvas.width - rope.width < player.x + player.width / 2 && rope.x + canvas.width > player.x - player.width / 2)) {
                if (!player.jumping) {
                    gameRunning = false;
                    messageDiv.textContent = 'Ouch! You got hit. Final Score: ' + score;
                    messageDiv.style.color = 'red';
                    clearInterval(timerInterval);
                }
            }
        }
    }
}

// Handle click to jump
canvas.addEventListener('click', function() {
    if (!gameRunning) return;
    if (!player.jumping && player.jumpHeight === 0) {
        player.jumping = true;
        score++;
        scoreDisplay.textContent = 'Score: ' + score;
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
            messageDiv.style.color = 'green';
        }
    }, 1000);
}

// Restart button
restartBtn.addEventListener('click', initGame);

// Start the game
initGame();