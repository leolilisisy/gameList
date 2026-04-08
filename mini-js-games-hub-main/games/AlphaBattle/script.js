const words = [
  "adventure", "galaxy", "knowledge", "victory", "explore",
  "pioneer", "courage", "creative", "dynamic", "fantasy",
  "harmony", "jungle", "legend", "mystery", "nebula",
  "quest", "rhythm", "universe", "wonder", "zephyr"
];

const wordDisplay = document.getElementById("wordDisplay");
const userInput = document.getElementById("userInput");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const message = document.getElementById("message");

let currentWord = "";
let score = 0;
let time = 30;
let timer;
let gameActive = false;

function randomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

function displayWord() {
  currentWord = randomWord();
  wordDisplay.textContent = currentWord;
  wordDisplay.classList.add("animate");
  setTimeout(() => wordDisplay.classList.remove("animate"), 200);
}

function startGame() {
  if (gameActive) return;
  gameActive = true;
  score = 0;
  time = 30;
  userInput.disabled = false;
  userInput.focus();
  message.textContent = "";
  scoreDisplay.textContent = score;
  timeDisplay.textContent = time;
  displayWord();

  timer = setInterval(() => {
    time--;
    timeDisplay.textContent = time;
    if (time <= 0) endGame();
  }, 1000);
}

function checkInput() {
  if (userInput.value.trim().toLowerCase() === currentWord.toLowerCase()) {
    score++;
    scoreDisplay.textContent = score;
    playSound("https://cdn.pixabay.com/download/audio/2022/03/15/audio_50f34169e4.mp3?filename=click-124467.mp3");
    userInput.value = "";
    displayWord();
  }
}

function endGame() {
  clearInterval(timer);
  userInput.disabled = true;
  gameActive = false;
  message.textContent = 🏁 Time's up! Final Score: ${score};
  playSound("https://cdn.pixabay.com/download/audio/2022/03/15/audio_327e22f9d4.mp3?filename=game-over-arcade-6435.mp3");
}

function restartGame() {
  clearInterval(timer);
  score = 0;
  time = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = time;
  message.textContent = "";
  userInput.value = "";
  userInput.disabled = true;
  wordDisplay.textContent = "Press Start!";
  gameActive = false;
}

function playSound(url) {
  const audio = new Audio(url);
  audio.volume = 0.5;
  audio.play();
}

userInput.addEventListener("input", checkInput);
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
