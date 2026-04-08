const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const signalArea = document.getElementById("signal-area");
const signalText = document.getElementById("signal-text");
const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");
const messageEl = document.getElementById("message");

let score1 = 0;
let score2 = 0;
let gameActive = false;
let signalTimeout;
let signalVisible = false;
let reactionRecorded = false;

function randomDelay() {
  return Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
}

function startRound() {
  signalText.textContent = "Get Ready...";
  signalArea.style.backgroundColor = "#444";
  reactionRecorded = false;

  signalTimeout = setTimeout(() => {
    signalText.textContent = "GO!";
    signalArea.style.backgroundColor = "#4caf50";
    signalVisible = true;
  }, randomDelay());
}

function handleKeyPress(e) {
  if (!gameActive) return;

  if (!signalVisible && (e.key.toLowerCase() === "a" || e.key.toLowerCase() === "l")) {
    messageEl.textContent = "Too soon! Wait for the signal!";
    return;
  }

  if (signalVisible && !reactionRecorded) {
    reactionRecorded = true;
    signalVisible = false;

    if (e.key.toLowerCase() === "a") {
      score1++;
      score1El.textContent = score1;
      messageEl.textContent = "Player 1 wins this round!";
    } else if (e.key.toLowerCase() === "l") {
      score2++;
      score2El.textContent = score2;
      messageEl.textContent = "Player 2 wins this round!";
    }

    // Automatically start next round after a short delay
    setTimeout(() => {
      if (gameActive) startRound();
    }, 1500);
  }
}

startBtn.addEventListener("click", () => {
  score1 = 0;
  score2 = 0;
  score1El.textContent = score1;
  score2El.textContent = score2;
  messageEl.textContent = "";
  gameActive = true;
  startBtn.disabled = true;
  startRound();
});

resetBtn.addEventListener("click", () => {
  gameActive = false;
  clearTimeout(signalTimeout);
  signalText.textContent = "Get Ready...";
  signalArea.style.backgroundColor = "#444";
  messageEl.textContent = "";
  startBtn.disabled = false;
  score1 = 0;
  score2 = 0;
  score1El.textContent = score1;
  score2El.textContent = score2;
});

document.addEventListener("keydown", handleKeyPress);
