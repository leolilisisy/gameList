/* Aurora Glow Catcher
   - Canvas game with glowing fragments, obstacles, aurora effect.
   - Controls: Arrow keys or drag mouse/touch to move catcher.
   - Buttons: Play/Pause, Restart, Mute.
   - Sounds: synthesized via WebAudio (no external downloads).
*/

(() => {
  // --- ELEMENTS ---
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const playPauseBtn = document.getElementById('playPauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const muteBtn = document.getElementById('muteBtn');
  const timeDisplay = document.getElementById('timeDisplay');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const livesDisplay = document.getElementById('livesDisplay');
  const auroraBar = document.getElementById('auroraBar');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayMsg = document.getElementById('overlayMsg');
  const finalScore = document.getElementById('finalScore');
  const overlayRestart = document.getElementById('overlayRestart');
  const overlayClose = document.getElementById('overlayClose');

  // --- RESIZE CANVAS ---
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // --- GAME STATE ---
  const GAME = {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    running: false,
    muted: false,
    score: 0,
    timeLeft: 45, // seconds
    lives: 3,
    lastTimestamp: 0,
    spawnTimer: 0,
    obstacleTimer: 0,
    fragments: [],
    obstacles: [],
    auroraStrength: 0, // 0..1
    combo: 0
  };

  // --- AUDIO (WebAudio synth) ---
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.25; // default volume
  masterGain.connect(audioCtx.destination);

  function playBeep(freq = 440, time = 0.05, type = 'sine') {
    if (GAME.muted) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(masterGain);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + time);
    o.stop(audioCtx.currentTime + time + 0.02);
  }
  function playPop() { playBeep(880, 0.08, 'triangle'); }
  function playCollect() { playBeep(720, 0.10, 'sine'); }
  function playHit() { playBeep(220, 0.18, 'sawtooth'); }

  // --- UTILS ---
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function formatTime(s) { const mm = Math.floor(s/60); const ss = Math.floor(s%60); return `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`; }

  // --- CATCHER (player) ---
  const catcher = {
    x: 0, y: 0, r: 36,
    targetX: null, targetY: null,
    speed: 900, // px per second
    update(dt) {
      if (this.targetX === null) return;
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 2) { this.x = this.targetX; this.y = this.targetY; return; }
      const vx = (dx/dist) * this.speed * dt;
      const vy = (dy/dist) * this.speed * dt;
      this.x += vx; this.y += vy;
      // clamp inside canvas
      this.x = clamp(this.x, this.r, canvas.clientWidth - this.r);
      this.y = clamp(this.y, this.r, canvas.clientHeight - this.r);
    },
    draw() {
      // catcher's soft glowing circle
      const g = ctx.createRadialGradient(this.x, this.y, 4, this.x, this.y, this.r*2);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(0.12, 'rgba(180,240,255,0.6)');
      g.addColorStop(0.28, 'rgba(120,180,255,0.22)');
      g.addColorStop(1, 'rgba(120,150,240,0.03)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r*1.2, 0, Math.PI*2);
      ctx.fill();

      // catcher ring
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.stroke();
    }
  };

  // --- PARTICLES / FRAGMENTS ---
  class Fragment {
    constructor() {
      this.r = rand(6, 18);
      this.x = rand(this.r, canvas.clientWidth - this.r);
      this.y = rand(-120, -20);
      this.vy = rand(30, 140);
      this.vx = rand(-30, 30);
      this.hue = rand(160, 300); // aurora palette
      this.bonus = this.r > 12 ? 3 : 1;
      this.glow = rand(0.6, 1.1);
      this.collected = false;
      this.life = rand(8, 16);
    }
    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.life -= dt;
      // horizontal wrap
      if (this.x < -50) this.x = canvas.clientWidth + 50;
      if (this.x > canvas.clientWidth + 50) this.x = -50;
    }
    draw() {
      // multi-layer glow
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const a = (0.08 + (0.06 * i)) * this.glow;
        ctx.fillStyle = `hsla(${this.hue}, 90%, ${60 - i*8}%, ${a})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r + i*6, 0, Math.PI*2);
        ctx.fill();
      }

      // core
      ctx.fillStyle = `hsl(${this.hue}, 90%, 88%)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r*0.5, 0, Math.PI*2);
      ctx.fill();

      // small sparkle
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(this.x - this.r*0.15, this.y - this.r*0.15, Math.max(1, this.r*0.12), 0, Math.PI*2);
      ctx.fill();

      ctx.restore();
    }
  }

  // --- OBSTACLES (dark clouds) ---
  class Obstacle {
    constructor() {
      this.w = rand(60, 160);
      this.h = rand(36, 84);
      this.x = rand(0, canvas.clientWidth - this.w);
      this.y = rand(-140, -40);
      this.vy = rand(40, 120);
      this.opacity = rand(0.18, 0.42);
      this.life = rand(8, 14);
    }
    update(dt) {
      this.y += this.vy * dt;
      this.life -= dt;
    }
    draw() {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createLinearGradient(this.x, this.y, this.x + this.w, this.y + this.h);
      g.addColorStop(0, `rgba(6,10,15,${this.opacity})`);
      g.addColorStop(1, `rgba(10,14,20,${this.opacity+0.08})`);
      ctx.fillStyle = g;
      // soft shaped cloud
      ctx.beginPath();
      ctx.ellipse(this.x + this.w*0.25, this.y + this.h*0.4, this.w*0.28, this.h*0.5, 0, 0, Math.PI*2);
      ctx.ellipse(this.x + this.w*0.6, this.y + this.h*0.25, this.w*0.38, this.h*0.6, 0, 0, Math.PI*2);
      ctx.ellipse(this.x + this.w*0.85, this.y + this.h*0.45, this.w*0.26, this.h*0.45, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- SPAWN LOGIC ---
  function spawnFragment() {
    const f = new Fragment();
    GAME.fragments.push(f);
  }
  function spawnObstacle() {
    const o = new Obstacle();
    GAME.obstacles.push(o);
  }

  // --- COLLISION ---
  function circleRectCollide(cx, cy, cr, rx, ry, rw, rh) {
    // nearest point
    const nx = clamp(cx, rx, rx + rw);
    const ny = clamp(cy, ry, ry + rh);
    const dx = cx - nx;
    const dy = cy - ny;
    return dx*dx + dy*dy <= cr*cr;
  }

  // --- INPUT ---
  let dragging = false;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    const rect = canvas.getBoundingClientRect();
    catcher.targetX = e.clientX - rect.left;
    catcher.targetY = e.clientY - rect.top;
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    catcher.targetX = clamp(e.clientX - rect.left, catcher.r, canvas.clientWidth - catcher.r);
    catcher.targetY = clamp(e.clientY - rect.top, catcher.r, canvas.clientHeight - catcher.r);
  });
  window.addEventListener('pointerup', () => { dragging = false; });

  // keyboard control
  const keys = {};
  window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    // start audio context on interaction (mobile)
    if (audioCtx.state === 'suspended') audioCtx.resume();
  });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });

  function handleKeyboard(dt) {
    let moved = false;
    const speed = 420; // px/sec
    if (keys.ArrowLeft || keys.a) { catcher.x -= speed * dt; moved = true; }
    if (keys.ArrowRight || keys.d) { catcher.x += speed * dt; moved = true; }
    if (keys.ArrowUp || keys.w) { catcher.y -= speed * dt; moved = true; }
    if (keys.ArrowDown || keys.s) { catcher.y += speed * dt; moved = true; }
    if (moved) {
      catcher.targetX = catcher.x;
      catcher.targetY = catcher.y;
    }
    // clamp
    catcher.x = clamp(catcher.x, catcher.r, canvas.clientWidth - catcher.r);
    catcher.y = clamp(catcher.y, catcher.r, canvas.clientHeight - catcher.r);
  }

  // --- GAME CONTROL FUNCTIONS ---
  function updateHUD() {
    timeDisplay.textContent = formatTime(GAME.timeLeft);
    scoreDisplay.textContent = GAME.score;
    livesDisplay.textContent = GAME.lives;
    const percent = clamp(GAME.auroraStrength * 100, 0, 100);
    auroraBar.style.width = `${percent}%`;
  }

  function resetGame() {
    GAME.score = 0;
    GAME.timeLeft = 45;
    GAME.lives = 3;
    GAME.fragments = [];
    GAME.obstacles = [];
    GAME.auroraStrength = 0;
    GAME.combo = 0;
    GAME.spawnTimer = 0;
    GAME.obstacleTimer = 0;
    GAME.lastTimestamp = 0;
    catcher.x = canvas.clientWidth / 2;
    catcher.y = canvas.clientHeight * 0.75;
    catcher.targetX = catcher.x;
    catcher.targetY = catcher.y;
    overlay.classList.add('hidden');
    updateHUD();
  }

  function endGame(win = false) {
    GAME.running = false;
    playBeep(win ? 880 : 160, 0.4, win ? 'sine' : 'sawtooth');
    overlay.classList.remove('hidden');
    overlayTitle.textContent = win ? 'Victory!' : 'Game Over';
    overlayMsg.textContent = win ? 'You formed a beautiful aurora.' : 'Better luck next time!';
    finalScore.textContent = GAME.score;
    overlayRestart.focus();
    playPauseBtn.textContent = 'Play';
  }

  // attach UI buttons
  playPauseBtn.addEventListener('click', () => {
    if (!GAME.running) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      GAME.running = true;
      playPauseBtn.textContent = 'Pause';
      GAME.lastTimestamp = performance.now();
      requestAnimationFrame(loop);
    } else {
      GAME.running = false;
      playPauseBtn.textContent = 'Play';
    }
  });

  restartBtn.addEventListener('click', () => {
    resetGame();
    if (!GAME.running) {
      GAME.running = false;
      playPauseBtn.textContent = 'Play';
    }
  });

  overlayRestart.addEventListener('click', () => {
    resetGame();
    GAME.running = true;
    playPauseBtn.textContent = 'Pause';
    overlay.classList.add('hidden');
    GAME.lastTimestamp = performance.now();
    requestAnimationFrame(loop);
  });
  overlayClose.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });

  muteBtn.addEventListener('click', () => {
    GAME.muted = !GAME.muted;
    muteBtn.textContent = GAME.muted ? '🔇' : '🔊';
  });

  // --- MAIN LOOP ---
  function loop(ts) {
    if (!GAME.running) return;
    const dt = Math.min(0.05, (ts - (GAME.lastTimestamp || ts)) / 1000);
    GAME.lastTimestamp = ts;

    // handle keyboard movement
    handleKeyboard(dt);
    catcher.update(dt);

    // spawn logic
    GAME.spawnTimer += dt;
    GAME.obstacleTimer += dt;
    if (GAME.spawnTimer > 0.6) {
      spawnFragment();
      GAME.spawnTimer = 0;
    }
    if (GAME.obstacleTimer > 3.2) {
      spawnObstacle();
      GAME.obstacleTimer = 0;
    }

    // update fragments
    for (let i = GAME.fragments.length - 1; i >= 0; i--) {
      const f = GAME.fragments[i];
      f.update(dt);
      // collision with catcher
      const dx = f.x - catcher.x;
      const dy = f.y - catcher.y;
      const dist2 = dx*dx + dy*dy;
      if (dist2 < (catcher.r + f.r)*(catcher.r + f.r)) {
        // collect
        GAME.score += 10 * f.bonus + Math.floor(GAME.combo * 2);
        GAME.auroraStrength = clamp(GAME.auroraStrength + 0.03 * f.bonus, 0, 1);
        GAME.combo += 1;
        playCollect();
        GAME.fragments.splice(i,1);
        continue;
      }
      // remove if offscreen or dead
      if (f.y > canvas.clientHeight + 60 || f.life <= 0) {
        GAME.fragments.splice(i,1);
        GAME.combo = 0; // break combo when missed
      }
    }

    // update obstacles
    for (let i = GAME.obstacles.length - 1; i >= 0; i--) {
      const o = GAME.obstacles[i];
      o.update(dt);
      if (circleRectCollide(catcher.x, catcher.y, catcher.r, o.x, o.y, o.w, o.h)) {
        // hit
        GAME.lives -= 1;
        GAME.auroraStrength = clamp(GAME.auroraStrength - 0.08, 0, 1);
        playHit();
        GAME.obstacles.splice(i,1);
      } else if (o.y > canvas.clientHeight + 120 || o.life <= 0) {
        GAME.obstacles.splice(i,1);
      }
    }

    // update time
    GAME.timeLeft -= dt;
    if (GAME.timeLeft <= 0 || GAME.lives <= 0) {
      endGame(GAME.auroraStrength > 0.6);
      updateHUD();
      return;
    }

    // smooth aurora growth: small decay to encourage continuous play
    GAME.auroraStrength = clamp(GAME.auroraStrength * 0.999 + 0.0001, 0, 1);

    // RENDER
    render();

    updateHUD();
    requestAnimationFrame(loop);
  }

  // --- RENDERING: layered effects for bloom & aurora ---
  function render() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    // clear
    ctx.clearRect(0,0,w,h);

    // faint starfield backdrop
    drawStars();

    // aurora background: multi-layered color bands
    drawAurora();

    // soft ambient glow layer
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // fragments (glow)
    for (const f of GAME.fragments) f.draw();
    ctx.restore();

    // obstacles
    for (const o of GAME.obstacles) o.draw();

    // catcher
    catcher.draw();

    // foreground sparkles
    drawSparkles();

    // subtle vignette
    drawVignette();
  }

  // --- Helper draw functions ---
  const starCache = [];
  function drawStars() {
    if (starCache.length === 0) {
      for (let i=0;i<120;i++){
        starCache.push({
          x: rand(0, canvas.clientWidth),
          y: rand(0, canvas.clientHeight),
          r: rand(0.3,1.8),
          a: rand(0.05,0.6)
        });
      }
    }
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const s of starCache) {
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawAurora() {
    const g = ctx.createLinearGradient(0, canvas.clientHeight*0.2, 0, canvas.clientHeight);
    // base band colors influenced by auroraStrength
    const t = GAME.auroraStrength;
    const hueA = 190 + 140 * t;
    const hueB = 240 - 40 * t;
    const alphaA = 0.06 + 0.32 * t;
    const alphaB = 0.02 + 0.14 * t;

    g.addColorStop(0.0, `hsla(${hueA}, 90%, 60%, ${alphaA})`);
    g.addColorStop(0.5, `hsla(${hueB}, 85%, 55%, ${alphaB})`);
    g.addColorStop(1.0, `rgba(6,8,20,0)`);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    // wavy band
    ctx.beginPath();
    const bands = 4;
    for (let b=0; b<bands; b++){
      const yoff = canvas.clientHeight*0.3 + b*24;
      ctx.moveTo(0, yoff);
      for (let x=0; x<=canvas.clientWidth; x+=40){
        const yy = yoff + Math.sin((x*0.005) + (b*0.8) + performance.now()*0.0005) * (16 + b*8) * t;
        ctx.lineTo(x, yy);
      }
      ctx.lineTo(canvas.clientWidth, canvas.clientHeight);
      ctx.lineTo(0, canvas.clientHeight);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawSparkles() {
    // subtle particles near catcher depending on auroraStrength
    const count = Math.floor(6 + GAME.auroraStrength * 20);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i=0;i<count;i++){
      const ang = Math.random()*Math.PI*2;
      const rad = rand(8, catcher.r + 30);
      const x = catcher.x + Math.cos(ang) * rad * rand(0.2,1);
      const y = catcher.y + Math.sin(ang) * rad * rand(0.2,1);
      const s = rand(0.8, 2.8);
      ctx.fillStyle = `rgba(220,255,255,${0.03 + GAME.auroraStrength*0.12})`;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawVignette() {
    const grad = ctx.createRadialGradient(canvas.clientWidth/2, canvas.clientHeight/2, 10, canvas.clientWidth/2, canvas.clientHeight/2, Math.max(canvas.clientWidth, canvas.clientHeight));
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.12)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,canvas.clientWidth, canvas.clientHeight);
  }

  // --- initial placement and start state ---
  resetGame();

  // small interval to add extra fragments and subtle difficulty scaling
  setInterval(() => {
    if (!GAME.running) return;
    // spawn more fragments as aurora grows (positive feedback)
    if (Math.random() < 0.65) spawnFragment();
    // small chance of big fragment
    if (Math.random() < Math.min(0.06 + GAME.auroraStrength*0.12, 0.18)) {
      const f = new Fragment();
      f.r = rand(18, 30);
      f.bonus = 3;
      GAME.fragments.push(f);
    }
  }, 700);

  // ensure pointer events reflect actual canvas size
  function scaleCatcherToCanvas() {
    catcher.x = canvas.clientWidth / 2;
    catcher.y = canvas.clientHeight * 0.75;
    catcher.targetX = catcher.x;
    catcher.targetY = catcher.y;
  }
  scaleCatcherToCanvas();

  // auto-start small ambient breathing sound when the user plays
  function startAmbient() {
    if (GAME.muted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    // gentle pulsing ambient with low oscillator + LFO
    if (window._auroraAmbient) return;
    const base = audioCtx.createOscillator();
    base.type = 'sine';
    base.frequency.value = 80;
    const gain = audioCtx.createGain();
    gain.gain.value = 0.02;
    base.connect(gain);
    gain.connect(masterGain);
    base.start();

    // LFO
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();

    window._auroraAmbient = { base, lfo, gain };
  }
  function stopAmbient() {
    const amb = window._auroraAmbient;
    if (!amb) return;
    try { amb.base.stop(); amb.lfo.stop(); } catch(e) {}
    delete window._auroraAmbient;
  }

  // play/pause should toggle ambient too
  playPauseBtn.addEventListener('click', () => {
    if (GAME.running) stopAmbient(); else startAmbient();
  });
  overlayRestart.addEventListener('click', startAmbient);
  overlayClose.addEventListener('click', stopAmbient);

  // small performance tweak: ensure canvas css size sync
  function syncCanvasSize() {
    canvas.style.width = canvas.clientWidth + 'px';
    canvas.style.height = canvas.clientHeight + 'px';
  }
  syncCanvasSize();

  // autoplay resume on user gesture
  window.addEventListener('pointerdown', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
  });

  // expose restart on double-click canvas too
  canvas.addEventListener('dblclick', () => {
    resetGame();
  });

  // update HUD every half second
  setInterval(updateHUD, 300);

  // initialize screen placement
  resizeCanvas();
  scaleCatcherToCanvas();
  // ensure game doesn't start until user presses Play
})();
