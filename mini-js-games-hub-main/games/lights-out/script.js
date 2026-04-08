const gridEl = document.getElementById("grid");
const movesEl = document.getElementById("moves");
const timerEl = document.getElementById("timer");
const soundToggle = document.getElementById("soundToggle");
const modal = document.getElementById("winModal");
const clickSound = document.getElementById("clickSound");

let grid = [];
let moves = 0;
let timer = 0;
let interval;
let gridSize = 5;

function startTimer() {
  clearInterval(interval);
  interval = setInterval(() => {
    timer++;
    let m = String(Math.floor(timer / 60)).padStart(2, '0');
    let s = String(timer % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  }, 1000);
}

function resetStats() {
  moves = 0;
  timer = 0;
  movesEl.textContent = 0;
  timerEl.textContent = "00:00";
}

function generateGrid(size) {
  gridSize = size;
  gridEl.style.gridTemplateColumns = `repeat(${size}, 55px)`;

  grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );

  render();
  shuffle();
  resetStats();
  startTimer();
}

function render() {
  gridEl.innerHTML = "";

  grid.forEach((row, r) => {
    row.forEach((cell, c) => {
      const div = document.createElement("div");
      div.className = `cell ${cell ? "on" : "off"}`;
      div.addEventListener("click", () => toggleCell(r, c));
      gridEl.append(div);
    });
  });
}

function playSound() {
  if (soundToggle.checked) clickSound.play();
}

function toggleCell(r, c) {
  playSound();
  moves++;
  movesEl.textContent = moves;

  const dirs = [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  dirs.forEach(([dr, dc]) => {
    let nr = r + dr;
    let nc = c + dc;
    if (grid[nr] && grid[nr][nc] !== undefined)
      grid[nr][nc] = !grid[nr][nc];
  });

  render();
  checkWin();
}

function shuffle() {
  for (let i = 0; i < gridSize ** 2; i++) {
    toggleCell(Math.floor(Math.random() * gridSize), Math.floor(Math.random() * gridSize));
  }
  moves = 0;
}

function checkWin() {
  if (grid.every(row => row.every(cell => !cell))) {
    clearInterval(interval);
    document.getElementById("finalMoves").textContent = moves + " moves";
    document.getElementById("finalTime").textContent = timerEl.textContent;
    modal.classList.remove("hidden");
  }
}

window.closeModal = function () {
  modal.classList.add("hidden");
  generateGrid(gridSize);
}

document.getElementById("shuffleBtn").onclick = shuffle;
document.getElementById("resetBtn").onclick = () => generateGrid(gridSize);
document.getElementById("newGameBtn").onclick = () => generateGrid(gridSize);

document.getElementById("grid-size").onchange = (e) => generateGrid(+e.target.value);

document.getElementById("customSizeBtn").onclick = () => {
  const n = +document.getElementById("customSizeInput").value;
  if (n >= 2 && n <= 12) generateGrid(n);
};

generateGrid(5);  // Default
