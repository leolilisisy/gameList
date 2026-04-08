const startButton = document.getElementById("start-button");
const pad = document.getElementById("reaction-pad");
const prompt = document.getElementById("prompt");
const currentDisplay = document.getElementById("current");
const bestDisplay = document.getElementById("best");
const historyList = document.getElementById("history-list");
const i18n = window.SiteI18n;

let state = "idle"; // idle | waiting | ready
let readyTimeout;
let startTime = 0;
let bestTime = Infinity;
const recentTimes = [];

startButton.addEventListener("click", beginRound);
pad.addEventListener("click", handlePadClick);

function formatTime(value) {
  return `${value} ms`;
}

function updateStatDisplays(currentValue = null) {
  const currentText =
    currentValue === null ? i18n.t("gameReaction.notAvailable") : formatTime(currentValue);
  const bestText =
    bestTime === Infinity ? i18n.t("gameReaction.notAvailable") : formatTime(bestTime);

  currentDisplay.textContent = i18n.t("gameReaction.current", { value: currentText });
  bestDisplay.textContent = i18n.t("gameReaction.best", { value: bestText });
}

function beginRound() {
  if (state !== "idle") return;

  state = "waiting";
  prompt.textContent = i18n.t("gameReaction.waitGreen");
  pad.classList.remove("ready");
  pad.classList.add("waiting");
  startButton.disabled = true;

  const delay = 1200 + Math.random() * 1800;
  readyTimeout = setTimeout(() => {
    state = "ready";
    startTime = performance.now();

    pad.classList.remove("waiting");
    pad.classList.add("ready");
    prompt.textContent = i18n.t("gameReaction.tapNow");
  }, delay);
}

function handlePadClick() {
  if (state === "idle") return;

  if (state === "waiting") {
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
  const timeText = formatTime(displayTime);

  prompt.textContent = isPenalty
    ? i18n.t("gameReaction.falseStart", { value: timeText })
    : i18n.t("gameReaction.reactionResult", { value: timeText });

  if (!isPenalty && displayTime < bestTime) {
    bestTime = displayTime;
  }

  updateStatDisplays(displayTime);

  recentTimes.unshift({ value: displayTime, isPenalty });
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
    item.textContent = entry.isPenalty
      ? i18n.t("gameReaction.falseStart", { value: formatTime(entry.value) })
      : i18n.t("gameReaction.reactionResult", { value: formatTime(entry.value) });
    historyList.appendChild(item);
  });
}

window.addEventListener("blur", () => {
  if (state === "waiting") {
    clearTimeout(readyTimeout);
    state = "idle";
    startButton.disabled = false;
    pad.classList.remove("waiting");
    prompt.textContent = i18n.t("gameReaction.paused");
  }
});

window.addEventListener("site-language-change", () => {
  updateStatDisplays();
  renderHistory();
  if (state === "idle" && recentTimes.length === 0) {
    prompt.textContent = i18n.t("gameReaction.placeholder");
  }
});

updateStatDisplays();
