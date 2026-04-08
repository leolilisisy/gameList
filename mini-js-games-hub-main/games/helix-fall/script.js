/* Helix Fall — main game logic
   - Rendered on canvas
   - Tower rotates, ball falls/bounces
   - Platforms generated with safe and danger segments
   - Controls: arrow keys or drag rotate
   - Pause / Resume / Restart
   - Score + highscore in localStorage
   - Simple web-audio effects (no downloads)
*/

(() => {
  // --- Config ---
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const W = canvas.width = 420;
  const H = canvas.height = 720;

  // UI elements
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const pauseResumeBtn = document.getElementById('pauseResumeBtn');
  const restartBtn = document.getElementById('restartBtn');
  const playBtn = document.getElementById('playBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const centerMessage = document.getElementById('centerMessage');
  const muteBtn = document.getElementById('muteBtn');

  // Game state
  let running = false;
  let paused = false;
  let muted = false;
  let lastTime = 0;
  let rotation = 0; // tower rotation in radians
  let rotationTarget = 0;
  let rotationVelocity = 0;
  let score = 0;
  let best = parseInt(localStorage.getItem('helix_best') || '0', 10);
  bestEl.textContent = best;

  // Tower / level configuration
  const RADIUS = Math.min(W, H) * 0.42;
  const center = { x: W / 2, y: H / 2 - 40 };
  const ringHeight = 36;
  const gapBetweenRings = 8;
  const ringsVisible = Math.ceil(H / (ringHeight + gapBetweenRings)) + 6;

  // Ball
  const ball = {
    x: center.x,
    y: 170,
    vy: 0,
    radius: 10,
    grounded: false,
    color: '#ffffff',
  };

  // Platforms: array of rings (from top to bottom), each ring has segments; each segment has angleStart, angleEnd, safe(bool)
  let rings = [];
  let scrollOffset = 0; // how far tower has scrolled down (increase as ball descends)
  let difficultyTimer = 0;

  // input
  let pointerDown = false;
  let lastPointerX = 0;
  let keyLeft = false, keyRight = false;

  // audio: simple WebAudio Generator
  const audioCtx = (window.AudioContext || window.webkitAudioContext)();
  function playTone(freq = 200, duration = 0.08, type = 'sine', gain = 0.08) {
    if (muted || !audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    setTimeout(() => { try{ o.stop(); } catch(e){} }, duration*1000 + 20);
  }
  function playBounce(){ playTone(450,0.05,'triangle',0.06); }
  function playDanger(){ playTone(120,0.25,'sawtooth',0.14); }
  function playScore(){ playTone(800,0.07,'square',0.06); }
  function playStart(){ playTone(560,0.08,'sine',0.08); playTone(980,0.06,'sine',0.05); }

  // utilities
  const TAU = Math.PI * 2;
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function rand(min,max){return Math.random()*(max-min)+min}
  function degToRad(d){return d*Math.PI/180}

  // initialize rings
  function buildInitialRings() {
    rings = [];
    for (let i = 0; i < 200; i++) {
      rings.push(generateRing(i));
    }
    scrollOffset = 0;
  }

  function generateRing(index) {
    // index 0 is top, increasing index goes downward
    const numSegments = 8;
    const segments = [];
    // difficulty increases with index
    const dangerProbability = clamp(0.08 + index * 0.002, 0.08, 0.45);
    // random start angle offset
    const base = rand(0, TAU);
    // create contiguous safe segment (gap) and rest maybe danger or safe
    // Approach: pick one gap (safe) length (in segments), rest either safe or danger based on prob
    const gapLength = Math.max(1, Math.round(rand(1, 2.4))); // 1-2 segments gap
    const gapIndex = Math.floor(rand(0, numSegments));
    for (let s = 0; s < numSegments; s++) {
      const startAngle = base + (s / numSegments) * TAU;
      const endAngle = base + ((s + 1) / numSegments) * TAU;
      const isGap = (s >= gapIndex && s < gapIndex + gapLength) || (gapIndex + gapLength > numSegments && s < (gapIndex + gapLength - numSegments));
      // If gap -> safe, else random safe/danger based on dangerProbability
      const safe = isGap ? true : (Math.random() > dangerProbability);
      segments.push({ start: startAngle, end: endAngle, safe });
    }
    return { segments, index };
  }

  // draw
  function drawBackground() {
    // radial halo behind tower
    const g = ctx.createRadialGradient(center.x, center.y, 20, center.x, center.y, RADIUS * 1.6);
    g.addColorStop(0, 'rgba(126,249,255,0.03)');
    g.addColorStop(0.2, 'rgba(126,249,255,0.01)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawTower() {
    // draw rings stacked along y with rotation applied
    for (let r = 0; r < ringsVisible; r++) {
      const ringIndex = Math.floor((scrollOffset / (ringHeight + gapBetweenRings))) + r;
      const localY = center.y + (r - 3) * (ringHeight + gapBetweenRings) - (scrollOffset % (ringHeight + gapBetweenRings));
      const ring = rings[ringIndex];
      if (!ring) continue;
      // glow ring background
      const ringRadius = RADIUS - r * 6;
      ctx.save();
      ctx.translate(center.x, localY);
      ctx.rotate(rotation);
      // base circle (shadow)
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius + 8, 0, TAU);
      ctx.fillStyle = 'rgba(10,10,20,0.6)';
      ctx.fill();
      // segments
      ring.segments.forEach(seg => {
        const a0 = seg.start;
        const a1 = seg.end;
        const isSafe = seg.safe;
        ctx.beginPath();
        // draw thick arc
        ctx.lineWidth = ringHeight - 6;
        ctx.lineCap = 'butt';
        ctx.strokeStyle = isSafe
          ? 'rgba(100,255,200,0.14)'
          : 'rgba(255,80,80,0.13)';
        ctx.strokeStyle = isSafe
          ? '#28f0c7'
          : '#ff4a4a';
        // use subtle gradient glow for safe/danger
        const gradient = ctx.createLinearGradient(Math.cos(a0)*-1, Math.sin(a0)*-1, Math.cos(a1), Math.sin(a1));
        if (isSafe) {
          gradient.addColorStop(0, '#00f5a0');
          gradient.addColorStop(1, '#00c2a8');
        } else {
          gradient.addColorStop(0, '#ff8b8b');
          gradient.addColorStop(1, '#ff2a2a');
        }
        ctx.strokeStyle = gradient;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, a0, a1);
        ctx.stroke();
        // small glow
        if (!isSafe) {
          ctx.beginPath();
          ctx.globalAlpha = 0.06;
          ctx.lineWidth = ringHeight + 10;
          ctx.strokeStyle = '#ff3a3a';
          ctx.arc(0, 0, ringRadius, a0, a1);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.globalAlpha = 0.06;
          ctx.lineWidth = ringHeight + 12;
          ctx.strokeStyle = '#00ffe0';
          ctx.arc(0, 0, ringRadius, a0, a1);
          ctx.stroke();
        }
      });
      ctx.restore();
    }
  }

  function drawBall() {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'white';
    const dx = ball.x;
    const dy = ball.y;
    ctx.shadowColor = 'rgba(0,200,255,0.28)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'radial-gradient(white, #e6f9ff)'; // not supported by fillStyle, but keep fallback
    // draw circle with glow
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(dx, dy, ball.radius, 0, TAU);
    ctx.fill();
    // glow ring
    ctx.beginPath();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#7ef9ff';
    ctx.arc(dx, dy, ball.radius + 14, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // collision detection - check the ring segment that aligns with ball
  function checkCollisions() {
    // compute ring index ball is overlapping with
    // based on vertical offset from center
    // ball Y relative to center
    const relY = ball.y - center.y + scrollOffset;
    const ringSlot = Math.floor((relY + (ringHeight + gapBetweenRings) * 3) / (ringHeight + gapBetweenRings));
    const ringIndex = Math.floor((scrollOffset / (ringHeight + gapBetweenRings))) + ringSlot;
    const ring = rings[ringIndex];
    if (!ring) return;
    // compute angle of ball relative to center and current rotation
    const angle = Math.atan2(ball.y - center.y, ball.x - center.x) - rotation;
    const normalizedAngle = (angle % TAU + TAU) % TAU;

    // find segment containing this angle
    for (const seg of ring.segments) {
      // normalize seg angles
      const s = (seg.start % TAU + TAU) % TAU;
      const e = (seg.end % TAU + TAU) % TAU;
      let inside = false;
      if (s < e) inside = normalizedAngle >= s && normalizedAngle <= e;
      else inside = normalizedAngle >= s || normalizedAngle <= e;
      if (inside) {
        if (!seg.safe) {
          // Danger -> Game over
          onHitDanger(ringIndex);
        } else {
          // safe -> if moving downward fast enough and crossing gap, award score
          // We check if ball is between top edge and center of ring slot (approx)
          const slotTop = center.y + (ringSlot - 3) * (ringHeight + gapBetweenRings) - (scrollOffset % (ringHeight + gapBetweenRings));
          const slotBottom = slotTop + ringHeight;
          // ball passes through gap when its y crosses center of ring slot while moving down
          if (ball.vy > 6 && ball.y > slotTop + 2 && ball.y < slotBottom + 12) {
            // award
            score += 1;
            scoreEl.textContent = score;
            playScore();
            // small bounce
            ball.vy = -8;
            playBounce();
          }
        }
        break;
      }
    }
  }

  function onHitDanger(ringIndex) {
    // show message and stop game
    if (!running) return;
    running = false;
    centerMessage.hidden = false;
    centerMessage.textContent = '💥 You hit a danger! Game Over';
    pauseResumeBtn.textContent = 'Paused';
    saveHighscore();
    playDanger();
    // small shake: trigger a quick animation by offsetting canvas (simple)
    // nothing more - game loop will stop
  }

  function saveHighscore() {
    if (score > best) {
      best = score;
      localStorage.setItem('helix_best', best);
      bestEl.textContent = best;
    }
  }

  // physics and update
  function update(dt) {
    // if paused or not running, skip updates
    if (!running || paused) return;

    // input rotation interpolation
    const inputRot = (keyLeft ? -1 : 0) + (keyRight ? 1 : 0);
    // rotate target based on keys or pointer
    rotationTarget += inputRot * 0.03 * dt;

    // interpolate rotation towards target
    rotation += (rotationTarget - rotation) * 0.12;

    // gravity
    ball.vy += 0.45 * dt * 0.06 * 60; // normalize across dt
    ball.y += ball.vy * (dt / 16.666);

    // simulate downward scroll as ball descends below center
    if (ball.y > center.y + 40) {
      const delta = ball.y - (center.y + 40);
      scrollOffset += delta;
      ball.y -= delta;
      // generate new rings as scroll increases
      while (rings.length < Math.floor(scrollOffset / (ringHeight + gapBetweenRings)) + ringsVisible + 20) {
        rings.push(generateRing(rings.length));
      }
    }

    // keep ball within horizontal radius (ball moves with rotated tower)
    const ballToCenter = Math.hypot(ball.x - center.x, ball.y - center.y);
    if (ballToCenter > RADIUS * 0.9 + 20) {
      // make it slide around edge slightly
      const ang = Math.atan2(ball.y - center.y, ball.x - center.x) - rotation;
      ball.x = center.x + Math.cos(ang + rotation) * (RADIUS * 0.9);
    }

    // check for collision with rings - only when ball is near ring radius horizontally
    checkCollisions();

    // slowly increase difficulty by causing a tiny auto-rotation
    difficultyTimer += dt;
    if (difficultyTimer > 8000) {
      rotationTarget += 0.002 * Math.sign(Math.sin(Date.now() / 1000));
      difficultyTimer = 0;
    }
  }

  // draw everything
  function render() {
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawTower();
    drawBall();
  }

  // main loop
  function loop(t) {
    const dt = lastTime ? Math.min(40, t - lastTime) : 16;
    lastTime = t;
    if (running && !paused) {
      update(dt);
      render();
    } else {
      render(); // still render to show state
    }
    requestAnimationFrame(loop);
  }

  // Input handlers
  function setupInput() {
    // keyboard
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { keyLeft = true; }
      if (e.key === 'ArrowRight') { keyRight = true; }
      if (e.key === ' ' || e.key === 'Spacebar') { // space to jump small
        if (!running) startGame();
        else { ball.vy = -12; playBounce(); }
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft') { keyLeft = false; }
      if (e.key === 'ArrowRight') { keyRight = false; }
    });

    // pointer rotate (drag)
    canvas.addEventListener('pointerdown', (e) => {
      pointerDown = true;
      lastPointerX = e.clientX;
    });
    window.addEventListener('pointermove', (e) => {
      if (!pointerDown) return;
      const dx = e.clientX - lastPointerX;
      rotationTarget += dx * 0.006;
      lastPointerX = e.clientX;
    });
    window.addEventListener('pointerup', () => { pointerDown = false; });

    // touch: also allow tap to force small bounce
    canvas.addEventListener('click', () => {
      if (!running) startGame();
      else {
        ball.vy = -10;
        playBounce();
      }
    });

    // buttons
    pauseResumeBtn.addEventListener('click', () => {
      if (!running) return;
      paused = !paused;
      pauseResumeBtn.textContent = paused ? 'Resume' : 'Pause';
    });
    restartBtn.addEventListener('click', () => {
      restartGame();
    });
    playBtn.addEventListener('click', () => {
      startGame();
    });
    resumeBtn.addEventListener('click', () => {
      paused = false;
      resumeBtn.hidden = true;
      pauseResumeBtn.textContent = 'Pause';
    });
    muteBtn.addEventListener('click', () => {
      muted = !muted;
      muteBtn.textContent = muted ? '🔇' : '🔊';
    });
  }

  // game lifecycle
  function resetState() {
    rotation = 0; rotationTarget = 0; rotationVelocity = 0;
    ball.x = center.x; ball.y = 170; ball.vy = 0;
    score = 0; scoreEl.textContent = '0';
    centerMessage.hidden = true;
    running = false; paused = false;
    difficultyTimer = 0;
  }

  function startGame() {
    if (!audioCtx) try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
    if (!running) {
      running = true;
      paused = false;
      playStart();
      centerMessage.hidden = true;
      pauseResumeBtn.textContent = 'Pause';
      playBtn.hidden = true;
      resumeBtn.hidden = true;
    }
  }

  function restartGame() {
    resetState();
    buildInitialRings();
    running = true;
    playStart();
    pauseResumeBtn.textContent = 'Pause';
    playBtn.hidden = true;
    resumeBtn.hidden = true;
  }

  // On danger hit -> stop & allow restart
  function endGameOver() {
    running = false;
    centerMessage.hidden = false;
    centerMessage.textContent = 'Game Over — Click Restart';
    playTone(120,0.2,'sawtooth');
  }

  // small wrapper for dangerous hit to stop after short delay
  function onHitDanger(rIndex) {
    // prevent repeated triggers
    if (!running) return;
    running = false;
    centerMessage.hidden = false;
    centerMessage.textContent = '💥 Game Over';
    pauseResumeBtn.textContent = 'Paused';
    saveHighscore();
    playDanger();
    // show restart button
    playBtn.hidden = false;
    resumeBtn.hidden = true;
  }

  // start initial
  resetState();
  buildInitialRings();
  setupInput();
  requestAnimationFrame(loop);

  // expose for debugging
  window.helix = {
    restartGame, startGame, getState: () => ({running, paused, score})
  };

  // small helpers: initial score display
  scoreEl.textContent = '0';
  bestEl.textContent = best;

})();
