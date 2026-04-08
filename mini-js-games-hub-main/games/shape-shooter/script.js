// Shape Shooter Game Script
// Sort shapes by color

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var timerDisplay = document.getElementById('timer');
var scoreDisplay = document.getElementById('score');
var restartBtn = document.getElementById('restart');
var messageDiv = document.getElementById('message');

var shapes = [];
var categories = [];
var selectedShape = null;
var score = 0;
var timeLeft = 30;
var timerInterval;
var gameRunning = true;

// Shape class
function Shape(x, y, type, color) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.color = color;
    this.size = 30;
    this.selected = false;
}

// Category class
function Category(x, y, width, height, color, label) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.label = label;
}

// Initialize the game
function initGame() {
    shapes = [];
    categories = [];
    selectedShape = null;
    score = 0;
    timeLeft = 30;
    gameRunning = true;
    messageDiv.textContent = '';
    scoreDisplay.textContent = 'Score: ' + score;
    
    // Create categories
    var colors = ['red', 'blue', 'green', 'yellow'];
    var colorValues = ['#f44336', '#2196f3', '#4caf50', '#ffeb3b'];
    for (var i = 0; i < colors.length; i++) {
        var x = 50 + i * 130;
        var y = canvas.height - 80;
        categories.push(new Category(x, y, 100, 60, colorValues[i], colors[i]));
    }
    
    // Create shapes
    var shapeTypes = ['circle', 'square', 'triangle'];
    for (var i = 0; i < 10; i++) {
        var x = Math.random() * (canvas.width - 100) + 50;
        var y = Math.random() * (canvas.height - 200) + 50;
        var type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        var colorIndex = Math.floor(Math.random() * colors.length);
        var color = colors[colorIndex];
        shapes.push(new Shape(x, y, type, color));
    }
    
    startTimer();
    draw();
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw categories
    for (var i = 0; i < categories.length; i++) {
        var cat = categories[i];
        ctx.fillStyle = cat.color;
        ctx.fillRect(cat.x, cat.y, cat.width, cat.height);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(cat.x, cat.y, cat.width, cat.height);
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(cat.label, cat.x + cat.width / 2, cat.y + cat.height / 2 + 5);
    }
    
    // Draw shapes
    for (var i = 0; i < shapes.length; i++) {
        var shape = shapes[i];
        ctx.fillStyle = shape.color;
        if (shape.selected) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
        }
        
        if (shape.type === 'circle') {
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (shape.type === 'square') {
            ctx.fillRect(shape.x - shape.size, shape.y - shape.size, shape.size * 2, shape.size * 2);
            ctx.strokeRect(shape.x - shape.size, shape.y - shape.size, shape.size * 2, shape.size * 2);
        } else if (shape.type === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(shape.x, shape.y - shape.size);
            ctx.lineTo(shape.x - shape.size, shape.y + shape.size);
            ctx.lineTo(shape.x + shape.size, shape.y + shape.size);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
}

// Handle canvas click
canvas.addEventListener('click', function(event) {
    if (!gameRunning) return;
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    
    // Check if clicked on a shape
    for (var i = shapes.length - 1; i >= 0; i--) {
        var shape = shapes[i];
        var dx = x - shape.x;
        var dy = y - shape.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < shape.size) {
            if (selectedShape) {
                selectedShape.selected = false;
            }
            selectedShape = shape;
            shape.selected = true;
            draw();
            return;
        }
    }
    
    // Check if clicked on a category
    if (selectedShape) {
        for (var i = 0; i < categories.length; i++) {
            var cat = categories[i];
            if (x >= cat.x && x <= cat.x + cat.width && y >= cat.y && y <= cat.y + cat.height) {
                if (selectedShape.color === cat.label) {
                    // Correct
                    score++;
                    scoreDisplay.textContent = 'Score: ' + score;
                    messageDiv.textContent = 'Correct!';
                    messageDiv.style.color = 'green';
                    shapes.splice(shapes.indexOf(selectedShape), 1);
                    selectedShape = null;
                } else {
                    // Wrong
                    messageDiv.textContent = 'Wrong!';
                    messageDiv.style.color = 'red';
                    selectedShape.selected = false;
                    selectedShape = null;
                }
                draw();
                setTimeout(function() {
                    messageDiv.textContent = '';
                }, 1000);
                return;
            }
        }
    }
    
    // Clicked elsewhere, deselect
    if (selectedShape) {
        selectedShape.selected = false;
        selectedShape = null;
        draw();
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