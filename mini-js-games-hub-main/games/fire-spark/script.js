/* Fire Spark — advanced canvas game with physics, wind, obstacles, touch/mouse tracking, sounds */

(() => {
  // Canvas & DOM
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });

  // Set size to CSS pixels * devicePixelRatio for crispness
  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * devicePixelRatio);
    canvas.height = Math.floor(rect.height * devicePixelRatio);
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const muteToggle = document.getElementById('muteToggle');

  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const heatBar = document.getElementById('heatBar');
  const windIndicator = document.getElementById('windIndicator');
  const statusEl = document.getElementById('status');

  const soundStart = document.getElementById('soundStart');
  const soundGust = document.getElementById('soundGust');
  const soundFail = document.getElementById('soundFail');

  // Audio: fallback/supplement using WebAudio for continuous subtle sizzle
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let sizzleGain = audioCtx.createGain();
  sizzleGain.gain.value = 0;
  sizzleGain.connect(audioCtx.destination);
  let sizzleOsc = null;
  function startSizzle() {
    if (sizzleOsc) return;
    sizzleOsc = audioCtx.createOscillator();
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 2.2;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.08;
    lfo.connect(lfoGain);
    lfoGain.connect(sizzleGain.gain);
    sizzleOsc.type = 'triangle';
    sizzleOsc.frequency.value = 240;
    sizzleOsc.connect(sizzleGain);
    sizzleOsc.start();
    lfo.start();
  }
  function stopSizzle() {
    if (!sizzleOsc) return;
    try { sizzleOsc.stop(); } catch {}
    sizzleOsc = null;
  }

  function playSound(el) {
    if (muteToggle.checked) return;
    if (!el) return;
    // audio context resume on first user gesture
    if (audioCtx.state === 'suspended') audioCtx.resume();
    el.currentTime = 0;
    el.volume = 0.9;
    el.play().catch(() => {});
  }

  // Game state
  let running = false;
  let paused = false;
  let last = 0;
  let score = 0;
  let best = parseInt(localStorage.getItem('fireSpark_best') || '0', 10) || 0;
  bestEl.textContent = best;
  let heat = 100; // 0-100
  let wind = 0; // -1 .. 1 scaled later
  let windTimer = 0;
  let gusting = false;

  // Player (spark) properties
  const spark = {
    x: canvas.width / (2 * devicePixelRatio),
    y: canvas.height / (2 * devicePixelRatio),
    vx: 0,
    vy: 0,
    radius: 18,
    maxSpeed: 800,
  };

  // Input tracking
  const input = { x: spark.x, y: spark.y, active: false };

  function setInputFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = ((e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX) - rect.left;
    const cy = ((e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY) - rect.top;
    input.x = cx;
    input.y = cy;
    input.active = true;
  }
  canvas.addEventListener('mousemove', setInputFromEvent);
  canvas.addEventListener('touchstart', setInputFromEvent, { passive: true });
  canvas.addEventListener('touchmove', setInputFromEvent, { passive: true });
  canvas.addEventListener('mouseleave', () => input.active = false);
  canvas.addEventListener('touchend', () => input.active = false);

  // Obstacles (cold gusts) array
  let obstacles = [];
  function spawnObstacle() {
    const w = canvas.width / devicePixelRatio;
    const h = canvas.height / devicePixelRatio;
    const size = 26 + Math.random() * 40;
    const y = 60 + Math.random() * (h - 120);
    const fromLeft = Math.random() > 0.5;
    const speed = 80 + Math.random() * 160;
    obstacles.push({
      x: fromLeft ? -size : w + size,
      y,
      r: size,
      vx: (fromLeft ? 1 : -1) * speed,
      life: 8 + Math.random() * 10
    });
  }

  // Wind dynamics
  function maybeChangeWind(dt) {
    windTimer -= dt;
    if (windTimer <= 0) {
      // change wind every 2-6 seconds
      windTimer = 2 + Math.random() * 4;
      // new wind
      const prev = wind;
      wind = (Math.random() - 0.5) * 2; // -1..1
      gusting = Math.abs(wind - prev) > 0.6;
      if (gusting) playSound(soundGust);
    }
  }

  // Update
  function update(ts) {
    if (!running || paused) { last = ts; requestAnimationFrame(update); return; }
    const dt = Math.min(0.045, (ts - last) / 1000);
    last = ts;

    maybeChangeWind(dt);

    // apply wind acceleration
    const windAccel = wind * 140; // pixels/s^2
    spark.vx += windAccel * dt;

    // input attraction (mouse)
    if (input.active) {
      const dx = input.x - spark.x;
      const dy = input.y - spark.y;
      const dist = Math.max(10, Math.hypot(dx, dy));
      const attraction = 9000 / (dist * dist); // stronger when close
      spark.vx += (dx / dist) * attraction * dt;
      spark.vy += (dy / dist) * attraction * dt;
      // regenerate heat when near cursor
      const near = dist < 120;
      if (near) heat = Math.min(100, heat + 26 * dt);
    } else {
      // small cooling when idle
      heat = Math.max(0, heat - 6 * dt);
    }

    // ambient cooling and wind negative effect
    heat = Math.max(0, heat - (6 + Math.abs(wind) * 8) * dt);

    // obstacles interactions
    obstacles.forEach((ob, i) => {
      ob.x += ob.vx * dt;
      ob.life -= dt;
      // collision with spark
      const dx = ob.x - spark.x;
      const dy = ob.y - spark.y;
      const dist = Math.hypot(dx, dy);
      if (dist < ob.r + spark.radius) {
        // sharp cooling hit
        heat -= 22 + Math.random() * 18;
        // push spark away
        spark.vx -= (dx / dist) * 220;
        spark.vy -= (dy / dist) * 120;
        ob.life = -1;
        playSound(soundGust);
      }
    });
    // remove dead obstacles
    obstacles = obstacles.filter(o => o.life > 0 && ((o.vx > 0 && o.x < canvas.width / devicePixelRatio + 200) || (o.vx < 0 && o.x > -200)));

    // occasional spawn
    if (Math.random() < dt * 0.9) {
      if (obstacles.length < 6 && Math.random() < 0.28) spawnObstacle();
    }

    // velocity damping
    spark.vx *= Math.pow(0.92, dt * 60);
    spark.vy = Math.min(1000, spark.vy + 420 * dt); // gentle gravity-ish effect
    spark.vy *= Math.pow(0.94, dt * 60);

    // clamp speed
    const spd = Math.hypot(spark.vx, spark.vy);
    if (spd > spark.maxSpeed) {
      spark.vx = (spark.vx / spd) * spark.maxSpeed;
      spark.vy = (spark.vy / spd) * spark.maxSpeed;
    }

    // movement
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;

    // bounds; bounce gently
    const w = canvas.width / devicePixelRatio;
    const h = canvas.height / devicePixelRatio;
    if (spark.x < spark.radius) { spark.x = spark.radius; spark.vx *= -0.45; }
    if (spark.x > w - spark.radius) { spark.x = w - spark.radius; spark.vx *= -0.45; }
    if (spark.y < spark.radius) { spark.y = spark.radius; spark.vy *= -0.45; }
    if (spark.y > h - spark.radius) { spark.y = h - spark.radius; spark.vy *= -0.45; }

    // scoring
    score += dt * (0.8 + heat / 120);
    scoreEl.textContent = Math.floor(score);

    // update UI
    heatBar.style.width = `${Math.max(0, heat)}%`;
    const windText = (wind > 0.1) ? `→ ${wind.toFixed(2)}` : (wind < -0.1) ? `← ${Math.abs(wind).toFixed(2)}` : `↔ 0`;
    windIndicator.textContent = windText;
    statusEl.textContent = running ? (paused ? 'Paused' : 'Running') : 'Idle';

    // update sizzle volume based on heat
    try {
      startSizzle();
      sizzleGain.gain.linearRampToValueAtTime((heat / 140) * (muteToggle.checked ? 0 : 0.8), audioCtx.currentTime + 0.06);
    } catch {}

    // check fail
    if (heat <= 0) {
      onFail();
      return;
    }

    // draw
    drawFrame();
    requestAnimationFrame(update);
  }

  // Draw spark with glow
  function drawFrame() {
    const w = canvas.width / devicePixelRatio;
    const h = canvas.height / devicePixelRatio;
    ctx.clearRect(0, 0, w, h);

    // subtle background vignette
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(0,0,0,0.08)');
    g.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // draw obstacles (cold gusts)
    obstacles.forEach((o) => {
      ctx.save();
      ctx.beginPath();
      const grd = ctx.createRadialGradient(o.x, o.y, o.r * 0.1, o.x, o.y, o.r);
      grd.addColorStop(0, 'rgba(100,180,255,0.85)');
      grd.addColorStop(1, 'rgba(30,70,120,0.08)');
      ctx.fillStyle = grd;
      ctx.shadowColor = 'rgba(60,150,255,0.18)';
      ctx.shadowBlur = 26;
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // flame core
    const coreR = spark.radius * 0.7;
    const x = spark.x;
    const y = spark.y;

    // outer glow grows with heat
    const glow = 26 + heat * 0.9;
    ctx.save();
    ctx.beginPath();
    const glowGrd = ctx.createRadialGradient(x, y, coreR * 0.2, x, y, coreR + glow);
    glowGrd.addColorStop(0, `rgba(255,220,120,${Math.min(1, 0.9 + heat / 140)})`);
    glowGrd.addColorStop(0.4, 'rgba(255,110,55,0.18)');
    glowGrd.addColorStop(1, 'rgba(10,10,10,0)');
    ctx.fillStyle = glowGrd;
    ctx.shadowBlur = Math.max(12, glow * 0.6);
    ctx.shadowColor = 'rgba(255,120,50,0.25)';
    ctx.arc(x, y, coreR + glow, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // inner core gradient
    ctx.save();
    ctx.beginPath();
    const coreGrd = ctx.createRadialGradient(x, y, 1, x, y, coreR);
    coreGrd.addColorStop(0, 'rgba(255,255,200,1)');
    coreGrd.addColorStop(0.3, 'rgba(255,200,110,1)');
    coreGrd.addColorStop(0.6, 'rgba(255,110,55,0.95)');
    coreGrd.addColorStop(1, 'rgba(220,40,30,0.8)');
    ctx.fillStyle = coreGrd;
    ctx.shadowColor = 'rgba(255,120,60,0.18)';
    ctx.shadowBlur = 8;
    ctx.arc(x, y - coreR * 0.18, coreR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // flicker tiny sparks
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = coreR + Math.random() * (coreR * 1.4);
      const sx = x + Math.cos(angle) * r * 0.6;
      const sy = y + Math.sin(angle) * r * 0.5;
      ctx.save();
      ctx.globalAlpha = Math.random() * 0.7 + 0.05;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,${160 + Math.floor(Math.random() * 90)},${40 + Math.floor(Math.random() * 60)},1)`;
      ctx.arc(sx, sy, Math.random() * 2.8 + 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // tiny smoke trail when low heat
    if (heat < 40) {
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.globalAlpha = Math.random() * 0.14 + 0.02;
        ctx.fillStyle = `rgba(80,80,90,1)`;
        const sx = x + Math.random() * 24 - 12;
        const sy = y - coreR - (Math.random() * 40);
        ctx.beginPath();
        ctx.arc(sx, sy, Math.random() * 8 + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // Fail handler
  function onFail() {
    running = false;
    paused = false;
    stopSizzle();
    playSound(soundFail);
    statusEl.textContent = 'Extinguished 💀';
    // update best
    const final = Math.floor(score);
    if (final > best) {
      best = final;
      localStorage.setItem('fireSpark_best', best);
      bestEl.textContent = best;
    }
    // flash canvas
    const orig = canvas.style.boxShadow;
    canvas.style.transition = 'box-shadow 0.4s';
    canvas.style.boxShadow = '0 0 36px 10px rgba(255,40,20,0.8)';
    setTimeout(() => { canvas.style.boxShadow = orig; }, 450);

    // reset basic state (but allow restart)
  }

  // controls
  startBtn.addEventListener('click', () => {
    if (!running) {
      startGame();
    } else if (paused) {
      paused = false;
      statusEl.textContent = 'Running';
      requestAnimationFrame(update);
    }
    playSound(soundStart);
  });

  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    statusEl.textContent = paused ? 'Paused' : 'Running';
    if (!paused) {
      last = performance.now();
      requestAnimationFrame(update);
    } else {
      // quieter
      sizzleGain.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 0.06);
    }
  });

  restartBtn.addEventListener('click', () => {
    stopSizzle();
    resetGame();
    startGame();
    playSound(soundStart);
  });

  muteToggle.addEventListener('change', () => {
    if (muteToggle.checked) {
      sizzleGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.06);
    }
  });

  // start logic
  function startGame() {
    running = true;
    paused = false;
    last = performance.now();
    score = 0;
    heat = 95 + Math.random() * 5;
    spark.x = (canvas.width / devicePixelRatio) / 2;
    spark.y = (canvas.height / devicePixelRatio) / 2;
    spark.vx = 0; spark.vy = 0;
    obstacles = [];
    wind = 0;
    windTimer = 1.2;
    statusEl.textContent = 'Running';
    playSound(soundStart);
    requestAnimationFrame(update);
  }

  function resetGame() {
    running = false;
    paused = false;
    score = 0;
    heat = 100;
    heatBar.style.width = '100%';
    scoreEl.textContent = 0;
    statusEl.textContent = 'Idle';
    obstacles = [];
  }

  // initial state
  resetGame();

  // open in new tab anchor functionality
  document.getElementById('open-tab').addEventListener('click', (e) => {
    e.preventDefault();
    window.open(window.location.href, '_blank');
  });

  // Friendly autopause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && running && !paused) {
      paused = true;
      statusEl.textContent = 'Paused (background)';
    }
  });

  // Quick keyboard controls
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (!running) startGame();
      else paused = !paused;
    } else if (e.key.toLowerCase() === 'r') {
      restartBtn.click();
    }
  });

  // tiny autoplay resume on first user gesture (for AudioContext)
  window.addEventListener('pointerdown', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }, { once: true });

  // click canvas to nudge spark
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    spark.vx += (e.clientX - rect.left - spark.x) * 0.08;
    spark.vy += (e.clientY - rect.top - spark.y) * 0.06;
  });

  // make sure UI reflects score periodically
  setInterval(() => {
    scoreEl.textContent = Math.floor(score);
  }, 300);

  // ensure best displayed
  bestEl.textContent = best;

})();
