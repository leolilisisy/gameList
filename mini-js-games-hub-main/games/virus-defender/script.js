/* Virus Defender - script.js
   - Place in games/virus-defender/script.js
   - Click/tap viruses to destroy them
   - Progressive difficulty, pause/restart/mute
   - Uses online sound links (Mixkit / SoundJay)
*/

// -------------------- Configuration --------------------
const CONFIG = {
  canvasWidth: 1200,
  canvasHeight: 700,
  initialSpawnInterval: 1400, // ms
  minSpawnInterval: 380,
  spawnAcceleration: 0.985, // multiply spawnInterval each wave
  initialVirusSpeed: 0.6, // base speed pixel/frame
  speedAcceleration: 1.02, // multiply virus speed each wave
  health: 5,
  pointsPerVirus: 10,
  hitRadiusPadding: 6, // extra hitbox for fingers
  assets: {
    // sounds (online)
    sfxPop: "https://assets.mixkit.co/sfx/preview/mixkit-quick-jump-arcade-239.wav",
    sfxHit: "https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-burst-718.wav",
    sfxCoreHit: "https://www.soundjay.com/misc/sounds/bell-ringing-01.mp3",
    bgm: "https://assets.mixkit.co/music/preview/mixkit-energetic-electronic-1177.mp3"
  }
};

// -------------------- DOM Elements --------------------
const canvas = document.getElementById("gameCanvas");
const scoreEl = document.getElementById("score");
const healthEl = document.getElementById("health");
const levelEl = document.getElementById("level");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const muteBtn = document.getElementById("muteBtn");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlaySub = document.getElementById("overlay-sub");
const resumeBtn = document.getElementById("resumeBtn");
const overlayRestart = document.getElementById("overlayRestart");

// high-dpi scaling
function setupCanvas(c, w, h) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = w * dpr;
  c.height = h * dpr;
  c.style.width = Math.min(w, window.innerWidth - 80) + "px";
  c.style.height = (h * (c.style.width.replace("px", "")/w)) + "px";
  c.getContext("2d").scale(dpr, dpr);
}
setupCanvas(canvas, CONFIG.canvasWidth, CONFIG.canvasHeight);
const ctx = canvas.getContext("2d");

// -------------------- Audio --------------------
let muted = false;
const audio = {
  pop: new Audio(CONFIG.assets.sfxPop),
  hit: new Audio(CONFIG.assets.sfxHit),
  core: new Audio(CONFIG.assets.sfxCoreHit),
  bgm: new Audio(CONFIG.assets.bgm),
};
audio.bgm.loop = true;
audio.bgm.volume = 0.18;
audio.pop.volume = 0.75;
audio.hit.volume = 0.8;
audio.core.volume = 0.8;

function setMuted(v) {
  muted = v;
  audio.bgm.muted = v;
  audio.pop.muted = v;
  audio.hit.muted = v;
  audio.core.muted = v;
  muteBtn.textContent = v ? "🔇" : "🔊";
}
setMuted(false);

// -------------------- Game State --------------------
let state = {
  running: true,
  score: 0,
  health: CONFIG.health,
  spawnInterval: CONFIG.initialSpawnInterval,
  lastSpawn: 0,
  viruses: [],
  virusSpeed: CONFIG.initialVirusSpeed,
  level: 1,
  lastFrame: 0,
  paused: false,
  gameOver: false,
};

// -------------------- Utility --------------------
function rand(min, max) { return Math.random() * (max - min) + min; }
function dist(a, b, c, d) { return Math.hypot(a - c, b - d); }
function lightColor(hex, a=0.55) { return hex + Math.floor(a*255).toString(16).padStart(2,'0'); }

// -------------------- Virus class --------------------
class Virus {
  constructor() {
    // spawn from random edge
    const side = Math.floor(Math.random() * 4);
    // spawn area padding
    const pad = 30;
    if (side === 0) { // top
      this.x = rand(pad, CONFIG.canvasWidth - pad);
      this.y = -30;
    } else if (side === 1) { // right
      this.x = CONFIG.canvasWidth + 30;
      this.y = rand(pad, CONFIG.canvasHeight - pad);
    } else if (side === 2) { // bottom
      this.x = rand(pad, CONFIG.canvasWidth - pad);
      this.y = CONFIG.canvasHeight + 30;
    } else { // left
      this.x = -30;
      this.y = rand(pad, CONFIG.canvasHeight - pad);
    }

    // target: core at center
    this.targetX = CONFIG.canvasWidth / 2;
    this.targetY = CONFIG.canvasHeight / 2;

    // size & speed
    this.baseRadius = rand(18, 38);
    this.radius = this.baseRadius;
    // velocity towards center (normalized)
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const len = Math.hypot(dx, dy) || 1;
    this.vx = (dx / len) * (state.virusSpeed * (0.9 + Math.random()*0.8));
    this.vy = (dy / len) * (state.virusSpeed * (0.9 + Math.random()*0.8));

    // wobble & animation
    this.angle = Math.random() * Math.PI * 2;
    this.spin = rand(-0.03, 0.03);
    this.hit = false;
    this.id = Math.random().toString(36).slice(2,9);
    this.color = `hsl(${rand(250, 360)}, ${rand(65,90)}%, ${rand(45,65)}%)`;
    this.spawnTime = performance.now();
  }

  update(dt) {
    // move
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // slight oscillation
    this.angle += this.spin * dt;
    this.radius = this.baseRadius + Math.sin((performance.now() - this.spawnTime) / 180) * 3;
  }

  draw(ctx) {
    // glow
    ctx.save();
    ctx.beginPath();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 26;
    ctx.fillStyle = this.color;
    // spiky body by drawing multiple circles around
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();

    // spikes
    const spikes = 8;
    for (let i=0;i<spikes;i++){
      const a = (i/spikes) * Math.PI * 2 + this.angle;
      const sx = this.x + Math.cos(a) * (this.radius + 10);
      const sy = this.y + Math.sin(a) * (this.radius + 10);
      ctx.beginPath();
      ctx.moveTo(this.x + Math.cos(a) * (this.radius*0.7), this.y + Math.sin(a) * (this.radius*0.7));
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.closePath();
    }

    // core-ish pattern
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.arc(this.x - this.radius*0.25, this.y - this.radius*0.25, this.radius*0.4, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  isHit(mx, my) {
    return dist(mx, my, this.x, this.y) < this.radius + CONFIG.hitRadiusPadding;
  }

  reachedCore() {
    return dist(this.x, this.y, this.targetX, this.targetY) <= (this.radius + core.radius);
  }
}

// -------------------- Core --------------------
const core = {
  x: CONFIG.canvasWidth / 2,
  y: CONFIG.canvasHeight / 2,
  radius: 68,
  draw(ctx, t = 0) {
    // pulsing glow
    const pulse = 6 * Math.sin(t / 280) + 8;
    ctx.save();
    // outer glow
    ctx.beginPath();
    ctx.shadowBlur = 40;
    ctx.shadowColor = "rgba(124,77,255,0.6)";
    ctx.fillStyle = "rgba(124,77,255,0.12)";
    ctx.arc(this.x, this.y, this.radius + pulse + 12, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
    // main circle
    ctx.beginPath();
    const g = ctx.createRadialGradient(this.x - 30, this.y - 30, 10, this.x, this.y, this.radius);
    g.addColorStop(0, "rgba(255,255,255,0.85)");
    g.addColorStop(0.12, "rgba(124,77,255,0.9)");
    g.addColorStop(1, "rgba(18,8,40,0.95)");
    ctx.fillStyle = g;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();

    // core center emblem
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.arc(this.x, this.y, this.radius * 0.33, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
};

// -------------------- Spawning --------------------
function spawnVirus() {
  state.viruses.push(new Virus());
}

function spawnWave() {
  spawnVirus();
  // maybe spawn an extra one occasionally
  if (Math.random() < 0.22) spawnVirus();
}

// -------------------- Input Handling --------------------
function getCanvasMouse(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
  const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
  // scale to canvas coordinate system
  const scaleX = canvas.width / (rect.width * (window.devicePixelRatio || 1));
  const scaleY = canvas.height / (rect.height * (window.devicePixelRatio || 1));
  return { x: x * scaleX / (window.devicePixelRatio || 1), y: y * scaleY / (window.devicePixelRatio || 1) };
}

canvas.addEventListener("click", (e) => {
  handleClick(getCanvasMouse(e));
});
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  handleClick(getCanvasMouse(e));
}, {passive:false});

function handleClick(pos) {
  if (state.paused || state.gameOver) return;
  // reverse iterate to hit front viruses first
  for (let i = state.viruses.length - 1; i >= 0; i--) {
    const v = state.viruses[i];
    if (v.isHit(pos.x, pos.y)) {
      // kill virus
      audio.pop.currentTime = 0;
      if (!muted) audio.pop.play().catch(()=>{});
      // points & explosion effect
      state.score += CONFIG.pointsPerVirus;
      spawnHitBurst(v.x, v.y, v.color);
      // remove virus
      state.viruses.splice(i, 1);
      updateHUD();
      return;
    }
  }
}

// visual burst particles on kill
const bursts = [];
function spawnHitBurst(x,y,color){
  audio.hit.currentTime = 0;
  if (!muted) audio.hit.play().catch(()=>{});
  for (let i=0;i<12;i++){
    bursts.push({
      x, y,
      vx: rand(-2.6,2.6),
      vy: rand(-2.6,2.6),
      t: 0, ttl: rand(400,900),
      c: color,
      r: rand(2,6),
    });
  }
}

// -------------------- Game Loop & Update --------------------
function updateHUD() {
  scoreEl.textContent = state.score;
  healthEl.textContent = state.health;
  levelEl.textContent = state.level;
}

// remove viruses that reached core
function checkCoreCollisions() {
  for (let i = state.viruses.length -1; i >= 0; i--) {
    const v = state.viruses[i];
    if (v.reachedCore()) {
      // play core hit
      audio.core.currentTime = 0;
      if (!muted) audio.core.play().catch(()=>{});
      state.viruses.splice(i,1);
      state.health -= 1;
      spawnCoreBurst(core.x + rand(-20,20), core.y + rand(-20,20));
      updateHUD();
      if (state.health <= 0) {
        endGame();
      }
    }
  }
}

function spawnCoreBurst(x,y){
  for (let i=0;i<28;i++){
    bursts.push({
      x, y,
      vx: rand(-6,6),
      vy: rand(-6,6),
      t: 0, ttl: rand(500,1300),
      c: "#ff6b6b",
      r: rand(3,8),
    });
  }
}

// update & draw particles
function updateBursts(dt){
  for (let i = bursts.length -1; i>=0; i--){
    const p = bursts[i];
    p.t += dt;
    p.x += p.vx * (dt/16);
    p.y += p.vy * (dt/16);
    if (p.t > p.ttl) bursts.splice(i,1);
  }
}

// main loop
function loop(ts) {
  if (!state.lastFrame) state.lastFrame = ts;
  const dt = Math.min(40, ts - state.lastFrame); // clamp dt
  state.lastFrame = ts;

  if (!state.paused && !state.gameOver) {
    // spawn logic
    if (ts - state.lastSpawn > state.spawnInterval) {
      spawnWave();
      state.lastSpawn = ts;
    }

    // update virus speed & difficulty gradually
    // every 10s increment level
    if (Math.floor(ts / 10000) + 1 > state.level) {
      state.level = Math.floor(ts / 10000) + 1;
      // accelerate spawn & speed
      state.spawnInterval = Math.max(CONFIG.minSpawnInterval, state.spawnInterval * CONFIG.spawnAcceleration);
      state.virusSpeed *= CONFIG.speedAcceleration;
    }

    // update viruses
    state.viruses.forEach(v => v.update(dt));
    // check collisions with core
    checkCoreCollisions();
    // update bursts
    updateBursts(dt);
  }

  // draw
  drawScene(ts);

  // schedule next
  if (!state.gameOver) requestAnimationFrame(loop);
}

// draw everything
function drawScene(ts){
  // clear
  ctx.clearRect(0,0,CONFIG.canvasWidth, CONFIG.canvasHeight);

  // background subtle grid
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#ffffff";
  for (let i=0;i<50;i++){
    ctx.beginPath();
    ctx.arc(40 + i*24, 40 + Math.sin((i*18 + ts/80) * 0.02) * 6, 1, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();

  // draw core
  core.draw(ctx, ts);

  // draw viruses
  state.viruses.forEach(v => v.draw(ctx));

  // draw bursts
  bursts.forEach(p => {
    ctx.save();
    ctx.globalAlpha = 1 - (p.t / p.ttl);
    ctx.beginPath();
    ctx.fillStyle = p.c;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  });

  // HUD subtle overlay on canvas
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(12,12,200,60);
  ctx.restore();

  // If paused overlay
  if (state.paused && !overlay.classList.contains("hidden")) {
    // overlay handled by DOM
  }
}

// -------------------- End / Restart --------------------
function endGame() {
  state.gameOver = true;
  overlayTitle.textContent = "Game Over";
  overlaySub.textContent = `Score: ${state.score}. Tap Restart to try again.`;
  overlay.classList.remove("hidden");
  // stop background music
  try { audio.bgm.pause(); } catch(e){}
}

// restart
function restartGame() {
  // reset
  state.running = true;
  state.score = 0;
  state.health = CONFIG.health;
  state.spawnInterval = CONFIG.initialSpawnInterval;
  state.viruses = [];
  state.virusSpeed = CONFIG.initialVirusSpeed;
  state.level = 1;
  state.lastSpawn = performance.now();
  state.gameOver = false;
  state.paused = false;
  state.lastFrame = 0;
  bursts.length = 0;
  updateHUD();
  overlay.classList.add("hidden");
  if (!muted) audio.bgm.play().catch(()=>{});
  requestAnimationFrame(loop);
}

// pause/resume
function openPause(text="Paused") {
  state.paused = true;
  overlayTitle.textContent = text;
  overlaySub.textContent = "Tap Resume to continue or Restart to start over.";
  overlay.classList.remove("hidden");
}
function closePause(){
  state.paused = false;
  overlay.classList.add("hidden");
}

// -------------------- Event Listeners --------------------
pauseBtn.addEventListener("click", ()=>{
  if (state.paused) {
    closePause();
  } else {
    openPause("Paused");
  }
});

resumeBtn.addEventListener("click", ()=>{
  closePause();
});

restartBtn.addEventListener("click", ()=> {
  startClickFeedback(); // small haptic-ish effect on mobile (no-op fallback)
  restartGame();
});

overlayRestart.addEventListener("click", ()=> {
  restartGame();
});

muteBtn.addEventListener("click", ()=>{
  setMuted(!muted);
});

// keyboard shortcuts
window.addEventListener("keydown", (e)=>{
  if (e.key === " " || e.key.toLowerCase() === "p") {
    e.preventDefault();
    pauseBtn.click();
  } else if (e.key.toLowerCase() === "m") {
    muteBtn.click();
  } else if (e.key.toLowerCase() === "r") {
    restartBtn.click();
  }
});

// tiny vibration emulator (only if supported)
function startClickFeedback(){
  if (navigator.vibrate) navigator.vibrate(10);
}

// -------------------- Init --------------------
function init(){
  updateHUD();
  state.lastSpawn = performance.now();
  // play bg music after user gesture (modern browsers restrict autoplay)
  document.addEventListener("click", function startMusicOnce(){
    if (!muted) {
      audio.bgm.play().catch(()=>{});
    }
    document.removeEventListener("click", startMusicOnce);
  });

  // start loop
  requestAnimationFrame(loop);
}

// start
init();

// ensure canvas resizes on window change
window.addEventListener("resize", () => {
  setupCanvas(canvas, CONFIG.canvasWidth, CONFIG.canvasHeight);
});
