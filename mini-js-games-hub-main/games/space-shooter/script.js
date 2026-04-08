'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let scoreEl = document.getElementById('score');
// defensive: if the span is missing for any reason, try to find/create it inside the HUD
if (!scoreEl) {
  const hud = document.querySelector('.hud');
  if (hud) {
    scoreEl = hud.querySelector('span');
    if (!scoreEl) {
      scoreEl = document.createElement('span');
      scoreEl.id = 'score';
      scoreEl.textContent = '0';
      hud.appendChild(scoreEl);
    }
  }
}

function updateScore() {
  if (!scoreEl) return;
  scoreEl.textContent = String(score);
}
const restartBtn = document.getElementById('restart');

const W = canvas.width = 480;
const H = canvas.height = 640;

let keys = {};
let bullets = [];
let enemies = [];
let lastEnemyAt = 0;
let score = 0;
let running = true;
let lastShot = 0;
const fireRate = 160; // ms between shots

const player = { x: W/2, y: H-60, w: 36, h: 16, speed: 6 };

function spawnEnemy(){
  const x = Math.random()*(W-40)+20;
  enemies.push({x, y:-20, w:28, h:16, speed: 1.2 + Math.random()*1.6, hp:1});
}

function update(dt){
  // player movement
  if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
  if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
  player.x = Math.max(16, Math.min(W-16, player.x));

  // shooting (rate limited)
  const holdingSpace = keys[' '] || keys['Space'] || keys['Spacebar'] || keys['SpaceBar'] || keys['Space'];
  const now = performance.now();
  if (holdingSpace && bullets.length < 6 && (now - lastShot) > fireRate) {
    bullets.push({x: player.x, y: player.y-10, r:4, dy:-8});
    lastShot = now;
  }

  // bullets
  bullets.forEach(b => { b.y += b.dy; });
  bullets = bullets.filter(b => b.y > -10);

  // enemies
  enemies.forEach(e => { e.y += e.speed; });
  enemies = enemies.filter(e => e.y < H+40 && e.hp>0);

  // collisions
  for (let i=enemies.length-1;i>=0;i--){
    const e = enemies[i];
    for (let j=bullets.length-1;j>=0;j--){
      const b = bullets[j];
      if (b.x > e.x- e.w/2 && b.x < e.x+e.w/2 && b.y > e.y - e.h/2 && b.y < e.y + e.h/2){
        bullets.splice(j,1);
        e.hp -= 1;
  if (e.hp<=0){ enemies.splice(i,1); score+=10; updateScore(); }
        break;
      }
    }
    // enemy hits player
    if (Math.abs(e.x-player.x) < (e.w+player.w)/2 && Math.abs(e.y-player.y) < (e.h+player.h)/2){
      running = false; // game over
    }
  }

  // spawn logic
  lastEnemyAt += dt;
  if (lastEnemyAt > 600) { spawnEnemy(); lastEnemyAt = 0; }
}

function draw(){
  // clear
  ctx.clearRect(0,0,W,H);

  // stars
  for (let i=0;i<80;i++){ ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect((i*37)%W, (i*59)%H, 1,1); }

  // player
  ctx.fillStyle = '#58a6ff'; ctx.fillRect(player.x-player.w/2, player.y-player.h/2, player.w, player.h);
  ctx.fillStyle = '#9bdcff'; ctx.fillRect(player.x-6, player.y-player.h/2-6, 12,6);

  // bullets
  ctx.fillStyle = '#ffd86b';
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.fill();
  });

  // enemies
  enemies.forEach(e=>{
    ctx.fillStyle = '#f87171';
    ctx.fillRect(e.x-e.w/2, e.y-e.h/2, e.w, e.h);
    ctx.fillStyle = '#ffb4b4'; ctx.fillRect(e.x-6, e.y-e.h/2-6, 12,4);
  });

  if (!running) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, H/2-60, W, 120);
    ctx.fillStyle = '#fff'; ctx.font = '28px serif'; ctx.textAlign = 'center'; ctx.fillText('Game Over', W/2, H/2-8);
    ctx.font = '16px serif'; ctx.fillText('Press Restart to play again', W/2, H/2+24);
  }
}

let last = performance.now();
function loop(now){
  const dt = now - last; last = now;
  if (running) update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', e => { keys[e.key] = true; if (e.code) keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.key] = false; if (e.code) keys[e.code] = false; });
restartBtn.addEventListener('click', ()=>{
  bullets = []; enemies = []; score = 0; updateScore(); running = true; lastEnemyAt = 0; lastShot = 0;
  player.x = W/2;
  spawnEnemy();
});

// start
spawnEnemy(); requestAnimationFrame(loop);
