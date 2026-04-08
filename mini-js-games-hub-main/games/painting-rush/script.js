const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelEl = document.getElementById('level');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const restartBtn = document.getElementById('restartBtn');
const gameOverEl = document.querySelector('.game-over');
const finalScoreEl = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');

canvas.width = 500;
canvas.height = 400;

// Game Variables
let targets = [];
let score = 0;
let level = 1;
let time = 30;
let gameInterval;
let timerInterval;
let isGameOver = false;

const colors = ['#ff6b81', '#1e90ff', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22'];

// Generate Targets
function createTargets(num = 5) {
  targets = [];
  for (let i = 0; i < num; i++) {
    const radius = 20 + Math.random() * 15;
    const x = radius + Math.random() * (canvas.width - radius * 2);
    const y = radius + Math.random() * (canvas.height - radius * 2);
    const color = colors[Math.floor(Math.random() * colors.length)];
    targets.push({ x, y, radius, color, painted: false });
  }
}

// Draw Targets
function drawTargets() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  targets.forEach(t => {
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
    ctx.fillStyle = t.painted ? '#ccc' : t.color;
    ctx.fill();
    ctx.closePath();
  });
}

// Check if Click/Touch hits a target
function paintTarget(x, y) {
  targets.forEach(t => {
    const dist = Math.hypot(t.x - x, t.y - y);
    if (dist < t.radius && !t.painted) {
      t.painted = true;
      score += 10;
      scoreEl.textContent = score;
    }
  });
}

// Update Game State
function updateGame() {
  drawTargets();
  // Check if all targets painted
  if (targets.every(t => t.painted)) {
    level++;
    levelEl.textContent = level;
    time += 10; // Add bonus time
    createTargets(5 + level); // More targets each level
  }
}

// Timer
function startTimer() {
  timerInterval = setInterval(() => {
    time--;
    timerEl.textContent = time;
    if (time <= 0) endGame();
  }, 1000);
}

// End Game
function endGame() {
  clearInterval(timerInterval);
  clearInterval(gameInterval);
  isGameOver = true;
  finalScoreEl.textContent = score;
  gameOverEl.classList.remove('hidden');
}

// Game Loop
function gameLoop() {
  if (!isGameOver) updateGame();
}

// Input Events
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  paintTarget(x, y);
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  paintTarget(x, y);
});

// Restart Game
function startGame() {
  score = 0;
  level = 1;
  time = 30;
  isGameOver = false;
  scoreEl.textContent = score;
  levelEl.textContent = level;
  timerEl.textContent = time;
  gameOverEl.classList.add('hidden');
  createTargets(5);
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  startTimer();
  gameInterval = setInterval(gameLoop, 30);
}

// Buttons
restartBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', startGame);

// Start the game initially
startGame();
