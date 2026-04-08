/* Light Orb Quest
   - Canvas-based tile world
   - Fog-of-war with radial glow + LOS (raycast)
   - Movement, flares, pause, restart, treasures, traps, exit
   - Simple WebAudio-generated SFX
*/

/* =========================
   Config & Utilities
   ========================= */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d", { alpha: false });

const TILE_SIZE = 48;                // size in px
const COLS = 20;                     // recommended grid 20x12 for 960x576 canvas
const ROWS = 12;
canvas.width = TILE_SIZE * COLS;
canvas.height = TILE_SIZE * ROWS;

const levelNameEl = document.getElementById("levelName");
const movesEl = document.getElementById("moves");
const lightRadiusEl = document.getElementById("lightRadius");
const collectedEl = document.getElementById("collected");
const totalTreasuresEl = document.getElementById("totalTreasures");
const inventoryEl = document.getElementById("inventory");

const overlay = document.getElementById("overlayMessage");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayRestart = document.getElementById("overlayRestart");
const overlayContinue = document.getElementById("overlayContinue");

const btnPause = document.getElementById("btnPause");
const btnRestart = document.getElementById("btnRestart");
const btnFlare = document.getElementById("btnFlare");

let paused = false;

/* Simple WebAudio for SFX */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(freq=440, type='sine', length=0.12, gain=0.08){
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + length);
}

/* =========================
   Level generation
   ========================= */

/*
grid[r][c] values:
0 = floor, 1 = wall, 2 = trap, 3 = treasure, 4 = exit
*/
function createEmptyGrid(rows, cols, fill=0){
  const g = [];
  for(let r=0;r<rows;r++){
    const row = new Array(cols).fill(fill);
    g.push(row);
  }
  return g;
}

/* procedural-ish level: outer walls, rooms, randomized walls, some treasures & traps */
function generateLevel(){
  const grid = createEmptyGrid(ROWS, COLS, 0);
  // border walls
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      if(r===0||c===0||r===ROWS-1||c===COLS-1) grid[r][c]=1;
    }
  }
  // scatter random walls
  for(let i=0;i<120;i++){
    const r = randInt(1, ROWS-2);
    const c = randInt(1, COLS-2);
    if(Math.random() < 0.2) grid[r][c]=1;
  }
  // carve some corridors: simple drunk-walker
  let r = Math.floor(ROWS/2), c = Math.floor(COLS/2);
  for(let i=0;i<300;i++){
    grid[r][c]=0;
    const dir = Math.floor(Math.random()*4);
    if(dir===0) r = Math.min(ROWS-2, r+1);
    if(dir===1) r = Math.max(1, r-1);
    if(dir===2) c = Math.min(COLS-2, c+1);
    if(dir===3) c = Math.max(1, c-1);
  }
  // place treasures
  let treasures = 0;
  for(let i=0;i<10;i++){
    const rr = randInt(1, ROWS-2), cc = randInt(1, COLS-2);
    if(grid[rr][cc]===0 && Math.random()>0.2){
      grid[rr][cc]=3; treasures++;
    }
  }
  // place traps
  for(let i=0;i<14;i++){
    const rr = randInt(1, ROWS-2), cc = randInt(1, COLS-2);
    if(grid[rr][cc]===0 && Math.random()>0.4) grid[rr][cc]=2;
  }
  // ensure a clear exit location at border
  const exits = [
    {r:1,c:Math.floor(COLS/2)},
    {r:ROWS-2,c:Math.floor(COLS/2)},
    {r:Math.floor(ROWS/2),c:1},
    {r:Math.floor(ROWS/2),c:COLS-2}
  ];
  const exitChoice = exits[randInt(0, exits.length-1)];
  grid[exitChoice.r][exitChoice.c]=4;
  // find a spawn (floor cell)
  let spawn = {r:Math.floor(ROWS/2), c:Math.floor(COLS/2)};
  for(let i=0;i<200;i++){
    const rr = randInt(1,ROWS-2), cc = randInt(1,COLS-2);
    if(grid[rr][cc]===0) { spawn={r:rr,c:cc}; break; }
  }
  return {grid, spawn, treasures};
}

function randInt(min,max){ return Math.floor(Math.random()*(max-min))+min; }

/* =========================
   Game state
   ========================= */

let levelState = null;
let orb = null;     // {r,c,lightRadius}
let moves = 0;
let collected = 0;
let visible = createEmptyGrid(ROWS, COLS, false); // boolean map of visible tiles
let flareCooldown = 0;
let inventory = {flares:1, upgrades:0};
let enemies = []; // simple moving hazards
let tick = 0;

/* =========================
   Raycast LOS helper
   returns true if tile (tr,tc) can be seen from orb given walls blocking
   using simple Bresenham line algorithm sampling tiles along line
   ========================= */
function tileVisible(sr, sc, tr, tc) {
  // distance check
  const dx = tc - sc, dy = tr - sr;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if(dist > orb.lightRadius + 0.5) return false;
  // Bresenham
  let x0 = sc + 0.5, y0 = sr + 0.5;
  let x1 = tc + 0.5, y1 = tr + 0.5;
  const dxLine = Math.abs(x1 - x0), dyLine = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dxLine - dyLine;
  let steps = 0;
  while(true){
    const cx = Math.floor(x0), cy = Math.floor(y0);
    if(cx===tc && cy===tr) return true;
    // if tile is wall (excl source), block
    if(!(cx===sc && cy===sr) && levelState.grid[cy] && levelState.grid[cy][cx]===1) return false;
    if(Math.abs(x0 - x1) < 0.01 && Math.abs(y0 - y1) < 0.01) break;
    const e2 = 2*err;
    if(e2 > -dyLine){ err -= dyLine; x0 += sx; }
    if(e2 < dxLine){ err += dxLine; y0 += sy; }
    if(++steps > 200) break;
  }
  return true;
}

/* Compute visible map each frame */
function computeVisible(){
  visible = createEmptyGrid(ROWS, COLS, false);
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      if(tileVisible(orb.r, orb.c, r, c)) visible[r][c] = true;
    }
  }
}

/* =========================
   Rendering
   ========================= */

function draw(){
  // static background
  ctx.fillStyle = '#061018';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // draw tiles
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const x = c*TILE_SIZE, y = r*TILE_SIZE;
      const cell = levelState.grid[r][c];
      // base floor
      ctx.fillStyle = '#09111a';
      ctx.fillRect(x,y,TILE_SIZE,TILE_SIZE);
      // visible floor details
      if(visible[r][c]){
        // floor pattern
        if(cell===1){
          // wall
          ctx.fillStyle = '#16262f';
          ctx.fillRect(x+4,y+4,TILE_SIZE-8,TILE_SIZE-8);
          // wall texture lines
          ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(x+6,y+8); ctx.lineTo(x+TILE_SIZE-6,y+8); ctx.stroke();
        } else if(cell===2){
          // trap
          ctx.fillStyle = '#2b0f0f';
          ctx.fillRect(x+6,y+6,TILE_SIZE-12,TILE_SIZE-12);
          ctx.fillStyle = '#ff6b6b';
          ctx.fillRect(x+TILE_SIZE/2-6,y+TILE_SIZE/2-2,12,4);
        } else if(cell===3){
          // treasure
          ctx.fillStyle = '#2b3b2f';
          ctx.fillRect(x+6,y+6,TILE_SIZE-12,TILE_SIZE-12);
          // gold icon
          ctx.fillStyle = '#ffd166';
          ctx.beginPath();
          ctx.ellipse(x+TILE_SIZE/2,y+TILE_SIZE/2,8,6,0,0,Math.PI*2);
          ctx.fill();
        } else if(cell===4){
          // exit
          ctx.fillStyle = '#1b2b2b';
          ctx.fillRect(x+6,y+6,TILE_SIZE-12,TILE_SIZE-12);
          ctx.fillStyle = '#8cf7ff';
          ctx.fillRect(x+TILE_SIZE/2-4,y+TILE_SIZE/2-10,8,20);
        } else {
          // plain floor - add small stones
          ctx.fillStyle = '#0f1a20';
          ctx.fillRect(x+2,y+2,TILE_SIZE-4,TILE_SIZE-4);
        }
      } else {
        // dark floor (still drawn but darker)
        ctx.fillStyle = '#05070a';
        ctx.fillRect(x,y,TILE_SIZE,TILE_SIZE);
      }

      // subtle grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      ctx.strokeRect(x+0.5,y+0.5,TILE_SIZE-1,TILE_SIZE-1);
    }
  }

  // draw enemies (if visible)
  enemies.forEach(en => {
    if(visible[en.r][en.c]){
      const x = en.c*TILE_SIZE + TILE_SIZE/2;
      const y = en.r*TILE_SIZE + TILE_SIZE/2;
      ctx.fillStyle = '#ff5d5d';
      ctx.beginPath();
      ctx.arc(x,y, TILE_SIZE*0.28, 0, Math.PI*2);
      ctx.fill();
    }
  });

  // draw orb glow using global composite - big radial gradient
  const orbX = orb.c*TILE_SIZE + TILE_SIZE/2;
  const orbY = orb.r*TILE_SIZE + TILE_SIZE/2;

  // whole screen dark overlay
  ctx.fillStyle = 'rgba(2,3,6,0.85)';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // cut out illumination by destination-out with radial gradient
  // create offscreen gradient canvas for better glow
  const grd = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, TILE_SIZE*(orb.lightRadius+1.5));
  grd.addColorStop(0, 'rgba(255,255,220,0.98)');
  grd.addColorStop(0.12, 'rgba(255,240,200,0.6)');
  grd.addColorStop(0.3, 'rgba(220,200,180,0.28)');
  grd.addColorStop(0.6, 'rgba(80,82,90,0.08)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');

  // We will draw gradient only on visible tiles to simulate walls blocking light:
  // create a temporary canvas to mask LOS
  const tmp = document.createElement('canvas');
  tmp.width = canvas.width; tmp.height = canvas.height;
  const tctx = tmp.getContext('2d');
  // fill with transparent black
  tctx.clearRect(0,0,tmp.width,tmp.height);
  // draw gradient
  tctx.fillStyle = grd;
  tctx.fillRect(0,0,tmp.width,tmp.height);

  // Mask: set pixels for tiles not visible to fully transparent (erase)
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      if(!visible[r][c]){
        const x = c*TILE_SIZE, y = r*TILE_SIZE;
        tctx.clearRect(x,y,TILE_SIZE,TILE_SIZE);
      }
    }
  }
  // draw the temp onto main canvas using 'destination-out' to cut darkness
  ctx.globalCompositeOperation = 'destination-out';
  ctx.drawImage(tmp,0,0);
  ctx.globalCompositeOperation = 'source-over';

  // draw orb sprite (glowing)
  ctx.beginPath();
  const orbGlow = ctx.createRadialGradient(orbX,orbY,0,orbX,orbY,TILE_SIZE*0.8);
  orbGlow.addColorStop(0,'rgba(255,255,240,1)');
  orbGlow.addColorStop(0.2,'rgba(200,255,220,0.9)');
  orbGlow.addColorStop(1,'rgba(150,200,220,0.05)');
  ctx.fillStyle = orbGlow;
  ctx.arc(orbX,orbY,TILE_SIZE*0.5,0,Math.PI*2);
  ctx.fill();

  // orb center
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(orbX,orbY,6,0,Math.PI*2); ctx.fill();

  // draw UI overlays for visible treasures/traps icons
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const cell = levelState.grid[r][c];
      if(!visible[r][c]) continue;
      const x = c*TILE_SIZE, y = r*TILE_SIZE;
      if(cell===3){
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(x+TILE_SIZE-18,y+6,12,12);
      } else if(cell===2){
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(x+6,y+TILE_SIZE-18,12,12);
      }
    }
  }

  // HUD - small indicators: draw light radius on top-left small
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(12,12,160,48);
  ctx.fillStyle = '#bfe8d7';
  ctx.font = '13px Inter, Arial';
  ctx.fillText('Light radius: ' + orb.lightRadius, 22, 34);
}

/* =========================
   Game mechanics
   ========================= */

function spawnEnemies(){
  enemies = [];
  for(let i=0;i<4;i++){
    const r = randInt(1,ROWS-1), c = randInt(1,COLS-1);
    if(levelState.grid[r][c] === 0 && !(r===orb.r && c===orb.c)) {
      enemies.push({r,c,dir: randInt(0,4)});
    }
  }
}

function stepEnemies(){
  enemies.forEach(en=>{
    // simple random walker but they prefer to move toward orb if close
    const dist = Math.hypot(en.r-orb.r, en.c-orb.c);
    if(dist < 6 && Math.random() > 0.5){
      // move towards orb
      const dr = Math.sign(orb.r - en.r);
      const dc = Math.sign(orb.c - en.c);
      tryMoveEn(en, en.r+dr, en.c+dc);
    } else {
      // random move
      const d = randInt(0,4);
      const nr = en.r + (d===0?1:d===1?-1:0);
      const nc = en.c + (d===2?1:d===3?-1:0);
      tryMoveEn(en, nr, nc);
    }
  });
}

function tryMoveEn(en, nr, nc){
  if(nr<1||nc<1||nr>=ROWS-1||nc>=COLS-1) return;
  if(levelState.grid[nr][nc]===1) return;
  // do not stack on orb
  if(nr===orb.r && nc===orb.c) {
    handleEnemyContact(en);
    return;
  }
  en.r = nr; en.c = nc;
  // enemy steps into trap/treasure ignored
}

function handleEnemyContact(en){
  // if enemy sees orb (i.e., visible tile), it hurts player
  if(visible[en.r][en.c]){
    // damage -> restart or penalty
    playBeep(120, 'sawtooth', 0.18, 0.12);
    showOverlay("Caught!", "An enemy caught your orb in the dark. You lose some light radius.", false);
    orb.lightRadius = Math.max(2, orb.lightRadius - 1);
  }
}

/* Move orb */
function moveOrb(dr, dc){
  if(paused) return;
  const nr = orb.r + dr, nc = orb.c + dc;
  if(nr<0||nc<0||nr>=ROWS||nc>=COLS) return;
  // wall check
  if(levelState.grid[nr][nc] === 1) {
    playBeep(220, 'square', 0.08, 0.06); // bump
    return;
  }
  orb.r = nr; orb.c = nc;
  moves++;
  movesEl.textContent = moves;
  playBeep(600, 'sine', 0.06, 0.02);
  // stepping interactions
  const cell = levelState.grid[nr][nc];
  if(cell === 3){
    // treasure
    collected++;
    levelState.grid[nr][nc] = 0;
    collectedEl.textContent = collected;
    playBeep(980, 'triangle', 0.12, 0.12);
    inventory.coins = (inventory.coins || 0) + 1;
    inventoryEl.textContent = `Flares: ${inventory.flares} · Coins: ${inventory.coins || 0}`;
    if(collected >= levelState.treasures) {
      showOverlay("All Treasures Collected", "You found all treasures! Now find the exit.", true, false);
    }
  } else if(cell === 2) {
    // trap: lose light radius
    levelState.grid[nr][nc] = 0; // reveal trap used
    playBeep(160, 'sawtooth', 0.18, 0.12);
    orb.lightRadius = Math.max(2, orb.lightRadius - 1);
    lightRadiusEl.textContent = orb.lightRadius;
    showOverlay("Trap!", "A hidden trap damaged the orb's light. Light reduced.", false);
  } else if(cell===4){
    // exit
    if(collected >= Math.max(0, Math.floor(levelState.treasures/2))){
      // allow exit if collected some treasures (design choice)
      showOverlay("Level Complete", "You reached the exit. Well done!", true);
    } else {
      showOverlay("Exit Locked", "You need to collect more treasures to unlock this exit.", false);
    }
  }

  // enemies may step
  if(Math.random() < 0.45) stepEnemies();
}

/* Use flare */
function useFlare(){
  if(paused) return;
  if(flareCooldown>0) {
    showOverlay("No Flares", "Flare is on cooldown.", false);
    return;
  }
  if(inventory.flares <= 0) {
    showOverlay("Out of Flares", "No flares left. Find treasures to get more.", false);
    return;
  }
  inventory.flares--;
  inventoryEl.textContent = `Flares: ${inventory.flares} · Coins: ${inventory.coins || 0}`;
  flareCooldown = 18; // ticks for cooldown
  // temporarily increase light radius
  const prev = orb.lightRadius;
  orb.lightRadius += 3;
  lightRadiusEl.textContent = orb.lightRadius;
  playBeep(1400, 'sine', 0.25, 0.18);
  // schedule revert after some frames
  setTimeout(()=>{
    orb.lightRadius = Math.max(2, prev);
    lightRadiusEl.textContent = orb.lightRadius;
  }, 2200);
}

/* =========================
   UI Helpers
   ========================= */

function showOverlay(title, text, allowContinue=true, autoHide=true){
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.remove('hidden');
  if(!allowContinue) overlayContinue.style.display = 'none'; else overlayContinue.style.display = 'inline-block';
  if(autoHide && allowContinue){
    setTimeout(()=>{ overlay.classList.add('hidden'); }, 1100);
  }
}

overlayRestart.addEventListener('click', ()=>{ startGame(); overlay.classList.add('hidden'); });
overlayContinue.addEventListener('click', ()=>{ overlay.classList.add('hidden'); });

btnPause.addEventListener('click', ()=>{ paused = !paused; btnPause.textContent = paused ? 'Resume' : 'Pause'; });
btnRestart.addEventListener('click', ()=>{ startGame(); });

btnFlare.addEventListener('click', ()=>{ useFlare(); });

/* Keyboard controls */
window.addEventListener('keydown', (e)=>{
  if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
  const k = e.key.toLowerCase();
  if(k === 'arrowup' || k === 'w') moveOrb(-1,0);
  if(k === 'arrowdown' || k === 's') moveOrb(1,0);
  if(k === 'arrowleft' || k === 'a') moveOrb(0,-1);
  if(k === 'arrowright' || k === 'd') moveOrb(0,1);
  if(k === ' ') { useFlare(); e.preventDefault(); }
});

/* On-screen arrow buttons */
document.querySelectorAll('[data-dir]').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    const d = btn.getAttribute('data-dir');
    if(d==='up') moveOrb(-1,0);
    if(d==='down') moveOrb(1,0);
    if(d==='left') moveOrb(0,-1);
    if(d==='right') moveOrb(0,1);
  });
});

/* =========================
   Main loop & init
   ========================= */

function gameTick(){
  if(!paused){
    tick++;
    if(flareCooldown>0) flareCooldown = Math.max(0, flareCooldown-1);
    computeVisible();
    // ticks: occasionally move enemies
    if(tick%60 === 0) stepEnemies();
    draw();
  }
  requestAnimationFrame(gameTick);
}

function startGame(){
  const level = generateLevel();
  levelState = level;
  orb = { r: level.spawn.r, c: level.spawn.c, lightRadius: 4 };
  moves = 0; collected = 0; tick = 0; flareCooldown=0;
  inventory = {flares:1, coins:0};
  spawnEnemies();
  movesEl.textContent = moves;
  lightRadiusEl.textContent = orb.lightRadius;
  collectedEl.textContent = collected;
  totalTreasuresEl.textContent = level.treasures;
  inventoryEl.textContent = `Flares: ${inventory.flares} · Coins: ${inventory.coins}`;
  levelNameEl.textContent = "Light Orb Quest — Vault";
  paused = false; btnPause.textContent = 'Pause';
  computeVisible();
  playBeep(720, 'sine', 0.12, 0.04);
  // small start flash
  setTimeout(()=>{ playBeep(980, 'triangle', 0.06, 0.06); }, 120);
}

/* =========================
   Start everything
   ========================= */
startGame();
gameTick();
