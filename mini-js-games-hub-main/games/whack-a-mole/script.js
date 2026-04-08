const startButton = document.getElementById("start-button");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const statusDisplay = document.getElementById("status");
const holes = Array.from(document.querySelectorAll(".hole"));

let score = 0;
let timeLeft = 30;
let playing = false;
let activeIndex = -1;
let moleTimeout;
let countdownInterval;

startButton.addEventListener("click", startGame);
holes.forEach((hole) => hole.addEventListener("click", handleHit));

function startGame() {
  if (playing) return;

  playing = true;
  score = 0;
  timeLeft = 30;
  updateScore();
  updateTimer();
  statusDisplay.textContent = "Go! Whack as many moles as you can.";

  startButton.disabled = true;
  spawnMole();

  countdownInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimer();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function spawnMole() {
  if (!playing) return;

  clearActiveHole();

  const available = holes.filter((_, index) => index !== activeIndex);
  const nextHole = available[Math.floor(Math.random() * available.length)];
  activeIndex = Number(nextHole.dataset.hole);
  nextHole.classList.add("active");

  // Speed up slightly as the player scores more hits.
  const speed = Math.max(450, 900 - score * 25);
  moleTimeout = setTimeout(spawnMole, speed);
}

function handleHit(event) {
  if (!playing) return;

  const hole = event.currentTarget;
  const index = Number(hole.dataset.hole);

  if (index !== activeIndex) return;

  score += 1;
  updateScore();

  hole.classList.add("hit");
  setTimeout(() => hole.classList.remove("hit"), 200);

  statusDisplay.textContent = "Nice hit!";

  clearTimeout(moleTimeout);
  spawnMole();
}

function endGame() {
  playing = false;
  startButton.disabled = false;

  clearInterval(countdownInterval);
  clearTimeout(moleTimeout);
  clearActiveHole();

  timerDisplay.textContent = "⏱️ Time: 0";
  statusDisplay.textContent = `Time's up! Final score: ${score}.`;
}

function clearActiveHole() {
  if (activeIndex === -1) return;
  holes[activeIndex].classList.remove("active");
  activeIndex = -1;
}

function updateScore() {
  scoreDisplay.textContent = `🏆 Score: ${score}`;
}

function updateTimer() {
  const displayTime = Math.max(timeLeft, 0);
  timerDisplay.textContent = `⏱️ Time: ${displayTime}`;
}

// Ensure the board is cleared if the player leaves mid-game.
window.addEventListener("blur", () => {
  if (!playing) return;
  endGame();
  statusDisplay.textContent = "Game paused because the window lost focus.";
});
