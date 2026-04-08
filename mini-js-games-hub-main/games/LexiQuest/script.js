const wordBox = document.getElementById("word");
const optionsBox = document.getElementById("options");
const scoreDisplay = document.getElementById("score");
const questionNumDisplay = document.getElementById("question-number");
const nextBtn = document.getElementById("nextBtn");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const difficultySelect = document.getElementById("difficulty");

let currentQuestion = 0;
let score = 0;
let questions = [];

const questionBank = {
  easy: [
    { word: "Happy", options: ["Joyful", "Sad", "Angry", "Tired"], answer: "Joyful" },
    { word: "Big", options: ["Large", "Tiny", "Thin", "Short"], answer: "Large" },
    { word: "Cold", options: ["Hot", "Freezing", "Warm", "Dry"], answer: "Freezing" },
    { word: "Fast", options: ["Quick", "Slow", "Late", "Lazy"], answer: "Quick" },
    { word: "Beautiful", options: ["Ugly", "Pretty", "Dirty", "Plain"], answer: "Pretty" },
  ],
  medium: [
    { word: "Courage", options: ["Fear", "Bravery", "Cowardice", "Hate"], answer: "Bravery" },
    { word: "Ancient", options: ["Old", "Modern", "Recent", "Future"], answer: "Old" },
    { word: "Fragile", options: ["Delicate", "Strong", "Solid", "Tough"], answer: "Delicate" },
    { word: "Polite", options: ["Rude", "Courteous", "Selfish", "Cruel"], answer: "Courteous" },
    { word: "Bizarre", options: ["Strange", "Normal", "Usual", "Plain"], answer: "Strange" },
  ],
  hard: [
    { word: "Eloquent", options: ["Fluent", "Silent", "Weak", "Dull"], answer: "Fluent" },
    { word: "Obsolete", options: ["Outdated", "Current", "New", "Trendy"], answer: "Outdated" },
    { word: "Melancholy", options: ["Sadness", "Joy", "Excitement", "Anger"], answer: "Sadness" },
    { word: "Voracious", options: ["Greedy", "Lazy", "Calm", "Sleepy"], answer: "Greedy" },
    { word: "Astute", options: ["Clever", "Foolish", "Clumsy", "Slow"], answer: "Clever" },
  ],
};

function startGame() {
  const difficulty = difficultySelect.value;
  questions = [...questionBank[difficulty]];
  currentQuestion = 0;
  score = 0;
  scoreDisplay.textContent = "Score: 0";
  questionNumDisplay.textContent = "Question: 1 / " + questions.length;
  message.textContent = "";
  nextBtn.disabled = true;
  renderQuestion();
}

function renderQuestion() {
  const q = questions[currentQuestion];
  wordBox.textContent = q.word;
  optionsBox.innerHTML = "";
  q.options.forEach(option => {
    const btn = document.createElement("div");
    btn.classList.add("option");
    btn.textContent = option;
    btn.onclick = () => selectAnswer(btn, q.answer);
    optionsBox.appendChild(btn);
  });
}

function selectAnswer(selectedBtn, correctAnswer) {
  const options = document.querySelectorAll(".option");
  options.forEach(opt => {
    opt.onclick = null;
    if (opt.textContent === correctAnswer) opt.classList.add("correct");
    else if (opt === selectedBtn) opt.classList.add("wrong");
  });

  if (selectedBtn.textContent === correctAnswer) {
    score++;
    message.textContent = "✅ Correct!";
  } else {
    message.textContent = "❌ Incorrect!";
  }

  scoreDisplay.textContent = "Score: " + score;
  nextBtn.disabled = false;
}

nextBtn.addEventListener("click", () => {
  currentQuestion++;
  message.textContent = "";
  if (currentQuestion < questions.length) {
    questionNumDisplay.textContent = Question: ${currentQuestion + 1} / ${questions.length};
    nextBtn.disabled = true;
    renderQuestion();
  } else {
    showResult();
  }
});

function showResult() {
  wordBox.textContent = "🎉 Quiz Completed!";
  optionsBox.innerHTML = <p>Your final score is <b>${score}/${questions.length}</b></p>;
  nextBtn.disabled = true;
}

startBtn.addEventListener("click", startGame);
