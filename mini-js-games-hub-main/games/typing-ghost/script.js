const displayText = document.getElementById("display-text");
const typingArea = document.getElementById("typing-area");
const ghostProgress = document.getElementById("ghost-progress");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const ghostStatus = document.getElementById("ghost-status");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");
const typeSound = document.getElementById("type-sound");
const successSound = document.getElementById("success-sound");
const failSound = document.getElementById("fail-sound");

const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "JavaScript makes web pages alive and interactive.",
  "Coding is fun when creativity meets logic.",
  "Practice typing to improve your speed and accuracy."
];

let currentSentence = "";
let startTime, ghostData;
let timer, paused = false;

function startGame() {
  currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
  displayText.textContent = currentSentence;
  typingArea.value = "";
  wpmDisplay.textContent = "0";
  accuracyDisplay.textContent = "100%";
  ghostStatus.textContent = "Ready";
  ghostProgress.style.width = "0%";
  paused = false;
}

function calculateStats() {
  const typed = typingArea.value;
  const elapsed = (Date.now() - startTime) / 1000 / 60;
  const words = typed.trim().split(/\s+/).length;
  const wpm = Math.round(words / elapsed || 0);
  const correctChars = typed.split("").filter((ch, i) => ch === currentSentence[i]).length;
  const accuracy = Math.round((correctChars / currentSentence.length) * 100);
  wpmDisplay.textContent = wpm;
  accuracyDisplay.textContent = `${accuracy}%`;
}

function runGhost() {
  if (!ghostData) return;
  const duration = ghostData.time;
  const start = Date.now();
  const ghostTimer = setInterval(() => {
    if (paused) return;
    const elapsed = Date.now() - start;
    const progress = Math.min((elapsed / duration) * 100, 100);
    ghostProgress.style.width = `${progress}%`;
    if (progress >= 100) clearInterval(ghostTimer);
  }, 100);
}

typingArea.addEventListener("input", () => {
  if (!startTime) {
    startTime = Date.now();
    runGhost();
  }
  typeSound.currentTime = 0;
  typeSound.play();
  calculateStats();
  if (typingArea.value === currentSentence) endGame();
});

pauseBtn.addEventListener("click", () => {
  paused = true;
  typingArea.disabled = true;
  ghostStatus.textContent = "Paused";
  pauseBtn.disabled = true;
  resumeBtn.disabled = false;
});

resumeBtn.addEventListener("click", () => {
  paused = false;
  typingArea.disabled = false;
  ghostStatus.textContent = "Racing!";
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
});

restartBtn.addEventListener("click", () => {
  startGame();
  ghostStatus.textContent = "Restarted";
  startTime = null;
});

function endGame() {
  const totalTime = Date.now() - startTime;
  ghostStatus.textContent = "Finished!";
  successSound.play();

  const previous = JSON.parse(localStorage.getItem("ghostData") || "null");
  if (!previous || totalTime < previous.time) {
    localStorage.setItem("ghostData", JSON.stringify({ time: totalTime }));
    ghostStatus.textContent = "🏆 New Record!";
  }

  ghostData = JSON.parse(localStorage.getItem("ghostData"));
  setTimeout(startGame, 3000);
}

window.addEventListener("load", () => {
  ghostData = JSON.parse(localStorage.getItem("ghostData"));
  startGame();
});
