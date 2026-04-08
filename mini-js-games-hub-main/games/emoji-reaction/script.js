/* Emoji Reaction Test
   Advanced, progressive difficulty, pause/restart, sound toggle.
   Uses online sounds hosted by Google's public action-sounds.
*/

(() => {
  const EMOJI_BANK = [
    { emoji: "😀", meaning: "Happy / Smile" },
    { emoji: "😂", meaning: "Laugh / Tears" },
    { emoji: "😢", meaning: "Sad / Cry" },
    { emoji: "😡", meaning: "Angry" },
    { emoji: "😍", meaning: "Love / Heart eyes" },
    { emoji: "🤔", meaning: "Thinking / Ponder" },
    { emoji: "😴", meaning: "Sleepy / Sleep" },
    { emoji: "🤮", meaning: "Disgust / Sick" },
    { emoji: "😱", meaning: "Shocked / Fear" },
    { emoji: "👍", meaning: "Thumbs up / Good" },
    { emoji: "👎", meaning: "Thumbs down / Bad" },
    { emoji: "🎉", meaning: "Celebration / Party" },
    { emoji: "🔥", meaning: "Fire / Hot" },
    { emoji: "⏳", meaning: "Waiting / Time" },
    { emoji: "🪄", meaning: "Magic / Surprise" },
    { emoji: "💤", meaning: "Sleep / Zzz" },
    { emoji: "⚠️", meaning: "Warning / Caution" },
    { emoji: "💡", meaning: "Idea / Lightbulb" }
  ];

  // DOM refs
  const emojiDisplay = document.getElementById("emojiDisplay");
  const optionsEl = document.getElementById("options");
  const scoreEl = document.getElementById("score");
  const roundEl = document.getElementById("round");
  const timeLeftEl = document.getElementById("timeLeft");
  const avgRtEl = document.getElementById("avgRt");
  const pauseBtn = document.getElementById("pauseBtn");
  const restartBtn = document.getElementById("restartBtn");
  const soundToggle = document.getElementById("soundToggle");
  const hintBtn = document.getElementById("hintBtn");
  const hintText = document.getElementById("hintText");
  const diffProg = document.getElementById("difficultyProgress");

  const sndCorrect = document.getElementById("soundCorrect");
  const sndWrong = document.getElementById("soundWrong");
  const sndTick = document.getElementById("soundTick");

  // game state
  let state = {
    running: true,
    score: 0,
    round: 0,
    difficulty: 1,      // 1..10
    timeLimit: 4000,    // ms per round, reduces as difficulty increases
    avgReaction: 0,
    reactions: [],
    current: null,
    answerIdx: null,
    timer: null,
    roundStart: null,
    soundOn: true,
    paused: false
  };

  // utility
  function randInt(max){ return Math.floor(Math.random()*max) }
  function shuffle(arr){ return arr.slice().sort(()=>Math.random()-0.5) }

  // audio helpers
  function playSound(el){
    if(!state.soundOn) return;
    try{ el.currentTime = 0; el.play(); }catch(e){}
  }

  // render functions
  function showEmoji(emojiObj){
    emojiDisplay.classList.remove("glow");
    void emojiDisplay.offsetWidth;
    emojiDisplay.textContent = emojiObj.emoji;
    // small bounce glow
    emojiDisplay.classList.add("glow");
  }

  function buildOptions(correctMeaning){
    // pick 3 distractors + correct => 4 options
    const meaningsPool = EMOJI_BANK.map(e=>e.meaning).filter(m=>m!==correctMeaning);
    const choices = shuffle(meaningsPool).slice(0,3);
    choices.push(correctMeaning);
    const final = shuffle(choices);
    optionsEl.innerHTML = "";
    final.forEach((text, idx)=>{
      const b = document.createElement("button");
      b.className = "option-btn";
      b.setAttribute("data-index", idx);
      b.setAttribute("aria-label", text);
      b.textContent = text;
      b.addEventListener("click", onOptionClick);
      optionsEl.appendChild(b);
    });
  }

  function updateStatus(){
    scoreEl.textContent = state.score;
    roundEl.textContent = state.round;
    avgRtEl.textContent = state.reactions.length ? Math.round(state.reactions.reduce((a,b)=>a+b,0)/state.reactions.length) : "--";
    diffProg.value = state.difficulty;
  }

  function setTimeLeft(ms){
    timeLeftEl.textContent = Math.max(0, Math.round(ms));
  }

  // game flow
  function nextRound(){
    if(state.paused) return;
    // increase round
    state.round++;
    // adjust difficulty every 3 rounds
    if(state.round % 3 === 0 && state.difficulty < 10){
      state.difficulty++;
      // lower timeLimit as difficulty grows
      state.timeLimit = Math.max(1200, 4000 - (state.difficulty-1)*300);
    }
    // choose emoji
    const candidate = EMOJI_BANK[randInt(EMOJI_BANK.length)];
    state.current = candidate;
    showEmoji(candidate);
    buildOptions(candidate.meaning);
    // reset hint
    hintText.textContent = "";
    hintText.setAttribute("aria-hidden","true");

    // start timer
    state.roundStart = performance.now();
    let deadline = state.timeLimit;
    setTimeLeft(deadline);

    // clear any existing timer
    if(state.timer) clearInterval(state.timer);
    state.timer = setInterval(()=>{
      if(state.paused) return;
      const elapsed = performance.now() - state.roundStart;
      const remaining = Math.max(0, Math.round((deadline - elapsed)));
      setTimeLeft(remaining);
      if(remaining <= 800 && state.soundOn) {
        // play tick near the end (only once per round)
        playSound(sndTick);
      }
      if(remaining <= 0){
        clearInterval(state.timer);
        markWrong(null, true); // timed out
      }
    }, 60);

    updateStatus();
  }

  // answer handling
  function markCorrect(button){
    // style
    if(button) button.classList.add("correct");
    // compute reaction
    const rt = Math.round(performance.now() - state.roundStart);
    state.reactions.push(rt);
    state.score += Math.max(10, Math.round(6000 / Math.max(150, rt))); // more points for faster
    if(state.score < 0) state.score = 0;
    updateStatus();
    playSound(sndCorrect);
    // brief pause then next round
    endRoundThenNext();
  }

  function markWrong(button, timeout=false){
    if(button) button.classList.add("wrong");
    if(timeout){
      // reveal correct
      revealCorrect();
    } else {
      // show correct then continue
      revealCorrect();
    }
    state.score -= 3;
    if(state.score < 0) state.score = 0;
    playSound(sndWrong);
    endRoundThenNext();
  }

  function revealCorrect(){
    // find the option with the correct meaning and flash it
    const btns = Array.from(optionsEl.querySelectorAll(".option-btn"));
    btns.forEach(b=>{
      if(b.textContent === state.current.meaning){
        b.classList.add("correct");
      }
    });
  }

  function endRoundThenNext(){
    // stop timer
    if(state.timer) clearInterval(state.timer);
    // brief delay so users see feedback
    setTimeout(()=> {
      // small chance to increase difficulty quicker on streaks
      if(state.reactions.length > 0 && state.reactions.slice(-3).every(rt => rt < state.timeLimit * 0.5) && state.difficulty < 10){
        state.difficulty++;
      }
      updateStatus();
      nextRound();
    }, 900);
  }

  function onOptionClick(e){
    if(state.paused) return;
    const btn = e.currentTarget;
    // ignore repeat clicks
    if(btn.classList.contains("correct") || btn.classList.contains("wrong")) return;

    const chosen = btn.textContent;
    if(chosen === state.current.meaning){
      markCorrect(btn);
    }else{
      markWrong(btn, false);
    }
  }

  // controls
  pauseBtn.addEventListener("click", ()=>{
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? "Resume" : "Pause";
    if(state.paused){
      if(state.timer) clearInterval(state.timer);
    } else {
      // resume by adjusting roundStart so remaining time preserved
      state.roundStart = performance.now() - (state.timeLimit - parseInt(timeLeftEl.textContent || 0));
      nextRound(); // will setup timers but won't advance round since paused flag false
    }
  });

  restartBtn.addEventListener("click", ()=>{
    resetGame();
    startGame();
  });

  soundToggle.addEventListener("click", ()=>{
    state.soundOn = !state.soundOn;
    soundToggle.textContent = state.soundOn ? "🔊" : "🔈";
  });

  hintBtn.addEventListener("click", ()=>{
    hintText.setAttribute("aria-hidden","false");
    hintText.textContent = `${state.current.emoji} = ${state.current.meaning.split(" / ")[0]}`;
    // small fade away after a bit
    setTimeout(()=> {
      hintText.setAttribute("aria-hidden","true");
      hintText.textContent = "";
    }, 2200);
  });

  // init / start / reset
  function resetGame(){
    state.score = 0;
    state.round = 0;
    state.difficulty = 1;
    state.timeLimit = 4000;
    state.reactions = [];
    state.current = null;
    state.paused = false;
    state.soundOn = true;
    soundToggle.textContent = "🔊";
    playSound(sndTick); // warmup sound
  }

  function startGame(){
    updateStatus();
    // small intro flash
    let introCount = 0;
    const intro = setInterval(()=>{
      emojiDisplay.classList.toggle("glow");
      introCount++;
      if(introCount > 3){
        clearInterval(intro);
        emojiDisplay.classList.remove("glow");
        nextRound();
      }
    }, 220);
  }

  // initial setup hook
  function boot(){
    // Ensure options area empty
    optionsEl.innerHTML = "";
    resetGame();
    startGame();
  }

  // Expose quick debug on window for dev
  window.EmojiReaction = {
    state,
    boot, resetGame, nextRound
  };

  // start
  boot();
})();
