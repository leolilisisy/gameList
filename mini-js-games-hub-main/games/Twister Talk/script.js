const twisters = [
  "She sells seashells by the seashore.",
  "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
  "Peter Piper picked a peck of pickled peppers.",
  "Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair.",
  "Red lorry, yellow lorry, red lorry, yellow lorry.",
  "Betty bought a bit of butter but the butter was bitter."
];

const twisterEl = document.getElementById("twister");
const userInput = document.getElementById("userInput");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const feedback = document.getElementById("feedback");
const timerEl = document.getElementById("time");
const scoreEl = document.getElementById("score");

let timeLeft = 10;
let timer;
let currentTwister = "";
let score = 0;

function startGame() {
  feedback.textContent = "";
  startBtn.disabled = true;
  restartBtn.disabled = false;
  userInput.disabled = false;
  userInput.value = "";
  timeLeft = 10;
  timerEl.textContent = timeLeft;

  // Random twister
  currentTwister = twisters[Math.floor(Math.random() * twisters.length)];
  twisterEl.textContent = currentTwister;

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

function endGame(success) {
  clearInterval(timer);
  userInput.disabled = true;
  startBtn.disabled = false;
  restartBtn.disabled = true;

  if (success) {
    feedback.textContent = "✅ Perfect! You nailed it!";
    feedback.style.color = "#7CFC00";
    score++;
    scoreEl.textContent = score;
  } else {
    feedback.textContent = "❌ Time's up! Try again.";
    feedback.style.color = "#FF6B6B";
  }
}

userInput.addEventListener("input", () => {
  if (userInput.value.trim() === currentTwister) {
    endGame(true);
  }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", () => {
  userInput.value = "";
  startGame();
});
