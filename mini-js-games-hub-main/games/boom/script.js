const gameArea = document.getElementById("game-area");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const levelEl = document.getElementById("level");

let score = 0;
let highScore = localStorage.getItem("boomHighScore") || 0;
let level = 1;
let bombs = [];
let gameInterval;
let spawnInterval;

highScoreEl.textContent = highScore;

function spawnBomb() {
  const bomb = document.createElement("div");
  bomb.classList.add("bomb");
  bomb.textContent = "💣";

  // Random horizontal position
  const x = Math.floor(Math.random() * (gameArea.clientWidth - 50));
  bomb.style.left = `${x}px`;
  bomb.style.bottom = `0px`;

  // Click event
  bomb.addEventListener("click", () => {
    score += 10;
    scoreEl.textContent = score;
    bomb.remove();
    bombs = bombs.filter(b => b !== bomb);
  });

  gameArea.appendChild(bomb);
  bombs.push(bomb);

  // Remove bomb after 5s if not clicked (explosion)
  setTimeout(() => {
    if (bombs.includes(bomb)) {
      bomb.remove();
      bombs = bombs.filter(b => b !== bomb);
      score = Math.max(0, score - 5); // penalty
      scoreEl.textContent = score;
    }
  }, 5000 - level * 300); // faster as level increases
}

function startGame() {
  startBtn.disabled = true;
  restartBtn.disabled = false;
  score = 0;
  level = 1;
  scoreEl.textContent = score;
  levelEl.textContent = level;

  // Spawn bombs every 1s initially
  spawnInterval = setInterval(spawnBomb, Math.max(500, 1000 - level * 100));

  // Increase level every 20 seconds
  gameInterval = setInterval(() => {
    level++;
    levelEl.textContent = level;
  }, 20000);
}

function restartGame() {
  // Clear bombs
  bombs.forEach(b => b.remove());
  bombs = [];

  clearInterval(spawnInterval);
  clearInterval(gameInterval);

  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("boomHighScore", highScore);
    highScoreEl.textContent = highScore;
  }

  startBtn.disabled = false;
  restartBtn.disabled = true;
  score = 0;
  level = 1;
  scoreEl.textContent = score;
  levelEl.textContent = level;
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
