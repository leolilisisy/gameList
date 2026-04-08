const grid = document.getElementById("puzzle-grid");
const levelEl = document.getElementById("level");
const timerEl = document.getElementById("timer");
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restart-btn");

let level = 1;
let timer = 0;
let timerInterval;
let gridSize = 3;
let colors = [];
let correctSequence = [];

function generateColors(n) {
  const palette = [];
  for(let i=0;i<n;i++){
    const color = `hsl(${Math.floor(Math.random()*360)}, 80%, 60%)`;
    palette.push(color);
  }
  return palette;
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function startTimer() {
  clearInterval(timerInterval);
  timer = 0;
  timerEl.textContent = timer + "s";
  timerInterval = setInterval(()=>{
    timer++;
    timerEl.textContent = timer + "s";
  }, 1000);
}

function renderGrid() {
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 60px)`;

  const shuffled = shuffleArray([...colors]);
  shuffled.forEach((color, idx) => {
    const cell = document.createElement("div");
    cell.style.backgroundColor = color;
    cell.dataset.color = color;
    cell.addEventListener("click", ()=>handleClick(idx));
    grid.appendChild(cell);
  });
}

function handleClick(idx) {
  const selected = grid.children[idx];
  const expectedColor = correctSequence[0];
  if(selected.dataset.color === expectedColor){
    selected.classList.add("correct");
    correctSequence.shift();
    if(correctSequence.length === 0){
      levelUp();
    }
  } else {
    messageEl.textContent = "❌ Wrong! Try Again.";
    setTimeout(()=>messageEl.textContent="", 1000);
  }
}

function levelUp() {
  clearInterval(timerInterval);
  messageEl.textContent = `🎉 Level ${level} Completed in ${timer}s!`;
  level++;
  gridSize = Math.min(6, 2 + level); // max 6x6
  startGame();
}

function startGame() {
  levelEl.textContent = level;
  colors = generateColors(gridSize*gridSize);
  correctSequence = [...colors];
  renderGrid();
  startTimer();
  messageEl.textContent = "";
}

restartBtn.addEventListener("click", ()=>{
  level = 1;
  gridSize = 3;
  startGame();
});

// Initial game start
startGame();
