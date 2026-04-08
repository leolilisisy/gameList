const basket = document.getElementById("basket");
const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const missedEl = document.getElementById("missed");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const statusEl = document.getElementById("status");

let score = 0;
let missed = 0;
let gameInterval;
let flakeInterval;
let speed = 2;
let gameActive = false;

document.addEventListener("keydown", moveBasket);
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

function startGame() {
  if (gameActive) return;
  gameActive = true;
  statusEl.textContent = "Catch the snowflakes!";
  startBtn.disabled = true;
  restartBtn.disabled = true;
  flakeInterval = setInterval(createFlake, 700);
  gameInterval = requestAnimationFrame(updateFlakes);
}

function restartGame() {
  score = 0;
  missed = 0;
  speed = 2;
  scoreEl.textContent = 0;
  missedEl.textContent = 0;
  document.querySelectorAll(".flake").forEach(f => f.remove());
  startGame();
}

function moveBasket(e) {
  if (!gameActive) return;
  const pos = basket.offsetLeft;
  if (e.key === "ArrowLeft" && pos > 0) basket.style.left = pos - 20 + "px";
  if (e.key === "ArrowRight" && pos < gameArea.offsetWidth - basket.offsetWidth)
    basket.style.left = pos + 20 + "px";
}

function createFlake() {
  const flake = document.createElement("div");
  flake.classList.add("flake");
  flake.style.left = Math.random() * (gameArea.offsetWidth - 20) + "px";
  gameArea.appendChild(flake);
}

function updateFlakes() {
  if (!gameActive) return;

  const flakes = document.querySelectorAll(".flake");
  flakes.forEach(flake => {
    const top = parseFloat(flake.style.top || 0);
    flake.style.top = top + speed + "px";

    const flakeRect = flake.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();

    if (
      flakeRect.bottom >= basketRect.top &&
      flakeRect.left >= basketRect.left &&
      flakeRect.right <= basketRect.right
    ) {
      flake.remove();
      score += 10;
      scoreEl.textContent = score;

      if (score % 50 === 0) speed += 0.5;
    } else if (top > gameArea.offsetHeight) {
      flake.remove();
      missed += 1;
      missedEl.textContent = missed;
      if (missed >= 5) endGame();
    }
  });

  gameInterval = requestAnimationFrame(updateFlakes);
}

function endGame() {
  cancelAnimationFrame(gameInterval);
  clearInterval(flakeInterval);
  gameActive = false;
  statusEl.textContent = "❌ Game Over — You missed too many!";
  restartBtn.disabled = false;
  startBtn.disabled = false;
}
