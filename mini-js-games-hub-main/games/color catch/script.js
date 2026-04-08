// Elements
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameArea = document.getElementById('gameArea');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const resultBox = document.getElementById('result');
const finalScore = document.getElementById('finalScore');
const targetLabel = document.getElementById('targetLabel');
const resultTarget = document.getElementById('resultTarget');

let score = 0;
let timeLeft = 30;
let spawnIntervalId = null;
let timerIntervalId = null;
let spawnTimeoutIds = []; // track individual spawn timeouts (lifespans)
let gameActive = false;
let targetColor = null;

const COLORS = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];

// Utility
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseTargetColor() {
  targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  targetLabel.innerHTML = `${targetColor.toUpperCase()} <span class="target-sample" style="background:${targetColor}"></span>`;
  resultTarget.style.background = targetColor;
  console.log('[Game] Target color chosen:', targetColor);
}

function safeRemoveCircle(circle, clickHandler, timeoutId) {
  try {
    if (clickHandler) circle.removeEventListener('click', clickHandler);
  } catch (e) { /* ignore */ }
  // remove DOM node if still present
  if (circle && circle.parentElement) circle.parentElement.removeChild(circle);
  // clear its timeout if provided and still in our tracking list
  if (timeoutId != null) {
    const idx = spawnTimeoutIds.indexOf(timeoutId);
    if (idx !== -1) spawnTimeoutIds.splice(idx, 1);
    try { clearTimeout(timeoutId); } catch (e) { /* ignore */ }
  }
}

// spawn a circle
function spawnCircle() {
  if (!gameActive) return;

  const areaW = gameArea.clientWidth;
  const areaH = gameArea.clientHeight;
  if (!areaW || !areaH) {
    console.log('[spawn] Game area not ready (w/h):', areaW, areaH);
    return;
  }

  const circle = document.createElement('div');
  circle.className = 'circle';

  const size = randInt(30, 70);
  circle.style.width = `${size}px`;
  circle.style.height = `${size}px`;

  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  circle.dataset.color = color;
  circle.style.background = color;

  const x = randInt(0, Math.max(0, areaW - size));
  const y = randInt(0, Math.max(0, areaH - size));
  circle.style.left = `${x}px`;
  circle.style.top = `${y}px`;

  // entrance animation
  circle.style.opacity = '0';
  circle.style.transform = 'scale(0.6)';
  requestAnimationFrame(() => {
    circle.style.opacity = '1';
    circle.style.transform = 'scale(1)';
  });

  // click handler
  const onClick = () => {
    if (!gameActive) return;
    const clicked = circle.dataset.color;
    if (clicked === targetColor) {
      score += 2;
      circle.style.transform = 'scale(1.2)';
      circle.style.opacity = '0.9';
    } else {
      score = Math.max(0, score - 1);
      circle.style.transform = 'translateX(6px) scale(0.95)';
    }
    updateScore();
    // remove after small delay so user sees animation
    setTimeout(() => safeRemoveCircle(circle, onClick), 120);
  };

  circle.addEventListener('click', onClick);
  gameArea.appendChild(circle);

  // auto-remove after lifespan and track the timeout id
  const lifeSpan = randInt(600, 1100);
  const timeoutId = setTimeout(() => {
    safeRemoveCircle(circle, onClick, timeoutId);
  }, lifeSpan);

  spawnTimeoutIds.push(timeoutId);
}

// update UI
function updateScore() {
  scoreDisplay.textContent = score;
}

// clear all spawn timeouts and remove circles
function clearAllSpawns() {
  // clear timeouts
  spawnTimeoutIds.forEach(id => {
    try { clearTimeout(id); } catch (e) {}
  });
  spawnTimeoutIds = [];
  // remove all circles
  const children = Array.from(gameArea.children);
  children.forEach(node => {
    if (node.classList && node.classList.contains('circle')) {
      try { node.remove(); } catch (e) {}
    }
  });
}

// start game
function startGame() {
  try {
    // prevent double-start
    if (gameActive) {
      console.log('[startGame] Game already active — ignoring start.');
      return;
    }

    // ensure a fresh state
    endGame(true);

    score = 0;
    timeLeft = 30;
    updateScore();
    timeDisplay.textContent = timeLeft;
    resultBox.classList.add('hidden');

    chooseTargetColor();
    gameActive = true;
    startBtn.disabled = true; // prevent double-click

    // spawn interval
    if (spawnIntervalId) clearInterval(spawnIntervalId);
    spawnIntervalId = setInterval(spawnCircle, 450);

    // initial immediate spawn so the player sees something quickly
    spawnCircle();

    // timer interval
    if (timerIntervalId) clearInterval(timerIntervalId);
    timerIntervalId = setInterval(() => {
      timeLeft--;
      timeDisplay.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }, 1000);

    console.log('[startGame] started. spawnIntervalId=', spawnIntervalId, 'timerIntervalId=', timerIntervalId);
  } catch (err) {
    console.error('[startGame] Unexpected error:', err);
  }
}

// end game; silent=true means don't show results (used when resetting)
function endGame(silent = false) {
  // stop intervals
  if (spawnIntervalId) {
    clearInterval(spawnIntervalId);
    spawnIntervalId = null;
  }
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
  gameActive = false;
  startBtn.disabled = false;

  // clear spawn timeouts and circles
  clearAllSpawns();

  if (!silent) {
    finalScore.textContent = score;
    resultTarget.style.background = targetColor || 'transparent';
    resultBox.classList.remove('hidden');
    console.log('[endGame] Game over. final score =', score, 'target:', targetColor);
  } else {
    console.log('[endGame] Silent reset/cleanup performed.');
  }
}

// visibility handling: pause/resume the timer only (not spawns)
let wasRunningWhenHidden = false;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (gameActive) {
      // pause the timer (we'll resume it later)
      wasRunningWhenHidden = true;
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
        console.log('[visibility] Paused timer because page hidden.');
      }
    } else {
      wasRunningWhenHidden = false;
    }
  } else {
    // tab visible again: resume timer if gameActive and it was previously running
    if (gameActive && !timerIntervalId && wasRunningWhenHidden) {
      timerIntervalId = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if (timeLeft <= 0) endGame();
      }, 1000);
      console.log('[visibility] Resumed timer.');
      wasRunningWhenHidden = false;
    }
  }
});

// UI handlers
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// keyboard: press Tab to start (keep default focus behavior)
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Tab' || e.key === 'Enter') && !gameActive) {
    e.preventDefault();
    startGame();
  }
});

// defensive: clean up when unloading page
window.addEventListener('beforeunload', () => {
  endGame(true);
});
