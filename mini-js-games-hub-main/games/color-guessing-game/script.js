const tilesContainer = document.getElementById("tiles");
const targetRGB = document.getElementById("targetRGB");
const message = document.getElementById("message");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const playAgainBtn = document.getElementById("playAgain");
const newColorsBtn = document.getElementById("newColors");
const easyBtn = document.getElementById("easyBtn");
const hardBtn = document.getElementById("hardBtn");
const i18n = window.SiteI18n;

let numTiles = 6;
let colors = [];
let pickedColor;
let score = 0;
let timeLeft = 30;
let timerInterval;

function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function generateColors(num) {
  const entries = [];
  for (let i = 0; i < num; i++) entries.push(randomColor());
  return entries;
}

function pickColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function updateHud() {
  scoreEl.textContent = score;
  timerEl.textContent = timeLeft;
}

function setupGame() {
  colors = generateColors(numTiles);
  pickedColor = pickColor();
  targetRGB.textContent = pickedColor.toUpperCase();
  tilesContainer.innerHTML = "";
  message.textContent = "";

  colors.forEach((color) => {
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
    message.textContent = i18n.t("gameColorGuess.correct");
    score += 10;
    changeColors(pickedColor);
    updateHud();
    setTimeout(setupGame, 800);
  } else {
    message.textContent = i18n.t("gameColorGuess.tryAgain");
    tile.style.visibility = "hidden";
    score -= 2;
    updateHud();
  }
}

function changeColors(color) {
  document.querySelectorAll(".tile").forEach((tile) => {
    tile.style.backgroundColor = color;
    tile.style.visibility = "visible";
  });
}

function resetGame() {
  clearInterval(timerInterval);
  score = 0;
  timeLeft = 30;
  startTimer();
  setupGame();
  updateHud();
}

function startTimer() {
  clearInterval(timerInterval);
  updateHud();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateHud();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      message.textContent = i18n.t("gameColorGuess.timeout", { score });
      document.querySelectorAll(".tile").forEach((tile) => {
        tile.style.pointerEvents = "none";
      });
    }
  }, 1000);
}

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

setupGame();
startTimer();
