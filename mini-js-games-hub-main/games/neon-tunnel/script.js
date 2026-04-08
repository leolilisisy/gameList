/* Neon Tunnel - advanced
 Uses Canvas to create glowing tunnel lanes, obstacles, player ship, sound effects.
*/

(() => {
  // Canvas setup
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', {alpha: true});
  let W = canvas.width = 800;
  let H = canvas.height = 600;

  // UI elements
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const restartBtn = document.getElementById('restartBtn');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayText = document.getElementById('overlayText');
  const overlayResume = document.getElementById('overlayResume');
  const overlayRestart = document.getElementById('overlayRestart');
  const scoreEl = document.getElementById('score');
  const highscoreEl = document.getElementById('highscore');
  const multEl = document.getElementById('mult');
  const speedRange = document.getElementById('speedRange');
  const muteToggle = document.getElementById('muteToggle');

  // Sounds (online links). If any blocked, mute toggle helps.
  const sfx = {
    crash: new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_9a8f3c1330.mp3?filename=arcade-explosion-6042.mp3'),
    pass: new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_ba5fd7b532.mp3?filename=arcade-confirmation-6053.mp3'),
    bg: new Audio('https://cdn.pixabay.com/download/audio/2021/08/18/audio_47a8ff7d11.mp3?filename=cyberpunk-background-loop-115070.mp3')
  };
  sfx.bg.loop = true;
  sfx.bg.volume = 0.35;
  sfx.pass.volume = 0.8;
  sfx.crash.volume = 0.9;

  // Game variables
  let running = false;
  let paused = false;
  let speed = parseFloat(speedRange.value); // base speed
  let frame = 0;
  let score = 0;
  let highscore = parseInt(localStorage.getItem('neonTunnelHigh') || 0);
  let multiplier = 1;
  highscoreEl.textContent = highscore;

  // Player
  const player = { x: W/2, y: H*0.7, r: 12 };

  // Obstacles array
  let obstacles = [];
  const laneCount = 5;

  // Resize handler to keep canvas crisp
  function resize() {
    const ratio = Math.min(window.innerWidth*0.9, 900);
    canvas.style.width = ratio + 'px';
    canvas.style.height = (ratio * (H/W)) + 'px';
  }
  window.addEventListener('resize', resize);
  resize();

  // Utilities
  function rand(min,max){return Math.random()*(max-min)+min}

  // Input
  let pointerX = null;
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    pointerX = (e.clientX - rect.left) * (canvas.width / rect.width);
  });
  window.addEventListener('touchmove', e => {
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    pointerX = (t.clientX - rect.left) * (canvas.width / rect.width);
  });

  window.addEventListener('keydown', (e) => {
    if(!running) return;
    if(e.key === 'ArrowLeft' || e.key.toLowerCase()==='a') player.x -= 40;
    if(e.key === 'ArrowRight' || e.key.toLowerCase()==='d') player.x += 40;
    clampPlayer();
  });

  function clampPlayer() {
    player.x = Math.max(40, Math.min(W-40, player.x));
  }

  // Tunnel rendering helpers
  function drawGlowRect(x,y,w,h, color, blur=30, alpha=0.9){
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
    ctx.restore();
  }

  // Generate obstacle
  function spawnObstacle() {
    const laneWidth = W / laneCount;
    const lane = Math.floor(rand(0,laneCount));
    const w = laneWidth * (rand(0.6, 0.95));
    const x = lane * laneWidth + (laneWidth - w) / 2;
    const h = rand(24, 80);
    obstacles.push({x, y: -h, w, h, passed:false});
  }

  // Game loop
  let lastTime = performance.now();
  function loop(now) {
    if(!running || paused) return;
    const dt = (now - lastTime) / (1000/60);
    lastTime = now;
    frame++;
    // update speed dynamic
    const gameSpeed = speed + (frame/500);
    // move player toward pointer for smooth
    if(pointerX !== null) {
      player.x += (pointerX - player.x) * 0.12;
      clampPlayer();
    }

    // spawn obstacles randomly
    if(frame % Math.max(14, Math.floor(60 - gameSpeed*3)) === 0) spawnObstacle();

    // update obstacles
    obstacles.forEach(o => {
      o.y += gameSpeed * dt * 0.9;
      // passed check
      if(!o.passed && o.y > player.y + player.r + 10){
        o.passed = true;
        score += Math.floor(10 * multiplier);
        if(!muteToggle.checked) sfx.pass.currentTime=0, sfx.pass.play().catch(()=>{});
        // increase multiplier gradually
        if(score % 100 === 0) multiplier = Math.min(5, multiplier + 0.2);
      }
    });
    // remove offscreen
    obstacles = obstacles.filter(o => o.y < H + 120);

    // collision detection
    for(const o of obstacles){
      if(rectCircleColliding(o, player)){
        endGame();
        return;
      }
    }

    // draw
    render(gameSpeed);
    // update UI
    scoreEl.textContent = score;
    multEl.textContent = multiplier.toFixed(1) + 'x';
    // next frame
    requestAnimationFrame(loop);
  }

  function rectCircleColliding(rect, circle) {
    const distX = Math.abs(circle.x - rect.x - rect.w/2);
    const distY = Math.abs(circle.y - rect.y - rect.h/2);
    if (distX > (rect.w/2 + circle.r)) return false;
    if (distY > (rect.h/2 + circle.r)) return false;
    if (distX <= (rect.w/2)) return true;
    if (distY <= (rect.h/2)) return true;
    const dx = distX - rect.w/2;
    const dy = distY - rect.h/2;
    return (dx*dx + dy*dy <= (circle.r*circle.r));
  }

  // render scene
  function render(speedVal) {
    // clear
    ctx.clearRect(0,0,W,H);
    // background gradient stripes - give tunnel movement
    const bands = 12;
    for(let i=0;i<bands;i++){
      const t = ((frame * 0.6) + i*40) % (bands*40);
      const shrink = 1 - (i/bands)*0.8;
      const bw = W * shrink;
      const x = (W - bw)/2;
      const y = i * (H / bands) - (frame % 40);
      const color = i%2===0 ? 'rgba(0,255,230,0.03)' : 'rgba(255,0,200,0.02)';
      ctx.fillStyle = color;
      ctx.fillRect(x, y, bw, H / bands + 4);
    }

    // road center glow
    for(let i=0;i<6;i++){
      const alpha = 0.06 + i*0.02;
      drawGlowRect(0, i*12, W, H, `rgba(0,160,255,${alpha})`, 30 + i*4, alpha);
    }

    // neon vertical laser lines
    const lines = 10;
    for(let i=0;i<lines;i++){
      const sx = (i/lines)*W + (Math.sin((frame+(i*20))/50) * 30);
      ctx.beginPath();
      ctx.moveTo(sx,0);
      ctx.lineTo(sx,H);
      ctx.strokeStyle = i%2 ? 'rgba(255,0,200,0.04)' : 'rgba(0,255,230,0.04)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // obstacles
    obstacles.forEach(o => {
      // outer glow
      ctx.save();
      ctx.shadowBlur = 28;
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.fillStyle = '#000';
      ctx.fillRect(o.x-6, o.y-6, o.w+12, o.h+12);
      ctx.restore();

      // inner neon edge
      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = 'rgba(255,0,200,0.9)';
      ctx.fillStyle = 'rgba(20,20,20,1)';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      // small glowing rim
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(0,255,230,0.08)';
      ctx.fillRect(o.x-2, o.y-2, o.w+4, 4);
      ctx.restore();
    });

    // player ship glowing
    ctx.save();
    ctx.translate(player.x, player.y);
    // glow
    ctx.beginPath();
    ctx.fillStyle = 'rgba(0,255,200,0.06)';
    ctx.shadowBlur = 40;
    ctx.shadowColor = 'rgba(0,255,200,0.9)';
    ctx.arc(0,0,28,0,Math.PI*2);
    ctx.fill();
    // ship body
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.moveTo(-14,12);
    ctx.lineTo(14,12);
    ctx.lineTo(0,-18);
    ctx.closePath();
    ctx.fill();
    // center core
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,20,200,0.9)';
    ctx.arc(0,0,6,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    // HUD glow effect across bottom
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(0, H - 60, W, 60);
    ctx.restore();
  }

  // start / pause / resume / restart
  function startGame() {
    if(!running){
      running = true;
      paused = false;
      frame = 0; score = 0; multiplier = 1; obstacles = [];
      if(!muteToggle.checked) sfx.bg.play().catch(()=>{});
      overlay.classList.add('hidden');
      lastTime = performance.now();
      requestAnimationFrame(loop);
    }
  }

  function pauseGame() {
    if(!running) return;
    paused = true;
    overlay.classList.remove('hidden');
    overlayTitle.textContent = 'Paused';
    overlayText.textContent = 'Game is paused';
    if(!muteToggle.checked) sfx.bg.pause();
  }

  function resumeGame() {
    if(!running) return;
    paused = false;
    overlay.classList.add('hidden');
    if(!muteToggle.checked) sfx.bg.play().catch(()=>{});
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function endGame() {
    running = false;
    paused = false;
    if(!muteToggle.checked) {
      sfx.bg.pause();
      sfx.crash.currentTime = 0; sfx.crash.play().catch(()=>{});
    }
    overlay.classList.remove('hidden');
    overlayTitle.textContent = 'Crashed';
    overlayText.textContent = `Score: ${score}`;
    // update highscore
    if(score > highscore) {
      highscore = score;
      localStorage.setItem('neonTunnelHigh', highscore);
      highscoreEl.textContent = highscore;
    }
    // show restart & overlay options
  }

  function restartGame() {
    running = false; paused = false;
    obstacles = []; frame = 0; score = 0; multiplier = 1;
    if(!muteToggle.checked) { sfx.bg.pause(); sfx.bg.currentTime = 0; }
    overlay.classList.add('hidden');
    scoreEl.textContent = score;
    requestAnimationFrame(loop);
    startGame();
  }

  // event wiring
  startBtn.addEventListener('click', () => { startGame(); });
  pauseBtn.addEventListener('click', () => { pauseGame(); });
  resumeBtn.addEventListener('click', () => { resumeGame(); });
  restartBtn.addEventListener('click', () => { restartGame(); });

  overlayResume.addEventListener('click', () => { resumeGame(); });
  overlayRestart.addEventListener('click', () => { restartGame(); });

  speedRange.addEventListener('input', (e) => {
    speed = parseFloat(e.target.value);
  });

  muteToggle.addEventListener('change', () => {
    if(muteToggle.checked){
      for(const k in sfx) sfx[k].pause();
    } else {
      if(running && !paused) sfx.bg.play().catch(()=>{});
    }
  });

  // track main loop scoring increments
  setInterval(() => {
    if(running && !paused){
      score += Math.floor(1 * multiplier);
    }
  }, 500);

  // initial draw frame
  render(0);

  // expose for debugging (optional)
  window.neonTunnel = { startGame, pauseGame, resumeGame, restartGame };

})();
