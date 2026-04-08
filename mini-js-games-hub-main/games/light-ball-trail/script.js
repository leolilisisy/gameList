/* Light Ball Trail — script.js
   Advanced version: pointer / keyboard / touch support, obstacles, pause, restart,
   glow + additive blending, particle trail, online sound assets, UI sliders.
*/

/* ---------------------------
   Asset URLs (online links)
   --------------------------- */
const ASSETS = {
  // Ambient loop (subtle)
  ambient: "https://www.soundjay.com/nature/sounds/rain-01.mp3",
  // Pop / click
  pop: "https://www.soundjay.com/button/sounds/button-16.mp3",
  // Soft bell for collisions
  bell: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
  // background image (subtle pattern). Unsplash "blur" link
  bg: "https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=8df2c3d1a2c9080a3fae8b4954b5b5b8"
};

/* ---------------------------
   Canvas & UI refs
   --------------------------- */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d", { alpha: true });
let cw = canvas.width = Math.floor(canvas.clientWidth);
let ch = canvas.height = Math.floor(canvas.clientHeight);

const playPauseBtn = document.getElementById("playPause");
const stepBtn = document.getElementById("stepFrame");
const restartBtn = document.getElementById("restart");
const centerBtn = document.getElementById("centerBall");
const soundToggle = document.getElementById("soundToggle");

const speedInput = document.getElementById("speed");
const speedVal = document.getElementById("speedVal");
const trailInput = document.getElementById("trailLength");
const trailVal = document.getElementById("trailVal");
const glowInput = document.getElementById("glow");
const glowVal = document.getElementById("glowVal");
const ballSizeInput = document.getElementById("ballSize");
const sizeVal = document.getElementById("sizeVal");
const colorInput = document.getElementById("color");
const obstaclesToggle = document.getElementById("obstaclesToggle");
const wrapToggle = document.getElementById("wrapToggle");

const fpsEl = document.getElementById("fps");
const particleCountEl = document.getElementById("particleCount");
const hitsEl = document.getElementById("hits");

/* ---------------------------
   Audio setup
   --------------------------- */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function createAudio(src, loop = false, volume = 0.5) {
  const audio = new Audio(src);
  audio.crossOrigin = "anonymous";
  audio.loop = loop;
  audio.volume = volume;
  // connect to audio context to control playback across browsers
  const track = audioCtx.createMediaElementSource(audio);
  const gain = audioCtx.createGain();
  gain.gain.value = volume;
  track.connect(gain).connect(audioCtx.destination);
  return audio;
}
const ambientSound = createAudio(ASSETS.ambient, true, 0.25);
ambientSound.loop = true;
const popSound = createAudio(ASSETS.pop, false, 0.8);
const bellSound = createAudio(ASSETS.bell, false, 0.7);

/* ---------------------------
   Game state
   --------------------------- */
let lastTime = 0;
let accumulator = 0;
let running = true;
let frameStep = false;
let hits = 0;
let fps = 0;

let settings = {
  speed: parseFloat(speedInput.value),
  trailLength: parseInt(trailInput.value),
  glow: parseInt(glowInput.value),
  ballSize: parseInt(ballSizeInput.value),
  color: colorInput.value,
  obstacles: obstaclesToggle.checked,
  wrap: wrapToggle.checked,
  sound: soundToggle.checked
};

/* Particles array for trail */
let particles = [];

/* Ball entity */
const ball = {
  x: cw / 2,
  y: ch / 2,
  vx: 0,
  vy: 0,
  speed: 220, // base pixels/sec multiplied by settings.speed
  radius: settings.ballSize
};

/* Obstacles */
let obstacles = [];

/* Controls */
const inputState = {
  left:false,right:false,up:false,down:false,
  pointerDown:false, pointerX:0,pointerY:0
};

/* Touch joystick refs */
const joystick = document.getElementById("touch-joystick");
const joyBase = joystick.querySelector(".joy-base");
const joyStick = joystick.querySelector(".joy-stick");

/* ---------------------------
   Utility functions
   --------------------------- */
function resizeCanvas() {
  cw = canvas.width = Math.floor(canvas.clientWidth);
  ch = canvas.height = Math.floor(canvas.clientHeight);
}
window.addEventListener("resize", () => {
  resizeCanvas();
});

function rand(min, max) { return Math.random()*(max-min)+min; }

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

/* ---------------------------
   Initialize obstacles
   --------------------------- */
function generateObstacles(count = 6) {
  obstacles = [];
  for (let i=0;i<count;i++){
    const w = rand(60, 220) * (Math.random() < 0.5 ? 1 : 0.6);
    const h = rand(20, 120);
    const x = rand(40, cw - w - 40);
    const y = rand(40, ch - h - 40);
    const rot = Math.random() * Math.PI * 2;
    obstacles.push({x,y,w,h,rot, color: `rgba(255,255,255,0.04)`});
  }
}

/* ---------------------------
   Collision
   --------------------------- */
function circleRectCollision(cx, cy, r, rx, ry, rw, rh) {
  // axis-aligned rectangle collision
  const nearestX = clamp(cx, rx, rx + rw);
  const nearestY = clamp(cy, ry, ry + rh);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return (dx*dx + dy*dy) < (r*r);
}

/* ---------------------------
   Particles (trail)
   --------------------------- */
function emitParticle(x,y, sx = 0, sy = 0) {
  const life = rand(0.6, 1.4);
  particles.push({
    x, y,
    vx: sx * rand(0.05, 0.4),
    vy: sy * rand(0.05, 0.4),
    life,
    age: 0,
    alpha: 1,
    size: (settings.ballSize * rand(0.6, 1.6))
  });
  // cap length
  while (particles.length > settings.trailLength) particles.shift();
}

/* ---------------------------
   Input handling
   --------------------------- */
window.addEventListener("keydown", (e)=>{
  if (e.key === "ArrowLeft" || e.key === "a") inputState.left = true;
  if (e.key === "ArrowRight"|| e.key === "d") inputState.right = true;
  if (e.key === "ArrowUp"   || e.key === "w") inputState.up = true;
  if (e.key === "ArrowDown" || e.key === "s") inputState.down = true;

  // space to pause
  if (e.key === " ") {
    toggleRunning();
  }
});
window.addEventListener("keyup",(e)=>{
  if (e.key === "ArrowLeft" || e.key === "a") inputState.left = false;
  if (e.key === "ArrowRight"|| e.key === "d") inputState.right = false;
  if (e.key === "ArrowUp"   || e.key === "w") inputState.up = false;
  if (e.key === "ArrowDown" || e.key === "s") inputState.down = false;
});

/* Pointer */
canvas.addEventListener("pointerdown",(e)=>{
  canvas.setPointerCapture(e.pointerId);
  inputState.pointerDown = true;
  inputState.pointerX = e.clientX - canvas.getBoundingClientRect().left;
  inputState.pointerY = e.clientY - canvas.getBoundingClientRect().top;
  // small nudge towards pointer
});
canvas.addEventListener("pointerup",(e)=>{
  canvas.releasePointerCapture(e.pointerId);
  inputState.pointerDown = false;
});
canvas.addEventListener("pointermove",(e)=>{
  inputState.pointerX = e.clientX - canvas.getBoundingClientRect().left;
  inputState.pointerY = e.clientY - canvas.getBoundingClientRect().top;
});

/* Mobile joystick handling */
let joyActive = false;
let joyCenter = {x:0,y:0};
function startJoystick(ev){
  const rect = canvas.getBoundingClientRect();
  joyActive = true;
  joystick.style.display = "flex";
  joyCenter = { x: ev.touches ? ev.touches[0].clientX - rect.left : ev.clientX - rect.left,
                y: ev.touches ? ev.touches[0].clientY - rect.top : ev.clientY - rect.top };
  joyBase.style.transform = `translate(${joyCenter.x - 43}px, ${joyCenter.y - 43}px)`;
}
function moveJoystick(ev){
  if (!joyActive) return;
  const rect = canvas.getBoundingClientRect();
  const x = ev.touches ? ev.touches[0].clientX - rect.left : ev.clientX - rect.left;
  const y = ev.touches ? ev.touches[0].clientY - rect.top : ev.clientY - rect.top;
  const dx = x - joyCenter.x, dy = y - joyCenter.y;
  const mag = Math.sqrt(dx*dx + dy*dy);
  const max = 36;
  const nx = clamp(dx, -max, max);
  const ny = clamp(dy, -max, max);
  joyStick.style.transform = `translate(${nx}px, ${ny}px)`;
  inputState.pointerX = joyCenter.x + nx;
  inputState.pointerY = joyCenter.y + ny;
}
function endJoystick(){
  joyActive = false;
  joystick.style.display = "none";
  joyStick.style.transform = `translate(0px,0px)`;
}

canvas.addEventListener("touchstart",(e)=>{
  if (e.touches.length === 1) startJoystick(e);
}, {passive:true});
canvas.addEventListener("touchmove",(e)=>{ moveJoystick(e); }, {passive:true});
canvas.addEventListener("touchend",(e)=>{ endJoystick(); }, {passive:true});

/* ---------------------------
   Rendering
   --------------------------- */
function clearCanvas() {
  // paint a subtle background image overlay (low alpha)
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = "rgba(5,8,18,0.6)";
  ctx.fillRect(0,0,cw,ch);
  ctx.restore();
}

function drawBackgroundPattern() {
  // subtle vignette/texture using image
  if (!drawBackgroundPattern.img) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = ASSETS.bg;
    drawBackgroundPattern.img = img;
    img.onload = ()=>{};
  }
  const img = drawBackgroundPattern.img;
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.drawImage(img, 0, 0, cw, ch);
  ctx.restore();
}

function drawObstacles() {
  if (!settings.obstacles) return;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  obstacles.forEach(o=>{
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.w, o.h);
    // subtle outline
    ctx.strokeStyle = "rgba(255,255,255,0.02)";
    ctx.strokeRect(o.x, o.y, o.w, o.h);
  });
  ctx.restore();
}

function drawParticles() {
  // additive blending and shadow for glow
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.age += 1/60;
    const t = p.age / p.life;
    p.alpha = Math.max(0, 1 - t);
    p.x += p.vx;
    p.y += p.vy;
    const size = p.size * (1 - t*0.6);

    ctx.beginPath();
    ctx.globalAlpha = p.alpha * 0.9;
    ctx.shadowBlur = settings.glow * (0.6 + 0.6*(1 - t));
    ctx.shadowColor = settings.color;
    ctx.fillStyle = settings.color;
    ctx.arc(p.x, p.y, size, 0, Math.PI*2);
    ctx.fill();

    if (p.age >= p.life) particles.splice(i,1);
  }
  ctx.restore();
}

function drawBall() {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const r = settings.ballSize;
  ctx.shadowBlur = settings.glow;
  ctx.shadowColor = settings.color;
  // main core
  const grad = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, r*3);
  grad.addColorStop(0, settings.color);
  grad.addColorStop(0.2, settings.color + '88');
  grad.addColorStop(0.6, settings.color + '33');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, r*1.6, 0, Math.PI*2);
  ctx.fill();

  // core highlight
  ctx.globalCompositeOperation = 'screen';
  ctx.beginPath();
  ctx.globalAlpha = 0.9;
  ctx.arc(ball.x - r*0.2, ball.y - r*0.2, r*0.9, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fill();

  ctx.restore();
}

/* ---------------------------
   Physics & update loop
   --------------------------- */
function physicsStep(dt) {
  // speed multiplier
  const spd = ball.speed * settings.speed;

  // pointer target movement: if pointerDown, move toward pointer
  if (inputState.pointerDown || joyActive) {
    const dx = inputState.pointerX - ball.x;
    const dy = inputState.pointerY - ball.y;
    const dist = Math.hypot(dx,dy) || 1;
    const nx = dx/dist, ny = dy/dist;
    ball.vx = nx * spd * (dt * 1);
    ball.vy = ny * spd * (dt * 1);
  } else {
    // keyboard movement
    let ax = 0, ay = 0;
    if (inputState.left) ax -= 1;
    if (inputState.right) ax += 1;
    if (inputState.up) ay -= 1;
    if (inputState.down) ay += 1;
    if (ax !== 0 || ay !== 0) {
      const mag = Math.hypot(ax,ay) || 1;
      ball.vx = (ax/mag) * spd * dt * 60;
      ball.vy = (ay/mag) * spd * dt * 60;
    } else {
      // gradual friction
      ball.vx *= 0.92;
      ball.vy *= 0.92;
    }
  }

  ball.x += ball.vx;
  ball.y += ball.vy;

  // wrap or clamp
  if (settings.wrap) {
    if (ball.x < -50) ball.x = cw + 50;
    if (ball.x > cw + 50) ball.x = -50;
    if (ball.y < -50) ball.y = ch + 50;
    if (ball.y > ch + 50) ball.y = -50;
  } else {
    ball.x = clamp(ball.x, settings.ballSize, cw - settings.ballSize);
    ball.y = clamp(ball.y, settings.ballSize, ch - settings.ballSize);
  }

  // emit particles based on speed
  const speedMagnitude = Math.hypot(ball.vx, ball.vy);
  const emitCount = Math.ceil(clamp(speedMagnitude * 0.08, 1, 4));
  for (let i=0;i<emitCount;i++){
    emitParticle(ball.x + rand(-2,2), ball.y + rand(-2,2), -ball.vx*0.08, -ball.vy*0.08);
  }

  // obstacle collisions
  if (settings.obstacles) {
    obstacles.forEach(o => {
      if (circleRectCollision(ball.x, ball.y, settings.ballSize*1.0, o.x, o.y, o.w, o.h)) {
        // simple response: bounce back by reversing velocity and nudging out
        ball.vx *= -0.6;
        ball.vy *= -0.6;
        // move ball out of obstacle along minimal vector
        if (ball.x > o.x && ball.x < o.x + o.w) {
          if (ball.y < o.y) ball.y = o.y - settings.ballSize - 2;
          else ball.y = o.y + o.h + settings.ballSize + 2;
        } else {
          if (ball.x < o.x) ball.x = o.x - settings.ballSize - 2;
          else ball.x = o.x + o.w + settings.ballSize + 2;
        }
        // audio cue + hit count
        hits++;
        if (settings.sound) { bellSound.currentTime = 0; bellSound.play(); }
      }
    });
  }
}

/* ---------------------------
   Main loop
   --------------------------- */
function loop(t) {
  if (!lastTime) lastTime = t;
  const dt = Math.min(0.05, (t - lastTime) / 1000);
  lastTime = t;

  if (running || frameStep) {
    // update
    physicsStep(dt);

    // draw
    clearCanvas();
    drawBackgroundPattern();
    drawObstacles();
    drawParticles();
    drawBall();
  }

  // update UI stats
  fps = Math.round(1 / (dt || 1/60));
  fpsEl.textContent = fps;
  particleCountEl.textContent = particles.length;
  hitsEl.textContent = hits;

  if (frameStep) frameStep = false;

  requestAnimationFrame(loop);
}

/* ---------------------------
   UI Wiring
   --------------------------- */
function toggleRunning() {
  running = !running;
  playPauseBtn.textContent = running ? "Pause" : "Play";
  if (running && settings.sound) {
    try { ambientSound.play(); } catch(e) { /* Autoplay blocked until user gesture */ }
  } else {
    try { ambientSound.pause(); } catch(e){}
  }
}
playPauseBtn.addEventListener("click", toggleRunning);
stepBtn.addEventListener("click", ()=>{ frameStep = true; toggleRunning(); toggleRunning(); /* trigger one frame */ });
restartBtn.addEventListener("click", ()=>{
  resetGame();
  if (settings.sound) { popSound.currentTime = 0; popSound.play(); }
});
centerBtn.addEventListener("click", ()=>{
  ball.x = cw/2; ball.y = ch/2; ball.vx=0; ball.vy=0;
});

speedInput.addEventListener("input", e=>{
  settings.speed = parseFloat(e.target.value); speedVal.textContent = settings.speed.toFixed(2);
});
trailInput.addEventListener("input", e=>{
  settings.trailLength = parseInt(e.target.value); trailVal.textContent = settings.trailLength;
});
glowInput.addEventListener("input", e=>{
  settings.glow = parseInt(e.target.value); glowVal.textContent = settings.glow;
});
ballSizeInput.addEventListener("input", e=>{
  settings.ballSize = parseInt(e.target.value); sizeVal.textContent = settings.ballSize;
});
colorInput.addEventListener("input", e=>{
  settings.color = e.target.value;
});
obstaclesToggle.addEventListener("change", e=>{
  settings.obstacles = e.target.checked;
  if (settings.obstacles && obstacles.length === 0) generateObstacles(6);
});
wrapToggle.addEventListener("change", e=>{
  settings.wrap = e.target.checked;
});
soundToggle.addEventListener("change", e=>{
  settings.sound = e.target.checked;
  if (!settings.sound) { try { ambientSound.pause(); } catch(e){} }
  else { try { ambientSound.play(); } catch(e){} }
});

/* Pointer down to toggle pointer control on click */
canvas.addEventListener("dblclick", ()=>{
  // center ball
  ball.x = inputState.pointerX || cw/2;
  ball.y = inputState.pointerY || ch/2;
});

/* Pointer hold -> treat as target */
canvas.addEventListener("mousedown", (e)=>{
  inputState.pointerDown = true;
  inputState.pointerX = e.clientX - canvas.getBoundingClientRect().left;
  inputState.pointerY = e.clientY - canvas.getBoundingClientRect().top;
});
window.addEventListener("mouseup", ()=>{ inputState.pointerDown = false; });

/* ---------------------------
   Reset / Init
   --------------------------- */
function resetGame() {
  particles = [];
  ball.x = cw/2; ball.y = ch/2; ball.vx=0; ball.vy=0;
  hits = 0;
  particles.length = 0;
  if (settings.obstacles) generateObstacles(6);
}

/* ---------------------------
   Start up
   --------------------------- */
function init() {
  resizeCanvas();
  // set UI values display
  speedVal.textContent = speedInput.value;
  trailVal.textContent = trailInput.value;
  glowVal.textContent = glowInput.value;
  sizeVal.textContent = ballSizeInput.value;
  // set initial settings
  settings = {
    speed: parseFloat(speedInput.value),
    trailLength: parseInt(trailInput.value),
    glow: parseInt(glowInput.value),
    ballSize: parseInt(ballSizeInput.value),
    color: colorInput.value,
    obstacles: obstaclesToggle.checked,
    wrap: wrapToggle.checked,
    sound: soundToggle.checked
  };

  // generate obstacles
  if (settings.obstacles) generateObstacles(6);

  // play ambient only after user gesture; try to pre-warm audio context on first interaction
  function userGesture() {
    try{ audioCtx.resume(); }catch(e){}
    document.removeEventListener('pointerdown', userGesture);
  }
  document.addEventListener('pointerdown', userGesture);

  requestAnimationFrame(loop);
}
init();

/* Expose for debug */
window.LBT = { reset: resetGame, settings, particles, ball };

