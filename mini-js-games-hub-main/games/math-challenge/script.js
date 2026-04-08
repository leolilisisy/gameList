const startBtn = document.getElementById("start-btn");
const submitBtn = document.getElementById("submit-btn");
const restartBtn = document.getElementById("restart-btn");
const questionEl = document.getElementById("question");
const answerInput = document.getElementById("answer");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const feedbackEl = document.getElementById("feedback");

let score = 0;
let time = 60;
let currentAnswer = 0;
let timerInterval;

function generateQuestion() {
    const operations = ["+", "-", "*", "/"];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1 = Math.floor(Math.random() * 50) + 1;
    let num2 = Math.floor(Math.random() * 50) + 1;

    if (op === "/") {
        // Ensure division is whole number
        num1 = num1 * num2;
    }

    questionEl.textContent = `Solve: ${num1} ${op} ${num2}`;
    switch(op) {
        case "+": currentAnswer = num1 + num2; break;
        case "-": currentAnswer = num1 - num2; break;
        case "*": currentAnswer = num1 * num2; break;
        case "/": currentAnswer = num1 / num2; break;
    }
}

function startGame() {
    score = 0;
    time = 60;
    scoreEl.textContent = score;
    timerEl.textContent = time;
    answerInput.disabled = false;
    submitBtn.disabled = false;
    startBtn.disabled = true;
    feedbackEl.textContent = "";
    answerInput.value = "";
    answerInput.focus();
    generateQuestion();

    timerInterval = setInterval(() => {
        time--;
        timerEl.textContent = time;
        if(time <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function submitAnswer() {
    const userAnswer = parseFloat(answerInput.value);
    if (!isNaN(userAnswer)) {
        if (userAnswer === currentAnswer) {
            score++;
            feedbackEl.textContent = "✅ Correct!";
        } else {
            feedbackEl.textContent = `❌ Wrong! The answer was ${currentAnswer}`;
        }
        scoreEl.textContent = score;
        answerInput.value = "";
        generateQuestion();
    }
}

function endGame() {
    feedbackEl.textContent = `⏰ Time's up! Your final score is ${score}`;
    answerInput.disabled = true;
    submitBtn.disabled = true;
    startBtn.disabled = false;
}

startBtn.addEventListener("click", startGame);
submitBtn.addEventListener("click", submitAnswer);
restartBtn.addEventListener("click", () => {
    clearInterval(timerInterval);
    startGame();
});
answerInput.addEventListener("keyup", (e) => {
    if(e.key === "Enter") submitAnswer();
});
