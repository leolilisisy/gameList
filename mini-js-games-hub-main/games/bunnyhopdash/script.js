const bunny = document.getElementById("bunny");
const gap = document.getElementById("gap");
const scoreDisplay = document.getElementById("score");

let jumping = false;
let jumpHeight = 0;
let score = 0;
let gameOver = false;

// Accept multiple variants for the space key and also allow clicking/tapping the game area to jump
document.addEventListener("keydown", (e) => {
  // accept Space, ArrowUp, and W keys for jump. Prevent default to avoid page scroll on Space.
  const isSpace = e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar';
  const isUp = e.code === 'ArrowUp' || e.key === 'ArrowUp' || e.code === 'KeyW' || e.key === 'w' || e.key === 'W';
  if ((isSpace || isUp) && !jumping && !gameOver) {
    e.preventDefault();
    jump();
  }
});

// click/tap to jump (mobile friendly)
const gameEl = document.getElementById('game');
if (gameEl) {
  gameEl.addEventListener('pointerdown', (e) => {
    if (!jumping && !gameOver) jump();
  });
}

// Restart with Enter when game is over
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.code === 'Enter') && gameOver) {
    restartGame();
  }
});

function jump() {
  // simple guarded jump using requestAnimationFrame for smoother motion
  if (jumping) return;
  jumping = true;
  const peak = 70;
  const speed = 5; // pixels per frame-ish
  let goingUp = true;

  function step() {
    if (goingUp) {
      jumpHeight += speed;
      if (jumpHeight >= peak) goingUp = false;
    } else {
      jumpHeight -= speed;
      if (jumpHeight <= 0) jumpHeight = 0;
    }

    bunny.style.bottom = 40 + jumpHeight + 'px';

    if (!goingUp && jumpHeight === 0) {
      jumping = false;
      return; // stop animation
    }
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// add bunny eyes and nose DOM elements if not already present
(function ensureBunnyDetails(){
  if (!document.querySelector('#bunny .eye.left')){
    const left = document.createElement('div');
    left.className = 'eye left';
    const right = document.createElement('div');
    right.className = 'eye right';
    const nose = document.createElement('div');
    nose.className = 'nose';
    const b = document.getElementById('bunny');
    if (b) {
      b.appendChild(left);
      b.appendChild(right);
      b.appendChild(nose);
    }
  }
})();

function moveGap() {
  if (gameOver) return;
  let gapLeft = parseInt(window.getComputedStyle(gap).getPropertyValue("left"));
  gap.style.left = gapLeft - 3 + "px";

  if (gapLeft < -60) {
    gap.style.left = "350px";
    score++;
    scoreDisplay.textContent = "Score: " + score;
  }

  // collision detection — only when bunny is not jumping (prevents false positives in the same frame)
  let bunnyBottom = parseInt(window.getComputedStyle(bunny).getPropertyValue("bottom"));
  if (gapLeft < 80 && gapLeft > 20 && !jumping && bunnyBottom <= 40) {
    gameOver = true;
    scoreDisplay.textContent = "Game Over 💔 Final Score: " + score;
    const hint = document.getElementById('hint');
    if (hint) hint.innerHTML = 'Press <strong>Enter</strong> to Restart';
    gap.style.animation = "none";
  }

  if (!gameOver) requestAnimationFrame(moveGap);
}

moveGap();

function restartGame() {
  // reset state
  gameOver = false;
  score = 0;
  scoreDisplay.textContent = 'Score: 0';
  // reset gap position
  gap.style.left = '350px';
  gap.style.animation = '';
  // reset bunny
  jumpHeight = 0;
  jumping = false;
  bunny.style.bottom = '40px';
  // reset hint
  const hint = document.getElementById('hint');
  if (hint) hint.innerHTML = 'Press <strong>Space</strong> to jump!';
  // restart loop
  requestAnimationFrame(moveGap);
}
