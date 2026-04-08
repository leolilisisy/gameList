/* Light Bloom Painter
   - Canvas-based particle bloom painting
   - WebAudio generated ambient + stroke sounds (no external files required)
   - Touch & mouse support
   - Settings persist in localStorage
*/

(() => {
  // Elements
  const canvas = document.getElementById('paintCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const playPauseBtn = document.getElementById('playPause');
  const restartBtn = document.getElementById('restartBtn');
  const saveBtn = document.getElementById('saveBtn');
  const sizeRange = document.getElementById('sizeRange');
  const speedRange = document.getElementById('speedRange');
  const glowRange = document.getElementById('glowRange');
  const trailRange = document.getElementById('trailRange');
  const densityRange = document.getElementById('densityRange');
  const colorPicker = document.getElementById('colorPicker');
  const glowColor = document.getElementById('glowColor');
  const audioToggle = document.getElementById('audioToggle');
  const invertToggle = document.getElementById('invertToggle');
  const clearBtn = document.getElementById('clearBtn');
  const hint = document.getElementById('hint');
  const showUI = document.getElementById('showUI');

  // labels
  const sizeLabel = document.getElementById('sizeLabel');
  const speedLabel = document.getElementById('speedLabel');
  const glowLabel = document.getElementById('glowLabel');
  const trailLabel = document.getElementById('trailLabel');
  const densityLabel = document.getElementById('densityLabel');

  // state & settings
  const storageKey = 'light-bloom-settings-v1';
  const defaultSettings = {
    size: 20,
    speed: 2,
    glow: 0.9,
    trail: 0.12,
    density: 1,
    color: '#66ccff',
    glowColor: '#88ddff',
    audio: true,
    invert: false,
    showUI: true
  };

  let settings = Object.assign({}, defaultSettings, JSON.parse(localStorage.getItem(storageKey) || '{}'));

  // apply initial UI values
  sizeRange.value = settings.size;
  speedRange.value = settings.speed;
  glowRange.value = settings.glow;
  trailRange.value = settings.trail;
  densityRange.value = settings.density;
  colorPicker.value = settings.color;
  glowColor.value = settings.glowColor;
  audioToggle.checked = settings.audio;
  invertToggle.checked = settings.invert;
  showUI.checked = settings.showUI;

  // label update
  const updateLabels = () => {
    sizeLabel.textContent = sizeRange.value;
    speedLabel.textContent = speedRange.value;
    glowLabel.textContent = Number(glowRange.value).toFixed(2);
    trailLabel.textContent = Number(trailRange.value).toFixed(2);
    densityLabel.textContent = Number(densityRange.value).toFixed(2);
  };
  updateLabels();

  // canvas resize
  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // set optional background
    drawBackground();
  }

  function drawBackground() {
    // simple vignette / dark background
    if (settings.invert) {
      canvas.style.background = 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.02), rgba(255,255,255,0.01)), #ffffff';
    } else {
      canvas.style.background = 'transparent';
    }
  }

  window.addEventListener('resize', throttle(resize, 120));
  resize();

  // Offscreen buffer for bloom effect
  const buffer = document.createElement('canvas');
  const bctx = buffer.getContext('2d', { alpha: true });
  function resizeBuffer() {
    buffer.width = canvas.width;
    buffer.height = canvas.height;
    bctx.setTransform(1,0,0,1,0,0);
  }
  resizeBuffer();

  // particles
  let particles = [];
  let running = true;

  // audio setup (WebAudio)
  const audioCtx = (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;
  let masterGain, ambientOsc, ambientGain, strokeGain;

  function initAudio() {
    if (!audioCtx) return;
    masterGain = audioCtx.createGain(); masterGain.gain.value = 0.6; masterGain.connect(audioCtx.destination);
    // ambient drone
    ambientOsc = audioCtx.createOscillator();
    ambientGain = audioCtx.createGain();
    ambientOsc.type = 'sine';
    ambientOsc.frequency.value = 120;
    ambientGain.gain.value = 0.02; // subtle
    ambientOsc.connect(ambientGain);
    ambientGain.connect(masterGain);
    ambientOsc.start(0);

    // stroke sound gain (per brush event)
    strokeGain = audioCtx.createGain();
    strokeGain.gain.value = 0.0;
    strokeGain.connect(masterGain);
  }

  // call once on first user interaction if audioCtx exists but suspended
  function ensureAudio() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(()=>{/* ignore */});
    }
  }

  if (audioCtx) initAudio();

  // helper: play stroke sound via oscillator with short envelope
  function playStrokeSound(freq = 600, duration = 0.08, volume = 0.02) {
    if (!audioCtx || !settings.audio) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(masterGain);
    const now = audioCtx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    o.start(now);
    o.stop(now + duration + 0.02);
  }

  // UI interactivity — change settings persistently
  function persist() {
    settings.size = Number(sizeRange.value);
    settings.speed = Number(speedRange.value);
    settings.glow = Number(glowRange.value);
    settings.trail = Number(trailRange.value);
    settings.density = Number(densityRange.value);
    settings.color = colorPicker.value;
    settings.glowColor = glowColor.value;
    settings.audio = audioToggle.checked;
    settings.invert = invertToggle.checked;
    settings.showUI = showUI.checked;
    localStorage.setItem(storageKey, JSON.stringify(settings));
    updateLabels();
    drawBackground();
  }

  // attach UI events
  [sizeRange, speedRange, glowRange, trailRange, densityRange, colorPicker, glowColor, audioToggle, invertToggle, showUI].forEach(el => {
    el.addEventListener('input', () => { persist(); });
    el.addEventListener('change', () => { persist(); });
  });

  clearBtn.addEventListener('click', () => {
    particles = [];
    clearCanvas();
  });

  restartBtn.addEventListener('click', () => {
    particles = [];
    clearCanvas();
  });

  playPauseBtn.addEventListener('click', () => {
    running = !running;
    playPauseBtn.textContent = running ? 'Pause' : 'Resume';
    if (running) { then = performance.now(); requestAnim(); }
  });

  saveBtn.addEventListener('click', () => {
    // create flattened image with extra glow
    const link = document.createElement('a');
    link.download = `light-bloom-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // painting logic: pointer events
  let pointerDown = false;
  let pointerId = null;
  let last = null;

  // multi-touch: if two touches, treat as move-only if user holds shift-like gesture
  let ignorePainting = false;

  function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    if (e.touches && e.touches[0]) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left), y: (t.clientY - rect.top) };
    } else {
      return { x: (e.clientX - rect.left), y: (e.clientY - rect.top) };
    }
  }

  // pointer start
  function pointerStart(e) {
    ensureAudio();
    if (e.touches && e.touches.length > 1) {
      ignorePainting = true;
      return;
    } else {
      ignorePainting = false;
    }
    pointerDown = true;
    last = getPointerPos(e);
    if (!ignorePainting) emitParticles(last.x, last.y, 1.0);
    // play click sound quickly
    playStrokeSound(650, 0.06, 0.02);
    e.preventDefault();
  }

  function pointerMove(e) {
    if (!pointerDown) return;
    if (ignorePainting) return;
    const pos = getPointerPos(e);
    const dx = pos.x - last.x;
    const dy = pos.y - last.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const steps = Math.max(1, Math.floor(dist / (4 / settings.density)));
    for (let i=0;i<steps;i++){
      const t = (i+1)/steps;
      const x = last.x + dx * t;
      const y = last.y + dy * t;
      emitParticles(x,y, t);
    }
    last = pos;
    e.preventDefault();
  }

  function pointerEnd(e) {
    pointerDown = false;
    pointerId = null;
    last = null;
    ignorePainting = false;
    e && e.preventDefault();
  }

  // attach input handlers
  canvas.addEventListener('mousedown', pointerStart);
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerEnd);

  canvas.addEventListener('touchstart', pointerStart, {passive:false});
  canvas.addEventListener('touchmove', pointerMove, {passive:false});
  canvas.addEventListener('touchend', pointerEnd, {passive:false});
  canvas.addEventListener('touchcancel', pointerEnd, {passive:false});

  // generate particles
  function emitParticles(x, y, intensity = 1) {
    const baseCount = Math.round(6 * settings.density * intensity);
    for (let i=0;i<baseCount;i++){
      const angle = Math.random()*Math.PI*2;
      const speed = (Math.random() * 0.6 + 0.2) * settings.speed * (0.6 + Math.random()*1.4);
      particles.push({
        x, y,
        vx: Math.cos(angle)*speed * (0.4 + Math.random()*1.6),
        vy: Math.sin(angle)*speed * (0.4 + Math.random()*1.6),
        life: 1,
        decay: (0.02 + Math.random()*0.04) * (1.0 - settings.trail),
        size: Math.random()*(settings.size*.6) + settings.size*0.4,
        color: randomTint(settings.color, settings.glowColor),
        created: performance.now()
      });
    }
  }

  // small utility to mix color & glow for visual variety
  function randomTint(baseHex, glowHex) {
    // returns rgba string used for drawing, slight randomization
    const base = hexToRgb(baseHex);
    const glow = hexToRgb(glowHex);
    const r = Math.round((base.r * 0.6 + glow.r * 0.4) + (Math.random()*24-12));
    const g = Math.round((base.g * 0.6 + glow.g * 0.4) + (Math.random()*24-12));
    const b = Math.round((base.b * 0.6 + glow.b * 0.4) + (Math.random()*24-12));
    return `rgba(${clamp(r,0,255)},${clamp(g,0,255)},${clamp(b,0,255)},1)`;
  }

  function hexToRgb(hex) {
    const h = hex.replace('#','');
    return { r: parseInt(h.substring(0,2),16), g: parseInt(h.substring(2,4),16), b: parseInt(h.substring(4,6),16) };
  }
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

  // draw loop
  let then = performance.now();
  function step(now) {
    const dt = Math.min(40, now - then) / 16.666;
    then = now;
    if (!running) { requestAnim(); return; }

    // fade background (trail)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(5,8,10,${settings.trail})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // draw particles onto buffer for extra blur
    bctx.clearRect(0,0,buffer.width,buffer.height);
    bctx.globalAlpha = 1;
    for (let i=0;i<particles.length;i++){
      const p = particles[i];
      // update
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= (0.995);
      p.vy *= (0.995);
      p.life -= p.decay * dt * 0.95;
      // small upward drift to look airy
      p.vy -= 0.01 * dt;

      if (p.life <= 0) { particles.splice(i,1); i--; continue; }

      // draw soft particle on buffer
      const alpha = Math.pow(p.life, 1.1) * 0.9;
      const size = p.size * (1 + (1 - p.life)*0.6);
      bctx.beginPath();
      bctx.fillStyle = p.color;
      bctx.globalAlpha = alpha;
      bctx.arc(p.x, p.y, size * 0.5, 0, Math.PI*2);
      bctx.fill();
    }

    // apply blur & glow: draw the buffer multiple times with composite operations to create bloom
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = settings.glow; // glow intensity
    // slightly blur effect by scaling and drawing multiple times (cheap)
    ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
    // extra passes for intense glow
    if (settings.glow > 1.2) {
      ctx.globalAlpha = Math.min(0.65, settings.glow * 0.6);
      ctx.drawImage(buffer, -1.5, -1.5, canvas.width + 3, canvas.height + 3);
      ctx.drawImage(buffer, 1.5, 1.5, canvas.width - 3, canvas.height - 3);
    }

    // Draw crisp particle centers
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'lighter';
    for (let i=0;i<particles.length;i++){
      const p = particles[i];
      const lifeAlpha = Math.pow(p.life, 1.4);
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85 * lifeAlpha;
      ctx.arc(p.x, p.y, Math.max(1, p.size*0.35), 0, Math.PI*2);
      ctx.fill();
    }

    // subtle UI hint fade
    if (hint && !pointerDown) {
      hint.style.opacity = Math.max(0.08, Number(hint.style.opacity || 1) * 0.99);
    } else if (hint && pointerDown) {
      hint.style.opacity = 0;
    }

    // audio modulation: change ambient frequency slightly by particle count
    if (audioCtx && ambientOsc && settings.audio) {
      const targetFreq = 110 + Math.min(140, particles.length * 0.6);
      ambientOsc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.12);
      ambientGain.gain.setTargetAtTime(0.02 + Math.min(0.06, particles.length * 0.0008), audioCtx.currentTime, 0.06);
    }

    requestAnim();
  }

  function requestAnim() { window.requestAnimationFrame(step); }
  requestAnim();

  // helper: simple throttle
  function throttle(fn, wait=80){ let t=0; return function(){ const now = Date.now(); if(now - t > wait){ t = now; fn.apply(this, arguments); } } }

  // clear canvas and buffer completely
  function clearCanvas() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    bctx.clearRect(0,0,buffer.width,buffer.height);
  }

  // save & restore buffer on resize
  window.addEventListener('resize', throttle(()=>{ resizeBuffer(); }, 120));

  // minimal animation loop for ticking
  // click sound on heavy strokes
  let lastSoundTick = 0;
  setInterval(()=> {
    if (pointerDown && settings.audio) {
      const now = performance.now();
      if (now - lastSoundTick > 100) {
        playStrokeSound(500 + Math.random()*600, 0.06, 0.02);
        lastSoundTick = now;
      }
    }
  }, 80);

  // helper: ensure offscreen buffer matches scale
  function syncBuffer() {
    buffer.width = canvas.width;
    buffer.height = canvas.height;
  }
  syncBuffer();

  // touch gestures: two-finger clears? (already handled by ignorePainting)
  // saving persistent settings at intervals
  setInterval(()=> localStorage.setItem(storageKey, JSON.stringify(settings)), 2000);

  // small utility functions
  function rand(min, max) { return Math.random()*(max-min)+min; }

  // initial clear
  clearCanvas();

  // ensure the canvas uses full container on load
  function fitCanvasToContainer() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    buffer.width = canvas.width;
    buffer.height = canvas.height;
  }

  // run after layout
  setTimeout(()=>{ fitCanvasToContainer(); resizeBuffer(); }, 60);

  // make sure settings are reflected in UI
  function applySettingsToUI(){
    sizeRange.value = settings.size;
    speedRange.value = settings.speed;
    glowRange.value = settings.glow;
    trailRange.value = settings.trail;
    densityRange.value = settings.density;
    colorPicker.value = settings.color;
    glowColor.value = settings.glowColor;
    audioToggle.checked = settings.audio;
    invertToggle.checked = settings.invert;
    showUI.checked = settings.showUI;
    updateLabels();
  }
  applySettingsToUI();

  // helper: when user interacts first time, resume audio if needed
  document.addEventListener('pointerdown', () => {
    ensureAudio();
  }, { once:true });

  // expose a short API to hub when opened via Play
  window.LIGHT_BLOOM = {
    clear: () => { particles=[]; clearCanvas(); },
    pause: () => { running=false; playPauseBtn.textContent='Resume'; },
    resume: () => { running=true; playPauseBtn.textContent='Pause'; then=performance.now(); requestAnim(); },
    getSettings: () => ({...settings})
  };

  // small helpers used above that need to be in scope
  function clamp(v,a,b){return Math.max(a, Math.min(b, v));}
})();
