const tilesContainer = document.getElementById("tiles");
const targetRGB = document.getElementById("targetRGB");
const message = document.getElementById("message");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const playAgainBtn = document.getElementById("playAgain");
const newColorsBtn = document.getElementById("newColors");
const easyBtn = document.getElementById("easyBtn");
const hardBtn = document.getElementById("hardBtn");

let numTiles = 6;
let colors = [];
let pickedColor;
let score = 0;
let timeLeft = 30;
let timerInterval;

// Generate random RGB
function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function generateColors(num) {
  const arr = [];
  for (let i = 0; i < num; i++) arr.push(randomColor());
  return arr;
}

function pickColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function setupGame() {
  colors = generateColors(numTiles);
  pickedColor = pickColor();
  targetRGB.textContent = pickedColor.toUpperCase();
  tilesContainer.innerHTML = "";
  message.textContent = "";
  colors.forEach(color => {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.style.backgroundColor = color;
    tile.setAttribute("tabindex", "0");
    tile.addEventListener("click", () => checkColor(tile, color));
    tilesContainer.appendChild(tile);
  });
}

function checkColor(tile, color) {
  if (color === pickedColor) {
    message.textContent = "✅ Correct!";
    score += 10;
    scoreEl.textContent = score;
    changeColors(pickedColor);
    setTimeout(setupGame, 800);
  } else {
    message.textContent = "❌ Try Again!";
    tile.style.visibility = "hidden";
    score -= 2;
    scoreEl.textContent = score;
  }
}

function changeColors(color) {
  document.querySelectorAll(".tile").forEach(t => {
    t.style.backgroundColor = color;
    t.style.visibility = "visible";
  });
}

function resetGame() {
  clearInterval(timerInterval);
  score = 0;
  scoreEl.textContent = score;
  timeLeft = 30;
  startTimer();
  setupGame();
}

function startTimer() {
  clearInterval(timerInterval);
  timerEl.textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      message.textContent = `⏰ Time's Up! Final Score: ${score}`;
      document.querySelectorAll(".tile").forEach(t => (t.style.pointerEvents = "none"));
    }
  }, 1000);
}

// Mode buttons
easyBtn.addEventListener("click", () => {
  numTiles = 3;
  easyBtn.classList.add("active");
  hardBtn.classList.remove("active");
  setupGame();
});

hardBtn.addEventListener("click", () => {
  numTiles = 6;
  hardBtn.classList.add("active");
  easyBtn.classList.remove("active");
  setupGame();
});

newColorsBtn.addEventListener("click", setupGame);
playAgainBtn.addEventListener("click", resetGame);

// Init
setupGame();
startTimer();
