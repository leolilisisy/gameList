/* Music Bubble Pop — Advanced
   - WebAudio generated notes
   - spawn tuning, difficulty, pause/play, restart
   - score, combo, highscore (localStorage)
   - no external sound files required
*/

(() => {
  const playArea = document.getElementById('playArea');
  const scoreEl = document.getElementById('score');
  const comboEl = document.getElementById('combo');
  const highEl = document.getElementById('highscore');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const volumeInput = document.getElementById('volume');
  const difficultySel = document.getElementById('difficulty');
  const spawnRateInput = document.getElementById('spawnRate');
  const bgToggle = document.getElementById('bgToggle');
  const HIGHSCORE_KEY = 'musicBubbleHigh';

  // Audio setup
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  let masterGain = null;
  let bgOsc = null;
  let running = false;
  let spawnInterval = null;

  // Gameplay variables
  let score = 0, combo = 0, highscore = Number(localStorage.getItem(HIGHSCORE_KEY) || 0);
  let bubbleIdCounter = 0;
  let lastPopTime = 0;

  highEl.textContent = highscore;

  // Scale: use pentatonic for pleasant sound
  const pentatonic = [0, 2, 4, 7, 9]; // relative semitones
  const baseFreq = 220; // A3

  // utilities
  function now() { return performance.now(); }
  function rand(min,max){ return Math.random()*(max-min)+min; }
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }

  // initialize audio context on first user interaction (mobile policy)
  function ensureAudio(){
    if (!audioCtx) {
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = Number(volumeInput.value || 0.8);
      masterGain.connect(audioCtx.destination);
    }
  }

  // play a short pluck note with frequency
  function playNote(freq, type='sine', sustain=0.18) {
    ensureAudio();
    const t0 = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0.0001;

    osc.connect(gain);
    gain.connect(masterGain);

    const attack = 0.001;
    const decay = sustain * 0.9;
    gain.gain.exponentialRampToValueAtTime(1.0, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);

    osc.start(t0);
    osc.stop(t0 + attack + decay + 0.02);
  }

  // pop effect (white noise short)
  function playPop() {
    ensureAudio();
    const bufferSize = audioCtx.sampleRate * 0.05;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * (1 - i/bufferSize);
    const noise = audioCtx.createBufferSource();
    const g = audioCtx.createGain();
    noise.buffer = buffer;
    g.gain.value = 0.6;
    noise.connect(g);
    g.connect(masterGain);
    noise.start();
    setTimeout(()=>noise.stop(), 80);
  }

  // background ambient oscillator
  function startBg() {
    ensureAudio();
    if (bgOsc) return;
    bgOsc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    bgOsc.type = 'sine';
    bgOsc.frequency.value = 55;
    g.gain.value = 0.03;
    bgOsc.connect(g);
    g.connect(masterGain);
    bgOsc.start();
  }
  function stopBg(){
    if (bgOsc) { try { bgOsc.stop(); } catch(e){} bgOsc = null; }
  }

  // scoring
  function setScore(n){ score=n; scoreEl.textContent = score; if (score>highscore){ highscore=score; highEl.textContent=highscore; localStorage.setItem(HIGHSCORE_KEY, highscore); } }
  function addScore(n){ setScore(score + n); }

  // bubble creation
  function makeBubble() {
    if (!running) return;
    const rect = playArea.getBoundingClientRect();
    const size = rand(48,110) * (difficultySel.value==='hard' ? 0.85 : difficultySel.value==='easy' ? 1.12 : 1);
    const x = rand(8, rect.width - size - 8);
    const y = rect.height + 60; // start below view
    const id = `bubble-${++bubbleIdCounter}`;
    const $b = document.createElement('div');
    $b.className = 'bubble';
    $b.id = id;
    // pick band low/mid/high based on vertical position probability
    const bandRoll = Math.random();
    const band = bandRoll < 0.36 ? 'low' : bandRoll < 0.72 ? 'mid' : 'high';
    $b.classList.add(band);
    $b.style.width = `${size}px`;
    $b.style.height = `${size}px`;
    // position (absolute)
    $b.style.left = `${x}px`;
    $b.style.top = `${y}px`;
    // label (note name simplified)
    const octaveFactor = band==='low' ? 0.5 : band==='mid' ? 1 : 2;
    const noteIndex = pentatonic[Math.floor(Math.random()*pentatonic.length)];
    // compute frequency
    const semitone = noteIndex + Math.round(rand(-2,4));
    const freq = baseFreq * octaveFactor * Math.pow(2, semitone/12);
    $b.dataset.freq = freq;
    $b.dataset.band = band;

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = ''; // aesthetic: no text, can add shapes later
    $b.appendChild(label);

    // small ring glow pseudo by box-shadow and ::after manipulated by style
    $b.style.setProperty('--size', `${size}px`);
    playArea.appendChild($b);

    // floating animation (manual using requestAnimationFrame to allow pause)
    const speed = rand(0.35, 1.1) * (band==='high' ? 1.3 : band==='low' ? 0.6 : 0.9);
    const horizWave = rand(-20, 20);
    const startTime = now();
    $b._tick = function(t){
      const dt = (t - startTime) / 1000;
      const ny = y - dt * 60 * speed * (difficultySel.value === 'hard' ? 1.7 : 1);
      $b.style.top = ny + 'px';
      const hx = x + Math.sin(dt*1.2) * horizWave;
      $b.style.left = hx + 'px';
      // subtle pulse
      const pulse = 1 + 0.03 * Math.sin(dt*4 + (x%20));
      $b.style.transform = `scale(${pulse})`;
      // remove if above view
      if (ny + size < -80) {
        $b.remove();
        return false;
      }
      return true;
    };

    // click/tap handler
    $b.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      // visual pop
      $b.style.animation = 'pop 320ms ease forwards';
      // particles
      spawnParticles($b, ev.clientX - rect.left, ev.clientY - rect.top, band);
      // play note
      const t = Number($b.dataset.freq) || freq;
      // different oscillator types for variety
      playNote(t, band==='low' ? 'sawtooth' : band==='mid' ? 'triangle' : 'sine', 0.14);
      // pop sound
      playPop();
      // scoring: smaller = more points; combo increases if rapid pops
      const sizeNum = parseFloat(size);
      const base = Math.round( Math.max(5, (140 - sizeNum) / 2 ) );
      const timeSinceLast = now() - lastPopTime;
      lastPopTime = now();
      if (timeSinceLast < 900) { combo++; } else { combo = 1; }
      comboEl.textContent = combo;
      addScore(base * combo);
      // remove element after animation
      setTimeout(()=> $b.remove(), 260);
    });

    // attach to animation loop list
    activeBubbles.push($b);
  }

  // particles small colorful dots
  function spawnParticles(bubbleEl, x, y, band) {
    const rect = playArea.getBoundingClientRect();
    for (let i=0;i<8;i++){
      const p = document.createElement('div');
      p.className = 'particle';
      const hue = band === 'low' ? rand(0,20) : band==='mid' ? rand(160,210) : rand(260,320);
      p.style.background = `hsl(${hue} ${rand(60,80)}% ${rand(50,65)}%)`;
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      playArea.appendChild(p);
      const vx = rand(-120,120);
      const vy = rand(-220,-30);
      const life = rand(420,860);
      const start = now();
      (function animatePart(){
        const t = now();
        const dt = (t - start);
        const progress = dt / life;
        if (progress >= 1) { p.remove(); return; }
        p.style.transform = `translate(${vx * progress}px, ${vy * progress}px) scale(${1 - progress})`;
        p.style.opacity = String(1 - progress);
        requestAnimationFrame(animatePart);
      })();
    }
  }

  // animation main loop
  let activeBubbles = [];
  let rafId = null;
  function loop(t){
    // update bubbles
    activeBubbles = activeBubbles.filter(b => {
      if (!b.isConnected) return false;
      const alive = b._tick(t);
      return alive;
    });
    rafId = requestAnimationFrame(loop);
  }

  // spawn controller
  function startSpawning(){
    if (spawnInterval) clearInterval(spawnInterval);
    const rate = Number(spawnRateInput.value) || 900;
    spawnInterval = setInterval(() => {
      // spawn 1-2 bubbles depending on difficulty
      const spawnCount = difficultySel.value === 'hard' ? (Math.random()<0.6 ? 2:1) : 1;
      for (let i=0;i<spawnCount;i++) makeBubble();
    }, clamp(rate, 220, 3000));
  }
  function stopSpawning(){ if (spawnInterval) { clearInterval(spawnInterval); spawnInterval = null; } }

  // control handlers
  playPauseBtn.addEventListener('click', async () => {
    if (!running) {
      await startGame();
    } else {
      pauseGame();
    }
  });
  restartBtn.addEventListener('click', () => {
    restartGame();
  });
  volumeInput.addEventListener('input', (e) => {
    if (!masterGain) ensureAudio();
    masterGain.gain.value = Number(e.target.value);
  });
  difficultySel.addEventListener('change', () => {
    // difficulty affects spawn speed & bubble speed; restart for smoother experience
    restartGame();
  });
  spawnRateInput.addEventListener('change', () => {
    if (running) startSpawning();
  });
  bgToggle.addEventListener('change', () => {
    if (bgToggle.checked) startBg(); else stopBg();
  });

  // start/pause/restart logic
  async function startGame(){
    ensureAudio();
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    running = true;
    playPauseBtn.textContent = 'Pause';
    // hide hint
    const hint = document.getElementById('hint'); if (hint) hint.style.display = 'none';
    startSpawning();
    if (!rafId) rafId = requestAnimationFrame(loop);
  }
  function pauseGame(){
    running = false;
    playPauseBtn.textContent = 'Play';
    stopSpawning();
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }
  function restartGame(){
    // remove all bubbles and particles
    activeBubbles.forEach(b=>b.remove());
    document.querySelectorAll('.particle').forEach(p=>p.remove());
    activeBubbles = [];
    setScore(0); combo=0; comboEl.textContent=0;
    lastPopTime = 0;
    bubbleIdCounter = 0;
    // restart spawning if running
    if (running) { stopSpawning(); startSpawning(); }
  }

  // keyboard shortcuts
  playArea.addEventListener('keydown', (e)=> {
    if (e.code === 'Space') {
      e.preventDefault();
      playPauseBtn.click();
    } else if (e.key === 'r') {
      restartBtn.click();
    }
  });

  // handle focus to ensure keyboard works
  playArea.addEventListener('pointerdown', ()=> playArea.focus());

  // start with "paused" state; user must click to begin to satisfy mobile audio policy
  (function init(){
    score = 0; combo = 0;
    scoreEl.textContent = score; comboEl.textContent = combo;
    highEl.textContent = highscore;
    // Visual tips: spawn a few bubbles as preview (non-interactive) but user must click play to generate audio
    for (let i=0;i<6;i++){
      setTimeout(() => {
        // quick preview small
        makeBubble();
      }, i*120);
    }
    // stop spawning after preview
    setTimeout(()=> { activeBubbles.forEach(b=>b.remove()); activeBubbles = []; }, 2200);
  })();

  // Expose restart externally if needed
  window.musicBubblePop = { startGame, pauseGame, restartGame, setVolume: v => { volumeInput.value = v; if (masterGain) masterGain.gain.value = v; } };

})();
