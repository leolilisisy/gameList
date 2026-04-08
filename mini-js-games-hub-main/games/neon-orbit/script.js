// Neon Orbit Game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const BASE_W = 400, BASE_H = 600, ASPECT = BASE_H / BASE_W;
let DPR = window.devicePixelRatio || 1;
let W = BASE_W, H = BASE_H;

let frame = 0;
let gameState = 'menu'; // 'menu' | 'play' | 'paused' | 'over'
let score = 0;
let highScore = localStorage.getItem('neonOrbitHighScore') || 0;
let speed = 2;

canvas.setAttribute('role', 'application');
canvas.setAttribute('aria-label', 'Neon Orbit game canvas');
canvas.tabIndex = 0;

function resizeCanvas() {
  DPR = window.devicePixelRatio || 1;
  const container = canvas.parentElement || document.body;
  const maxWidth = Math.min(window.innerWidth - 40, 720);
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

const centerX = W / 2;
const centerY = H / 2;
const ringRadius = Math.min(W, H) / 4;
const gapSize = Math.PI / 2; // 90 degrees

let playerAngle = 0;
let rotationDirection = 1; // 1 clockwise, -1 counter

class Obstacle {
  constructor() {
    this.distance = H / 2 + 50;
    this.angle = Math.random() * Math.PI * 2;
    this.gapStart = Math.random() * Math.PI * 2;
    this.gapEnd = this.gapStart + gapSize;
    this.color = ['#ff00ff', '#00ffff', '#ff4500', '#00ff00'][Math.floor(Math.random() * 4)];
    this.passed = false;
  }
  update() {
    this.distance -= speed;
  }
  draw() {
    const radius = this.distance;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, this.gapEnd, this.gapStart + Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

let obstacles = [];

function reset() {
  frame = 0;
  score = 0;
  speed = 2;
  playerAngle = 0;
  obstacles = [];
  gameState = 'play';
  document.getElementById('score').textContent = 'Score: 0';
  document.getElementById('highScore').textContent = 'High Score: ' + highScore;
}

function spawnObstacle() {
  if (Math.random() < 0.02) {
    obstacles.push(new Obstacle());
  }
}

function checkCollisions() {
  for (const obs of obstacles) {
    if (obs.distance <= ringRadius + 10 && !obs.passed) {
      const playerGapStart = playerAngle % (Math.PI * 2);
      const playerGapEnd = (playerAngle + gapSize) % (Math.PI * 2);
      const obsGapStart = obs.gapStart;
      const obsGapEnd = obs.gapEnd;
      // Normalize for overlap check
      let pStart = playerGapStart;
      let pEnd = playerGapEnd;
      if (pEnd < pStart) pEnd += Math.PI * 2;
      let oStart = obsGapStart;
      let oEnd = obsGapEnd;
      if (oEnd < oStart) oEnd += Math.PI * 2;
      const overlap = (pStart < oEnd && pEnd > oStart);
      if (overlap) {
        score++;
        obs.passed = true;
        speed += 0.05;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem('neonOrbitHighScore', highScore);
        }
        document.getElementById('score').textContent = 'Score: ' + score;
        document.getElementById('highScore').textContent = 'High Score: ' + highScore;
      } else {
        gameState = 'over';
      }
    }
  }
}

function drawRing() {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(centerX, centerY, ringRadius, playerAngle + gapSize, playerAngle + Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  for (const obs of obstacles) obs.draw();
  drawRing();

  if (gameState === 'menu') {
    ctx.fillStyle = '#fff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tap or click to start', centerX, centerY + 50);
  }
  if (gameState === 'over') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(20, H / 2 - 60, W - 40, 120);
    ctx.fillStyle = '#fff';
    ctx.font = '28px sans-serif';
    ctx.fillText('Game Over', centerX, H / 2 - 20);
    ctx.font = '20px sans-serif';
    ctx.fillText('Score: ' + score, centerX, H / 2 + 10);
    ctx.fillText('High Score: ' + highScore, centerX, H / 2 + 35);
  }
}

function update() {
  if (gameState === 'play') {
    frame++;
    playerAngle += 0.05 * rotationDirection;
    for (const obs of obstacles) obs.update();
    obstacles = obstacles.filter(obs => obs.distance > 0);
    spawnObstacle();
    checkCollisions();
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function rotate() {
  if (gameState === 'menu') reset();
  else if (gameState === 'over') reset();
  else if (gameState === 'play') {
    rotationDirection *= -1; // reverse direction on tap
  }
}

// Input
canvas.addEventListener('click', rotate);
canvas.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault();
    rotate();
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