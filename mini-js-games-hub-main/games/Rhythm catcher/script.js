const tracks = document.querySelectorAll(".track");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");

let score = 0;
let level = 1;
let gameInterval;
let noteSpeed = 3000; // fall duration in ms
let spawnRate = 1200; // ms between notes
let isPlaying = false;

startBtn.addEventListener("click", startGame);
retryBtn.addEventListener("click", restartGame);
document.addEventListener("keydown", handleKey);

function startGame() {
  if (isPlaying) return;
  isPlaying = true;
  statusEl.textContent = "Catch the rhythm!";
  startBtn.disabled = true;
  retryBtn.disabled = true;
  gameLoop();
}

function restartGame() {
  score = 0;
  level = 1;
  scoreEl.textContent = score;
  levelEl.textContent = level;
  noteSpeed = 3000;
  spawnRate = 1200;
  isPlaying = true;
  statusEl.textContent = "Catch the rhythm!";
  retryBtn.disabled = true;
  gameLoop();
}

function gameLoop() {
  gameInterval = setInterval(() => {
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    spawnNote(randomTrack);
  }, spawnRate);
}

function spawnNote(track) {
  const note = document.createElement("div");
  note.classList.add("note");
  note.style.animationDuration = `${noteSpeed}ms`;
  track.appendChild(note);

  const fallTimer = setTimeout(() => {
    if (track.contains(note)) {
      note.remove();
      track.classList.add("miss");
      setTimeout(() => track.classList.remove("miss"), 200);
      losePoints();
    }
  }, noteSpeed);
}

function handleKey(e) {
  if (!isPlaying) return;

  const key = e.key.toUpperCase();
  const track = [...tracks].find(t => t.dataset.key === key);
  if (!track) return;

  track.classList.add("flash");
  setTimeout(() => track.classList.remove("flash"), 200);

  const note = [...track.querySelectorAll(".note")].find(n => {
    const rect = n.getBoundingClientRect();
    return rect.bottom > 450 && rect.bottom < 520;
  });

  if (note) {
    note.remove();
    gainPoints();
  }
}

function gainPoints() {
  score += 10;
  scoreEl.textContent = score;

  if (score % 100 === 0) {
    level++;
    levelEl.textContent = level;
    noteSpeed = Math.max(1000, noteSpeed - 300);
    spawnRate = Math.max(700, spawnRate - 100);
    clearInterval(gameInterval);
    gameLoop();
    statusEl.textContent = "🎵 Level Up!";
  }
}

function losePoints() {
  score = Math.max(0, score - 5);
  scoreEl.textContent = score;

  if (score === 0 && level === 1) {
    endGame();
  }
}

function endGame() {
  clearInterval(gameInterval);
  isPlaying = false;
  statusEl.textContent = "❌ Missed too many beats! Game Over.";
  retryBtn.disabled = false;
  startBtn.disabled = false;
}
