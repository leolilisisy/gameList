const colors = ["green", "red", "yellow", "blue"];
let gameSequence = [];
let playerSequence = [];
let level = 0;
let acceptingInput = false;

const levelDisplay = document.getElementById("level");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const colorButtons = document.querySelectorAll(".color-btn");

// Play sound for each color (optional)
function playSound(color) {
  const audio = new Audio(`https://s3.amazonaws.com/freecodecamp/simonSound${colors.indexOf(color)+1}.mp3`);
  audio.play();
}

// Highlight button
function flashButton(color) {
  const btn = document.getElementById(color);
  btn.classList.add("active");
  playSound(color);
  setTimeout(() => btn.classList.remove("active"), 400);
}

// Generate next color in sequence
function nextStep() {
  acceptingInput = false;
  playerSequence = [];
  level++;
  levelDisplay.textContent = level;

  const nextColor = colors[Math.floor(Math.random() * colors.length)];
  gameSequence.push(nextColor);

  messageEl.textContent = "Watch the sequence!";
  
  // Show sequence with delays
  gameSequence.forEach((color, index) => {
    setTimeout(() => flashButton(color), index * 700);
  });

  setTimeout(() => {
    acceptingInput = true;
    messageEl.textContent = "Your turn!";
  }, gameSequence.length * 700);
}

// Check player input
function handlePlayerInput(color) {
  if (!acceptingInput) return;

  playerSequence.push(color);
  flashButton(color);

  const currentIndex = playerSequence.length - 1;
  if (playerSequence[currentIndex] !== gameSequence[currentIndex]) {
    gameOver();
    return;
  }

  if (playerSequence.length === gameSequence.length) {
    acceptingInput = false;
    setTimeout(nextStep, 1000);
  }
}

// Game over
function gameOver() {
  messageEl.textContent = `Game Over! You reached level ${level}.`;
  startBtn.disabled = false;
  restartBtn.disabled = true;
  gameSequence = [];
  playerSequence = [];
  level = 0;
  acceptingInput = false;
}

// Event listeners
colorButtons.forEach(btn => {
  btn.addEventListener("click", () => handlePlayerInput(btn.dataset.color));
});

startBtn.addEventListener("click", () => {
  startBtn.disabled = true;
  restartBtn.disabled = false;
  messageEl.textContent = "";
  nextStep();
});

restartBtn.addEventListener("click", () => {
  gameOver();
  startBtn.click();
});
