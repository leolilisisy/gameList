const symbols = ["🔴","🟢","🔵","🟡","🟣"];
const sequenceLine = document.getElementById("sequence-line");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");
const message = document.getElementById("message");
const levelDisplay = document.getElementById("level-display");

let sequence = [];
let userSequence = [];
let level = 1;
let playing = false;
let paused = false;
let speed = 1000;
let symbolSounds = {
  "🔴":"https://freesound.org/data/previews/273/273146_5121236-lq.mp3",
  "🟢":"https://freesound.org/data/previews/273/273144_5121236-lq.mp3",
  "🔵":"https://freesound.org/data/previews/273/273147_5121236-lq.mp3",
  "🟡":"https://freesound.org/data/previews/273/273148_5121236-lq.mp3",
  "🟣":"https://freesound.org/data/previews/273/273149_5121236-lq.mp3"
};

let playTimeout;

function playSound(symbol) {
  const audio = new Audio(symbolSounds[symbol]);
  audio.play();
}

function showSequence() {
  sequenceLine.innerHTML = "";
  sequence.forEach((sym, index) => {
    const span = document.createElement("div");
    span.className = "symbol";
    span.textContent = sym;
    sequenceLine.appendChild(span);
    setTimeout(() => {
      if(!paused){
        span.classList.add("glow");
        playSound(sym);
        setTimeout(() => span.classList.remove("glow"), speed/2);
      }
    }, index * speed);
  });
  setTimeout(() => {
    enableUserInput();
  }, sequence.length * speed);
}

function enableUserInput() {
  userSequence = [];
  sequenceLine.querySelectorAll(".symbol").forEach((symDiv, index) => {
    symDiv.addEventListener("click", handleUserClick);
  });
}

function handleUserClick(e) {
  if(!playing || paused) return;
  const clicked = e.currentTarget.textContent;
  playSound(clicked);
  userSequence.push(clicked);
  const currentIndex = userSequence.length - 1;
  if(userSequence[currentIndex] !== sequence[currentIndex]) {
    message.textContent = "❌ Wrong! Game Over.";
    playing = false;
    return;
  }
  if(userSequence.length === sequence.length) {
    message.textContent = "✅ Correct!";
    nextLevel();
  }
}

function nextLevel() {
  level++;
  levelDisplay.textContent = `Level: ${level}`;
  sequence.push(symbols[Math.floor(Math.random()*symbols.length)]);
  speed = Math.max(400, 1000 - level*50); // increase speed
  setTimeout(showSequence, 1000);
}

function startGame() {
  sequence = [];
  level = 1;
  playing = true;
  paused = false;
  message.textContent = "";
  levelDisplay.textContent = `Level: ${level}`;
  sequence.push(symbols[Math.floor(Math.random()*symbols.length)]);
  showSequence();
}

function pauseGame() {
  paused = true;
  clearTimeout(playTimeout);
  message.textContent = "⏸ Paused";
}

function resumeGame() {
  if(!paused) return;
  paused = false;
  message.textContent = "";
  showSequence();
}

function restartGame() {
  paused = false;
  playing = false;
  startGame();
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
resumeBtn.addEventListener("click", resumeGame);
restartBtn.addEventListener("click", restartGame);
