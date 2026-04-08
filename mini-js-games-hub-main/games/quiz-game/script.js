const questions = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "Home Tool Markup Language",
      "Hyperlinks and Text Markup Language",
      "High Transfer Markup Logic"
    ],
    answer: 0
  },
  {
    question: "Which language runs in a web browser?",
    options: ["Java", "C", "Python", "JavaScript"],
    answer: 3
  },
  {
    question: "What year was JavaScript launched?",
    options: ["1996", "1995", "1994", "1997"],
    answer: 1
  },
  {
    question: "Which CSS property controls text size?",
    options: ["font-weight", "text-style", "font-size", "text-size"],
    answer: 2
  },
  {
    question: "What does DOM stand for?",
    options: [
      "Document Object Model",
      "Display Object Management",
      "Digital Ordinance Model",
      "Desktop Oriented Mode"
    ],
    answer: 0
  }
];

let currentQuestion = 0;
let score = 0;

const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const scoreDisplay = document.getElementById("score");
const questionNumber = document.getElementById("question-number");
const resultBox = document.getElementById("result-box");
const quizBox = document.getElementById("quiz-box");
const finalScore = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");

function loadQuestion() {
  const q = questions[currentQuestion];
  questionText.textContent = q.question;
  optionsContainer.innerHTML = "";
  questionNumber.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  
  q.options.forEach((opt, index) => {
    const btn = document.createElement("div");
    btn.classList.add("option");
    btn.textContent = opt;
    btn.addEventListener("click", () => selectAnswer(index, btn));
    optionsContainer.appendChild(btn);
  });

  nextBtn.disabled = true;
}

function selectAnswer(selected, btn) {
  const q = questions[currentQuestion];
  const allOptions = document.querySelectorAll(".option");

  allOptions.forEach(o => o.classList.add("disabled"));

  if (selected === q.answer) {
    btn.classList.add("correct");
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
  } else {
    btn.classList.add("wrong");
    allOptions[q.answer].classList.add("correct");
  }

  nextBtn.disabled = false;
}

nextBtn.addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    showResults();
  }
});

function showResults() {
  quizBox.classList.add("hidden");
  resultBox.classList.remove("hidden");
  finalScore.textContent = `Your Final Score: ${score} / ${questions.length}`;
}

restartBtn.addEventListener("click", () => {
  currentQuestion = 0;
  score = 0;
  scoreDisplay.textContent = `Score: ${score}`;
  resultBox.classList.add("hidden");
  quizBox.classList.remove("hidden");
  loadQuestion();
});

loadQuestion();
