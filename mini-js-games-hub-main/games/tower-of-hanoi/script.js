const pegs = [[], [], []];
let diskCount = 3;
let moveCounter = 0;
let moves = [];
let moveIndex = 0;
let animationInterval;
let speed = 500;
let selectedDisk = null;

const pegElems = [document.getElementById("peg-0"), document.getElementById("peg-1"), document.getElementById("peg-2")];
const moveCounterElem = document.getElementById("move-counter");
const optimalMovesElem = document.getElementById("optimal-moves");
const diskNumberElem = document.getElementById("disk-number");
const speedInput = document.getElementById("speed");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const resetBtn = document.getElementById("reset-btn");
const stepForwardBtn = document.getElementById("step-forward-btn");
const stepBackBtn = document.getElementById("step-back-btn");

function initGame() {
  // Clear pegs
  pegs.forEach((peg, i) => peg.length = 0);

  for (let i = diskCount; i >= 1; i--) {
    pegs[0].push(i);
  }

  moveCounter = 0;
  moves = [];
  moveIndex = 0;
  updateOptimalMoves();
  renderPegs();
}

function updateOptimalMoves() {
  optimalMovesElem.textContent = Math.pow(2, diskCount) - 1;
}

function renderPegs() {
  pegElems.forEach((pegElem, i) => {
    pegElem.querySelectorAll(".disk").forEach(d => d.remove());
    pegs[i].forEach((diskSize, index) => {
      const disk = document.createElement("div");
      disk.className = "disk";
      disk.style.width = `${20 + diskSize * 20}px`;
      disk.style.left = `${(200 - (20 + diskSize * 20)) / 2}px`;
      disk.style.bottom = `${index * 22}px`;
      disk.style.backgroundColor = `hsl(${diskSize * 50}, 70%, 50%)`;
      disk.dataset.size = diskSize;
      disk.dataset.peg = i;
      pegElem.appendChild(disk);

      disk.addEventListener("click", () => {
        if (selectedDisk === null && pegs[i][pegs[i].length-1] === diskSize) {
          selectedDisk = { size: diskSize, from: i };
          disk.style.transform = "translateY(-30px)";
        }
      });
    });
  });
}

function moveDisk(from, to) {
  if (pegs[from].length === 0) return false;
  const disk = pegs[from][pegs[from].length-1];
  if (pegs[to].length === 0 || pegs[to][pegs[to].length-1] > disk) {
    pegs[to].push(pegs[from].pop());
    moveCounter++;
    moveCounterElem.textContent = moveCounter;
    renderPegs();
    return true;
  }
  return false;
}

function recordMoves(n, from, to, aux) {
  if (n === 0) return;
  recordMoves(n - 1, from, aux, to);
  moves.push({from, to});
  recordMoves(n - 1, aux, to, from);
}

function playMoves() {
  if (moveIndex >= moves.length) {
    clearInterval(animationInterval);
    return;
  }
  const {from, to} = moves[moveIndex];
  moveDisk(from, to);
  moveIndex++;
}

startBtn.addEventListener("click", () => {
  recordMoves(diskCount, 0, 2, 1);
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  stepForwardBtn.disabled = false;
  stepBackBtn.disabled = false;
  animationInterval = setInterval(playMoves, speed);
});

pauseBtn.addEventListener("click", () => {
  clearInterval(animationInterval);
  pauseBtn.disabled = true;
  resumeBtn.disabled = false;
});

resumeBtn.addEventListener("click", () => {
  animationInterval = setInterval(playMoves, speed);
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
});

resetBtn.addEventListener("click", () => {
  clearInterval(animationInterval);
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resumeBtn.disabled = true;
  stepForwardBtn.disabled = true;
  stepBackBtn.disabled = true;
  initGame();
});

stepForwardBtn.addEventListener("click", () => {
  if (moveIndex < moves.length) {
    const {from, to} = moves[moveIndex];
    moveDisk(from, to);
    moveIndex++;
  }
});

stepBackBtn.addEventListener("click", () => {
  if (moveIndex > 0) {
    moveIndex--;
    const {from, to} = moves[moveIndex];
    // Reverse move
    pegs[from].push(pegs[to].pop());
    moveCounter--;
    moveCounterElem.textContent = moveCounter;
    renderPegs();
  }
});

diskNumberElem.textContent = diskCount;
document.getElementById("disk-count").addEventListener("input", (e) => {
  diskCount = parseInt(e.target.value);
  diskNumberElem.textContent = diskCount;
  initGame();
});

speedInput.addEventListener("input", (e) => {
  speed = parseInt(e.target.value);
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = setInterval(playMoves, speed);
  }
});

// Initialize
initGame();
