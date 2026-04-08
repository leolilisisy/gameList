const startBtn = document.getElementById("start-btn");
const submitBtn = document.getElementById("submit-btn");
const nextBtn = document.getElementById("next-btn");
const resetBtn = document.getElementById("reset-btn");
const problemEl = document.getElementById("problem");
const userInput = document.getElementById("user-input");
const messageEl = document.getElementById("message");
const levelEl = document.getElementById("current-level");
const scoreEl = document.getElementById("current-score");
const timerEl = document.getElementById("time-left");

let level = 1;
let score = 0;
let correctCount = 0;
let timer;
let timeLeft;
let currentAnswer;
let gameActive = false;

startBtn.addEventListener("click", startGame);
submitBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", nextLevel);
resetBtn.addEventListener("click", resetGame);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    checkAnswer();
  }
});

function startGame() {
  level = 1;
  score = 0;
  correctCount = 0;
  levelEl.textContent = level;
  scoreEl.textContent = score;
  startBtn.style.display = "none";
  gameActive = true;
  generateProblem();
}

function generateProblem() {
  const operations = getOperationsForLevel(level);
  const op = operations[Math.floor(Math.random() * operations.length)];
  let num1, num2;

  switch (level) {
    case 1:
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      break;
    case 2:
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      break;
    case 3:
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      break;
    case 4:
      num1 = Math.floor(Math.random() * 100) + 1;
      num2 = Math.floor(Math.random() * 100) + 1;
      break;
    default:
      num1 = Math.floor(Math.random() * 200) + 1;
      num2 = Math.floor(Math.random() * 200) + 1;
  }

  if (op === '/' && num1 % num2 !== 0) {
    num1 = num2 * Math.floor(Math.random() * 10) + num2; // Make divisible
  }

  let problem, answer;
  switch (op) {
    case '+':
      problem = `${num1} + ${num2}`;
      answer = num1 + num2;
      break;
    case '-':
      if (num1 < num2) [num1, num2] = [num2, num1]; // Ensure positive result
      problem = `${num1} - ${num2}`;
      answer = num1 - num2;
      break;
    case '*':
      problem = `${num1} × ${num2}`;
      answer = num1 * num2;
      break;
    case '/':
      problem = `${num1} ÷ ${num2}`;
      answer = num1 / num2;
      break;
  }

  problemEl.textContent = problem;
  currentAnswer = answer;
  userInput.value = "";
  userInput.focus();
  messageEl.textContent = "";

  timeLeft = Math.max(30 - (level - 1) * 5, 10); // Decrease time with level
  timerEl.textContent = timeLeft;

  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      wrongAnswer();
    }
  }, 1000);
}

function getOperationsForLevel(lvl) {
  if (lvl === 1) return ['+', '-'];
  if (lvl === 2) return ['+', '-', '*'];
  return ['+', '-', '*', '/'];
}

function checkAnswer() {
  if (!gameActive) return;
  const userAnswer = parseFloat(userInput.value);
  if (isNaN(userAnswer)) return;

  if (Math.abs(userAnswer - currentAnswer) < 0.01) { // For division
    correctAnswer();
  } else {
    wrongAnswer();
  }
}

function correctAnswer() {
  clearInterval(timer);
  score += level * 10 + timeLeft; // Bonus for speed
  scoreEl.textContent = score;
  correctCount++;
  messageEl.textContent = "✅ Correct!";
  submitBtn.style.display = "none";
  if (correctCount >= 5) { // 5 correct to advance level
    nextBtn.style.display = "inline-block";
    messageEl.textContent += " Level complete!";
  } else {
    setTimeout(generateProblem, 1000);
  }
}

function wrongAnswer() {
  clearInterval(timer);
  messageEl.textContent = `❌ Wrong! Answer: ${currentAnswer}`;
  submitBtn.style.display = "none";
  nextBtn.style.display = "inline-block";
  nextBtn.textContent = "Try Again";
  gameActive = false;
}

function nextLevel() {
  if (correctCount >= 5) {
    level++;
    levelEl.textContent = level;
    correctCount = 0;
  }
  nextBtn.style.display = "none";
  submitBtn.style.display = "inline-block";
  gameActive = true;
  generateProblem();
}

function resetGame() {
  clearInterval(timer);
  level = 1;
  score = 0;
  correctCount = 0;
  levelEl.textContent = level;
  scoreEl.textContent = score;
  messageEl.textContent = "";
  problemEl.textContent = "";
  userInput.value = "";
  startBtn.style.display = "inline-block";
  submitBtn.style.display = "inline-block";
  nextBtn.style.display = "none";
  resetBtn.style.display = "none";
  gameActive = false;
}