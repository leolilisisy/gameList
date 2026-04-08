const canvas = document.getElementById("bridgeCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

const bgMusic = document.getElementById("bgMusic");
const connectSound = document.getElementById("connectSound");
const winSound = document.getElementById("winSound");

let islands = [
  { x: 100, y: 150, connected: [] },
  { x: 700, y: 150, connected: [] },
  { x: 200, y: 400, connected: [] },
  { x: 600, y: 400, connected: [] },
];
let obstacles = [
  { x: 350, y: 250, r: 50 },
];
let bridges = [];
let isPaused = false;
let selectedIsland = null;

function drawIsland(island) {
  ctx.beginPath();
  ctx.arc(island.x, island.y, 25, 0, Math.PI * 2);
  ctx.fillStyle = "#fffb96";
  ctx.fill();
  ctx.strokeStyle = "#ffea00";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.shadowColor = "#ffff88";
  ctx.shadowBlur = 20;
  ctx.closePath();
}

function drawObstacle(obs) {
  ctx.beginPath();
  ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,0,0,0.3)";
  ctx.fill();
  ctx.strokeStyle = "#ff0000";
  ctx.stroke();
  ctx.closePath();
}

function drawBridge(a, b) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 4;
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 15;
  ctx.stroke();
  ctx.closePath();
}

function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  obstacles.forEach(drawObstacle);
  bridges.forEach(([a, b]) => drawBridge(a, b));
  islands.forEach(drawIsland);
}

function isLineCrossObstacle(a, b, obs) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const fx = a.x - obs.x;
  const fy = a.y - obs.y;
  const a1 = dx * dx + dy * dy;
  const b1 = 2 * (fx * dx + fy * dy);
  const c1 = (fx * fx + fy * fy) - obs.r * obs.r;
  const discriminant = b1 * b1 - 4 * a1 * c1;
  return discriminant >= 0;
}

function checkWin() {
  let connected = new Set();
  function dfs(i) {
    connected.add(i);
    islands[i].connected.forEach(j => {
      if (!connected.has(j)) dfs(j);
    });
  }
  dfs(0);
  if (connected.size === islands.length) {
    document.getElementById("message").textContent = "🎉 All islands connected!";
    winSound.play();
  }
}

canvas.addEventListener("click", (e) => {
  if (isPaused) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const clicked = islands.find(i => Math.hypot(i.x - x, i.y - y) < 25);

  if (clicked) {
    if (!selectedIsland) {
      selectedIsland = clicked;
    } else if (selectedIsland !== clicked) {
      // Check for obstacle collision
      if (!obstacles.some(obs => isLineCrossObstacle(selectedIsland, clicked, obs))) {
        bridges.push([selectedIsland, clicked]);
        selectedIsland.connected.push(islands.indexOf(clicked));
        clicked.connected.push(islands.indexOf(selectedIsland));
        connectSound.play();
        checkWin();
      } else {
        document.getElementById("message").textContent = "🚫 Bridge blocked by obstacle!";
      }
      selectedIsland = null;
    }
  }
  drawAll();
});

document.getElementById("startBtn").addEventListener("click", () => {
  bgMusic.play();
  document.getElementById("message").textContent = "🎮 Game Started!";
  drawAll();
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  isPaused = !isPaused;
  document.getElementById("pauseBtn").textContent = isPaused ? "▶ Resume" : "⏸ Pause";
  document.getElementById("message").textContent = isPaused ? "⏸ Game Paused" : "🎮 Game Resumed";
});

document.getElementById("restartBtn").addEventListener("click", () => {
  bridges = [];
  islands.forEach(i => (i.connected = []));
  drawAll();
  document.getElementById("message").textContent = "🔁 Game Restarted!";
});

drawAll();
