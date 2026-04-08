const words = [
  "javascript", "developer", "algorithm", "function", "variable", 
  "object", "array", "string", "boolean", "event", 
  "document", "element", "style", "keyboard", "performance"
];

let currentWord = "";
let score = 0;
let time = 60;
let timer;
let gameActive = false;

const wordDisplay = document.getElementById("word-display");
const input = document.getElementById("typing-input");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

function pickRandomWord() {
  currentWord = words[Math.floor(Math.random() * words.length)];
  wordDisplay.textContent = currentWord;
}

function startGame() {
  if (gameActive) return;
  gameActive = true;
  score = 0;
  time = 60;
  scoreEl.textContent = score;
  timeEl.textContent = time;
  messageEl.textContent = "";
  input.value = "";
  input.focus();
  pickRandomWord();

  timer = setInterval(() => {
    time--;
    timeEl.textContent = time;
    if (time <= 0) {
      clearInterval(timer);
      gameActive = false;
      messageEl.textContent = `⏰ Time's up! Final Score: ${score}`;
      wordDisplay.textContent = "Game Over!";
    }
  }, 1000);
}

function restartGame() {
  clearInterval(timer);
  gameActive = false;
  score = 0;
  time = 60;
  scoreEl.textContent = score;
  timeEl.textContent = time;
  input.value = "";
  messageEl.textContent = "";
  wordDisplay.textContent = "Press Start!";
}

input.addEventListener("input", () => {
  if (!gameActive) return;
  if (input.value.trim().toLowerCase() === currentWord.toLowerCase()) {
    score++;
    scoreEl.textContent = score;
    input.value = "";
    pickRandomWord();
  }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
