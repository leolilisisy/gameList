let num1, num2, correctAnswer;
let score = 0;
let timeLeft = 10;
let timer;
let gameActive = false;

const question = document.getElementById("question");
const answer = document.getElementById("answer");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const submitBtn = document.getElementById("submit");
const startBtn = document.getElementById("start");

function startGame() {
  score = 0;
  scoreDisplay.textContent = "Score: 0";
  gameActive = true;
  answer.disabled = false;
  submitBtn.disabled = false;
  startBtn.disabled = true;
  newQuestion();
}

function newQuestion() {
  num1 = Math.floor(Math.random() * 50) + 1;
  num2 = Math.floor(Math.random() * 50) + 1;
  correctAnswer = num1 + num2;
  question.textContent = `${num1} + ${num2} = ?`;
  answer.value = "";
  answer.focus();
  resetTimer();
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 10;
  timerDisplay.textContent = `⏱️ Time: ${timeLeft}`;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `⏱️ Time: ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame("⏰ Time’s up!");
    }
  }, 1000);
}

function checkAnswer() {
  if (!gameActive) return;
  const playerAnswer = parseInt(answer.value);
  if (isNaN(playerAnswer)) return;

  if (playerAnswer === correctAnswer) {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    newQuestion();
  } else {
    endGame(`❌ Wrong! The correct answer was ${correctAnswer}.`);
  }
}

function endGame(message) {
  gameActive = false;
  clearInterval(timer);
  question.textContent = message + ` Final Score: ${score}`;
  answer.disabled = true;
  submitBtn.disabled = true;
  startBtn.disabled = false;
}

submitBtn.addEventListener("click", checkAnswer);
startBtn.addEventListener("click", startGame);
answer.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkAnswer();
});
