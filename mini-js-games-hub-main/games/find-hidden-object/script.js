let level = 1;
let timer = 60;
let score = 0;
let items = [];
let foundCount = 0;
let hintUsed = false;
let timerInterval;

const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const itemListEl = document.getElementById("item-list");
const sceneCanvas = document.getElementById("scene-canvas");
const ctx = sceneCanvas.getContext("2d");

const overlay = document.getElementById("game-over");
const resultTitle = document.getElementById("result-title");
const resultText = document.getElementById("result-text");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const hintBtn = document.getElementById("hint-btn");

async function loadLevel(levelNumber) {
  const res = await fetch(`levels/level${levelNumber}.json`);
  items = await res.json();

  const img = document.getElementById("scene-img");
  img.onload = () => {
    sceneCanvas.width = img.clientWidth;
    sceneCanvas.height = img.clientHeight;
  };

  renderItemList();
  resetTimer();
}

function renderItemList() {
  itemListEl.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.name;
    li.dataset.id = item.id;
    itemListEl.appendChild(li);
  });
}

function resetTimer() {
  clearInterval(timerInterval);
  timer = 60;
  timerEl.textContent = timer;
  timerInterval = setInterval(() => {
    timer--;
    timerEl.textContent = timer;
    if (timer <= 0) endGame(false);
  }, 1000);
}

sceneCanvas.addEventListener("click", (e) => {
  const rect = sceneCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  items.forEach((item) => {
    if (!item.found && x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height) {
      item.found = true;
      score += 100;
      foundCount++;
      scoreEl.textContent = score;
      markItemFound(item.id);
      flashArea(item.x, item.y, item.width, item.height);
      if (foundCount === items.length) endGame(true);
    }
  });
});

function markItemFound(id) {
  const li = itemListEl.querySelector(`[data-id="${id}"]`);
  if (li) li.classList.add("found");
}

function flashArea(x, y, w, h) {
  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);
  setTimeout(() => {
    ctx.clearRect(0, 0, sceneCanvas.width, sceneCanvas.height);
  }, 500);
}

function endGame(win) {
  clearInterval(timerInterval);
  overlay.classList.remove("hidden");
  if (win) {
    resultTitle.textContent = "🎉 You Found Them All!";
    resultText.textContent = `Your score: ${score}`;
    nextBtn.hidden = level >= 2;
  } else {
    resultTitle.textContent = "⏰ Time's Up!";
    resultText.textContent = `Try again to find all items.`;
    nextBtn.hidden = true;
  }
}

hintBtn.addEventListener("click", () => {
  if (hintUsed) return;
  const remaining = items.find((item) => !item.found);
  if (remaining) {
    flashArea(remaining.x, remaining.y, remaining.width, remaining.height);
    hintUsed = true;
    score -= 50;
    scoreEl.textContent = score;
  }
});

restartBtn.addEventListener("click", () => {
  location.reload();
});

nextBtn.addEventListener("click", () => {
  level++;
  levelEl.textContent = level;
  overlay.classList.add("hidden");
  foundCount = 0;
  hintUsed = false;
  loadLevel(level);
});

document.getElementById("play-again").addEventListener("click", () => location.reload());

loadLevel(level);
