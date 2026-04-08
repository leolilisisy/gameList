const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const messageEl = document.getElementById('message');
const startBtn = document.getElementById('start-btn');

let score = 0;
let timeLeft = 30;
let countdownInterval;
let dotInterval;
let gameActive = false;

function startGame() {
  score = 0;
  timeLeft = 30;
  scoreEl.innerText = score;
  timeEl.innerText = timeLeft;
  messageEl.innerText = '';
  startBtn.disabled = true;
  gameActive = true;

  spawnDot();
  countdownInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  timeLeft--;
  timeEl.innerText = timeLeft;
  if (timeLeft <= 0) {
    endGame();
  }
}

function endGame() {
  gameActive = false;
  clearInterval(countdownInterval);
  clearInterval(dotInterval);
  removeDot();
  messageEl.innerText = `⏰ Time's up! Your final score: ${score}`;
  startBtn.disabled = false;
}

function spawnDot() {
  removeDot(); // Ensure only one dot exists

  const dot = document.createElement('div');
  dot.classList.add('dot');
  gameArea.appendChild(dot);

  // Random position within game area
  const maxX = gameArea.clientWidth - 50;
  const maxY = gameArea.clientHeight - 50;
  dot.style.left = Math.random() * maxX + 'px';
  dot.style.top = Math.random() * maxY + 'px';

  dot.addEventListener('click', () => {
    if (!gameActive) return;
    score++;
    scoreEl.innerText = score;
    spawnDot();
  });

  // Move dot every 1 second if not clicked
  dotInterval = setTimeout(() => {
    if(gameActive) spawnDot();
  }, 1000);
}

function removeDot() {
  const existingDot = document.querySelector('.dot');
  if (existingDot) existingDot.remove();
}

startBtn.addEventListener('click', startGame);
