// Card Memory Game Script
// Flip cards to find matching pairs

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var timerDisplay = document.getElementById('timer');
var scoreDisplay = document.getElementById('score');
var restartBtn = document.getElementById('restart');
var messageDiv = document.getElementById('message');

var gridSize = 4;
var cardSize = canvas.width / gridSize;
var cards = [];
var flippedCards = [];
var matchedPairs = 0;
var timeLeft = 30;
var timerInterval;
var gameRunning = true;

// Card class
function Card(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.flipped = false;
    this.matched = false;
}

// Initialize the game
function initGame() {
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    timeLeft = 30;
    gameRunning = true;
    messageDiv.textContent = '';
    scoreDisplay.textContent = 'Pairs: ' + matchedPairs;
    
    // Create pairs
    var values = [];
    for (var i = 1; i <= 8; i++) {
        values.push(i, i);
    }
    // Shuffle values
    for (var i = values.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = values[i];
        values[i] = values[j];
        values[j] = temp;
    }
    
    // Create cards
    for (var row = 0; row < gridSize; row++) {
        for (var col = 0; col < gridSize; col++) {
            var x = col * cardSize;
            var y = row * cardSize;
            var value = values[row * gridSize + col];
            cards.push(new Card(x, y, value));
        }
    }
    
    startTimer();
    draw();
}

// Draw the board
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        ctx.fillStyle = card.flipped || card.matched ? '#fff' : '#2196f3';
        ctx.fillRect(card.x + 5, card.y + 5, cardSize - 10, cardSize - 10);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(card.x + 5, card.y + 5, cardSize - 10, cardSize - 10);
        
        if (card.flipped || card.matched) {
            ctx.fillStyle = '#000';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(card.value, card.x + cardSize / 2, card.y + cardSize / 2 + 8);
        }
    }
}

// Handle canvas click
canvas.addEventListener('click', function(event) {
    if (!gameRunning) return;
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var col = Math.floor(x / cardSize);
    var row = Math.floor(y / cardSize);
    var index = row * gridSize + col;
    
    if (index >= 0 && index < cards.length) {
        var card = cards[index];
        if (!card.flipped && !card.matched && flippedCards.length < 2) {
            card.flipped = true;
            flippedCards.push(card);
            draw();
            
            if (flippedCards.length === 2) {
                setTimeout(checkMatch, 1000);
            }
        }
    }
});

// Check if flipped cards match
function checkMatch() {
    if (flippedCards[0].value === flippedCards[1].value) {
        flippedCards[0].matched = true;
        flippedCards[1].matched = true;
        matchedPairs++;
        scoreDisplay.textContent = 'Pairs: ' + matchedPairs;
        if (matchedPairs === 8) {
            gameRunning = false;
            clearInterval(timerInterval);
            messageDiv.textContent = 'Congratulations! You found all pairs!';
            messageDiv.style.color = 'green';
        }
    } else {
        flippedCards[0].flipped = false;
        flippedCards[1].flipped = false;
    }
    flippedCards = [];
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
            messageDiv.textContent = 'Time\'s up! Pairs found: ' + matchedPairs;
            messageDiv.style.color = 'red';
        }
    }, 1000);
}

// Restart button
restartBtn.addEventListener('click', initGame);

// Start the game
initGame();