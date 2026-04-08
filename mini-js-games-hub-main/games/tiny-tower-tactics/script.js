// Tiny Tower Tactics Game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const BASE_W = 400, BASE_H = 600, ASPECT = BASE_H / BASE_W;
let DPR = window.devicePixelRatio || 1;
let W = BASE_W, H = BASE_H;

let frame = 0;
let gameState = 'menu'; // 'menu' | 'play' | 'paused' | 'over'
let score = 0;
let blocksPlaced = 0;
let tower = [];
let currentBlock = null;
let wobble = 0;
let wobbleDir = 1;
let isDragging = false;

canvas.setAttribute('role', 'application');
canvas.setAttribute('aria-label', 'Tiny Tower Tactics game canvas');
canvas.tabIndex = 0;

function resizeCanvas() {
  DPR = window.devicePixelRatio || 1;
  const container = canvas.parentElement || document.body;
  const maxWidth = Math.min(window.innerWidth - 40, 450);
  const cssWidth = Math.min(container.clientWidth - 24 || BASE_W, maxWidth);
  const cssHeight = Math.round(cssWidth * ASPECT);

  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';

  canvas.width = Math.round(cssWidth * DPR);
  canvas.height = Math.round(cssHeight * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  W = cssWidth;
  H = cssHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const shapes = [
  {name: 'rect', points: [[0,0],[60,0],[60,20],[0,20]], color: '#3498db'},
  {name: 'L', points: [[0,0],[50,0],[50,10],[10,10],[10,20],[0,20]], color: '#e74c3c'},
  {name: 'T', points: [[0,0],[60,0],[60,10],[35,10],[35,20],[25,20],[25,10],[0,10]], color: '#2ecc71'},
  {name: 'Z', points: [[0,0],[20,0],[20,10],[40,10],[40,20],[20,20],[20,30],[0,30]], color: '#f39c12'}
];

class Block {
  constructor(shape, x, y) {
    this.shape = shape;
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.wobble = 0;
    this.falling = false;
  }
  draw() {
    ctx.save();
    ctx.translate(this.x + this.wobble, this.y);
    ctx.fillStyle = this.shape.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.shape.points[0][0], this.shape.points[0][1]);
    for (let i = 1; i < this.shape.points.length; i++) {
      ctx.lineTo(this.shape.points[i][0], this.shape.points[i][1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  getBounds() {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [px, py] of this.shape.points) {
      minX = Math.min(minX, px + this.x);
      maxX = Math.max(maxX, px + this.x);
      minY = Math.min(minY, py + this.y);
      maxY = Math.max(maxY, py + this.y);
    }
    return {minX, maxX, minY, maxY};
  }
}

function reset() {
  frame = 0;
  score = 0;
  blocksPlaced = 0;
  tower = [];
  wobble = 0;
  wobbleDir = 1;
  spawnBlock();
  gameState = 'play';
  document.getElementById('score').textContent = 'Height: 0';
  document.getElementById('blocks').textContent = 'Blocks: 0';
}

function spawnBlock() {
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  currentBlock = new Block(shape, W / 2 - 30, 50);
}

function update() {
  if (gameState === 'play') {
    frame++;
    if (currentBlock) {
      if (!isDragging) {
        currentBlock.y += 2;
        if (currentBlock.y > H - 100) {
          placeBlock();
        }
      }
    }
    // Update wobble
    if (wobble > 0) {
      wobble += wobbleDir * 0.1;
      if (Math.abs(wobble) > 5) {
        wobbleDir *= -1;
      }
      wobble *= 0.98;
      if (Math.abs(wobble) < 0.1) wobble = 0;
    }
    // Check stability
    if (tower.length > 0 && !checkStability()) {
      wobble = 2;
      if (Math.random() < 0.01) { // Chance to fall
        gameState = 'over';
      }
    }
  }
}

function checkStability() {
  if (tower.length === 0) return true;
  let totalX = 0, totalWeight = 0;
  for (const block of tower) {
    const bounds = block.getBounds();
    const weight = bounds.maxX - bounds.minX;
    totalX += (bounds.minX + bounds.maxX) / 2 * weight;
    totalWeight += weight;
  }
  const centerX = totalX / totalWeight;
  const baseWidth = 100; // Assume base width
  return centerX > W/2 - baseWidth/2 && centerX < W/2 + baseWidth/2;
}

function placeBlock() {
  if (currentBlock) {
    tower.push(currentBlock);
    blocksPlaced++;
    score = Math.max(score, H - currentBlock.y);
    currentBlock = null;
    spawnBlock();
    document.getElementById('score').textContent = 'Height: ' + Math.floor(score / 10);
    document.getElementById('blocks').textContent = 'Blocks: ' + blocksPlaced;
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, W, H);

  // Draw ground
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, H - 50, W, 50);

  // Draw tower
  for (const block of tower) {
    block.wobble = wobble;
    block.draw();
  }

  // Draw current block
  if (currentBlock) {
    currentBlock.draw();
  }

  if (gameState === 'menu') {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tap or press Space to start', W / 2, H / 2);
  }
  if (gameState === 'over') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(20, H / 2 - 60, W - 40, 120);
    ctx.fillStyle = '#fff';
    ctx.font = '28px sans-serif';
    ctx.fillText('Tower Fell!', W / 2, H / 2 - 20);
    ctx.font = '20px sans-serif';
    ctx.fillText('Height: ' + Math.floor(score / 10), W / 2, H / 2 + 10);
    ctx.fillText('Blocks: ' + blocksPlaced, W / 2, H / 2 + 35);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Input
let mouseX = W / 2;
canvas.addEventListener('mousedown', e => {
  if (gameState === 'menu') reset();
  else if (gameState === 'over') reset();
  else if (currentBlock) {
    isDragging = true;
    mouseX = e.offsetX;
  }
});

canvas.addEventListener('mousemove', e => {
  if (isDragging && currentBlock) {
    mouseX = e.offsetX;
    currentBlock.x = mouseX - 30;
    currentBlock.x = Math.max(0, Math.min(W - 60, currentBlock.x));
  }
});

canvas.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    placeBlock();
  }
});

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (gameState === 'menu') reset();
  else if (gameState === 'over') reset();
  else if (currentBlock) {
    isDragging = true;
    mouseX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  }
});

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (isDragging && currentBlock) {
    mouseX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    currentBlock.x = mouseX - 30;
    currentBlock.x = Math.max(0, Math.min(W - 60, currentBlock.x));
  }
});

canvas.addEventListener('touchend', e => {
  e.preventDefault();
  if (isDragging) {
    isDragging = false;
    placeBlock();
  }
});

canvas.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (gameState === 'menu') reset();
    else if (gameState === 'over') reset();
    else placeBlock();
  }
});

// Buttons
document.getElementById('startBtn').addEventListener('click', () => {
  if (gameState === 'menu' || gameState === 'over') reset();
});

document.getElementById('pauseBtn').addEventListener('click', () => {
  if (gameState === 'play') {
    gameState = 'paused';
    document.getElementById('pauseBtn').setAttribute('aria-pressed', 'true');
    document.getElementById('pauseBtn').textContent = 'Resume';
  } else if (gameState === 'paused') {
    gameState = 'play';
    document.getElementById('pauseBtn').setAttribute('aria-pressed', 'false');
    document.getElementById('pauseBtn').textContent = 'Pause';
  }
});

loop();