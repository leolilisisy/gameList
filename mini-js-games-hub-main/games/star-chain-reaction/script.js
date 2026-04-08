// script.js (Star Chain Reaction)
// Path: games/star-chain-reaction/script.js
// Uses Canvas API, requestAnimationFrame, and online sound assets.

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: true });

let W, H, rafId;
function resize() {
  W = canvas.width = Math.floor(canvas.clientWidth * devicePixelRatio);
  H = canvas.height = Math.floor(canvas.clientHeight * devicePixelRatio);
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener('resize', () => { resize(); });

resize();

/* --------------------------
   Online sound assets (Google Actions public sounds)
   -------------------------- */
const sounds = {
  click: new Audio('https://actions.google.com/sounds/v1/buttons/button_press.ogg'),
  explode: new Audio('https://actions.google.com/sounds/v1/explosions/explosion_crunch.ogg'),
  catch: new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg'),
  particle: new Audio('https://actions.google.com/sounds/v1/ambiences/whoosh.ogg')
};
sounds.click.volume = 0.6;
sounds.explode.volume = 0.6;
sounds.catch.volume = 0.6;
sounds.particle.volume = 0.16;

let muted = false;
const muteBtn = document.getElementById('muteBtn');
muteBtn.addEventListener('click', () => {
  muted = !muted;
  muteBtn.textContent = muted ? '🔇' : '🔊';
});
function playSound(name) {
  if (muted) return;
  const s = sounds[name];
  if (!s) return;
  try {
    s.currentTime = 0;
    s.play().catch(()=>{/* autoplay block might stop first play */});
  } catch (e) {}
}

/* --------------------------
   Game variables
   -------------------------- */

const scoreEl = document.getElementById('score');
const highEl = document.getElementById('highscore');
const caughtEl = document.getElementById('caught');
const starCountEl = document.getElementById('starCount');
const attemptsLeftEl = document.getElementById('attemptsLeft');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const levelSelect = document.getElementById('level');
const visualGlow = document.getElementById('visualGlow');
const particlesOn = document.getElementById('particlesOn');

let stars = [];
let explosions = [];
let particles = [];
let running = false;
let paused = false;
let score = 0;
let caught = 0;
let highScore = parseInt(localStorage.getItem('scr_high')||"0",10) || 0;
highEl.textContent = highScore;
let attemptsLeft = 1;

const LEVELS = [
  { count: 14, speed: 0.6 },
  { count: 22, speed: 1.0 },
  { count: 30, speed: 1.7 },
  { count: 46, speed: 2.4 }
];

/* Helper utils */
function rand(min, max){ return Math.random()*(max-min)+min; }
function dist(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return Math.sqrt(dx*dx+dy*dy); }

/* Star Class */
class Star {
  constructor(x,y,radius=8,speed=1){
    this.x = x;
    this.y = y;
    this.r = radius;
    const ang = rand(0, Math.PI*2);
    this.vx = Math.cos(ang)*speed;
    this.vy = Math.sin(ang)*speed;
    this.colorHue = Math.floor(rand(180, 360));
    this.caught = false;
    this.exploding = false;
    this.born = Date.now();
    this.glow = rand(6, 18);
  }
  step(dt){
    if(this.caught || this.exploding) return;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    // bounce edges
    if(this.x < this.r || this.x > canvas.clientWidth - this.r){
      this.vx *= -1; this.x = Math.max(this.r, Math.min(canvas.clientWidth - this.r, this.x));
    }
    if(this.y < this.r || this.y > canvas.clientHeight - this.r){
      this.vy *= -1; this.y = Math.max(this.r, Math.min(canvas.clientHeight - this.r, this.y));
    }
  }
  draw(ctx){
    ctx.save();
    const glowOn = visualGlow.checked;
    if(glowOn){
      ctx.shadowColor = `hsla(${this.colorHue}, 90%, 60%, 0.9)`;
      ctx.shadowBlur = this.glow + 12;
    } else {
      ctx.shadowBlur = 0;
    }

    // star body (draw 5-point star)
    drawStar(ctx, this.x, this.y, 5, this.r, this.r*0.45, `hsl(${this.colorHue}, 95%, 60%)`);
    ctx.restore();
  }
  explode(){
    if(this.exploding) return;
    this.exploding = true;
    // spawn explosion circle
    explosions.push(new Explosion(this.x, this.y));
    // spawn particles
    if(particlesOn.checked){
      for(let i=0;i<18;i++){
        particles.push(new Particle(this.x, this.y, this.colorHue));
      }
    }
    playSound('explode');
    // mark as caught
    this.caught = true;
    caught++;
    score += 10;
    updateUI();
  }
}

/* Explosion circle - expands and then fades */
class Explosion {
  constructor(x,y){
    this.x=x; this.y=y;
    this.radius = 10;
    this.maxRadius = rand(60, 95);
    this.growth = rand(160, 260);
    this.life = 0;
    this.alpha = 1;
  }
  step(dt){
    this.radius += (this.growth * dt) / 1000;
    this.life += dt;
    if(this.radius >= this.maxRadius){
      this.alpha -= dt/500;
    }
  }
  draw(ctx){
    ctx.save();
    const grd = ctx.createRadialGradient(this.x,this.y,this.radius*0.2,this.x,this.y,this.radius);
    grd.addColorStop(0, `rgba(255,230,150,${0.85*this.alpha})`);
    grd.addColorStop(0.2, `rgba(255,120,60,${0.6*this.alpha})`);
    grd.addColorStop(1, `rgba(255,40,30,${0.02*this.alpha})`);
    ctx.beginPath();
    ctx.fillStyle = grd;
    ctx.globalCompositeOperation = 'lighter';
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fill();

    // rim glow
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(255,255,255,${0.06*this.alpha})`;
    ctx.stroke();
    ctx.restore();
  }
}

/* Particle */
class Particle {
  constructor(x,y,hue){
    this.x=x;this.y=y;
    const a=rand(0,Math.PI*2), s=rand(0.6,2.2);
    this.vx=Math.cos(a)*s*rand(30,90)/60;
    this.vy=Math.sin(a)*s*rand(30,90)/60;
    this.life=rand(600,1400);
    this.age=0;
    this.size = rand(1.2,3.2);
    this.hue = hue||rand(200,340);
    this.alpha = 1;
  }
  step(dt){
    this.age += dt;
    this.x += this.vx*dt/16;
    this.y += this.vy*dt/16;
    this.vy += 0.012*dt/16;
    this.alpha = Math.max(0, 1 - this.age / this.life);
  }
  draw(ctx){
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = `hsl(${this.hue}, 90%, 60%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

/* utility: draw a n-point star at x,y */
function drawStar(ctx, x, y, points, outerR, innerR, fillStyle){
  ctx.save();
  ctx.beginPath();
  const step = Math.PI / points;
  for(let i=0;i<2*points;i++){
    const r = i%2===0 ? outerR : innerR;
    const a = i*step - Math.PI/2;
    const px = x + Math.cos(a)*r;
    const py = y + Math.sin(a)*r;
    if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
  }
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

/* --------------------------
   Boot / Round management
   -------------------------- */
function spawnStars(count, lvlSpeed){
  stars = [];
  for(let i=0;i<count;i++){
    // avoid edges initially
    const margin = 30;
    const x = rand(margin, canvas.clientWidth - margin);
    const y = rand(margin, canvas.clientHeight - margin);
    const r = rand(6, 12);
    const speed = rand(0.6, 1.0) * (lvlSpeed || 1);
    stars.push(new Star(x,y,r,speed));
  }
  starCountEl.textContent = stars.length;
}

function startRound(){
  const lvl = parseInt(levelSelect.value,10);
  const config = LEVELS[Math.max(0, Math.min(LEVELS.length-1, lvl))];
  spawnStars(config.count, config.speed);
  explosions = [];
  particles = [];
  score = 0;
  caught = 0;
  attemptsLeft = 1;
  running = true;
  paused = false;
  startBtn.disabled = true;
  pauseBtn.textContent = 'Pause';
  updateUI();
  lastTime = performance.now();
  playSound('particle');
  loop();
}

function restartRound(){
  running = false;
  startBtn.disabled = false;
  pauseBtn.textContent = 'Pause';
  spawnStars(LEVELS[Math.max(0,Math.min(LEVELS.length-1, parseInt(levelSelect.value,10)))].count,
             LEVELS[parseInt(levelSelect.value,10)].speed);
  explosions = [];
  particles = [];
  score = 0;
  caught = 0;
  attemptsLeft = 1;
  updateUI();
  cancelAnimationFrame(rafId);
  ctx.clearRect(0,0,canvas.clientWidth, canvas.clientHeight);
}

function pauseToggle(){
  if(!running) return;
  paused = !paused;
  if(paused){
    pauseBtn.textContent = 'Resume';
    cancelAnimationFrame(rafId);
  } else {
    pauseBtn.textContent = 'Pause';
    lastTime = performance.now();
    loop();
  }
}

/* UI updates */
function updateUI(){
  scoreEl.textContent = score | 0;
  caughtEl.textContent = caught | 0;
  starCountEl.textContent = stars.length;
  attemptsLeftEl.textContent = attemptsLeft;
  highScore = Math.max(highScore, score);
  highEl.textContent = highScore;
  localStorage.setItem('scr_high', String(highScore));
}

/* Input: single-click to spawn explosion */
canvas.addEventListener('click', (e) => {
  if(!running || paused) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left);
  const y = (e.clientY - rect.top);
  sounds.click && playSound('click');
  // spawn initial explosion with stronger radius
  const ex = new Explosion(x, y);
  ex.maxRadius = rand(120, 180);
  ex.growth = rand(240,400);
  explosions.push(ex);
});

/* Collision detection */
function checkCollisions(){
  // for each explosion, check stars within radius
  for(let i=explosions.length-1;i>=0;i--){
    const e = explosions[i];
    if(e.alpha <= 0.02) continue;
    for(let j=0;j<stars.length;j++){
      const s = stars[j];
      if(s.caught || s.exploding) continue;
      const d = Math.hypot(s.x - e.x, s.y - e.y);
      if(d <= e.radius + s.r*0.6){
        s.explode(); // will add more explosions & particles
        playSound('catch');
      }
    }
  }
}

/* Game loop */
let lastTime = performance.now();
function loop(t){
  rafId = requestAnimationFrame(loop);
  if(!running || paused) return;
  const now = t || performance.now();
  const dt = Math.min(40, now - lastTime); // clamp dt
  lastTime = now;

  // physics step
  for(const s of stars) s.step(dt*0.06);
  for(const e of explosions) e.step(dt);
  for(const p of particles) p.step(dt);

  // check collisions
  checkCollisions();

  // remove dead explosions and particles
  explosions = explosions.filter(e => e.alpha > 0.02);
  particles = particles.filter(p => p.alpha > 0.02);

  // rendering
  ctx.clearRect(0,0,canvas.clientWidth, canvas.clientHeight);

  // subtle background overlay for more contrast
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(0,0,canvas.clientWidth, canvas.clientHeight);
  ctx.restore();

  // draw explosions under stars (so glow shows from behind)
  for(const e of explosions) e.draw(ctx);
  // draw particles
  for(const p of particles) p.draw(ctx);
  // draw stars
  for(const s of stars) s.draw(ctx);

  // optional HUD small hint
  ctx.save();
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillText('Click once to start a chain reaction', 12, canvas.clientHeight - 12);
  ctx.restore();
}

/* End round detection: if all stars are caught or time passes (optional) */
function checkRoundEnd(){
  if(!running) return;
  const remaining = stars.filter(s=>!s.caught).length;
  if(remaining === 0){
    // round finished
    running = false;
    startBtn.disabled = false;
    updateUI();
    // award bonus based on chain strength
    playSound('catch');
    // update highscore
    highScore = Math.max(highScore, score);
    localStorage.setItem('scr_high', String(highScore));
    setTimeout(()=> {
      alert(`Round complete!\nScore: ${score}\nHigh: ${highScore}`);
    }, 150);
  }
}

/* animation loop wrapper with round end checks */
function loopWrapper(t){
  loop(t);
  checkRoundEnd();
}
function loopStart(){
  lastTime = performance.now();
  rafId = requestAnimationFrame(loopWrapper);
}

/* attach UI buttons */
startBtn.addEventListener('click', () => {
  if(!running) {
    startRound();
    loopStart();
  }
});
pauseBtn.addEventListener('click', pauseToggle);
restartBtn.addEventListener('click', () => {
  restartRound();
});

/* quick start on page load for UX */
window.addEventListener('load', () => {
  // initial spawn (preview)
  spawnStars(LEVELS[1].count, LEVELS[1].speed);
  updateUI();
  // small gentle animation preview
  lastTime = performance.now();
  running = false;
  paused = false;
  // allow spacebar to toggle start/pause
  window.addEventListener('keydown', (e) => {
    if(e.code === 'Space'){ e.preventDefault(); if(!running) { startBtn.click(); } else pauseBtn.click(); }
  });
});

/* small interval to check round end too */
setInterval(checkRoundEnd, 800);

/* expose for debug */
window.SCR = { startRound, restartRound, togglePause: pauseToggle };

