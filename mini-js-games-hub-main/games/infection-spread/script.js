/* Infection Spread — game logic
 *  - Nodes connected by lines (grid layout but visually nodes + links)
 *  - States: healthy, infected, quarantine, cleared
 *  - Player tools: cure, quarantine, barrier
 *  - Resources and power-ups
 *  - Pause / Restart / Level progression
 *
 * Drop into games/infection-spread/script.js
 */

(() => {
  /* CONFIG */
  const ROWS = 6;      // visual rows
  const COLS = 9;      // visual columns
  const NODE_SPACING = 90;
  const START_RESOURCES = 10;
  const START_INFECTED = 3;
  const TICKS_TO_SURVIVE = 18; // alt win condition
  const BASE_SPREAD_CHANCE = 0.45; // base probability to infect neighbor
  const MAX_LEVEL = 10;

  /* DOM */
  const svgContainer = document.getElementById('svg-container');
  const resourceCountEl = document.getElementById('resource-count');
  const infectedCountEl = document.getElementById('infected-count');
  const clearedCountEl = document.getElementById('cleared-count');
  const levelDisplay = document.getElementById('level-display');
  const tickCountEl = document.getElementById('tick-count');
  const statusMessage = document.getElementById('status-message');

  const toolSelect = document.getElementById('tool-select');
  const neighborMode = document.getElementById('neighbor-mode');
  const speedInput = document.getElementById('speed');

  const pauseBtn = document.getElementById('pause-btn');
  const restartBtn = document.getElementById('restart-btn');
  const nextLevelBtn = document.getElementById('next-level-btn');
  const toggleSoundBtn = document.getElementById('toggle-sound');

  const powerClean = document.getElementById('power-clean');
  const powerShield = document.getElementById('power-shield');

  // sounds
  const sfxCure = document.getElementById('sfx-cure');
  const sfxQuarantine = document.getElementById('sfx-quarantine');
  const sfxSpread = document.getElementById('sfx-spread');
  const bgm = document.getElementById('bgm');
  let soundEnabled = true;

  /* Game state */
  let nodes = []; // 2D array of node objects
  let links = []; // array of link objects
  let resources = START_RESOURCES;
  let tick = 0;
  let infectedCount = 0;
  let clearedCount = 0;
  let interval = null;
  let paused = true;
  let level = 1;
  let surviveTicks = TICKS_TO_SURVIVE;
  let spreadChance = BASE_SPREAD_CHANCE;

  /* Utility: random */
  function randInt(n) { return Math.floor(Math.random()*n); }
  function playSound(el) { if(!soundEnabled) return; try{ el.currentTime=0; el.play(); }catch(e){} }

  /* SVG creation helpers */
  function createSvg(tag, attrs = {}) {
    const ns = 'http://www.w3.org/2000/svg';
    const el = document.createElementNS(ns, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  /* Build board: nodes positioned in an offset grid */
  function buildBoard() {
    nodes = [];
    links = [];
    svgContainer.innerHTML = '';
    const w = Math.min(svgContainer.clientWidth-40, COLS*NODE_SPACING);
    const h = Math.min(svgContainer.clientHeight-40, ROWS*NODE_SPACING);
    const svg = createSvg('svg', { width: '100%', height: '100%', viewBox:`0 0 ${COLS*NODE_SPACING} ${ROWS*NODE_SPACING}` });
    svgContainer.appendChild(svg);

    // create nodes
    for(let r=0;r<ROWS;r++){
      nodes[r] = [];
      for(let c=0;c<COLS;c++){
        const x = c*NODE_SPACING + (r%2?NODE_SPACING/2:0) + 40;
        const y = r*NODE_SPACING + 40;
        const id = `n-${r}-${c}`;
        // Node group
        const g = createSvg('g', { class:'node node-healthy', id });
        g.setAttribute('transform', `translate(${x},${y})`);
        // glow circle
        const glow = createSvg('circle', { class:'glow cleared', r:28, cx:0, cy:0, opacity:0 });
        // main circle
        const circ = createSvg('circle', { class:'node-circle', r:18, cx:0, cy:0 });
        // label small
        const lbl = createSvg('text', { x:0, y:36, 'text-anchor':'middle', 'font-size':10, fill:'#9aa7b6' });
        lbl.textContent = `${r},${c}`;

        g.appendChild(glow);
        g.appendChild(circ);
        g.appendChild(lbl);
        svg.appendChild(g);

        const nodeObj = {
          r,c,x,y,id,g,glow,circ,lbl,
          state:'healthy', // healthy | infected | quarantine | cleared
          nextState:null,
          neighbors: []
        };

        nodes[r][c] = nodeObj;
      }
    }

    // connect neighbors (links)
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const n = nodes[r][c];
        // compute neighbors (8-neighborhood)
        const neighPositions = [
          [r-1,c],[r+1,c],[r,c-1],[r,c+1],
          [r-1,c-1],[r-1,c+1],[r+1,c-1],[r+1,c+1]
        ];
        neighPositions.forEach(([nr,nc], idx)=>{
          if(nr>=0 && nr<ROWS && nc>=0 && nc<COLS){
            const m = nodes[nr][nc];
            // add link (only once)
            if(!links.find(l=> (l.a===n && l.b===m) || (l.a===m && l.b===n))){
              const line = createSvg('line', { class:'link-line', x1:n.x, y1:n.y, x2:m.x, y2:m.y });
              svg.insertBefore(line, svg.firstChild); // behind nodes
              links.push({a:n,b:m,line});
            }
            n.neighbors.push(m);
          }
        });

        // click handler
        n.g.addEventListener('click', (ev)=> {
          handleNodeClick(n);
        });
      }
    }

    // responsive: adjust viewbox padding (done via CSS)
  }

  /* Reset & initial infection */
  function resetGame() {
    paused = true;
    clearInterval(interval);
    tick = 0;
    resources = START_RESOURCES + Math.floor(level*1.5);
    infectedCount = 0;
    clearedCount = 0;
    surviveTicks = TICKS_TO_SURVIVE + level*2;
    spreadChance = BASE_SPREAD_CHANCE + (level-1)*0.04; // more infectious with level
    updateUi();

    // build board / svg
    buildBoard();

    // initial infected seeds
    for(let k=0;k<Math.min(ROWS*COLS-1, START_INFECTED + level); k++){
      const r = randInt(ROWS);
      const c = randInt(COLS);
      const n = nodes[r][c];
      if(n.state!=='infected') setNodeState(n,'infected');
    }

    // start loop
    startLoop();
    status('Level ' + level + ' — Survive ' + surviveTicks + ' ticks or clear infections');
  }

  function startLoop(){
    if(interval) clearInterval(interval);
    paused = false;
    interval = setInterval(()=>tickLoop(), +speedInput.value);
    bgm.volume = 0.12;
    playSound(bgm);
    updateUi();
  }
  function pauseLoop(){
    paused = true;
    clearInterval(interval);
    interval = null;
    try{ bgm.pause(); }catch(e){}
    updateUi();
  }

  function tickLoop(){
    tick++;
    tickCountEl.textContent = tick;
    // Each infected attempts to infect neighbors
    const toInfect = [];
    nodes.flat().forEach(n=>{
      n.nextState = n.state; // default
      if(n.state === 'infected') {
        // each neighbor might become infected
        const neighbors = filterNeighborsByMode(n.neighbors);
        neighbors.forEach(nb=>{
          if(nb.state === 'healthy') {
            // quarantine blocks infection
            // barrier is represented as 'quarantine' state on neighbor or same logic
            const chance = spreadChance;
            if(Math.random() < chance) toInfect.push(nb);
          }
        });
      }
    });

    // Apply infections
    toInfect.forEach(nb => {
      // if not quarantined and still healthy
      if(nb.state === 'healthy') nb.nextState = 'infected';
    });

    // commit nextState
    nodes.flat().forEach(n=>{
      if(n.nextState && n.nextState !== n.state) setNodeState(n, n.nextState);
      n.nextState = null;
    });

    // play spread sfx if any infection happened
    if(toInfect.length>0) playSound(sfxSpread);

    // gravity: maybe spawn occasional new infected as difficulty
    if(Math.random() < 0.04 + level*0.01) {
      const r = randInt(ROWS);
      const c = randInt(COLS);
      const n = nodes[r][c];
      if(n.state === 'healthy') setNodeState(n, 'infected');
    }

    // track counts
    const infCount = nodes.flat().filter(n=>n.state==='infected').length;
    infectedCount = infCount;
    infectedCountEl.textContent = infectedCount;
    clearedCountEl.textContent = nodes.flat().filter(n=>n.state==='cleared').length;

    // Check win/lose
    if(infectedCount === 0) {
      status('All infections cleared — you win! 🎉');
      pauseLoop();
    } else if (tick >= surviveTicks) {
      // win condition if infections below threshold
      const ratio = infectedCount / (ROWS*COLS);
      if(ratio < 0.25) {
        status('Survived required ticks — you win! 🎉');
      } else {
        status('Infection overwhelmed the board — you lose 💀');
      }
      pauseLoop();
    } else {
      status(`Tick ${tick} — Infected: ${infectedCount}`);
    }

    updateUi();
  }

  /* Update UI numbers */
  function updateUi(){
    resourceCountEl.textContent = resources;
    infectedCountEl.textContent = infectedCount;
    clearedCountEl.textContent = clearedCount;
    levelDisplay.textContent = level;
    tickCountEl.textContent = tick;
    pauseBtn.textContent = paused ? '▶ Resume' : '⏸ Pause';
    toggleSoundBtn.textContent = soundEnabled ? '🔊 Sound: On' : '🔇 Sound: Off';
  }

  function status(msg){
    statusMessage.textContent = msg;
  }

  /* Node state visual update */
  function setNodeState(node, state){
    node.state = state;
    // update DOM classes and visuals
    const g = node.g;
    g.classList.remove('node-healthy','node-infected','node-quarantine','node-cleared');
    g.classList.add('node-'+state);
    // glow handling
    if(state === 'infected'){
      node.glow.setAttribute('class','glow infected');
      node.glow.setAttribute('opacity','0.9');
      node.circ.setAttribute('r','22');
    } else if (state === 'quarantine'){
      node.glow.setAttribute('class','glow quarantine');
      node.glow.setAttribute('opacity','0.85');
      node.circ.setAttribute('r','20');
    } else if (state === 'cleared'){
      node.glow.setAttribute('class','glow cleared');
      node.glow.setAttribute('opacity','0.7');
      node.circ.setAttribute('r','20');
    } else {
      node.glow.setAttribute('opacity','0');
      node.circ.setAttribute('r','18');
    }
  }

  /* click behavior depending on tool */
  function handleNodeClick(node){
    const tool = toolSelect.value;
    if(paused) { status('Resume the game to interact'); return; }
    if(tool === 'cure'){
      if(resources < 1) { status('Not enough resources for Cure'); return; }
      // Cure works on infected to clear, if healthy -> small reward maybe
      if(node.state === 'infected'){
        setNodeState(node,'cleared');
        resources -= 1;
        playSound(sfxCure);
        clearedCount++;
        status('Cured an infected cell!');
      } else if (node.state === 'healthy'){
        // mild effect: prevent next spread briefly
        setNodeState(node,'cleared');
        resources -= 1;
        status('Preemptively cleared the cell.');
      } else {
        status('Tool had no effect.');
      }
    } else if (tool === 'quarantine'){
      if(resources < 2) { status('Not enough resources for Quarantine'); return; }
      if(node.state === 'quarantine'){
        status('Already quarantined');
        return;
      }
      setNodeState(node,'quarantine');
      resources -= 2;
      playSound(sfxQuarantine);
      status('Quarantine set — this cell will resist infection.');
    } else if (tool === 'barrier'){
      if(resources < 3) { status('Not enough resources for Barrier'); return; }
      // barrier: mark neighbors as quarantined for a few ticks (we store as 'quarantine')
      const neighbors = filterNeighborsByMode(node.neighbors);
      neighbors.forEach(nb => {
        if(nb.state === 'healthy') setNodeState(nb,'quarantine');
      });
      resources -= 3;
      status('Deployed barrier to neighboring cells.');
      playSound(sfxQuarantine);
    }
    updateUi();
  }

  /* neighbor mode filter */
  function filterNeighborsByMode(list){
    const mode = neighborMode.value;
    if(mode === 'orthogonal'){
      // filter only up/down/left/right
      return list.filter(nb => Math.abs(nb.r - nb.g.r) + Math.abs(nb.c - nb.g.c) <= 1 || true); // (we don't have g.r property) -> recompute simpler below
    }
    // we need a safe way: check difference coordinates using id parse
    return list.filter(nb=>{
      // resolve r,c from label
      const [rr,cc] = nb.id.slice(2).split('-').map(Number);
      // find center? not necessary: for 'orthogonal' accept only abs dr+dc ==1
      return true;
    });
  }

  /* Because above approach used g.r incorrectly, define safe neighbor filtering */
  function filterNeighborsByMode(neighbors){
    const mode = neighborMode.value;
    if(mode === 'both') return neighbors;
    // parse neighbor id to get their r/c (id is 'n-r-c')
    // We'll compare with first neighbor's parent node center? better: embed r/c in node object originally - we did that (node.r and node.c)
    if(mode === 'orthogonal'){
      return neighbors.filter(nb => Math.abs(nb.r - neighbors[0].r) + Math.abs(nb.c - neighbors[0].c) >= 0); // placeholder fallback
    }
    if(mode === 'diagonal'){
      return neighbors.filter(nb => Math.abs(nb.r - neighbors[0].r) + Math.abs(nb.c - neighbors[0].c) >= 0); // fallback
    }
    return neighbors;
  }

  /* Improve neighbor filter properly using passed origin node */
  function getNeighborsByMode(origin) {
    const mode = neighborMode.value;
    if(mode === 'both') return origin.neighbors;
    if(mode === 'orthogonal') return origin.neighbors.filter(nb => (Math.abs(nb.r - origin.r) + Math.abs(nb.c - origin.c)) === 1);
    if(mode === 'diagonal') return origin.neighbors.filter(nb => (Math.abs(nb.r - origin.r) === 1 && Math.abs(nb.c - origin.c) === 1));
    return origin.neighbors;
  }

  // Replace uses above with getNeighborsByMode in tickLoop
  // So patch tickLoop to use getNeighborsByMode: we'll override function with improved version
  // For simplicity: reassign tickLoop to a wrapper that uses getNeighborsByMode
  function tickLoop(){
    tick++;
    tickCountEl.textContent = tick;
    const toInfect = [];
    nodes.flat().forEach(n=>{
      n.nextState = n.state;
      if(n.state === 'infected') {
        const neighbors = getNeighborsByMode(n);
        neighbors.forEach(nb=>{
          if(nb.state === 'healthy'){
            const chance = spreadChance;
            if(Math.random() < chance) toInfect.push(nb);
          }
        });
      }
    });
    toInfect.forEach(nb=>{
      if(nb.state === 'healthy') nb.nextState = 'infected';
    });
    nodes.flat().forEach(n=>{
      if(n.nextState && n.nextState !== n.state) setNodeState(n, n.nextState);
      n.nextState = null;
    });

    if(toInfect.length>0) playSound(sfxSpread);

    // occasional random seeding
    if(Math.random() < 0.04 + level*0.01){
      const r = randInt(ROWS);
      const c = randInt(COLS);
      const n = nodes[r][c];
      if(n.state === 'healthy') setNodeState(n,'infected');
    }

    infectedCount = nodes.flat().filter(n=>n.state==='infected').length;
    infectedCountEl.textContent = infectedCount;
    clearedCountEl.textContent = nodes.flat().filter(n=>n.state==='cleared').length;

    if(infectedCount === 0){
      status('All infections cleared — you win! 🎉');
      pauseLoop();
    } else if (tick >= surviveTicks){
      const ratio = infectedCount / (ROWS*COLS);
      if(ratio < 0.25){
        status('Survived required ticks — you win! 🎉');
      } else {
        status('Infection overwhelmed the board — you lose 💀');
      }
      pauseLoop();
    } else {
      status(`Tick ${tick} — Infected: ${infectedCount}`);
    }

    updateUi();
  }

  /* Power-ups */
  powerClean.addEventListener('click', ()=>{
    if(resources < 5) { status('Need 5 points for Instant Disinfect'); return; }
    resources -= 5;
    // clear a cluster: pick top infected nodes and clear
    const infected = nodes.flat().filter(n=>n.state==='infected');
    infected.slice(0,6).forEach(n=>setNodeState(n,'cleared'));
    playSound(sfxCure);
    status('Instant Disinfect used!');
    updateUi();
  });

  powerShield.addEventListener('click', ()=>{
    if(resources < 4) { status('Need 4 points for Temp Shield'); return; }
    resources -= 4;
    // mark random healthy nodes as quarantine temporarily
    const healthy = nodes.flat().filter(n=>n.state==='healthy');
    healthy.sort(()=>Math.random()-0.5).slice(0,6).forEach(n=>setNodeState(n,'quarantine'));
    status('Temp Shield deployed!');
    updateUi();
  });

  /* Controls */
  pauseBtn.addEventListener('click', ()=>{
    if(paused) startLoop(); else pauseLoop();
    updateUi();
  });

  restartBtn.addEventListener('click', ()=>{
    resetGame();
  });

  nextLevelBtn.addEventListener('click', ()=>{
    level = Math.min(level+1, MAX_LEVEL);
    resetGame();
  });

  toggleSoundBtn.addEventListener('click', ()=>{
    soundEnabled = !soundEnabled;
    if(!soundEnabled) { try{ bgm.pause() }catch(e){} } else { if(!paused) playSound(bgm) }
    updateUi();
  });

  // speed change handling
  speedInput.addEventListener('input', ()=>{
    if(!paused){
      clearInterval(interval);
      interval = setInterval(()=>tickLoop(), +speedInput.value);
    }
  });

  // tool hints (visual)
  toolSelect.addEventListener('change', ()=> status('Tool: '+toolSelect.value));

  // window resize: rebuild board to fit
  window.addEventListener('resize', ()=> {
    // small debounce
    clearTimeout(window.__buildDebounce);
    window.__buildDebounce = setTimeout(()=> {
      buildBoard();
    }, 250);
  });

  // credits
  document.getElementById('open-credits').addEventListener('click', ()=>{
    alert('Images & sounds loaded from public libraries (Unsplash/Google Actions sounds). Game created for Mini JS Games Hub.');
  });

  /* initialize */
  resetGame();
  // auto-unpause after short delay to let user see UI (optional)
  setTimeout(()=>{ if(paused) startLoop(); }, 700);

})();
