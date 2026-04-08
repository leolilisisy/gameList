/* Island Connector — script.js
   Drop this file in games/island-connector/script.js
   Uses Canvas, no external libs.
*/

/* ---------------------------
   Configuration & assets
   --------------------------- */
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d', { alpha: true });

const SOUND_ENABLED_DEFAULT = true;
const ASSETS = {
  click: 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg',
  success: 'https://actions.google.com/sounds/v1/cartoon/clang_and_whoosh.ogg',
  error: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
  win: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg'
};

const audio = {
  click: new Audio(ASSETS.click),
  success: new Audio(ASSETS.success),
  error: new Audio(ASSETS.error),
  win: new Audio(ASSETS.win),
};
Object.values(audio).forEach(a => { a.volume = 0.25; });

/* ---------------------------
   Utility helpers
   --------------------------- */
function distance(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx*dx + dy*dy);
}
function clamp(v, a, b) { return Math.max(a, Math.min(b,v)); }
function now() { return performance.now(); }

/* ---------------------------
   Levels definition
   Each level: islands: [{x,y,r,name}] obstacles: [{x,y,w,h}] target: connect all islands
   --------------------------- */
const LEVELS = [
  {
    name: "Beginner Bay",
    islands: [
      { id: 'A', x: 140, y: 120, r: 22 },
      { id: 'B', x: 420, y: 90,  r: 22 },
      { id: 'C', x: 640, y: 170, r: 22 },
      { id: 'D', x: 200, y: 360, r: 22 },
      { id: 'E', x: 580, y: 380, r: 22 },
    ],
    obstacles: [
      { x: 320, y: 200, w: 90, h: 120 },
    ]
  },
  {
    name: "Archipelago",
    islands: [
      { id:'A', x: 100, y: 120, r:20 }, { id:'B', x: 260, y:80, r:20 },
      { id:'C', x: 420, y:120, r:20 }, { id:'D', x: 580, y:80, r:20 },
      { id:'E', x: 740, y:120, r:20 }, { id:'F', x: 320, y:320, r:22 },
      { id:'G', x: 600, y:320, r:22 }
    ],
    obstacles: [
      { x: 340, y: 160, w: 120, h: 90 },
      { x: 50, y: 200, w: 110, h: 60 }
    ]
  },
  {
    name: "Advanced Atoll",
    islands: [
      { id:'A', x: 120, y: 80, r:18 }, { id:'B', x: 280, y:140, r:18 },
      { id:'C', x: 450, y:60, r:18 }, { id:'D', x: 600, y:160, r:18 },
      { id:'E', x: 200, y:320, r:18 }, { id:'F', x: 420, y:300, r:18 },
      { id:'G', x: 700, y:300, r:18 }
    ],
    obstacles: [
      { x: 360, y: 100, w: 140, h: 90 },
      { x: 520, y: 220, w: 120, h: 90 }
    ]
  }
];

/* ---------------------------
   Game state
   --------------------------- */
let state = {
  levelIndex: 0,
  islands: [],
  obstacles: [],
  bridges: [], // {aId,bId,len}
  undoStack: [],
  selectedIsland: null,
  startTime: null,
  paused: false,
  elapsedBeforePause: 0,
  moves: 0,
  totalLength: 0,
  soundEnabled: SOUND_ENABLED_DEFAULT,
  running: true
};

/* ---------------------------
   DOM elements
   --------------------------- */
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const movesEl = document.getElementById('moves');
const lengthEl = document.getElementById('length');
const pauseBtn = document.getElementById('pause-btn');
const undoBtn = document.getElementById('undo-btn');
const restartBtn = document.getElementById('restart-btn');
const levelSelect = document.getElementById('level-select');
const soundToggle = document.getElementById('sound-toggle');
const hintBtn = document.getElementById('hint-btn');
const saveBtn = document.getElementById('save-btn');

/* ---------------------------
   Geometry helpers for collisions
   --------------------------- */
function segmentIntersectsRect(p1, p2, rect) {
  // Check if line segment p1-p2 intersects rectangle rect {x,y,w,h}
  // Using Liang–Barsky algorithm or check intersection against each rect edge
  const rectLines = [
    [{x:rect.x, y:rect.y}, {x:rect.x+rect.w, y:rect.y}],
    [{x:rect.x+rect.w, y:rect.y}, {x:rect.x+rect.w, y:rect.y+rect.h}],
    [{x:rect.x+rect.w, y:rect.y+rect.h}, {x:rect.x, y:rect.y+rect.h}],
    [{x:rect.x, y:rect.y+rect.h}, {x:rect.x, y:rect.y}]
  ];
  for (let rl of rectLines) {
    if (segmentsIntersect(p1, p2, rl[0], rl[1])) return true;
  }
  // Also if both endpoints inside rect -> allow? We don't allow passing through obstacle so false positive
  if (pointInRect(p1,rect) || pointInRect(p2,rect)) return true;
  return false;
}
function pointInRect(p, r) {
  return (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
}
function ccw(A,B,C){
  return (C.y-A.y)*(B.x-A.x) > (B.y-A.y)*(C.x-A.x);
}
function segmentsIntersect(A,B,C,D){
  // return true if AB intersects CD
  return (ccw(A,C,D) !== ccw(B,C,D)) && (ccw(A,B,C) !== ccw(A,B,D));
}

/* ---------------------------
   Bridge crossing test
   --------------------------- */
function bridgeCrossesExisting(a, b) {
  const p1 = {x: a.x, y: a.y}, p2 = {x: b.x, y: b.y};
  for (let br of state.bridges) {
    // find islands for br
    const A = state.islands.find(i => i.id === br.a);
    const B = state.islands.find(i => i.id === br.b);
    // if they share an endpoint, crossing is allowed (touching)
    if (!A || !B) continue;
    if (br.a === a.id || br.b === a.id || br.a === b.id || br.b === b.id) continue;
    if (segmentsIntersect(p1, p2, {x:A.x,y:A.y}, {x:B.x,y:B.y})) return true;
  }
  return false;
}

/* ---------------------------
   Union-Find to check connectivity
   --------------------------- */
function UnionFind(nodes) {
  const parent = {}, rank = {};
  nodes.forEach(n => { parent[n] = n; rank[n] = 0; });
  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(a,b) {
    let ra = find(a), rb = find(b);
    if (ra === rb) return;
    if (rank[ra] < rank[rb]) parent[ra] = rb;
    else if (rank[rb] < rank[ra]) parent[rb] = ra;
    else { parent[rb] = ra; rank[ra]++; }
  }
  return { find, union };
}
function checkAllConnected() {
  const ids = state.islands.map(i=>i.id);
  const uf = UnionFind(ids);
  state.bridges.forEach(b => uf.union(b.a, b.b));
  const root = uf.find(ids[0]);
  return ids.every(id => uf.find(id) === root);
}

/* ---------------------------
   Game logic
   --------------------------- */
function loadLevel(index) {
  const lvl = LEVELS[index];
  state.levelIndex = index;
  state.islands = JSON.parse(JSON.stringify(lvl.islands));
  state.obstacles = JSON.parse(JSON.stringify(lvl.obstacles));
  state.bridges = [];
  state.undoStack = [];
  state.selectedIsland = null;
  state.moves = 0;
  state.totalLength = 0;
  state.startTime = now();
  state.elapsedBeforePause = 0;
  state.paused = false;
  state.running = true;
  updateUI();
  draw();
}

function addBridge(aId, bId) {
  // Validate and add bridge if valid
  const a = state.islands.find(i=>i.id===aId), b = state.islands.find(i=>i.id===bId);
  if (!a || !b || aId === bId) { playErr(); return false; }

  // Check duplicate
  if (state.bridges.some(br => (br.a === aId && br.b === bId) || (br.a === bId && br.b === aId))) { playErr(); return false; }

  // line intersects obstacles?
  if (state.obstacles.some(ob => segmentIntersectsRect({x:a.x,y:a.y},{x:b.x,y:b.y},ob))) { playErr(); return false; }

  // line crosses existing bridges?
  if (bridgeCrossesExisting(a,b)) { playErr(); return false; }

  const len = distance(a,b);
  state.bridges.push({ a: aId, b: bId, len });
  state.undoStack.push({ action: 'add', bridge: { a: aId, b: bId, len } });
  state.moves++;
  state.totalLength += len;
  playClick();
  updateUI();

  if (checkAllConnected()) {
    // victory
    setTimeout(() => {
      playWin();
      state.running = false;
      showWin();
    }, 300);
  }
  return true;
}

function undo() {
  const last = state.undoStack.pop();
  if (!last) { playErr(); return; }
  if (last.action === 'add') {
    // remove the bridge
    const idx = state.bridges.findIndex(b => b.a===last.bridge.a && b.b===last.bridge.b);
    if (idx !== -1) {
      state.bridges.splice(idx,1);
      state.totalLength -= last.bridge.len;
      state.moves++;
      updateUI();
      playClick();
    }
  }
}

/* ---------------------------
   UI & interactions
   --------------------------- */
function updateUI(){
  // Score = 10000 - (length*20) - moves*40 - time*2 (higher better)
  const elapsed = state.paused ? state.elapsedBeforePause : (now() - state.startTime + state.elapsedBeforePause);
  const seconds = Math.floor(elapsed/1000);
  const timePenalty = seconds * 2;
  const lengthPenalty = Math.round(state.totalLength) * 20;
  const movesPenalty = state.moves * 40;
  let score = Math.max(0, Math.round(10000 - lengthPenalty - movesPenalty - timePenalty));
  scoreEl.textContent = score;
  timeEl.textContent = formatTime(seconds);
  movesEl.textContent = state.moves;
  lengthEl.textContent = Math.round(state.totalLength);
}

function formatTime(sec) {
  const m = Math.floor(sec/60), s = sec % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function showWin(){
  // show overlay + sound
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.46)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.restore();
  setTimeout(()=> {
    alert("🎉 You connected all islands! Great job.\nScore: " + scoreEl.textContent);
  },50);
}

/* ---------------------------
   Drawing
   --------------------------- */
function clearBoard(){ ctx.clearRect(0,0,canvas.width,canvas.height); }
function drawBackground() {
  // subtle water patterns
  const g = ctx.createLinearGradient(0,0,0,canvas.height);
  g.addColorStop(0,'rgba(0,14,26,0.7)'); g.addColorStop(1,'rgba(2,30,44,0.85)');
  ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height);
}

function drawObstacles() {
  ctx.save();
  for (let o of state.obstacles) {
    ctx.fillStyle = "rgba(60,60,60,0.75)";
    ctx.fillRect(o.x, o.y, o.w, o.h);
    // glow outline
    ctx.strokeStyle = "rgba(255,80,80,0.06)";
    ctx.lineWidth = 6; ctx.strokeRect(o.x-3, o.y-3, o.w+6, o.h+6);
  }
  ctx.restore();
}

function drawBridges() {
  for (let br of state.bridges) {
    const A = state.islands.find(i=>i.id===br.a);
    const B = state.islands.find(i=>i.id===br.b);
    if (!A || !B) continue;
    // draw base line
    ctx.save();
    ctx.lineWidth = 6;
    const grad = ctx.createLinearGradient(A.x,A.y,B.x,B.y);
    grad.addColorStop(0, 'rgba(255,255,255,0.06)');
    grad.addColorStop(0.5, 'rgba(0,229,168,0.9)');
    grad.addColorStop(1, 'rgba(255,255,255,0.06)');
    ctx.strokeStyle = grad;
    ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y); ctx.stroke();

    // decorative bulbs (glowing dots along bridge)
    const count = Math.max(3, Math.floor(br.len/60));
    for (let i=0;i<=count;i++){
      const t = i / count;
      const x = A.x + (B.x-A.x)*t;
      const y = A.y + (B.y-A.y)*t;
      // glow
      ctx.beginPath();
      ctx.fillStyle = `rgba(0,229,168, ${0.18 + 0.6*Math.abs(Math.sin((t+Date.now()/1000)*2))})`;
      ctx.shadowBlur = 12; ctx.shadowColor = 'rgba(0,229,168,0.8)';
      ctx.arc(x,y,4,0,Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }
}

function drawIslands() {
  for (let isl of state.islands) {
    // island shadow
    ctx.save();
    ctx.beginPath();
    ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.fillStyle = '#0e2830';
    ctx.arc(isl.x, isl.y, isl.r+8, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // gradient island
    const g = ctx.createRadialGradient(isl.x-isl.r/3, isl.y-isl.r/3, 2, isl.x, isl.y, isl.r+4);
    g.addColorStop(0, '#ffdca8'); g.addColorStop(1, '#ffb66b');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(isl.x, isl.y, isl.r, 0, Math.PI*2);
    ctx.fill();

    // rim
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 2; ctx.stroke();

    // id
    ctx.fillStyle = '#002219';
    ctx.font = `${Math.max(12, isl.r-4)}px system-ui`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(isl.id, isl.x, isl.y);
  }
}

function drawSelection() {
  if (state.selectedIsland) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,229,168,0.9)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6,6]);
    ctx.arc(state.selectedIsland.x, state.selectedIsland.y, state.selectedIsland.r+10, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawFloatingGhost(mousePos) {
  if (!state.selectedIsland || !mousePos) return;
  const A = state.selectedIsland;
  const B = mousePos;
  // ghost line
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = 'rgba(0,229,168,0.5)';
  ctx.lineWidth = 4;
  ctx.setLineDash([8,6]);
  ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
  ctx.restore();
}

/* Main draw */
let lastMouse = null;
function draw(){
  clearBoard();
  drawBackground();
  drawObstacles();
  drawBridges();
  drawIslands();
  drawSelection();
  drawFloatingGhost(lastMouse);

  // request anim frame only when running or to animate glow
  if (state.running) requestAnimationFrame(draw);
}

/* ---------------------------
   Event handlers
   --------------------------- */
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  lastMouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
});

canvas.addEventListener('mouseleave', () => { lastMouse = null; });

canvas.addEventListener('click', (e) => {
  if (!state.running || state.paused) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  // find island under click
  const isl = state.islands.find(i => distance(i, {x,y}) <= i.r + 6);
  if (!isl) {
    // clicked empty water -> deselect
    state.selectedIsland = null; draw();
    return;
  }
  if (!state.selectedIsland) {
    state.selectedIsland = isl; playClick(); draw();
    return;
  }
  // attempt to add bridge
  if (state.selectedIsland.id === isl.id) {
    // deselect
    state.selectedIsland = null; draw();
    return;
  }
  const added = addBridge(state.selectedIsland.id, isl.id);
  if (added) {
    playSuccess();
  }
  state.selectedIsland = null;
  draw();
});

/* ---------------------------
   Input buttons
   --------------------------- */
pauseBtn.addEventListener('click', () => {
  if (!state.running) return;
  if (!state.paused) {
    state.paused = true;
    state.elapsedBeforePause += (now() - state.startTime);
    pauseBtn.textContent = 'Resume';
  } else {
    state.paused = false;
    state.startTime = now();
    pauseBtn.textContent = 'Pause';
  }
});

undoBtn.addEventListener('click', () => { undo(); draw(); updateUI(); });

restartBtn.addEventListener('click', () => {
  if (!confirm('Restart this level?')) return;
  loadLevel(state.levelIndex);
});

soundToggle.addEventListener('change', (e) => {
  state.soundEnabled = e.target.checked;
});

hintBtn.addEventListener('click', () => {
  // rough hint: show a minimal spanning tree suggestion (Prim's) — highlight one suggested bridge
  const suggestion = computeMSTSuggestion();
  if (!suggestion) { playErr(); alert('No hint available'); return; }
  highlightSuggestion(suggestion);
});

/* Save score */
saveBtn.addEventListener('click', () => {
  const score = parseInt(scoreEl.textContent,10);
  const name = prompt('Save your score. Enter name:','Player') || 'Player';
  const entry = { name, score, date: new Date().toISOString(), level: LEVELS[state.levelIndex].name };
  const scores = JSON.parse(localStorage.getItem('islandScores') || '[]');
  scores.push(entry);
  localStorage.setItem('islandScores', JSON.stringify(scores));
  alert('Saved!');
});

/* level select */
function populateLevelSelect() {
  levelSelect.innerHTML = '';
  LEVELS.forEach((lv, idx) => {
    const op = document.createElement('option'); op.value = idx; op.textContent = lv.name;
    levelSelect.appendChild(op);
  });
  levelSelect.value = state.levelIndex;
}
levelSelect.addEventListener('change', () => {
  loadLevel(parseInt(levelSelect.value,10));
});

/* ---------------------------
   Hints / MST suggestion (Prim's)
   --------------------------- */
function computeMSTSuggestion() {
  const ids = state.islands.map(i=>i.id);
  if (ids.length <= 1) return null;
  // Prim's algorithm on complete graph with weights distance
  const inMST = new Set();
  const edges = [];
  const map = {}; // map id->island
  state.islands.forEach(i=>map[i.id]=i);
  const start = ids[0]; inMST.add(start);

  while (inMST.size < ids.length) {
    let best = null;
    for (let a of inMST) {
      for (let b of ids) {
        if (inMST.has(b)) continue;
        const A = map[a], B = map[b];
        // skip if edge invalid (intersects obstacle or crosses existing bridge)
        const blocked = state.obstacles.some(ob => segmentIntersectsRect({x:A.x,y:A.y},{x:B.x,y:B.y},ob))
                        || bridgeCrossesExisting(A,B);
        if (blocked) continue;
        const w = distance(A,B);
        if (!best || w < best.w) best = { a:A.id, b:B.id, w, A, B };
      }
    }
    if (!best) break;
    edges.push(best);
    inMST.add(best.b);
  }
  // pick first suggested edge that is not already built
  for (let e of edges) {
    if (!state.bridges.some(b => (b.a===e.a && b.b===e.b)||(b.a===e.b && b.b===e.a))) {
      return { a:e.A, b:e.B };
    }
  }
  return null;
}
function highlightSuggestion(sug) {
  playClick();
  // flash the suggested bridge a few times
  let flashes = 0;
  const interval = setInterval(() => {
    draw();
    ctx.save();
    ctx.lineWidth = 8;
    ctx.strokeStyle = `rgba(255,235,190,${0.12 + 0.3*Math.abs(Math.sin(flashes))})`;
    ctx.beginPath(); ctx.moveTo(sug.a.x,sug.a.y); ctx.lineTo(sug.b.x,sug.b.y); ctx.stroke();
    ctx.restore();
    flashes++;
    if (flashes > 8) { clearInterval(interval); draw(); }
  }, 120);
}

/* ---------------------------
   Sounds
   --------------------------- */
function playClick(){ if (state.soundEnabled) audio.click.play().catch(()=>{}); }
function playSuccess(){ if (state.soundEnabled) audio.success.play().catch(()=>{}); }
function playErr(){ if (state.soundEnabled) audio.error.play().catch(()=>{}); }
function playWin(){ if (state.soundEnabled) audio.win.play().catch(()=>{}); }

/* ---------------------------
   Animation & game loop for time updates
   --------------------------- */
function tick() {
  if (!state.paused && state.running) {
    updateUI();
  }
  setTimeout(tick, 300);
}

/* ---------------------------
   Initialization
   --------------------------- */
function resizeCanvas() {
  // keep internal drawing buffer 1:1 with element size for crispness
  const style = getComputedStyle(canvas);
  const width = parseInt(style.width);
  const height = parseInt(style.height);
  // set logical size
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(ratio,0,0,ratio,0,0);
}
function attachUI() {
  // read sound default from localStorage
  const s = localStorage.getItem('islandSound');
  if (s !== null) { state.soundEnabled = s === '1'; soundToggle.checked = state.soundEnabled; }
  soundToggle.addEventListener('change', () => {
    state.soundEnabled = soundToggle.checked;
    localStorage.setItem('islandSound', state.soundEnabled ? '1' : '0');
  });
}
function start() {
  // set canvas CSS size to match markup
  canvas.style.width = '720px';
  canvas.style.height = '640px';
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  populateLevelSelect();
  attachUI();
  loadLevel(0);
  tick();
  draw();
}
start();

/* make game accessible if loaded in a hub where width differs */
window.addEventListener('load', () => {
  // ensure level select shows current index
  levelSelect.value = state.levelIndex;
});
