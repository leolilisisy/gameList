// Tile Slide Game Script
// Simple sliding puzzle game

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var timerDisplay = document.getElementById('timer');
var restartBtn = document.getElementById('restart');
var messageDiv = document.getElementById('message');

var gridSize = 4;
var tileSize = canvas.width / gridSize;
var tiles = [];
var emptyPos = { x: 3, y: 3 };
var timeLeft = 30;
var timerInterval;
var gameWon = false;

// Initialize the game
function initGame() {
    tiles = [];
    for (var i = 0; i < gridSize * gridSize - 1; i++) {
        tiles.push(i + 1);
    }
    tiles.push(0); // 0 represents empty
    emptyPos = { x: 3, y: 3 };
    shuffleTiles();
    timeLeft = 30;
    gameWon = false;
    messageDiv.textContent = '';
    startTimer();
    drawBoard();
}

// Shuffle the tiles
function shuffleTiles() {
    for (var i = tiles.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = tiles[i];
        tiles[i] = tiles[j];
        tiles[j] = temp;
    }
    // Find empty position after shuffle
    for (var y = 0; y < gridSize; y++) {
        for (var x = 0; x < gridSize; x++) {
            if (tiles[y * gridSize + x] === 0) {
                emptyPos = { x: x, y: y };
            }
        }
    }
}

// Draw the board
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var y = 0; y < gridSize; y++) {
        for (var x = 0; x < gridSize; x++) {
            var tile = tiles[y * gridSize + x];
            if (tile !== 0) {
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                ctx.strokeStyle = '#333';
                ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
                ctx.fillStyle = '#fff';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(tile, x * tileSize + tileSize / 2, y * tileSize + tileSize / 2 + 8);
            } else {
                ctx.fillStyle = '#fff';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                ctx.strokeStyle = '#333';
                ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
}

// Check if the game is won
function checkWin() {
    for (var i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] !== i + 1) {
            return false;
        }
    }
    return tiles[tiles.length - 1] === 0;
}

// Move tile if possible
function moveTile(x, y) {
    if (gameWon) return;
    var dx = Math.abs(x - emptyPos.x);
    var dy = Math.abs(y - emptyPos.y);
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        var index = y * gridSize + x;
        var emptyIndex = emptyPos.y * gridSize + emptyPos.x;
        tiles[emptyIndex] = tiles[index];
        tiles[index] = 0;
        emptyPos = { x: x, y: y };
        drawBoard();
        if (checkWin()) {
            gameWon = true;
            clearInterval(timerInterval);
            messageDiv.textContent = 'Congratulations! You won!';
            messageDiv.style.color = 'green';
        }
    }
}

// Handle canvas click
canvas.addEventListener('click', function(event) {
    var rect = canvas.getBoundingClientRect();
    var x = Math.floor((event.clientX - rect.left) / tileSize);
    var y = Math.floor((event.clientY - rect.top) / tileSize);
    moveTile(x, y);
});

// Start the timer
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(function() {
        timeLeft--;
        timerDisplay.textContent = 'Time: ' + timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!gameWon) {
                messageDiv.textContent = 'Time\'s up! Game over.';
                messageDiv.style.color = 'red';
            }
        }
    }, 1000);
}

// Restart button
restartBtn.addEventListener('click', initGame);

// Start the game
initGame();