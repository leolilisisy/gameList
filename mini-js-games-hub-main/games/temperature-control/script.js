/* Temperature Control Game
   - drop into games/temperature-control/
   - uses online images & sounds (no downloads)
*/

(() => {
  // Elements
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const difficulty = document.getElementById('difficulty');

  const heatSlider = document.getElementById('heatSlider');
  const coolSlider = document.getElementById('coolSlider');
  const centerSlider = document.getElementById('centerSlider');
  const tolSlider = document.getElementById('tolSlider');

  const heatVal = document.getElementById('heatVal');
  const coolVal = document.getElementById('coolVal');
  const centerVal = document.getElementById('centerVal');
  const tolVal = document.getElementById('tolVal');

  const currentTempEl = document.getElementById('currentTemp');
  const targetRangeEl = document.getElementById('targetRange');
  const timeRunningEl = document.getElementById('timeRunning');
  const insideMsEl = document.getElementById('insideMs');
  const distCountEl = document.getElementById('distCount');
  const stateEl = document.getElementById('state');
  const bulb = document.getElementById('bulb');

  const winSfx = document.getElementById('sfxWin');
  const loseSfx = document.getElementById('sfxLose');
  const distSfx = document.getElementById('sfxDisturb');
  const soundToggle = document.getElementById('soundToggle');

  // Canvas chart
  const canvas = document.getElementById('tempChart');
  const ctx = canvas.getContext('2d');

  // Play button just brings focus/tracking (keeps compatibility with hub)
  document.getElementById('playNow').addEventListener('click', (e) => {
    e.preventDefault();
    startBtn.click();
  });

  // Game state
  let running = false;
  let paused = false;
  let lastTs = null;
  let elapsed = 0;
  let insideMs = 0;
  let distCount = 0;
  let interval = null;
  let updateRate = 60; // updates per second
  let history = [];

  // Simulation variables
  let temp = 22 + Math.random() * 2 - 1; // start near center
  let targetCenter = parseFloat(centerSlider.value);
  let tolerance = parseFloat(tolSlider.value);
  let safetyLimit = 20; // absolute allowed delta before immediate fail
  let winDuration = 30000; // keep in range for 30s
  let loseOutsideLimit = 10000; // ms outside allowed range before loss
  let outsideTimer = 0;

  // Difficulty affects disturbance frequency & magnitude
  function difficultyParams(level) {
    if (level === 'easy') return { freq: 12000, mag: 0.8, win: 20000 };
    if (level === 'normal') return { freq: 9000, mag: 1.6, win: 30000 };
    return { freq: 6000, mag: 2.6, win: 40000 };
  }

  // update UI slider labels
  function updateSliderLabels() {
    heatVal.textContent = `${heatSlider.value}%`;
    coolVal.textContent = `${coolSlider.value}%`;
    centerVal.textContent = `${centerSlider.value}°C`;
    tolVal.textContent = `±${tolSlider.value}°C`;
    targetRangeEl.textContent = `${centerSlider.value - tolSlider.value}–${parseInt(centerSlider.value) + parseInt(tolSlider.value)}°C`;
    document.getElementById('winDuration').textContent = (difficultyParams(difficulty.value).win / 1000) + 's';
  }

  [heatSlider, coolSlider, centerSlider, tolSlider, difficulty].forEach(el => {
    el.addEventListener('input', () => {
      updateSliderLabels();
      targetCenter = parseFloat(centerSlider.value);
      tolerance = parseFloat(tolSlider.value);
      // adjust win duration from difficulty
      winDuration = difficultyParams(difficulty.value).win;
    });
  });

  updateSliderLabels();

  // Sound helper
  function playSound(audioEl) {
    if (!soundToggle.checked) return;
    try {
      audioEl.currentTime = 0;
      audioEl.play();
    } catch(e){}
  }

  // Disturbance generator
  function spawnDisturbance() {
    const d = difficultyParams(difficulty.value);
    const magnitude = (Math.random() * d.mag * 2 - d.mag) * (Math.random() < 0.5 ? -1 : 1);
    // immediate temp impulse
    temp += magnitude;
    distCount += 1;
    distCountEl.textContent = distCount;
    playSound(distSfx);
    // small visual flash
    bulb.classList.add('glow');
    setTimeout(() => bulb.classList.remove('glow'), 900);
  }

  // schedule disturbances
  let disturbTimer = null;
  function scheduleDisturbances() {
    if (disturbTimer) clearInterval(disturbTimer);
    const d = difficultyParams(difficulty.value);
    disturbTimer = setInterval(() => {
      if (running && !paused) spawnDisturbance();
    }, d.freq + Math.random() * d.freq);
  }

  // Chart drawing
  function drawChart() {
    const w = canvas.width = canvas.clientWidth * devicePixelRatio;
    const h = canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.clearRect(0,0,w,h);

    // background grid
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(0,0,cw,ch);

    // draw axes lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for(let i=0;i<5;i++){
      ctx.beginPath();
      ctx.moveTo(0, (i+1)*ch/6);
      ctx.lineTo(cw, (i+1)*ch/6);
      ctx.stroke();
    }

    // target band
    const minT = targetCenter - tolerance;
    const maxT = targetCenter + tolerance;
    // map temp to vertical pixel (higher temp -> lower y)
    const temps = history.length ? history.map(h=>h.t) : [targetCenter];
    const allTemps = temps.concat([minT, maxT]);
    const min = Math.min(...allTemps) - 5;
    const max = Math.max(...allTemps) + 5;

    function yOf(t){
      return ch - ((t - min) / (max - min)) * ch;
    }

    ctx.fillStyle = 'rgba(126,224,255,0.06)';
    ctx.fillRect(0, yOf(maxT), cw, yOf(minT) - yOf(maxT));

    // draw temp polyline
    if(history.length){
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffb86b';
      history.forEach((pt, i) => {
        const x = (i / Math.max(1, history.length - 1)) * cw;
        const y = yOf(pt.t);
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.stroke();

      // area fill
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#ffb86b';
      ctx.lineTo(cw, ch);
      ctx.lineTo(0, ch);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // draw center line
    ctx.beginPath();
    ctx.setLineDash([6,6]);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.moveTo(0, yOf(targetCenter));
    ctx.lineTo(cw, yOf(targetCenter));
    ctx.stroke();
    ctx.setLineDash([]);

    // labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '12px Inter, Arial';
    ctx.fillText(`${max.toFixed(1)}°C`, 6, 12);
    ctx.fillText(`${min.toFixed(1)}°C`, 6, ch - 6);

    ctx.restore();
  }

  // Simulation step
  function step(dt) {
    // heating and cooling produce change rates per second
    const heatPower = parseFloat(heatSlider.value) / 100;   // 0..1
    const coolPower = parseFloat(coolSlider.value) / 100;   // 0..1

    // convert to degrees per second rates
    // heating effect stronger than cooling slightly
    const heatRate = heatPower * 6.0;   // max +6 °C/s
    const coolRate = coolPower * 6.4;   // max -6.4 °C/s

    // passive ambient drift toward ambient (20°C)
    const ambient = 20;
    const drift = (ambient - temp) * 0.02; // small stabilizing effect

    // net change = heat - cool + drift
    temp += (heatRate - coolRate) * (dt / 1000) + drift * (dt / 1000);

    // small natural inertia (smoothing)
    temp += (Math.random() - 0.5) * 0.02 * (dt / 1000);

    // clamp for numeric safety
    if (temp < -100) temp = -100;
    if (temp > 200) temp = 200;

    // record history
    history.push({ t: temp, ts: Date.now() });
    if (history.length > 400) history.shift();

    // UI updates
    currentTempEl.textContent = `${temp.toFixed(1)}°C`;

    // bulb glow intensity mapping
    const center = targetCenter;
    const delta = temp - center;
    const intensity = Math.min(1, Math.abs(delta) / (tolerance + 4));
    if (delta > 0.2) {
      bulb.classList.add('glow');
      bulb.style.boxShadow = `0 12px 40px rgba(255,130,0,${0.15 + intensity*0.3})`;
    } else {
      bulb.classList.remove('glow');
      bulb.style.boxShadow = '';
    }

    // inside range?
    const inRange = (temp >= targetCenter - tolerance) && (temp <= targetCenter + tolerance);
    if (inRange) {
      insideMs += dt;
      insideMsEl.textContent = `${Math.round(insideMs)} ms`;
      outsideTimer = 0;
    } else {
      outsideTimer += dt;
    }

    // win/lose conditions
    if (insideMs >= winDuration) {
      endGame(true, 'You maintained stability — WIN!');
    } else if (Math.abs(temp - targetCenter) >= safetyLimit) {
      endGame(false, 'Safety limit exceeded — SYSTEM FAILURE!');
    } else if (outsideTimer >= loseOutsideLimit) {
      endGame(false, 'Temperature was outside range for too long — LOSE');
    }

    // draw chart occasionally (not every frame for perf)
    if (Math.random() < 0.25) drawChart();
  }

  // Game loop
  function loop(ts) {
    if (!running || paused) {
      lastTs = ts;
      return;
    }
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;
    elapsed += dt;
    // step simulation at updateRate times per second (approx)
    step(dt);

    // update time display
    timeRunningEl.textContent = formatMs(elapsed);

    // schedule next frame
    requestAnimationFrame(loop);
  }

  function formatMs(ms) {
    const s = Math.floor(ms / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2,'0');
    const ss = String(s % 60).padStart(2,'0');
    return `${mm}:${ss}`;
  }

  // Start / Pause / Restart handlers
  function startGame() {
    if (running) return;
    running = true;
    paused = false;
    lastTs = null;
    elapsed = 0;
    insideMs = 0;
    outsideTimer = 0;
    distCount = 0;
    history = [];
    temp = parseFloat(centerSlider.value) + (Math.random() - 0.5) * 2;
    distCountEl.textContent = distCount;
    insideMsEl.textContent = `${insideMs} ms`;
    timeRunningEl.textContent = '00:00';
    stateEl.textContent = 'Running';
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    restartBtn.disabled = false;
    scheduleDisturbances();
    requestAnimationFrame(loop);
  }

  function pauseGame() {
    paused = !paused;
    stateEl.textContent = paused ? 'Paused' : 'Running';
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    if (!paused) requestAnimationFrame(loop);
  }

  function restartGame() {
    running = false;
    paused = false;
    lastTs = null;
    elapsed = 0;
    insideMs = 0;
    distCount = 0;
    history = [];
    temp = parseFloat(centerSlider.value);
    timeRunningEl.textContent = '00:00';
    insideMsEl.textContent = '0 ms';
    distCountEl.textContent = '0';
    currentTempEl.textContent = `${temp.toFixed(1)}°C`;
    stateEl.textContent = 'Idle';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    restartBtn.disabled = true;
    clearInterval(disturbTimer);
    drawChart();
  }

  // End game
  function endGame(won, message) {
    running = false;
    stateEl.textContent = won ? 'Victory' : 'Defeat';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    restartBtn.disabled = false;
    clearInterval(disturbTimer);

    // sound + alert box
    if (won) playSound(winSfx);
    else playSound(loseSfx);

    // visual summary modal (simple)
    setTimeout(() => {
      alert(message + '\nTime: ' + formatMs(elapsed) + '\nDisturbances: ' + distCount);
    }, 150);
  }

  // bind
  startBtn.addEventListener('click', startGame);
  pauseBtn.addEventListener('click', pauseGame);
  restartBtn.addEventListener('click', restartGame);

  // optional quick keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') { e.preventDefault(); if (!running) startGame(); else pauseGame(); }
    if (e.key === 'r') restartGame();
  });

  // initialize chart
  drawChart();

  // initial UI sync
  updateSliderLabels();
  scheduleDisturbances();

  // every second update glow intensity and labels
  setInterval(() => {
    // tiny aesthetic pulse when temp high
    const dt = 1000;
    // also update chart more often
    drawChart();
  }, 1000);

  // expose a minimal API for hub tracking if needed
  window.TemperatureControlGame = {
    start: startGame,
    pause: pauseGame,
    restart: restartGame
  };
})();
