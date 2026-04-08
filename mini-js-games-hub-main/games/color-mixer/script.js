const startBtn = document.getElementById("start-btn");
const submitBtn = document.getElementById("submit-btn");
const nextBtn = document.getElementById("next-btn");
const resetBtn = document.getElementById("reset-btn");
const targetColorEl = document.getElementById("target-color");
const currentColorEl = document.getElementById("current-color");
const redSlider = document.getElementById("red");
const greenSlider = document.getElementById("green");
const blueSlider = document.getElementById("blue");
const redValue = document.getElementById("red-value");
const greenValue = document.getElementById("green-value");
const blueValue = document.getElementById("blue-value");
const messageEl = document.getElementById("message");
const levelEl = document.getElementById("current-level");
const scoreEl = document.getElementById("current-score");

let level = 1;
let score = 0;
let round = 0;
let targetR, targetG, targetB;
let gameActive = false;

startBtn.addEventListener("click", startGame);
submitBtn.addEventListener("click", submitMix);
nextBtn.addEventListener("click", nextLevel);
resetBtn.addEventListener("click", resetGame);

redSlider.addEventListener("input", updateColor);
greenSlider.addEventListener("input", updateColor);
blueSlider.addEventListener("input", updateColor);

function startGame() {
  level = 1;
  score = 0;
  round = 0;
  levelEl.textContent = level;
  scoreEl.textContent = score;
  startBtn.style.display = "none";
  gameActive = true;
  generateTargetColor();
  updateColor();
}

function generateTargetColor() {
  // Generate colors that are not too close to extremes for easier start
  const range = 255 - level * 20; // Smaller range for higher levels
  const offset = level * 10;
  targetR = Math.floor(Math.random() * range) + offset;
  targetG = Math.floor(Math.random() * range) + offset;
  targetB = Math.floor(Math.random() * range) + offset;
  targetColorEl.style.backgroundColor = `rgb(${targetR}, ${targetG}, ${targetB})`;
}

function updateColor() {
  const r = redSlider.value;
  const g = greenSlider.value;
  const b = blueSlider.value;
  redValue.textContent = r;
  greenValue.textContent = g;
  blueValue.textContent = b;
  currentColorEl.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}

function submitMix() {
  if (!gameActive) return;
  const r = parseInt(redSlider.value);
  const g = parseInt(greenSlider.value);
  const b = parseInt(blueSlider.value);

  const distance = Math.sqrt(
    Math.pow(r - targetR, 2) +
    Math.pow(g - targetG, 2) +
    Math.pow(b - targetB, 2)
  );

  const maxDistance = Math.sqrt(3 * Math.pow(255, 2));
  const accuracy = 1 - (distance / maxDistance);
  const points = Math.round(accuracy * 100 * level);

  score += points;
  scoreEl.textContent = score;
  round++;

  if (distance < 10) {
    messageEl.textContent = `🎉 Perfect match! +${points} points`;
  } else if (distance < 50) {
    messageEl.textContent = `👍 Close! +${points} points`;
  } else {
    messageEl.textContent = `😅 Not quite! +${points} points`;
  }

  submitBtn.style.display = "none";
  nextBtn.style.display = "inline-block";

  if (round >= 5) { // 5 rounds per level
    nextBtn.textContent = "Next Level";
    messageEl.textContent += " Level complete!";
  } else {
    nextBtn.textContent = "Next Round";
  }
}

function nextLevel() {
  if (round >= 5) {
    level++;
    levelEl.textContent = level;
    round = 0;
  }
  nextBtn.style.display = "none";
  submitBtn.style.display = "inline-block";
  messageEl.textContent = "";
  generateTargetColor();
  // Reset sliders to middle
  redSlider.value = 128;
  greenSlider.value = 128;
  blueSlider.value = 128;
  updateColor();
}

function resetGame() {
  level = 1;
  score = 0;
  round = 0;
  levelEl.textContent = level;
  scoreEl.textContent = score;
  messageEl.textContent = "";
  startBtn.style.display = "inline-block";
  submitBtn.style.display = "inline-block";
  nextBtn.style.display = "none";
  resetBtn.style.display = "none";
  gameActive = false;
  // Reset colors
  targetColorEl.style.backgroundColor = "#888";
  currentColorEl.style.backgroundColor = "#888";
}