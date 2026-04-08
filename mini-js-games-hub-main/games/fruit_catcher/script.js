const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let basket = { x: 200, y: 350, width: 100, height: 20, speed: 20 };
let fruits = [];
let score = 0;
let lives = 3;
let fruitSpeed = 2;

// Generate a new fruit at random x position
function spawnFruit() {
    let x = Math.random() * (canvas.width - 20);
    fruits.push({ x: x, y: 0, radius: 10 });
}

// Draw basket
function drawBasket() {
    ctx.fillStyle = 'brown';
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
}

// Draw fruits
function drawFruits() {
    ctx.fillStyle = 'red';
    fruits.forEach(fruit => {
        ctx.beginPath();
        ctx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();
    });
}

// Draw score and lives
function drawScoreLives() {
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Lives: ${lives}`, 400, 20);
}

// Update game state
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBasket();
    drawFruits();
    drawScoreLives();

    // Move fruits down
    fruits.forEach(fruit => fruit.y += fruitSpeed);

    // Check for catching fruit
    fruits.forEach((fruit, index) => {
        if (
            fruit.y + fruit.radius >= basket.y &&
            fruit.x >= basket.x &&
            fruit.x <= basket.x + basket.width
        ) {
            score++;
            fruits.splice(index, 1);
            fruitSpeed += 0.05; // Increase speed slightly
        } else if (fruit.y + fruit.radius > canvas.height) {
            lives--;
            fruits.splice(index, 1);
            if (lives === 0) {
                alert(`Game Over! Final Score: ${score}`);
                document.location.reload();
            }
        }
    });

    requestAnimationFrame(update);
}

// Move basket with arrow keys
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && basket.x > 0) {
        basket.x -= basket.speed;
    } else if (e.key === 'ArrowRight' && basket.x + basket.width < canvas.width) {
        basket.x += basket.speed;
    }
});

// Spawn fruits every 1 second
setInterval(spawnFruit, 1000);

// Start the game
update();
