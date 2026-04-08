/* Pixel Wall Breaker — script.js
   Place in games/pixel-wall-breaker/script.js
*/

// ---------- Asset URLs (public, online) ----------
const SOUND_BOUNCE = "https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg";
const SOUND_POP = "https://assets.mixkit.co/sfx/preview/mixkit-fast-small-burst-1683.mp3";
const SOUND_LEVEL = "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg";
const SOUND_SHOOT = "https://actions.google.com/sounds/v1/cartoon/slide_whistle_to_drum_hit.ogg";
const AMBIENT = "https://actions.google.com/sounds/v1/ambiences/arcade_room.ogg"; // ambient loop (optional)

// ---------- Canvas & context ----------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Keep internal size consistent; canvas looks crisp on high DPI
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  draw();
});

// ---------- UI elements ----------
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const livesEl = document.getElementById("lives");
const btnPause = document.getElementById("btn-pause");
const btnRestart = document.getElementById("btn-restart");
const btnSound = document.getElementById("btn-sound");
const centerInfo = document.getElementById("centerInfo");
const centerTitle = document.getElementById("centerTitle");
const centerMsg = document.getElementById("centerMsg");
const centerContinue = document.getElementById("centerContinue");
const centerRetry = document.getElementById("centerRetry");
const powerProgress = document.getElementById("power-progress");
const ballsCountSelect = document.getElementById("balls-count");

// ---------- Sound handling ----------
let soundEnabled = true;
const sounds = {};
function loadSound(name, url) {
  const a = new Audio(url);
  a.preload = "auto";
  a.volume = 0.6;
  sounds[name] = a;
}
loadSound("bounce", SOUND_BOUNCE);
loadSound("pop", SOUND_POP);
loadSound("shoot", SOUND_SHOOT);
loadSound("level", SOUND_LEVEL);
const ambientAudio = new Audio(AMBIENT);
ambientAudio.loop = true;
ambientAudio.volume = 0.25;

// helper to play
function playSound(name) {
  if (!soundEnabled) return;
  const s = sounds[name];
  if (!s) return;
  // clone/pause trick for overlapping play
  const clone = s.cloneNode();
  clone.volume = s.volume;
  clone.play().catch(()=>{});
}

// toggle sound
btnSound.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  btnSound.textContent = `Sound: ${soundEnabled ? "On" : "Off"}`;
  if (soundEnabled) ambientAudio.play().catch(()=>{});
  else ambientAudio.pause();
});

// ---------- Game state ----------
let state = {
  score: 0,
  level: 1,
  lives: 3,
  running: true,
  paused: false
};

// playfield bounds (logical)
const pf = {
  x: 10, y: 10,
  width: canvas.getBoundingClientRect().width - 20,
  height: canvas.getBoundingClientRect().height - 20
};

// shooter location (bottom-left)
let shooter = { x: 50, y: (canvas.getBoundingClientRect().height - 40), size: 36 };

// aiming
let isAiming = false;
let aimStart = null;
let aimCurrent = null;
let power = 50;

// ball physics parameters
const gravity = 0.18; // slight gravity for arc
const friction = 0.998; // velocity retention on bounces

// arrays
let balls = [];
let bricks = [];

// level definitions generator
function generateLevel(level) {
  // clear arrays
  balls = [];
  bricks = [];
  const rows = Math.min(6 + Math.floor(level/2), 10);
  const cols = 9;
  const brickW = Math.floor((pf.width - 60) / cols);
  const brickH = 28;
  const startX = 30;
  const startY = 40;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Only some bricks exist — create patterns
      const probability = 0.88 - level*0.01; // fewer holes as level increases
      if (Math.random() < probability) {
        const hp = 1 + Math.floor((level + r) / 4); // HP increases with level
        bricks.push({
          x: startX + c * (brickW + 6),
          y: startY + r * (brickH + 8),
          w: brickW,
          h: brickH,
          hp: hp,
          colorSeed: (r + c) % 5
        });
      }
    }
  }
  // ensure at least some bricks exist
  if (bricks.length === 0) {
    bricks.push({x:startX, y:startY, w:brickW, h:brickH, hp:level, colorSeed:0});
  }
}

// reset level/start
function startLevel(levelNum) {
  state.level = levelNum;
  state.running = true;
  state.paused = false;
  balls = [];
  generateLevel(levelNum);
  updateUI();
  playSound("level");
  // show small center message
  showCenter(`Level ${levelNum}`, `Clear all bricks to progress!`, 900);
}

// game over
function gameOver() {
  state.running = false;
  showCenter("Game Over", `Your score: ${state.score}`, null, false);
}

// show center overlay
function showCenter(title, msg, autoClose=0, showContinue=true) {
  centerTitle.textContent = title;
  centerMsg.textContent = msg;
  centerContinue.style.display = showContinue ? "inline-block" : "none";
  centerInfo.hidden = false;
  centerInfo.style.pointerEvents = "auto";
  if (autoClose) {
    setTimeout(()=>{ centerInfo.hidden = true; centerInfo.style.pointerEvents="none";}, autoClose);
  }
}

// hide center
function hideCenter() {
  centerInfo.hidden = true;
  centerInfo.style.pointerEvents = "none";
}

// UI update
function updateUI() {
  scoreEl.textContent = state.score;
  levelEl.textContent = state.level;
  livesEl.textContent = state.lives;
  powerProgress.value = power;
}

// ------------ Shooting / aiming logic ------------
function spawnBall(x, y, vx, vy) {
  balls.push({
    x, y, vx, vy, r: 7 + Math.random()*3, life: 200, stuck:false
  });
  playSound("shoot");
}

function fireFromAim() {
  const count = parseInt(ballsCountSelect.value,10) || 1;
  // compute vector
  if (!aimStart || !aimCurrent) return;
  const dx = aimStart.x - aimCurrent.x;
  const dy = aimStart.y - aimCurrent.y;
  const mag = Math.hypot(dx, dy) || 1;
  const normX = dx / mag;
  const normY = dy / mag;
  const speedScale = Math.min(2.5 + power/30, 8);
  // spawn multiple balls with slight spread
  for (let i=0;i<count;i++){
    const spread = (i - (count-1)/2) * 0.12;
    const vx = normX * speedScale + spread;
    const vy = normY * speedScale - (Math.random()*0.2);
    spawnBall(shooter.x + 10 + Math.random()*8, shooter.y - 6, vx * -6, vy * -6);
  }
}

// ---------- collision helpers ----------
function rectCircleCollide(circle, rect) {
  const cx = circle.x;
  const cy = circle.y;
  const rx = rect.x;
  const ry = rect.y;
  const rw = rect.w;
  const rh = rect.h;

  const nearestX = Math.max(rx, Math.min(cx, rx+rw));
  const nearestY = Math.max(ry, Math.min(cy, ry+rh));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return (dx*dx + dy*dy) < (circle.r * circle.r);
}

// ---------- Game update loop ----------
let last = performance.now();
function update(now) {
  if (!state.running || state.paused) { last = now; requestAnimationFrame(update); return; }
  const dt = Math.min(40, now-last);
  last = now;

  // update balls
  balls.forEach((b)=>{
    // physics
    b.vy += gravity * (dt/16);
    b.x += b.vx * (dt/16);
    b.y += b.vy * (dt/16);
    b.vx *= friction;
    b.vy *= friction;

    // bounce walls (playfield boundaries)
    if (b.x - b.r < pf.x) { b.x = pf.x + b.r; b.vx = -b.vx * 0.92; playSound("bounce"); }
    if (b.x + b.r > pf.x + pf.width) { b.x = pf.x + pf.width - b.r; b.vx = -b.vx * 0.92; playSound("bounce"); }
    if (b.y - b.r < pf.y) { b.y = pf.y + b.r; b.vy = -b.vy * 0.92; playSound("bounce"); }
    // floor: if ball goes below bottom
    if (b.y - b.r > pf.y + pf.height) {
      b.dead = true;
    }

    // collisions with bricks
    for (let i = bricks.length - 1; i >= 0; i--) {
      const br = bricks[i];
      if (rectCircleCollide(b, br)) {
        // simple normal: push ball out by reversing velocity depending on collision side
        // compute centers
        const cx = b.x, cy = b.y;
        // if collision predominantly vertical or horizontal
        const overlapX = Math.max(br.x - cx, 0, cx - (br.x + br.w));
        const overlapY = Math.max(br.y - cy, 0, cy - (br.y + br.h));
        // approximate response
        b.vy = -b.vy * 0.92;
        b.vx = b.vx * 0.95;
        // damage brick
        br.hp -= 1;
        if (br.hp <= 0) {
          bricks.splice(i,1);
          state.score += 10;
          playSound("pop");
        } else {
          state.score += 2;
          playSound("bounce");
        }
      }
    }
  });

  // remove dead balls
  balls = balls.filter(b => !b.dead && (b.life === undefined || b.life-- > 0));

  // level clear check
  if (bricks.length === 0) {
    // next level
    state.score += 100 * state.level;
    startLevel(state.level + 1);
  }

  // no balls and player fired previously -> lose life and reset shooting position
  if (balls.length === 0 && !isAiming) {
    // Nothing active - keep waiting for player
  }

  updateUI();
  draw();
  requestAnimationFrame(update);
}

// ---------- Drawing ----------
function draw() {
  // clear
  const W = canvas.width / (window.devicePixelRatio || 1);
  const H = canvas.height / (window.devicePixelRatio || 1);
  ctx.clearRect(0,0,W,H);

  // playfield background
  ctx.fillStyle = "#041826";
  ctx.fillRect(pf.x, pf.y, pf.width, pf.height);

  // draw grid lines subtle
  ctx.strokeStyle = "rgba(255,255,255,0.02)";
  ctx.lineWidth = 1;
  for (let gx = pf.x; gx < pf.x + pf.width; gx += 40) {
    ctx.beginPath(); ctx.moveTo(gx, pf.y); ctx.lineTo(gx, pf.y + pf.height); ctx.stroke();
  }

  // draw bricks
  bricks.forEach(br=>{
    // choose color based on hp or seed
    let hue = 200 + (br.colorSeed * 30);
    let sat = 80;
    // color shifts with hp
    const light = Math.max(30, 70 - br.hp * 6);
    ctx.fillStyle = `hsl(${hue} ${sat}% ${light}%)`;
    // draw rounded rect
    roundRect(ctx, br.x, br.y, br.w, br.h, 6, true, false);
    // inner glossy
    ctx.fillStyle = `rgba(255,255,255,0.06)`;
    roundRect(ctx, br.x+4, br.y+4, br.w-8, 6, 3, true, false);
    // hp indicator small bar
    ctx.fillStyle = `rgba(0,0,0,0.35)`;
    roundRect(ctx, br.x + 6, br.y + br.h - 10, br.w - 12, 6, 3, true, false);
    ctx.fillStyle = `rgba(255,255,255,0.9)`;
    const hpWidth = Math.max(4, (br.w - 12) * Math.min(1, br.hp / (1+state.level/3)));
    ctx.fillRect(br.x + 6, br.y + br.h - 10, hpWidth, 6);
  });

  // draw balls
  balls.forEach(b=>{
    // neon glow
    ctx.beginPath();
    const grd = ctx.createRadialGradient(b.x, b.y, b.r*0.2, b.x, b.y, b.r*3);
    grd.addColorStop(0, "rgba(255,255,255,0.95)");
    grd.addColorStop(0.2, "rgba(134,255,255,0.9)");
    grd.addColorStop(1, "rgba(54,240,255,0.06)");
    ctx.fillStyle = grd;
    ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.fill();
    // outline
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.stroke();
  });

  // draw shooter indicator
  ctx.save();
  ctx.translate(shooter.x, shooter.y);
  ctx.fillStyle = "#9bf1ff";
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  roundRect(ctx, -12, -12, shooter.size, shooter.size, 8, true, true);
  ctx.restore();

  // draw aim line if aiming
  if (isAiming && aimStart && aimCurrent) {
    ctx.save();
    ctx.strokeStyle = "rgba(54,240,255,0.9)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6,6]);
    ctx.beginPath();
    ctx.moveTo(aimStart.x, aimStart.y);
    ctx.lineTo(aimCurrent.x, aimCurrent.y);
    ctx.stroke();
    ctx.setLineDash([]);
    // power arc
    const dx = aimStart.x - aimCurrent.x;
    const dy = aimStart.y - aimCurrent.y;
    const p = Math.min(100, Math.floor(Math.hypot(dx,dy)));
    ctx.fillStyle = "rgba(54,240,255,0.06)";
    ctx.fillRect(aimStart.x+20, aimStart.y-20, p, 6);
    ctx.restore();
  }
}

// rounded rect helper
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// ---------- Input handling ----------
const rect = canvas.getBoundingClientRect();

function getPointer(e) {
  const P = e.touches ? e.touches[0] : e;
  // convert to canvas coords
  const r = canvas.getBoundingClientRect();
  return { x: P.clientX - r.left, y: P.clientY - r.top };
}

canvas.addEventListener("pointerdown", (e) => {
  if (state.paused || !state.running) return;
  isAiming = true;
  aimStart = { x: shooter.x, y: shooter.y };
  aimCurrent = getPointer(e);
});

canvas.addEventListener("pointermove", (e) => {
  if (!isAiming) return;
  aimCurrent = getPointer(e);
  const dx = aimStart.x - aimCurrent.x;
  const dy = aimStart.y - aimCurrent.y;
  const mag = Math.min(120, Math.hypot(dx,dy));
  power = Math.floor(Math.min(100, mag));
  powerProgress.value = power;
});

canvas.addEventListener("pointerup", (e) => {
  if (!isAiming) return;
  isAiming = false;
  aimCurrent = getPointer(e);
  fireFromAim();
  aimStart = null; aimCurrent = null;
});

// support touch cancel
canvas.addEventListener("pointercancel", ()=>{
  isAiming = false; aimStart=null; aimCurrent=null;
});

// ---------- Buttons ----------
btnPause.addEventListener("click", () => {
  state.paused = !state.paused;
  btnPause.textContent = state.paused ? "Resume" : "Pause";
  if (!state.paused) {
    last = performance.now();
    requestAnimationFrame(update);
  }
});
btnRestart.addEventListener("click", () => {
  state.score = 0;
  state.lives = 3;
  startLevel(1);
});
centerContinue.addEventListener("click", () => {
  hideCenter();
  if (!state.running) startLevel(1);
});
centerRetry.addEventListener("click", () => {
  hideCenter();
  state.score = 0;
  state.lives = 3;
  startLevel(1);
});

// ---------- Start game ----------
startLevel(1);
updateUI();
requestAnimationFrame(update);

// Start ambient if sound enabled
if (soundEnabled) ambientAudio.play().catch(()=>{});

// ---------- Optional: keyboard shortcuts ----------
window.addEventListener("keydown", (e) => {
  if (e.key === "p") btnPause.click();
  if (e.key === "r") btnRestart.click();
  if (e.key === "m") btnSound.click();
});

// that's it — functions are intentionally compact and robust.
