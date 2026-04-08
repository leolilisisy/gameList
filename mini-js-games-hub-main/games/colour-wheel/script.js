// Colour Wheel Game Script
// Spin the wheel and match colors

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');
var timerDisplay = document.getElementById('timer');
var scoreDisplay = document.getElementById('score');
var restartBtn = document.getElementById('restart');
var messageDiv = document.getElementById('message');

var colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'];
var colorValues = ['#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#9c27b0', '#ff9800'];
var currentAngle = 0;
var spinning = false;
var targetColor = '';
var options = [];
var score = 0;
var timeLeft = 30;
var timerInterval;
var gameRunning = true;
var phase = 'spin'; // 'spin' or 'match'

// Initialize the game
function initGame() {
    currentAngle = 0;
    spinning = false;
    score = 0;
    timeLeft = 30;
    gameRunning = true;
    phase = 'spin';
    messageDiv.textContent = '';
    scoreDisplay.textContent = 'Score: ' + score;
    startTimer();
    draw();
}

// Draw the wheel
function drawWheel() {
    var centerX = canvas.width / 2;
    var centerY = 200;
    var radius = 100;
    var angleStep = (Math.PI * 2) / colors.length;
    
    for (var i = 0; i < colors.length; i++) {
        var startAngle = i * angleStep + currentAngle;
        var endAngle = (i + 1) * angleStep + currentAngle;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colorValues[i];
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        
        // Draw color name
        var textAngle = startAngle + angleStep / 2;
        var textX = centerX + Math.cos(textAngle) * (radius - 30);
        var textY = centerY + Math.sin(textAngle) * (radius - 30);
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(colors[i], textX, textY);
    }
    
    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 20);
    ctx.lineTo(centerX - 10, centerY - radius);
    ctx.lineTo(centerX + 10, centerY - radius);
    ctx.closePath();
    ctx.fillStyle = '#000';
    ctx.fill();
}

// Draw options
function drawOptions() {
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Match the color: ' + targetColor, canvas.width / 2, 50);
    
    for (var i = 0; i < options.length; i++) {
        var x = 150 + (i % 2) * 250;
        var y = 150 + Math.floor(i / 2) * 100;
        
        ctx.fillStyle = colorValues[colors.indexOf(options[i])];
        ctx.fillRect(x - 50, y - 25, 100, 50);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x - 50, y - 25, 100, 50);
        
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.fillText(options[i], x, y + 5);
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (phase === 'spin') {
        drawWheel();
        if (!spinning) {
            ctx.fillStyle = '#000';
            ctx.font = '18px Arial';
            ctx.fillText('Click the wheel to spin!', canvas.width / 2, 350);
        }
    } else if (phase === 'match') {
        drawOptions();
    }
}

// Spin the wheel
function spinWheel() {
    if (spinning) return;
    spinning = true;
    var spinAngle = Math.PI * 2 * (5 + Math.random() * 5); // 5-10 full rotations
    var duration = 2000; // 2 seconds
    var startTime = Date.now();
    
    function animate() {
        var elapsed = Date.now() - startTime;
        var progress = elapsed / duration;
        if (progress < 1) {
            currentAngle = spinAngle * (1 - Math.pow(1 - progress, 3)); // easing
            draw();
            requestAnimationFrame(animate);
        } else {
            spinning = false;
            // Determine landed color
            var normalizedAngle = currentAngle % (Math.PI * 2);
            var segmentAngle = (Math.PI * 2) / colors.length;
            var landedIndex = Math.floor((Math.PI * 2 - normalizedAngle) / segmentAngle) % colors.length;
            targetColor = colors[landedIndex];
            generateOptions();
            phase = 'match';
            draw();
        }
    }
    animate();
}

// Generate options
function generateOptions() {
    options = [targetColor];
    var availableColors = colors.filter(c => c !== targetColor);
    while (options.length < 4) {
        var randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        if (!options.includes(randomColor)) {
            options.push(randomColor);
        }
    }
    // Shuffle options
    for (var i = options.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = options[i];
        options[i] = options[j];
        options[j] = temp;
    }
}

// Handle canvas click
canvas.addEventListener('click', function(event) {
    if (!gameRunning) return;
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    
    if (phase === 'spin') {
        var centerX = canvas.width / 2;
        var centerY = 200;
        var distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distance <= 100) {
            spinWheel();
        }
    } else if (phase === 'match') {
        for (var i = 0; i < options.length; i++) {
            var optX = 150 + (i % 2) * 250;
            var optY = 150 + Math.floor(i / 2) * 100;
            if (x >= optX - 50 && x <= optX + 50 && y >= optY - 25 && y <= optY + 25) {
                if (options[i] === targetColor) {
                    score++;
                    scoreDisplay.textContent = 'Score: ' + score;
                    messageDiv.textContent = 'Correct!';
                    messageDiv.style.color = 'green';
                } else {
                    messageDiv.textContent = 'Wrong!';
                    messageDiv.style.color = 'red';
                }
                setTimeout(function() {
                    phase = 'spin';
                    draw();
                }, 1000);
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
            messageDiv.textContent = 'Time\'s up! Final Score: ' + score;
            messageDiv.style.color = 'blue';
        }
    }, 1000);
}

// Restart button
restartBtn.addEventListener('click', initGame);

// Start the game
initGame();