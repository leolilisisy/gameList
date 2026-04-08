// Tug of War — script.js
// Two-player local tapping or keyboard controls (A for Left, L for Right).
// Features: start/pause/restart, sound toggle, visual glow, and win handling.

// DOM
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const leftTap = document.getElementById('leftTap');
const rightTap = document.getElementById('rightTap');
const rope = document.getElementById('rope');
const marker = document.getElementById('marker');
const leftScoreEl = document.getElementById('leftScore');
const rightScoreEl = document.getElementById('rightScore');
const cheerAudio = document.getElementById('cheer-audio');
const battleAudio = document.getElementById('battle-audio');
const soundToggle = document.getElementById('soundToggle');

let gameRunning = false;
let paused = false;
let leftPower = 0;
let rightPower = 0;
let markerPos = 0.5; // normalized 0 to 1 (0 = full left, 1 = full right)
let lastMove = null;
let leftScore = 0;
let rightScore = 0;
let lastTapTime = 0;
let tickInterval = null;
const TICK_MS = 16;
const TAP_BOOST = 0.015; // per tap movement influence
const DECAY = 0.995; // slight decay so rapid taps required
const WIN_THRESHOLD = 0.05; // how close to edge to win
const MAX_SCORE = 1; // unused but helps logic

// small in-browser tap sound using WebAudio (so user doesn't need to download)
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function playTapSound() {
  if (!soundToggle.checked) return;
  if (!audioCtx) audioCtx = new AudioCtx();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.value = 550 + Math.random()*80;
  g.gain.value = 0.08;
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  setTimeout(()=>{ g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.06); }, 20);
  setTimeout(()=> o.stop(), 120);
}
function playWinSound() {
  if (!soundToggle.checked) return;
  // crowd cheer via hosted file
  try { cheerAudio.currentTime = 0; cheerAudio.play(); } catch(e){}
  try { battleAudio.currentTime = 0; battleAudio.play(); } catch(e){}
}

// update UI
function updateMarker() {
  const trackWidth = rope.clientWidth;
  const leftPct = markerPos * 100;
  marker.style.left = leftPct + '%';
  // update glow meters
  const leftGlow = document.querySelector('.meter-left .glow');
  const rightGlow = document.querySelector('.meter-right .glow');
  if (leftGlow) leftGlow.style.width = Math.max(8, (0.5 + (0.5 - markerPos)) * 100) + '%';
  if (rightGlow) rightGlow.style.width = Math.max(8, (0.5 + (markerPos - 0.5)) * 100) + '%';

  // marker glow based on last move
  marker.classList.remove('marker-glow-left','marker-glow-right');
  if (lastMove === 'left') marker.classList.add('marker-glow-left');
  if (lastMove === 'right') marker.classList.add('marker-glow-right');
}

function updateScores() {
  leftScoreEl.textContent = leftScore;
  rightScoreEl.textContent = rightScore;
}

// main tick: move marker according to powers
function tick() {
  if (!gameRunning || paused) return;
  // combine powers
  // amplify short rapid taps by decay+boost pattern
  leftPower *= DECAY;
  rightPower *= DECAY;
  const net = (leftPower - rightPower);
  // move marker
  markerPos += net;
  markerPos = Math.max(0, Math.min(1, markerPos));
  updateMarker();

  // check win
  if (markerPos <= WIN_THRESHOLD) {
    // left wins
    leftScore += 1;
    finishRound('left');
  } else if (markerPos >= 1 - WIN_THRESHOLD) {
    rightScore += 1;
    finishRound('right');
  }
}

// round end
function finishRound(winner) {
  gameRunning = false;
  paused = false;
  // visual banner
  const shell = document.querySelector('.game-shell');
  shell.classList.remove('win-left','win-right');
  if (winner === 'left') {
    shell.classList.add('win-left');
    renderBanner('LEFT WINS!');
  } else {
    shell.classList.add('win-right');
    renderBanner('RIGHT WINS!');
  }
  updateScores();
  playWinSound();
  clearInterval(tickInterval);
  tickInterval = null;
}

// show temporary banner
function renderBanner(text) {
  // remove existing
  const existing = document.querySelector('.win-banner');
  if (existing) existing.remove();
  const banner = document.createElement('div');
  banner.className = 'win-banner';
  banner.textContent = text;
  document.querySelector('.rope-track').appendChild(banner);
  setTimeout(()=> banner.remove(), 2500);
}

// game controls
function startGame() {
  if (gameRunning) return;
  // reset powers but keep marker at center
  leftPower = 0; rightPower = 0;
  lastMove = null;
  gameRunning = true;
  paused = false;
  if (!tickInterval) tickInterval = setInterval(tick, TICK_MS);
}

function pauseGame() {
  paused = !paused;
  pauseBtn.textContent = paused ? 'Resume' : 'Pause';
}

function restartGame(fullReset = false) {
  // clear visual classes
  const shell = document.querySelector('.game-shell');
  shell.classList.remove('win-left','win-right');
  // reset
  markerPos = 0.5;
  leftPower = 0; rightPower = 0;
  lastMove = null;
  gameRunning = false;
  paused = false;
  pauseBtn.textContent = 'Pause';
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
  updateMarker();
  if (fullReset) { leftScore = 0; rightScore = 0; updateScores(); }
}

// tapping handlers
function handleLeftTap() {
  if (!gameRunning) return;
  playTapSound();
  leftPower += TAP_BOOST + Math.random()*0.01;
  lastMove = 'left';
}
function handleRightTap() {
  if (!gameRunning) return;
  playTapSound();
  rightPower += TAP_BOOST + Math.random()*0.01;
  lastMove = 'right';
}

// key controls
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'a') {
    handleLeftTap();
  } else if (e.key.toLowerCase() === 'l') {
    handleRightTap();
  } else if (e.key === ' ') {
    // space toggles start/pause quickly
    if (!gameRunning) startGame();
    else pauseGame();
  }
});

// click/touch zones
leftTap.addEventListener('pointerdown', ()=> {
  handleLeftTap();
});
rightTap.addEventListener('pointerdown', ()=> {
  handleRightTap();
});

// buttons
startBtn.addEventListener('click', ()=> startGame());
pauseBtn.addEventListener('click', ()=> pauseGame());
restartBtn.addEventListener('click', ()=> restartGame(false));

// initial render
updateMarker();
updateScores();

// export a small API to parent window for hub tracking (if desired)
window.tugOfWarGame = {
  start: startGame,
  pause: pauseGame,
  restart: restartGame
};

// when page unload, stop audio contexts
window.addEventListener('beforeunload', ()=> {
  if (audioCtx && audioCtx.close) audioCtx.close();
});
