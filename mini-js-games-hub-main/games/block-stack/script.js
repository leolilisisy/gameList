// Block Stack Game Script
// Stack blocks without letting them fall

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var timerDisplay = document.getElementById('timer');
var scoreDisplay = document.getElementById('score');
var restartBtn = document.getElementById('restart');
var messageDiv = document.getElementById('message');

var blocks = [];
var currentBlock = null;
var blockWidth = 80;
var blockHeight = 20;
var score = 0;
var timeLeft = 30;
var timerInterval;
var gameRunning = true;

// Block class
function Block(x, y, width, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = blockHeight;
    this.color = color;
    this.falling = false;
    this.fallSpeed = 0;
}

// Initialize the game
function initGame() {
    blocks = [];
    score = 0;
    timeLeft = 30;
    gameRunning = true;
    messageDiv.textContent = '';
    scoreDisplay.textContent = 'Blocks: ' + score;
    
    // Add base block
    blocks.push(new Block(canvas.width / 2 - blockWidth / 2, canvas.height - blockHeight, blockWidth, '#ff5722'));
    
    spawnNewBlock();
    startTimer();
    draw();
}

// Spawn a new block
function spawnNewBlock() {
    if (!gameRunning) return;
    var color = '#' + Math.floor(Math.random()*16777215).toString(16);
    currentBlock = new Block(0, 100, blockWidth, color);
    currentBlock.direction = 1; // 1 right, -1 left
    currentBlock.speed = 2;
}

// Update game
function update() {
    if (!gameRunning || !currentBlock) return;
    
    // Move current block
    currentBlock.x += currentBlock.speed * currentBlock.direction;
    if (currentBlock.x <= 0 || currentBlock.x + currentBlock.width >= canvas.width) {
        currentBlock.direction *= -1;
    }
    
    // Update falling blocks
    for (var i = blocks.length - 1; i >= 0; i--) {
        var block = blocks[i];
        if (block.falling) {
            block.y += block.fallSpeed;
            block.fallSpeed += 0.5;
            if (block.y > canvas.height) {
                blocks.splice(i, 1);
            }
        }
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw blocks
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(block.x, block.y, block.width, block.height);
    }
    
    // Draw current block
    if (currentBlock) {
        ctx.fillStyle = currentBlock.color;
        ctx.fillRect(currentBlock.x, currentBlock.y, currentBlock.width, currentBlock.height);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(currentBlock.x, currentBlock.y, currentBlock.width, currentBlock.height);
    }
    
    if (gameRunning) {
        update();
        requestAnimationFrame(draw);
    }
}

// Place block
function placeBlock() {
    if (!currentBlock || !gameRunning) return;
    
    var topBlock = blocks[blocks.length - 1];
    var overlap = Math.min(currentBlock.x + currentBlock.width, topBlock.x + topBlock.width) - Math.max(currentBlock.x, topBlock.x);
    
    if (overlap > 0) {
        // Place the block
        currentBlock.y = topBlock.y - blockHeight;
        // Trim the block to the overlap
        var leftOverhang = Math.max(0, topBlock.x - currentBlock.x);
        var rightOverhang = Math.max(0, (currentBlock.x + currentBlock.width) - (topBlock.x + topBlock.width));
        
        currentBlock.x += leftOverhang;
        currentBlock.width -= leftOverhang + rightOverhang;
        
        if (currentBlock.width > 0) {
            blocks.push(currentBlock);
            score++;
            scoreDisplay.textContent = 'Blocks: ' + score;
            
            // Check if any overhanging parts fall
            if (leftOverhang > 0) {
                var fallingBlock = new Block(currentBlock.x - leftOverhang, currentBlock.y, leftOverhang, currentBlock.color);
                fallingBlock.falling = true;
                blocks.push(fallingBlock);
            }
            if (rightOverhang > 0) {
                var fallingBlock = new Block(currentBlock.x + currentBlock.width, currentBlock.y, rightOverhang, currentBlock.color);
                fallingBlock.falling = true;
                blocks.push(fallingBlock);
            }
            
            spawnNewBlock();
        } else {
            // Block completely missed
            currentBlock.falling = true;
            blocks.push(currentBlock);
            gameRunning = false;
            messageDiv.textContent = 'Block missed! Game over. Final score: ' + score;
            messageDiv.style.color = 'red';
        }
    } else {
        // No overlap
        currentBlock.falling = true;
        blocks.push(currentBlock);
        gameRunning = false;
        messageDiv.textContent = 'Block missed! Game over. Final score: ' + score;
        messageDiv.style.color = 'red';
    }
    
    currentBlock = null;
}

// Handle canvas click
canvas.addEventListener('click', function() {
    if (gameRunning && currentBlock) {
        placeBlock();
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
            messageDiv.style.color = 'yellow';
        }
    }, 1000);
}

// Restart button
restartBtn.addEventListener('click', initGame);

// Start the game
initGame();