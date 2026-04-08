/* Tap the Beat — script.js
   Uses Web Audio API to play a hosted track and schedules simple beat events.
   Tap evaluation uses timing windows for Perfect/Good/Miss.
*/

/* ========== Config & Assets (online) ========== */
const ASSETS = {
  tracks: {
    "drum-01": {
      url: "https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_1MG.mp3",
      name: "Ambient Beat"
    },
    "pop-01": {
      url: "https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3",
      name: "Upbeat Pop"
    }
  },
  click: "https://www.soundjay.com/button/sounds/button-16.mp3" // simple click for hits
};

/* ========== UI refs ========== */
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const tapBtn = document.getElementById("tapBtn");
const feedbackEl = document.getElementById("feedback");
const stage = document.getElementById("stage");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const accuracyEl = document.getElementById("accuracy");
const progressFill = document.getElementById("progressFill");
const timeElapsed = document.getElementById("timeElapsed");
const durationEl = document.getElementById("duration");
const difficultySel = document.getElementById("difficulty");
const trackSelect = document.getElementById("trackSelect");
const muteBtn = document.getElementById("muteBtn");
const volUp = document.getElementById("volUp");
const volDown = document.getElementById("volDown");

let audioCtx, trackBuffer, trackSource;
let clickBuffer;
let gainNode;
let playStartTime = 0;
let pauseTime = 0;
let scheduledBeats = []; // {time, el}
let schedulerId = null;
let isPlaying = false;
let trackDuration = 0;

/* Game state */
let score = 0, combo = 0, hits = 0, attempts = 0;
let accuracy = 0;
let beatIndex = 0;
let bpm = 100; // adjustable by difficulty
let beatPattern = []; // seconds offsets of beats
let volume = 0.7;
let muted = false;

/* Timing windows (seconds) */
const windows = { perfect: 0.08, good: 0.15, miss: 0.25 };

/* ========== Helpers ========== */
function toFixed(n, d=1){ return Number(n.toFixed(d)); }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

/* ========== Audio setup ========== */
async function initAudio(){
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  gainNode = audioCtx.createGain();
  gainNode.gain.value = volume;
  gainNode.connect(audioCtx.destination);

  // load click
  clickBuffer = await fetchAndDecode(ASSETS.click);
}

async function fetchAndDecode(url){
  const res = await fetch(url);
  const ab = await res.arrayBuffer();
  return await audioCtx.decodeAudioData(ab);
}

async function loadTrack(key){
  await initAudio();
  const url = ASSETS.tracks[key].url;
  const res = await fetch(url);
  const ab = await res.arrayBuffer();
  trackBuffer = await audioCtx.decodeAudioData(ab);
  trackDuration = trackBuffer.duration;
  durationEl.textContent = `${toFixed(trackDuration,1)}s`;
}

/* ========== Beatmap generation ==========
   We'll generate a simple beat pattern from a BPM and a difficulty multiplier.
   For production you'd use pre-authored beatmaps; this is procedural.
*/
function generateBeatmap(bpmVal, difficulty="normal"){
  const secondsPerBeat = 60 / bpmVal;
  const lengthInBeats = Math.floor(trackDuration / secondsPerBeat) || Math.floor(60 / secondsPerBeat);
  beatPattern = [];
  const density = difficulty === "easy" ? 0.6 : difficulty === "hard" ? 1.0 : 0.8;
  for(let i=0;i<lengthInBeats;i++){
    // randomness to add variation
    if (Math.random() < density){
      // optionally add double-beat occasionally
      beatPattern.push(i * secondsPerBeat + (Math.random()*0.03));
    }
    if (Math.random() < 0.08 && difficulty!=="easy"){
      beatPattern.push((i + 0.5) * secondsPerBeat);
    }
  }
  // sort & dedupe
  beatPattern = Array.from(new Set(beatPattern)).sort((a,b)=>a-b);
  // ensure at least one beat exists
  if (beatPattern.length===0){
    for(let i=0;i<Math.floor(trackDuration / secondsPerBeat); i++){
      beatPattern.push(i*secondsPerBeat);
    }
  }
}

/* ========== Visual beat spawn ==========
   Spawn DOM elements that move up to the hit-line using CSS transitions timed to the audio.
*/
function spawnVisualForBeat(absoluteTime){
  // Create element
  const el = document.createElement("div");
  el.className = "beat glow";
  el.textContent = "";
  // random color gradient
  const hue = Math.floor(200 + Math.random()*140);
  el.style.background = `radial-gradient(circle at 30% 30%, hsla(${hue},90%,70%,1), hsl(${hue},80%,45%))`;
  el.style.width = "64px";
  el.style.height = "64px";
  el.style.borderRadius = "999px";
  el.style.bottom = "-80px";
  el.style.left = `${50 + (Math.random()*26 - 13)}%`;
  el.style.zIndex = 5;

  // time until hit-line
  const hitLineY = 86; // px from bottom in CSS
  const now = audioCtx.currentTime;
  const timeUntilHit = absoluteTime - now;

  // We'll animate using CSS transition from bottom to hit-line over this time.
  // set initial position and append
  stage.appendChild(el);

  // compute travel distance in px and duration: we just use a CSS translateY animation using bottom property via JS
  // Add small delay to allow appended element to render then start the transition
  const travelDuration = Math.max(0.8, Math.min(3.6, timeUntilHit)); // clamp travel for stability
  el.style.transition = `transform ${timeUntilHit}s linear`;
  // position the element using translateY — animate from offscreen up to the hit line
  // set transform to translateY( -Xpx ) where X is enough to move into view — simpler: use bottom property via JS animation
  // We'll animate using top in requestAnimationFrame to keep things stable.
  // For simplicity, we'll use a CSS animation by toggling a class near the scheduled time:
  el.dataset.spawnedAt = now;
  el.dataset.hitAt = absoluteTime;
  scheduledBeats.push({time:absoluteTime, el});
}

/* ========== Scheduler ==========
   We schedule audio playback plus spawning visuals ahead of time.
*/
function scheduleBeatsUntil(lookahead = 1.6){
  const now = audioCtx.currentTime;
  while(beatIndex < beatPattern.length){
    const t = playStartTime + beatPattern[beatIndex];
    if (t <= now + lookahead){
      // spawn audio click slightly offset (mix)
      // schedule click sound at time t
      const clickSource = audioCtx.createBufferSource();
      clickSource.buffer = clickBuffer;
      const clickGain = audioCtx.createGain();
      clickGain.gain.value = 0.4;
      clickSource.connect(clickGain);
      clickGain.connect(gainNode);
      clickSource.start(t);

      // spawn visual
      spawnVisualForBeat(t);

      beatIndex++;
    } else break;
  }
}

/* ========== Play / Pause / Stop ========== */
function startPlayback(){
  if (!trackBuffer) return;
  if (!audioCtx) initAudio();

  // create new source
  trackSource = audioCtx.createBufferSource();
  trackSource.buffer = trackBuffer;
  trackSource.connect(gainNode);

  // start from paused offset
  const offset = pauseTime || 0;
  playStartTime = audioCtx.currentTime - offset;
  trackSource.start(0, offset);
  isPlaying = true;
  pauseBtn.disabled = false;
  restartBtn.disabled = false;
  startBtn.disabled = true;
  // schedule end
  trackSource.onended = () => {
    endRun();
  };

  // reset beat index relative to offset
  beatIndex = 0;
  while(beatIndex < beatPattern.length && (beatPattern[beatIndex] <= offset)) beatIndex++;

  // start scheduler tick
  schedulerTick();
}

function pausePlayback(){
  if (!isPlaying) return;
  // stop current track source and preserve offset
  try{ trackSource.stop(); } catch(e){}
  pauseTime = audioCtx.currentTime - playStartTime;
  isPlaying = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  // stop scheduler
  if (schedulerId) { cancelAnimationFrame(schedulerId); schedulerId = null; }
}

function restartPlayback(){
  // clear visuals
  clearScheduledVisuals();
  try{ if (trackSource) trackSource.stop(); } catch(e){}
  pauseTime = 0;
  score = 0; combo = 0; hits = 0; attempts = 0; accuracy = 0;
  updateUI();
  startPlayback();
}

/* ========== run loop for visuals & interaction ========= */
function schedulerTick(){
  // schedule upcoming beats
  scheduleBeatsUntil(2.2);

  // update visuals: move beats that were spawned to animate to hit-line using computed fraction
  const now = audioCtx.currentTime;
  scheduledBeats.forEach(item => {
    const {time, el} = item;
    // time until hit in seconds
    const tleft = time - now;
    const life = Math.max(0.001, Math.min(4.0, (time - el.dataset.spawnedAt)));
    // compute percent from spawn to hit (we approximate with window 3.0s)
    const totalTravel = 3.0; // seconds
    const pct = clamp(1 - Math.max(-1, tleft)/totalTravel, 0, 1);
    // map pct to bottom value (start offscreen bottom -120px to hit-line 86px)
    const startBottom = -120;
    const hitBottom = 86;
    const curBottom = startBottom + (hitBottom - startBottom) * pct;
    el.style.transform = `translateY(${-curBottom}px)`; // negative because translateY up
    // small scale pulse near hit
    if (Math.abs(tleft) < 0.18){
      el.style.transform += " scale(1.08)";
      el.style.opacity = "1";
    } else {
      el.style.opacity = `${clamp(0.4 + pct, 0, 1)}`;
    }
    // if passed well beyond miss window, remove as missed
    if (tleft < -windows.miss - 0.2){
      markMiss(el, time);
    }
  });

  // cleanup any elements that have been removed
  scheduledBeats = scheduledBeats.filter(i => stage.contains(i.el));

  // update time UI
  if (isPlaying){
    const elapsed = audioCtx.currentTime - playStartTime;
    timeElapsed.textContent = `${toFixed(elapsed,1)}s`;
    const pct = clamp((elapsed / trackDuration) * 100, 0, 100);
    progressFill.style.width = `${pct}%`;
  }

  schedulerId = requestAnimationFrame(schedulerTick);
}

/* ========== Hit detection ==========
   When player taps, compare current audio time to closest scheduled beat time.
*/
function evaluateTap(){
  if (!audioCtx || (!isPlaying && !pauseTime)) return;
  const now = audioCtx.currentTime;
  // find closest scheduled beat (including those not yet spawned)
  let closestDiff = Infinity;
  let closestTime = null;
  for(const t of beatPattern){
    const abs = playStartTime + t;
    const diff = Math.abs(abs - now);
    if (diff < closestDiff){
      closestDiff = diff;
      closestTime = abs;
    }
  }
  // decide outcome
  attempts++;
  if (closestDiff <= windows.perfect){
    registerHit("Perfect", 300, 2.25);
  } else if (closestDiff <= windows.good){
    registerHit("Good", 120, 1.25);
  } else if (closestDiff <= windows.miss){
    registerMiss();
  } else {
    registerMiss();
  }
}

/* registerHit / Miss */
function registerHit(label, baseScore=100, comboMult=1.0){
  hits++;
  combo++;
  score += Math.floor(baseScore * comboMult + (combo * 2));
  displayFeedback(label, true);
  playClick(0.3);
  updateUI();
  // remove the earliest beat that is near now so it won't be matched again
  const now = audioCtx.currentTime;
  let removed = false;
  for(let i=0;i<scheduledBeats.length;i++){
    const it = scheduledBeats[i];
    if (Math.abs(it.time - now) < windows.miss + 0.15){
      // animate pop and remove
      it.el.style.transition = "transform 0.12s ease, opacity 0.12s ease";
      it.el.style.transform += " scale(1.25)";
      it.el.style.opacity = "0";
      setTimeout(()=>{ try{ it.el.remove(); }catch(e){} }, 140);
      scheduledBeats.splice(i,1);
      removed = true;
      break;
    }
  }
  // also remove earliest beat in beatPattern if within window
  for(let j=0;j<beatPattern.length;j++){
    const abs = playStartTime + beatPattern[j];
    if (Math.abs(abs - now) < windows.miss + 0.15){
      beatPattern.splice(j,1); break;
    }
  }
}

function registerMiss(){
  combo = 0;
  displayFeedback("Miss", false);
  // find the beat that was missed and animate it as miss
  const now = audioCtx.currentTime;
  for(let i=0;i<scheduledBeats.length;i++){
    const it = scheduledBeats[i];
    if (it.time < now + 0.05){
      it.el.style.transition = "transform .2s ease, opacity .3s ease";
      it.el.style.opacity = "0.06";
      setTimeout(()=>{ try{ it.el.remove(); }catch(e){} },280);
      scheduledBeats.splice(i,1);
      break;
    }
  }
  updateUI();
}

/* markMiss for elements that passed without hit */
function markMiss(el, time){
  try{
    el.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    el.style.opacity = "0.06";
    el.style.transform += " scale(.9)";
    setTimeout(()=>{ el.remove(); }, 320);
  }catch(e){}
}

/* Snackbar feedback */
let feedbackTimeout;
function displayFeedback(text, positive){
  feedbackEl.textContent = text;
  feedbackEl.style.color = positive ? "#9ef6c9" : "#ff9ea8";
  feedbackEl.style.transform = "translateY(-8px)";
  if (feedbackTimeout) clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(()=>{
    feedbackEl.style.transform = "translateY(0)";
    feedbackEl.textContent = "";
  }, 600);
}

/* play click sound quickly */
function playClick(vol=0.5){
  if (muted) return;
  const s = audioCtx.createBufferSource();
  s.buffer = clickBuffer;
  const g = audioCtx.createGain();
  g.gain.value = vol;
  s.connect(g); g.connect(gainNode);
  s.start(audioCtx.currentTime);
}

/* ========== UI updates ========= */
function updateUI(){
  scoreEl.textContent = score;
  comboEl.textContent = combo;
  accuracy = attempts ? Math.round((hits / attempts) * 100) : 0;
  accuracyEl.textContent = attempts ? `${accuracy}%` : "—";
}

/* clean visuals */
function clearScheduledVisuals(){
  scheduledBeats.forEach(item => { try{ item.el.remove(); } catch(e){} });
  scheduledBeats = [];
}

/* run end */
function endRun(){
  isPlaying = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  // show summary
  displayFeedback(`Run finished — Score ${score}`, true);
}

/* ========== UI event handlers ========== */
startBtn.addEventListener("click", async ()=>{
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  // init audio & load track selected
  const trackKey = trackSelect.value || "drum-01";
  await loadTrack(trackKey);
  // difficulty based bpm: easy slower, hard faster
  const diff = difficultySel.value;
  bpm = diff === "easy" ? 80 : diff === "hard" ? 140 : 100;
  generateBeatmap(bpm, diff);
  // reset state
  clearScheduledVisuals();
  score = 0; combo = 0; hits = 0; attempts = 0;
  updateUI();
  // start playback
  await initAudio();
  startPlayback();
});

pauseBtn.addEventListener("click", ()=>{
  if (isPlaying) pausePlayback();
});

restartBtn.addEventListener("click", ()=>{
  restartPlayback();
});

tapBtn.addEventListener("click", ()=>{
  if (!audioCtx) initAudio();
  if (!isPlaying) {
    // if not playing, start immediately (quick play)
    startBtn.click();
    setTimeout(()=> evaluateTap(), 150);
  } else {
    evaluateTap();
  }
});

// keyboard support
window.addEventListener("keydown", (e)=>{
  if (e.code === "Space"){
    e.preventDefault();
    tapBtn.classList.add("active");
    setTimeout(()=>tapBtn.classList.remove("active"), 80);
    evaluateTap();
  }
  if (e.code === "KeyP"){
    // toggle pause
    if (isPlaying) pauseBtn.click();
    else startBtn.click();
  }
});

/* volume / mute */
muteBtn.addEventListener("click", ()=>{
  muted = !muted;
  muteBtn.textContent = muted ? "Unmute" : "Mute";
  gainNode.gain.value = muted ? 0 : volume;
});

volUp.addEventListener("click", ()=>{
  volume = clamp(volume + 0.1, 0, 1);
  gainNode.gain.value = volume;
});
volDown.addEventListener("click", ()=>{
  volume = clamp(volume - 0.1, 0, 1);
  gainNode.gain.value = volume;
});

/* track select change: preload chosen track */
trackSelect.addEventListener("change", async ()=>{
  const key = trackSelect.value;
  await loadTrack(key);
});

/* initialize default track in background (non-blocking) */
(async function preLoad(){
  try{
    await initAudio();
    await loadTrack(trackSelect.value || "drum-01");
  }catch(e){
    console.warn("Preload failed", e);
  }
})();

/* keep UI ticking even when not playing for progress bar */
setInterval(()=> {
  if (!audioCtx) return;
  if (!isPlaying && pauseTime){
    timeElapsed.textContent = `${toFixed(pauseTime,1)}s`;
  }
}, 300);
