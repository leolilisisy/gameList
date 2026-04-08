/* Rhythm Catch v1
   - canvas-based falling beat catcher
   - audio sync via BPM-based spawns while audio is playing
   - keyboard + touch, scoring, combo, difficulty
*/

(() => {
  // DOM
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const volumeEl = document.getElementById('volume');
  const bpmEl = document.getElementById('bpm');
  const bpmVal = document.getElementById('bpmVal');
  const diffEl = document.getElementById('difficulty');
  const scoreEl = document.getElementById('score');
  const comboEl = document.getElementById('combo');
  const lastHitEl = document.getElementById('lastHit');
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const mobileControls = document.getElementById('mobileControls');
  const playNowLink = document.getElementById('playNowLink');

  // audio
  const audio = document.getElementById('track');
  audio.loop = true;
  audio.volume = parseFloat(volumeEl.value);

  // canvas sizing
  function fitCanvas(){
    const ratio = canvas.width / canvas.height;
    const parentWidth = canvas.parentElement.clientWidth;
    canvas.style.width = '100%';
    // height auto; canvas internal size already set
  }
  window.addEventListener('resize', fitCanvas);
  fitCanvas();

  // Game state
  let state = {
    running: false,
    lastTime: 0,
    beats: [],
    spawnTimer: 0,
    spawnInterval: 500,
    catcher: { x: 450, y: 520, w: 140, h: 20, speed: 720 },
    score: 0,
    combo: 0,
    bestCombo:0,
    bpm: parseInt(bpmEl.value,10),
    difficulty: diffEl.value, // easy|normal|hard
    hitWindow: { perfect: 32, good: 72 }, // px tolerance
    gravity: 320, // base falling speed (will be scaled)
  };

  // adjust difficulty
  function applyDifficulty(){
    const d = state.difficulty;
    if(d==='easy'){ state.gravity = 240; state.catcher.w = 180; }
    else if(d==='normal'){ state.gravity = 320; state.catcher.w = 140; }
    else { state.gravity = 420; state.catcher.w = 120; }
  }
  applyDifficulty();

  // spawn interval by BPM
  function updateSpawnInterval(){
    state.bpm = parseInt(bpmEl.value,10);
    bpmVal.textContent = state.bpm;
    // spawn at quarter notes:
    state.spawnInterval = Math.round(60000 / state.bpm);
  }
  updateSpawnInterval();

  bpmEl.addEventListener('input', updateSpawnInterval);
  volumeEl.addEventListener('input', ()=> audio.volume = parseFloat(volumeEl.value));
  diffEl.addEventListener('change', ()=>{ state.difficulty = diffEl.value; applyDifficulty(); });

  // play/pause/restart
  function startGame(){
    if(!state.running){
      state.running = true;
      state.lastTime = performance.now();
      requestAnimationFrame(loop);
      // only track plays if launched via a play-button on hub main page
      if(typeof trackGamePlay === 'function'){
        // safe call; trackGamePlay defined in main page
        const gameName = 'Rhythm Catch';
        try{ trackGamePlay(gameName); }catch(e){}
      }
    }
    if(audio.paused) audio.play().catch(()=>{ /* autoplay blocked; user interaction required */ });
  }
  function pauseGame(){
    state.running = false;
    audio.pause();
  }
  function restartGame(){
    state.beats = [];
    state.score = 0; state.combo = 0; state.bestCombo = 0;
    state.spawnTimer = 0;
    scoreEl.textContent = state.score; comboEl.textContent = state.combo; lastHitEl.textContent = '—';
    // reset audio to start
    audio.currentTime = 0;
    audio.pause();
    setTimeout(()=>{ audio.play().catch(()=>{}); }, 80);
    if(!state.running){ state.running = true; state.lastTime = performance.now(); requestAnimationFrame(loop); }
  }

  playBtn.addEventListener('click', startGame);
  pauseBtn.addEventListener('click', pauseGame);
  restartBtn.addEventListener('click', restartGame);
  playNowLink.addEventListener('click', (e)=>{ e.preventDefault(); startGame(); });

  // mobile controls
  leftBtn.addEventListener('touchstart', (e)=>{ e.preventDefault(); state.left=true; });
  leftBtn.addEventListener('touchend', (e)=>{ e.preventDefault(); state.left=false; });
  rightBtn.addEventListener('touchstart', (e)=>{ e.preventDefault(); state.right=true; });
  rightBtn.addEventListener('touchend', (e)=>{ e.preventDefault(); state.right=false; });
  leftBtn.addEventListener('mousedown', ()=> state.left = true);
  leftBtn.addEventListener('mouseup', ()=> state.left = false);
  rightBtn.addEventListener('mousedown', ()=> state.right = true);
  rightBtn.addEventListener('mouseup', ()=> state.right = false);

  // keyboard
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowLeft' || e.key === 'a') state.left = true;
    if(e.key === 'ArrowRight' || e.key === 'd') state.right = true;
    if(e.key === ' '){ // space toggle
      e.preventDefault();
      state.running ? pauseGame() : startGame();
    }
    if(e.key === 'r') restartGame();
  });
  window.addEventListener('keyup', (e)=>{
    if(e.key === 'ArrowLeft' || e.key === 'a') state.left = false;
    if(e.key === 'ArrowRight' || e.key === 'd') state.right = false;
  });

  // spawn beat
  function spawnBeat(){
    // spawn a beat at random x within canvas
    const x = 40 + Math.random() * (canvas.width - 80);
    // small variation in size & color
    const size = 16 + Math.random()*18;
    const hue = 200 + Math.random()*140;
    const speedMultiplier = 0.9 + Math.random()*0.6;
    state.beats.push({
      x, y: -40, r: size, color:`hsl(${hue}deg 85% 62% / 0.98)`,
      glow: `0 0 ${8 + size/2}px hsl(${hue}deg 85% 62% / 0.7)`,
      vy: state.gravity * speedMultiplier / 1000 // pixels per ms
    });
  }

  // Hit detection and scoring
  function evaluateHit(beat){
    // catcher is rectangular zone
    const cx = state.catcher.x + state.catcher.w/2;
    const distance = Math.abs(beat.x - cx);
    // convert distance to judgement
    if(distance <= state.hitWindow.perfect){
      const base = 100;
      state.score += base + Math.floor(state.combo * 5);
      state.combo += 1;
      lastHitEl.textContent = 'Perfect';
      showPopup('Perfect', '#7bffb4');
    } else if(distance <= state.hitWindow.good){
      const base = 40;
      state.score += base + Math.floor(state.combo * 2);
      state.combo += 1;
      lastHitEl.textContent = 'Good';
      showPopup('Good', '#ffd27b');
    } else {
      // near miss counts as miss
      state.combo = 0;
      lastHitEl.textContent = 'Miss';
      showPopup('Miss', '#ff7b7b');
    }
    if(state.combo > state.bestCombo) state.bestCombo = state.combo;
    // update scoreboard
    scoreEl.textContent = state.score;
    comboEl.textContent = state.combo;
  }

  // show transient popup
  function showPopup(text, color){
    const popup = document.createElement('div');
    popup.className = 'hit-pop';
    popup.style.background = `linear-gradient(90deg, ${color}22, ${color}12)`;
    popup.style.border = `1px solid ${color}55`;
    popup.style.color = '#021';
    popup.textContent = text;
    document.querySelector('.game-area').appendChild(popup);
    setTimeout(()=>popup.remove(), 900);
  }

  // main loop
  function loop(now){
    if(!state.running){ state.lastTime = now; return; }
    const dt = now - state.lastTime;
    state.lastTime = now;

    // spawn logic: use interval param derived from BPM
    state.spawnTimer += dt;
    // slightly speed spawn when difficulty harder
    const spawnIntervalAdjusted = state.spawnInterval * (state.difficulty === 'easy' ? 1.2 : state.difficulty === 'hard' ? 0.82 : 1);
    while(state.spawnTimer >= spawnIntervalAdjusted){
      state.spawnTimer -= spawnIntervalAdjusted;
      // spawn some beats; harder difficulty has more simultaneous
      const count = state.difficulty === 'hard' ? (Math.random()>0.6?2:1) : 1;
      for(let i=0;i<count;i++) spawnBeat();
    }

    // move catcher
    if(state.left) state.catcher.x -= state.catcher.speed * dt / 1000;
    if(state.right) state.catcher.x += state.catcher.speed * dt / 1000;
    // clamp
    state.catcher.x = Math.max(10, Math.min(canvas.width - state.catcher.w - 10, state.catcher.x));

    // update beats
    for(let i = state.beats.length - 1; i>=0; i--){
      const b = state.beats[i];
      b.y += b.vy * dt * 1000; // vy stored per ms scaled; multiply by dt and scale back
      // if beat reaches catcher zone (y threshold)
      const catcherY = state.catcher.y;
      if(b.y + b.r >= catcherY){
        // check horizontal proximity
        const left = state.catcher.x;
        const right = state.catcher.x + state.catcher.w;
        if(b.x >= left - 6 && b.x <= right + 6){
          evaluateHit(b);
        } else {
          // missed
          state.combo = 0;
          lastHitEl.textContent = 'Miss';
          showPopup('Miss', '#ff7b7b');
          comboEl.textContent = state.combo;
        }
        // remove
        state.beats.splice(i,1);
      } else if(b.y > canvas.height + 120){
        // clean up overflow
        state.beats.splice(i,1);
      }
    }

    // draw frame
    render();

    requestAnimationFrame(loop);
  }

  // Render visuals
  function render(){
    // clear
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // background gradient
    const g = ctx.createLinearGradient(0,0,0,canvas.height);
    g.addColorStop(0,'#051027');
    g.addColorStop(1,'#020414');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // draw falling glow/particles
    state.beats.forEach(b => {
      // glow
      ctx.beginPath();
      const glow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r*3);
      glow.addColorStop(0, b.color);
      glow.addColorStop(0.5, b.color.replace(' /',' / 0.25') );
      glow.addColorStop(1, 'rgba(2,6,23,0)');
      ctx.fillStyle = glow;
      ctx.arc(b.x, b.y, b.r*3, 0, Math.PI*2);
      ctx.fill();

      // core circle
      ctx.beginPath();
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = Math.min(28, b.r*3);
      ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // draw catcher zone
    const c = state.catcher;
    const cx = c.x, cy = c.y, cw = c.w, ch = c.h;
    // glowing base
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.roundRect = function(x,y,w,h,r){ this.moveTo(x+r,y); this.arcTo(x+w,y,x+w,y+h,r); this.arcTo(x+w,y+h,x,y+h,r); this.arcTo(x,y+h,x,y,r); this.arcTo(x,y,x+w,y,r); };
    ctx.roundRect(cx-16, cy-12, cw+32, ch+24, 18);
    ctx.fill();

    // catcher gradient
    const cg = ctx.createLinearGradient(cx,cy, cx+cw, cy);
    cg.addColorStop(0,'#ffffff15');
    cg.addColorStop(0.5,'#ffffff08');
    cg.addColorStop(1,'#ffffff10');

    ctx.beginPath();
    ctx.fillStyle = cg;
    ctx.roundRect(cx, cy-6, cw, ch+6, 10);
    ctx.fill();

    // inner glow
    ctx.beginPath();
    ctx.fillStyle = 'rgba(124,92,255,0.12)';
    ctx.roundRect(cx+6, cy-4, cw-12, ch+2, 8);
    ctx.fill();

    // center indicator
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.setLineDash([6,10]);
    ctx.moveTo(cx + cw/2, cy-26);
    ctx.lineTo(cx + cw/2, cy+ch+26);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // overlay score text drawn in canvas if needed
    // (we already have DOM scoreboard; canvas used for visuals)
  }

  // small helper to smooth resizing canvas internal pixels
  function setCanvasSize(){
    // keep internal resolution for crisp rendering
    const w = 900, h = 600;
    canvas.width = w;
    canvas.height = h;
    fitCanvas();
  }
  setCanvasSize();

  // helper to show mobile controls when small
  function updateMobileControls(){
    if(window.innerWidth <= 640) mobileControls.style.display = 'flex';
    else mobileControls.style.display = 'none';
  }
  window.addEventListener('resize', updateMobileControls);
  updateMobileControls();

  // auto-start muted if interaction allowed? keep paused until user clicks play.
  // Provide friendly tip
  showPopup('Tap Play to start', '#7bffb4');

  // Expose restart for external triggers if any
  window.rcRestart = restartGame;
})();
