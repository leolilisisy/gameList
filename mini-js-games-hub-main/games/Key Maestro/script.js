/* Key Maestro core logic
   - Simon-like piano sequence memorization
   - Keyboard keys A S D F G H J map to notes C D E F G A B
   - Uses WebAudio to synthesize notes (no external audio files)
*/

const NOTES = [
  { name: 'C', freq: 261.63, key: 'A' },
  { name: 'D', freq: 293.66, key: 'S' },
  { name: 'E', freq: 329.63, key: 'D' },
  { name: 'F', freq: 349.23, key: 'F' },
  { name: 'G', freq: 392.00, key: 'G' },
  { name: 'A', freq: 440.00, key: 'H' },
  { name: 'B', freq: 493.88, key: 'J' }
];

const pianoEl = document.getElementById('piano');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const levelEl = document.getElementById('level');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const difficultySelect = document.getElementById('difficulty');
const strictBtn = document.getElementById('strictBtn');
const messageEl = document.getElementById('message');

let audioCtx = null;
let sequence = [];
let playerIndex = 0;
let playingSequence = false;
let level = 0;
let score = 0;
let combo = 0;
let strictMode = false;

// build keys
NOTES.forEach((n, idx) => {
  const key = document.createElement('div');
  key.className = 'key';
  key.dataset.idx = idx;
  key.innerHTML = <div class="label">${n.key}</div><div class="note">${n.name}</div>;
  pianoEl.appendChild(key);

  key.addEventListener('mousedown', () => handleUserInput(idx));
  key.addEventListener('touchstart', (e) => { e.preventDefault(); handleUserInput(idx); }, {passive:false});
});

// helper: WebAudio tone
function initAudio(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function playTone(freq, duration = 400){
  initAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.value = 0.0001;
  o.connect(g);
  g.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  g.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
  o.start(now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration/1000);
  o.stop(now + duration/1000 + 0.02);
}

// visual flash
function flashKey(idx, duration=420){
  const key = pianoEl.querySelector(.key[data-idx="${idx}"]);
  if(!key) return;
  key.classList.add('active');
  playTone(NOTES[idx].freq, duration);
  setTimeout(()=> key.classList.remove('active'), duration);
}

// generate and play sequence
function addStep(){
  const rand = Math.floor(Math.random()*NOTES.length);
  sequence.push(rand);
}
function difficultySpeed(){
  const d = difficultySelect.value;
  if(d === 'easy') return 700;
  if(d === 'hard') return 380;
  return 520; // medium
}
async function playSequence(){
  playingSequence = true;
  playerIndex = 0;
  messageEl.textContent = 'Watch closely...';
  const speed = difficultySpeed();
  for(let i=0;i<sequence.length;i++){
    await new Promise(res => setTimeout(res, 180));
    flashKey(sequence[i], speed - 100);
    await new Promise(res => setTimeout(res, speed));
  }
  playingSequence = false;
  messageEl.textContent = 'Your turn — repeat the sequence!';
}

// user input handling
function handleUserInput(idx){
  if(playingSequence) return;
  if(!sequence.length) return;
  flashKey(idx, 240);
  // check
  if(idx === sequence[playerIndex]){
    playerIndex++;
    combo++;
    score += 10;
    updateStats();
    if(playerIndex === sequence.length){
      // success for this level
      level++;
      messageEl.textContent = Good! Level ${level} complete.;
      comboEl.textContent = combo;
      setTimeout(() => nextLevel(), 700);
    }
  } else {
    // wrong
    combo = 0;
    updateStats();
    const keyEl = pianoEl.querySelector(.key[data-idx="${idx}"]);
    if(keyEl) keyEl.classList.add('wrong');
    setTimeout(()=> keyEl && keyEl.classList.remove('wrong'), 360);
    messageEl.textContent = 'Wrong note!';
    if(strictMode){
      // end game
      messageEl.textContent = Game Over — wrong note. Final score: ${score};
      playingSequence = true; // block input
    } else {
      // replay sequence for retry
      playerIndex = 0;
      messageEl.textContent = 'Try again — watch the sequence.';
      setTimeout(()=> playSequence(), 800);
    }
  }
}

// progression
function updateStats(){
  levelEl.textContent = level;
  scoreEl.textContent = score;
  comboEl.textContent = combo;
}

function nextLevel(){
  addStep();
  updateStats();
  setTimeout(()=> playSequence(), 450);
}

function startGame(){
  // reset
  sequence = [];
  playerIndex = 0;
  level = 0;
  score = 0;
  combo = 0;
  playingSequence = false;
  messageEl.textContent = 'Get ready...';
  updateStats();
  // first step
  addStep();
  setTimeout(()=> playSequence(), 700);
}

function resetGame(){
  sequence = [];
  playerIndex = 0;
  level = 0;
  score = 0;
  combo = 0;
  playingSequence = false;
  messageEl.textContent = 'Game reset. Press Start.';
  updateStats();
}

// keyboard support
window.addEventListener('keydown', (e)=>{
  const key = e.key.toUpperCase();
  const note = NOTES.find(n => n.key === key);
  if(note){
    const idx = NOTES.indexOf(note);
    handleUserInput(idx);
  }
});

// UI wiring
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);
strictBtn.addEventListener('click', () => {
  strictMode = !strictMode;
  strictBtn.textContent = Strict: ${strictMode ? 'On' : 'Off'};
  strictBtn.style.background = strictMode ? 'linear-gradient(90deg,#fb7185,#f97316)' : '';
});

// initial message
messageEl.textContent = 'Press Start to play Key Maestro — use A S D F G H J or click keys';
updateStats();
