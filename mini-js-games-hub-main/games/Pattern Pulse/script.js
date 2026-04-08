const pads = document.querySelectorAll(".pad");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const message = document.getElementById("message");
const scoreEl = document.getElementById("score");

let sequence = [];
let userSequence = [];
let score = 0;
let round = 0;
let active = false;

// Play tone for a specific frequency
function playSound(freq) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = "sine";
  oscillator.frequency.value = freq;
  oscillator.start();
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.2);
}

// Flash effect
function flashPad(pad) {
  pad.classList.add("active");
  playSound(pad.dataset.sound);
  setTimeout(() => pad.classList.remove("active"), 300);
}

// Generate a new step in the pattern
function addToSequence() {
  const randomPad = pads[Math.floor(Math.random() * pads.length)];
  sequence.push(randomPad);
}

// Play full pattern sequence
function playSequence() {
  let delay = 600;
  sequence.forEach((pad, i) => {
    setTimeout(() => flashPad(pad), i * delay);
  });
}

// Start the game
function startGame() {
  sequence = [];
  userSequence = [];
  score = 0;
  round = 0;
  active = true;
  startBtn.disabled = true;
  restartBtn.disabled = false;
  message.textContent = "Watch carefully...";
  nextRound();
}

// Next round
function nextRound() {
  userSequence = [];
  addToSequence();
  round++;
  message.textContent = `Round ${round}`;
  playSequence();
}

// Check user input
function handleUserInput(pad) {
  if (!active) return;
  const index = userSequence.length;
  userSequence.push(pad);
  flashPad(pad);

  if (pad !== sequence[index]) {
    message.textContent = "❌ Wrong pattern! Game Over!";
    active = false;
    startBtn.disabled = false;
    restartBtn.disabled = true;
    return;
  }

  if (userSequence.length === sequence.length) {
    score++;
    scoreEl.textContent = score;
    setTimeout(nextRound, 1000);
  }
}

// Restart the game
function restartGame() {
  startGame();
}

// Event listeners
pads.forEach(pad => pad.addEventListener("click", () => handleUserInput(pad)));
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
