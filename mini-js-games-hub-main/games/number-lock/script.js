/* Number Lock Challenge
   - multi-puzzle levels
   - reveals digits when puzzles solved
   - timer, pause, restart, hints, scoring
   - uses online assets for sounds/images
*/

(() => {
  // DOM
  const startBtn = document.getElementById("start-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const resumeBtn = document.getElementById("resume-btn");
  const restartBtn = document.getElementById("restart-btn");
  const hintBtn = document.getElementById("hint-btn");
  const submitBtn = document.getElementById("submit-puzzle");
  const puzzleTitle = document.getElementById("puzzle-title");
  const puzzleBody = document.getElementById("puzzle-body");
  const feedbackEl = document.getElementById("feedback");
  const codeDisplay = document.getElementById("code-display");
  const levelEl = document.getElementById("level");
  const scoreEl = document.getElementById("score");
  const hintsEl = document.getElementById("hints");
  const timerEl = document.getElementById("timer");
  const progressBar = document.getElementById("progress-bar");
  const soundToggle = document.getElementById("sound-toggle");

  // sounds (online sources)
  const SND = {
    correct: new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"),
    wrong: new Audio("https://actions.google.com/sounds/v1/cartoon/slide_whistle_to_drum_hit.ogg"),
    reveal: new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg"),
    win: new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_short.ogg"),
    tick: new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"),
  };
  // small utility to play
  function playSound(name) {
    if (!soundToggle.checked) return;
    const s = SND[name];
    if (!s) return;
    s.currentTime = 0;
    s.play().catch(()=>{});
  }

  // Game state
  let level = 1;
  let totalScore = 0;
  let hints = 3;
  let code = []; // digits to reveal
  let revealed = [];
  let currentPuzzle = null;
  let timer = null;
  let pauseTimeLeft = 0;
  let timeLeft = 0;
  let isRunning = false;
  let digitsToReveal = 4;

  // Config
  const LEVEL_TIME_BASE = 60; // seconds base (reduces for higher difficulty)
  const MAX_LEVEL = 20;

  // available puzzle generators
  const puzzleGenerators = [
    mathPuzzle,
    sequencePuzzle,
    memoryPuzzle,
    sliderPuzzle,
    logicPuzzle,
    binaryPuzzle
  ];

  // helpers
  function randomInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

  // setup code display
  function buildCodeDisplay(len){
    codeDisplay.innerHTML = "";
    for(let i=0;i<len;i++){
      const dv = document.createElement("div");
      dv.className = "code-digit hidden";
      dv.dataset.index = i;
      dv.textContent = code[i] ?? "•";
      codeDisplay.appendChild(dv);
    }
  }

  function revealDigit(index){
    if (revealed[index]) return;
    revealed[index]=true;
    const el = codeDisplay.querySelector(`.code-digit[data-index="${index}"]`);
    if (el) {
      el.classList.remove("hidden");
      el.classList.add("revealed");
      el.textContent = code[index];
      playSound("reveal");
    }
  }

  // create code for a level (digits 0-9)
  function generateCode(len){
    const arr=[];
    for(let i=0;i<len;i++) arr.push(String(randomInt(0,9)));
    return arr;
  }

  // timer functions
  function startTimer(seconds){
    clearInterval(timer);
    timeLeft = seconds;
    updateTimerUI();
    timer = setInterval(()=>{
      if (!isRunning) return;
      timeLeft--;
      updateTimerUI();
      if (timeLeft<=0){
        clearInterval(timer);
        onTimeUp();
      }
    },1000);
  }
  function pauseGame(){
    isRunning=false;
    pauseBtn.disabled=true;
    resumeBtn.disabled=false;
    playSound("tick");
  }
  function resumeGame(){
    isRunning=true;
    pauseBtn.disabled=false;
    resumeBtn.disabled=true;
  }
  function updateTimerUI(){
    const mm = Math.floor(timeLeft/60).toString().padStart(2,'0');
    const ss = (timeLeft%60).toString().padStart(2,'0');
    timerEl.textContent = `${mm}:${ss}`;
    const pct = Math.max(0, Math.min(100, Math.round(((code.length - unrevealedCount())/code.length)*100)));
    progressBar.style.width = pct + "%";
  }

  function unrevealedCount(){ return code.filter((d,i)=>!revealed[i]).length; }

  // Level flow
  function startLevel(){
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    restartBtn.disabled = false;
    resumeBtn.disabled = true;
    levelEl.textContent = level;
    hintsEl.textContent = hints;
    // set code length and digits to reveal by level
    digitsToReveal = 4 + Math.floor((level-1)/5); // increases slowly
    const len = Math.min(6, digitsToReveal); // cap length
    code = generateCode(len);
    revealed = Array(len).fill(false);
    buildCodeDisplay(len);
    // pick puzzle types for this level: number equals digits to reveal (1 puzzle can reveal 1 or more digits)
    // We'll present puzzles sequentially until all digits revealed
    queuePuzzlesForLevel(level, len);
    // set timer: base minus difficulty boost
    const levelTime = Math.max(20, LEVEL_TIME_BASE - (level*2 + (len*6)));
    startTimer(levelTime);
    generateNextPuzzle();
    updateTimerUI();
  }

  // When time runs out
  function onTimeUp(){
    isRunning=false;
    feedback("⏱️ Time up! Level failed.", true);
    playSound("wrong");
    // penalty
    totalScore = Math.max(0, totalScore - 20);
    scoreEl.textContent = totalScore;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
  }

  // Queue puzzles
  let puzzleQueue = [];
  function queuePuzzlesForLevel(lev, len){
    puzzleQueue = [];
    // choose random puzzles (at least len puzzles), each with possible revealCount 1..2
    const want = len;
    for(let i=0;i<want;i++){
      const gen = puzzleGenerators[randomInt(0, puzzleGenerators.length-1)];
      puzzleQueue.push({gen, reveal: randomInt(1, Math.min(2, len))});
    }
    // For higher levels, add some multi-digit puzzles
    if (lev>=6) puzzleQueue.push({gen: puzzleGenerators[4], reveal:2});
    if (lev>=10) puzzleQueue.push({gen: puzzleGenerators[5], reveal:2});
  }

  // generate next puzzle from queue
  function generateNextPuzzle(){
    if (!isRunning) return;
    // check if all digits revealed
    if (revealed.every(v=>v===true)){
      onLevelComplete();
      return;
    }
    // pop next
    if (puzzleQueue.length===0) {
      // refill simple puzzles
      queuePuzzlesForLevel(level, code.length);
    }
    currentPuzzle = puzzleQueue.shift();
    const difficultyFactor = Math.floor((level-1)/3);
    const puzzle = currentPuzzle.gen({level, difficultyFactor});
    renderPuzzle(puzzle);
  }

  // sample puzzle renderers
  function renderPuzzle(p){
    puzzleTitle.textContent = p.title;
    puzzleBody.innerHTML = ""; // clear

    // content depends on type
    const container = document.createElement("div");
    container.className = "puzzle-card";
    if (p.type === "math") {
      const q = document.createElement("div");
      q.innerHTML = `<strong>${p.question}</strong>`;
      const input = document.createElement("input");
      input.type="number"; input.className="puzzle-input"; input.id="puzzle-input";
      input.placeholder="Answer";
      container.appendChild(q); container.appendChild(input);
      submitBtn.disabled=false;
      submitBtn.onclick = () => {
        const val = input.value.trim();
        if (val === "") return feedback("Enter an answer first.", true);
        if (String(p.answer) === String(val)) {
          onPuzzleSolved(p);
        } else onPuzzleFailed(p);
      };
    } else if (p.type === "sequence"){
      const q = document.createElement("div");
      q.innerHTML = `<strong>${p.question}</strong>`;
      const input = document.createElement("input");
      input.type="number"; input.className="puzzle-input"; input.id="puzzle-input";
      input.placeholder="Next number";
      container.appendChild(q); container.appendChild(input);
      submitBtn.disabled=false;
      submitBtn.onclick = () => {
        const val = input.value.trim();
        if (String(p.answer) === String(val)) onPuzzleSolved(p); else onPuzzleFailed(p);
      };
    } else if (p.type === "memory"){
      // show sequence briefly then ask
      const img = document.createElement("img");
      img.src = "https://source.unsplash.com/400x240/?memory,brain";
      img.className = "puzzle-illu";
      container.appendChild(img);
      const seqDiv = document.createElement("div");
      seqDiv.innerHTML = `<p>Memorize this sequence:</p>`;
      const seqSpan = document.createElement("div");
      seqSpan.style.fontSize="26px"; seqSpan.style.letterSpacing="6px";
      seqSpan.style.marginTop="8px"; seqSpan.textContent = p.sequence.join(" ");
      seqDiv.appendChild(seqSpan);
      container.appendChild(seqDiv);
      // show for short time
      submitBtn.disabled=true;
      setTimeout(()=>{
        seqSpan.textContent = "• • • • •";
        const input = document.createElement("input");
        input.type="text"; input.className="puzzle-input"; input.id="puzzle-input";
        input.placeholder="Type the sequence separated by space";
        container.appendChild(input);
        submitBtn.disabled=false;
        submitBtn.onclick = () => {
          const val = input.value.trim();
          const normalized = val.split(/\s+/).map(s=>s.trim()).filter(Boolean);
          if (normalized.join(",") === p.sequence.join(",")) onPuzzleSolved(p); else onPuzzleFailed(p);
        };
      }, Math.max(1000, 2500 - p.level*50));
    } else if (p.type === "slider"){
      const q = document.createElement("div");
      q.innerHTML = `<p>${p.question}</p>`;
      const slider = document.createElement("input");
      slider.type="range"; slider.min="0"; slider.max="100"; slider.value="50";
      slider.id = "puzzle-input";
      container.appendChild(q); container.appendChild(slider);
      const check = document.createElement("div"); check.style.marginTop="8px"; check.style.fontSize="13px"; check.style.color="var(--muted)";
      check.textContent = "Adjust to correct tile value and submit";
      container.appendChild(check);
      submitBtn.disabled=false;
      submitBtn.onclick = () => {
        // check closeness
        const val = Number(slider.value);
        if (Math.abs(val - p.answer) <= p.tolerance) onPuzzleSolved(p); else onPuzzleFailed(p);
      };
    } else if (p.type === "logic"){
      const q = document.createElement("div");
      q.innerHTML = `<strong>${p.question}</strong>`;
      const input = document.createElement("input");
      input.type="text"; input.className="puzzle-input"; input.id="puzzle-input";
      input.placeholder="Answer (single digit)";
      container.appendChild(q); container.appendChild(input);
      submitBtn.disabled=false;
      submitBtn.onclick = () => {
        const val = input.value.trim().toLowerCase();
        if (String(p.answer) === val) onPuzzleSolved(p); else onPuzzleFailed(p);
      };
    } else if (p.type === "binary"){
      const q = document.createElement("div");
      q.innerHTML = `<p>${p.question}</p>`;
      const input = document.createElement("input");
      input.type="text"; input.className="puzzle-input"; input.id="puzzle-input";
      input.placeholder="Decimal value";
      container.appendChild(q); container.appendChild(input);
      submitBtn.disabled=false;
      submitBtn.onclick = () => {
        const val = input.value.trim();
        if (String(p.answer) === String(val)) onPuzzleSolved(p); else onPuzzleFailed(p);
      };
    } else {
      container.innerHTML = `<p>Unknown puzzle</p>`;
      submitBtn.disabled=true;
    }

    // image or hint area
    const img = document.createElement("img");
    img.src = p.image || "https://source.unsplash.com/420x240/?puzzle,challenge";
    img.className = "puzzle-illu";
    puzzleBody.appendChild(img);
    puzzleBody.appendChild(container);
    feedbackEl.textContent = "";
  }

  // feedback
  function feedback(msg, isError=false){
    feedbackEl.textContent = msg;
    feedbackEl.style.color = isError ? '#ffb3b3' : '#b8ffd6';
    if (!isError) playSound("correct"); else playSound("wrong");
    setTimeout(()=>{ if (feedbackEl.textContent===msg) feedbackEl.textContent=""; }, 3000);
  }

  function onPuzzleSolved(p){
    // reveal random unrevealed digit positions equal to p.reveal
    let toReveal = p.reveal || 1;
    let indices = [];
    for(let i=0;i<code.length;i++) if(!revealed[i]) indices.push(i);
    // shuffle
    indices = indices.sort(()=>Math.random()-0.5);
    const revealIndices = indices.slice(0,toReveal);
    revealIndices.forEach(idx=>revealDigit(idx));
    // scoring: base + speed bonus
    const scoreGain = 20 + (p.difficulty*5) + (Math.max(0, Math.floor(timeLeft/10)));
    totalScore += scoreGain;
    scoreEl.textContent = totalScore;
    feedback("✔️ Correct! Digit revealed.");
    playSound("correct");
    // small delay then next
    setTimeout(()=> generateNextPuzzle(), 800);
  }

  function onPuzzleFailed(p){
    feedback("❌ Incorrect. Try next puzzle or use a hint.", true);
    totalScore = Math.max(0, totalScore - 8); scoreEl.textContent = totalScore;
    playSound("wrong");
    // allow moving on
    setTimeout(()=> generateNextPuzzle(), 900);
  }

  function onLevelComplete(){
    isRunning=false;
    clearInterval(timer);
    playSound("win");
    feedback("🎉 Level complete! Digits unlocked.", false);
    totalScore += 50 + level*10;
    scoreEl.textContent = totalScore;
    // advance level
    level = Math.min(MAX_LEVEL, level+1);
    levelEl.textContent = level;
    startBtn.disabled=false;
    pauseBtn.disabled=true;
    resumeBtn.disabled=true;
  }

  // hints
  hintBtn.addEventListener("click", ()=> {
    if (!isRunning) return feedback("Start the level first.", true);
    if (hints<=0) return feedback("No hints left.", true);
    // reveal one digit partially (reveal one unrevealed index)
    const idx = code.findIndex((d,i)=>!revealed[i]);
    if (idx === -1) return feedback("Nothing to hint.", true);
    hints--;
    hintsEl.textContent = hints;
    // reveal but mark reduced score
    revealDigit(idx);
    totalScore = Math.max(0, totalScore - 15);
    scoreEl.textContent = totalScore;
    playSound("reveal");
    feedback("Hint used — a digit was revealed (score penalty).");
  });

  // Start / pause / resume / restart handlers
  startBtn.addEventListener("click", ()=>{
    // reset some game state on fresh start
    if (!isRunning && startBtn.disabled===false){
      // keep current level and hints/score
      isRunning=true;
      startLevel();
      startBtn.disabled=true;
    } else if (!isRunning){
      // resume if paused
      resumeGame();
    }
  });

  pauseBtn.addEventListener("click", ()=>{
    if (!isRunning) return;
    pauseGame();
  });
  resumeBtn.addEventListener("click", ()=>{
    resumeGame();
  });
  restartBtn.addEventListener("click", ()=>{
    // reset everything for the current level
    isRunning=false;
    clearInterval(timer);
    totalScore = Math.max(0,Math.floor(totalScore/2));
    scoreEl.textContent = totalScore;
    hints = 3;
    hintsEl.textContent = hints;
    level = 1;
    levelEl.textContent = level;
    startBtn.disabled=false;
    pauseBtn.disabled=true;
    resumeBtn.disabled=true;
    restartBtn.disabled=true;
    codeDisplay.innerHTML = "";
    puzzleBody.innerHTML = `<img src="https://source.unsplash.com/640x360/?puzzle,game" class="puzzle-illu" /><p class="puzzle-instruction">Press Start to play</p>`;
    playSound("wrong");
  });

  // puzzle generators
  function mathPuzzle({level,difficultyFactor}){
    const op = ["+","-","*"][randomInt(0,2)];
    const a= randomInt(1,10 + level*2);
    const b= randomInt(1,6 + difficultyFactor*3);
    let q,ans;
    if (op==="*"){ q=`${a} × ${b}`; ans = a*b; } 
    else if (op==="+"){ q=`${a} + ${b}`; ans=a+b; } 
    else { q=`${a} - ${b}`; ans=a-b; }
    return {type:"math",title:"Math Puzzle",question:`Compute: ${q}`, answer:ans, image:`https://source.unsplash.com/420x240/?math,calculation`, difficulty:1+difficultyFactor, reveal: currentPuzzle?.reveal || 1,level};
  }

  function sequencePuzzle({level,difficultyFactor}){
    // arithmetic or Fibonacci-like
    const base = randomInt(1,6 + difficultyFactor*3);
    const step = randomInt(1,5 + difficultyFactor*2);
    const len = 4;
    const arr = Array.from({length:len},(_,i)=> base + i*step);
    const question = `Sequence: ${arr.join(", ")} — what is next?`;
    const answer = arr[arr.length-1] + step;
    return {type:"sequence",title:"Pattern Sequence",question,answer,image:`https://source.unsplash.com/420x240/?sequence,pattern`,difficulty:1+difficultyFactor,reveal: currentPuzzle?.reveal || 1,level};
  }

  function memoryPuzzle({level,difficultyFactor}){
    const count = Math.min(6,3 + difficultyFactor + (level>6?1:0));
    const seq = Array.from({length:count},()=>String(randomInt(0,9)));
    return {type:"memory",title:"Memory Recall",sequence:seq,answer:seq, image:`https://source.unsplash.com/420x240/?memory,brain`, difficulty:1+difficultyFactor,reveal: currentPuzzle?.reveal || 1,level};
  }

  function sliderPuzzle({level,difficultyFactor}){
    // answer is a value near midpoint, tolerance depends on level
    const answer = randomInt(20,80);
    const tol = Math.max(2, 10 - difficultyFactor*2);
    return {type:"slider",title:"Slider Match",question:`Adjust the slider to match the hidden value (0–100)`,answer, tolerance:tol, image:`https://source.unsplash.com/420x240/?slider,control`,difficulty:1+difficultyFactor,reveal: currentPuzzle?.reveal || 1,level};
  }

  function logicPuzzle({level,difficultyFactor}){
    // simple riddles that map to a digit
    const riddlePool = [
      {q:"I have four legs in the morning, two at noon, and three at night. What is the first digit of that count?", a:"4"},
      {q:"How many sides does a triangle have?", a:"3"},
      {q:"How many wheels on a tricycle?", a:"3"},
      {q:"How many months have 31 days?", a:"7"},
      {q:"How many continents are there on Earth?", a:"7"},
      {q:"If you roll a standard die, what's the highest face value?", a:"6"}
    ];
    const pick = riddlePool[randomInt(0, riddlePool.length-1)];
    return {type:"logic",title:"Logic Riddle",question:pick.q,answer:pick.a,image:`https://source.unsplash.com/420x240/?riddle,logic`,difficulty:1+difficultyFactor,reveal: currentPuzzle?.reveal || 1,level};
  }

  function binaryPuzzle({level,difficultyFactor}){
    const val = randomInt(1,15 + difficultyFactor*5);
    const bin = val.toString(2);
    return {type:"binary",title:"Binary Decode",question:`Convert binary ${bin} to decimal`,answer:val,image:`https://source.unsplash.com/420x240/?binary,code`,difficulty:1+difficultyFactor,reveal: currentPuzzle?.reveal || 1,level};
  }

  // initial UI setup
  function initUI(){
    // code display empty
    codeDisplay.innerHTML = '<div class="code-digit hidden">•</div><div class="code-digit hidden">•</div><div class="code-digit hidden">•</div><div class="code-digit hidden">•</div>';
    // attract glow
    const digits = document.querySelectorAll(".code-digit");
    digits.forEach((d,i)=> d.style.transition = "all 400ms ease");
    // bind keyboard: Enter to submit if input focused
    document.addEventListener("keydown",(e)=>{
      if (e.key === "Enter"){
        if (!submitBtn.disabled) submitBtn.click();
      }
    });

    pauseBtn.disabled=true;
    resumeBtn.disabled=true;
    restartBtn.disabled=true;
  }

  // start
  initUI();

  // expose for debug (optional)
  window.__NL = {
    startLevel, generateNextPuzzle, onLevelComplete
  };
})();
