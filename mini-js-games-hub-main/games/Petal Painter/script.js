const brush = document.getElementById("brush");
const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const statusEl = document.getElementById("status");

let score = 0;
let gameActive = false;
let petalInterval;
let gameLoop;
let speed = 2;

document.addEventListener("keydown", moveBrush);
gameArea.addEventListener("mousemove", (e) => {
  if (!gameActive) return;
  const rect = gameArea.getBoundingClientRect();
  const x = e.clientX - rect.left - brush.offsetWidth / 2;
  brush.style.left = Math.max(0, Math.min(x, gameArea.offsetWidth - brush.offsetWidth)) + "px";
});
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

function startGame() {
  if (gameActive) return;
  gameActive = true;
  statusEl.textContent = "Catch petals to paint!";
  startBtn.disabled = true;
  restartBtn.disabled = true;
  petalInterval = setInterval(createPetal, 600);
  gameLoop = requestAnimationFrame(updatePetals);
}

function restartGame() {
  score = 0;
  scoreEl.textContent = 0;
  speed = 2;
  document.querySelectorAll(".petal").forEach(p => p.remove());
  startGame();
}

function moveBrush(e) {
  if (!gameActive) return;
  let pos = brush.offsetLeft;
  if (e.key === "ArrowLeft" && pos > 0) brush.style.left = pos - 20 + "px";
  if (e.key === "ArrowRight" && pos < gameArea.offsetWidth - brush.offsetWidth)
    brush.style.left = pos + 20 + "px";
}

function createPetal() {
  const petal = document.createElement("div");
  petal.classList.add("petal");
  petal.style.left = Math.random() * (gameArea.offsetWidth - 20) + "px";
  gameArea.appendChild(petal);
}

function updatePetals() {
  if (!gameActive) return;

  document.querySelectorAll(".petal").forEach(petal => {
    const top = parseFloat(petal.style.top || 0);
    petal.style.top = top + speed + "px";

    const petalRect = petal.getBoundingClientRect();
    const brushRect = brush.getBoundingClientRect();

    if (
      petalRect.bottom >= brushRect.top &&
      petalRect.left >= brushRect.left &&
      petalRect.right <= brushRect.right
    ) {
      petal.remove();
      score += 5;
      scoreEl.textContent = score;

      // Add color splatter effect
      const paint = document.createElement("div");
      paint.classList.add("paint");
      paint.style.left = petal.style.left;
      paint.style.top = petal.style.top;
      paint.style.backgroundColor = randomColor();
      gameArea.appendChild(paint);

      setTimeout(() => paint.remove(), 2000);

      if (score % 50 === 0) speed += 0.5;
    } else if (top > gameArea.offsetHeight) {
      petal.remove();
    }
  });

  gameLoop = requestAnimationFrame(updatePetals);
}

function randomColor() {
  const colors = ["#f472b6", "#fb7185", "#f9a8d4", "#fbcfe8", "#fda4af"];
  return colors[Math.floor(Math.random() * colors.length)];
}
