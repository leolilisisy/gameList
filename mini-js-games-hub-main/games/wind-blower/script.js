const balloon = document.getElementById("balloon");
const sizeDisplay = document.getElementById("sizeDisplay");
const timerDisplay = document.getElementById("timer");
const inflateSound = document.getElementById("inflateSound");
const popSound = document.getElementById("popSound");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const gameOverScreen = document.getElementById("gameOver");
const gameOverText = document.getElementById("gameOverText");
const playAgain = document.getElementById("playAgain");

let size = 1;
let isRunning = false;
let timer = 30;
let timerInterval;

// 🪶 Glow effect on balloon
function glow() {
  balloon.style.filter = `drop-shadow(0 0 ${10 + size * 5}px #00e5ff)`;
}

// 🎈 Inflate on mouse movement
window.addEventListener("mousemove", () => {
  if (isRunning) {
    inflateBalloon();
  }
});

function inflateBalloon() {
  if (size >= 5) {
    popBalloon();
    return;
  }
  size += 0.05;
  balloon.style.transform = `scale(${size})`;
  sizeDisplay.textContent = `${size.toFixed(1)}x`;
  glow();
  inflateSound.currentTime = 0;
  inflateSound.play();
}

function popBalloon() {
  isRunning = false;
  balloon.src = "https://pngimg.com/uploads/explosion/explosion_PNG156.png";
  popSound.play();
  endGame("💥 The balloon popped! Game Over!");
}

function startGame() {
  isRunning = true;
  timer = 30;
  size = 1;
  balloon.src = "https://pngimg.com/uploads/balloon/balloon_PNG4963.png";
  balloon.style.transform = "scale(1)";
  sizeDisplay.textContent = "1x";
  glow();
  gameOverScreen.classList.add("hidden");

  timerInterval = setInterval(() => {
    if (timer > 0) {
      timer--;
      timerDisplay.textContent = timer;
    } else {
      endGame("⏰ Time’s up!");
    }
  }, 1000);
}

function pauseGame() {
  isRunning = false;
  clearInterval(timerInterval);
}

function restartGame() {
  clearInterval(timerInterval);
  startGame();
}

function endGame(message) {
  isRunning = false;
  clearInterval(timerInterval);
  gameOverText.textContent = message;
  gameOverScreen.classList.remove("hidden");
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", restartGame);
playAgain.addEventListener("click", startGame);
