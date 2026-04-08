// Simple Fruit Slicer - baby implementation
(function(){
  const playArea = document.getElementById('play-area');
  const canvas = document.getElementById('swipe-canvas');
  const scoreEl = document.getElementById('score-val');
  const startBtn = document.getElementById('start-btn');
  const overlay = document.getElementById('overlay');
  const message = document.getElementById('message');
  const restartBtn = document.getElementById('restart-btn');

  // canvas for drawing swipe
  const ctx = canvas.getContext && canvas.getContext('2d');
  let W, H;
  function resize(){
    W = canvas.width = playArea.clientWidth;
    H = canvas.height = playArea.clientHeight;
  }
  window.addEventListener('resize', resize);

  // game state
  let running = false;
  let score = 0;
  let entities = []; // fruits and bombs
  let spawnTimer = null;
  let raf = null;

  // pointer tracking for swipe line and collision detection
  let pointer = {down:false, points:[]};
  function resetPointer(){ pointer.down=false; pointer.points=[]; clearCanvas(); }

  function clearCanvas(){ if(ctx){ ctx.clearRect(0,0,W,H); }}

  // helper: random
  const rnd = (a,b)=> Math.random()*(b-a)+a;

  // create fruit or bomb DOM element and metadata
  function createEntity(type){
    const el = document.createElement('div');
    el.className = 'fruit';
    const isBomb = type === 'bomb';
    if(isBomb){ el.classList.add('bomb'); }
    else {
      // produce a colorful fruit look with CSS gradient
      const color = ['#ff5e5e','#ffb86b','#6bff8a','#60d6ff','#c76bff'][Math.floor(Math.random()*5)];
      el.style.background = `radial-gradient(circle at 30% 25%, #fff6 0%, ${color} 20%, #0000 70%)`;
    }

    playArea.appendChild(el);

    // spawn from bottom with upward impulse
    const startX = rnd(60, W-60);
    const startY = H + 40; // start slightly off-screen bottom
    const vx = rnd(-80, 80) / 60; // px per frame baseline
    const vy = rnd(-18, -26) / 1; // negative upward velocity (px per frame)
    const radius = isBomb ? 26 : 32;

    const ent = {el, x:startX, y:startY, vx, vy, r:radius, type, sliced:false, rotation: rnd(-0.05,0.05)};
    // small size adjustments
    if(isBomb){ ent.r = 24; el.style.width = '48px'; el.style.height = '48px'; }
    else { el.style.width = ent.r*2+'px'; el.style.height = ent.r*2+'px'; }

    // initial placement
    el.style.left = ent.x+'px'; el.style.top = ent.y+'px';
    entities.push(ent);
  }

  // spawn loop: occasionally spawn fruits and bombs
  function startSpawning(){
    spawnTimer = setInterval(()=>{
      // more fruits than bombs
      const chooseBomb = Math.random() < 0.12; // 12% bombs
      if(chooseBomb) createEntity('bomb');
      else createEntity('fruit');
      // sometimes spawn a small extra burst
      if(Math.random() < 0.15) createEntity('fruit');
    }, 700);
  }

  // physics update
  function updateEntities(){
    const gravity = 0.6; // px per frame^2
    for(let i = entities.length-1; i>=0; i--){
      const e = entities[i];
      if(e.sliced) continue; // let it vanish visually when sliced
      e.vy += gravity * 0.8; // gravity
      e.x += e.vx * 6; // scale velocities to look good across sizes
      e.y += e.vy * 6;
      e.rotation += 0.02;
      // apply to DOM
      e.el.style.transform = `translate(-50%,-50%) translate(${e.x - W/2 + W/2}px,${e.y - H/2 + H/2}px) rotate(${e.rotation}rad)`;
      e.el.style.left = e.x+'px';
      e.el.style.top = e.y+'px';

      // remove if offscreen below
      if(e.y - e.r > H + 100){
        // clean
        e.el.remove();
        entities.splice(i,1);
      }
    }
  }

  // draw swipe trail
  function drawSwipe(){
    if(!ctx) return;
    clearCanvas();
    if(pointer.points.length < 2) return;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    // draw fading trail
    for(let i=pointer.points.length-1;i>0;i--){
      const a = pointer.points[i];
      const b = pointer.points[i-1];
      const alpha = (i / pointer.points.length) * 0.6;
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 14 * (i / pointer.points.length) + 2;
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }
  }

  // distance from point to segment
  function pointToSegmentDistance(px,py,x1,y1,x2,y2){
    const A = px - x1; const B = py - y1; const C = x2 - x1; const D = y2 - y1;
    const dot = A * C + B * D; const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    const dx = px - xx; const dy = py - yy; return Math.sqrt(dx*dx + dy*dy);
  }

  // check swipe segments against entities
  function checkCollisions(){
    if(pointer.points.length < 2) return;
    // take latest segment
    const last = pointer.points[pointer.points.length-1];
    for(let j = pointer.points.length-2; j>=0 && j>pointer.points.length-6; j--){
      const p1 = pointer.points[j];
      const p2 = pointer.points[j+1];
      for(let i = entities.length-1; i>=0; i--){
        const e = entities[i];
        if(e.sliced) continue;
        const d = pointToSegmentDistance(e.x, e.y, p1.x, p1.y, p2.x, p2.y);
        if(d <= e.r){
          // hit
          if(e.type === 'bomb'){
            // bomb sliced -> game over
            endGame(true);
            return;
          }
          sliceFruit(e, p1, p2);
        }
      }
    }
  }

  function sliceFruit(e, p1, p2){
    e.sliced = true;
    // score depends on swipe speed and fruit speed
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const speed = Math.min(60, Math.sqrt(dx*dx + dy*dy));
    score += Math.round(8 + speed * 0.3);
    scoreEl.textContent = score;

    // visual slice: simple fade and remove
    e.el.style.transition = 'transform 400ms ease-out, opacity 400ms ease-out';
    e.el.style.opacity = '0';
    // small cut effect
    const cut = document.createElement('div');
    cut.className = 'slice-effect';
    cut.style.left = (e.x - 30) + 'px';
    cut.style.top = (e.y - 30) + 'px';
    cut.style.width = (e.r*2+20) + 'px';
    cut.style.height = (e.r/2) + 'px';
    cut.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.2))';
    cut.style.transform = `rotate(${rnd(-45,45)}deg)`;
    document.getElementById('game-root').appendChild(cut);
    setTimeout(()=>cut.remove(),350);

    setTimeout(()=>{
      e.el.remove();
      const idx = entities.indexOf(e); if(idx>=0) entities.splice(idx,1);
    }, 350);
  }

  // main loop
  function tick(){
    updateEntities();
    drawSwipe();
    checkCollisions();
    if(running) raf = requestAnimationFrame(tick);
  }

  function startGame(){
    resize();
    score = 0; scoreEl.textContent = score;
    running = true; overlay.classList.add('hidden');
    // clean existing
    entities.forEach(e=>e.el.remove()); entities = [];
    startSpawning();
    if(raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }

  function endGame(byBomb){
    running = false; clearInterval(spawnTimer); spawnTimer = null; if(raf) cancelAnimationFrame(raf);
    // show message
    message.textContent = byBomb ? 'Boom! You hit a bomb.' : 'Game over';
    overlay.classList.remove('hidden');
  }

  // pointer handling: supports mouse and touch via pointer events
  const rectEl = playArea;
  function toLocal(ev){
    const r = rectEl.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }

  function onPointerDown(ev){
    if(!running) return;
    pointer.down = true; pointer.points = [];
    const p = toLocal(ev);
    pointer.points.push(p);
  }
  function onPointerMove(ev){
    if(!pointer.down) return;
    const p = toLocal(ev);
    pointer.points.push(p);
    if(pointer.points.length>30) pointer.points.shift();
  }
  function onPointerUp(ev){
    pointer.down = false; pointer.points = [];
    clearCanvas();
  }

  // attach pointer events to the overlaying canvas for coordinates
  (function attach(){
    playArea.addEventListener('pointerdown', (e)=>{ playArea.setPointerCapture && playArea.setPointerCapture(e.pointerId); onPointerDown(e); });
    playArea.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  })();

  // start and restart
  startBtn.addEventListener('click', ()=>{
    startGame();
  });
  restartBtn.addEventListener('click', ()=>{
    startGame();
  });

  // quick loop to draw swipe continuously while pointer is down
  setInterval(()=>{
    if(pointer.down){ drawSwipe(); checkCollisions(); }
  }, 40);

  // initial resize and hint
  resize();
  overlay.classList.remove('hidden');
  message.textContent = 'Slice fruits with your mouse or finger. Avoid bombs.';
  // expose small helper for debugging
  window.__fruitEntities = entities;
})();
