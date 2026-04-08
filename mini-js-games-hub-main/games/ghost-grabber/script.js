const gameArea = document.getElementById("game-area");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");

const popSound = document.getElementById("pop-sound");
const missSound = document.getElementById("miss-sound");

let gameInterval;
let spawnInterval = 1500;
let ghosts = [];
let score = 0;
let combo = 0;
let paused = false;

function randomPosition() {
  const x = Math.random() * (gameArea.clientWidth - 60);
  const y = Math.random() * (gameArea.clientHeight - 60);
  return { x, y };
}

function spawnGhost() {
  const ghost = document.createElement("div");
  ghost.classList.add("ghost");

  const pos = randomPosition();
  ghost.style.left = pos.x + "px";
  ghost.style.top = pos.y + "px";

  gameArea.appendChild(ghost);
  ghosts.push(ghost);

  ghost.addEventListener("click", () => {
    score += 10 + combo * 2;
    combo++;
    scoreEl.textContent = score;
    comboEl.textContent = combo;
    popSound.currentTime = 0;
    popSound.play();
    removeGhost(ghost);
  });

  setTimeout(() => {
    if (ghosts.includes(ghost)) {
      removeGhost(ghost);
      combo = 0;
      comboEl.textContent = combo;
      missSound.currentTime = 0;
      missSound.play();
    }
  }, 2500);
}

function removeGhost(ghost) {
  gameArea.removeChild(ghost);
  ghosts = ghosts.filter(g => g !== ghost);
}

function startGame() {
  if (gameInterval) clearInterval(gameInterval);
  paused = false;
  gameInterval = setInterval(() => {
    if (!paused) {
      spawnGhost();
      if (spawnInterval > 500) spawnInterval -= 10; // gradually faster
    }
  }, spawnInterval);
}

function pauseGame() {
  paused = !paused;
}

function restartGame() {
  ghosts.forEach(g => g.remove());
  ghosts = [];
  score = 0;
  combo = 0;
  scoreEl.textContent = score;
  comboEl.textContent = combo;
  spawnInterval = 1500;
  paused = false;
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", restartGame);
