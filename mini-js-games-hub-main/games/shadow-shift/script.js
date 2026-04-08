// Shadow Shift Game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const BASE_W = 800, BASE_H = 400, ASPECT = BASE_H / BASE_W;
let DPR = window.devicePixelRatio || 1;
let W = BASE_W, H = BASE_H;

let frame = 0;
let gameState = 'menu'; // 'menu' | 'play' | 'paused' | 'over' | 'win'
let particles = [];

const level = {
  player: {x: 50, y: 300},
  goal: {x: 750, y: 300, w: 20, h: 40},
  platforms: [
    {x: 0, y: 350, w: 100, h: 50, lightId: null, opacity: 1},
    {x: 200, y: 300, w: 100, h: 20, lightId: 0, opacity: 0},
    {x: 400, y: 250, w: 100, h: 20, lightId: 1, opacity: 0},
    {x: 600, y: 200, w: 100, h: 20, lightId: 0, opacity: 0},
    {x: 720, y: 350, w: 80, h: 50, lightId: null, opacity: 1}
  ],
  lights: [
    {x: 150, y: 250, r: 15, toggled: false},
    {x: 350, y: 200, r: 15, toggled: false}
  ]
};

let player = {...level.player, vx: 0, vy: 0, w: 20, h: 40, onGround: false};

canvas.setAttribute('role', 'application');
canvas.setAttribute('aria-label', 'Shadow Shift game canvas');
canvas.tabIndex = 0;

function resizeCanvas() {
  DPR = window.devicePixelRatio || 1;
  const container = canvas.parentElement || document.body;
  const maxWidth = Math.min(window.innerWidth - 40, 850);
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

function reset() {
  frame = 0;
  player = {...level.player, vx: 0, vy: 0, w: 20, h: 40, onGround: false};
  level.platforms.forEach(p => {
    p.opacity = p.lightId === null ? 1 : 0;
  });
  level.lights.forEach(l => l.toggled = false);
  particles = [];
  gameState = 'play';
  document.getElementById('status').textContent = 'Reach the goal by toggling lights!';
}

function updatePlatforms() {
  level.platforms.forEach(p => {
    if (p.lightId !== null) {
      const targetOpacity = level.lights[p.lightId].toggled ? 1 : 0;
      p.opacity += (targetOpacity - p.opacity) * 0.1;
    }
  });
}

function updatePlayer() {
  // Gravity
  player.vy += 0.5;
  player.y += player.vy;

  // Move
  player.x += player.vx;
  player.vx *= 0.8;

  // Collision with platforms
  player.onGround = false;
  level.platforms.forEach(p => {
    if (p.opacity > 0.5) { // Only collide if visible enough
      if (player.x + player.w > p.x && player.x < p.x + p.w &&
          player.y + player.h > p.y && player.y < p.y + p.h) {
        if (player.vy > 0 && player.y < p.y) {
          player.y = p.y - player.h;
          player.vy = 0;
          player.onGround = true;
        } else if (player.vy < 0 && player.y > p.y) {
          player.y = p.y + p.h;
          player.vy = 0;
        }
      }
    }
  });

  // Bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > W) player.x = W - player.w;
  if (player.y > H) gameState = 'over';

  // Goal
  if (player.x + player.w > level.goal.x && player.x < level.goal.x + level.goal.w &&
      player.y + player.h > level.goal.y && player.y < level.goal.y + level.goal.h) {
    gameState = 'win';
  }

  // Particles
  if (Math.abs(player.vx) > 1 && player.onGround) {
    particles.push({x: player.x + player.w / 2, y: player.y + player.h, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 2, life: 30});
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);
}

function update() {
  if (gameState === 'play') {
    frame++;
    updatePlatforms();
    updatePlayer();
    updateParticles();
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  // Platforms
  ctx.fillStyle = '#000';
  level.platforms.forEach(p => {
    ctx.globalAlpha = p.opacity;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.globalAlpha = 1;
  });

  // Lights
  level.lights.forEach(l => {
    ctx.fillStyle = l.toggled ? '#ffff00' : '#666';
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Goal
  ctx.fillStyle = '#000';
  ctx.fillRect(level.goal.x, level.goal.y, level.goal.w, level.goal.h);

  // Player
  ctx.fillStyle = '#000';
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Particles
  ctx.fillStyle = '#000';
  particles.forEach(p => {
    ctx.globalAlpha = p.life / 30;
    ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    ctx.globalAlpha = 1;
  });

  if (gameState === 'menu') {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press Space to start', W / 2, H / 2);
  }
  if (gameState === 'over') {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.font = '28px sans-serif';
    ctx.fillText('Game Over', W / 2, H / 2 - 20);
    ctx.font = '20px sans-serif';
    ctx.fillText('Press Space to restart', W / 2, H / 2 + 10);
  }
  if (gameState === 'win') {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.font = '28px sans-serif';
    ctx.fillText('Level Complete!', W / 2, H / 2 - 20);
    ctx.font = '20px sans-serif';
    ctx.fillText('Press Space to play again', W / 2, H / 2 + 10);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function toggleLight(index) {
  level.lights[index].toggled = !level.lights[index].toggled;
}

function handleClick(x, y) {
  level.lights.forEach((l, i) => {
    const dx = x - l.x;
    const dy = y - l.y;
    if (dx * dx + dy * dy < l.r * l.r) {
      toggleLight(i);
    }
  });
}

// Input
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / (rect.width / W);
  const y = (e.clientY - rect.top) / (rect.height / H);
  handleClick(x, y);
});

canvas.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (gameState === 'menu' || gameState === 'over' || gameState === 'win') reset();
    else if (player.onGround) {
      player.vy = -12;
    }
  } else if (e.code === 'ArrowLeft') {
    e.preventDefault();
    player.vx = -5;
  } else if (e.code === 'ArrowRight') {
    e.preventDefault();
    player.vx = 5;
  }
});

canvas.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
    player.vx = 0;
  }
});

// Buttons
document.getElementById('startBtn').addEventListener('click', reset);

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