const bulbLine = document.getElementById("bulb-line");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");
const scoreEl = document.getElementById("score");
const messageEl = document.getElementById("message");

const popSound = document.getElementById("pop-sound");
const bgMusic = document.getElementById("bg-music");

const TOTAL_BULBS = 20;
let bulbs = [];
let chainInterval = null;
let isPaused = false;
let currentIndex = 0;
let score = 0;

// Create bulbs
function createBulbs() {
  bulbLine.innerHTML = "";
  bulbs = [];
  for (let i = 0; i < TOTAL_BULBS; i++) {
    const bulb = document.createElement("div");
    bulb.classList.add("bulb");
    bulbLine.appendChild(bulb);
    bulbs.push(bulb);
  }
}

// Chain animation
function startChain() {
  bgMusic.play();
  messageEl.textContent = "";
  chainInterval = setInterval(() => {
    if (isPaused) return;
    if (currentIndex >= bulbs.length) {
      clearInterval(chainInterval);
      messageEl.textContent = "Chain Finished!";
      return;
    }
    bulbs[currentIndex].classList.add("active");
    popSound.play();
    score++;
    scoreEl.textContent = `Score: ${score}`;
    currentIndex++;
  }, 300);
}

function pauseChain() {
  isPaused = true;
}

function resumeChain() {
  if (!chainInterval) return startChain();
  isPaused = false;
}

function restartChain() {
  clearInterval(chainInterval);
  bulbs.forEach(b => b.classList.remove("active"));
  currentIndex = 0;
  score = 0;
  scoreEl.textContent = `Score: ${score}`;
  messageEl.textContent = "";
  isPaused = false;
  startChain();
}

// Event listeners
startBtn.addEventListener("click", () => {
  createBulbs();
  restartChain();
});

pauseBtn.addEventListener("click", pauseChain);
resumeBtn.addEventListener("click", resumeChain);
restartBtn.addEventListener("click", restartChain);

// Initial setup
createBulbs();
scoreEl.textContent = `Score: ${score}`;
