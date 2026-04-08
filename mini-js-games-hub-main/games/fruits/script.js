const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const basketWidth = 80;
const basketHeight = 20;
let basketX = canvas.width / 2 - basketWidth / 2;
const basketY = canvas.height - basketHeight - 10;
const basketSpeed = 7;

const fruitRadius = 15;
let fruitSpeed = 3;
let spawnInterval = 1500; // milliseconds

let fruits = [];
let score = 0;
let lives = 3;

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const gameOverEl = document.getElementById('gameOver');

let leftPressed = false;
let rightPressed = false;
let gameRunning = true;

function drawBasket() {
  ctx.fillStyle = 'green';
  ctx.fillRect(basketX, basketY, basketWidth, basketHeight);
}

function drawFruit(fruit) {
  ctx.beginPath();
  ctx.fillStyle = 'red';
  ctx.ellipse(fruit.x, fruit.y, fruitRadius, fruitRadius * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function spawnFruit() {
  const x = Math.random() * (canvas.width - fruitRadius * 2) + fruitRadius;
  fruits.push({ x: x, y: -fruitRadius });
}

function update() {
  // Move basket
  if (leftPressed) basketX -= basketSpeed;
  if (rightPressed) basketX += basketSpeed;
  basketX = Math.max(0, Math.min(canvas.width - basketWidth, basketX));

  // Move fruits
  for (let i = fruits.length - 1; i >= 0; i--) {
    fruits[i].y += fruitSpeed;

    // Check if fruit caught
    if (
      fruits[i].y + fruitRadius >= basketY &&
      fruits[i].x > basketX &&
      fruits[i].x < basketX + basketWidth
    ) {
      fruits.splice(i, 1);
      score++;
      scoreEl.textContent = `Score: ${score}`;
      if (score % 5 === 0) {
        fruitSpeed = Math.min(fruitSpeed + 0.5, 10);
        spawnInterval = Math.max(spawnInterval - 100, 500);
        clearInterval(spawnTimer);
        spawnTimer = setInterval(spawnFruit, spawnInterval);
      }
    }
    // Check if fruit missed
    else if (fruits[i].y - fruitRadius > canvas.height) {
      fruits.splice(i, 1);
      lives--;
      livesEl.textContent = `Lives: ${lives}`;
      if (lives <= 0) {
        gameOver();
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBasket();
  fruits.forEach(drawFruit);
}

function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  gameRunning = false;
  gameOverEl.classList.remove('hidden');
}

function restartGame() {
  score = 0;
  lives = 3;
  fruitSpeed = 3;
  spawnInterval = 1500;
  fruits = [];
  basketX = canvas.width / 2 - basketWidth / 2;
  scoreEl.textContent = `Score: ${score}`;
  livesEl.textContent = `Lives: ${lives}`;
  gameOverEl.classList.add('hidden');
  gameRunning = true;
  clearInterval(spawnTimer);
  spawnTimer = setInterval(spawnFruit, spawnInterval);
  gameLoop();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') leftPressed = true;
  if (e.key === 'ArrowRight') rightPressed = true;
  if (!gameRunning && (e.key === 'r' || e.key === 'R')) restartGame();
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') leftPressed = false;
  if (e.key === 'ArrowRight') rightPressed = false;
});

// Start spawning fruits
let spawnTimer = setInterval(spawnFruit, spawnInterval);

// Start game loop
gameLoop();
