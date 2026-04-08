/* UFO Escape - script.js
   Features:
   - Canvas rendering with glow
   - Player UFO movement (keyboard + mobile touch)
   - Enemies (saucers) spawn from top and move down
   - Energy orbs spawn (score & powerups)
   - Pause / Resume / Start / Restart / Mute
   - Difficulty ramp by level/elapsed time
   - LocalStorage highscore
*/

/* ----------------------
   SOUND ASSET LINKS (online)
   ----------------------
   Using Google Actions sounds (publicly accessible):
   - collectSound: orb pickup
   - hitSound: collision / explosion
   - shootSound: optional
   - bgMusic: light background loop (kept short)
*/
const SOUNDS = {
  collect: 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg',
  hit: 'https://actions.google.com/sounds/v1/impacts/metal_crash.ogg',
  explosion: 'https://actions.google.com/sounds/v1/explosions/explosion_crash.ogg',
  bg: 'https://actions.google.com/sounds/v1/alarms/medium_bell_ring.ogg' // short loop-like bell
};

// small helper to load audio
function createAudio(url, loop = false, vol = 0.6) {
  const a = new Audio(url);
  a.loop = loop;
  a.volume = vol;
  a.preload = 'auto';
  return a;
}

/* ----------------------
   DOM
*/
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');
const muteBtn = document.getElementById('muteBtn');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const overlayStart = document.getElementById('overlayStart');
const overlayResume = document.getElementById('overlayResume');

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const energyEl = document.getElementById('energy');
const levelEl = document.getElementById('level');
const highscoreEl = document.getElementById('highscore');

let W = canvas.width = canvas.clientWidth;
let H = canvas.height = canvas.clientHeight;

/* ----------------------
   Game State
*/
let running = false;
let paused = false;
let muted = false;
let lastTime = 0;
let spawnTimer = 0;
let orbTimer = 0;
let difficultyTimer = 0;
let elapsed = 0;

let score = 0;
let lives = 3;
let energy = 0;
let level = 1;
const highscoreKey = 'ufoEscapeHighscore';
let highscore = parseInt(localStorage.getItem(highscoreKey) || '0', 10);

/* sounds */
const sndCollect = createAudio(SOUNDS.collect, false, 0.5);
const sndHit = createAudio(SOUNDS.hit, false, 0.6);
const sndExplode = createAudio(SOUNDS.explosion, false, 0.7);
const sndBg = createAudio(SOUNDS.bg, true, 0.25);

/* Entities */
const player = {
  x: W / 2,
  y: H - 80,
  w: 68,
  h: 26,
  speed: 6,
  vx: 0,
  glow: 18
};

let enemies = []; // saucers
let orbs = []; // energy orbs

/* tuning */
let spawnInterval = 1100; // ms initial
let orbInterval = 2200;
let enemySpeedBase = 1.2;
let maxEnemies = 6;

/* input */
const keys = {};
let touchX = null;

/* helpers */
function rand(min, max) { return Math.random() * (max - min) + min; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

/* resize handling */
function resize() {
  W = canvas.width = canvas.clientWidth;
  H = canvas.height = canvas.clientHeight;
  player.y = H - 80;
}
window.addEventListener('resize', () => { resize(); });

/* ----------------------
   Entity constructors
*/
function spawnEnemy() {
  const size = rand(36, 70);
  const x = rand(size / 2, W - size / 2);
  const speed = enemySpeedBase + rand(0, 1.4) + (level - 1) * 0.25;
  enemies.push({
    x, y: -rand(20, 120), size, speed,
    wobble: rand(0.6, 1.6),
    rotation: rand(-0.6, 0.6)
  });
  // cap
  if (enemies.length > maxEnemies) enemies.splice(0, enemies.length - maxEnemies);
}

function spawnOrb() {
  const r = rand(8, 16);
  const x = rand(r, W - r);
  const speed = 1 + rand(0, 0.8) + (level - 1) * 0.12;
  orbs.push({ x, y: -rand(10, 200), r, speed, wob: rand(0.4, 1.4) });
}

/* ----------------------
   Game start / stop / reset
*/
function resetGame() {
  enemies = []; orbs = [];
  running = false; paused = false;
  lastTime = performance.now();
  spawnTimer = orbTimer = difficultyTimer = elapsed = 0;
  score = 0; lives = 3; energy = 0; level = 1;
  spawnInterval = 1100; orbInterval = 2200; enemySpeedBase = 1.2; maxEnemies = 6;
  player.x = W / 2;
  updateHUD();
  overlayTitle.textContent = 'UFO Escape';
  overlayText.textContent = 'Press Start to begin';
  overlay.classList.remove('hidden');
  pauseBtn.disabled = true; resumeBtn.disabled = true; restartBtn.disabled = true;
  startBtn.disabled = false;
  if (!muted) { sndBg.pause(); sndBg.currentTime = 0; }
}

function startGame() {
  running = true; paused = false; lastTime = performance.now();
  overlay.classList.add('hidden');
  pauseBtn.disabled = false; resumeBtn.disabled = true; restartBtn.disabled = false;
  startBtn.disabled = true;
  if (!muted) {
    sndBg.currentTime = 0;
    sndBg.play().catch(() => {});
  }
  window.requestAnimationFrame(loop);
}

function pauseGame() {
  if (!running || paused) return;
  paused = true; resumeBtn.disabled = false; pauseBtn.disabled = true;
  overlay.classList.remove('hidden');
  overlayTitle.textContent = 'Paused';
  overlayText.textContent = 'Game is paused';
  overlayResume.style.display = 'inline-block';
  if (!muted) sndBg.pause();
}

function resumeGame() {
  if (!running || !paused) return;
  paused = false; pauseBtn.disabled = false; resumeBtn.disabled = true;
  overlay.classList.add('hidden');
  if (!muted) sndBg.play().catch(() => {});
  lastTime = performance.now();
  window.requestAnimationFrame(loop);
}

function gameOver() {
  running = false;
  paused = false;
  overlay.classList.remove('hidden');
  overlayTitle.textContent = 'Game Over';
  overlayText.textContent = `Score: ${score} — Press Restart to play again`;
  restartBtn.disabled = false; pauseBtn.disabled = true; resumeBtn.disabled = true;
  startBtn.disabled = true;
  if (score > highscore) {
    highscore = score;
    localStorage.setItem(highscoreKey, String(highscore));
  }
  updateHUD();
  if (!muted) { sndBg.pause(); sndExplode.play().catch(()=>{}); }
}

/* ----------------------
   Collision util
*/
function rectCircleCollision(px, py, pr, cx, cy, cw, ch) {
  // not used directly; use circle-based checks below
  return false;
}

function circleHit(ax, ay, ar, bx, by, br) {
  const dx = ax - bx, dy = ay - by;
  return dx * dx + dy * dy < (ar + br) * (ar + br);
}

/* ----------------------
   Update / game loop
*/
function update(dt) {
  elapsed += dt;
  spawnTimer += dt;
  orbTimer += dt;
  difficultyTimer += dt;

  // increase difficulty over time
  if (difficultyTimer > 8000) {
    difficultyTimer = 0;
    level += 1;
    spawnInterval = Math.max(420, spawnInterval - 80);
    orbInterval = Math.max(900, orbInterval - 90);
    enemySpeedBase += 0.18;
    maxEnemies = Math.min(12, maxEnemies + 1);
  }

  // spawn enemies & orbs
  if (spawnTimer > spawnInterval) {
    spawnTimer = 0;
    spawnEnemy();
  }
  if (orbTimer > orbInterval) {
    orbTimer = 0;
    spawnOrb();
  }

  // player horizontal movement
  if (keys['ArrowLeft'] || keys['a'] || (touchX !== null && touchX < W/2)) {
    player.vx = -player.speed;
  } else if (keys['ArrowRight'] || keys['d'] || (touchX !== null && touchX > W/2)) {
    player.vx = player.speed;
  } else player.vx = 0;

  player.x += player.vx;
  player.x = clamp(player.x, player.w / 2 + 6, W - player.w / 2 - 6);

  // update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.y += e.speed * dt / 16 * 1.0;
    e.x += Math.sin((elapsed / 300) * e.wobble) * 0.9; // wobble
    if (e.y - e.size > H + 40) enemies.splice(i, 1);

    // collision: enemy vs player (use circular approximations)
    const ex = e.x, ey = e.y, er = e.size * 0.5;
    const px = player.x, py = player.y - 6, pr = Math.max(player.w, player.h) * 0.4;
    if (circleHit(px, py, pr, ex, ey, er)) {
      // hit
      enemies.splice(i, 1);
      lives -= 1;
      if (!muted) sndHit.play().catch(()=>{});
      if (lives <= 0) {
        gameOver();
        return;
      }
      updateHUD();
      // small screen shake: store for draw
      screenShake = 12;
    }
  }

  // update orbs
  for (let i = orbs.length - 1; i >= 0; i--) {
    const o = orbs[i];
    o.y += o.speed * dt / 16 * 1.0;
    o.x += Math.sin((elapsed / 190) * o.wob) * 0.9;
    if (o.y - o.r > H + 20) orbs.splice(i, 1);

    // collect?
    if (circleHit(player.x, player.y - 6, Math.max(player.w, player.h) * 0.4, o.x, o.y, o.r)) {
      orbs.splice(i, 1);
      score += 10 + Math.floor(level * 2);
      energy = Math.min(100, energy + 14);
      if (!muted) sndCollect.play().catch(()=>{});
      updateHUD();
    }
  }

  // rewards based on energy
  if (energy >= 100) {
    energy = 0;
    score += 80 + level * 8;
    lives = Math.min(6, lives + 1); // small extra life
    if (!muted) sndCollect.play().catch(()=>{});
    updateHUD();
  }

  // incremental score over time
  score += Math.floor(dt / 800);
  updateHUD();
}

/* ----------------------
   Drawing
*/
let screenShake = 0;

function draw() {
  // clear
  ctx.clearRect(0, 0, W, H);

  // background stars
  ctx.save();
  ctx.fillStyle = '#010214';
  ctx.fillRect(0, 0, W, H);
  // subtle starfield
  for (let i = 0; i < 60; i++) {
    const sx = (i * 97 + (elapsed/6) % W) % W;
    const sy = (i * 37 + (elapsed/9)) % H;
    ctx.fillStyle = 'rgba(255,255,255,' + (0.03 + (i%7)/70) + ')';
    ctx.fillRect(sx, sy, 1, 1);
  }
  ctx.restore();

  // parallax nebula glow
  ctx.save();
  const grad = ctx.createRadialGradient(W*0.15, H*0.12, 20, W*0.15, H*0.12, W*0.9);
  grad.addColorStop(0, 'rgba(138, 92, 246, 0.12)');
  grad.addColorStop(1, 'rgba(1, 2, 8, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // screen shake transform
  if (screenShake > 0) {
    const s = (Math.random() - 0.5) * screenShake;
    ctx.translate(s, s * 0.6);
    screenShake *= 0.85;
    if (screenShake < 0.1) screenShake = 0;
  }

  // draw orbs (glowing)
  for (const o of orbs) {
    ctx.save();
    ctx.beginPath();
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(122,255,255,0.85)';
    const gradO = ctx.createRadialGradient(o.x, o.y, 1, o.x, o.y, o.r*3);
    gradO.addColorStop(0, 'rgba(122,255,255,0.95)');
    gradO.addColorStop(0.4, 'rgba(122,255,255,0.25)');
    gradO.addColorStop(1, 'rgba(122,255,255,0)');
    ctx.fillStyle = gradO;
    ctx.arc(o.x, o.y, o.r*1.8, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // draw enemies (UFO saucer style)
  for (const e of enemies) {
    ctx.save();
    ctx.translate(e.x, e.y);
    // glow
    ctx.beginPath();
    ctx.shadowBlur = 30;
    ctx.shadowColor = 'rgba(255, 120, 120, 0.18)';
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.ellipse(0, 0, e.size*0.9, e.size*0.35, 0, 0, Math.PI*2);
    ctx.fill();

    // saucer body
    ctx.beginPath();
    ctx.shadowBlur = 18;
    ctx.shadowColor = 'rgba(255, 120, 120, 0.35)';
    const bodyGrad = ctx.createLinearGradient(-e.size*0.7, 0, e.size*0.7, 0);
    bodyGrad.addColorStop(0, '#ff8899');
    bodyGrad.addColorStop(1, '#ff5c8a');
    ctx.fillStyle = bodyGrad;
    ctx.ellipse(0, 0, e.size*0.6, e.size*0.26, 0, 0, Math.PI*2);
    ctx.fill();

    // glass dome
    ctx.beginPath();
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(255,255,255,0.12)';
    ctx.fillStyle = 'rgba(14, 21, 35, 0.7)';
    ctx.ellipse(0, -e.size*0.15, e.size*0.28, e.size*0.18, 0, 0, Math.PI*2);
    ctx.fill();

    // little lights
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(255,255,170,0.9)';
      ctx.fillStyle = `rgba(255,${200 - i*12}, ${60 + i*10}, 0.98)`;
      ctx.arc(i * (e.size*0.16), e.size*0.04, Math.max(2, e.size*0.04), 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  // draw player UFO
  ctx.save();
  ctx.translate(player.x, player.y);
  // glow ring
  ctx.beginPath();
  ctx.shadowBlur = player.glow + 10;
  ctx.shadowColor = 'rgba(122,255,255,0.22)';
  ctx.fillStyle = 'rgba(122,255,255,0.02)';
  ctx.ellipse(0, 0, player.w*1.6, player.h*2.2, 0, 0, Math.PI*2);
  ctx.fill();

  // main hull
  ctx.beginPath();
  ctx.shadowBlur = 18;
  ctx.shadowColor = 'rgba(122,255,255,0.35)';
  const hullGrad = ctx.createLinearGradient(-player.w/2, 0, player.w/2, 0);
  hullGrad.addColorStop(0, '#8bf3ff');
  hullGrad.addColorStop(1, '#7afcff');
  ctx.fillStyle = hullGrad;
  ctx.ellipse(0, 0, player.w, player.h, 0, 0, Math.PI*2);
  ctx.fill();

  // cockpit dome
  ctx.beginPath();
  ctx.shadowBlur = 6;
  ctx.shadowColor = 'rgba(255,255,255,0.12)';
  ctx.fillStyle = 'rgba(5,16,26,0.7)';
  ctx.ellipse(0, -8, player.w*0.36, player.h*0.5, 0, 0, Math.PI*2);
  ctx.fill();

  // thruster glow
  ctx.beginPath();
  ctx.shadowBlur = 28;
  ctx.shadowColor = 'rgba(255, 200, 90, 0.18)';
  ctx.fillStyle = 'rgba(255,200,90,0.06)';
  ctx.ellipse(0, player.h*0.9, player.w*0.55, player.h*0.4, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.restore();
}

/* ----------------------
   HUD update
*/
function updateHUD() {
  scoreEl.textContent = Math.max(0, Math.floor(score));
  livesEl.textContent = lives;
  energyEl.textContent = Math.floor(energy);
  levelEl.textContent = level;
  highscoreEl.textContent = highscore;
}

/* ----------------------
   Main loop
*/
function loop(ts) {
  if (!running || paused) return;
  const dt = ts - lastTime;
  lastTime = ts;

  update(dt);
  draw();

  if (running && !paused) window.requestAnimationFrame(loop);
}

/* ----------------------
   Input handlers
*/
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === 'p') pauseGame();
  if (e.key === 'r') { if (!running) startGame(); else { resetGame(); startGame(); } }
});
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

canvas.addEventListener('touchstart', (ev) => {
  ev.preventDefault();
  const t = ev.changedTouches[0];
  touchX = t.clientX - canvas.getBoundingClientRect().left;
});
canvas.addEventListener('touchmove', (ev) => {
  ev.preventDefault();
  const t = ev.changedTouches[0];
  touchX = t.clientX - canvas.getBoundingClientRect().left;
});
canvas.addEventListener('touchend', (ev) => { touchX = null; });

/* mouse optional steering */
canvas.addEventListener('mousemove', (ev) => {
  // small subtle follow when mouse moves (desktop players may like it)
  // not enabling continuous follow; keyboard/touch is primary
});

/* ----------------------
   Buttons
*/
startBtn.addEventListener('click', () => {
  if (!running) startGame();
});
pauseBtn.addEventListener('click', () => pauseGame());
resumeBtn.addEventListener('click', () => resumeGame());
restartBtn.addEventListener('click', () => {
  resetGame();
  startGame();
});
overlayStart.addEventListener('click', () => { startGame(); });
overlayResume.addEventListener('click', () => { resumeGame(); });

muteBtn.addEventListener('click', () => {
  muted = !muted;
  muteBtn.textContent = muted ? '🔇' : '🔊';
  if (muted) {
    sndBg.pause();
    sndCollect.muted = sndHit.muted = sndExplode.muted = true;
  } else {
    sndCollect.muted = sndHit.muted = sndExplode.muted = false;
    if (running && !paused) sndBg.play().catch(()=>{});
  }
});

/* ----------------------
   Start initial state
*/
resetGame();
updateHUD();
draw();
