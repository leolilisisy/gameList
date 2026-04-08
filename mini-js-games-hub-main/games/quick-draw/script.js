// Quick Draw — advanced version
// Place at games/quick-draw/script.js

(() => {
  // Elements
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const restartBtn = document.getElementById('restart-btn');
  const shootBtn = document.getElementById('shoot-btn');
  const signalEl = document.getElementById('signal');
  const roundResultEl = document.getElementById('round-result');
  const aiScoreEl = document.getElementById('ai-score');
  const playerScoreEl = document.getElementById('player-score');
  const roundInfo = document.getElementById('round-info');
  const lastReaction = document.getElementById('last-reaction');
  const bestScoreEl = document.getElementById('best-score');
  const countdownEl = document.getElementById('countdown');
  const modeTimerEl = document.getElementById('mode-timer');

  const modeSelect = document.getElementById('mode-select');
  const difficultySelect = document.getElementById('difficulty-select');

  // Sound assets (online)
  const SOUND_DRAW = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
  const SOUND_SHOT = 'https://actions.google.com/sounds/v1/impacts/pop.ogg';
  const SOUND_FOUL = 'https://actions.google.com/sounds/v1/human_voices/oh_no.ogg';
  const SOUND_WIN = 'https://actions.google.com/sounds/v1/alarms/winding_alert.ogg';

  const sDraw = new Audio(SOUND_DRAW);
  const sShot = new Audio(SOUND_SHOT);
  const sFoul = new Audio(SOUND_FOUL);
  const sWin = new Audio(SOUND_WIN);

  // State
  let running = false;
  let paused = false;
  let mode = 'bestof3'; // or 'timed'
  let difficulty = 'normal';
  let roundsTotal = 3;
  let roundNumber = 0;
  let playerScore = 0;
  let aiScore = 0;
  let currentRoundActive = false;
  let drawTime = 0;
  let playerFired = false;
  let aiFired = false;
  let aiTimeout = null;
  let drawTimeout = null;
  let modeTimer = null;
  let timedLeft = 30; // 30s for timed mode
  const storageKey = 'quickdraw_best';

  // Settings mapping per difficulty (AI reaction range in ms)
  const difficultyMap = {
    easy: { aiMin: 300, aiMax: 700 },
    normal: { aiMin: 180, aiMax: 380 },
    hard: { aiMin: 90, aiMax: 240 }
  };

  // Helpers
  function resetRoundState(){
    currentRoundActive = false;
    playerFired = false;
    aiFired = false;
    clearTimeout(aiTimeout);
    clearTimeout(drawTimeout);
    signalEl.classList.remove('draw');
    signalEl.classList.add('wait');
    signalEl.textContent = 'WAIT...';
    shootBtn.disabled = true;
    roundResultEl.textContent = 'Ready';
  }

  function updateHUD(){
    aiScoreEl.textContent = `AI: ${aiScore}`;
    playerScoreEl.textContent = `You: ${playerScore}`;
    roundInfo.textContent = `${roundNumber} / ${roundsTotal}`;
    bestScoreEl.textContent = localStorage.getItem(storageKey) || '—';
  }

  function enableControls(state){
    startBtn.disabled = state;
    pauseBtn.disabled = !state;
    restartBtn.disabled = !state;
  }

  function playSound(audio){
    // try-catch to avoid console noise in blocked environments
    try {
      audio.currentTime = 0;
      audio.play().catch(()=>{/* ignored */});
    } catch(e){}
  }

  function randomBetween(min,max){ return Math.floor(Math.random()*(max-min))+min; }

  function scheduleDraw(){
    // Random delay before draw (1 — 2.8s) to avoid predictability
    const delay = randomBetween(1000, 2800);
    signalEl.textContent = 'Get Ready...';
    countdownEl.textContent = '';
    drawTimeout = setTimeout(() => {
      // draw signal
      signalEl.classList.remove('wait');
      signalEl.classList.add('draw');
      signalEl.textContent = 'DRAW!';
      playSound(sDraw);
      drawTime = performance.now();
      currentRoundActive = true;
      playerFired = false;
      aiFired = false;
      shootBtn.disabled = false;

      // Schedule AI reaction
      const diff = difficultyMap[difficulty] || difficultyMap.normal;
      const aiReact = randomBetween(diff.aiMin, diff.aiMax);
      aiTimeout = setTimeout(() => aiShoot('ai'), aiReact);

      // Visual flash for draw
      flashSignal();
    }, delay);
  }

  function flashSignal(){
    // small animation loop for glow pulsing
    signalEl.animate([
      { boxShadow: '0 8px 30px rgba(255,204,0,0.16)', transform: 'scale(1)' },
      { boxShadow: '0 20px 64px rgba(255,204,0,0.28)', transform: 'scale(1.02)' },
      { boxShadow: '0 8px 30px rgba(255,204,0,0.16)', transform: 'scale(1)' }
    ], { duration: 600, iterations: 2 });
  }

  function aiShoot(role='ai'){
    if(!currentRoundActive || aiFired) return;
    aiFired = true;
    const t = performance.now();
    const rt = t - drawTime;
    // If player hasn't fired yet, AI wins
    if(!playerFired){
      // AI wins
      aiScore++;
      roundResultEl.textContent = `AI shot: ${Math.round(rt)}ms — AI wins!`;
      playSound(sWin);
      lastReaction.textContent = `${Math.round(rt)} ms (AI)`;
      endRound('ai');
    }
  }

  function endRound(winner){
    currentRoundActive = false;
    shootBtn.disabled = true;
    clearTimeout(aiTimeout);
    clearTimeout(drawTimeout);

    if(mode === 'bestof3'){
      // check if match ended
      if(aiScore > Math.floor(roundsTotal/2) || playerScore > Math.floor(roundsTotal/2) || roundNumber >= roundsTotal){
        finishMatch();
      } else {
        // small pause then next round
        setTimeout(() => {
          roundNumber++;
          resetRoundState();
          updateHUD();
          scheduleRound();
        }, 900);
      }
    } else if(mode === 'timed'){
      // in timed mode, we just proceed; rounds are for display
      setTimeout(() => {
        roundNumber++;
        resetRoundState();
        updateHUD();
        scheduleRound();
      }, 600);
    } else {
      setTimeout(() => {
        roundNumber++;
        resetRoundState();
        updateHUD();
        scheduleRound();
      }, 600);
    }
  }

  function finishMatch(){
    running = false;
    enableControls(false);
    pauseBtn.disabled = true;
    startBtn.disabled = false;
    shootBtn.disabled = true;
    // determine winner
    let message = '';
    if(playerScore === aiScore) message = `Match tied ${playerScore} - ${aiScore}`;
    else if(playerScore > aiScore) {
      message = `You win ${playerScore} : ${aiScore} — Great shot!`;
      playSound(sWin);
      saveBest(playerScore);
    } else {
      message = `You lost ${playerScore} : ${aiScore} — AI was quicker.`;
      playSound(sFoul);
    }
    roundResultEl.textContent = message;
    updateHUD();
  }

  function saveBest(score){
    const prev = parseInt(localStorage.getItem(storageKey) || '0', 10) || 0;
    if(score > prev){
      localStorage.setItem(storageKey, score);
      bestScoreEl.textContent = score;
    }
  }

  // Player shot action
  function playerShoot(){
    if(!running) return;
    if(paused) return;
    const now = performance.now();
    // if shot before draw signal -> foul
    if(!currentRoundActive){
      // Early fire
      playSound(sFoul);
      aiScore++;
      roundResultEl.textContent = 'Too early! Foul — AI wins that round.';
      lastReaction.textContent = 'Foul';
      endRound('ai');
      return;
    }
    if(playerFired) return; // ignore multi-shots
    playerFired = true;
    const reaction = now - drawTime;
    lastReaction.textContent = `${Math.round(reaction)} ms`;
    playSound(sShot);

    // If AI hasn't fired yet, player wins
    if(!aiFired){
      playerScore++;
      roundResultEl.textContent = `You shot: ${Math.round(reaction)}ms — You win!`;
      endRound('player');
    } else {
      // AI already fired => compare times
      roundResultEl.textContent = `Too slow! AI fired earlier.`;
      endRound('ai');
    }
    updateHUD();
  }

  // Input handlers
  shootBtn.addEventListener('click', () => playerShoot());
  document.addEventListener('keydown', (e) => {
    if([' ','Spacebar','Enter'].includes(e.key)){
      e.preventDefault();
      if(!shootBtn.disabled) playerShoot();
    }
    // quick shortcuts
    if(e.key === 'p' || e.key === 'P') togglePause();
    if(e.key === 'r' || e.key === 'R') restartGame();
  });

  // Pause / resume
  function togglePause(){
    if(!running) return;
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    if(paused){
      // freeze timers
      clearTimeout(aiTimeout);
      clearTimeout(drawTimeout);
      clearInterval(modeTimer);
      roundResultEl.textContent = 'Paused';
      shootBtn.disabled = true;
    } else {
      // resume: if draw not yet triggered, schedule small delay before draw to avoid instant triggers
      roundResultEl.textContent = 'Resuming...';
      if(!currentRoundActive){
        drawTimeout = setTimeout(scheduleDraw, 350);
      } else {
        // current round active but no AI timer? schedule AI to react
        if(!aiFired){
          const diff = difficultyMap[difficulty] || difficultyMap.normal;
          const aiReact = randomBetween(diff.aiMin, diff.aiMax);
          aiTimeout = setTimeout(() => aiShoot('ai'), aiReact);
        }
        shootBtn.disabled = false;
      }
      // resume mode timer if timed mode
      if(mode === 'timed'){
        startModeTimer();
      }
    }
  }

  pauseBtn.addEventListener('click', togglePause);

  // Restart
  function restartGame(){
    clearAll();
    initState();
    updateHUD();
    roundResultEl.textContent = 'Restarted';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    restartBtn.disabled = true;
  }
  restartBtn.addEventListener('click', restartGame);

  function clearAll(){
    running = false; paused = false;
    clearTimeout(aiTimeout); clearTimeout(drawTimeout); clearInterval(modeTimer);
  }

  // Start match
  function startGame(){
    if(running) return;
    running = true;
    paused = false;
    playerScore = 0; aiScore = 0; roundNumber = 1;
    mode = modeSelect.value;
    difficulty = difficultySelect.value;

    if(mode === 'bestof3'){
      roundsTotal = 3;
      timedLeft = 0;
    } else {
      roundsTotal = 9999; // arbitrary
      timedLeft = 30;
    }

    enableControls(true);
    updateHUD();

    // schedule first round
    resetRoundState();
    scheduleRound();

    // start mode timer if timed
    if(mode === 'timed'){
      startModeTimer();
    }
  }

  function scheduleRound(){
    // small pre-round bounce
    signalEl.classList.remove('draw');
    signalEl.classList.add('wait');
    signalEl.textContent = 'Wait...';
    shootBtn.disabled = true;

    // small visual countdown supplement (3..1)
    let mini = 3;
    countdownEl.textContent = '';
    const miniTick = setInterval(() => {
      if(paused || !running){ clearInterval(miniTick); countdownEl.textContent = ''; return; }
      if(mini <= 1){
        clearInterval(miniTick);
        countdownEl.textContent = '';
        // actual draw scheduled randomly to avoid predictability
        scheduleDraw();
        return;
      }
      countdownEl.textContent = `${mini-1}`;
      mini--;
    }, 240);

    updateHUD();
  }

  // Mode timer for timed mode
  function startModeTimer(){
    clearInterval(modeTimer);
    modeTimerEl.textContent = `Time: ${timedLeft}s`;
    modeTimer = setInterval(() => {
      if(paused || !running) return;
      timedLeft--;
      modeTimerEl.textContent = `Time: ${timedLeft}s`;
      if(timedLeft <= 0){
        clearInterval(modeTimer);
        // finish match
        finishMatch();
      }
    }, 1000);
  }

  // Setup UI & initialization
  function initState(){
    running = false;
    paused = false;
    playerScore = 0; aiScore = 0;
    roundNumber = 0;
    currentRoundActive = false;
    shootBtn.disabled = true;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    restartBtn.disabled = true;
    signalEl.classList.remove('draw');
    signalEl.classList.add('wait');
    signalEl.textContent = 'WAIT...';
    countdownEl.textContent = '';
    modeTimerEl.textContent = '';
    lastReaction.textContent = '—';
  }

  // Start button
  startBtn.addEventListener('click', () => {
    mode = modeSelect.value;
    difficulty = difficultySelect.value;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    restartBtn.disabled = false;
    startGame();
  });

  // End of match cleanup
  function endAll(){
    clearTimeout(aiTimeout);
    clearTimeout(drawTimeout);
    clearInterval(modeTimer);
    running = false;
    paused = false;
    enableControls(false);
  }

  // Save best when page unload (optional)
  window.addEventListener('beforeunload', () => {
    const prev = parseInt(localStorage.getItem(storageKey) || '0',10) || 0;
    if(playerScore > prev) localStorage.setItem(storageKey, playerScore);
  });

  // Attach shoot via pointer down (fast)
  shootBtn.addEventListener('pointerdown', () => {
    playerShoot();
  });

  // initialize
  initState();
  updateHUD();
})();
