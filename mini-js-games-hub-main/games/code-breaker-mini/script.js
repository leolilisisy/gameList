/* Code Breaker Mini — script.js
   Features:
   - 3-digit secret code (0-9 each, repeats allowed)
   - On-screen numpad + keyboard input
   - Hints per digit: correct pos (good), correct digit wrong pos (mid), absent (bad)
   - Attempts limit, restart, pause/resume, toggle sound
   - History tracking & small smart-suggest hint
*/

// Config
const MAX_ATTEMPTS = 8;
const CODE_LENGTH = 3;

// State
let secret = [];
let currentGuess = [];
let attemptsLeft = MAX_ATTEMPTS;
let paused = false;
let soundOn = true;

// DOM
const guessDisplay = document.getElementById('guess-display');
const attemptsLeftEl = document.getElementById('attempts-left');
const historyEl = document.getElementById('history');
const messageEl = document.getElementById('message');
const numKeys = Array.from(document.querySelectorAll('.num-key'));
const submitBtn = document.getElementById('submit-guess');
const backspaceBtn = document.getElementById('backspace');
const restartBtn = document.getElementById('restart-btn');
const pauseBtn = document.getElementById('pause-btn');
const soundToggleBtn = document.getElementById('sound-toggle');
const hintBtn = document.getElementById('hint-btn');
const autoGuessBtn = document.getElementById('auto-guess');
const bulbs = Array.from(document.querySelectorAll('.bulb'));

// Sounds
const sfxClick = document.getElementById('sfx-click');
const sfxWin = document.getElementById('sfx-win');
const sfxLose = document.getElementById('sfx-lose');
const sfxHint = document.getElementById('sfx-hint');

function playSound(el){
  if(!soundOn || !el) return;
  try{ el.currentTime = 0; el.play(); } catch(e){}
}

function randDigit(){ return Math.floor(Math.random()*10); }

function generateSecret(){
  secret = [];
  for(let i=0;i<CODE_LENGTH;i++) secret.push(randDigit());
  // For debugging uncomment:
  // console.log('Secret: ', secret.join(''));
}

function setMessage(text, tone='neutral'){
  messageEl.textContent = text;
  messageEl.className = 'message ' + (tone==='neutral'?'':'msg-'+tone);
}

function refreshGuessDisplay(){
  const shown = Array.from({length: CODE_LENGTH}, (_,i) => currentGuess[i] === undefined ? '_' : currentGuess[i]);
  guessDisplay.textContent = shown.join(' ');
  bulbs.forEach((b, i) => {
    b.classList.remove('good','mid','bad','glow');
    if(currentGuess[i] !== undefined){
      // tiny flash to show input
      b.classList.add('glow');
      setTimeout(()=>b.classList.remove('glow'),220);
    }
  });
}

function updateAttemptsDisplay(){
  attemptsLeftEl.textContent = attemptsLeft;
}

function resetHistory(){
  historyEl.innerHTML = '';
}

function addHistoryRow(guess, feedback){
  const row = document.createElement('div');
  row.className = 'row';
  const guessEl = document.createElement('div');
  guessEl.className = 'guess';
  guessEl.textContent = guess.join('');
  const feedbackEl = document.createElement('div');
  feedbackEl.className = 'feedback';
  // feedback: array of 'good'/'mid'/'bad'
  feedback.forEach(f => {
    const dot = document.createElement('span');
    dot.className = 'hint-dot';
    if(f==='good'){ dot.style.background = 'linear-gradient(90deg,#9ef2c3,#5ad397)'; dot.title='Correct position';}
    else if(f==='mid'){ dot.style.background='linear-gradient(90deg,#ffd97a,#ffb347)'; dot.title='Correct digit wrong position';}
    else { dot.style.background='linear-gradient(90deg,#c6cbd6,#9fa6b3)'; dot.title='Digit not present';}
    feedbackEl.appendChild(dot);
  });
  row.appendChild(guessEl);
  row.appendChild(feedbackEl);
  historyEl.prepend(row);
}

function evaluateGuess(guess){
  // produce feedback array per index
  // copy secret to mark used digits
  const feedback = new Array(CODE_LENGTH).fill('bad');
  const secretCopy = secret.slice();
  // first pass: correct position
  for(let i=0;i<CODE_LENGTH;i++){
    if(guess[i] === secretCopy[i]){
      feedback[i]='good';
      secretCopy[i]=null; // consumed
    }
  }
  // second pass: correct digit wrong pos
  for(let i=0;i<CODE_LENGTH;i++){
    if(feedback[i]==='good') continue;
    const idx = secretCopy.indexOf(guess[i]);
    if(idx !== -1){
      feedback[i]='mid';
      secretCopy[idx]=null;
    }
  }
  return feedback;
}

function applyFeedbackToBulbs(feedback){
  // visual bulbs for the last guess
  bulbs.forEach((b, i) => {
    b.classList.remove('good','mid','bad');
    b.classList.add(feedback[i]);
  });
}

function checkWin(feedback){
  return feedback.every(f => f==='good');
}

function submitCurrentGuess(){
  if(paused) return;
  if(currentGuess.length !== CODE_LENGTH){
    setMessage(`Enter ${CODE_LENGTH} digits before submitting.`, 'warn');
    playSound(sfxClick);
    return;
  }
  const guess = currentGuess.map(v => Number(v));
  const feedback = evaluateGuess(guess);
  addHistoryRow(guess, feedback);
  applyFeedbackToBulbs(feedback);
  playSound(sfxClick);
  if(checkWin(feedback)){
    // win
    setMessage(`🎉 You cracked it! Code: ${secret.join('')}`, 'win');
    playSound(sfxWin);
    // reveal bulbs in win color
    bulbs.forEach(b => b.classList.add('good'));
    endGame(true);
    return;
  }
  attemptsLeft--;
  updateAttemptsDisplay();
  if(attemptsLeft <= 0){
    // lose
    setMessage(`💥 Out of attempts! The code was ${secret.join('')}.`, 'lose');
    playSound(sfxLose);
    bulbs.forEach((b,i) => b.classList.add('bad'));
    endGame(false);
    return;
  }
  setMessage(`Attempt recorded. ${attemptsLeft} attempts left.`, 'neutral');
  // clear current guess
  currentGuess = [];
  refreshGuessDisplay();
}

function endGame(won){
  paused = true;
  pauseBtn.textContent = '🔁'; // acts as resume/new
}

function restartGame(){
  paused = false;
  generateSecret();
  attemptsLeft = MAX_ATTEMPTS;
  currentGuess = [];
  updateAttemptsDisplay();
  resetHistory();
  refreshGuessDisplay();
  bulbs.forEach(b => b.classList.remove('good','mid','bad','glow'));
  setMessage('New code generated — good luck!', 'neutral');
  playSound(sfxClick);
  pauseBtn.textContent = '⏸️';
}

function togglePause(){
  paused = !paused;
  pauseBtn.textContent = paused ? '▶️' : '⏸️';
  setMessage(paused ? 'Game paused.' : 'Game resumed.');
  playSound(sfxClick);
}

function toggleSound(){
  soundOn = !soundOn;
  soundToggleBtn.textContent = soundOn ? '🔊' : '🔈';
  setMessage(soundOn ? 'Sound on' : 'Sound off');
}

function addDigit(d){
  if(paused) return;
  if(currentGuess.length >= CODE_LENGTH) {
    // optional: rotate or ignore
    return;
  }
  currentGuess.push(String(d));
  refreshGuessDisplay();
  playSound(sfxClick);
}

function backspace(){
  if(paused) return;
  currentGuess.pop();
  refreshGuessDisplay();
  playSound(sfxClick);
}

// smart (very basic) suggestion: tries to return a digit combination using process of elimination
function smartSuggest(){
  // find digits not present in history 'all absent' and suggest likely digits from 0-9
  const tested = new Set();
  const absent = new Set();
  const present = new Set();
  // analyze history (DOM)
  Array.from(historyEl.children).forEach(row => {
    const guessText = row.querySelector('.guess').textContent.trim();
    const dots = Array.from(row.querySelectorAll('.hint-dot'));
    for(let i=0;i<guessText.length;i++){
      const g = Number(guessText[i]);
      const dot = dots[i];
      if(!dot) continue;
      const title = dot.title || '';
      tested.add(g);
      if(title.toLowerCase().includes('correct position') || title.toLowerCase().includes('correct digit')) present.add(g);
      else absent.add(g);
    }
  });
  // build simple guess: prefer present digits, else random
  const suggestion = [];
  for(let i=0;i<CODE_LENGTH;i++){
    if(present.size>0){
      suggestion.push([...present][i % present.size]);
    } else {
      suggestion.push(Math.floor(Math.random()*10));
    }
  }
  setMessage(`Suggested guess: ${suggestion.join('')}`, 'neutral');
  return suggestion;
}

/* Event wiring */
numKeys.forEach(k => {
  k.addEventListener('click', e => {
    addDigit(k.dataset.key);
  });
});

backspaceBtn.addEventListener('click', e => backspace());
submitBtn.addEventListener('click', e => submitCurrentGuess());
restartBtn.addEventListener('click', e => restartGame());
pauseBtn.addEventListener('click', e => togglePause());
soundToggleBtn.addEventListener('click', e => toggleSound());
hintBtn.addEventListener('click', (e) => {
  if(paused) return;
  // reveal one digit of secret randomly
  const choices = [];
  for(let i=0;i<CODE_LENGTH;i++) if(!currentGuess.includes(String(secret[i]))) choices.push(i);
  if(choices.length===0){ setMessage('No hint available.', 'neutral'); return; }
  const idx = choices[Math.floor(Math.random()*choices.length)];
  setMessage(`Hint: Digit at position ${idx+1} is ${secret[idx]}`, 'neutral');
  playSound(sfxHint);
});
autoGuessBtn.addEventListener('click', (e) => {
  if(paused) return;
  const suggestion = smartSuggest().map(String);
  currentGuess = suggestion;
  refreshGuessDisplay();
});

document.addEventListener('keydown', (e) => {
  if(paused) return;
  if(e.key >= '0' && e.key <= '9'){
    addDigit(e.key);
    e.preventDefault();
  } else if(e.key === 'Backspace'){
    backspace();
  } else if(e.key === 'Enter'){
    submitCurrentGuess();
  } else if(e.key === 'p'){
    togglePause();
  } else if(e.key === 'r'){
    restartGame();
  }
});

/* Init */
(function init(){
  generateSecret();
  updateAttemptsDisplay();
  refreshGuessDisplay();
  setMessage('Guess the secret 3-digit code. Use keyboard or on-screen keypad. Good luck!');
})();
