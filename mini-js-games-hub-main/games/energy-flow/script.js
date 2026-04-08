const grid = document.getElementById("grid");
const message = document.getElementById("message");
const rotateSound = document.getElementById("rotateSound");
const successSound = document.getElementById("successSound");
const clickSound = document.getElementById("clickSound");

const rows = 6, cols = 6;
let isPaused = false;

// Wire types: straight, corner, cross
const wireTypes = [
  { connections: ["up", "down"], rotations: 2 },
  { connections: ["left", "right"], rotations: 2 },
  { connections: ["up", "right"], rotations: 4 },
  { connections: ["right", "down"], rotations: 4 },
  { connections: ["down", "left"], rotations: 4 },
  { connections: ["left", "up"], rotations: 4 },
];

let cells = [];
let powerCell = null;
let bulbCells = [];
let obstacles = [];

function createGrid() {
  grid.innerHTML = "";
  cells = [];

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const div = document.createElement("div");
      div.classList.add("cell");

      // Randomize cell type
      const random = Math.random();
      if (random < 0.1) {
        div.classList.add("obstacle");
      } else if (random < 0.15) {
        div.classList.add("power");
        powerCell = { r, c, element: div };
      } else if (random < 0.25) {
        div.classList.add("bulb");
        bulbCells.push({ r, c, element: div });
      } else {
        const type = Math.floor(Math.random() * wireTypes.length);
        div.dataset.type = type;
        div.dataset.rotation = 0;
        div.addEventListener("click", () => rotateWire(div));
        drawWire(div, type, 0);
      }

      grid.appendChild(div);
      row.push(div);
    }
    cells.push(row);
  }
}

function drawWire(div, type, rotation) {
  div.innerHTML = "";
  const wire = document.createElement("div");
  wire.className = "wire";
  wire.style.width = "100%";
  wire.style.height = "100%";
  wire.style.transform = `rotate(${rotation * 90}deg)`;
  div.appendChild(wire);
}

function rotateWire(div) {
  if (isPaused) return;
  const type = parseInt(div.dataset.type);
  let rotation = parseInt(div.dataset.rotation);
  rotation = (rotation + 1) % wireTypes[type].rotations;
  div.dataset.rotation = rotation;
  drawWire(div, type, rotation);
  rotateSound.play();
  checkConnections();
}

function checkConnections() {
  if (!powerCell) return;
  let connected = 0;
  bulbCells.forEach(bulb => {
    if (Math.random() > 0.5) {
      bulb.element.classList.add("glow");
      connected++;
    } else {
      bulb.element.classList.remove("glow");
    }
  });

  if (connected === bulbCells.length) {
    message.textContent = "⚡ All bulbs are lit! You win!";
    successSound.play();
  } else {
    message.textContent = `Connected ${connected}/${bulbCells.length} bulbs`;
  }
}

document.getElementById("startBtn").addEventListener("click", () => {
  clickSound.play();
  message.textContent = "Game started! Rotate wires to connect power!";
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  isPaused = !isPaused;
  clickSound.play();
  message.textContent = isPaused ? "⏸️ Game paused." : "▶️ Game resumed.";
});

document.getElementById("restartBtn").addEventListener("click", () => {
  clickSound.play();
  bulbCells = [];
  powerCell = null;
  createGrid();
  message.textContent = "Game restarted!";
});

createGrid();
