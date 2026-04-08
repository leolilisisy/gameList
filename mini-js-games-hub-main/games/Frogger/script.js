const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Game Variables
let frog = { x: 280, y: 550, width: 40, height: 40 };
let lives = 3;
let score = 0;
let gameOver = false;

const cars = [];
const logs = [];

// Generate cars and logs
function initObstacles() {
  cars.length = 0;
  logs.length = 0;

  // Road lanes
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      cars.push({
        x: j * 200,
        y: 400 - i * 50,
        width: 50,
        height: 40,
        speed: (i + 1) * 2,
        direction: i % 2 === 0 ? 1 : -1
      });
    }
  }

  // River lanes (logs)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      logs.push({
        x: j * 300,
        y: 200 - i * 50,
        width: 150,
        height: 40,
        speed: (i + 1.5) * 1.5,
        direction: i % 2 === 0 ? 1 : -1
      });
    }
  }
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw river
  ctx.fillStyle = '#1e90ff';
  ctx.fillRect(0, 50, CANVAS_WIDTH, 150);

  // Draw road
  ctx.fillStyle = '#555';
  ctx.fillRect(0, 350, CANVAS_WIDTH, 150);

  // Draw logs
  logs.forEach(log => {
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(log.x, log.y, log.width, log.height);
  });

  // Draw cars
  cars.forEach(car => {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(car.x, car.y, car.width, car.height);
  });

  // Draw frog
  ctx.fillStyle = '#0f0';
  ctx.fillRect(frog.x, frog.y, frog.width, frog.height);

  // Update status
  document.getElementById('score').textContent = `Score: ${score}`;
  document.getElementById('lives').textContent = `Lives: ${lives}`;
}

// Move obstacles
function updateObstacles() {
  cars.forEach(car => {
    car.x += car.speed * car.direction;
    if (car.direction === 1 && car.x > CANVAS_WIDTH) car.x = -car.width;
    if (car.direction === -1 && car.x < -car.width) car.x = CANVAS_WIDTH;
  });

  logs.forEach(log => {
    log.x += log.speed * log.direction;
    if (log.direction === 1 && log.x > CANVAS_WIDTH) log.x = -log.width;
    if (log.direction === -1 && log.x < -log.width) log.x = CANVAS_WIDTH;
  });
}

// Check collisions
function checkCollisions() {
  // Cars
  for (const car of cars) {
    if (frog.x < car.x + car.width &&
        frog.x + frog.width > car.x &&
        frog.y < car.y + car.height &&
        frog.y + frog.height > car.y) {
      loseLife();
    }
  }

  // River: frog must be on a log
  if (frog.y >= 50 && frog.y < 200) {
    let onLog = false;
    for (const log of logs) {
      if (frog.x < log.x + log.width &&
          frog.x + frog.width > log.x &&
          frog.y < log.y + log.height &&
          frog.y + frog.height > log.y) {
        frog.x += log.speed * log.direction;
        onLog = true;
      }
    }
    if (!onLog) loseLife();
  }

  // Goal area
  if (frog.y < 50) {
    score += 1;
    resetFrog();
  }
}

// Lose life
function loseLife() {
  lives -= 1;
  if (lives <= 0) {
    gameOver = true;
    alert(`Game Over! Final Score: ${score}`);
    resetGame();
  } else {
    resetFrog();
  }
}

// Reset frog
function resetFrog() {
  frog.x = 280;
  frog.y = 550;
}

// Game loop
function gameLoop() {
  if (!gameOver) {
    updateObstacles();
    checkCollisions();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

// Controls
document.addEventListener('keydown', (e) => {
  const step = 40;
  if (e.key === 'ArrowUp') frog.y -= step;
  if (e.key === 'ArrowDown') frog.y += step;
  if (e.key === 'ArrowLeft') frog.x -= step;
  if (e.key === 'ArrowRight') frog.x += step;

  // Keep inside canvas
  frog.x = Math.max(0, Math.min(frog.x, CANVAS_WIDTH - frog.width));
  frog.y = Math.max(0, Math.min(frog.y, CANVAS_HEIGHT - frog.height));
});

// Restart
document.getElementById('restart-btn').addEventListener('click', () => {
  resetGame();
});

// Reset full game
function resetGame() {
  lives = 3;
  score = 0;
  resetFrog();
  initObstacles();
  gameOver = false;
  gameLoop();
}

// Initialize
initObstacles();
gameLoop();
