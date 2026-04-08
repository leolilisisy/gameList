// Skyline Sprint Game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const BASE_W = 800, BASE_H = 400, ASPECT = BASE_H / BASE_W;
let DPR = window.devicePixelRatio || 1;
let W = BASE_W, H = BASE_H;

let frame = 0;
let gameState = 'menu'; // 'menu' | 'play' | 'paused' | 'over'
let score = 0;
let stars = 0;
let theme = 0;
const themes = [
  {sky: '#87ceeb', buildings: ['#666', '#555', '#777'], ground: '#8B4513'},
  {sky: '#ff69b4', buildings: ['#800080', '#4B0082', '#9370DB'], ground: '#DDA0DD'},
  {sky: '#ffa500', buildings: ['#ff4500', '#ff6347', '#ffd700'], ground: '#daa520'}
];

canvas.setAttribute('role', 'application');
canvas.setAttribute('aria-label', 'Skyline Sprint game canvas');
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

const player = {
  x: 100, y: H - 100, w: 20, h: 40,
  vy: 0, gravity: 0.6, jumpPower: -15,
  state: 'running', // 'running' | 'jumping' | 'sliding'
  slideTime: 0,
  draw() {
    ctx.fillStyle = '#000';
    if (this.state === 'sliding') {
      ctx.fillRect(this.x, this.y + 20, this.w, this.h - 20); // sliding silhouette
    } else {
      ctx.fillRect(this.x, this.y, this.w, this.h); // standing/running
    }
  },
  update() {
    if (this.state === 'jumping') {
      this.vy += this.gravity;
      this.y += this.vy;
      if (this.y >= H - 100) {
        this.y = H - 100;
        this.vy = 0;
        this.state = 'running';
      }
    }
    if (this.state === 'sliding') {
      this.slideTime--;
      if (this.slideTime <= 0) {
        this.state = 'running';
      }
    }
  },
  jump() {
    if (this.state === 'running') {
      this.state = 'jumping';
      this.vy = this.jumpPower;
    }
  },
  slide() {
    if (this.state === 'running') {
      this.state = 'sliding';
      this.slideTime = 30; // frames
    }
  }
};

let bgOffset = 0;
const bgLayers = [
  {speed: 0.5, height: H * 0.8, color: themes[theme].buildings[0]},
  {speed: 1, height: H * 0.6, color: themes[theme].buildings[1]},
  {speed: 1.5, height: H * 0.4, color: themes[theme].buildings[2]}
];

let obstacles = [];
let starsList = [];
let speed = 5;

function reset() {
  frame = 0;
  score = 0;
  stars = 0;
  speed = 5;
  player.x = 100;
  player.y = H - 100;
  player.vy = 0;
  player.state = 'running';
  bgOffset = 0;
  obstacles = [];
  starsList = [];
  gameState = 'play';
  document.getElementById('score').textContent = 'Score: 0';
  document.getElementById('stars').textContent = 'Stars: 0';
  document.getElementById('theme').textContent = 'Theme: ' + ['Classic', 'Neon', 'Sunset'][theme];
}

function spawnObstacle() {
  if (Math.random() < 0.01) {
    const type = Math.random() < 0.5 ? 'gap' : 'spike';
    obstacles.push({
      x: W + 50,
      type,
      width: type === 'gap' ? 80 : 30,
      height: type === 'gap' ? 0 : 50
    });
  }
}

function spawnStar() {
  if (Math.random() < 0.005) {
    starsList.push({
      x: W + 50,
      y: H - 150 - Math.random() * 100
    });
  }
}

function update() {
  if (gameState === 'play') {
    frame++;
    bgOffset += speed * 0.1;
    player.update();
    score += Math.floor(speed / 5);
    speed += 0.01;

    // Update obstacles
    obstacles.forEach(obs => obs.x -= speed);
    obstacles = obstacles.filter(obs => obs.x > -50);

    // Update stars
    starsList.forEach(star => star.x -= speed);
    starsList = starsList.filter(star => star.x > -50);

    spawnObstacle();
    spawnStar();

    // Check collisions
    obstacles.forEach(obs => {
      if (player.x + player.w > obs.x && player.x < obs.x + obs.width) {
        if (obs.type === 'gap' && player.state !== 'jumping') {
          gameState = 'over';
        } else if (obs.type === 'spike' && player.y + player.h > H - obs.height && player.state !== 'sliding') {
          gameState = 'over';
        }
      }
    });

    // Check star collection
    starsList.forEach((star, index) => {
      if (player.x + player.w > star.x && player.x < star.x + 20 &&
          player.y + player.h > star.y && player.y < star.y + 20) {
        stars++;
        starsList.splice(index, 1);
        document.getElementById('stars').textContent = 'Stars: ' + stars;
        if (stars % 10 === 0 && theme < themes.length - 1) {
          theme++;
          document.getElementById('theme').textContent = 'Theme: ' + ['Classic', 'Neon', 'Sunset'][theme];
        }
      }
    });

    document.getElementById('score').textContent = 'Score: ' + score;
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Sky
  ctx.fillStyle = themes[theme].sky;
  ctx.fillRect(0, 0, W, H);

  // Background layers
  bgLayers.forEach(layer => {
    ctx.fillStyle = layer.color;
    for (let i = -1; i < 3; i++) {
      const x = (i * 200 - bgOffset * layer.speed) % (W + 200);
      ctx.fillRect(x, H - layer.height, 150, layer.height);
    }
  });

  // Ground
  ctx.fillStyle = themes[theme].ground;
  ctx.fillRect(0, H - 50, W, 50);

  // Obstacles
  obstacles.forEach(obs => {
    ctx.fillStyle = '#000';
    if (obs.type === 'gap') {
      // Draw gap in ground
      ctx.clearRect(obs.x, H - 50, obs.width, 50);
    } else if (obs.type === 'spike') {
      ctx.beginPath();
      ctx.moveTo(obs.x, H - 50);
      ctx.lineTo(obs.x + obs.width / 2, H - 50 - obs.height);
      ctx.lineTo(obs.x + obs.width, H - 50);
      ctx.fill();
    }
  });

  // Stars
  ctx.fillStyle = '#ffd700';
  starsList.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x + 10, star.y + 10, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  player.draw();

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
    ctx.fillText('Game Over', W / 2, H / 2 - 20);
    ctx.font = '20px sans-serif';
    ctx.fillText('Score: ' + score, W / 2, H / 2 + 10);
    ctx.fillText('Stars: ' + stars, W / 2, H / 2 + 35);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Input
let touchStartY = 0;
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  touchStartY = e.touches[0].clientY;
  if (gameState === 'menu') reset();
  else if (gameState === 'over') reset();
  else player.jump();
});

canvas.addEventListener('touchend', e => {
  e.preventDefault();
  const touchEndY = e.changedTouches[0].clientY;
  if (touchEndY > touchStartY + 50) {
    player.slide();
  }
});

canvas.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (gameState === 'menu') reset();
    else if (gameState === 'over') reset();
    else player.jump();
  }
  if (e.code === 'ArrowDown') {
    e.preventDefault();
    player.slide();
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