const blinkIcon = document.getElementById('blink-icon');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const restartBtn = document.getElementById('restart-btn');

let score = 0;
let highScore = localStorage.getItem('blinkCatchHighScore') || 0;
let blinkInterval = 1500; // initial speed in ms
let blinkTimer;

highScoreEl.textContent = highScore;

function randomPosition() {
  const area = document.querySelector('.blink-area');
  const maxX = area.offsetWidth - blinkIcon.offsetWidth;
  const maxY = area.offsetHeight - blinkIcon.offsetHeight;

  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);

  blinkIcon.style.left = `${x}px`;
  blinkIcon.style.top = `${y}px`;
}

function blink() {
  blinkIcon.classList.add('blink');
  setTimeout(() => blinkIcon.classList.remove('blink'), 300);
  randomPosition();
}

function increaseDifficulty() {
  if (blinkInterval > 500) {
    blinkInterval -= 50;
    clearInterval(blinkTimer);
    blinkTimer = setInterval(blink, blinkInterval);
  }
}

function updateScore() {
  score++;
  scoreEl.textContent = score;
  if (score > highScore) {
    highScore = score;
    highScoreEl.textContent = highScore;
    localStorage.setItem('blinkCatchHighScore', highScore);
  }
  increaseDifficulty();
}

// Initial blink
blinkTimer = setInterval(blink, blinkInterval);

// Click event
blinkIcon.addEventListener('click', updateScore);

// Restart button
restartBtn.addEventListener('click', () => {
  score = 0;
  scoreEl.textContent = score;
  blinkInterval = 1500;
  clearInterval(blinkTimer);
  blinkTimer = setInterval(blink, blinkInterval);
});
