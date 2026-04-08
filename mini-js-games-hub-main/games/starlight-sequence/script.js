// Starlight Sequence Game
let difficulty = 'easy';
let sequence = [];
let playerSequence = [];
let step = 0;
let speed = 1000;
let soundOn = true;
let gameActive = false;
let showingSequence = false;
const highScores = JSON.parse(localStorage.getItem('starlightSequenceHighScores') || '{"easy":0,"medium":0,"hard":0}');

const orbs = document.querySelectorAll('.orb');
const messageEl = document.getElementById('message');
const sequenceEl = document.getElementById('sequence');
const highScoreEl = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const soundBtn = document.getElementById('soundBtn');

// Audio context
let audioCtx;
try {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
  console.warn('Web Audio API not supported');
}

function initAudio() {
  if (!audioCtx) return;
  // Create ambient sound
  const ambientOsc = audioCtx.createOscillator();
  const ambientGain = audioCtx.createGain();
  ambientOsc.frequency.setValueAtTime(220, audioCtx.currentTime);
  ambientGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  ambientOsc.connect(ambientGain);
  ambientGain.connect(audioCtx.destination);
  ambientOsc.start();
}

function playTone(freq, duration = 0.5) {
  if (!soundOn || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function lightOrb(id, duration = 500) {
  const orb = document.querySelector(`.orb[data-id="${id}"]`);
  orb.classList.add('active');
  const freq = parseFloat(orb.dataset.freq);
  playTone(freq, duration / 1000);
  setTimeout(() => orb.classList.remove('active'), duration);
}

function setDifficulty(diff) {
  difficulty = diff;
  document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-diff="${diff}"]`).classList.add('active');
  updateHighScore();
  resetGame();
}

function updateHighScore() {
  highScoreEl.textContent = `High Score: ${highScores[difficulty]}`;
}

function resetGame() {
  sequence = [];
  playerSequence = [];
  step = 0;
  gameActive = false;
  showingSequence = false;
  messageEl.textContent = 'Press Start to Play';
  sequenceEl.textContent = 'Sequence: 0';
  orbs.forEach(orb => orb.style.display = difficulty === 'hard' ? 'block' : (parseInt(orb.dataset.id) < 4 ? 'block' : 'none'));
}

function startGame() {
  if (gameActive) return;
  gameActive = true;
  sequence = [];
  playerSequence = [];
  step = 0;
  speed = difficulty === 'easy' ? 1000 : difficulty === 'medium' ? 700 : 500;
  nextRound();
}

function nextRound() {
  step++;
  sequence.push(Math.floor(Math.random() * (difficulty === 'hard' ? 6 : 4)));
  playerSequence = [];
  sequenceEl.textContent = `Sequence: ${step}`;
  showSequence();
}

function showSequence() {
  showingSequence = true;
  messageEl.textContent = 'Watch the sequence...';
  let i = 0;
  const interval = setInterval(() => {
    if (i < sequence.length) {
      lightOrb(sequence[i]);
      i++;
    } else {
      clearInterval(interval);
      showingSequence = false;
      messageEl.textContent = 'Your turn!';
    }
  }, speed);
}

function playerInput(id) {
  if (!gameActive || showingSequence) return;
  playerSequence.push(id);
  lightOrb(id, 300);
  if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
    gameOver();
    return;
  }
  if (playerSequence.length === sequence.length) {
    setTimeout(() => {
      messageEl.textContent = 'Good! Next round...';
      setTimeout(nextRound, 1000);
    }, 500);
  }
}

function gameOver() {
  gameActive = false;
  messageEl.textContent = 'Wrong! Game Over';
  playTone(100, 1); // Low tone for error
  if (step - 1 > highScores[difficulty]) {
    highScores[difficulty] = step - 1;
    localStorage.setItem('starlightSequenceHighScores', JSON.stringify(highScores));
    updateHighScore();
    messageEl.textContent = 'New High Score!';
  }
  setTimeout(() => {
    messageEl.textContent = 'Select Difficulty & Start';
  }, 2000);
}

// Event listeners
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => setDifficulty(btn.dataset.diff));
});

orbs.forEach(orb => {
  orb.addEventListener('click', () => playerInput(parseInt(orb.dataset.id)));
});

document.addEventListener('keydown', e => {
  const key = parseInt(e.key);
  if (key >= 1 && key <= 6) {
    playerInput(key - 1);
  }
});

startBtn.addEventListener('click', startGame);
soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.textContent = `Sound: ${soundOn ? 'On' : 'Off'}`;
  if (soundOn && audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
});

// Initialize
updateHighScore();
initAudio();