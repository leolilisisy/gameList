// 8-Ball Pool — Canvas implementation (local 2-player)
// Put this file at: games/8-ball-pool/script.js

(() => {
  /*** Constants & Utilities ***/
  const canvas = document.getElementById('table');
  const ctx = canvas.getContext('2d', { alpha: false });
  const W = canvas.width, H = canvas.height;

  // Table layout
  const RAIL = 30; // margin around
  const POCKET_RADIUS = 22;
  const BALL_RADIUS = 12;
  const FRICTION = 0.994; // per frame multiplier
  const MIN_SPEED = 0.02; // below this, ball stops
  const MAX_POWER = 22; // max velocity applied to cue ball

  // Pocket centers (6 pockets)
  const pockets = [
    { x: RAIL + POCKET_RADIUS, y: RAIL + POCKET_RADIUS },
    { x: W / 2, y: RAIL + POCKET_RADIUS },
    { x: W - RAIL - POCKET_RADIUS, y: RAIL + POCKET_RADIUS },
    { x: RAIL + POCKET_RADIUS, y: H - RAIL - POCKET_RADIUS },
    { x: W / 2, y: H - RAIL - POCKET_RADIUS },
    { x: W - RAIL - POCKET_RADIUS, y: H - RAIL - POCKET_RADIUS },
  ];

  // Game state
  let balls = []; // ball objects
  let cueBall; // reference to ball with id 0
  let animationId;
  let isAiming = false;
  let aimStart = null;
  let aimCurrent = null;
  let currentPlayer = 1; // 1 or 2
  let playerData = {
    1: { type: null, score: 0 },
    2: { type: null, score: 0 }
  };
  let isBallsMoving = false;
  let messageEl = document.getElementById('message');
  let powerFill = document.getElementById('powerFill');
  const turnText = document.getElementById('turnText');
  const p1El = document.getElementById('player1');
  const p2El = document.getElementById('player2');

  // ball color scheme: 0 cue (white), 1-7 solids, 8 eight, 9-15 stripes
  const ballColors = {
    0: '#ffffff',
    1: '#d32f2f', 2: '#e53935', 3: '#ff6f00', 4: '#fbc02d', 5: '#7cb342', 6: '#039be5', 7: '#6a1b9a',
    8: '#000000',
    9: '#d32f2f', 10: '#e53935', 11: '#ff6f00', 12: '#fbc02d', 13: '#7cb342', 14: '#039be5', 15: '#6a1b9a'
  };

  // initial rack positions: we'll position balls in triangular rack on right-side table
  function initBalls() {
    balls = [];
    // cue ball
    cueBall = {
      id: 0,
      x: W * 0.25,
      y: H / 2,
      vx: 0,
      vy: 0,
      r: BALL_RADIUS,
      potted: false,
      color: ballColors[0],
      number: 0,
      stripe: false
    };
    balls.push(cueBall);

    // rack origin
    const rackX = W * 0.68;
    const rackY = H / 2;
    // order for a balanced rack (standard pyramid)
    const order = [1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15, 8];
    let idx = 0;
    const spacing = BALL_RADIUS * 2 + 1;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= row; col++) {
        const x = rackX + row * (spacing * Math.cos(Math.PI / 6));
        const y = rackY + (col - row / 2) * spacing;
        const num = order[idx++];
        balls.push({
          id: num,
          x, y,
          vx: 0, vy: 0,
          r: BALL_RADIUS,
          potted: false,
          color: ballColors[num],
          number: num,
          stripe: num >= 9
        });
      }
    }

    // reset players assignment
    playerData[1].type = null;
    playerData[2].type = null;
    playerData[1].score = 0;
    playerData[2].score = 0;
    currentPlayer = 1;
    updateUI();
  }

  /*** Draw functions ***/
  function drawTable() {
    // felt
    ctx.fillStyle = '#0b6b3a';
    ctx.fillRect(0, 0, W, H);

    // inner rail (felt border)
    ctx.fillStyle = '#104a2a';
    ctx.fillRect(RAIL, RAIL, W - 2 * RAIL, H - 2 * RAIL);

    // draw pockets
    pockets.forEach(p => {
      const gradient = ctx.createRadialGradient(p.x - 6, p.y - 6, 4, p.x, p.y, POCKET_RADIUS);
      gradient.addColorStop(0, 'rgba(0,0,0,0.6)');
      gradient.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });

    // draw rails (beyond felt)
    ctx.fillStyle = '#523426';
    // top
    ctx.fillRect(0, 0, W, RAIL);
    ctx.fillRect(0, H - RAIL, W, RAIL);
    ctx.fillRect(0, 0, RAIL, H);
    ctx.fillRect(W - RAIL, 0, RAIL, H);
  }

  function drawBalls() {
    balls.forEach(b => {
      if (b.potted) return;
      // ball shadow
      ctx.beginPath();
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.ellipse(b.x + 4, b.y + 8, b.r * 1.1, b.r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // ball main
      ctx.beginPath();
      ctx.fillStyle = b.color;
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();

      // draw number/stripe for numbered balls
      if (b.number !== 0) {
        // stripe rendering for stripes
        if (b.stripe) {
          ctx.beginPath();
          ctx.fillStyle = '#fff';
          ctx.rect(b.x - b.r, b.y - 6, b.r * 2, 12);
          ctx.fill();
          // circle inside
          ctx.beginPath();
          ctx.fillStyle = b.color;
          ctx.arc(b.x, b.y, b.r / 1.8, 0, Math.PI * 2);
          ctx.fill();
        } else if (b.number !== 8) {
          // solid: draw white circle with number
          ctx.beginPath();
          ctx.fillStyle = '#fff';
          ctx.arc(b.x, b.y, b.r / 2.1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 8-ball: white ring
          ctx.beginPath();
          ctx.fillStyle = '#fff';
          ctx.arc(b.x, b.y, b.r / 2.1, 0, Math.PI * 2);
          ctx.fill();
        }

        // draw number
        ctx.fillStyle = '#000';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.number.toString(), b.x, b.y);
      }
      // cue ball has subtle stroke
      if (b.number === 0) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  /*** Physics ***/
  function stepPhysics() {
    // move balls
    isBallsMoving = false;
    for (let b of balls) {
      if (b.potted) continue;
      b.x += b.vx;
      b.y += b.vy;
      // friction
      b.vx *= FRICTION;
      b.vy *= FRICTION;
      if (Math.hypot(b.vx, b.vy) < MIN_SPEED) {
        b.vx = 0; b.vy = 0;
      } else {
        isBallsMoving = true;
      }
      // rail collisions (simple reflection)
      if (b.x - b.r < RAIL + 6) { b.x = RAIL + 6 + b.r; b.vx = -b.vx * 0.98; }
      if (b.x + b.r > W - RAIL - 6) { b.x = W - RAIL - 6 - b.r; b.vx = -b.vx * 0.98; }
      if (b.y - b.r < RAIL + 6) { b.y = RAIL + 6 + b.r; b.vy = -b.vy * 0.98; }
      if (b.y + b.r > H - RAIL - 6) { b.y = H - RAIL - 6 - b.r; b.vy = -b.vy * 0.98; }

      // pocket detection
      for (let p of pockets) {
        const d = Math.hypot(b.x - p.x, b.y - p.y);
        if (d < POCKET_RADIUS - 6) {
          // potted
          b.potted = true;
          b.vx = b.vy = 0;
          onBallPotted(b);
        }
      }
    }

    // collisions ball-ball
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i], b = balls[j];
        if (a.potted || b.potted) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < a.r + b.r) {
          // resolve overlap
          const overlap = a.r + b.r - dist;
          const nx = dx / dist, ny = dy / dist;
          a.x -= nx * overlap / 2;
          a.y -= ny * overlap / 2;
          b.x += nx * overlap / 2;
          b.y += ny * overlap / 2;

          // compute relative velocity in normal direction
          const dvx = b.vx - a.vx, dvy = b.vy - a.vy;
          const rel = dvx * nx + dvy * ny;
          if (rel > 0) continue; // moving away
          // simple elastic collision (equal mass)
          const impulse = (2 * rel) / 2;
          a.vx += impulse * nx;
          a.vy += impulse * ny;
          b.vx -= impulse * nx;
          b.vy -= impulse * ny;

          // small damping to avoid perpetual motion
          a.vx *= 0.999;
          a.vy *= 0.999;
          b.vx *= 0.999;
          b.vy *= 0.999;
        }
      }
    }
  }

  /*** Game logic (potted handling & turns) ***/
  function onBallPotted(ball) {
    // handle cue ball foul: respawn cue ball near original spot (simple)
    if (ball.number === 0) {
      // cue ball potted => foul, respawn after brief delay
      setTimeout(() => {
        ball.potted = false;
        ball.x = W * 0.25;
        ball.y = H / 2 + 20;
        ball.vx = ball.vy = 0;
        // award turn to other player (foul)
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        showMessage('Cue ball potted — foul. Turn to Player ' + currentPlayer);
        updateUI();
      }, 700);
      return;
    }

    // update score & decide assignment
    const num = ball.number;
    const isStripe = ball.stripe;
    // if neither player assigned types yet, first potted (non-8) decides
    if (!playerData[1].type && !playerData[2].type && num !== 8) {
      playerData[currentPlayer].type = isStripe ? 'stripes' : 'solids';
      const other = currentPlayer === 1 ? 2 : 1;
      playerData[other].type = isStripe ? 'solids' : 'stripes';
      showMessage(`Player ${currentPlayer} is ${playerData[currentPlayer].type}`);
    }

    // award point if ball matches current player's type
    if (playerData[currentPlayer].type && ((playerData[currentPlayer].type === 'stripes') === isStripe)) {
      playerData[currentPlayer].score += 1;
      showMessage(`Player ${currentPlayer} pocketed their ball!`);
    } else {
      // pocketed other player's ball => no point but stays potted
      showMessage(`Player ${currentPlayer} pocketed opponent's ball! Turn switches.`);
      currentPlayer = currentPlayer === 1 ? 2 : 1;
    }

    // if 8-ball potted: check victory
    if (num === 8) {
      // player must have cleared their assigned balls (simple check: other balls of their suit remaining?)
      const remaining = balls.filter(b => !b.potted && b.number !== 0 && b.number !== 8 && ((b.stripe && playerData[currentPlayer].type === 'stripes') || (!b.stripe && playerData[currentPlayer].type === 'solids')));
      if (remaining.length === 0) {
        showMessage(`Player ${currentPlayer} sank the 8-ball and wins!`);
        endGame(currentPlayer);
      } else {
        showMessage(`8-ball sunk prematurely — Player ${currentPlayer} loses!`);
        endGame(currentPlayer === 1 ? 2 : 1); // other player wins
      }
      return;
    }

    updateUI();
  }

  function endGame(winner) {
    showMessage(`Player ${winner} wins! 🎉`);
    // stop game - clear velocities
    balls.forEach(b => { b.vx = b.vy = 0; });
    cancelAnimationFrame(animationId);
  }

  /*** Input: aiming with mouse / touch ***/
  function canvasPoint(evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    return { x: (clientX - rect.left) * (canvas.width / rect.width), y: (clientY - rect.top) * (canvas.height / rect.height) };
  }

  canvas.addEventListener('mousedown', (e) => { if (!isBallsMoving) startAiming(e); });
  canvas.addEventListener('touchstart', (e) => { if (!isBallsMoving) startAiming(e); }, { passive: true });

  window.addEventListener('mousemove', (e) => { if (isAiming) aimCurrent = canvasPoint(e); });
  window.addEventListener('touchmove', (e) => { if (isAiming) aimCurrent = canvasPoint(e); }, { passive: true });

  window.addEventListener('mouseup', (e) => { if (isAiming) releaseShot(e); });
  window.addEventListener('touchend', (e) => { if (isAiming) releaseShot(e); });

  function startAiming(e) {
    // only allow aiming if balls are still
    if (isBallsMoving) return;
    isAiming = true;
    aimStart = canvasPoint(e);
    aimCurrent = aimStart;
    showMessage('Aiming... drag to set power and direction');
    updatePowerVisual();
  }

  function releaseShot(e) {
    isAiming = false;
    const p = aimCurrent || aimStart;
    const dx = cueBall.x - p.x;
    const dy = cueBall.y - p.y;
    const dist = Math.hypot(dx, dy);
    const power = Math.min(dist / 8, MAX_POWER);
    if (power < 0.5) {
      showMessage('Shot cancelled (too small)');
      powerFill.style.width = '0%';
      return;
    }
    // impart velocity to cue ball
    cueBall.vx = (dx / dist) * power;
    cueBall.vy = (dy / dist) * power;

    isBallsMoving = true;
    showMessage(`Player ${currentPlayer} shot (power ${power.toFixed(1)})`);
    powerFill.style.width = '0%';
    // track that after balls stop, turn may change based on potted logic; we'll switch if no ball of player's type potted in the shot
    lastShotHadPocket = false;
    lastShotCurrentPlayer = currentPlayer;
  }

  function updatePowerVisual() {
    if (!isAiming || !aimStart || !aimCurrent) { powerFill.style.width = '0%'; return; }
    const dx = aimStart.x - aimCurrent.x;
    const dy = aimStart.y - aimCurrent.y;
    const dist = Math.hypot(dx, dy);
    const fraction = Math.min(1, dist / (MAX_POWER * 8));
    powerFill.style.width = (fraction * 100) + '%';
  }

  // small state to manage turn switching after shots
  let lastShotHadPocket = false;
  let lastShotCurrentPlayer = null;

  /*** UI updates ***/
  function updateUI() {
    turnText.textContent = `Player ${currentPlayer}`;
    p1El.classList.toggle('active', currentPlayer === 1);
    p2El.classList.toggle('active', currentPlayer === 2);
    document.querySelector('#player1 .ptype').textContent = playerData[1].type ? playerData[1].type : '—';
    document.querySelector('#player2 .ptype').textContent = playerData[2].type ? playerData[2].type : '—';
    document.querySelector('#player1 .score').textContent = playerData[1].score;
    document.querySelector('#player2 .score').textContent = playerData[2].score;
  }

  function showMessage(txt) {
    messageEl.textContent = txt;
  }

  /*** Hint: show aim line briefly ***/
  document.getElementById('hintBtn').addEventListener('click', () => {
    showMessage('Hint: Click & drag behind the cue ball to set direction and power.');
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    initBalls();
    if (!animationId) loop();
    showMessage('New rack — Player 1 break');
  });

  /*** Game loop ***/
  function render() {
    drawTable();
    // draw guide when aiming
    if (isAiming && aimCurrent) {
      // draw cue ball highlight and aim line
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.moveTo(cueBall.x, cueBall.y);
      ctx.lineTo(aimCurrent.x, aimCurrent.y);
      ctx.stroke();

      // draw power indicator circle at aimCurrent
      const dx = cueBall.x - aimCurrent.x;
      const dy = cueBall.y - aimCurrent.y;
      const dist = Math.hypot(dx, dy);
      const p = Math.min(1, dist / (MAX_POWER * 8));
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,213,79,0.18)';
      ctx.arc(cueBall.x - dx / 2, cueBall.y - dy / 2, 10 + p * 18, 0, Math.PI * 2);
      ctx.fill();
      updatePowerVisual();
    }

    drawBalls();
  }

  function loop() {
    animationId = requestAnimationFrame(loop);
    stepPhysics();
    render();

    // after shot has finished, evaluate turn switching
    if (!isBallsMoving && lastShotCurrentPlayer !== null) {
      // determine whether any ball of the player's type was potted during last shot:
      // (we track by checking current scores vs previous snapshot; simpler: rely on lastShotHadPocket toggled in onBallPotted)
      // For simplicity here: if last shot had no pocket, switch turn
      if (!lastShotHadPocket) {
        currentPlayer = lastShotCurrentPlayer === 1 ? 2 : 1;
        showMessage(`No pocket — Turn to Player ${currentPlayer}`);
      } else {
        showMessage(`Player ${lastShotCurrentPlayer} continues (pocket made)`);
      }
      lastShotCurrentPlayer = null;
      updateUI();
    }
    // reset lastShotHadPocket for next shot
    lastShotHadPocket = false;
  }

  // To set lastShotHadPocket true when any ball potted during a shot, modify onBallPotted:
  // But since onBallPotted is called immediately on potted detection while balls are moving, set flag:
  const original_onBallPotted = onBallPotted;
  onBallPotted = function(ball) {
    lastShotHadPocket = true;
    original_onBallPotted(ball);
    updateUI();
  };

  // Initialize & run
  initBalls();
  loop();

  // expose some debug helpers (optional)
  window.__pool = {
    balls, initBalls, cueBall
  };

})();
