const startButton = document.getElementById("start-button");
const pad = document.getElementById("reaction-pad");
const prompt = document.getElementById("prompt");
const currentDisplay = document.getElementById("current");
const bestDisplay = document.getElementById("best");
const historyList = document.getElementById("history-list");

let state = "idle"; // idle | waiting | ready
let readyTimeout;
let startTime = 0;
let bestTime = Infinity;
const recentTimes = [];

startButton.addEventListener("click", beginRound);
pad.addEventListener("click", handlePadClick);

function beginRound() {
  if (state !== "idle") return;

  state = "waiting";
  prompt.textContent = "Wait for green...";
  pad.classList.remove("ready");
  pad.classList.add("waiting");
  startButton.disabled = true;

  const delay = 1200 + Math.random() * 1800;
  readyTimeout = setTimeout(() => {
    state = "ready";
    startTime = performance.now();

    pad.classList.remove("waiting");
    pad.classList.add("ready");
    prompt.textContent = "Tap! Tap! Tap!";
  }, delay);
}

function handlePadClick() {
  if (state === "idle") return;

  if (state === "waiting") {
    // False start penalty encourages patience.
    registerResult(0, true);
    return;
  }

  if (state === "ready") {
    const reaction = Math.max(0, Math.round(performance.now() - startTime));
    registerResult(reaction, false);
  }
}

function registerResult(time, isPenalty) {
  clearTimeout(readyTimeout);
  state = "idle";
  startButton.disabled = false;
  pad.classList.remove("waiting", "ready");

  const displayTime = isPenalty ? time + 250 : time;
  const message = isPenalty ? `False start! +250 ms penalty (Total: ${displayTime} ms)` : `Your reaction: ${displayTime} ms`;
  prompt.textContent = message;

  currentDisplay.textContent = `Current: ${displayTime} ms`;

  if (!isPenalty && displayTime < bestTime) {
    bestTime = displayTime;
    bestDisplay.textContent = `Best: ${bestTime} ms`;
  }

  if (isPenalty && bestTime === Infinity) {
    bestDisplay.textContent = "Best: --";
  }

  recentTimes.unshift(isPenalty ? `False start (${displayTime} ms)` : `${displayTime} ms`);
  if (recentTimes.length > 5) recentTimes.pop();
  renderHistory();

  pad.classList.remove("false-start");
  if (isPenalty) {
    pad.classList.add("false-start");
    setTimeout(() => pad.classList.remove("false-start"), 600);
  }
}

function renderHistory() {
  historyList.innerHTML = "";
  recentTimes.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    historyList.appendChild(item);
  });
}

window.addEventListener("blur", () => {
  if (state === "waiting") {
    clearTimeout(readyTimeout);
    state = "idle";
    startButton.disabled = false;
    pad.classList.remove("waiting");
    prompt.textContent = "Paused because the window lost focus.";
  }
});
