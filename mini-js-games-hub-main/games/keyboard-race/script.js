/* Keyboard Race - Advanced
   Player 1: key 'a' or 'A'
   Player 2: key 'l' or 'L'
   Features:
   - Bulb/step track visualization
   - Obstacles that freeze player for a short time
   - Start / Pause / Restart
   - Sounds & music (online URLs) with toggle
   - LocalStorage win tracking (so hub can read game plays/wins)
*/

(() => {
  // CONFIG
  const STEPS = 20; // number of bulbs/steps to finish
  const MOVE_PER_PRESS = 1; // steps increment per valid press
  const OBSTACLE_COUNT = 3; // obstacles per race
  const FREEZE_MS = 900; // freeze duration on obstacle hit

  // Online assets (public domain / google actions sounds used where possible)
  const ASSETS = {
    startSound: 'https://actions.google.com/sounds/v1/cartoon/slide_whistle_to_drum_hit.ogg',
    moveSound: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
    obstacleSound: 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg',
    winSound: 'https://actions.google.com/sounds/v1/cartoon/metal_clang.ogg',
    bgMusic: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_0b7b30b578.mp3?filename=upbeat-retro-game-loop-111261.mp3'
  };

  // DOM
  const trackEl = document.getElementById('track');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const soundToggle = document.getElementById('soundToggle');
  const musicToggle = document.getElementById('musicToggle');
  const msgEl = document.getElementById('msg');
  const p1MovesEl = document.getElementById('p1-moves');
  const p2MovesEl = document.getElementById('p2-moves');

  // state
  let steps = [];
  let obstacles = new Set();
  let gameRunning = false;
  let paused = false;
  let p1 = { pos: 0, frozenUntil: 0, moves: 0 };
  let p2 = { pos: 0, frozenUntil: 0, moves: 0 };
  let audioEnabled = true;
  let musicEnabled = true;
  let bgAudio = null;
  let sounds = {};

  // load or init local win/play data to integrate with hub tracking:
  const GAME_KEY = 'Keyboard Race';
  const playData = JSON.parse(localStorage.getItem('gamePlays') || '{}');

  // helper: safe audio creation
  function createAudio(src, loop = false, vol = 0.85) {
    try {
      const a = new Audio(src);
      a.loop = !!loop;
      a.volume = Math.min(Math.max(vol, 0), 1);
      // some browsers require user gesture before play — we just have audio ready.
      return a;
    } catch (e) {
      return null;
    }
  }

  function loadSounds() {
    sounds.start = createAudio(ASSETS.startSound, false, 0.8);
    sounds.move = createAudio(ASSETS.moveSound, false, 0.7);
    sounds.obst = createAudio(ASSETS.obstacleSound, false, 0.8);
    sounds.win = createAudio(ASSETS.winSound, false, 1);
    bgAudio = createAudio(ASSETS.bgMusic, true, 0.45);
  }

  // build track
  function buildTrack() {
    trackEl.innerHTML = '';
    steps = [];
    for (let i = 0; i < STEPS; i++) {
      const step = document.createElement('div');
      step.className = 'step';
      step.dataset.index = i;
      trackEl.appendChild(step);
      steps.push(step);
    }

    // place finish marker: slightly larger last step
    if (steps.length) {
      steps[STEPS - 1].style.border = '2px solid rgba(255,255,255,0.06)';
    }
  }

  // randomly set obstacles (not first or last)
  function placeObstacles() {
    obstacles.clear();
    const safeRange = [...Array(STEPS - 2).keys()].map(i => i + 1); // 1..STEPS-2
    // shuffle safeRange
    for (let i = safeRange.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [safeRange[i], safeRange[j]] = [safeRange[j], safeRange[i]];
    }
    const chosen = safeRange.slice(0, OBSTACLE_COUNT);
    chosen.forEach(i => {
      obstacles.add(i);
      steps[i].classList.add('obstacle');
    });
  }

  function resetUI() {
    steps.forEach(s => {
      s.classList.remove('lit', 'player1', 'player2');
      s.style.transform = '';
    });
    p1 = { pos: 0, frozenUntil: 0, moves: 0 };
    p2 = { pos: 0, frozenUntil: 0, moves: 0 };
    updatePlayerUI();
  }

  function updatePlayerUI() {
    // light steps for each player
    steps.forEach((s, idx) => {
      s.classList.remove('player1', 'player2', 'lit');
      if (idx <= p1.pos - 1) {
        s.classList.add('lit', 'player1');
      }
      if (idx <= p2.pos - 1) {
        s.classList.add('lit', 'player2');
      }
      // if both reached same index keep both styles (player2 overrides visually by later add)
    });

    // set moves & progress text
    const p1pct = Math.min(100, Math.round((p1.pos / (STEPS - 1)) * 100));
    const p2pct = Math.min(100, Math.round((p2.pos / (STEPS - 1)) * 100));
    document.querySelector('.player1 .progress').textContent = `${p1pct}%`;
    document.querySelector('.player2 .progress').textContent = `${p2pct}%`;
    p1MovesEl.textContent = p1.moves;
    p2MovesEl.textContent = p2.moves;
  }

  function canMove(player) {
    return Date.now() >= player.frozenUntil;
  }

  function applyObstacle(player, playerId) {
    player.frozenUntil = Date.now() + FREEZE_MS;
    // small flash on current step
    const idx = Math.max(0, player.pos - 1);
    const el = steps[idx] || null;
    if (el) {
      el.classList.add('shake');
      setTimeout(() => el.classList.remove('shake'), 420);
    }
    if (audioEnabled && sounds.obst) {
      try { sounds.obst.currentTime = 0; sounds.obst.play(); } catch (e) {}
    }
    showMsg(`${playerId} hit an obstacle! Frozen briefly.`);
  }

  function handleMove(player, playerId) {
    if (!gameRunning || paused) return;
    if (!canMove(player)) return; // frozen
    // move
    player.pos = Math.min(STEPS - 1, player.pos + MOVE_PER_PRESS);
    player.moves++;
    if (audioEnabled && sounds.move) {
      try { sounds.move.currentTime = 0; sounds.move.play(); } catch (e) {}
    }
    // check obstacle on newly lit position (if not finish)
    if (obstacles.has(player.pos - 1)) {
      applyObstacle(player, playerId);
    }
    updatePlayerUI();
    checkWin();
  }

  function checkWin() {
    if (p1.pos >= STEPS - 1 || p2.pos >= STEPS - 1) {
      gameRunning = false;
      pauseBtn.disabled = true;
      restartBtn.disabled = false;
      startBtn.disabled = false;
      const winner = p1.pos >= STEPS - 1 ? 'Player 1' : 'Player 2';
      showMsg(`${winner} wins! 🎉`);
      if (audioEnabled && sounds.win) {
        try { sounds.win.currentTime = 0; sounds.win.play(); } catch (e) {}
      }
      recordWin(winner);
      stopBG();
    }
  }

  function showMsg(text) {
    msgEl.innerHTML = text;
  }

  // record win to localStorage so main hub can read stats
  function recordWin(winner) {
    if (!playData[GAME_KEY]) playData[GAME_KEY] = { plays: 0, wins: { 'Player 1': 0, 'Player 2': 0 } };
    playData[GAME_KEY].plays += 1;
    playData[GAME_KEY].wins[winner] = (playData[GAME_KEY].wins[winner] || 0) + 1;
    localStorage.setItem('gamePlays', JSON.stringify(playData));
    // also call hub play tracker if present (the hub listens for .play-button clicks, but we can increment here)
  }

  // controls
  function startGame() {
    if (gameRunning) return;
    // reset some state
    gameRunning = true;
    paused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    restartBtn.disabled = false;
    showMsg('Race on! Smash your keys: A (Player 1) and L (Player 2).');

    resetUI();
    buildTrack(); // rebuild visual if needed
    placeObstacles();
    updatePlayerUI();

    // play start sound and music
    if (audioEnabled && sounds.start) { try { sounds.start.currentTime = 0; sounds.start.play(); } catch(e){} }
    if (musicEnabled && bgAudio) { try { bgAudio.currentTime = 0; bgAudio.play(); } catch(e) {} }
  }

  function pauseGame() {
    if (!gameRunning) return;
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    showMsg(paused ? 'Paused' : 'Resumed');
    if (paused) {
      // pause music
      if (bgAudio) try { bgAudio.pause(); } catch(e){}
    } else {
      if (musicEnabled && bgAudio) try { bgAudio.play(); } catch(e){}
    }
  }

  function restartGame() {
    gameRunning = false;
    paused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    restartBtn.disabled = true;
    stopBG();
    buildTrack();
    placeObstacles();
    resetUI();
    showMsg('Ready. Press Start to race!');
  }

  function stopBG() {
    if (bgAudio) try { bgAudio.pause(); bgAudio.currentTime = 0; } catch(e){}
  }

  // keyboard listener
  function onKey(e) {
    if (!gameRunning || paused) return;
    const k = e.key.toLowerCase();
    if (k === 'a') {
      handleMove(p1, 'Player 1');
    } else if (k === 'l') {
      handleMove(p2, 'Player 2');
    }
  }

  // init
  function init() {
    loadSounds();
    buildTrack();
    placeObstacles();
    resetUI();
    showMsg('Press Start to begin. Player1: A — Player2: L');

    // attach event handlers
    startBtn.addEventListener('click', () => {
      startGame();
      // register a play (so hub shows "play" counts when user opens via Play Now)
      try {
        const hubPlays = JSON.parse(localStorage.getItem('gamePlays') || '{}');
        if (!hubPlays[GAME_KEY]) hubPlays[GAME_KEY] = { plays: 0, wins: { 'Player 1': 0, 'Player 2': 0 } };
        // increment plays when start pressed
        hubPlays[GAME_KEY].plays += 1;
        localStorage.setItem('gamePlays', JSON.stringify(hubPlays));
      } catch(e){}
    });

    pauseBtn.addEventListener('click', pauseGame);
    restartBtn.addEventListener('click', restartGame);

    // toggles
    soundToggle.addEventListener('change', (ev) => audioEnabled = ev.target.checked);
    musicToggle.addEventListener('change', (ev) => {
      musicEnabled = ev.target.checked;
      if (!musicEnabled) stopBG();
      else if (musicEnabled && gameRunning) try { bgAudio.play(); } catch(e){}
    });

    // keyboard listener - use keydown for responsive presses
    window.addEventListener('keydown', (e) => {
      // Prevent default for space/scroll keys only when game running
      if (gameRunning && (e.key === ' ' || e.key === 'Spacebar')) e.preventDefault();
      // direct call
      onKey(e);
    });

    // enable / disable pause/restart appropriately
    // initial button states
    pauseBtn.disabled = true;
    restartBtn.disabled = true;
  }

  // start
  init();

})();
