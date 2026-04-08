const grid = document.getElementById("grid");
const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restart-btn");

let level = 1;
let score = 0;
let time = 10;
let timerId;

const emojiSets = [
  "🍎", "🍌", "🍇", "🍓", "🍉", "🍒", "🥝", "🥑", "🍍", "🥕",
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
  "😀","😎","😂","🥰","🤩","😇","🤓","😴","🥳","😱"
];

function generateGrid() {
  grid.innerHTML = "";
  messageEl.textContent = "";
  const gridSize = Math.min(3 + level, 8); // grid increases up to 8x8
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  
  const normalEmoji = emojiSets[Math.floor(Math.random() * emojiSets.length)];
  let oddEmoji = normalEmoji;
  while(oddEmoji === normalEmoji) {
    oddEmoji = emojiSets[Math.floor(Math.random() * emojiSets.length)];
  }
  
  const totalCells = gridSize * gridSize;
  const oddIndex = Math.floor(Math.random() * totalCells);
  
  for(let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.textContent = i === oddIndex ? oddEmoji : normalEmoji;
    cell.addEventListener("click", () => handleClick(i === oddIndex));
    grid.appendChild(cell);
  }
}

function handleClick(isCorrect) {
  if(isCorrect) {
    score += level * 10;
    level++;
    resetTimer();
    generateGrid();
  } else {
    score = Math.max(0, score - 5);
    messageEl.textContent = "❌ Wrong! Try again!";
  }
  updateStats();
}

function updateStats() {
  levelEl.textContent = level;
  scoreEl.textContent = score;
}

function resetTimer() {
  clearInterval(timerId);
  time = Math.max(5, 10 - level); // faster as level increases
  timerEl.textContent = time;
  timerId = setInterval(() => {
    time--;
    timerEl.textContent = time;
    if(time <= 0) {
      clearInterval(timerId);
      messageEl.textContent = `⏰ Time's up! Final Score: ${score}`;
      Array.from(grid.children).forEach(cell => cell.removeEventListener("click", () => {}));
    }
  }, 1000);
}

restartBtn.addEventListener("click", () => {
  level = 1;
  score = 0;
  updateStats();
  generateGrid();
  resetTimer();
});

// Start game
generateGrid();
updateStats();
resetTimer();
