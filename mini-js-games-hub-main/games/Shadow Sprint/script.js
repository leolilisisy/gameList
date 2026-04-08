/* Shadow Sprint - simple endless runner
   Controls:
   - Space / ArrowUp to jump (mobile tap on game area)
   Features:
   - obstacle spawning, jump physics, score by distance, adaptive speed
   - simple sounds using WebAudio (optional)
*/

const gameArea = document.getElementById('gameArea');
const playerEl = document.getElementById('player');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreEl = document.getElementById('score');
const highEl = document.getElementById('high');
const overlay = document.getElementById('overlay');
const finalScore = document.getElementById('finalScore');
const resultTitle = document.getElementById('resultTitle');
const status = document.querySelector('.tagline');
const muteBtn = document.getElementById('muteBtn');

let gravity = 0.9;
let velocity = 0;
let isJumping = false;
let playerY = 0; // px from ground
let groundY = 90; // ground height in CSS
let obstacles = [];
let gameLoopId = null;
let spawnTimer = 0;
let spawnInterval = 1500; // ms
let speed = 3;
let running = false;
let startTime = 0;
let distance = 0;
let highScore = Number(localStorage.getItem('shadowSprintHigh') || 0);
highEl.textContent = highScore;
let muted = false;

// audio
let audioCtx = null;
function initAudio(){ if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }
function playBeep(freq=260, time=0.06){
  if(muted) return;
  initAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine'; o.frequency.value = freq;
  g.gain.value = 0.0001;
  o.connect(g); g.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  g.gain.exponentialRampToValueAtTime(0.12, now + 0.005);
  o.start(now); o.stop(now + time);
}

// jump
function jump() {
  if(!running) return;
  if (isJumping) return;
  velocity = -12;
  isJumping = true;
  playerEl.classList.remove('run');
  playBeep(520,0.08);
}

// spawn obstacle
function spawnObstacle(){
  const ob = document.createElement('div');
  ob.className = 'obstacle';
  const size = 28 + Math.floor(Math.random()*20);
  ob.style.width = size + 'px';
  ob.style.height = (size - 6) + 'px';
  ob.style.right = '-80px';
  // attach position property
  gameArea.appendChild(ob);
  obstacles.push({el: ob, x: gameArea.clientWidth + 20, w: size, passed: false});
}

// update loop
function update(timestamp){
  if(!running) return;
  const now = Date.now();
  // physics
  velocity += gravity * 0.6;
  playerY += velocity;
  if(playerY > 0){
    // cap with ground at 0 (playerY measured upwards, 0 = standing)
    playerY = 0;
    velocity = 0;
    isJumping = false;
    playerEl.classList.add('run');
  }
  // translate element
  playerEl.style.bottom = (groundY + playerY) + 'px';

  // obstacles move left
  for(let i = obstacles.length-1; i>=0; i--){
    const o = obstacles[i];
    o.x -= (speed + (distance/1000));
    o.el.style.right = o.x + 'px';
    // check collision with player
    const pRect = playerEl.getBoundingClientRect();
    const oRect = o.el.getBoundingClientRect();
    if(!(pRect.right < oRect.left || pRect.left > oRect.right || pRect.bottom < oRect.top || pRect.top > oRect.bottom)){
      // collision
      endGame();
      return;
    }
    // remove off-screen elements
    if((o.x + o.w) < -120){
      o.el.remove();
      obstacles.splice(i,1);
    } else {
      // mark passed to increase score
      if(!o.passed && o.x + o.w < (gameArea.clientWidth - 120)){
        o.passed = true;
        distance += 10;
      }
    }
  }

  // spawn logic
  if(Date.now() - spawnTimer > spawnInterval){
    spawnTimer = Date.now();
    spawnObstacle();
    // gradually speed up spawn and speed
    if(spawnInterval > 700) spawnInterval -= 30;
    if(speed < 9) speed += 0.1;
  }

  // update score display (distance ~ score)
  scoreEl.textContent = Math.floor(distance/10);
  gameLoopId = requestAnimationFrame(update);
}

// start game
function startGame(){
  if(running) return;
  // reset state
  obstacles.forEach(o => o.el.remove());
  obstacles = [];
  velocity = 0; playerY = 0; isJumping = false;
  spawnInterval = 1500; speed = 3; distance = 0;
  spawnTimer = Date.now();
  running = true;
  startTime = Date.now();
  overlay.classList.add('hidden');
  playerEl.classList.add('run');
  startBtn.disabled = true;
  playBeep(780,0.06);
  gameLoopId = requestAnimationFrame(update);
}

// end game
function endGame(){
  running = false;
  cancelAnimationFrame(gameLoopId);
  // remove remaining obstacles after short delay to freeze view
  playBeep(140,0.18);
  finalScore.textContent = Math.floor(distance/10);
  if(Math.floor(distance/10) > highScore){
    highScore = Math.floor(distance/10);
    localStorage.setItem('shadowSprintHigh', highScore);
    highEl.textContent = highScore;
    resultTitle.textContent = "New High Score!";
  } else {
    resultTitle.textContent = "Game Over";
  }
  overlay.classList.remove('hidden');
  startBtn.disabled = false;
}

// input handlers
document.addEventListener('keydown', (e) => {
  if(e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    jump();
  }
  if(e.code === 'KeyM') {
    muted = !muted;
    muteBtn.textContent = muted ? '🔇 Muted' : '🔊 Sound';
  }
});

gameArea.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if(!running) startGame();
  jump();
}, {passive:false});

gameArea.addEventListener('click', (e)=>{
  if(!running) startGame();
  jump();
});

// UI
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => { overlay.classList.add('hidden'); startGame(); });
muteBtn.addEventListener('click', ()=>{ muted = !muted; muteBtn.textContent = muted ? '🔇 Muted' : '🔊 Sound'; });

// initialize
playerEl.style.bottom = groundY + 'px';
playerEl.classList.add('run');
overlay.classList.add('hidden');
