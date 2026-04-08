/* Jet Glide — script.js
   Uses Canvas API. Controls: Arrow keys, mouse drag/touch, on-screen buttons.
   Sound files: hosted at actions.google.com/sounds (public).
*/

(() => {
  // ---- Config ----
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const startBtn = document.getElementById('startBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayText = document.getElementById('overlay-text');
  const scoreEl = document.getElementById('score');
  const highEl = document.getElementById('highscore');
  const soundToggle = document.getElementById('sound-toggle');

  // On-screen buttons
  const upBtn = document.getElementById('upBtn');
  const downBtn = document.getElementById('downBtn');
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');

  // full-resolution canvas scaling
  function resizeCanvas() {
    const ratio = devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  // init
  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); drawStaticBackground(); });

  // Sounds (publicly hosted)
  const sounds = {
    thrust: new Audio('https://actions.google.com/sounds/v1/foley/wood_thud.ogg'), // subtle thrust
    boom: new Audio('https://actions.google.com/sounds/v1/explosions/explosion_large.ogg'),
    ding: new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg'),
    hit: new Audio('https://actions.google.com/sounds/v1/cartoon/metal_clang.ogg')
  };
  // default sound on
  let soundOn = true;
  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    soundToggle.setAttribute('aria-pressed', String(soundOn));
    soundToggle.textContent = soundOn ? '🔊' : '🔈';
  });

  // Utility play
  function playSound(s) { if (!soundOn) return; try{ s.currentTime = 0; s.play(); }catch(e){} }

  // Game vars
  const state = {
    running: false,
    paused: false,
    time: 0,
    speedMultiplier: 1,
    spawnTimer: 0,
    difficultyTimer: 0,
    score: 0,
    highscore: Number(localStorage.getItem('jetGlideHighScore') || 0)
  };
  highEl.textContent = state.highscore;

  // Jet
  const jet = {
    x: 140,
    y: 220,
    w: 68,
    h: 28,
    vy: 0,
    speed: 3.2,
    color: '#00f0ff',
    thrusting: false
  };

  // Mines (obstacles)
  const mines = [];

  // Background particles for parallax (glowing bulbs in a line as requested)
  const bulbs = [];
  function initBulbs() {
    bulbs.length = 0;
    const count = 26;
    for (let i = 0; i < count; i++) {
      bulbs.push({
        x: (i / (count - 1)) * canvas.clientWidth,
        y: 40 + (i % 2 === 0 ? 6 : -6),
        r: 4 + Math.random() * 6,
        glow: 0.4 + Math.random() * 0.8,
        hue: 180 + Math.random() * 120,
      });
    }
  }
  initBulbs();

  // Resize helper calls
  function setup() {
    resizeCanvas();
    initBulbs();
    drawStaticBackground();
  }
  setup();

  // Draw static background (gradient + bulbs)
  function drawStaticBackground() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // gradient sky
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#051023');
    g.addColorStop(0.5, '#02141f');
    g.addColorStop(1, '#02040a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // subtle stars / noise
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h * 0.6;
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // bulbs line at top
    bulbs.forEach(b => {
      const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 6);
      grd.addColorStop(0, `hsla(${b.hue},100%,65%,${0.12 + b.glow * 0.12})`);
      grd.addColorStop(0.3, `hsla(${b.hue},100%,55%,${0.06 + b.glow * 0.06})`);
      grd.addColorStop(1, 'rgba(2,6,10,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 6, 0, Math.PI * 2);
      ctx.fill();
      // central small bulb
      ctx.fillStyle = `hsla(${b.hue},100%,75%,${0.9 * b.glow})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Draw Jet (neon stylized)
  function drawJet() {
    const { x, y, w, h } = jet;
    // main body
    ctx.save();
    ctx.translate(x, y);
    // glow
    ctx.shadowBlur = 22;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#022a34';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(18, -18, 52, -8);
    ctx.lineTo(68, -8);
    ctx.quadraticCurveTo(72, -6, 70, 2);
    ctx.lineTo(50, 10);
    ctx.quadraticCurveTo(18, 18, 0, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // cockpit glow
    ctx.shadowBlur = 22;
    ctx.shadowColor = '#7cff6b';
    ctx.fillStyle = 'rgba(124,255,107,0.08)';
    ctx.beginPath();
    ctx.ellipse(30, -2, 13, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // exhaust (if thrusting)
    if (jet.thrusting) {
      ctx.shadowBlur = 28;
      ctx.shadowColor = 'rgba(255,91,211,0.35)';
      ctx.fillStyle = 'rgba(255,91,211,0.3)';
      ctx.beginPath();
      ctx.moveTo(-6, 2);
      ctx.lineTo(-18 + Math.sin(Date.now() / 120) * 4, -6);
      ctx.lineTo(-18 + Math.sin(Date.now() / 130) * 4, 12);
      ctx.closePath();
      ctx.fill();
    }

    // outline
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Draw mine
  function drawMine(m) {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.shadowBlur = 18;
    ctx.shadowColor = 'rgba(255,53,90,0.22)';
    // core
    ctx.fillStyle = '#ff2f6b';
    ctx.beginPath();
    ctx.arc(0, 0, m.r, 0, Math.PI * 2);
    ctx.fill();
    // spikes
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + (Date.now() / 3000) * (m.spin || 0.4);
      const sx = Math.cos(ang) * (m.r + 6);
      const sy = Math.sin(ang) * (m.r + 6);
      ctx.fillStyle = '#ffd1e8';
      ctx.fillRect(sx - 3, sy - 3, 6, 6);
    }
    ctx.restore();
  }

  // spawn mine
  function spawnMine() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const r = 12 + Math.random() * 18;
    const y = r + Math.random() * (h - r * 2);
    const speed = 2.2 + state.speedMultiplier * (1 + Math.random() * 1.6);
    mines.push({ x: w + 60, y, r, vx: -speed, spin: 0.4 + Math.random() * 0.8 });
  }

  // collision detection (circle-rect approx)
  function hitTestRectCircle(rx, ry, rw, rh, cx, cy, cr) {
    const nearestX = Math.max(rx, Math.min(cx, rx + rw));
    const nearestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return (dx * dx + dy * dy) < cr * cr;
  }

  // reset game
  function resetGame() {
    state.running = false;
    state.paused = false;
    state.time = 0;
    state.spawnTimer = 0;
    state.difficultyTimer = 0;
    state.score = 0;
    state.speedMultiplier = 1;
    mines.length = 0;
    jet.x = 140;
    jet.y = Math.max(80, canvas.clientHeight / 2 - 10);
    jet.vy = 0;
    jet.thrusting = false;
    scoreEl.textContent = '0';
    overlay.style.display = 'flex';
    overlayTitle.textContent = 'Jet Glide';
    overlayText.textContent = 'Press Start to play. Use arrows or drag to move. Avoid mines!';
    resumeBtn.hidden = true;
    pauseBtn.hidden = true;
  }

  // start / resume / pause handlers
  function startGame() {
    if (state.running && !state.paused) return;
    if (!state.running) {
      state.running = true;
      overlay.style.display = 'none';
      state.time = 0;
      mines.length = 0;
      state.score = 0;
      state.speedMultiplier = 1;
      playSound(sounds.ding);
      lastTS = performance.now();
      requestId = requestAnimationFrame(gameLoop);
      pauseBtn.hidden = false;
      resumeBtn.hidden = true;
      startBtn.hidden = true;
    } else if (state.paused) {
      state.paused = false;
      overlay.style.display = 'none';
      lastTS = performance.now();
      requestId = requestAnimationFrame(gameLoop);
      pauseBtn.hidden = false;
      resumeBtn.hidden = true;
    }
  }

  function pauseGame() {
    if (!state.running || state.paused) return;
    state.paused = true;
    overlay.style.display = 'flex';
    overlayTitle.textContent = 'Paused';
    overlayText.textContent = 'Resume when you are ready.';
    resumeBtn.hidden = false;
    pauseBtn.hidden = true;
    cancelAnimationFrame(requestId);
  }

  // game over
  function gameOver() {
    state.running = false;
    cancelAnimationFrame(requestId);
    overlay.style.display = 'flex';
    overlayTitle.textContent = 'Game Over';
    overlayText.textContent = `Final score: ${Math.floor(state.score)} — Try again!`;
    resumeBtn.hidden = true;
    pauseBtn.hidden = true;
    startBtn.hidden = true;
    playSound(sounds.boom);
    // highscore
    if (Math.floor(state.score) > state.highscore) {
      state.highscore = Math.floor(state.score);
      localStorage.setItem('jetGlideHighScore', state.highscore);
      highEl.textContent = state.highscore;
    }
  }

  // game loop
  let lastTS = 0;
  let requestId = null;
  function gameLoop(ts) {
    if (!lastTS) lastTS = ts;
    const dt = (ts - lastTS) / 1000; // seconds
    lastTS = ts;
    if (!state.running || state.paused) return;

    // update timers and spawn logic
    state.time += dt;
    state.spawnTimer += dt;
    state.difficultyTimer += dt;

    // increase difficulty slowly
    if (state.difficultyTimer > 6) {
      state.difficultyTimer = 0;
      state.speedMultiplier += 0.14; // increase mine speed
    }

    // spawn frequency depends on speed multiplier
    const spawnEvery = Math.max(0.6, 1.6 - (state.speedMultiplier * 0.12));
    if (state.spawnTimer > spawnEvery) {
      spawnMine();
      state.spawnTimer = 0;
    }

    // jet physics: simple smooth motion towards target velocity
    jet.vy += (jet.thrusting ? -0.2 : 0.18); // thrust vs gravity
    jet.vy = Math.max(-8, Math.min(8, jet.vy));
    jet.y += jet.vy * (1 + state.speedMultiplier * 0.04);

    // clamp
    const minY = 18;
    const maxY = canvas.clientHeight - 18;
    if (jet.y < minY) { jet.y = minY; jet.vy = 0; }
    if (jet.y > maxY) { jet.y = maxY; jet.vy = 0; }

    // update mines
    for (let i = mines.length - 1; i >= 0; i--) {
      const m = mines[i];
      m.x += m.vx * (1 + (state.speedMultiplier - 1) * 0.8);
      // remove offscreen
      if (m.x < -80) mines.splice(i, 1);
    }

    // score increases with time and multiplier
    state.score += (1 * (1 + state.speedMultiplier * 0.6)) * dt * 10;
    scoreEl.textContent = Math.floor(state.score);

    // check collisions (use a few sample points on jet)
    const jetRect = { x: jet.x - 10, y: jet.y - 20, w: 72, h: 36 };
    for (let i = 0; i < mines.length; i++) {
      const m = mines[i];
      if (hitTestRectCircle(jetRect.x, jetRect.y, jetRect.w, jetRect.h, m.x, m.y, m.r)) {
        // hit
        playSound(sounds.hit);
        gameOver();
        return;
      }
    }

    // draw
    drawStaticBackground();

    // draw mines
    mines.forEach(drawMine);

    // draw jet at its position
    ctx.save();
    // slightly tilt jet while moving
    ctx.translate(jet.x, jet.y);
    ctx.rotate(Math.max(-0.35, Math.min(0.35, jet.vy * 0.035)));
    // draw neon jet using path
    ctx.shadowBlur = 18;
    ctx.shadowColor = 'rgba(0,240,255,0.18)';
    ctx.fillStyle = '#08131a';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-10, 8);
    ctx.quadraticCurveTo(10, -18, 40, -6);
    ctx.lineTo(58, -6);
    ctx.quadraticCurveTo(68, -4, 66, 6);
    ctx.lineTo(38, 12);
    ctx.quadraticCurveTo(12, 18, -10, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // cockpit highlight
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(124,255,107,0.14)';
    ctx.fillStyle = 'rgba(124,255,107,0.06)';
    ctx.beginPath();
    ctx.ellipse(22, -1, 12, 6, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // spawn visual hint: faint glow ahead
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(0,240,255,0.02)';
    ctx.fillRect(jet.x + 48, 0, 200, canvas.clientHeight);
    ctx.restore();

    // request next frame
    requestId = requestAnimationFrame(gameLoop);
  }

  // input handling
  let pointerDown = false;
  let pointerId = null;

  function handlePointerMove(clientY) {
    // map clientY to canvas coordinates
    const rect = canvas.getBoundingClientRect();
    const y = (clientY - rect.top);
    // smooth move: aim towards y
    const diff = y - jet.y;
    jet.vy += diff * 0.02;
    // small thrust visual
    jet.thrusting = diff < -3;
  }

  // mouse/touch listeners
  canvas.addEventListener('pointerdown', (e) => {
    pointerDown = true; pointerId = e.pointerId;
    handlePointerMove(e.clientY);
    canvas.setPointerCapture(pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!pointerDown || e.pointerId !== pointerId) return;
    handlePointerMove(e.clientY);
  });
  canvas.addEventListener('pointerup', (e) => {
    if (e.pointerId === pointerId) {
      pointerDown = false; pointerId = null;
      canvas.releasePointerCapture(e.pointerId);
      jet.thrusting = false;
    }
  });

  // keyboard
  const keys = {};
  window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    // start with any key
    if (!state.running && e.key.length === 1 || !state.running && (e.key === 'ArrowUp' || e.key === ' ')) {
      startGame();
    }
    // immediate controls
    if (e.key === 'ArrowUp') { jet.vy -= 2; jet.thrusting = true; playSound(sounds.thrust); }
    if (e.key === 'ArrowDown') { jet.vy += 2; }
    if (e.key === 'p') { if (!state.running) startGame(); else pauseGame(); }
  });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; if (e.key === 'ArrowUp') jet.thrusting = false; });

  // on-screen buttons
  upBtn.addEventListener('pointerdown', () => { jet.vy -= 3; jet.thrusting = true; playSound(sounds.thrust); });
  upBtn.addEventListener('pointerup', () => { jet.thrusting = false; });
  downBtn.addEventListener('pointerdown', () => { jet.vy += 3; });
  leftBtn.addEventListener('pointerdown', () => { /* reserved for lateral movement */ });
  rightBtn.addEventListener('pointerdown', () => { /* reserved for lateral movement */ });

  // button events
  startBtn.addEventListener('click', startGame);
  resumeBtn.addEventListener('click', startGame);
  pauseBtn.addEventListener('click', pauseGame);
  restartBtn.addEventListener('click', () => {
    resetGame();
    startBtn.hidden = false;
    resumeBtn.hidden = true;
    pauseBtn.hidden = true;
  });

  // main loop to update UI (score + spawn behavior) even when not animating every ms
  setInterval(() => {
    scoreEl.textContent = Math.floor(state.score);
    // subtle auto-spawn slight chance when idle to keep dynamic visuals
    if (!state.running && Math.random() < 0.02) {
      spawnMine();
      setTimeout(() => { mines.pop(); }, 1200);
    }
  }, 150);

  // initial draw
  resetGame();
  drawStaticBackground();
  // render mines / jet even when idle
  (function idleDraw() {
    if (!state.running) {
      // render static overlay preview
      drawStaticBackground();
      mines.forEach(drawMine);
      // draw jet in center-left
      ctx.save();
      ctx.translate(jet.x, jet.y);
      ctx.rotate(0);
      ctx.shadowBlur = 14;
      ctx.shadowColor = 'rgba(0,240,255,0.12)';
      ctx.fillStyle = '#08131a';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.quadraticCurveTo(10, -18, 40, -6);
      ctx.lineTo(58, -6);
      ctx.quadraticCurveTo(68, -4, 66, 6);
      ctx.lineTo(38, 12);
      ctx.quadraticCurveTo(12, 18, -10, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      // draw mines faint
      mines.forEach(drawMine);
    }
    requestAnimationFrame(idleDraw);
  })();

  // draw loop continues via requestAnimationFrame in gameLoop

})();
