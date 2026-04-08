// Arrow Dodge (games/arrow-dodge/script.js)
// Author: ChatGPT (adapt to taste)
// Game design: dodge arrows, shield powerup, waves, sounds, pause/resume, restart

(() => {
  // --- Asset URLs (online) ---
  const ASSETS = {
    arrowSvg: "https://upload.wikimedia.org/wikipedia/commons/2/27/Arrow_east.svg",
    playerSvg: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Joystick.svg",
    shieldSvg: "https://upload.wikimedia.org/wikipedia/commons/2/24/Shield_icon.svg",
    // Sounds from Google Actions public sounds
    sfxHit: "https://actions.google.com/sounds/v1/impacts/crash.ogg",
    sfxShield: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg",
    sfxArrow: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
    bgm: "https://actions.google.com/sounds/v1/ambiences/air_hum.ogg", // ambient loop
  };

  // --- DOM ---
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resumeBtn = document.getElementById("resumeBtn");
  const restartBtn = document.getElementById("restartBtn");
  const overlay = document.getElementById("overlay");
  const overlayMessage = document.getElementById("overlayMessage");
  const overlayStart = document.getElementById("overlayStart");
  const overlayRestart = document.getElementById("overlayRestart");
  const scoreEl = document.getElementById("score");
  const highScoreEl = document.getElementById("highScore");
  const waveEl = document.getElementById("wave");
  const livesEl = document.getElementById("lives");
  const shieldStatus = document.getElementById("shieldStatus");
  const soundToggle = document.getElementById("soundToggle");

  let W = canvas.width, H = canvas.height;

  // --- Game state ---
  let gameRunning = false;
  let paused = false;
  let lastTime = 0;
  let spawnTimer = 0;
  let spawnInterval = 1200;
  let difficultyTimer = 0;
  let difficultyInterval = 8000;
  let score = 0;
  let wave = 0;
  let highScore = parseInt(localStorage.getItem("arrowDodgeHigh") || "0", 10);
  let lives = 1;
  let shield = false;
  highScoreEl.textContent = highScore;

  // Entities
  const player = {
    x: W/2,
    y: H/2,
    r: 22,
    speed: 4.2,
    vx: 0, vy: 0,
    glow: true
  };
  const arrows = []; // moving obstacles
  const powerups = [];

  // Sounds
  const audio = {
    hit: new Audio(ASSETS.sfxHit),
    shield: new Audio(ASSETS.sfxShield),
    arrow: new Audio(ASSETS.sfxArrow),
    bgm: new Audio(ASSETS.bgm)
  };
  audio.bgm.loop = true;
  audio.bgm.volume = 0.08;
  audio.hit.volume = 0.6;
  audio.shield.volume = 0.6;
  audio.arrow.volume = 0.25;

  function playSound(s) {
    if (!soundToggle.checked) return;
    const a = audio[s];
    if (!a) return;
    try {
      a.currentTime = 0;
      a.play();
    } catch(e) { /* autoplay restrictions fallback */ }
  }

  // Keyboard
  const keys = {};
  window.addEventListener("keydown", e => { keys[e.key.toLowerCase()] = true; });
  window.addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });

  // Resize handling (canvas keeps pixel resolution fixed, but scales via CSS)
  function resizeCanvas(){
    const rect = canvas.getBoundingClientRect();
    // keep drawing resolution same as element size
    canvas.width = Math.max(640, Math.floor(rect.width));
    canvas.height = Math.max(360, Math.floor(rect.height));
    W = canvas.width; H = canvas.height;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // --- Utilities ---
  function rand(min, max){ return Math.random()*(max-min)+min; }
  function dist(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return Math.sqrt(dx*dx+dy*dy); }

  // Spawn arrow from a random edge, pointing across screen
  function spawnArrow() {
    const edge = Math.floor(Math.random()*4); // 0 top,1 right,2 bottom,3 left
    let x,y,dx,dy;
    const speed = rand(2.2, 3.2) + wave*0.35 + Math.random()*1.2; // increases with wave
    const padding = 20;
    switch(edge){
      case 0: // top
        x = rand(padding, W-padding);
        y = -40;
        dx = (player.x - x) * 0.007;
        dy = 1;
        break;
      case 1: // right
        x = W + 40;
        y = rand(padding, H-padding);
        dx = -1;
        dy = (player.y - y) * 0.007;
        break;
      case 2: // bottom
        x = rand(padding, W-padding);
        y = H + 40;
        dx = (player.x - x) * 0.007;
        dy = -1;
        break;
      case 3: // left
        x = -40;
        y = rand(padding, H-padding);
        dx = 1;
        dy = (player.y - y) * 0.007;
        break;
    }
    // Normalize direction and apply speed
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    dx = dx/len * speed;
    dy = dy/len * speed;

    arrows.push({
      x,y,dx,dy,
      len: rand(28,60),
      rot: Math.atan2(dy,dx),
      color: `hsl(${rand(160,200)}, 90%, 60%)`,
      life: 0
    });
    playSound('arrow');
  }

  // Spawn shield powerup (small green orb)
  function spawnPowerup() {
    const x = rand(60, W-60), y = rand(60, H-60);
    powerups.push({x,y,ttl:12000, type:'shield', born:performance.now()});
  }

  function pickupPowerup(idx){
    const p = powerups[idx];
    if(p.type === 'shield'){
      shield = true;
      shieldStatus.textContent = "Yes";
      playSound('shield');
      // shield lasts for some time or one hit; we use one hit here
      setTimeout(()=>{ /* optional timed shield expiration */ }, 12000);
    }
    powerups.splice(idx,1);
  }

  // Collision check
  function checkCollisionArrow(a) {
    // approximate player as circle, arrow as line segment
    // compute closest distance from player center to arrow segment
    const px = player.x, py = player.y;
    const x1 = a.x, y1 = a.y;
    const x2 = a.x + Math.cos(a.rot) * a.len, y2 = a.y + Math.sin(a.rot) * a.len;
    // projection t
    const dx = x2-x1, dy=y2-y1;
    const l2 = dx*dx+dy*dy;
    const t = Math.max(0, Math.min(1, ((px-x1)*dx + (py-y1)*dy) / (l2 || 1)));
    const cx = x1 + t*dx, cy = y1 + t*dy;
    const d = Math.hypot(px-cx, py-cy);
    return d < player.r - 2;
  }

  // --- Drawing ---
  function drawBackground() {
    // gradient + subtle grid glow
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'rgba(2,6,23,0.7)');
    g.addColorStop(1,'rgba(3,10,36,0.95)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    // subtle diagonal streaks
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#00e6a8';
    for(let i=-1;i<8;i++){
      ctx.fillRect( (i*180 + (performance.now()/50)%180), 0, 2, H);
    }
    ctx.restore();
  }

  function drawPlayer(){
    // glowing circle + icon
    ctx.save();
    ctx.translate(player.x, player.y);
    // glow
    const rg = ctx.createRadialGradient(0,0,0,0,0,64);
    rg.addColorStop(0,'rgba(0,230,168,0.18)');
    rg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(0,0,42,0,Math.PI*2);
    ctx.fill();

    // body
    ctx.fillStyle = '#dffcf4';
    ctx.beginPath();
    ctx.arc(0,0,player.r,0,Math.PI*2);
    ctx.fill();

    // icon - small joystick rectangle (no external img draw to keep crisp)
    ctx.fillStyle = '#00272d';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎮', 0, 0);
    // shield ring
    if(shield){
      ctx.strokeStyle = 'rgba(122,252,255,0.95)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0,0,player.r+8,0,Math.PI*2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawArrows() {
    arrows.forEach(a=>{
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rot);
      // shaft
      ctx.fillStyle = a.color;
      const w = 6;
      ctx.beginPath();
      ctx.roundRect(-5, -w/2, a.len, w, 3);
      ctx.fill();
      // head
      ctx.beginPath();
      ctx.moveTo(a.len, 0);
      ctx.lineTo(a.len-14, -10);
      ctx.lineTo(a.len-14, 10);
      ctx.closePath();
      ctx.fill();
      // glow
      ctx.shadowColor = 'rgba(0,230,168,0.6)';
      ctx.shadowBlur = 12;
      ctx.restore();
    });
  }

  // polyfill for roundRect on canvas path (if missing)
  if(!CanvasRenderingContext2D.prototype.roundRect){
    CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r){
      if(typeof r === 'undefined') r = 6;
      this.beginPath();
      this.moveTo(x+r,y);
      this.arcTo(x+w,y,x+w,y+h,r);
      this.arcTo(x+w,y+h,x,y+h,r);
      this.arcTo(x,y+h,x,y,r);
      this.arcTo(x,y,x+w,y,r);
      this.closePath();
      return this;
    }
  }

  function drawPowerups(){
    powerups.forEach(p=>{
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.beginPath();
      ctx.arc(0,0,12,0,Math.PI*2);
      ctx.fillStyle = 'rgba(120,240,140,0.95)';
      ctx.fill();
      ctx.fillStyle = '#002';
      ctx.font='12px sans-serif';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText('🛡️',0,0);
      ctx.restore();
    });
  }

  // --- Game update ---
  function update(dt){
    // Player velocity from keys
    const s = player.speed;
    let vx=0, vy=0;
    if(keys['arrowup']||keys['w']) vy = -1;
    if(keys['arrowdown']||keys['s']) vy = 1;
    if(keys['arrowleft']||keys['a']) vx = -1;
    if(keys['arrowright']||keys['d']) vx = 1;
    // Normalize diagonal
    if(vx && vy){ vx *= 0.7071; vy *= 0.7071; }
    player.x += vx * s;
    player.y += vy * s;
    // clamp
    player.x = Math.max(16, Math.min(W-16, player.x));
    player.y = Math.max(16, Math.min(H-16, player.y));

    // Move arrows
    for(let i=arrows.length-1;i>=0;i--){
      const a = arrows[i];
      a.x += a.dx;
      a.y += a.dy;
      a.life += dt;
      // remove when off screen a bit
      if(a.x < -120 || a.x > W+120 || a.y < -120 || a.y > H+120){
        arrows.splice(i,1);
        continue;
      }
      // collision
      if(checkCollisionArrow(a)){
        // if shield, consume it and remove arrow
        if(shield){
          shield = false;
          shieldStatus.textContent = "No";
          playSound('shield');
          arrows.splice(i,1);
        } else {
          // player hit -> end game
          playSound('hit');
          endGame();
          return;
        }
      }
    }

    // Powerup pickup check
    for(let i=powerups.length-1;i>=0;i--){
      const p = powerups[i];
      if(Math.hypot(player.x-p.x, player.y-p.y) < player.r + 12){
        pickupPowerup(i);
      } else if(performance.now() - p.born > p.ttl){
        powerups.splice(i,1);
      }
    }

    // score increases with dt and wave bonus
    score += dt * 0.02 * (1 + wave*0.12);
    // spawn logic
    spawnTimer += dt;
    if(spawnTimer > spawnInterval){
      spawnTimer = 0;
      // spawn a burst of arrows based on wave
      const count = 1 + Math.min(5, Math.floor(wave/1.5));
      for(let i=0;i<count;i++){
        spawnArrow();
      }
    }

    // difficulty increase
    difficultyTimer += dt;
    if(difficultyTimer > difficultyInterval){
      difficultyTimer = 0;
      wave++;
      spawnInterval = Math.max(420, spawnInterval * 0.88);
      // occasionally spawn powerup
      if(Math.random() < 0.6) spawnPowerup();
      playSound('arrow');
    }

    // update UI
    scoreEl.textContent = Math.floor(score);
    waveEl.textContent = wave;
    livesEl.textContent = lives;
    highScore = Math.max(highScore, Math.floor(score));
    highScoreEl.textContent = localStorage.getItem("arrowDodgeHigh") || highScore;
  }

  function render(){
    drawBackground();
    drawPowerups();
    drawArrows();
    drawPlayer();
  }

  // --- Game loop ---
  let rafId = null;
  function gameLoop(ts){
    if(!lastTime) lastTime = ts;
    const dt = ts - lastTime;
    lastTime = ts;
    if(!paused && gameRunning){
      update(dt);
      render();
    } else {
      // still render once (for overlay visuals)
      render();
    }
    rafId = requestAnimationFrame(gameLoop);
  }

  // --- Start / Pause / Resume / Restart / End ---
  function startGame(){
    // reset state
    gameRunning = true; paused = false;
    spawnTimer = 0; difficultyTimer = 0;
    spawnInterval = 1200; difficultyInterval = 8000;
    arrows.length = 0; powerups.length = 0;
    score = 0; wave = 0; lives = 1; shield = false;
    player.x = W/2; player.y = H/2;
    shieldStatus.textContent = "No";
    overlay.style.pointerEvents = "none";
    overlay.style.opacity = 0;
    overlayMessage.textContent = "";
    startBtn.disabled = true; pauseBtn.disabled = false; resumeBtn.disabled = true; restartBtn.disabled = false;
    playSound('arrow');
    if(soundToggle.checked){
      try{ audio.bgm.play(); }catch(e){}
    }
  }

  function pauseGame(){
    paused = true;
    pauseBtn.disabled = true; resumeBtn.disabled = false;
    overlay.style.pointerEvents = "auto";
    overlay.style.opacity = 1;
    overlayMessage.innerHTML = "<h2>Paused</h2><p>Game is paused.</p>";
  }
  function resumeGame(){
    paused = false;
    pauseBtn.disabled = false; resumeBtn.disabled = true;
    overlay.style.pointerEvents = "none";
    overlay.style.opacity = 0;
  }

  function restartGame(){
    // restart from scratch
    startGame();
  }

  function endGame(){
    gameRunning = false;
    paused = false;
    cancelAnimationFrame(rafId);
    // finalize high score
    const finalScore = Math.floor(score);
    const prevHigh = parseInt(localStorage.getItem("arrowDodgeHigh") || "0",10);
    if(finalScore > prevHigh){
      localStorage.setItem("arrowDodgeHigh", String(finalScore));
      highScore = finalScore;
    } else {
      highScore = prevHigh;
    }
    // show overlay
    overlay.style.pointerEvents = "auto";
    overlay.style.opacity = 1;
    overlayMessage.innerHTML = `<h2>Game Over</h2><p>Your score: <strong>${finalScore}</strong></p><p>High score: <strong>${localStorage.getItem("arrowDodgeHigh")}</strong></p>`;
    startBtn.disabled = false; pauseBtn.disabled = true; resumeBtn.disabled = true; restartBtn.disabled = false;
    // stop bgm
    try{ audio.bgm.pause(); audio.bgm.currentTime = 0; }catch(e){}
    // restart loop to allow overlay rendering (not updating game)
    lastTime = 0;
    rafId = requestAnimationFrame(gameLoop);
  }

  // --- Wire UI ---
  startBtn.addEventListener('click', ()=> {
    startGame();
    if(!rafId) rafId = requestAnimationFrame(gameLoop);
  });
  overlayStart.addEventListener('click', ()=> { startBtn.click(); });
  pauseBtn.addEventListener('click', pauseGame);
  resumeBtn.addEventListener('click', resumeGame);
  restartBtn.addEventListener('click', ()=> {
    restartGame();
    if(!rafId) rafId = requestAnimationFrame(gameLoop);
  });
  overlayRestart.addEventListener('click', ()=> { restartBtn.click(); });

  // sound toggle
  soundToggle.addEventListener('change', ()=>{
    if(!soundToggle.checked){
      Object.values(audio).forEach(a=>a.pause());
    } else {
      if(gameRunning && !paused) try{ audio.bgm.play(); }catch(e){}
    }
  });

  // auto-start secondary rendering loop
  rafId = requestAnimationFrame(gameLoop);

  // Save highscore periodically
  setInterval(()=> {
    const hs = parseInt(localStorage.getItem("arrowDodgeHigh") || "0",10);
    if(Math.floor(score) > hs) localStorage.setItem("arrowDodgeHigh", String(Math.floor(score)));
    highScoreEl.textContent = localStorage.getItem("arrowDodgeHigh");
  }, 2000);

  // small initial overlay message
  overlayMessage.innerHTML = `<h2>Arrow Dodge</h2><p>Use WASD or Arrow keys to move. Avoid arrows. Shield blocks 1 hit.</p>`;
  overlay.style.pointerEvents = "auto";
  overlay.style.opacity = 1;

})();
