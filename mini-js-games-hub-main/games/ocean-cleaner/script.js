/* Ocean Cleaner — script.js
   Canvas-based ocean-cleaner prototype with upgrades, pooling & touch controls.
   Drop into games/ocean-cleaner/ and open index.html.
*/

/* ----------------- Utilities & Config ----------------- */

const cfg = {
  canvasW: 960, canvasH: 540,
  spawnInterval: 1200, // ms between trash spawns (will scale with difficulty)
  creatureInterval: 4000,
  maxTrash: 40,
  maxCreatures: 6,
  initialHealth: 3,
  startingScore: 0,
  upgradeCosts: { net: 500, speed: 800, magnet: 1200 },
  baseNetRadius: 32,
  magnetRadius: 80
};

const assets = {
  // We'll attempt to load images — but the game draws fallback shapes if images fail.
  boat: { url: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=256&q=60" }, // decorative: unsplash
  trash: { url: "https://cdn.pixabay.com/photo/2013/07/12/13/58/plastic-bottle-149319_1280.png" },
  creature: { url: "https://cdn.pixabay.com/photo/2016/03/31/23/31/shark-1297717_1280.png" },
  buoy: { url: "https://cdn.pixabay.com/photo/2012/04/13/00/24/buoy-31203_1280.png" }
};

const qs = (s) => document.querySelector(s);

/* ----------------- DOM References ----------------- */

const canvas = qs("#gameCanvas");
const ctx = canvas.getContext("2d", { alpha: true });
canvas.width = cfg.canvasW;
canvas.height = cfg.canvasH;

const scoreEl = qs("#score");
const collectedEl = qs("#collected");
const healthEl = qs("#health");
const netEl = qs("#net");
const timerEl = qs("#timer");
const bestEl = qs("#best");

const btnRestart = qs("#btn-restart");
const btnPause = qs("#btn-pause");
const btnMute = qs("#btn-mute");
const upgradeBtns = Array.from(document.querySelectorAll(".upgrade-btn"));

/* ----------------- State ----------------- */

let running = true, paused = false, muted = false;
let lastSpawn = 0, lastCreature = 0, lastTime = 0;
let score = cfg.startingScore, collected = 0, health = cfg.initialHealth;
let netReady = true, netCooldown = 5000, usingNet = false, netTimer = 0;
let timer = 0, level = 1;
let bestScore = Number(localStorage.getItem("oc_best") || 0);
bestEl.textContent = bestScore;

const playDataKey = "gamePlays"; // your hub uses this key

/* ----------------- Input Handling ----------------- */

const input = {
  x: canvas.width / 2,
  y: canvas.height - 120,
  left: false, right: false, up: false, down: false,
  pointerDown: false, pointerId: null
};

function setupInput() {
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") input.left = true;
    if (e.key === "ArrowRight" || e.key === "d") input.right = true;
    if (e.key === "ArrowUp" || e.key === "w") input.up = true;
    if (e.key === "ArrowDown" || e.key === "s") input.down = true;
    if (e.code === "Space") attemptNet();
    if (e.key === "p") togglePause();
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") input.left = false;
    if (e.key === "ArrowRight" || e.key === "d") input.right = false;
    if (e.key === "ArrowUp" || e.key === "w") input.up = false;
    if (e.key === "ArrowDown" || e.key === "s") input.down = false;
  });

  // Touch / pointer drag
  canvas.addEventListener("pointerdown", (e) => {
    input.pointerDown = true;
    input.pointerId = e.pointerId;
    movePointer(e);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!input.pointerDown || e.pointerId !== input.pointerId) return;
    movePointer(e);
  });
  window.addEventListener("pointerup", (e) => {
    if (e.pointerId === input.pointerId) {
      input.pointerDown = false;
      input.pointerId = null;
    }
  });

  function movePointer(e) {
    const r = canvas.getBoundingClientRect();
    input.x = (e.clientX - r.left) * (canvas.width / r.width);
    input.y = (e.clientY - r.top) * (canvas.height / r.height);
  }
}

/* ----------------- Sound: WebAudio synth (no external files) ----------------- */

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination);
masterGain.gain.value = 0.12;

function sfxPlay(type = "collect") {
  if (muted) return;
  const now = audioCtx.currentTime;
  if (type === "collect") {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(880, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.6, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    o.connect(g); g.connect(masterGain);
    o.start(now); o.stop(now + 0.3);
  } else if (type === "crash") {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(120, now);
    g.gain.setValueAtTime(1, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    o.connect(g); g.connect(masterGain);
    o.start(now); o.stop(now + 0.7);
  } else if (type === "win") {
    // small arpeggio
    const freqs = [600, 800, 1000];
    freqs.forEach((f, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const t = now + i * 0.08;
      o.type = "triangle"; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.6, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g); g.connect(masterGain);
      o.start(t); o.stop(t + 0.28);
    });
  }
}

/* ----------------- Object Pooling ----------------- */

function createPool(factory, size) {
  const pool = [];
  for (let i = 0; i < size; i++) pool.push(factory());
  return {
    get() { return pool.find(p => !p.active) || (pool.push(factory()), pool[pool.length-1]); },
    all() { return pool; }
  };
}

/* ----------------- Entities ----------------- */

function createTrash() {
  return {
    active: false, x: 0, y:0, vx:0, vy:0, r: 10, type:"plastic", value:10,
    spawn(tx, ty, vx, vy, r, type, val) {
      this.active = true; this.x = tx; this.y = ty; this.vx = vx; this.vy = vy; this.r = r; this.type = type; this.value = val;
    },
    update(dt) { this.x += this.vx*dt; this.y += this.vy*dt; if (this.x < -50 || this.x > canvas.width+50 || this.y > canvas.height+80) this.active=false; }
  };
}

function createCreature() {
  return {
    active:false, x:0,y:0,vx:0,vy:0,r:24, kind:"shark",
    spawn(x,y,vx,vy,r,kind){ this.active=true; this.x=x; this.y=y; this.vx=vx; this.vy=vy; this.r=r; this.kind=kind; },
    update(dt){ this.x += this.vx*dt; this.y += this.vy*dt; if(this.x<-100||this.x>canvas.width+100||this.y>canvas.height+100) this.active=false; }
  };
}

const trashPool = createPool(createTrash, cfg.maxTrash);
const creaturePool = createPool(createCreature, cfg.maxCreatures);

/* ----------------- Boat (player) ----------------- */

const player = {
  x: canvas.width/2,
  y: canvas.height - 110,
  vx: 0, vy: 0,
  speed: 220,
  width: 84, height: 32,
  collectedItems: [],
  netRadius: cfg.baseNetRadius,
  magnetActive: false,
  magnetTimer: 0,
  draw(ctx) {
    // Draw boat as rounded rectangle + flag; nicer than simple shape
    ctx.save();
    ctx.translate(this.x, this.y);
    // hull
    ctx.fillStyle = "#0b78d1";
    roundRect(ctx, -42, -12, 84, 24, 8);
    ctx.fill();
    // deck
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, -20, -10, 40, 16, 6);
    ctx.fill();
    // small cabin
    ctx.fillStyle = "#0b78d1";
    ctx.fillRect(8, -16, 18, 8);
    // net visual when using
    if (usingNet) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.arc(0, -6, this.netRadius, 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.restore();
  },
  update(dt) {
    // input-based movement (keyboard) — but pointer drag overrides if pointerDown
    let tx = this.x, ty = this.y;
    if (input.pointerDown) {
      // smooth follow pointer
      const dx = input.x - this.x;
      const dy = input.y - this.y;
      this.vx = dx * 6;
      this.vy = dy * 6;
    } else {
      this.vx = 0; this.vy = 0;
      if (input.left) this.vx = -this.speed;
      if (input.right) this.vx = this.speed;
      if (input.up) this.vy = -this.speed;
      if (input.down) this.vy = this.speed;
    }
    // move
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // keep within canvas area
    this.x = Math.max(40, Math.min(canvas.width - 40, this.x));
    this.y = Math.max(120, Math.min(canvas.height - 30, this.y));

    // magnet effect collects nearby trash automatically
    if (this.magnetActive) {
      this.magnetTimer -= dt*1000;
      if (this.magnetTimer <= 0) this.magnetActive = false;
    }
  },
  attemptCollect(trash) {
    // called when trash collides with boat/net
    collected += 1;
    score += trash.value;
    sfxPlay("collect");
    trash.active = false;
    this.collectedItems.push(trash.type);
  }
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ----------------- Spawning logic ----------------- */

function spawnTrash() {
  const t = trashPool.get();
  // spawn near top half at random x
  const x = Math.random() * (canvas.width - 160) + 80;
  const y = -20;
  const vx = (Math.random() - 0.5) * 30 * (0.9 + level*0.05);
  const vy = 30 + Math.random()*40 + level*3;
  // assign types/values
  const types = [
    {type:"plastic", r:12, value:10},
    {type:"bottle", r:14, value:20},
    {type:"metal", r:18, value:40},
    {type:"drum", r:24, value:80}
  ];
  const pick = types[Math.floor(Math.random()*types.length)];
  t.spawn(x,y,vx,vy,pick.r,pick.type,pick.value);
}

function spawnCreature() {
  const c = creaturePool.get();
  const side = Math.random() < 0.5 ? -1 : 1;
  const y = Math.random() * (canvas.height/2) + 40;
  const x = side === -1 ? canvas.width + 80 : -80;
  const vx = -side * (40 + Math.random()*80 + level*10);
  const vy = Math.sin(Math.random()*Math.PI)*8;
  const kind = Math.random() < 0.5 ? "shark" : "jelly";
  const r = kind === "shark" ? 28 : 20;
  c.spawn(x,y,vx,vy,r,kind);
}

/* ----------------- Collision helpers ----------------- */

function circleRectCollision(cx, cy, r, rx, ry, rw, rh) {
  // circle (cx,cy,r) colliding with rect centered at rx,ry width rw height rh
  const distX = Math.abs(cx - rx);
  const distY = Math.abs(cy - ry);
  if (distX > (rw/2 + r)) return false;
  if (distY > (rh/2 + r)) return false;
  if (distX <= (rw/2)) return true;
  if (distY <= (rh/2)) return true;
  const dx = distX - rw/2;
  const dy = distY - rh/2;
  return (dx*dx + dy*dy <= r*r);
}

/* ----------------- Game Loop ----------------- */

function resetGame() {
  // reset state
  score = cfg.startingScore;
  collected = 0;
  health = cfg.initialHealth;
  netReady = true; usingNet = false; netTimer = 0;
  timer = 60; // single-level 60 seconds
  level = 1;
  // reset pools
  trashPool.all().forEach(t=>t.active=false);
  creaturePool.all().forEach(c=>c.active=false);
  player.x = canvas.width/2;
  player.y = canvas.height - 110;
  player.collectedItems = [];
  player.netRadius = cfg.baseNetRadius;
  player.speed = 220;
  player.magnetActive = false;
  updateUI();
}

function updateUI() {
  scoreEl.textContent = Math.floor(score);
  collectedEl.textContent = collected;
  healthEl.textContent = health;
  netEl.textContent = netReady ? "Ready" : "Cooldown";
  timerEl.textContent = Math.max(0, Math.ceil(timer)) + "s";
  bestEl.textContent = bestScore;
  // enable upgrades based on score
  upgradeBtns.forEach(b=>{
    const key = b.dataset.upgrade;
    const cost = cfg.upgradeCosts[key];
    b.disabled = score < cost;
    b.textContent = `${b.textContent.split('(')[0].trim()} (${cost})`;
  });
}

function togglePause() {
  paused = !paused;
  btnPause.textContent = paused ? "Resume" : "Pause";
  if (!paused) {
    // keep lastTime consistent
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }
}

btnPause.addEventListener("click", togglePause);
btnRestart.addEventListener("click", () => {
  resetGame();
  sfxPlay("win");
});
btnMute.addEventListener("click", () => {
  muted = !muted;
  btnMute.textContent = muted ? "🔇" : "🔊";
  if (muted) masterGain.gain.value = 0; else masterGain.gain.value = 0.12;
});

upgradeBtns.forEach(b=>{
  b.addEventListener("click", ()=>{
    const key = b.dataset.upgrade;
    const cost = cfg.upgradeCosts[key];
    if (score < cost) return;
    score -= cost;
    if (key === "net") {
      player.netRadius += 18;
    } else if (key === "speed") {
      player.speed += 80;
    } else if (key === "magnet") {
      player.magnetActive = true;
      player.magnetTimer = 25*1000; // 25 sec
    }
    updateUI();
  });
});

/* Track plays on the hub (so your hub Pro badges can pick it up).
   We increment localStorage counter for this game when user hits Play (page load). */
function trackHubPlay() {
  try {
    const key = "gamePlays";
    const existing = JSON.parse(localStorage.getItem(key) || "{}");
    const gameName = "Ocean Cleaner";
    if (!existing[gameName]) existing[gameName] = { plays: 0, success: 0 };
    existing[gameName].plays += 1;
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (e) { /* ignore */ }
}

/* Attempt net: burst that collects nearby objects */
function attemptNet() {
  if (!netReady) return;
  usingNet = true;
  netReady = false;
  netTimer = 0.6; // active 0.6s
  setTimeout(()=> netReady = true, netCooldown);
  // short magnet effect for net
  player.magnetActive = true;
  player.magnetTimer = 900; // in ms converted below to seconds logic
}

/* Save best score to localStorage */
function saveBestScore() {
  if (score > bestScore) {
    bestScore = Math.floor(score);
    localStorage.setItem("oc_best", bestScore);
    sfxPlay("win");
  }
}

/* Main loop */
function loop(now) {
  if (!running || paused) return;
  if (!lastTime) lastTime = now;
  const dt = Math.min(0.05, (now - lastTime) / 1000); // cap dt for stability
  lastTime = now;

  // spawn logic
  lastSpawn += dt*1000;
  if (lastSpawn >= Math.max(250, cfg.spawnInterval - level*40)) {
    lastSpawn = 0;
    spawnTrash();
  }
  lastCreature += dt*1000;
  if (lastCreature >= Math.max(1200, cfg.creatureInterval - level*120)) {
    lastCreature = 0;
    spawnCreature();
  }

  // update timer
  timer -= dt;
  if (timer <= 0) {
    // end of level
    level += 1;
    timer = Math.max(30, 60 - level*4); // shorter each level
    score += level * 100;
  }

  // update player and entities
  player.update(dt);

  // update trash
  trashPool.all().forEach(t=>{
    if (!t.active) return;
    t.update(dt);
    // magnet auto-collect
    if ((player.magnetActive && (Math.hypot(t.x-player.x, t.y-player.y) < cfg.magnetRadius)) || (usingNet && Math.hypot(t.x-player.x, t.y-player.y) < player.netRadius + t.r)) {
      player.attemptCollect(t);
    }
    // collision with boat (no net)
    if (circleRectCollision(t.x, t.y, t.r, player.x, player.y, player.width, player.height)) {
      player.attemptCollect(t);
    }
  });

  // update creatures
  creaturePool.all().forEach(c=>{
    if (!c.active) return;
    c.update(dt);
    // collision with player
    const d = Math.hypot(c.x-player.x, c.y-player.y);
    if (d < c.r + 16) {
      // hit!
      c.active = false;
      health -= 1;
      score = Math.max(0, score - 40);
      sfxPlay("crash");
      // drop half of collected items (simulate dropping)
      const drop = Math.floor(player.collectedItems.length/2);
      for (let i = 0; i < drop; i++) player.collectedItems.pop();
    }
  });

  // decrease net timer
  if (usingNet) {
    netTimer -= dt;
    if (netTimer <= 0) usingNet = false;
  }

  if (player.magnetActive) {
    // magnet timer measured earlier in ms sometimes; normalize
    player.magnetTimer -= dt*1000;
    if (player.magnetTimer <= 0) player.magnetActive = false;
  }

  // update UI
  updateUI();

  // check game over
  if (health <= 0) {
    running = false;
    saveBestScore();
    // show end overlay
    setTimeout(()=> {
      alert(`Game Over! Score: ${Math.floor(score)} — Best: ${bestScore}`);
      resetGame(); running = true; lastTime = 0;
      requestAnimationFrame(loop);
    }, 80);
    return;
  }

  // clear canvas
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawScene();

  lastTime = now;
  requestAnimationFrame(loop);
}

/* ----------------- Drawing ----------------- */

function drawScene() {
  // draw water gradient
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#bfefff");
  g.addColorStop(0.6, "#89e0ff");
  g.addColorStop(1, "#4fc8e8");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // gentle waves overlay
  ctx.save();
  ctx.globalAlpha = 0.08;
  for (let i=0;i<6;i++){
    ctx.beginPath();
    ctx.ellipse((i*180 + (Date.now()/40)%180), 80 + Math.sin(Date.now()/900+i)*8, 220, 60, 0, 0, Math.PI*2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }
  ctx.restore();

  // draw buoys (deposit points) — static along top
  for (let i=0;i<3;i++){
    const bx = 120 + i*300;
    const by = 80;
    drawBuoy(bx, by);
  }

  // draw trash
  trashPool.all().forEach(t=>{
    if (!t.active) return;
    drawTrash(t);
  });

  // draw creatures
  creaturePool.all().forEach(c=>{
    if (!c.active) return;
    drawCreature(c);
  });

  // draw player
  player.draw(ctx);

  // draw HUD mini
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(8,8,160,56);
  ctx.restore();
}

function drawTrash(t) {
  ctx.save();
  ctx.beginPath();
  // different shapes for types
  if (t.type === "metal" || t.type === "drum") {
    // barrel/drum
    ctx.fillStyle = "#b07b3b";
    ctx.fillRect(t.x - t.r, t.y - t.r, t.r*2, t.r*1.2);
  } else if (t.type === "bottle") {
    ctx.fillStyle = "#9fd3ff";
    ctx.fillRect(t.x - t.r*0.6, t.y - t.r*1.2, t.r*1.2, t.r*2.0);
    ctx.fillStyle = "#bfbfbf";
    ctx.fillRect(t.x - t.r*0.5, t.y - t.r*1.4, t.r*1.0, t.r*0.2);
  } else {
    // plastic / default: small circle
    ctx.fillStyle = "#ffd24a";
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCreature(c) {
  ctx.save();
  ctx.translate(c.x, c.y);
  if (c.kind === "shark") {
    ctx.fillStyle = "#6b7280";
    ctx.beginPath();
    ctx.moveTo(-c.r, 0);
    ctx.quadraticCurveTo(0, -c.r*1.2, c.r, 0);
    ctx.quadraticCurveTo(0, c.r*1.1, -c.r, 0);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(c.r*0.1, -6, c.r*0.6, 6);
  } else {
    // jelly-like
    ctx.fillStyle = "#a24cf7";
    ctx.beginPath();
    ctx.arc(0, 0, c.r, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-c.r, 0, c.r*2, c.r*0.8);
  }
  ctx.restore();
}

function drawBuoy(x,y) {
  ctx.save();
  ctx.translate(x,y);
  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.moveTo(-14,16); ctx.lineTo(0,-12); ctx.lineTo(14,16);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillRect(-6,10,12,14);
  ctx.restore();
}

/* ----------------- Start / Load ----------------- */

function init() {
  // resume audio on user gesture
  window.addEventListener("click", () => { if (audioCtx.state === "suspended") audioCtx.resume(); }, { once: true });

  setupInput();
  resetGame();
  trackHubPlay();
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

// start
init();
