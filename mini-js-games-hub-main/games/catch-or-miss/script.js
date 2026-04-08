/* Catch or Miss — advanced version
   - Single + Two-player modes
   - Pause / Start / Restart / Mute
   - Obstacles + decoys
   - WebAudio sound synthesis (no downloads)
   - Works offline in browser
*/

(() => {
  // ---------- Utilities ----------
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // DOM
  const arena = $('#arena');
  const startBtn = $('#start-btn');
  const pauseBtn = $('#pause-btn');
  const restartBtn = $('#restart-btn');
  const muteToggle = $('#mute-toggle');
  const scoreEl = $('#score');
  const comboEl = $('#combo');
  const livesEl = $('#lives');
  const roundEl = $('#round');
  const highscoreEl = $('#highscore');
  const hint = $('#hint');
  const modeSelect = $('#mode-select');
  const difficultySelect = $('#difficulty-select');

  // Game state
  let running = false;
  let paused = false;
  let timerIds = new Set();
  let prompts = new Map(); // id -> element
  let score = 0;
  let combo = 0;
  let lives = 3;
  let round = 0;
  let highscore = Number(localStorage.getItem('catch-miss-highscore') || 0);
  let spawnInterval = 1200; // ms default
  let promptLifetime = 2500; // ms default
  let difficulty = 'normal';
  let mode = 'single';
  let promptIdCounter = 1;
  let muted = false;

  highscoreEl.textContent = highscore;

  // WebAudio simple sound generator (short blips)
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function playTone(freq = 440, type = 'sine', duration = 0.08, gain = 0.12) {
    if (muted) return;
    try {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = gain;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      g.gain.setValueAtTime(gain, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      o.stop(audioCtx.currentTime + duration + 0.02);
    } catch (e) {
      // ignore
    }
  }

  function playSuccess() { playTone(880, 'sine', 0.08, 0.14); }
  function playMiss()    { playTone(200, 'square', 0.18, 0.12); }
  function playDecoy()   { playTone(120, 'triangle', 0.12, 0.08); }
  function playCombo()   { playTone(1200, 'sine', 0.06, 0.16); }

  // images for prompts (online)
  const imgSources = [
    'https://picsum.photos/seed/game1/80/80',
    'https://picsum.photos/seed/game2/80/80',
    'https://picsum.photos/seed/game3/80/80',
    'https://picsum.photos/seed/game4/80/80',
    'https://picsum.photos/seed/game5/80/80',
  ];

  // prompt types and weights
  const PROMPT_TYPES = [
    { type:'target', weight: 0.6, score: 10, emoji: '✅' },
    { type:'decoy',  weight: 0.25, score: -8, emoji: '❌' },
    { type:'obstacle', weight: 0.15, score: -15, emoji: '⚠️' },
  ];

  // spawn configuration by difficulty
  const DIFFICULTY_CONFIG = {
    easy:   { spawnInterval: 1400, lifetime: 3000, maxSimultaneous: 4 },
    normal: { spawnInterval: 1100, lifetime: 2500, maxSimultaneous: 6 },
    hard:   { spawnInterval: 800,  lifetime: 2000, maxSimultaneous: 8 }
  };

  // ---------- Rendering & DOM ----------
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function updateUI(){
    scoreEl.textContent = score;
    comboEl.textContent = combo;
    livesEl.textContent = lives;
    roundEl.textContent = round;
    highscoreEl.textContent = highscore;
  }

  function resetGameState(){
    score = 0; combo = 0; lives = 3; round = 0;
    prompts.forEach((el) => removePrompt(el, true));
    prompts.clear();
    updateUI();
    hint.style.opacity = 1;
    hint.textContent = 'Press Start to play';
  }

  function removePrompt(el, silent = false){
    if (!el) return;
    const id = el.dataset.promptId;
    if (prompts.has(id)) prompts.delete(id);
    el.remove();
    // clear any timeout attached
    const t = el._timeout;
    if (t) {
      clearTimeout(t);
      timerIds.delete(t);
    }
    if (!silent) {
      // small shrink effect handled by CSS
    }
  }

  // Create a prompt bubble at a random position
  function spawnPrompt() {
    if (!running || paused) return;

    // limit simultaneous
    const maxSim = DIFFICULTY_CONFIG[difficulty].maxSimultaneous;
    if (prompts.size >= maxSim) return;

    // choose type by weighted random
    const r = Math.random();
    let acc = 0;
    let chosen = PROMPT_TYPES[0];
    for (const p of PROMPT_TYPES) {
      acc += p.weight;
      if (r <= acc) { chosen = p; break; }
    }

    const id = String(promptIdCounter++);
    const el = document.createElement('div');
    el.className = `prompt ${chosen.type} glow`;
    el.dataset.type = chosen.type;
    el.dataset.value = chosen.score;
    el.dataset.promptId = id;

    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'emoji';
    emojiSpan.textContent = chosen.emoji;

    const labelSpan = document.createElement('span');
    labelSpan.className = 'label';
    labelSpan.textContent = chosen.type === 'target' ? randomTargetLabel() : randomDecoyLabel();

    el.appendChild(emojiSpan);
    el.appendChild(labelSpan);

    // random position within arena bounds
    const rect = arena.getBoundingClientRect();
    // ensure prompt stays fully inside
    const w = 120, h = 48;
    const x = Math.random() * (rect.width - w);
    const y = Math.random() * (rect.height - h);

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    // small scale pop animation
    el.style.transform = 'scale(0.7)';
    arena.appendChild(el);
    requestAnimationFrame(()=> el.style.transform = 'scale(1)');

    prompts.set(id, el);

    // bind click
    el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      handlePromptHit(el, 'click');
    });

    // auto remove after lifetime (miss)
    const life = DIFFICULTY_CONFIG[difficulty].lifetime;
    const to = setTimeout(() => {
      if (!prompts.has(id)) return;
      // if target missed
      if (el.dataset.type === 'target') {
        combo = 0;
        lives -= 1;
        playMiss();
      } else {
        // decoys/obstacles expire harmlessly
        // small penalty for obstacle miss? no
      }
      removePrompt(el);
      checkGameOver();
      updateUI();
    }, life);

    el._timeout = to;
    timerIds.add(to);
  }

  // labels for variety
  const WORDS = ['JUMP', 'CATCH', 'FIRE', 'GOLD', 'KEY', 'BOOM', 'LUCK', 'FAST', 'HIT', 'SAVE', 'GEM'];
  const DECOYS = ['NO', 'STOP', 'WRONG', 'MISS', 'BAD'];
  function randomTargetLabel(){ return WORDS[Math.floor(Math.random()*WORDS.length)]; }
  function randomDecoyLabel(){ return DECOYS[Math.floor(Math.random()*DECOYS.length)]; }

  // Handle clicks or key-press hits
  function handlePromptHit(el, method, player = 1) {
    if (!el || !prompts.has(el.dataset.promptId)) return;
    const type = el.dataset.type;
    const value = Number(el.dataset.value) || 0;

    // remove immediately to prevent double-hits
    removePrompt(el);

    if (type === 'target') {
      score += value + Math.floor(combo * 2);
      combo += 1;
      playSuccess();
      if (combo > 2) playCombo();
      round += 0.1; // increase round subtly for pacing
    } else if (type === 'decoy') {
      score += value; // negative
      combo = 0;
      lives -= 1;
      playDecoy();
    } else if (type === 'obstacle') {
      score += value; // negative
      combo = 0;
      lives -= 2;
      playMiss();
    }

    // clamp
    score = Math.max(-9999, score);
    combo = Math.max(0, combo);
    round = Math.floor(round);

    if (score > highscore) {
      highscore = score;
      localStorage.setItem('catch-miss-highscore', highscore);
    }

    updateUI();
    checkGameOver();
  }

  // keyboard handling (for quick response)
  function onKeyDown(e){
    if (!running || paused) return;

    // Single player: any key attempts to 'catch' nearest prompt
    if (mode === 'single') {
      // find nearest target to center (simple heuristic)
      const arr = Array.from(prompts.values());
      if (!arr.length) return;
      // choose the one with smallest distance to center of arena
      const rect = arena.getBoundingClientRect();
      const cx = rect.width/2, cy = rect.height/2;
      let best = null, bestD = Infinity;
      for (const el of arr){
        const r = el.getBoundingClientRect();
        const x = r.left - rect.left + r.width/2;
        const y = r.top - rect.top + r.height/2;
        const d = Math.hypot(cx-x, cy-y);
        if (d < bestD){ bestD = d; best = el; }
      }
      if (best) handlePromptHit(best, 'key');
      return;
    }

    // Duo mode: player 1 uses F (key 'f'), player 2 uses J (key 'j')
    if (mode === 'duo') {
      if (e.key.toLowerCase() === 'f'){
        // Player 1: pick a prompt on left half
        const leftPrompts = Array.from(prompts.values()).filter(el => {
          const r = el.getBoundingClientRect();
          const arenaRect = arena.getBoundingClientRect();
          return (r.left - arenaRect.left + r.width/2) < arenaRect.width/2;
        });
        if (!leftPrompts.length) return;
        handlePromptHit(leftPrompts[0], 'key', 1);
      } else if (e.key.toLowerCase() === 'j'){
        const rightPrompts = Array.from(prompts.values()).filter(el => {
          const r = el.getBoundingClientRect();
          const arenaRect = arena.getBoundingClientRect();
          return (r.left - arenaRect.left + r.width/2) >= arenaRect.width/2;
        });
        if (!rightPrompts.length) return;
        handlePromptHit(rightPrompts[0], 'key', 2);
      }
    }
  }

  // Check game over
  function checkGameOver(){
    if (lives <= 0) {
      running = false;
      paused = false;
      hint.style.opacity = 1;
      hint.innerHTML = `<strong>Game Over</strong> — Score: ${score}<br><small>Press Restart to play again</small>`;
      pauseBtn.disabled = true;
      restartBtn.disabled = false;
      startBtn.disabled = false;
      // clear timers & prompts
      clearAllTimers();
      prompts.forEach(el => removePrompt(el));
      if (score > highscore) {
        highscore = score;
        localStorage.setItem('catch-miss-highscore', highscore);
      }
      updateUI();
    }
  }

  // Start / Pause / Restart
  function startGame(){
    if (running) return;
    // ensure audio context resumed on user gesture
    try { audioCtx.resume(); } catch(e){}

    running = true;
    paused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    restartBtn.disabled = false;
    hint.style.opacity = 0;

    // assign difficulty
    difficulty = difficultySelect.value;
    mode = modeSelect.value;
    spawnInterval = DIFFICULTY_CONFIG[difficulty].spawnInterval;
    promptLifetime = DIFFICULTY_CONFIG[difficulty].lifetime;

    // schedule spawns:
    scheduleSpawn();
    updateUI();
  }

  function scheduleSpawn(){
    if (!running || paused) return;
    spawnPrompt();
    const id = setTimeout(scheduleSpawn, spawnInterval + Math.random()*300 - 150);
    timerIds.add(id);
  }

  function pauseGame(){
    if (!running) return;
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    if (!paused) {
      // resume schedule
      scheduleSpawn();
    } else {
      // clear active timers to freeze spawning and prompt expirations
      clearAllTimers(true);
      // but keep existing prompts on screen (they won't expire until resumed)
    }
  }

  function restartGame(){
    clearAllTimers();
    prompts.forEach(el => removePrompt(el, true));
    prompts.clear();
    running = false;
    paused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    restartBtn.disabled = true;
    resetGameState();
  }

  function clearAllTimers(keepPrompts = false){
    timerIds.forEach(id => clearTimeout(id));
    timerIds.clear();
    // also clear per-element timeouts
    if (!keepPrompts){
      prompts.forEach(el => {
        if (el._timeout) {
          clearTimeout(el._timeout);
          delete el._timeout;
        }
      });
    } else {
      // keep element timeouts paused (they are cleared) — we will not resume exact time left,
      // but that's acceptable for pause behaviour
      prompts.forEach(el => { if (el._timeout) { clearTimeout(el._timeout); delete el._timeout } });
    }
  }

  // arena click to catch nearest (helps mobile)
  arena.addEventListener('click', (e) => {
    if (!running || paused) return;
    // find topmost prompt under click
    const el = e.target.closest('.prompt');
    if (el) {
      handlePromptHit(el, 'tap');
    } else {
      // on empty, attempt nearest capture (single-player quick press)
      if (mode === 'single') {
        onKeyDown({ key: ' '});
      }
    }
  });

  // keyboard global
  window.addEventListener('keydown', onKeyDown);

  // control binding
  startBtn.addEventListener('click', () => {
    // start from scratch if not running
    if (!running) {
      resetGameState();
      startGame();
    } else if (paused) {
      pauseGame();
    }
  });
  pauseBtn.addEventListener('click', () => {
    if (!running) return;
    pauseGame();
  });
  restartBtn.addEventListener('click', () => {
    restartGame();
  });
  muteToggle.addEventListener('change', (e) => {
    muted = e.target.checked;
  });

  // update difficulty & mode visually
  difficultySelect.addEventListener('change', () => {
    difficulty = difficultySelect.value;
  });
  modeSelect.addEventListener('change', () => {
    mode = modeSelect.value;
  });

  // small helper to animate a flash when score increases
  function flashArena(color = 'rgba(0,209,178,0.06)'){
    const f = document.createElement('div');
    f.style.position = 'absolute';
    f.style.inset = '0';
    f.style.pointerEvents = 'none';
    f.style.background = color;
    f.style.opacity = '0';
    f.style.transition = 'opacity 240ms ease';
    arena.appendChild(f);
    requestAnimationFrame(()=> f.style.opacity = '1');
    setTimeout(()=> {
      f.style.opacity = '0';
      setTimeout(()=> f.remove(), 260);
    }, 120);
  }

  // small initialization
  resetGameState();
  // small responsiveness: adjust arena hint position
  window.addEventListener('resize', () => { /* nothing heavy */ });

  // expose for debugging (optional)
  window.__catchMiss = { startGame, restartGame, pauseGame };

})();
