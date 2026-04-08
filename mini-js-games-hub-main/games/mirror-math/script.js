/* Mirror Math — main logic */

/* -------------------------
   Helpful notes:
   - Canvas is used to render the equation text, then the canvas is transformed
     for mirrored/rotated views while internal answer checking uses canonical string.
   - Sounds are public Google Actions audio files (CORS-friendly).
   ------------------------- */

(() => {
  // DOM
  const canvas = document.getElementById('eq-canvas');
  const ctx = canvas.getContext('2d');
  const input = document.getElementById('answer-input');
  const submitBtn = document.getElementById('submit-btn');
  const skipBtn = document.getElementById('skip-btn');
  const pauseBtn = document.getElementById('pause-resume');
  const restartBtn = document.getElementById('restart');
  const messageEl = document.getElementById('message');
  const timerEl = document.getElementById('timer');
  const scoreEl = document.getElementById('score');
  const streakEl = document.getElementById('streak');
  const modeSelect = document.getElementById('mode-select');
  const diffSelect = document.getElementById('difficulty-select');
  const modeBadge = document.getElementById('mode-badge');
  const hudMode = document.getElementById('hud-mode');
  const hudDiff = document.getElementById('hud-diff');
  const audioToggle = document.getElementById('audio-toggle');
  const bulbs = Array.from(document.querySelectorAll('.bulb'));

  // Sounds
  const sfxCorrect = document.getElementById('sfx-correct');
  const sfxWrong = document.getElementById('sfx-wrong');
  const sfxTick = document.getElementById('sfx-tick');

  // State
  let currentEq = null; // {displayStr, answer, orientation, rotationDeg}
  let paused = false;
  let score = 0;
  let streak = 0;
  let timer = null;
  let timerRemaining = 0;
  let perEquationTime = 10; // default
  let locked = false; // while evaluating
  let currentMode = 'practice';
  let currentDiff = 'medium';
  let orientationPref = 'mirrored';

  // visual constants
  const CANVAS_W = canvas.width = 720;
  const CANVAS_H = canvas.height = 140;

  // helper: pick random element
  const pick = (a) => a[Math.floor(Math.random()*a.length)];

  // Operators for difficulty
  const OPS = {
    easy: ['+','-'],
    medium: ['+','-','*'],
    hard: ['+','-','*','/']
  };

  // set initial UI
  function setUI() {
    hudMode.textContent = capitalize(currentMode);
    hudDiff.textContent = capitalize(currentDiff);
    modeBadge.textContent = capitalize(currentMode);
    scoreEl.textContent = score;
    streakEl.textContent = streak;
  }

  function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1) }

  // Generate canonical equation and numeric answer
  function generateEquation(difficulty) {
    let a,b,op,answer;
    const ops = OPS[difficulty];
    op = pick(ops);

    if (difficulty === 'easy') {
      a = randInt(1,9);
      b = randInt(1,9);
    } else if (difficulty === 'medium') {
      a = randInt(10,99);
      b = randInt(2,20);
    } else { // hard
      a = randInt(-50,150);
      b = randInt(-12,40);
    }

    // ensure no division by zero
    if(op === '/') {
      // make divisible or force decimal rounding to 2 decimals
      if (b === 0) b = 2;
      answer = +(a / b).toFixed(2);
    } else if (op === '*') {
      answer = a * b;
    } else if (op === '+') {
      answer = a + b;
    } else { // -
      answer = a - b;
    }

    // sometimes flip order for subtraction/division to make it trickier
    if(op === '-' && Math.random() < 0.3) {
      [a,b] = [b,a];
      if (op === '/') answer = +(a / b).toFixed(2);
      else if (op === '-') answer = a - b;
    }

    const canonical = `${a} ${op} ${b}`;
    return { canonical, answer };
  }

  function randInt(min, max){
    return Math.floor(Math.random()*(max-min+1))+min;
  }

  // Convert canonical into display string (we will draw this to canvas)
  function canonicalToDisplay(canonical, transformType){
    // For our purposes the display string is same as canonical (numbers and ops).
    // Visual transform is done at canvas or CSS level.
    return canonical;
  }

  // draw on canvas centered
  function drawEquationOnCanvas(text, rotationDeg=0, mirrored=false) {
    // clear
    ctx.clearRect(0,0,CANVAS_W,CANVAS_H);
    // background gloss
    const g = ctx.createLinearGradient(0,0,CANVAS_W,0);
    g.addColorStop(0, 'rgba(255,255,255,0.02)');
    g.addColorStop(1, 'rgba(255,255,255,0.01)');
    ctx.fillStyle = g;
    roundRect(ctx, 6, 6, CANVAS_W-12, CANVAS_H-12, 12);
    ctx.fill();

    // apply transform for drawing (we'll draw upright text then transform canvas for display)
    ctx.save();
    // translate to center
    ctx.translate(CANVAS_W/2, CANVAS_H/2);
    // rotation is applied around center AFTER mirroring if needed
    if (mirrored) {
      ctx.scale(-1, 1); // mirror across vertical
    }
    ctx.rotate(rotationDeg * Math.PI / 180);

    // text style
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // draw drop-shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.translate(4,6);
    ctx.fillText(text, 0, 0);
    ctx.restore();

    // glow-filled text
    ctx.fillStyle = '#fff';
    ctx.fillText(text, 0, 0);

    ctx.restore();

    // add subtle outer glow using CSS on canvas element
    canvas.style.boxShadow = '0 18px 60px rgba(124,58,237,0.12), inset 0 2px 20px rgba(110,231,183,0.02)';
  }

  // helper to draw rounded rect for background
  function roundRect(ctx,x,y,w,h,r){
    if (w < 2 * r) r = w/2;
    if (h < 2 * r) r = h/2;
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  // Render equation according to orientation / mode
  function renderCurrentEquation() {
    if (!currentEq) return;
    const { displayStr, orientation, rotation } = currentEq;

    // we'll render the canonical text upright on canvas then visually transform via canvas draw transforms
    // Using drawEquationOnCanvas which takes rotation & mirrored flag
    const mirrored = orientation === 'mirrored' || (orientation === 'mixed' && Math.random() < 0.5 && currentEq._picked === 'mirrored');
    const rotationDeg = rotation || 0;
    drawEquationOnCanvas(displayStr, rotationDeg, mirrored);

    // Update HUD message
    messageEl.innerHTML = `Decode and solve: <strong>${orientation.toUpperCase()}</strong> ${rotationDeg ? `(${rotationDeg}°)` : ''}`;
  }

  // choose orientation and rotation for new eq
  function pickOrientation(pref) {
    if (pref === 'mixed') {
      const choices = ['mirrored','rotated','mirrored','rotated','rotated','mirrored']; // bias
      return pick(choices);
    }
    return pref;
  }

  // prepare a fresh equation
  function newEquation() {
    const gen = generateEquation(currentDiff);
    const orientation = pickOrientation(orientationPref === 'mixed'? 'mixed' : orientationPref);

    // rotation degrees for rotated orientation
    let rotationDeg = 0;
    if (orientation === 'rotated' || orientation === 'mixed') {
      // choose 90/180/270 (but if mirrored chosen above rotation may be 0)
      const choice = pick([0,90,180,270]);
      rotationDeg = choice;
    }

    const displayStr = canonicalToDisplay(gen.canonical, orientation);
    currentEq = {
      canonical: gen.canonical,
      answer: gen.answer,
      displayStr,
      orientation,
      rotation: rotationDeg
    };

    // tag for mixed to know actual applied visual effect (helpful for render decisions)
    if (orientation === 'mixed') currentEq._picked = Math.random() < 0.5 ? 'mirrored' : 'rotated';

    renderCurrentEquation();
  }

  // Timer utilities
  function startTimer(seconds) {
    clearTimer();
    timerRemaining = seconds;
    updateTimerDisplay();
    timer = setInterval(() => {
      if (paused) return;
      timerRemaining -= 1;
      updateTimerDisplay();
      if (audioToggle.checked) sfxTick.play();
      if (timerRemaining <= 0) {
        clearTimer();
        onTimeout();
      }
    }, 1000);
    updateBulbs(seconds, timerRemaining);
  }

  function updateTimerDisplay() {
    timerEl.textContent = timerRemaining > 0 ? `${timerRemaining}s` : '—';
    updateBulbs(null, timerRemaining);
  }

  function clearTimer(){
    if (timer) { clearInterval(timer); timer = null; }
  }

  function updateBulbs(total = null, remaining = 0) {
    // light bulbs proportionally (6 bulbs)
    const totalBulbs = bulbs.length;
    let lit = 0;
    if (total && total > 0) {
      lit = Math.round((remaining / total) * totalBulbs);
    } else if (total === null && typeof remaining === 'number') {
      // when called to update only remaining after start
      // assume perEquationTime is the base
      lit = Math.round((remaining / perEquationTime) * totalBulbs);
    } else {
      lit = 0;
    }
    bulbs.forEach((b,i) => {
      if (i < lit) b.classList.add('on'); else b.classList.remove('on');
    });
  }

  function onTimeout(){
    locked = true;
    messageEl.textContent = `Time's up! Answer was: ${currentEq.answer}`;
    if (audioToggle.checked) sfxWrong.play();
    streak = 0;
    score = Math.max(0, score - 2);
    setUI();
    // auto next (short delay)
    setTimeout(()=>{ locked=false; prepareNext(); }, 1400);
  }

  // check answer
  function checkAnswer(inputVal) {
    if (locked) return;
    let parsed;
    // accept numeric with optional decimal
    if (/^-?\d+(\.\d+)?$/.test(inputVal.trim())) {
      parsed = Number(inputVal);
    } else {
      // invalid format
      messageEl.textContent = 'Enter a numeric answer (e.g. 42 or -3.5).';
      return;
    }

    // compare with small tolerance for floats
    const correct = Math.abs(parsed - Number(currentEq.answer)) < 0.005;

    locked = true;
    if (correct) {
      // correct
      streak += 1;
      score += 10 + Math.max(0, Math.floor((timerRemaining||perEquationTime)/1)); // faster gives bonus
      messageEl.textContent = `Correct! +${10} pts`;
      if (audioToggle.checked) sfxCorrect.play();
      setUI();
      // slight highlight
      canvas.style.boxShadow = '0 20px 80px rgba(124,58,237,0.24), 0 0 40px rgba(110,231,183,0.06)';
      setTimeout(()=>{ canvas.style.boxShadow = ''; }, 600);
      setTimeout(()=>{ locked=false; prepareNext(); }, 700);
    } else {
      // wrong
      streak = 0;
      score = Math.max(0, score - 4);
      messageEl.textContent = `Wrong — answer was ${currentEq.answer}`;
      if (audioToggle.checked) sfxWrong.play();
      setUI();
      setTimeout(()=>{ locked=false; prepareNext(); }, 1000);
    }
  }

  // prepare next equation depending on mode
  function prepareNext() {
    // clear input
    input.value = '';
    // choose new equation
    newEquation();
    // set timer depending on mode
    if (currentMode === 'practice') {
      clearTimer();
      timerEl.textContent = '—';
      updateBulbs(perEquationTime,0);
    } else if (currentMode === 'timed') {
      perEquationTime = currentDiff === 'easy' ? 8 : currentDiff === 'medium' ? 12 : 18;
      startTimer(perEquationTime);
    } else if (currentMode === 'challenge') {
      // challenge: mix times and apply stricter times as streak grows
      perEquationTime = Math.max(4, (currentDiff === 'hard'? 10:12) - Math.floor(streak/3));
      startTimer(perEquationTime);
    }
    setUI();
  }

  // UI events
  submitBtn.addEventListener('click', () => {
    if (!currentEq) return;
    const v = input.value.trim();
    if (v === '') { messageEl.textContent = 'Please type an answer.'; return; }
    checkAnswer(v);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitBtn.click();
    }
  });

  skipBtn.addEventListener('click', () => {
    if (locked) return;
    messageEl.textContent = `Skipped — answer was ${currentEq.answer}`;
    streak = 0;
    score = Math.max(0, score - 2);
    setUI();
    clearTimer();
    setTimeout(()=> prepareNext(), 700);
  });

  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    messageEl.textContent = paused ? 'Paused' : 'Resumed';
    if (paused) {
      // freeze visuals
      canvas.style.filter = 'grayscale(60%) blur(0.6px)';
    } else {
      canvas.style.filter = '';
    }
  });

  restartBtn.addEventListener('click', () => {
    resetGame();
  });

  modeSelect.addEventListener('change', (e) => {
    currentMode = e.target.value;
    setUI();
    prepareNext();
  });

  diffSelect.addEventListener('change', (e) => {
    currentDiff = e.target.value;
    setUI();
    prepareNext();
  });

  // orientation radio
  Array.from(document.querySelectorAll('input[name="orientation"]')).forEach(r => {
    r.addEventListener('change', (e) => {
      orientationPref = e.target.value;
      prepareNext();
    });
  });

  // audio toggle handled by checked state

  // reset
  function resetGame() {
    score = 0; streak = 0; paused = false; locked = false;
    pauseBtn.textContent = 'Pause';
    setUI();
    prepareNext();
  }

  // init
  function init() {
    // initial picks
    currentMode = modeSelect.value;
    currentDiff = diffSelect.value;
    // set some defaults
    setUI();
    // create first eq
    prepareNext();

    // small accessibility: focus input
    setTimeout(()=> input.focus(), 300);
  }

  // Start app
  init();

})();
