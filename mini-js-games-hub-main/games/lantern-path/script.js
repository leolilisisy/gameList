/* Lantern Path — script.js
   - Places nodes along a custom path (line-like)
   - Click nodes to place a lantern if you have remaining
   - Lantern lights radius (based on Euclidean distance)
   - Obstacles block light (a simple blocking rule)
   - Win when all path nodes are lit
   - Undo, Hint, Pause/Start, Next Level supported
   - Sounds generated via Web Audio API (no external files)
*/

(() => {
  /* ---------- Level definitions ----------
     Each level: nodes: [{x,y}] coordinates 0..1 relative inside board,
     obstacles: [nodeIndex] (tile is blocked),
     lanterns: max lanterns allowed
     radius: how many units (in px) each lantern lights (we'll scale)
  */
  const levels = [
    {
      name: "Intro",
      nodes: [ {x:0.08,y:0.5},{x:0.18,y:0.46},{x:0.28,y:0.5},{x:0.38,y:0.52},{x:0.48,y:0.49},{x:0.58,y:0.47},{x:0.68,y:0.5},{x:0.78,y:0.53},{x:0.88,y:0.5} ],
      obstacles: [],
      lanterns: 3,
      radius: 110
    },
    {
      name: "Obstructed Crossing",
      nodes: [ {x:0.06,y:0.6},{x:0.16,y:0.55},{x:0.26,y:0.5},{x:0.36,y:0.46},{x:0.46,y:0.44},{x:0.56,y:0.44},{x:0.66,y:0.46},{x:0.76,y:0.51},{x:0.86,y:0.54} ],
      obstacles: [4,5],
      lanterns: 4,
      radius: 110
    },
    {
      name: "Twist & Turns",
      nodes: [ {x:0.06,y:0.45},{x:0.16,y:0.42},{x:0.26,y:0.45},{x:0.36,y:0.52},{x:0.46,y:0.58},{x:0.56,y:0.56},{x:0.66,y:0.50},{x:0.76,y:0.46},{x:0.86,y:0.44} ],
      obstacles: [3],
      lanterns: 4,
      radius: 105
    },
    {
      name: "Advanced",
      nodes: [ {x:0.05,y:0.50},{x:0.14,y:0.44},{x:0.22,y:0.40},{x:0.32,y:0.44},{x:0.40,y:0.50},{x:0.48,y:0.56},{x:0.58,y:0.54},{x:0.70,y:0.50},{x:0.82,y:0.46},{x:0.92,y:0.48} ],
      obstacles: [2,6],
      lanterns: 5,
      radius: 100
    }
  ];

  // DOM refs
  const boardEl = document.getElementById('board');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const levelSelect = document.getElementById('levelSelect');
  const levelNumEl = document.getElementById('levelNum');
  const lanternsLeftEl = document.getElementById('lanternsLeft');
  const gameStatusEl = document.getElementById('gameStatus');
  const messageEl = document.getElementById('message');
  const undoBtn = document.getElementById('undoBtn');
  const hintBtn = document.getElementById('hintBtn');
  const nextBtn = document.getElementById('nextBtn');
  const soundToggle = document.getElementById('soundToggle');

  // state
  let currentLevelIndex = 0;
  let svg; // main svg
  let nodeEls = [];
  let placedLanterns = []; // [{nodeIndex, x,y}]
  let lit = []; // boolean per node
  let remainingLanterns = 0;
  let running = false;
  let history = [];

  // WebAudio for sounds (generate tones)
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function playTone(freq=440, duration=0.12, type='sine', gain=0.06){
    if (!soundToggle.checked) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + duration);
  }

  /* Build level select */
  function initLevelSelect(){
    levelSelect.innerHTML = '';
    levels.forEach((lvl, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${i+1}. ${lvl.name}`;
      levelSelect.appendChild(opt);
    });
    levelSelect.value = currentLevelIndex;
  }

  /* Render an SVG board for the level */
  function renderLevel(index){
    const lvl = levels[index];
    nodeEls = [];
    placedLanterns = [];
    lit = new Array(lvl.nodes.length).fill(false);
    history = [];
    remainingLanterns = lvl.lanterns;
    levelNumEl.textContent = index + 1;
    lanternsLeftEl.textContent = remainingLanterns;
    gameStatusEl.textContent = 'Idle';
    messageEl.textContent = 'Click tiles to place lanterns. Light all path tiles to win.';
    // create svg
    boardEl.innerHTML = '';
    svg = createSVG('svg',{width:'100%', height:'100%', viewBox:'0 0 1000 600', preserveAspectRatio:'xMidYMid meet'});
    boardEl.appendChild(svg);

    // background subtle gradient
    const defs = createSVG('defs', {});
    const g1 = createSVG('radialGradient', {id:'g1', cx:'50%', cy:'20%', r:'60%'});
    g1.innerHTML = `<stop offset="0%" stop-color="rgba(255,240,200,0.04)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/>`;
    defs.appendChild(g1);
    svg.appendChild(defs);

    // convert normalized coords to 1000x600
    const W = 1000, H = 600;
    const coords = lvl.nodes.map(n => ({x: Math.round(n.x * W), y: Math.round(n.y * H)}));

    // draw path polyline (thin dim line)
    const pathPoints = coords.map(p => `${p.x},${p.y}`).join(' ');
    const pathLine = createSVG('polyline', {points: pathPoints, fill:'none', stroke:'rgba(255,255,255,0.04)', 'stroke-width':12, 'stroke-linecap':'round', 'stroke-linejoin':'round'});
    svg.appendChild(pathLine);

    // add nodes (clickable)
    coords.forEach((p, idx) => {
      const g = createSVG('g', {class: 'node', 'data-idx': idx, transform:`translate(${p.x},${p.y})`});
      const circle = createSVG('circle', {class:'node-circle', r:18});
      g.appendChild(circle);

      // glow ring
      const glow = createSVG('circle', {class:'glow', r:40, fill:'none', stroke:'url(#g1)', 'stroke-width':40, 'stroke-opacity':0.06});
      g.appendChild(glow);

      // lantern icon (simple svg path of lantern)
      const lantern = createSVG('g',{class:'lantern', transform:'translate(-12,-26) scale(1.1)'});
      lantern.innerHTML = `<path d="M12 0c3.3 0 6 2.7 6 6v3c0 3.3 -2.7 6 -6 6s-6-2.7-6-6v-3c0-3.3 2.7-6 6-6z" fill="#fbf0d6" opacity="0.98"></path>
        <rect x="5" y="10" width="14" height="10" rx="2" fill="#ffd27a"></rect>`;
      g.appendChild(lantern);

      // obstacle indicator if obstacle
      if (lvl.obstacles && lvl.obstacles.includes(idx)){
        const obs = createSVG('circle',{class:'obstacle-circle', r:12, fill:'rgba(80,20,20,0.95)'});
        g.appendChild(obs);
        const cross = createSVG('text',{x:-6,y:6, 'font-size':16, fill:'#d9bdbd'});
        cross.textContent = '⛔';
        g.appendChild(cross);
      }

      // append to svg
      svg.appendChild(g);
      nodeEls.push(g);

      // click handler
      g.addEventListener('click', (ev) => {
        if (!running) return;
        if (lvl.obstacles && lvl.obstacles.includes(idx)) {
          flashMessage('Cannot place lantern on obstacle.');
          playTone(220,0.08,'sawtooth',0.03);
          return;
        }
        if (remainingLanterns <= 0){
          flashMessage('No lanterns left — try undo or restart.');
          playTone(190,0.08,'square',0.02);
          return;
        }
        if (isLanternPlacedAt(idx)) {
          // toggle off
          removeLantern(idx);
          return;
        }
        placeLantern(idx);
      });
    });

    // initial rendering of lit state
    updateLitVisuals();
  }

  /* Helpers to create svg elements */
  function createSVG(tag, attrs){
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs||{}).forEach(([k,v]) => el.setAttribute(k,v));
    return el;
  }

  function isLanternPlacedAt(nodeIdx){
    return placedLanterns.some(l => l.nodeIndex === nodeIdx);
  }
  function placeLantern(nodeIdx, record=true){
    const lvl = levels[currentLevelIndex];
    if (remainingLanterns <= 0) return false;
    const nodeG = nodeEls[nodeIdx];
    nodeG.classList.add('on');
    // compute position from transform
    const t = nodeG.getCTM();
    // get coords from translate
    const x = parseFloat(nodeG.getAttribute('transform').match(/translate\(([-\d.]+),([-\d.]+)\)/)[1]);
    const y = parseFloat(nodeG.getAttribute('transform').match(/translate\(([-\d.]+),([-\d.]+)\)/)[2]);
    placedLanterns.push({nodeIndex: nodeIdx, x, y, radius: lvl.radius});
    remainingLanterns--;
    lanternsLeftEl.textContent = remainingLanterns;
    playTone(880,0.06,'sine',0.06);
    flashMessage('Lantern placed.');
    if (record) history.push({type:'place', idx:nodeIdx});
    updateLitState();
    return true;
  }

  function removeLantern(nodeIdx, record=true){
    // remove first matching lantern
    const idx = placedLanterns.findIndex(l => l.nodeIndex === nodeIdx);
    if (idx === -1) return false;
    nodeEls[nodeIdx].classList.remove('on');
    placedLanterns.splice(idx,1);
    remainingLanterns++;
    lanternsLeftEl.textContent = remainingLanterns;
    playTone(420,0.05,'triangle',0.04);
    if (record) history.push({type:'remove', idx:nodeIdx});
    updateLitState();
    return true;
  }

  function updateLitState(){
    const lvl = levels[currentLevelIndex];
    const W = 1000, H = 600;
    // compute coords array
    const coords = lvl.nodes.map(n => ({x: Math.round(n.x * W), y: Math.round(n.y * H)}));
    // Reset
    lit = new Array(coords.length).fill(false);
    // For each lantern, mark nodes within radius lit, unless blocked by obstacle straight-line (simple blocking: obstacle node itself just can't be lantern but does not fully block light between nodes)
    placedLanterns.forEach(l => {
      for (let i=0;i<coords.length;i++){
        // if node is obstacle and not lit already, allow it to be lit but visually show obstacle? We treat obstacle as a tile that must be lit but cannot host lantern.
        const dx = coords[i].x - l.x;
        const dy = coords[i].y - l.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist <= l.radius) lit[i] = true;
      }
    });
    updateLitVisuals();
    checkWinCondition();
  }

  function updateLitVisuals(){
    const lvl = levels[currentLevelIndex];
    nodeEls.forEach((g, i) => {
      // node on if a lantern is placed here OR lit by some lantern
      const isLit = lit[i] || placedLanterns.some(p=>p.nodeIndex===i);
      if (isLit) g.classList.add('on'); else g.classList.remove('on');
      // but obstacle nodes remain with a darker base; we show vignette by opacity
      if (lvl.obstacles && lvl.obstacles.includes(i)) {
        g.querySelector('.node-circle').style.fill = isLit ? 'rgba(255,210,120,0.95)' : 'rgba(40,40,60,0.96)';
      } else {
        g.querySelector('.node-circle').style.fill = isLit ? 'rgba(255,230,180,1)' : 'rgba(255,255,255,0.02)';
      }
      // ensure lantern icon is visible only if lantern placed
      const lantern = g.querySelector('.lantern');
      if (isLanternPlacedAt(i)){
        lantern.style.opacity = 1;
      } else {
        lantern.style.opacity = isLit ? 0.35 : 0;
      }
    });

    // update lantern circles (visualize radius overlay blurred)
    // remove existing radius overlays
    svg.querySelectorAll('.radius-overlay').forEach(el => el.remove());
    // add for each lantern a soft radial
    placedLanterns.forEach(l => {
      const r = createSVG('circle',{class:'radius-overlay', cx:l.x, cy:l.y, r: l.radius});
      r.style.fill = 'rgba(255,200,80,0.06)';
      r.style.filter = 'blur(14px)';
      svg.insertBefore(r, svg.firstChild);
    });
  }

  function checkWinCondition(){
    const lvl = levels[currentLevelIndex];
    // require all nodes to be lit
    const allLit = lit.every(v => v);
    if (allLit){
      running = false;
      gameStatusEl.textContent = 'Won';
      messageEl.textContent = '✨ You lit the entire path — well done!';
      playTone(1200,0.16,'sine',0.12);
    } else if (remainingLanterns <= 0 && !placedLanterns.length){
      // improbable
    } else if (remainingLanterns <= 0 && !lit.some(Boolean)){
      // no progress and none left
      // not definitive lose — only if no possible lit nodes remain
    } else {
      gameStatusEl.textContent = running ? 'Playing' : 'Idle';
    }
  }

  function isPossibleToWin(){
    // rudimentary check: if there exists any unlit node and no remaining lanterns -> cannot win
    if (remainingLanterns <= 0 && !lit.every(v=>v)) return false;
    return true;
  }

  function flashMessage(txt, timeout=2200){
    messageEl.textContent = txt;
    setTimeout(()=> { if (messageEl.textContent === txt) messageEl.textContent = 'Place lanterns to light the path.'; }, timeout);
  }

  /* Controls */
  startBtn.addEventListener('click', ()=> {
    running = true;
    gameStatusEl.textContent = 'Playing';
    messageEl.textContent = 'Game started. Place lanterns!';
    playTone(520,0.08,'sine',0.06);
  });
  pauseBtn.addEventListener('click', ()=> {
    running = !running;
    if (running){
      gameStatusEl.textContent = 'Playing';
      messageEl.textContent = 'Resumed.';
      playTone(640,0.06,'sine',0.04);
    } else {
      gameStatusEl.textContent = 'Paused';
      messageEl.textContent = 'Paused — click Start to continue.';
      playTone(220,0.06,'sine',0.03);
    }
  });
  restartBtn.addEventListener('click', ()=> {
    renderLevel(currentLevelIndex);
    playTone(380,0.08,'sawtooth',0.05);
  });
  levelSelect.addEventListener('change', (e) => {
    currentLevelIndex = parseInt(e.target.value,10);
    renderLevel(currentLevelIndex);
    playTone(760,0.06,'sine',0.06);
  });
  undoBtn.addEventListener('click', ()=>{
    if (!history.length) return flashMessage('Nothing to undo.');
    const last = history.pop();
    if (last.type === 'place') removeLantern(last.idx, false);
    else if (last.type === 'remove') placeLantern(last.idx, false);
    playTone(300,0.05,'triangle',0.04);
  });
  hintBtn.addEventListener('click', ()=>{
    // naive hint: find the first unlit node and temporarily highlight it
    const lvl = levels[currentLevelIndex];
    const firstUnlit = lit.findIndex(v => !v);
    if (firstUnlit === -1) { flashMessage('All lit already!'); return; }
    const g = nodeEls[firstUnlit];
    const orig = g.querySelector('.node-circle').style.stroke;
    g.querySelector('.node-circle').style.stroke = 'rgba(255,200,90,0.95)';
    g.animate([{transform:'scale(1)'},{transform:'scale(1.08)'}], {duration:700, iterations:2});
    setTimeout(()=> g.querySelector('.node-circle').style.stroke = orig, 1200);
    playTone(980,0.08,'sine',0.05);
  });
  nextBtn.addEventListener('click', ()=>{
    currentLevelIndex = Math.min(levels.length-1, currentLevelIndex+1);
    levelSelect.value = currentLevelIndex;
    renderLevel(currentLevelIndex);
    playTone(980,0.08,'sine',0.06);
  });

  /* Undo / place helpers ended */

  function removeAllOverlays(){
    svg && svg.querySelectorAll('.radius-overlay').forEach(e=>e.remove());
  }

  /* small utility: show a quick animation when cannot place */
  function animateNode(idx, keyframes=[{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}], opts={duration:260}){
    nodeEls[idx] && nodeEls[idx].animate(keyframes, opts);
  }

  /* init */
  function init(){
    initLevelSelect();
    renderLevel(currentLevelIndex);
    // Start paused; pressing start required to enable placement
    running = false;
    // ensure audio context resume on first user interaction
    document.body.addEventListener('click', ()=> { if (audioCtx.state === 'suspended') audioCtx.resume(); }, {once:true});
  }
  init();

  /* Export for debugging if needed */
  window.LanternPath = {levels, renderLevel, placeLantern, removeLantern};

})();
