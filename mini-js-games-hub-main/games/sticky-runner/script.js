/* Sticky Runner — main game logic
   - Player sticks to either floor or ceiling.
   - Flip to avoid obstacles.
   - Speed increases over time.
   - Play/Pause/Restart/Mute controls.
   - Highscore saved to localStorage.
*/

/* -----------------------
   CONFIG & ASSETS (online)
   ----------------------- */
const CONFIG = {
  canvasWidth: 1000,
  canvasHeight: 320,
  trackY: 160,         // center line
  playerSize: 34,
  gravityStickDelay: 0, // unused here but kept for concept
  baseSpeed: 4,
  spawnInterval: 1400, // ms initial
  speedIncreaseEvery: 4000, // ms
  spawnMinimumInterval: 520,
  obstacleMinGap: 220,
  obstacleMaxGap: 420
};

// sound assets (public links)
const SOUNDS = {
  jump: "https://actions.google.com/sounds/v1/cartoon/slide_whistle_to_drum_hit.ogg",
  hit:  "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg",
  coin: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
  bgm:  "https://cdn.jsdelivr.net/gh/anars/blank-audio@master/1-seconds-of-silence.mp3" // silent placeholder (optional)
};

/* -----------------------
   DOM & state
   ----------------------- */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = CONFIG.canvasWidth;
canvas.height = CONFIG.canvasHeight;

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const muteBtn = document.getElementById("muteBtn");
const overlay = document.getElementById("overlay");
const overlayPlay = document.getElementById("overlay-play");
const overlayRestart = document.getElementById("overlay-restart");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const difficultyEl = document.getElementById("difficulty");

let lastTimestamp = 0;
let running = false;
let paused = false;
let muted = false;
let gameSpeed = CONFIG.baseSpeed;
let spawnTimer = 0;
let spawnInterval = CONFIG.spawnInterval;
let speedTimer = 0;
let score = 0;
let best = parseInt(localStorage.getItem("sticky-runner-best") || "0", 10);

/* audio */
function createAudio(src, loop=false){
  const a = new Audio(src);
  a.loop = loop;
  a.preload = "auto";
  return a;
}
const sfxJump = createAudio(SOUNDS.jump);
const sfxHit = createAudio(SOUNDS.hit);
const sfxCoin = createAudio(SOUNDS.coin);
const bgm = createAudio(SOUNDS.bgm, true);
bgm.volume = 0.05;

/* update DOM best */
bestEl.textContent = best;

/* -----------------------
   GAME ENTITIES
   ----------------------- */
const player = {
  x: 120,
  y: CONFIG.trackY,
  width: CONFIG.playerSize,
  height: CONFIG.playerSize,
  stickTo: "floor", // "floor" or "ceiling"
  color: "#7c3aed",
  vy: 0,
  isAlive: true
};

let obstacles = [];

/* -----------------------
   UTIL
   ----------------------- */
function rand(min, max){ return Math.random()*(max-min)+min; }
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}

/* -----------------------
   OBSTACLE Factory
   Each obstacle is a rectangle either on floor or ceiling.
   ----------------------- */
function createObstacle(speed){
  // random gap from other obstacles to create variation
  const type = Math.random() < 0.5 ? "floor" : "ceiling";
  const h = rand(22, 66); // height of obstacle
  const gapFromEdge = 8;
  const y = (type === "floor") ? (CONFIG.trackY + gapFromEdge) : (CONFIG.trackY - gapFromEdge - h);
  const w = rand(28, 62);
  return {
    x: canvas.width + 20,
    y: y,
    w: w,
    h: h,
    type: type,
    speed: speed + rand(-0.6, 1.2)
  };
}

/* -----------------------
   CONTROLS
   ----------------------- */
function toggleMute(){
  muted = !muted;
  muteBtn.textContent = muted ? "🔇" : "🔊";
  [sfxJump,sfxHit,sfxCoin,bgm].forEach(a=>a.muted = muted);
}

function playSfx(audio){
  if(!muted && audio && audio.play) {
    // clone to allow overlap
    const cl = audio.cloneNode ? audio.cloneNode(true) : audio;
    try{ cl.currentTime = 0; cl.play(); } catch(e){}
  }
}

function flipPlayer(){
  if(!player.isAlive) return;
  player.stickTo = (player.stickTo === "floor") ? "ceiling" : "floor";
  playSfx(sfxJump);
}

/* keyboard & touch */
window.addEventListener("keydown", (e)=>{
  if(e.code === "Space"){ e.preventDefault(); flipPlayer(); }
  if(e.code === "KeyP"){ togglePause(); }
});
canvas.addEventListener("pointerdown", (e)=>{
  // tap to flip; if overlay visible, start
  if(!running){ startGame(); return; }
  if(paused){ togglePause(); return; }
  flipPlayer();
});

/* UI buttons */
playBtn.addEventListener("click", ()=>{ if(!running) startGame(); else if(paused) togglePause(); });
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", restartGame);
muteBtn.addEventListener("click", toggleMute);
overlayPlay.addEventListener("click", ()=>{ startGame(); });
overlayRestart.addEventListener("click", ()=>{ restartGame(); });

/* -----------------------
   GAME STATE functions
   ----------------------- */
function startGame(){
  // reset state
  running = true; paused = false;
  overlay.classList.add("hidden");
  playBtn.disabled = true; pauseBtn.disabled = false; restartBtn.disabled = false;
  obstacles = [];
  score = 0; scoreEl.textContent = 0;
  player.isAlive = true;
  player.stickTo = "floor";
  spawnInterval = CONFIG.spawnInterval - (difficultyEl.value - 1) * 120;
  gameSpeed = CONFIG.baseSpeed + (difficultyEl.value - 1);
  spawnTimer = 0; speedTimer = 0;
  lastTimestamp = 0;
  try{ bgm.play(); } catch(e){}
  requestAnimationFrame(loop);
}

function togglePause(){
  if(!running) return;
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  playBtn.disabled = !paused;
  if(paused){ /* stop audio if needed */ bgm.pause(); }
  else { try{ bgm.play(); } catch(e){} requestAnimationFrame(loop); }
}

function endGame(){
  running = false;
  player.isAlive = false;
  overlay.classList.remove("hidden");
  document.getElementById("overlay-title").textContent = "Game Over";
  document.getElementById("overlay-sub").textContent = `Score: ${score} • Best: ${best}`;
  playBtn.disabled = false; pauseBtn.disabled = true;
  try{ sfxHit.play(); } catch(e){}
  bgm.pause();
  // save best
  if(score > best){
    best = score;
    localStorage.setItem("sticky-runner-best", best);
    bestEl.textContent = best;
  }
}

function restartGame(){
  running = false; paused = false;
  overlay.classList.remove("hidden");
  document.getElementById("overlay-title").textContent = "Sticky Runner";
  document.getElementById("overlay-sub").textContent = "Tap to start — flip between floor and ceiling.";
  playBtn.disabled = false; pauseBtn.disabled = true; restartBtn.disabled = true;
  try{ bgm.pause(); bgm.currentTime = 0; } catch(e){}
  obstacles = [];
  score = 0; scoreEl.textContent = 0;
}

/* -----------------------
   Collision (AABB)
   ----------------------- */
function rectsOverlap(a, b){
  return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
}

/* -----------------------
   RENDER
   ----------------------- */
function drawScene(){
  // clear
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // ground/ceiling guide
  const mid = CONFIG.trackY;
  // draw floor and ceiling strips
  ctx.fillStyle = "rgba(255,255,255,0.02)";
  ctx.fillRect(0, mid+48, canvas.width, 2);
  ctx.fillRect(0, mid-48-2, canvas.width, 2);

  // draw obstacles
  obstacles.forEach(ob => {
    // gradient
    const g = ctx.createLinearGradient(ob.x, ob.y, ob.x+ob.w, ob.y+ob.h);
    g.addColorStop(0, "rgba(255,80,120,0.9)");
    g.addColorStop(1, "rgba(124,58,237,0.85)");
    ctx.fillStyle = g;
    ctx.fillRect(ob.x, ob.y, ob.w, ob.h);

    // spike decoration (triangles)
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    if(ob.type === "floor"){
      const step = 8;
      for(let sx = 0; sx < ob.w; sx += step){
        ctx.beginPath();
        ctx.moveTo(ob.x+sx, ob.y);
        ctx.lineTo(ob.x+sx+step/2, ob.y-8);
        ctx.lineTo(ob.x+sx+step, ob.y);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      const step = 8;
      for(let sx = 0; sx < ob.w; sx += step){
        ctx.beginPath();
        ctx.moveTo(ob.x+sx, ob.y+ob.h);
        ctx.lineTo(ob.x+sx+step/2, ob.y+ob.h+8);
        ctx.lineTo(ob.x+sx+step, ob.y+ob.h);
        ctx.closePath();
        ctx.fill();
      }
    }
  });

  // draw player
  const p = {
    w: player.width,
    h: player.height,
    x: player.x,
    y: (player.stickTo === "floor") ? (CONFIG.trackY + 48 - player.height) : (CONFIG.trackY - 48)
  };
  // player glow
  const pg = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y + p.h);
  pg.addColorStop(0, "#9be7ff");
  pg.addColorStop(1, "#7c3aed");
  ctx.fillStyle = pg;
  // rounded rect
  roundRect(ctx, p.x, p.y, p.w, p.h, 8);
  ctx.fill();

  // little face
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(p.x + 8, p.y + p.h/2 - 6, 6, 4);
  ctx.fillRect(p.x + p.w - 14, p.y + p.h/2 - 6, 6, 4);

  // score text overlay (canvas)
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.font = "12px Inter, sans-serif";
}

/* round rect helper */
function roundRect(ctx, x, y, w, h, r){
  const radius = r || 6;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y,     x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x,     y + h, radius);
  ctx.arcTo(x,     y + h, x,     y,     radius);
  ctx.arcTo(x,     y,     x + w, y,     radius);
  ctx.closePath();
}

/* -----------------------
   GAME Loop
   ----------------------- */
function loop(timestamp){
  if(!running || paused){ lastTimestamp = timestamp; return; }
  if(!lastTimestamp) lastTimestamp = timestamp;
  const dt = Math.min(40, timestamp - lastTimestamp); // clamp dt
  lastTimestamp = timestamp;

  // update timers
  spawnTimer += dt;
  speedTimer += dt;

  // speed increases over time
  if(speedTimer > CONFIG.speedIncreaseEvery){
    gameSpeed += 0.35;
    speedTimer = 0;
    // clamp
    gameSpeed = clamp(gameSpeed, CONFIG.baseSpeed, 26);
    // also shorten spawn interval gradually
    spawnInterval = Math.max(CONFIG.spawnMinimumInterval, spawnInterval - 60);
  }

  // spawn obstacles
  if(spawnTimer > spawnInterval){
    spawnTimer = 0;
    const ob = createObstacle(gameSpeed);
    obstacles.push(ob);
  }

  // move obstacles
  obstacles.forEach(o => {
    o.x -= (o.speed + gameSpeed) * (dt / 16.666); // scale movement w.r.t frame time
  });
  // remove offscreen
  obstacles = obstacles.filter(o => o.x + o.w > -20);

  // check collisions
  const pBox = {
    x: player.x, y: (player.stickTo === "floor") ? (CONFIG.trackY + 48 - player.height) : (CONFIG.trackY - 48),
    w: player.width, h: player.height
  };
  for(let o of obstacles){
    const oBox = {x:o.x, y:o.y, w:o.w, h:o.h};
    if(rectsOverlap(pBox, oBox) && player.isAlive){
      // if overlap, die
      player.isAlive = false;
      playSfx(sfxHit);
      endGame();
      return;
    }
  }

  // scoring: each frame survived adds fractional score — convert to int
  score += (dt / 1000) * (1 + (gameSpeed/6));
  scoreEl.textContent = Math.floor(score);

  // draw
  drawScene();

  // schedule next frame
  requestAnimationFrame(loop);
}

/* -----------------------
   BULBS INITIALIZATION (visual)
   ----------------------- */
function populateBulbs(){
  const bulbsContainer = document.getElementById("bulbs");
  bulbsContainer.innerHTML = "";
  // create many bulbs across width (visual only)
  const count = 60;
  for(let i=0;i<count;i++){
    const b = document.createElement("div");
    b.className = "bulb";
    bulbsContainer.appendChild(b);
  }
}
populateBulbs();

/* -----------------------
   INIT
   ----------------------- */
restartGame();

/* expose helpful console funcs */
window.stickyRunner = {
  start: startGame,
  pause: togglePause,
  restart: restartGame,
  mute: toggleMute
};
