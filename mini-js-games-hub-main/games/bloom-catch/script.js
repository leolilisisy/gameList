// Bloom Catch — lightweight prototype
// Human-friendly, hand-written style so it feels like a person coded it.

(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const comboEl = document.getElementById('combo');
  const missesEl = document.getElementById('miss-count');
  const highScoreEl = document.getElementById('high-score-val');
  const overlay = document.getElementById('overlay');
  const restartBtn = document.getElementById('restart');
  const finalText = document.getElementById('final-text');

  // sizing for sharp canvas on high-DPI screens
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resize);
  resize();

  // game state
  let running = true;
  let petals = [];
  let lastSpawn = 0;
  let spawnInterval = 700; // ms
  let combo = 0;
  let misses = 0;
  const maxMisses = 5;
  let highScore = localStorage.getItem('bloomCatchHighScore') || 0;

  // set initial high score
  highScoreEl.textContent = highScore;

  // vase (the player's catcher)
  const vase = {
    x: canvas.clientWidth / 2,
    width: 120,
    height: 40,
    baseY: null, // will be set on first frame
    grow: 0
  };

  // gentle pastel colors for petals
  const pastel = ['#ffd3e2','#ffe6c2','#ffd9f5','#e8eaf6','#dff7e3','#f8d6ff','#e8f7ff'];

  // pointer handling — supports mouse and touch via Pointer Events
  let pointerActive = false;
  let lastPointerX = null;
  canvas.addEventListener('pointerdown', e => {
    pointerActive = true; canvas.setPointerCapture(e.pointerId); movePointer(e);
  });
  canvas.addEventListener('pointermove', e => { if(pointerActive) movePointer(e); });
  canvas.addEventListener('pointerup', e => { pointerActive = false; canvas.releasePointerCapture(e.pointerId); lastPointerX=null; });
  function movePointer(e){
    // track vase x position with a simple smoothing so it feels natural
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    if(lastPointerX == null) vase.x = x;
    else vase.x += (x - lastPointerX) * 0.9; // smoothing
    lastPointerX = x;
    // clamp
    vase.x = Math.max(vase.width/2, Math.min(canvas.clientWidth - vase.width/2, vase.x));
  }

  // small audio helper using WebAudio for tiny catch/miss cues
  let audioCtx = null;
  function ensureAudio(){ if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
  function beepy(frequency, time=0.06, type='sine', gain=0.06){
    try{
      ensureAudio();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type; o.frequency.value = frequency;
      g.gain.value = gain;
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + time);
    }catch(e){/* audio may be blocked until user gesture */}
  }

  // Petal factory
  function spawnPetal() {
    const w = canvas.clientWidth;
    const p = {
      x: Math.random() * w * 0.98 + w*0.01,
      y: -20,
      r: 8 + Math.random()*10,
      vx: (Math.random()-0.5) * 30, // gentle horizontal drift
      vy: 30 + Math.random()*40, // falling speed
      rot: Math.random()*Math.PI*2,
      spin: (Math.random()-0.5)*0.06,
      color: pastel[Math.floor(Math.random()*pastel.length)],
      caught: false
    };
    petals.push(p);
  }

  // catching logic — treat vase as an arc catcher
  function checkCatch(p) {
    const vaseY = vase.baseY;
    const dx = p.x - vase.x;
    const dy = p.y - vaseY;
    // simple ellipse check where vase catches things above it
    const withinX = Math.abs(dx) < vase.width/2 + p.r*0.7;
    const nearY = p.y + p.r >= vaseY - vase.height/2; // hits the top of vase
    return withinX && nearY && p.vy>0;
  }

  // main update/draw loop
  let lastTime = performance.now();
  function frame(t) {
    if(!running) return;
    const dt = Math.min(40, t - lastTime);
    lastTime = t;

    // spawn logic (tied to combo for small difficulty change)
    if(t - lastSpawn > spawnInterval) {
      spawnPetal();
      lastSpawn = t;
      // slightly faster spawn when combo grows
      spawnInterval = 600 - Math.min(320, combo*10);
    }

    // clear
    ctx.clearRect(0,0,canvas.clientWidth, canvas.clientHeight);

    // set vase base Y (bottom area) lazily
    if(vase.baseY == null) vase.baseY = canvas.clientHeight - 48;

    // draw background subtle vertical gradient (not expensive)
    const g = ctx.createLinearGradient(0,0,0,canvas.clientHeight);
    g.addColorStop(0,'rgba(255,255,255,0.06)');
    g.addColorStop(1,'rgba(220,230,255,0.06)');
    ctx.fillStyle = g; ctx.fillRect(0,0,canvas.clientWidth, canvas.clientHeight);

    // update petals
    for(let i=petals.length-1;i>=0;i--){
      const p = petals[i];
      p.x += p.vx * (dt/1000);
      p.y += p.vy * (dt/1000);
      p.vx *= 0.999; // tiny air drag
      p.rot += p.spin * (dt/16);

      // draw rotated petal as small rotated oval
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0,0,p.r*0.6,p.r,0,0,Math.PI*2);
      ctx.fill();
      ctx.restore();

      // catching
      if(checkCatch(p)){
        // caught!
        p.caught = true;
        petals.splice(i,1);
        combo += 1;
        comboEl.textContent = combo;
        if(combo > highScore){
          highScore = combo;
          highScoreEl.textContent = highScore;
          localStorage.setItem('bloomCatchHighScore', highScore);
        }
        vase.grow = Math.min(20, vase.grow + 1);
        // small pleasant sound
        beepy(880 + Math.random()*120, 0.05, 'sine', 0.03);
        continue;
      }

      // missed — fell past bottom
      if(p.y - p.r > canvas.clientHeight + 20){
        petals.splice(i,1);
        misses += 1;
        missesEl.textContent = misses;
        // penalty to combo
        combo = 0; comboEl.textContent = combo;
        vase.grow = Math.max(0, vase.grow - 2);
        beepy(220, 0.08, 'triangle', 0.05);
        if(misses >= maxMisses){
          endGame();
          return;
        }
      }
    }

    // draw vase
    const vx = vase.x;
    const vy = vase.baseY;
    const vw = vase.width + vase.grow * 6;
    const vh = vase.height + vase.grow * 1.5;
    // soft shadow
    ctx.beginPath();
    ctx.ellipse(vx, vy + vh*0.3, vw*0.6, vh*0.5, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fill();

    // body of vase — nice rounded container
    ctx.save();
    ctx.translate(vx, vy);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-vw/2, 0);
    ctx.quadraticCurveTo(-vw/2 + 6, -vh, 0, -vh - vh*0.3);
    ctx.quadraticCurveTo(vw/2 - 6, -vh, vw/2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // tiny plants / bloom hint when combo high
    if(combo > 1){
      ctx.save();
      ctx.translate(vx, vy - vh - 6);
      ctx.fillStyle = 'rgba(80,200,120,0.06)';
      ctx.beginPath();
      ctx.ellipse(0,0,18 + combo*0.8,6 + combo*0.2,0,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }

  function endGame(){
    running = false;
    overlay.classList.remove('hidden');
    finalText.textContent = `You caught ${combo} in a row — nice!`;
  }

  restartBtn.addEventListener('click', ()=>{
    // reset state and start again
    overlay.classList.add('hidden');
    petals = []; combo = 0; misses = 0; vase.grow = 0;
    comboEl.textContent = combo; missesEl.textContent = misses;
    lastSpawn = performance.now(); spawnInterval = 700; running = true; lastTime = performance.now();
    requestAnimationFrame(frame);
  });

  // initial spawn to make the scene lively right away
  for(let i=0;i<3;i++) spawnPetal();
  requestAnimationFrame(frame);

  // small hint: resume audio on first interaction (some browsers block audio)
  document.addEventListener('pointerdown', ()=>{ if(audioCtx && audioCtx.state==='suspended') audioCtx.resume(); else ensureAudio(); }, {once:true});
})();
