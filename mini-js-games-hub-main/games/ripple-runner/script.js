// Ripple Runner Game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const BASE_W = 400, BASE_H = 600, ASPECT = BASE_H / BASE_W;
let DPR = window.devicePixelRatio || 1;
let W = BASE_W, H = BASE_H;

let frame = 0;
let gameState = 'menu'; // 'menu' | 'play' | 'paused' | 'over'
let score = 0;
let multiplier = 1;
let consecutiveBeats = 0;
let theme = 0;
let track = 0;
let muted = false;

const lanes = 4;
const laneWidth = W / lanes;
let playerLane = 1;
let obstacles = [];
let speed = 3;
let beatInterval = 60; // frames

const themes = [
  {bg: '#0f0f23', lanes: '#1a1a2e', player: '#00d4ff', obstacle: '#ff6b6b', beatFlash: '#00d4ff'},
  {bg: '#2d1b69', lanes: '#4c2a85', player: '#ff6b6b', obstacle: '#4ecdc4', beatFlash: '#ff6b6b'},
  {bg: '#1e3c72', lanes: '#2a5298', player: '#f9ca24', obstacle: '#45b7d1', beatFlash: '#f9ca24'}
];

const tracks = [
  {freq: 440, name: 'Classic'},
  {freq: 523, name: 'Upbeat'},
  {freq: 659, name: 'Energetic'}
];

canvas.setAttribute('role', 'application');
canvas.setAttribute('aria-label', 'Ripple Runner game canvas');
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

// Audio
let audioCtx;
try {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
  console.warn('Web Audio API not supported');
}

function playBeat(freq) {
  if (muted || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
}

function reset() {
  frame = 0;
  score = 0;
  multiplier = 1;
  consecutiveBeats = 0;
  playerLane = 1;
  obstacles = [];
  speed = 3;
  gameState = 'play';
  document.getElementById('score').textContent = 'Score: 0';
  document.getElementById('multiplier').textContent = 'Multiplier: 1x';
  document.getElementById('theme').textContent = 'Theme: ' + themes[theme].name || 'Classic';
}

function spawnObstacle() {
  if (Math.random() < 0.02) {
    const lane = Math.floor(Math.random() * lanes);
    obstacles.push({lane, y: -50, height: 30 + Math.random() * 20});
  }
}

function update() {
  if (gameState === 'play') {
    frame++;
    score += Math.floor(speed * multiplier / 10);

    // Beat
    if (frame % beatInterval === 0) {
      playBeat(tracks[track].freq);
      // Flash effect
      ctx.fillStyle = themes[theme].beatFlash + '20';
      ctx.fillRect(0, 0, W, H);
    }

    // Update obstacles
    obstacles.forEach(obs => obs.y += speed);
    obstacles = obstacles.filter(obs => obs.y < H + 50);

    // Check collisions
    obstacles.forEach(obs => {
      if (obs.lane === playerLane && obs.y + obs.height > H - 60 && obs.y < H - 10) {
        gameState = 'over';
      }
    });

    spawnObstacle();

    // Increase difficulty
    speed += 0.001;
    if (frame % 600 === 0) {
      beatInterval = Math.max(30, beatInterval - 2);
    }

    document.getElementById('score').textContent = 'Score: ' + score;
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = themes[theme].bg;
  ctx.fillRect(0, 0, W, H);

  // Lanes
  ctx.strokeStyle = themes[theme].lanes;
  ctx.lineWidth = 2;
  for (let i = 1; i < lanes; i++) {
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 0);
    ctx.lineTo(i * laneWidth, H);
    ctx.stroke();
  }

  // Obstacles
  ctx.fillStyle = themes[theme].obstacle;
  obstacles.forEach(obs => {
    ctx.fillRect(obs.lane * laneWidth + 5, obs.y, laneWidth - 10, obs.height);
  });

  // Player
  ctx.fillStyle = themes[theme].player;
  ctx.beginPath();
  ctx.arc((playerLane + 0.5) * laneWidth, H - 30, 15, 0, Math.PI * 2);
  ctx.fill();

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
    ctx.fillText('Multiplier: ' + multiplier + 'x', W / 2, H / 2 + 35);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function switchLane(dir) {
  if (gameState === 'play') {
    const newLane = playerLane + dir;
    if (newLane >= 0 && newLane < lanes) {
      playerLane = newLane;
      // Check if on beat
      if (frame % beatInterval < 10) { // Within 10 frames of beat
        consecutiveBeats++;
        multiplier = Math.min(10, 1 + Math.floor(consecutiveBeats / 5));
      } else {
        consecutiveBeats = 0;
        multiplier = 1;
      }
      document.getElementById('multiplier').textContent = 'Multiplier: ' + multiplier + 'x';

      // Unlock themes/tracks
      if (score > 1000 && theme < themes.length - 1) theme++;
      if (score > 2000 && track < tracks.length - 1) track++;
      document.getElementById('theme').textContent = 'Theme: ' + (themes[theme].name || 'Classic');
    }
  }
}

// Input
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (gameState === 'menu') reset();
  else if (gameState === 'over') reset();
  else {
    const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    switchLane(touchX < W / 2 ? -1 : 1);
  }
});

canvas.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (gameState === 'menu') reset();
    else if (gameState === 'over') reset();
  } else if (e.code === 'ArrowLeft') {
    e.preventDefault();
    switchLane(-1);
  } else if (e.code === 'ArrowRight') {
    e.preventDefault();
    switchLane(1);
  }
});

// Buttons
document.getElementById('startBtn').addEventListener('click', () => {
  if (gameState === 'menu' || gameState === 'over') reset();
});

document.getElementById('muteBtn').addEventListener('click', () => {
  muted = !muted;
  document.getElementById('muteBtn').textContent = muted ? 'Unmute' : 'Mute';
});

loop();