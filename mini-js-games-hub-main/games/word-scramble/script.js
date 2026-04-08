const words = {
  easy: ["cat", "sun", "book", "tree", "milk", "fish"],
  medium: ["planet", "jumble", "orange", "rocket", "garden", "silver"],
  hard: ["scramble", "awareness", "algorithm", "javascript", "university", "framework"]
};

const difficultySelect = document.getElementById("difficulty");
const startBtn = document.getElementById("start-btn");
const gameSection = document.querySelector(".game");
const resultSection = document.getElementById("result");
const scrambledWordEl = document.getElementById("scrambled-word");
const userInput = document.getElementById("user-input");
const submitBtn = document.getElementById("submit-btn");
const nextBtn = document.getElementById("next-btn");
const hintBtn = document.getElementById("hint-btn");
const hintText = document.getElementById("hint-text");
const timerEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const finalScoreEl = document.getElementById("final-score");
const resultMessage = document.getElementById("result-message");
const restartBtn = document.getElementById("restart-btn");

let currentWord = "";
let scrambled = "";
let score = 0;
let timer;
let timeLeft;
let difficulty = "medium";
let usedHint = false;
let gameStarted = false;

startBtn.addEventListener("click", startGame);
submitBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", nextRound);
hintBtn.addEventListener("click", showHint);
restartBtn.addEventListener("click", restartGame);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    checkAnswer();
  }
});

function startGame() {
  difficulty = difficultySelect.value;
  document.querySelector(".settings").classList.add("hidden");
  gameSection.classList.remove("hidden");
  score = 0;
  scoreEl.textContent = score;
  timeLeft = 60; // Overall game time
  timerEl.textContent = timeLeft;
  gameStarted = true;
  startRound();
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      gameOver();
    }
  }, 1000);
}

function startRound() {
  const list = words[difficulty];
  currentWord = list[Math.floor(Math.random() * list.length)];
  scrambled = shuffleWord(currentWord);
  scrambledWordEl.textContent = scrambled;
  userInput.value = "";
  hintText.textContent = "";
  usedHint = false;
  nextBtn.classList.add("hidden");
  submitBtn.disabled = false;
}

function shuffleWord(word) {
  return word.split("").sort(() => 0.5 - Math.random()).join("");
}

function checkAnswer() {
  const answer = userInput.value.trim().toLowerCase();
  if (!answer) return;
  if (answer === currentWord) {
    score += 10;
    if (usedHint) score -= 5;
    scoreEl.textContent = score;
    scrambledWordEl.textContent = "✅ Correct!";
    submitBtn.disabled = true;
    nextBtn.classList.remove("hidden");
  } else {
    hintText.textContent = "❌ Incorrect! Try again.";
  }
}

function nextRound() {
  startRound();
}

function showHint() {
  if (usedHint) return;
  usedHint = true;
  const randomIndex = Math.floor(Math.random() * currentWord.length);
  const hintChar = currentWord[randomIndex];
  hintText.textContent = `💡 Hint: Letter '${hintChar.toUpperCase()}' is in the word.`;
}

function restartGame() {
  resultSection.classList.add("hidden");
  document.querySelector(".settings").classList.remove("hidden");
  gameStarted = false;
  clearInterval(timer);
}

function gameOver() {
  gameSection.classList.add("hidden");
  resultSection.classList.remove("hidden");
  finalScoreEl.textContent = score;
  resultMessage.textContent = score >= 100 ? "🎉 Amazing!" : score >= 50 ? "👍 Good job!" : "Keep practicing!";
}
