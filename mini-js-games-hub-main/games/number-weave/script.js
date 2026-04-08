/* Number Weave — script.js
   - No external audio/images required (sounds generated with WebAudio).
   - Place this file as games/number-weave/script.js
*/

(() => {
  // ---------- Utilities ----------
  function $(sel, root = document) { return root.querySelector(sel); }
  function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // Geometry helpers (segment intersection)
  function orientation(a,b,c){
    return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
  }
  function onSegment(a,b,c){
    return Math.min(a.x,b.x) <= c.x + 1e-9 && c.x <= Math.max(a.x,b.x) + 1e-9 &&
           Math.min(a.y,b.y) <= c.y + 1e-9 && c.y <= Math.max(a.y,b.y) + 1e-9;
  }
  function segmentsIntersect(p1,p2,p3,p4){
    // Classic robust check
    const o1 = Math.sign(orientation(p1,p2,p3));
    const o2 = Math.sign(orientation(p1,p2,p4));
    const o3 = Math.sign(orientation(p3,p4,p1));
    const o4 = Math.sign(orientation(p3,p4,p2));
    if (o1 !== o2 && o3 !== o4) return true;
    if (o1 === 0 && onSegment(p1,p2,p3)) return true;
    if (o2 === 0 && onSegment(p1,p2,p4)) return true;
    if (o3 === 0 && onSegment(p3,p4,p1)) return true;
    if (o4 === 0 && onSegment(p3,p4,p2)) return true;
    return false;
  }

  // Check segment intersects rectangle (obstacle)
  function segmentIntersectsRect(p1,p2,rect){
    // rect: {x,y,w,h}
    const r1 = {x:rect.x, y:rect.y}, r2={x:rect.x+rect.w, y:rect.y};
    const r3 = {x:rect.x, y:rect.y+rect.h}, r4={x:rect.x+rect.w, y:rect.y+rect.h};
    return segmentsIntersect(p1,p2,r1,r2) || segmentsIntersect(p1,p2,r3,r4) ||
           segmentsIntersect(p1,p2,r1,r3) || segmentsIntersect(p1,p2,r2,r4) ||
           // or entirely inside rect?
           (p1.x >= rect.x && p1.x <= rect.x+rect.w && p1.y >= rect.y && p1.y <= rect.y+rect.h) ||
           (p2.x >= rect.x && p2.x <= rect.x+rect.w && p2.y >= rect.y && p2.y <= rect.y+rect.h);
  }

  // ---------- DOM ----------
  const board = $('#board');
  const canvas = $('#canvas');
  const pinsContainer = $('#pins');
  const startBtn = $('#start-btn');
  const pauseBtn = $('#pause-btn');
  const restartBtn = $('#restart-btn');
  const levelSelect = $('#level-select');
  const nextNumberEl = $('#next-number');
  const movesEl = $('#moves');
  const timerEl = $('#timer');
  const messageEl = $('#message');
  const undoBtn = $('#undo-btn');
  const hintBtn = $('#hint-btn');
  const clearBtn = $('#clear-btn');
  const soundToggle = $('#sound-toggle');
  const vibrateToggle = $('#vibrate-toggle');
  const bestEl = $('#best');

  // Canvas sizing
  function resizeCanvas(){
    canvas.width = board.clientWidth;
    canvas.height = board.clientHeight;
    canvas.style.width = board.clientWidth + 'px';
    canvas.style.height = board.clientHeight + 'px';
    drawAll();
  }
  window.addEventListener('resize', () => requestAnimationFrame(resizeCanvas));

  // WebAudio simple sound generator
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioCtx ? new AudioCtx() : null;
  function playTone(freq=440, time=0.08, type='sine', gain=0.15){
    if (!audioCtx || !soundToggle.checked) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + time);
    setTimeout(()=>{ try{o.stop(); o.disconnect(); g.disconnect();}catch(e){} }, time*1000 + 50);
  }
  function playSuccess(){ playTone(880,0.12,'sine',0.12); playTone(1320,0.06,'sine',0.06); }
  function playError(){ playTone(160,0.12,'sawtooth',0.12); }
  function playWin(){ playTone(1000,0.16,'triangle',0.18); playTone(1400,0.2,'sine',0.12); playTone(1800,0.06,'square',0.06); }

  // ---------- Game State ----------
  let pins = [];         // {id,num,x,y,el,connected}
  let obstacles = [];    // {x,y,w,h,el}
  let lines = [];        // [{a:pinIndex,b:pinIndex,from:{x,y},to:{x,y}}]
  let nextIndex = 1;
  let moves = 0;
  let started = false;
  let paused = false;
  let timer = 0;
  let timerId = null;
  let levelCfg = {1:6, 2:9, 3:12, 4:16};
  let ctx = canvas.getContext('2d');

  // Local storage bests
  function bestKey(level){ return `number-weave-best-l${level}`; }
  function setBest(level, val){ localStorage.setItem(bestKey(level), String(val)); }
  function getBest(level){ return Number(localStorage.getItem(bestKey(level)) || 0); }
  function updateBestDisplay(){
    bestEl.textContent = getBest(levelSelect.value) || '—';
  }

  // ---------- Board creation ----------
  function clearBoardDOM(){
    pinsContainer.innerHTML = '';
    // remove obstacles DOM too
    board.querySelectorAll('.obstacle').forEach(n => n.remove());
  }

  function createObstaclesForLevel(level, w, h){
    // Procedural obstacles: different for each level
    const out = [];
    if(level==1){
      // no obstacles for easy
      return out;
    }
    const counts = {2:2,3:3,4:5}[level] || 2;
    for(let i=0;i<counts;i++){
      const ow = rand(w*0.12, w*0.24);
      const oh = rand(h*0.08, h*0.18);
      const ox = rand(14, w - ow - 14);
      const oy = rand(14, h - oh - 14);
      out.push({x:ox,y:oy,w:ow,h:oh});
    }
    return out;
  }

  function addObstacleDOM(rect){
    const el = document.createElement('div');
    el.className = 'obstacle';
    el.style.left = rect.x + 'px';
    el.style.top = rect.y + 'px';
    el.style.width = rect.w + 'px';
    el.style.height = rect.h + 'px';
    board.appendChild(el);
    rect.el = el;
  }

  function generatePins(count){
    pins = [];
    const pad = 28;
    const w = canvas.width, h = canvas.height;
    const triesLimit = 3000;
    let tries = 0;
    for (let n = 1; n <= count; n++){
      let placed = false;
      while(!placed && tries++ < triesLimit){
        const x = rand(pad, w - pad);
        const y = rand(pad, h - pad);
        const candidate = {x,y};
        // avoid being inside any obstacle
        if (obstacles.some(r => candidate.x >= r.x-18 && candidate.x <= r.x + r.w + 18 &&
                                candidate.y >= r.y-18 && candidate.y <= r.y + r.h + 18)) continue;
        // avoid too close to other pins
        const tooClose = pins.some(p => Math.hypot(p.x - x, p.y - y) < 68);
        if (tooClose) continue;
        pins.push({id:`p${n}`, num:n, x, y, connected:false});
        placed = true;
      }
      if (tries > triesLimit) console.warn('placement tries exceeded');
    }
    // shuffle positions a little to create different layouts
    return pins;
  }

  function renderPins(){
    pins.forEach(p => {
      const el = document.createElement('button');
      el.className = 'pin';
      el.innerText = p.num;
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
      el.setAttribute('data-num', p.num);
      el.setAttribute('aria-label', `Number ${p.num}`);
      pinsContainer.appendChild(el);
      p.el = el;
      el.addEventListener('click', (e) => {
        if (!started || paused) return;
        handlePinClick(p);
      });
      // touch-friendly
      el.addEventListener('touchstart', (e) => {
        if (!started || paused) return;
        e.preventDefault();
        handlePinClick(p);
      }, {passive:false});
    });
  }

  // ---------- Drawing ----------
  function clearCanvas(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }

  function drawAll(){
    clearCanvas();
    // draw existing lines
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    lines.forEach((ln, idx) => {
      const gradient = ctx.createLinearGradient(ln.from.x, ln.from.y, ln.to.x, ln.to.y);
      gradient.addColorStop(0, 'rgba(124,58,237,0.98)');
      gradient.addColorStop(1, 'rgba(6,182,212,0.98)');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 8;
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(124,58,237,0.18)';
      ctx.beginPath();
      ctx.moveTo(ln.from.x, ln.from.y);
      ctx.lineTo(ln.to.x, ln.to.y);
      ctx.stroke();
      // subtle highlight
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(ln.from.x, ln.from.y);
      ctx.lineTo(ln.to.x, ln.to.y);
      ctx.stroke();
    });

    // draw obstacles overlay
    obstacles.forEach(ob => {
      ctx.save();
      ctx.fillStyle = 'rgba(20,20,30,0.6)';
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
      ctx.restore();
      // slight gloss
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h/2);
      ctx.restore();
    });
  }

  // ---------- Game logic ----------
  function handlePinClick(pin){
    // if click is out of order -> error
    if (pin.num !== nextIndex) {
      message(`Wrong number — tap ${nextIndex}`, 'danger');
      if (soundToggle.checked) playError();
      if (vibrateToggle.checked && navigator.vibrate) navigator.vibrate(80);
      // visual hint flash
      flashPin(pin);
      return;
    }

    // Build candidate line from prev to this
    const from = (nextIndex === 1) ? null : {x: pins[nextIndex-2].x, y: pins[nextIndex-2].y};
    const to = {x: pin.x, y: pin.y};

    // If this is not first connect: check crossing with existing lines and obstacles
    if (from){
      // check intersects any existing lines
      const candidate = {from, to};
      const crossesLine = lines.some(l => segmentsIntersect(candidate.from, candidate.to, l.from, l.to));
      const hitsObstacle = obstacles.some(o => segmentIntersectsRect(candidate.from, candidate.to, o));
      if (crossesLine || hitsObstacle){
        message('Line would overlap or hit obstacle — choose another path', 'danger');
        if (soundToggle.checked) playError();
        if (vibrateToggle.checked && navigator.vibrate) navigator.vibrate([60,30,60]);
        flashPin(pin);
        return;
      }
      // if ok, push new line
      lines.push({a: nextIndex-1, b: nextIndex, from: from, to: to});
      drawAll();
    }

    // mark pin connected
    pin.connected = true;
    pin.el.classList.add('connected');
    nextIndex++;
    moves++;
    updateHUD();

    // celebration
    if (soundToggle.checked) playSuccess();
    if (nextIndex > pins.length) {
      // won!
      endGame(true);
    } else {
      message(`Good — now tap ${nextIndex}`, 'ok');
    }
  }

  // Undo last line
  function undo(){
    if (!lines.length) return;
    const last = lines.pop();
    // mark last pin disconnected
    const bIndex = last.b - 1; // pin index
    pins[bIndex].connected = false;
    pins[bIndex].el.classList.remove('connected','hint');
    nextIndex = last.b;
    moves++;
    updateHUD();
    drawAll();
  }
  undoBtn.addEventListener('click', () => { if (!started || paused) return; undo(); });

  // Clear all connections
  clearBtn.addEventListener('click', () => {
    if (!started) return;
    lines = [];
    pins.forEach(p => p.connected = false);
    $all('.pin').forEach(el => el.classList.remove('connected','hint'));
    nextIndex = 1; moves = 0;
    updateHUD();
    drawAll();
    message('Cleared connections', 'info');
  });

  // Hint: highlight next pin
  function showHint(){
    if (!started || paused) return;
    const p = pins[nextIndex-1];
    if (!p) return;
    // animate glow
    $all('.pin').forEach(el => el.classList.remove('hint'));
    p.el.classList.add('hint');
    message(`Hint: tap ${p.num}`, 'info');
    if (soundToggle.checked) playTone(660,0.06,'sine',0.09);
    setTimeout(()=> p.el.classList.remove('hint'), 1800);
  }
  hintBtn.addEventListener('click', showHint);

  // ---------- Timer & HUD ----------
  function startTimer(){ stopTimer(); timer = 0; timerId = setInterval(()=>{ timer++; updateTimer(); }, 1000); }
  function stopTimer(){ if(timerId) { clearInterval(timerId); timerId=null; } }
  function updateTimer(){
    const mm = String(Math.floor(timer/60)).padStart(2,'0');
    const ss = String(timer%60).padStart(2,'0');
    timerEl.textContent = `${mm}:${ss}`;
  }

  function updateHUD(){
    movesEl.textContent = moves;
    nextNumberEl.textContent = (nextIndex <= pins.length) ? nextIndex : '—';
    updateBestDisplay();
    drawAll();
  }

  // Messages
  function message(txt, type='info'){
    messageEl.textContent = txt;
    messageEl.style.color = (type==='danger') ? 'var(--danger)' : (type==='ok') ? '#a7f3d0' : 'var(--muted)';
  }
  function flashPin(pin){
    pin.el.classList.add('hint');
    setTimeout(()=>pin.el.classList.remove('hint'),600);
  }

  // ---------- Start / Pause / Restart ----------
  startBtn.addEventListener('click', () => {
    if (!started) initGame();
    else if (paused) resumeGame();
  });

  pauseBtn.addEventListener('click', () => {
    if (!started) return;
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    message(paused ? 'Paused' : 'Resumed', 'info');
    if (paused) stopTimer(); else startTimer();
  });

  restartBtn.addEventListener('click', ()=> {
    if (!started) { initGame(); return; }
    buildBoard();
  });

  // End game (win or stop)
  function endGame(win){
    started = false;
    stopTimer();
    if (win){
      message('🎉 Completed! Great weaving!', 'ok');
      if (soundToggle.checked) playWin();
      // record best time (lower is better) or moves
      const level = levelSelect.value;
      const prev = getBest(level) || 0;
      const score = Math.max(1, Math.floor(10000 / (timer+1)) + Math.max(0, 200 - moves)); // composite
      if (score > prev){
        setBest(level, score);
        message('New best! 🎉', 'ok');
      }
    } else {
      message('Game stopped', 'info');
    }
    updateHUD();
  }

  // ---------- Build / Reset logic ----------
  function buildBoard(){
    // reset
    lines = [];
    moves = 0;
    nextIndex = 1;
    started = true;
    paused = false;
    pauseBtn.textContent = 'Pause';
    message('Game in progress — tap numbers in order', 'info');

    // size
    resizeCanvas();
    const w = canvas.width, h = canvas.height;
    // obstacles
    obstacles = createObstaclesForLevel(Number(levelSelect.value), w, h);
    clearBoardDOM();
    obstacles.forEach(addObstacleDOM);
    // pins
    pins = generatePins(levelCfg[levelSelect.value] || 9);
    renderPins();
    updateHUD();
    // start timer
    startTimer();
  }

  function initGame(){
    // unlock audio context by playing small sound on first user gesture
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    buildBoard();
  }

  // ---------- Initialization ----------
  function init(){
    // setup canvas size
    resizeCanvas();
    // wire some button states
    pauseBtn.disabled = false;
    restartBtn.disabled = false;
    updateBestDisplay();
    message('Choose level and press Start', 'info');

    // keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === ' '){ // space toggles pause
        e.preventDefault();
        pauseBtn.click();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)){ // undo
        e.preventDefault(); undo();
      }
    });
  }

  // attach misc listeners
  hintBtn.addEventListener('click', () => { showHint(); });
  clearBtn.addEventListener('click', () => { clearBtn.click(); }); // already attached
  undoBtn.addEventListener('click', () => { undo(); });

  // initial call
  init();

  // expose small debug
  window.NW = {
    getState: () => ({pins, lines, obstacles, nextIndex, moves, timer}),
    reset: () => buildBoard()
  };

})();
