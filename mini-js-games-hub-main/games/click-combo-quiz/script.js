// =========================
// QUIZ QUESTIONS
// =========================
const questions = [
  {
    question: "Which language runs in a browser?",
    answers: ["Java", "C++", "Python", "JavaScript"],
    correct: "JavaScript",
  },
  {
    question: "2 + 2 × 2 = ?",
    answers: ["6", "8", "4", "10"],
    correct: "6",
  },
  {
    question: "Capital of Japan?",
    answers: ["Beijing", "Tokyo", "Seoul", "Bangkok"],
    correct: "Tokyo",
  },
  {
    question: "HTML stands for?",
    answers: ["Hyper Trainer Marking Language","Hyper Text Markup Language","Hyper Tag Markup Language","None"],
    correct: "Hyper Text Markup Language",
  },
  {
    question: "CSS controls...?",
    answers: ["Structure", "Logic", "Styling", "Database"],
    correct: "Styling",
  },
];

// =========================
// GLOBAL VARIABLES
// =========================
let index = 0;
let score = 0;
let combo = 1;
let streak = 0;
let timer = 10;
let timerInterval;
let soundOn = true;

// =========================
// ELEMENTS
// =========================
const q = document.getElementById("question");
const ans = document.getElementById("answers");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const timerEl = document.getElementById("timer");
const streakProgress = document.getElementById("streak-progress");
const modal = document.getElementById("game-over-modal");
const finalScore = document.getElementById("final-score");

// =========================
// SOUNDS
// =========================
const correctSound = new Audio("https://cdn.pixabay.com/audio/2022/03/07/audio_1b72dfc4de.mp3");
const wrongSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_1be0e962cf.mp3");

// =========================
// FUNCTIONS
// =========================
function loadQuestion() {
  q.textContent = questions[index].question;
  ans.innerHTML = "";

  questions[index].answers.forEach((a) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = a;
    btn.onclick = () => checkAnswer(a, btn);
    ans.appendChild(btn);
  });

  resetTimer();
}

function resetTimer() {
  clearInterval(timerInterval);
  timer = 10;
  timerEl.textContent = timer;

  timerInterval = setInterval(() => {
    timer--;
    timerEl.textContent = timer;
    if (timer <= 0) wrongAnswer();
  }, 1000);
}

function checkAnswer(answer, btn) {
  if (answer === questions[index].correct) {
    btn.classList.add("correct");
    
    score += 10 * combo;
    streak++;
    combo = Math.min(combo + 1, 10);
    comboEl.textContent = combo;

    streakProgress.style.width = `${streak * 10}%`;

    if (soundOn) correctSound.play();
  } else {
    wrongAnswer(btn);
    return;
  }

  scoreEl.textContent = score;

  setTimeout(nextQuestion, 700);
}

function wrongAnswer(btn) {
  if (btn) btn.classList.add("wrong");
  
  if (soundOn) wrongSound.play();

  combo = 1;
  streak = 0;
  comboEl.textContent = combo;
  streakProgress.style.width = "0%";

  setTimeout(nextQuestion, 700);
}

function nextQuestion() {
  index++;
  if (index >= questions.length) return endGame();
  loadQuestion();
}

function endGame() {
  clearInterval(timerInterval);
  finalScore.textContent = score;
  modal.classList.remove("hide");
}

// =========================
// EXTRA UI BUTTONS
// =========================
document.getElementById("restart").onclick = () => location.reload();

document.getElementById("sound-toggle").onclick = function() {
  soundOn = !soundOn;
  this.textContent = soundOn ? "🔊 Sound On" : "🔇 Sound Off";
};

// =========================
// START
// =========================
loadQuestion();
