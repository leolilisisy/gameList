const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const statusEl = document.getElementById("status");
const popSound = document.getElementById("popSound");

let score = 0;
let combo = 0;
let gameActive = false;
let bubbleInterval;
let missed = 0;

function startGame() {
  gameActive = true;
  score = 0;
  combo = 0;
  missed = 0;
  scoreEl.textContent = score;
  comboEl.textContent = combo;
  startBtn.disabled = true;
  restartBtn.disabled = false;
  statusEl.textContent = "Pop the bubbles in rhythm! 🎶";

  bubbleInterval = setInterval(createBubble, 900);
}

function restartGame() {
  clearInterval(bubbleInterval);
  gameArea.innerHTML = "";
  startGame();
}

function createBubble() {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.style.left = Math.random() * (gameArea.offsetWidth - 40) + "px";

  bubble.addEventListener("click", () => popBubble(bubble));
  gameArea.appendChild(bubble);

  setTimeout(() => {
    if (gameArea.contains(bubble)) {
      bubble.remove();
      missed++;
      combo = 0;
      comboEl.textContent = combo;
      if (missed > 5) gameOver();
    }
  }, 4800);
}

function popBubble(bubble) {
  if (!gameActive) return;
  popSound.currentTime = 0;
  popSound.play();

  score += 10;
  combo++;
  scoreEl.textContent = score;
  comboEl.textContent = combo;

  bubble.style.transition = "transform 0.2s ease, opacity 0.2s ease";
  bubble.style.transform = "scale(1.5)";
  bubble.style.opacity = "0";
  setTimeout(() => bubble.remove(), 200);

  // Color flash
  gameArea.style.boxShadow = `0 0 30px rgba(96,165,250,0.6)`;
  setTimeout(() => (gameArea.style.boxShadow = `0 0 30px rgba(59,130,246,0.4)`), 200);
}

function gameOver() {
  clearInterval(bubbleInterval);
  gameActive = false;
  statusEl.textContent = `🎵 Game Over! Final Score: ${score}`;
  startBtn.disabled = false;
  restartBtn.disabled = true;
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
