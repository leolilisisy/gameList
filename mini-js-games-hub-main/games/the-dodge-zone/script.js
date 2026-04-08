const gameContainer = document.getElementById('gameContainer');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const message = document.getElementById('message');
const timerDisplay = document.getElementById('timer');

let playerX = 180;
const playerSpeed = 30; // increased for snappier keyboard movement
const gameWidth = 400;
const gameHeight = 500;
const groundHeight = 6; // must match CSS #ground height
let score = 0;
let blocks = [];
let gameRunning = true;
let blockSpeed = 3;

// Timer
let elapsedSeconds = 0;
let timerInterval = null;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function startTimer() {
  elapsedSeconds = 0;
  if (timerDisplay) timerDisplay.textContent = 'Time: ' + formatTime(elapsedSeconds);
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    if (timerDisplay) timerDisplay.textContent = 'Time: ' + formatTime(elapsedSeconds);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Helper to update player position and clamp inside game container
function updatePlayerPosition(x) {
  // clamp between 0 and (gameWidth - player width)
  const maxX = gameWidth - 40; // player width = 40
  playerX = Math.max(0, Math.min(maxX, Math.round(x)));
  player.style.left = playerX + 'px';
}

// Player movement
document.addEventListener('keydown', (e) => {
  if (!gameRunning) return;

  if (e.key === 'ArrowLeft' || e.key === 'a') {
    playerX = Math.max(0, playerX - playerSpeed);
  } else if (e.key === 'ArrowRight' || e.key === 'd') {
    playerX = Math.min(gameWidth - 40, playerX + playerSpeed);
  }
  player.style.left = playerX + 'px';
});

// Pointer (mouse/touch) control: move the player horizontally with pointer
gameContainer.addEventListener('pointermove', (e) => {
  if (!gameRunning) return;
  // get x relative to game container
  const rect = gameContainer.getBoundingClientRect();
  const relativeX = e.clientX - rect.left - 20; // center the 40px player
  updatePlayerPosition(relativeX);
});

// Also allow direct clicks/taps to move player to that position
gameContainer.addEventListener('pointerdown', (e) => {
  if (!gameRunning) return;
  const rect = gameContainer.getBoundingClientRect();
  const relativeX = e.clientX - rect.left - 20;
  updatePlayerPosition(relativeX);
});

// Create blocks
function createBlock() {
  const block = document.createElement('div');
  block.classList.add('block');
  block.style.left = Math.floor(Math.random() * (gameWidth - 50)) + 'px';
  block.style.top = '-60px';
  gameContainer.appendChild(block);
  blocks.push(block);
}

// Move blocks
function moveBlocks() {
  if (!gameRunning) return;

  blocks.forEach((block, index) => {
    const currentTop = parseInt(block.style.top);
    block.style.top = currentTop + blockSpeed + 'px';

    // Collision detection
    const playerRect = player.getBoundingClientRect();
    const blockRect = block.getBoundingClientRect();
    if (
      playerRect.left < blockRect.right &&
      playerRect.right > blockRect.left &&
      playerRect.top < blockRect.bottom &&
      playerRect.bottom > blockRect.top
    ) {
      gameOver();
    }

    // Remove off-screen blocks before they cover the ground (account for block height and ground)
    // block height is 50, so remove when top > (gameHeight - blockHeight - groundHeight)
    if (currentTop > gameHeight - 50 - groundHeight) {
      block.remove();
      blocks.splice(index, 1);
      score++;
      scoreDisplay.textContent = 'Score: ' + score;
    }
  });

  requestAnimationFrame(moveBlocks);
}

// Increase speed gradually
setInterval(() => {
  if (gameRunning) {
    blockSpeed += 0.3;
    createBlock();
  }
}, 1000);

// Level up message
setInterval(() => {
  if (gameRunning) {
    message.textContent = '⚡ Level Up!';
    setTimeout(() => (message.textContent = ''), 1000);
  }
}, 10000);

// Game over
function gameOver() {
  gameRunning = false;
  stopTimer();
  message.textContent = '💥 Game Over! Final Score: ' + score + ' | Time: ' + formatTime(elapsedSeconds);
  blocks.forEach((block) => block.remove());
  blocks = [];

  setTimeout(() => {
    message.textContent = 'Press Enter to Restart';
  }, 2000);
}

// Restart the game without reloading the page
function restartGame() {
  // clear any remaining blocks
  blocks.forEach((b) => b.remove());
  blocks = [];

  // reset values
  score = 0;
  scoreDisplay.textContent = 'Score: ' + score;
  blockSpeed = 3;
  elapsedSeconds = 0;
  if (timerDisplay) timerDisplay.textContent = 'Time: ' + formatTime(elapsedSeconds);

  // reset player
  playerX = 180;
  updatePlayerPosition(playerX);

  // clear message and restart loops
  message.textContent = '';
  gameRunning = true;
  createBlock();
  startTimer();
  moveBlocks();
}

// Allow pressing Enter to restart after game over
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !gameRunning) {
    restartGame();
  }
});

// Start
createBlock();
moveBlocks();
startTimer();
