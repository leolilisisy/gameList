/* Color Switch Maze — script.js
   Designed for: games/color-switch-maze/index.html
   Notes:
   - Levels are defined in `levels` array.
   - Node object: { id, x, y, type } types: 'red'|'green'|'blue'|'pad'|'exit'|'blocked'
   - Edges: connect node ids.
   - Player can move along edges only if destination is allowed by color rules.
*/

/* ---------- Configuration & assets ---------- */
// Online sound assets (public)
const SOUNDS = {
  move: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
  pad: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg",
  win: "https://actions.google.com/sounds/v1/cartoon/clang.ogg",
  error: "https://actions.google.com/sounds/v1/cartoon/descending_whistle.ogg",
  bg: "https://actions.google.com/sounds/v1/ambiences/underwater_bubbles.ogg"
};

const COLORS = {
  red: "#ff6b6b",
  green: "#4ade80",
  blue: "#7dd3fc",
  pad: "#ffd166",
  exit: "#a3e635",
  blocked: "#333"
};

// Level metadata: nodes with normalized coordinates (0..1), edges between node ids
const levels = [
  // Level 1 — Beginner
  {
    name: "Beginner",
    nodes: [
      { id: "A", x: 0.12, y: 0.22, type: "red" },
      { id: "B", x: 0.36, y: 0.2, type: "pad", padColor: "green" },
      { id: "C", x: 0.6, y: 0.18, type: "red" },
      { id: "D", x: 0.82, y: 0.22, type: "exit" },

      { id: "E", x: 0.18, y: 0.45, type: "red" },
      { id: "F", x: 0.36, y: 0.45, type: "green" },
      { id: "G", x: 0.54, y: 0.45, type: "blue" },
      { id: "H", x: 0.72, y: 0.45, type: "pad", padColor: "blue" },

      { id: "I", x: 0.12, y: 0.72, type: "pad", padColor: "red" },
      { id: "J", x: 0.36, y: 0.72, type: "red" },
      { id: "K", x: 0.6, y: 0.72, type: "green" },
      { id: "L", x: 0.82, y: 0.72, type: "blocked" },
    ],
    edges: [
      ["A","B"],["B","C"],["C","D"],
      ["A","E"],["B","F"],["C","G"],["D","H"],
      ["E","F"],["F","G"],["G","H"],
      ["E","I"],["F","J"],["G","K"],["H","L"],
      ["I","J"],["J","K"],["K","L"]
    ],
    startNode: "A"
  },

  // Level 2 — Advanced
  {
    name: "Advanced",
    nodes: [
      { id:"A", x:0.08, y:0.12, type:"red"},
      { id:"B", x:0.28, y:0.14, type:"pad", padColor:"blue"},
      { id:"C", x:0.5, y:0.12, type:"blue"},
      { id:"D", x:0.72, y:0.12, type:"green"},
      { id:"E", x:0.9, y:0.12, type:"exit"},

      { id:"F", x:0.18, y:0.32, type:"red"},
      { id:"G", x:0.42, y:0.34, type:"blocked"},
      { id:"H", x:0.6, y:0.32, type:"pad", padColor:"green"},
      { id:"I", x:0.78, y:0.32, type:"blue"},

      { id:"J", x:0.06, y:0.56, type:"pad", padColor:"green"},
      { id:"K", x:0.28, y:0.54, type:"green"},
      { id:"L", x:0.5, y:0.56, type:"red"},
      { id:"M", x:0.72, y:0.56, type:"blue"},
      { id:"N", x:0.92, y:0.56, type:"pad", padColor:"red"},

      { id:"O", x:0.18, y:0.8, type:"blocked"},
      { id:"P", x:0.44, y:0.78, type:"blue"},
      { id:"Q", x:0.66, y:0.78, type:"green"},
    ],
    edges: [
      ["A","B"],["B","C"],["C","D"],["D","E"],
      ["A","F"],["B","G"],["C","H"],["D","I"],["E","N"],
      ["F","G"],["G","H"],["H","I"],
      ["F","J"],["G","K"],["H","L"],["I","M"],
      ["J","K"],["K","L"],["L","M"],["M","N"],
      ["J","O"],["K","P"],["L","Q"],["P","Q"]
    ],
    startNode: "A"
  }
];

/* ---------- Canvas setup ---------- */
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
let cw = canvas.width;
let ch = canvas.height;

function resizeCanvas() {
  // preserve aspect ratio and fit container
  const wrap = canvas.parentElement;
  const rect = wrap.getBoundingClientRect();
  const ratio = cw / ch;
  let w = Math.max(320, Math.min(rect.width - 20, 1200));
  let h = Math.max(240, Math.min(rect.height - 20, 800));
  canvas.width = Math.floor(w);
  canvas.height = Math.floor(h);
}
window.addEventListener("resize", () => { resizeCanvas(); draw(); });
resizeCanvas();

/* ---------- Game state ---------- */
let currentLevelIndex = 0;
let level = null;
let nodesMap = new Map();
let adjacency = new Map();
let player = { nodeId: null, color: null, x:0, y:0, moves:0 };
let running = false;
let timer = 0, timerInterval = null;
let soundsMuted = false;
const audioCache = {};

/* ---------- DOM refs ---------- */
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const nextBtn = document.getElementById("next-btn");
const levelSel = document.getElementById("level-select");
const playerColorEl = document.getElementById("player-color");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");
const levelNameEl = document.getElementById("level-name");
const statusEl = document.getElementById("status");
const muteChk = document.getElementById("mute-sounds");

const dirUp = document.getElementById("up");
const dirLeft = document.getElementById("left");
const dirRight = document.getElementById("right");
const dirDown = document.getElementById("down");

/* ---------- Utilities ---------- */
function loadSound(url){
  if(audioCache[url]) return audioCache[url];
  try {
    const a = new Audio(url);
    a.preload = "auto";
    audioCache[url] = a;
    return a;
  } catch(e){ return null; }
}
function playSound(name){
  if(soundsMuted) return;
  const url = SOUNDS[name];
  if(!url) return;
  const a = loadSound(url);
  try { a.currentTime = 0; a.play(); } catch(e) {}
}

/* ---------- Level loader ---------- */
function setupLevel(index){
  currentLevelIndex = index;
  level = JSON.parse(JSON.stringify(levels[index])); // deep clone to allow modification
  nodesMap.clear();
  adjacency.clear();
  level.nodes.forEach(n => nodesMap.set(n.id, n));
  level.edges.forEach(([a,b]) => {
    if(!adjacency.has(a)) adjacency.set(a, new Set());
    if(!adjacency.has(b)) adjacency.set(b, new Set());
    adjacency.get(a).add(b);
    adjacency.get(b).add(a);
  });
  // init player at start
  player.nodeId = level.startNode;
  const startNode = nodesMap.get(player.nodeId);
  player.x = startNode.x; player.y = startNode.y;
  // if start is pad -> set initial color of pad's color, else set to node type if color node
  if(startNode.type === "pad") player.color = startNode.padColor || "red";
  else if(["red","green","blue"].includes(startNode.type)) player.color = startNode.type;
  else player.color = "red";
  player.moves = 0;
  timer = 0;
  updateUI();
  draw();
}

/* ---------- Game control ---------- */
function startGame(){
  if(running) return;
  running = true;
  statusEl.textContent = "Playing";
  playSound("bg");
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(()=>{ timer++; updateTime(); }, 1000);
}
function pauseGame(){
  if(!running) return;
  running = false;
  statusEl.textContent = "Paused";
  if(timerInterval) clearInterval(timerInterval);
}
function restartGame(){
  pauseGame();
  setupLevel(currentLevelIndex);
  statusEl.textContent = "Ready";
  draw();
}
function nextLevel(){
  const next = (currentLevelIndex + 1) % levels.length;
  levelSel.selectedIndex = next;
  loadSelectedLevel(next);
  startGame();
}
function loadSelectedLevel(index){
  setupLevel(index);
  levelNameEl.textContent = level.name;
  statusEl.textContent = "Ready";
  draw();
}

/* ---------- Movement rules ---------- */
function canMoveTo(nodeId){
  const n = nodesMap.get(nodeId);
  if(!n) return false;
  if(n.type === "blocked") return false;
  if(n.type === "pad" || n.type === "exit") return true;
  // color nodes: require same color
  if(["red","green","blue"].includes(n.type)){
    return (n.type === player.color);
  }
  return false;
}

function attemptMove(toNodeId){
  if(!running) return;
  if(!adjacency.get(player.nodeId).has(toNodeId)) return;
  if(!canMoveTo(toNodeId)){
    // invalid move - beep and reset optionally
    playSound("error");
    flashStatus("Mismatch! Can't step on that color.", 1200);
    return;
  }
  // progress move
  player.nodeId = toNodeId;
  player.moves += 1;
  movesEl.textContent = player.moves;
  playSound("move");
  // handle landing on pad
  const landed = nodesMap.get(toNodeId);
  if(landed.type === "pad"){
    player.color = landed.padColor || player.color;
    playSound("pad");
  }
  // if color node and matches, no change
  if(landed.type === "exit"){
    playSound("win");
    flashStatus("Level Complete! 🎉", 3000);
    running = false;
    if(timerInterval) clearInterval(timerInterval);
  }
  updateUI();
  draw();
}

/* ---------- Rendering ---------- */
function worldToPixel(nx, ny){
  const pad = 60;
  const w = canvas.width - pad*2;
  const h = canvas.height - pad*2;
  return { x: pad + nx * w, y: pad + ny * h };
}

function draw(){
  if(!level) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // background gradient
  const g = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  g.addColorStop(0,"rgba(10,16,28,0.95)");
  g.addColorStop(1,"rgba(6,12,20,0.95)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // draw edges
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  level.edges.forEach(([a,b]) => {
    const na = nodesMap.get(a), nb = nodesMap.get(b);
    const pa = worldToPixel(na.x, na.y), pb = worldToPixel(nb.x, nb.y);
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  });

  // draw nodes
  for(const n of level.nodes){
    const p = worldToPixel(n.x, n.y);
    const isPlayer = (player.nodeId === n.id);
    // outer glow
    ctx.beginPath();
    ctx.arc(p.x, p.y, 22, 0, Math.PI*2);
    const baseColor = (n.type === "pad") ? COLORS.pad : (n.type === "exit" ? COLORS.exit : (COLORS[n.type] || "#222"));
    // shadow glow
    ctx.fillStyle = baseColor;
    ctx.save();
    if(n.type !== "blocked"){
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = isPlayer ? 28 : 18;
    } else {
      ctx.shadowBlur = 2;
    }
    ctx.fill();
    ctx.restore();

    // inner circle
    ctx.beginPath();
    ctx.fillStyle = "#0b1220";
    ctx.arc(p.x, p.y, 14, 0, Math.PI*2);
    ctx.fill();

    // inner icon / color marker
    ctx.beginPath();
    if(n.type === "pad"){
      // small circle showing padColor
      const padCol = COLORS[n.padColor] || "#fff";
      ctx.fillStyle = padCol;
      ctx.arc(p.x, p.y, 8, 0, Math.PI*2);
      ctx.fill();
    } else if (n.type === "exit"){
      ctx.fillStyle = "#fff";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⏩", p.x, p.y+1);
    } else if (n.type === "blocked"){
      ctx.fillStyle = "#444";
      ctx.beginPath();
      ctx.moveTo(p.x-6,p.y-6); ctx.lineTo(p.x+6,p.y+6);
      ctx.moveTo(p.x+6,p.y-6); ctx.lineTo(p.x-6,p.y+6);
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      // colored dot marker for color nodes for accessibility
      const col = COLORS[n.type] || "#fff";
      ctx.fillStyle = col;
      ctx.arc(p.x, p.y, 7, 0, Math.PI*2);
      ctx.fill();
    }

    // highlight player node
    if(isPlayer){
      // draw player as a glowing orb slightly above
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI*2);
      const pc = COLORS[player.color] || "#fff";
      ctx.fillStyle = pc;
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.shadowBlur = 28; ctx.shadowColor = pc;
      ctx.fill();
      ctx.restore();
      // small center
      ctx.beginPath(); ctx.fillStyle = "#041014"; ctx.arc(p.x, p.y, 5,0,Math.PI*2); ctx.fill();
    }
    // node id small label
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(n.id, p.x, p.y + 26);
  }
}

/* ---------- Input handling ---------- */
function moveInDirection(dx, dy){
  // find neighbor in roughly that direction
  const cur = nodesMap.get(player.nodeId);
  let best = null, bestDot = -Infinity;
  const origin = { x: cur.x, y: cur.y };
  for(const nbId of adjacency.get(player.nodeId) || []){
    const nb = nodesMap.get(nbId);
    if(!nb) continue;
    const vx = nb.x - origin.x, vy = nb.y - origin.y;
    const len = Math.hypot(vx, vy);
    if(len === 0) continue;
    const dot = (vx*dx + vy*dy) / len; // alignment
    if(dot > bestDot){ bestDot = dot; best = nbId; }
  }
  if(best && bestDot > 0.2){
    attemptMove(best);
  } else {
    playSound("error");
    flashStatus("No connected node that direction", 900);
  }
}

window.addEventListener("keydown", (e)=>{
  if(!running) return;
  const key = e.key.toLowerCase();
  if(["arrowup","w"].includes(key) || key === "w"){ moveInDirection(0,-1); }
  if(["arrowdown","s"].includes(key) || key === "s"){ moveInDirection(0,1); }
  if(["arrowleft","a"].includes(key) || key === "a"){ moveInDirection(-1,0); }
  if(["arrowright","d"].includes(key) || key === "d"){ moveInDirection(1,0); }
});

dirUp.addEventListener("click", ()=> moveInDirection(0,-1));
dirDown.addEventListener("click", ()=> moveInDirection(0,1));
dirLeft.addEventListener("click", ()=> moveInDirection(-1,0));
dirRight.addEventListener("click", ()=> moveInDirection(1,0));

/* ---------- UI updates ---------- */
function updateUI(){
  // update player color pill
  playerColorEl.textContent = player.color.toUpperCase();
  playerColorEl.className = "color-pill " + player.color;
  movesEl.textContent = player.moves;
  updateTime();
  levelNameEl.textContent = level ? level.name : "-";
  // if currently standing on pad, highlight
  const curNode = nodesMap.get(player.nodeId);
  if(curNode && curNode.type === "pad"){ statusEl.textContent = "On Color Pad"; }
}

function updateTime(){
  const mm = String(Math.floor(timer/60)).padStart(2,"0");
  const ss = String(timer % 60).padStart(2,"0");
  timeEl.textContent = `${mm}:${ss}`;
}

function flashStatus(msg, ms=1200){
  const prev = statusEl.textContent;
  statusEl.textContent = msg;
  setTimeout(()=>{ statusEl.textContent = prev; }, ms);
}

/* ---------- Buttons ---------- */
startBtn.addEventListener("click", ()=>{ startGame(); });
pauseBtn.addEventListener("click", ()=>{ pauseGame(); });
restartBtn.addEventListener("click", ()=>{ restartGame(); });
nextBtn.addEventListener("click", ()=>{ nextLevel(); });
levelSel.addEventListener("change", (e)=>{ loadSelectedLevel(Number(e.target.value)); });
muteChk.addEventListener("change", (e)=>{ soundsMuted = e.target.checked; });

/* ---------- Init ---------- */
function init(){
  // load first level
  setupLevel(0);
  // Draw initial frame
  draw();
  // attach canvas click to move to nearest connected node if allowed (tap)
  canvas.addEventListener("click", (ev)=>{
    const rect = canvas.getBoundingClientRect();
    const cx = (ev.clientX - rect.left);
    const cy = (ev.clientY - rect.top);
    // find nearest node
    let nearest = null, nd = Infinity;
    for(const n of level.nodes){
      const p = worldToPixel(n.x,n.y);
      const d = Math.hypot(p.x-cx,p.y-cy);
      if(d < nd){ nd = d; nearest = n; }
    }
    if(!nearest) return;
    // ensure it's adjacent
    if(adjacency.get(player.nodeId).has(nearest.id)){
      attemptMove(nearest.id);
    } else {
      flashStatus("Not directly connected",800);
      playSound("error");
    }
  });

  // make canvas responsive
  resizeCanvas();
  // update UI elements
  levelSel.value = currentLevelIndex;
  levelNameEl.textContent = level.name;
  // preload sounds
  Object.values(SOUNDS).forEach(loadSound);
}

// start
init();
