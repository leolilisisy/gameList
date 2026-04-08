const questionEl = document.getElementById("question");
const answerInput = document.getElementById("answer");
const submitBtn = document.getElementById("submit-btn");
const feedbackEl = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const resultContainer = document.querySelector(".result-container");
const finalScoreEl = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");

let score = 0;
let timeLeft = 10;
let currentAnswer = 0;
let timer;

function generateQuestion() {
  const operations = ["+", "-", "*", "/"];
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 20) + 1;
  const op = operations[Math.floor(Math.random() * operations.length)];

  switch(op) {
    case "+":
      currentAnswer = num1 + num2;
      break;
    case "-":
      currentAnswer = num1 - num2;
      break;
    case "*":
      currentAnswer = num1 * num2;
      break;
    case "/":
      currentAnswer = parseFloat((num1 / num2).toFixed(2));
      break;
  }
  questionEl.textContent = `What is ${num1} ${op} ${num2}?`;
  answerInput.value = "";
  feedbackEl.textContent = "";
  answerInput.focus();
  timeLeft = 10;
  timerEl.textContent = timeLeft;
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if(timeLeft <= 0) {
      clearInterval(timer);
      feedbackEl.textContent = `⏰ Time's up! Answer was ${currentAnswer}`;
      setTimeout(generateQuestion, 1500);
    }
  }, 1000);
}

submitBtn.addEventListener("click", () => {
  checkAnswer();
});

answerInput.addEventListener("keypress", (e) => {
  if(e.key === "Enter") checkAnswer();
});

function checkAnswer() {
  const userAnswer = parseFloat(answerInput.value);
  if(userAnswer === currentAnswer) {
    feedbackEl.textContent = "✅ Correct!";
    score += 10;
  } else {
    feedbackEl.textContent = `❌ Wrong! Answer was ${currentAnswer}`;
  }
  scoreEl.textContent = score;
  clearInterval(timer);
  setTimeout(generateQuestion, 1000);
}

function endGame() {
  clearInterval(timer);
  questionEl.parentElement.hidden = true;
  resultContainer.hidden = false;
  finalScoreEl.textContent = score;
}

restartBtn.addEventListener("click", () => {
  score = 0;
  scoreEl.textContent = score;
  questionEl.parentElement.hidden = false;
  resultContainer.hidden = true;
  generateQuestion();
});

// Start the first question
generateQuestion();
