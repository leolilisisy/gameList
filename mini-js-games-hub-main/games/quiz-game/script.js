const localizedQuestions = {
  en: [
    {
      question: "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "Home Tool Markup Language",
        "Hyperlinks and Text Markup Language",
        "High Transfer Markup Logic",
      ],
      answer: 0,
    },
    {
      question: "Which language runs in a web browser?",
      options: ["Java", "C", "Python", "JavaScript"],
      answer: 3,
    },
    {
      question: "What year was JavaScript launched?",
      options: ["1996", "1995", "1994", "1997"],
      answer: 1,
    },
    {
      question: "Which CSS property controls text size?",
      options: ["font-weight", "text-style", "font-size", "text-size"],
      answer: 2,
    },
    {
      question: "What does DOM stand for?",
      options: [
        "Document Object Model",
        "Display Object Management",
        "Digital Ordinance Model",
        "Desktop Oriented Mode",
      ],
      answer: 0,
    },
  ],
  zh: [
    {
      question: "HTML 的全称是什么？",
      options: [
        "超文本标记语言",
        "家庭工具标记语言",
        "超链接与文本标记语言",
        "高级传输标记逻辑",
      ],
      answer: 0,
    },
    {
      question: "哪一种语言运行在网页浏览器中？",
      options: ["Java", "C", "Python", "JavaScript"],
      answer: 3,
    },
    {
      question: "JavaScript 是哪一年发布的？",
      options: ["1996", "1995", "1994", "1997"],
      answer: 1,
    },
    {
      question: "哪一个 CSS 属性用来控制文字大小？",
      options: ["font-weight", "text-style", "font-size", "text-size"],
      answer: 2,
    },
    {
      question: "DOM 的全称是什么？",
      options: [
        "文档对象模型",
        "显示对象管理",
        "数字法规模型",
        "桌面导向模式",
      ],
      answer: 0,
    },
  ],
};

const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const scoreDisplay = document.getElementById("score");
const questionNumber = document.getElementById("question-number");
const resultBox = document.getElementById("result-box");
const quizBox = document.getElementById("quiz-box");
const finalScore = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const i18n = window.SiteI18n;

let currentQuestion = 0;
let score = 0;

function getQuestions() {
  return localizedQuestions[i18n.getLocale()] || localizedQuestions.en;
}

function updateHeader() {
  const questions = getQuestions();
  questionNumber.textContent = i18n.t("gameQuiz.questionCount", {
    current: currentQuestion + 1,
    total: questions.length,
  });
  scoreDisplay.textContent = i18n.t("gameQuiz.score", { score });
}

function loadQuestion() {
  const questions = getQuestions();
  const current = questions[currentQuestion];
  questionText.textContent = current.question;
  optionsContainer.innerHTML = "";
  updateHeader();

  current.options.forEach((option, index) => {
    const button = document.createElement("div");
    button.classList.add("option");
    button.textContent = option;
    button.addEventListener("click", () => selectAnswer(index, button));
    optionsContainer.appendChild(button);
  });

  nextBtn.disabled = true;
}

function selectAnswer(selected, button) {
  const questions = getQuestions();
  const current = questions[currentQuestion];
  const allOptions = document.querySelectorAll(".option");

  allOptions.forEach((option) => option.classList.add("disabled"));

  if (selected === current.answer) {
    button.classList.add("correct");
    score++;
    scoreDisplay.textContent = i18n.t("gameQuiz.score", { score });
  } else {
    button.classList.add("wrong");
    allOptions[current.answer].classList.add("correct");
  }

  nextBtn.disabled = false;
}

function showResults() {
  const questions = getQuestions();
  quizBox.classList.add("hidden");
  resultBox.classList.remove("hidden");
  finalScore.textContent = i18n.t("gameQuiz.finalScore", {
    score,
    total: questions.length,
  });
}

nextBtn.addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < getQuestions().length) {
    loadQuestion();
  } else {
    showResults();
  }
});

restartBtn.addEventListener("click", () => {
  currentQuestion = 0;
  score = 0;
  resultBox.classList.add("hidden");
  quizBox.classList.remove("hidden");
  loadQuestion();
});

window.addEventListener("site-language-change", () => {
  currentQuestion = 0;
  score = 0;
  resultBox.classList.add("hidden");
  quizBox.classList.remove("hidden");
  loadQuestion();
});

loadQuestion();
