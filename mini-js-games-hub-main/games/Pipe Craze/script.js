const grid = document.getElementById("grid");
const restartBtn = document.getElementById("restart");
const statusEl = document.getElementById("status");
const timerEl = document.getElementById("timer");

let timer;
let timeLeft = 60;
let gridSize = 5;
let cells = [];

// Pipe image set
const pipeImages = [
  "url('https://i.imgur.com/pQz1w6O.png')", // straight
  "url('https://i.imgur.com/LMHwtC4.png')", // corner
  "url('https://i.imgur.com/7G7AmDQ.png')", // T junction
  "url('https://i.imgur.com/NhJxPlq.png')"  // cross
];

// Initialize game
function initGame() {
  grid.innerHTML = "";
  cells = [];
  statusEl.textContent = "Connect the flow!";
  timeLeft = 60;
  timerEl.textContent = timeLeft;
  clearInterval(timer);
  timer = setInterval(countdown, 1000);

  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    const pipe = document.createElement("div");
    pipe.classList.add("pipe");
    pipe.style.backgroundImage = pipeImages[Math.floor(Math.random() * pipeImages.length)];
    pipe.style.transform = `rotate(${Math.floor(Math.random() * 4) * 90}deg)`;

    cell.appendChild(pipe);
    grid.appendChild(cell);

    cell.addEventListener("click", () => rotatePipe(pipe));
    cells.push(pipe);
  }
}

function rotatePipe(pipe) {
  let rotation = parseInt(pipe.getAttribute("data-rotation") || "0");
  rotation = (rotation + 90) % 360;
  pipe.style.transform = `rotate(${rotation}deg)`;
  pipe.setAttribute("data-rotation", rotation);
}

// Timer countdown
function countdown() {
  timeLeft--;
  timerEl.textContent = timeLeft;
  if (timeLeft <= 0) {
    clearInterval(timer);
    statusEl.textContent = "⏳ Time's up! Try again!";
  }
}

// Restart game
restartBtn.addEventListener("click", initGame);

// Start initially
initGame();
