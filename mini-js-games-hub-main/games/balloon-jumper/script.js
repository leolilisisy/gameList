// Balloon Jumper — advanced single-file core
// Place at games/balloon-jumper/script.js

(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });

  // Resize canvas for device pixel ratio
  function resize() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = Math.floor(canvas.clientWidth * ratio);
    canvas.height = Math.floor(canvas.clientHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // UI elements
  const scoreEl = document.getElementById('score');
  const highEl = document.getElementById('highscore');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayMsg = document.getElementById('overlayMsg');
  const resumeBtn = document.getElementById('resumeBtn');
  const overlayRestart = document.getElementById('overlayRestart');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const resumeKey = 'BalloonJumperHigh';

  // Sound toggles and webaudio
  let audioEnabled = true;
  const soundToggle = document.getElementById('soundToggle');
  soundToggle.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    soundToggle.textContent = audioEnabled ? '🔊' : '🔈';
  });

  // Simple WebAudio generator for jump/pop/score (no external files needed)
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) audioCtx = new AudioCtx();
  }
  function beep(freq = 440, time = 0.06, type = 'sine', gain = 0.12) {
    if (!audioEnabled) return;
    ensureAudio();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + time);
    o.stop(audioCtx.currentTime + time + 0.02);
  }
  function popSound() { beep(340, 0.07, 'triangle', 0.14); }
  function jumpSound() { beep(720, 0.08, 'sawtooth', 0.08); }
  function scoreSound() { beep(980, 0.10, 'sine', 0.09); }

  // Optionally, you can replace or supplement these procedural sounds with external links:
  // e.g. const jumpURL = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
  // and use new Audio(jumpURL).play(); But procedural sounds avoid hotlink issues.

  // Game constants
  const GRAVITY = 1600; // px/s^2
  const BALLON_MIN_SPEED = -40;
  const PLAYER_SPEED = 420;
  const JUMP_VELOCITY = -680;
  const BALLOON_MIN_GAP = 100;
  const BALLOON_MAX_GAP = 220;
  const BALLOON_MIN_RADIUS = 28;
  const BALLOON_MAX_RADIUS = 46;
  const SCROLL_THRESHOLD = 300;

  // Game state
  let last = performance.now();
  let dt = 0;
  let running = true;
  let paused = false;
  let score = 0;
  let highScore = parseInt(localStorage.getItem(resumeKey) || 0, 10);
  highEl.textContent = highScore;

  // Player
  const player = {
    x: 180,
    y: 300,
    r: 22,
    vx: 0,
    vy: 0,
    color: '#fff',
    spinning: 0
  };

  // Input
  const keys = { left:false, right:false };
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === ' ') togglePause();
    if (e.key === 'r') resetGame();
    // unlock audio on user gesture
    if (!audioCtx && ['ArrowLeft','ArrowRight',' ','a','d'].includes(e.key)) ensureAudio();
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  });

  // Touch controls
  let touchX = null;
  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touchX = t.clientX;
    // ensure audio unlocked
    if (!audioCtx) ensureAudio();
  });
  canvas.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    touchX = t.clientX;
  });
  canvas.addEventListener('touchend', () => { touchX = null; });

  // Balloons store
  let balloons = [];

  // Helpers for random and colors
  function rand(min,max){return Math.random()*(max-min)+min}
  function rndInt(min,max){return Math.floor(rand(min,max+1))}
  function sat(n,min,max){return Math.max(min,Math.min(max,n))}

  // Balloon generator
  function spawnBalloon(x,y,r,velocity=0, type='normal'){
    balloons.push({x,y,r,vx:rand(-10,10),vy:velocity, color:hslColor(), popped:false, type});
  }

  function hslColor(){
    const hue = Math.floor(rand(0,360));
    return `hsl(${hue} 86% 64%)`;
  }

  // Initial balloon field
  function populateInitial(){
    balloons = [];
    const baseY = canvas.height/ (window.devicePixelRatio||1) - 60;
    let y = baseY;
    let x = 220;
    for(let i=0;i<8;i++){
      const r = rndInt(BALLOON_MIN_RADIUS, BALLOON_MAX_RADIUS);
      spawnBalloon(rand(80, canvas.width-120), y - i*rand(140,200), r);
    }
  }

  // Reset / Start
  function resetGame(){
    score = 0;
    scoreEl.textContent = score;
    player.x = canvas.clientWidth*0.2;
    player.y = canvas.clientHeight*0.6;
    player.vx = 0; player.vy = 0;
    populateInitial();
    running = true;
    paused = false;
    overlay.classList.add('hidden');
    overlayTitle.textContent = 'Paused';
    overlayMsg.textContent = '';
    if (audioEnabled) jumpSound();
  }

  // Pause toggle
  function togglePause(){
    paused = !paused;
    if (paused){
      overlay.classList.remove('hidden');
      overlayTitle.textContent = 'Paused';
      overlayMsg.textContent = 'Press Resume or Space to continue.';
    } else {
      overlay.classList.add('hidden');
      last = performance.now();
    }
  }

  pauseBtn.addEventListener('click', () => togglePause());
  resumeBtn.addEventListener('click', () => togglePause());
  restartBtn.addEventListener('click', () => resetGame());
  overlayRestart.addEventListener('click', () => resetGame());

  // Collision detection: circle to circle
  function circleCollide(ax,ay,ar,bx,by,br){
    const dx = ax-bx, dy=ay-by;
    return (dx*dx+dy*dy) <= (ar+br)*(ar+br);
  }

  // Main update loop
  function update(now){
    dt = Math.min((now - last)/1000, 0.033); // clamp dt
    last = now;
    if (!running || paused) {
      requestAnimationFrame(update);
      return;
    }

    // Input handling
    const canvasWidth = canvas.clientWidth;
    // touch control mapping
    if (touchX !== null){
      const rect = canvas.getBoundingClientRect();
      const cx = touchX - rect.left;
      if (cx < rect.width*0.48) {
        keys.left = true; keys.right = false;
      } else {
        keys.right = true; keys.left = false;
      }
    }

    if (keys.left) player.vx = -PLAYER_SPEED;
    else if (keys.right) player.vx = PLAYER_SPEED;
    else player.vx = 0;

    // Integrate physics
    player.vy += GRAVITY * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // Boundaries left/right wrap
    if (player.x < -60) player.x = canvasWidth + 60;
    if (player.x > canvasWidth + 60) player.x = -60;

    // Scroll world upward if player goes above threshold
    const threshold = SCROLL_THRESHOLD;
    if (player.y < threshold) {
      const dy = threshold - player.y;
      player.y = threshold;
      // move balloons downwards so it *appears* player ascended
      for (let b of balloons) b.y += dy;
      score += Math.floor(Math.abs(dy) * 0.02);
      if (score % 50 === 0) { scoreSound(); }
      scoreEl.textContent = score;
      if (score > highScore) { highScore = score; localStorage.setItem(resumeKey, String(highScore)); highEl.textContent = highScore; }
    }

    // Spawn balloons if needed at top
    while (balloons.length < 10) {
      const topMost = Math.min(...balloons.map(b=>b.y));
      const gap = rand(BALLOON_MIN_GAP, BALLOON_MAX_GAP);
      const r = rndInt(BALLOON_MIN_RADIUS, BALLOON_MAX_RADIUS);
      const x = rand(60, canvasWidth-60);
      const y = topMost - gap - r;
      spawnBalloon(x,y,r);
    }

    // Update balloons
    for (let b of balloons) {
      // slight bobbing movement and horizontal drift
      b.vy += rand(-10, 10) * dt;
      b.x += Math.sin((now + b.x)*0.001)*10*dt + b.vx*dt;
      b.y += b.vy * dt * 0.3; // gentle drift

      // random pop chance for fragile balloons
      if (!b.popped && Math.random() < 0.0006) {
        b.popped = true;
        popSound();
      }
    }

    // Collision: if landing on balloon from above with small downward speed
    for (let i = 0; i < balloons.length; i++) {
      const b = balloons[i];
      if (b.popped) continue;
      if (circleCollide(player.x, player.y + player.r*0.5, player.r, b.x, b.y - b.r*0.2, b.r*0.9)) {
        // ensure that player is falling (vy > 0) or close enough
        if (player.vy > -120) {
          // bounce
          player.vy = JUMP_VELOCITY * (1 - Math.min(0.4, Math.abs(b.r - BALLOON_MAX_RADIUS)/120));
          player.y = b.y - b.r - player.r*0.2;
          jumpSound();
          // small chance balloon pops on landing
          if (Math.random() < 0.08) { b.popped = true; popSound(); }
          // score
          score += 10;
          scoreEl.textContent = score;
          if (score > highScore) { highScore = score; localStorage.setItem(resumeKey, String(highScore)); highEl.textContent = highScore; }
        }
      }
    }

    // Remove popped far-off balloons, keep array small
    balloons = balloons.filter(b => {
      // if popped, create confetti and remove after going below screen a little
      return !(b.popped && b.y > canvas.clientHeight + 120);
    });

    // Game over if player falls too far below
    if (player.y > canvas.clientHeight + 100) {
      running = false;
      overlay.classList.remove('hidden');
      overlayTitle.textContent = 'Game Over';
      overlayMsg.textContent = `Score: ${score} • High: ${highScore}`;
      savePlay(); // track play in hub (calls localStorage)
      // subtle pop
      popSound();
    }

    draw();
    requestAnimationFrame(update);
  }

  // Drawing functions
  function drawBackground() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    // gradient sky
    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, '#061226');
    g.addColorStop(1, '#021022');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
    // soft glow lights (parallax)
    for (let i=0;i<3;i++){
      ctx.beginPath();
      const gx = (i+1)*w*0.22 + Math.sin(perf*0.0004+i)*40;
      const gy = h*0.08 + Math.cos(perf*0.0003+i)*40;
      const rg = Math.min(w*0.35, 420);
      const grd = ctx.createRadialGradient(gx,gy,20,gx,gy,rg);
      grd.addColorStop(0, 'rgba(255,180,120,0.06)');
      grd.addColorStop(1, 'rgba(255,180,120,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0,0,w,h);
    }
  }

  let perf = 0;
  function draw() {
    perf += 16;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    // clear
    ctx.clearRect(0,0,w,h);
    drawBackground();

    // draw balloons sorted by y (farthest first)
    const sorted = balloons.slice().sort((a,b)=>a.y-b.y);
    for (let b of sorted) drawBalloon(b);

    // draw player with glow
    drawPlayer();

    // UI glow & particles (small)
    // subtle floating particles
    for (let i=0;i<6;i++){
      ctx.beginPath();
      const px = (i*73 + perf*0.05) % w;
      const py = (h*0.3 + Math.sin((perf*0.002 + i)*1.2)*20);
      ctx.fillStyle = `rgba(255,255,255,${0.02 + i*0.01})`;
      ctx.fillRect(px,py,2,2);
    }
  }

  function drawBalloon(b) {
    const {x,y,r,color,popped} = b;
    const ctxAlpha = ctx.globalAlpha;
    const stemLen = r*0.6;
    // glow
    ctx.beginPath();
    const grd = ctx.createRadialGradient(x, y - r*0.3, 0, x, y, r*2.2);
    grd.addColorStop(0, color.replace('hsl','hsla').replace(')', ',0.25)'));
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x-r*2.6, y-r*2.6, r*5.2, r*5.2);

    // balloon shadow (simple ellipse)
    ctx.beginPath();
    ctx.ellipse(x+8, y + r*0.8, r*0.9, r*0.36, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(3,6,10,0.25)';
    ctx.fill();

    // balloon body (rounded)
    ctx.beginPath();
    ctx.ellipse(x, y, r, r*1.03, 0, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();

    // highlight
    ctx.beginPath();
    ctx.ellipse(x - r*0.25, y - r*0.45, r*0.28, r*0.18, -0.25, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fill();

    // string
    ctx.beginPath();
    ctx.moveTo(x, y + r*0.9);
    ctx.quadraticCurveTo(x + 6, y + r*1.3, x - 6, y + r*1.8);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // popped effect
    if (popped) {
      ctx.beginPath();
      ctx.moveTo(x - r*0.6, y - r*0.4);
      for (let i = 0; i < 12; i++) {
        const ang = Math.PI*2 * i / 12;
        const rx = x + Math.cos(ang) * r * rand(0.8,1.6);
        const ry = y + Math.sin(ang) * r * rand(0.8,1.6);
        ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(255,255,255,0.12)`;
      ctx.fill();
    }

    ctx.globalAlpha = ctxAlpha;
  }

  function drawPlayer() {
    const p = player;
    // shadow
    ctx.beginPath();
    ctx.ellipse(p.x + 8, p.y + p.r*1.6, p.r*1.2, p.r*0.6, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(1,4,10,0.5)';
    ctx.fill();

    // glow ring
    ctx.beginPath();
    var grad = ctx.createRadialGradient(p.x, p.y, p.r*0.2, p.x, p.y, p.r*2.2);
    grad.addColorStop(0, 'rgba(255,240,200,0.12)');
    grad.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(p.x - p.r*2.5, p.y - p.r*2.5, p.r*5, p.r*5);

    // player circle body
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // face (simple)
    ctx.beginPath();
    ctx.arc(p.x - p.r*0.35, p.y - p.r*0.14, p.r*0.12, 0, Math.PI*2);
    ctx.fillStyle = '#111827'; ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x + p.r*0.12, p.y - p.r*0.14, p.r*0.12, 0, Math.PI*2);
    ctx.fillStyle = '#111827'; ctx.fill();
    // smile
    ctx.beginPath();
    ctx.arc(p.x, p.y + 2, p.r*0.28, 0, Math.PI);
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2; ctx.stroke();
  }

  // Simple play tracking for Hub (localStorage) — matches their 'gamePlays' structure
  function savePlay() {
    try {
      const key = 'gamePlays';
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      const name = 'Balloon Jumper';
      if (!data[name]) data[name] = { plays: 0, success: 0 };
      data[name].plays += 1;
      if (!running) data[name].success += 1;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  // start
  populateInitial();
  last = performance.now();
  requestAnimationFrame(update);

  // Starter instructions
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !paused) { paused = true; overlay.classList.remove('hidden'); overlayTitle.textContent = 'Paused'; }
  });

  // expose reset for UI
  window.resetBalloonJumper = resetGame;

  // initial score display
  scoreEl.textContent = score;
  highEl.textContent = highScore;
})();
