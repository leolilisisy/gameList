const quizData = [
    { emoji: "🍿🎬👑", answer: "movie" },
    { emoji: "🐍🖥️", answer: "python" },
    { emoji: "👸❄️", answer: "frozen" },
    { emoji: "🍎📱", answer: "apple" },
    { emoji: "🦁👑", answer: "lion king" },
    { emoji: "🌧️☔", answer: "rain" },
    { emoji: "💡📝", answer: "idea" },
];

let currentQuestion = 0;
let score = 0;

const emojiDisplay = document.getElementById("emoji-display");
const input = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-btn");
const feedback = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const questionNumberEl = document.getElementById("question-number");
const totalQuestionsEl = document.getElementById("total-questions");
const restartBtn = document.getElementById("restart-btn");

// Initialize quiz
totalQuestionsEl.textContent = quizData.length;

function loadQuestion() {
    if (currentQuestion < quizData.length) {
        emojiDisplay.textContent = quizData[currentQuestion].emoji;
        questionNumberEl.textContent = currentQuestion + 1;
        input.value = "";
        feedback.textContent = "";
        input.focus();
    } else {
        endQuiz();
    }
}

function checkAnswer() {
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = quizData[currentQuestion].answer.toLowerCase();

    if (!userAnswer) return;

    if (userAnswer === correctAnswer) {
        score++;
        feedback.textContent = "✅ Correct!";
        feedback.style.color = "#00ff00";
    } else {
        feedback.textContent = `❌ Wrong! Correct: ${quizData[currentQuestion].answer}`;
        feedback.style.color = "#ff4c4c";
    }

    scoreEl.textContent = score;
    currentQuestion++;

    setTimeout(loadQuestion, 1000);
}

function endQuiz() {
    emojiDisplay.textContent = "🎉 Quiz Completed!";
    feedback.textContent = `Your final score: ${score} / ${quizData.length}`;
    input.style.display = "none";
    submitBtn.style.display = "none";
    restartBtn.style.display = "inline-block";
}

// Event listeners
submitBtn.addEventListener("click", checkAnswer);
input.addEventListener("keypress", function(e){
    if (e.key === "Enter") checkAnswer();
});
restartBtn.addEventListener("click", () => {
    currentQuestion = 0;
    score = 0;
    input.style.display = "inline-block";
    submitBtn.style.display = "inline-block";
    restartBtn.style.display = "none";
    scoreEl.textContent = score;
    loadQuestion();
});

// Start the quiz
loadQuestion();
