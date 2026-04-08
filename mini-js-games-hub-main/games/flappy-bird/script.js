// Responsive Flappy Bird
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const BASE_W = 320, BASE_H = 480, ASPECT = BASE_H / BASE_W;
let DPR = window.devicePixelRatio || 1;
let W = BASE_W, H = BASE_H;

let frame = 0;
let gameState = 'menu'; // 'menu' | 'play' | 'paused' | 'over'
let score = 0;

// make canvas focusable for keyboard controls
canvas.setAttribute('role', 'application');
canvas.setAttribute('aria-label', 'Flappy Bird game canvas');
canvas.tabIndex = 0;

function resizeCanvas() {
  DPR = window.devicePixelRatio || 1;
  const container = canvas.parentElement || document.body;
  // Use container width, with a max to avoid extremely large canvases
  const maxWidth = Math.min(window.innerWidth - 40, 720);
  const cssWidth = Math.min(container.clientWidth - 24 || BASE_W, maxWidth);
  const cssHeight = Math.round(cssWidth * ASPECT);

  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';

  // backing store size for crisp rendering on high-DPR displays
  canvas.width = Math.round(cssWidth * DPR);
  canvas.height = Math.round(cssHeight * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  W = cssWidth;
  H = cssHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const bird = {
  x: 60, y: H / 2, r: 12,
  vy: 0, gravity: 0.45, lift: -8,
  draw() {
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + 6, this.y - 3, 6, 4);
  },
  update() {
    this.vy += this.gravity;
    this.y += this.vy;
    if (this.y + this.r > H) { this.y = H - this.r; this.vy = 0; gameState = 'over'; }
    if (this.y - this.r < 0) { this.y = this.r; this.vy = 0; }
  }
};

class Pipe {
  constructor(x) { this.w = Math.round(48 * (W / BASE_W)); this.gap = Math.round(120 * (W / BASE_W)); this.x = x; this.top = Math.random() * (H - 160) + 40; this.passed = false }
  draw() { ctx.fillStyle = '#2e8b57'; ctx.fillRect(this.x, 0, this.w, this.top); ctx.fillRect(this.x, this.top + this.gap, this.w, H - (this.top + this.gap)); }
  update() { this.x -= 2 * (W / BASE_W); if (!this.passed && this.x + this.w < bird.x) { score++; this.passed = true } }
}

let pipes = [];
function reset() {
  frame = 0; score = 0; bird.y = H / 2; bird.vy = 0;
  pipes = [new Pipe(W + 30), new Pipe(W + 30 + 160)];
  gameState = 'play';
  document.getElementById('score').textContent = 'Score: 0';
}

function spawnIfNeeded() { if (pipes.length < 3 && pipes[pipes.length - 1].x < W - 140) pipes.push(new Pipe(W + 30)); }

function checkCollisions() { for (const p of pipes) { if (bird.x + bird.r > p.x && bird.x - bird.r < p.x + p.w) { if (bird.y - bird.r < p.top || bird.y + bird.r > p.top + p.gap) { gameState = 'over'; } } } }

function draw() {
  ctx.clearRect(0, 0, W, H);
  // cloud
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(40 + ((frame / 3) % W), 60, 32, 18, 0, 0, Math.PI * 2); ctx.fill();
  for (const p of pipes) p.draw();
  bird.draw();
  ctx.fillStyle = '#012'; ctx.font = Math.round(20 * (W / BASE_W)) + 'px monospace'; ctx.fillText(score, W - 40, 28);
  if (gameState === 'menu') { ctx.fillStyle = '#012'; ctx.font = Math.round(16 * (W / BASE_W)) + 'px sans-serif'; ctx.fillText('Click or press Space to start', 22, H / 2 + 80) }
  if (gameState === 'over') { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(20, H / 2 - 40, W - 40, 80); ctx.fillStyle = '#fff'; ctx.font = Math.round(22 * (W / BASE_W)) + 'px sans-serif'; ctx.fillText('Game Over', W / 2 - 56, H / 2); ctx.fillText('Score: ' + score, W / 2 - 48, H / 2 + 28) }
}

function update() { if (gameState === 'play') { frame++; for (const p of pipes) { p.update() } pipes = pipes.filter(p => p.x + p.w > -10); spawnIfNeeded(); bird.update(); checkCollisions(); document.getElementById('score').textContent = 'Score: ' + score } }

function loop() { update(); draw(); requestAnimationFrame(loop); }

// input
function flap() { if (gameState === 'menu') { reset(); } if (gameState === 'over') { reset(); } if (gameState === 'play') { bird.vy = bird.lift } else { bird.vy = bird.lift } }

// Keyboard when canvas focused
canvas.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); flap(); }
  if (e.code === 'KeyP') { // toggle pause
    if (gameState === 'play') { gameState = 'paused'; document.getElementById('pauseBtn').setAttribute('aria-pressed', 'true'); document.getElementById('pauseBtn').textContent = 'Resume'; }
    else if (gameState === 'paused') { gameState = 'play'; document.getElementById('pauseBtn').setAttribute('aria-pressed', 'false'); document.getElementById('pauseBtn').textContent = 'Pause'; }
  }
});

canvas.addEventListener('click', flap);

document.getElementById('startBtn').addEventListener('click', () => { reset(); canvas.focus(); });
document.getElementById('pauseBtn').addEventListener('click', () => {
  if (gameState === 'play') { gameState = 'paused'; document.getElementById('pauseBtn').setAttribute('aria-pressed', 'true'); document.getElementById('pauseBtn').textContent = 'Resume'; }
  else if (gameState === 'paused') { gameState = 'play'; document.getElementById('pauseBtn').setAttribute('aria-pressed', 'false'); document.getElementById('pauseBtn').textContent = 'Pause'; }
});

// ensure canvas is sized correctly after fonts/UI settle
setTimeout(resizeCanvas, 50);

// start loop
loop();