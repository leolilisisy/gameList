const eyeArea = document.getElementById("eye-area");
const pupil = document.getElementById("pupil");
const timerDisplay = document.getElementById("timer");
const message = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");
const hoverSound = document.getElementById("hoverSound");

let timer = 0;
let interval = null;
let gameStarted = false;
let paused = false;

// Handle pupil movement following cursor
document.addEventListener("mousemove", (e) => {
  const rect = eyeArea.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  pupil.style.transform = `translate(${x / 10}px, ${y / 10}px)`;
});

// Game logic
eyeArea.addEventListener("mouseenter", () => {
  if (gameStarted && !paused) {
    hoverSound.currentTime = 0;
    hoverSound.play();
  }
});

eyeArea.addEventListener("mouseleave", () => {
  if (gameStarted && !paused) {
    loseSound.currentTime = 0;
    loseSound.play();
    message.textContent = "💥 You blinked! Timer reset.";
    resetTimer();
  }
});

function startGame() {
  if (!gameStarted) {
    message.textContent = "Keep hovering inside the eye!";
    interval = setInterval(runTimer, 1000);
    gameStarted = true;
    paused = false;
  }
}

function pauseGame() {
  if (gameStarted && !paused) {
    clearInterval(interval);
    paused = true;
    message.textContent = "⏸️ Game paused.";
  } else if (paused) {
    interval = setInterval(runTimer, 1000);
    paused = false;
    message.textContent = "▶️ Game resumed!";
  }
}

function restartGame() {
  clearInterval(interval);
  timer = 0;
  timerDisplay.textContent = timer;
  message.textContent = "🔄 Game restarted. Click Start!";
  gameStarted = false;
  paused = false;
}

function runTimer() {
  timer++;
  timerDisplay.textContent = timer;
  if (timer >= 10) {
    clearInterval(interval);
    winSound.play();
    message.textContent = "🎉 You won! You didn’t blink!";
    gameStarted = false;
  }
}

function resetTimer() {
  clearInterval(interval);
  timer = 0;
  timerDisplay.textContent = timer;
  gameStarted = false;
  setTimeout(() => {
    message.textContent = "Try again!";
  }, 1000);
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", restartGame);
