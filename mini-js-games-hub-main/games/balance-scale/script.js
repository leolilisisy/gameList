(() => {
el.draggable=true; el.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', JSON.stringify({from:'pan', id:item.id, value:item.value, fromSide:side})))
}


function renderPan(panEl, arr, side){
panEl.innerHTML = '';
arr.forEach(item =>{
const d = document.createElement('div'); d.className='placed'; d.textContent = item.value; d.draggable=true; d.tabIndex=0;
bindPlacedDrag(d, item, side);
// keyboard: press Enter to pick up and press on other pan to drop
d.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' '){ // prepare move
status.textContent = `Picked ${item.value}. Click target pan to drop.`; const handler = ev => { undoStack.push(snapshotState()); if(side==='left'){ leftPanArr = leftPanArr.filter(x=>x.id!==item.id); rightPanArr.push(item);} else { rightPanArr = rightPanArr.filter(x=>x.id!==item.id); leftPanArr.push(item);} renderEverything(); updateStats(); checkWin(); cleanup();}; leftPan.addEventListener('click', handler, {once:true}); rightPan.addEventListener('click', handler, {once:true}); function cleanup(){ status.textContent='Place weights to balance the scale' } } });
panEl.appendChild(d);
});
}


function renderEverything(){
renderInventory(); renderPan(leftPan, leftPanArr, 'left'); renderPan(rightPan, rightPanArr, 'right');
leftTotal.textContent = leftPanArr.reduce((s,i)=>s+i.value,0);
rightTotal.textContent = rightPanArr.reduce((s,i)=>s+i.value,0);
document.getElementById('movesCount').textContent = moves;
document.getElementById('hints').textContent = hints;


// glow when balanced
if(Number(leftTotal.textContent) === Number(rightTotal.textContent) && (leftPanArr.length+rightPanArr.length)>0){
document.querySelector('.scale').classList.add('balanced'); leftPan.classList.add('glow'); rightPan.classList.add('glow'); status.textContent = 'Balanced! 🎉'; playSound(soundWin);
} else { document.querySelector('.scale').classList.remove('balanced'); leftPan.classList.remove('glow'); rightPan.classList.remove('glow'); status.textContent = 'Place weights to balance the scale'; }
}


function snapshotState(){ return JSON.stringify({inventory:leftCopy(inventory), left:leftCopy(leftPanArr), right:leftCopy(rightPanArr), moves, seconds, hints}); }
function leftCopy(arr){ return JSON.parse(JSON.stringify(arr)); }


// undo
function undo(){ if(undoStack.length===0){ playSound(soundError); return;} const s = JSON.parse(undoStack.pop()); inventory = s.inventory; leftPanArr = s.left; rightPanArr = s.right; moves = s.moves; seconds = s.seconds; hints=s.hints; renderEverything(); updateStats(); }


// reset level
function resetLevel(){ undoStack=[]; startLevel(currentLevel); }


function updateStats(){ document.getElementById('movesCount').textContent = moves; }


function checkWin(){ if(Number(leftTotal.textContent) === Number(rightTotal.textContent) && (leftPanArr.length+rightPanArr.length)>0){ status.textContent = 'Balanced! Advancing in 1.5s...'; setTimeout(()=>{ // auto-advance if not last level
if(currentLevel < levels.length-1) loadLevel(currentLevel+1); else status.textContent='You completed all levels! Congrats!'; },1500); }}


// timer
function startTimer(){ stopTimer(); seconds=0; timer = setInterval(()=>{ if(!paused){ seconds++; timerEl.textContent = formatTime(seconds);} },1000); }
function stopTimer(){ if(timer) clearInterval(timer); timer=null; }


function pauseToggle(){ paused = !paused; document.getElementById('pauseBtn').textContent = paused? '▶ Resume' : '⏸ Pause'; }


// load level
function startLevel(i){ currentLevel = i; const lvl = levels[i]; inventory = [...lvl.weights]; leftPanArr = (lvl.fixed.left||[]).map(v=>({id:Date.now()+Math.random(), value:v, source:'fixed'})); rightPanArr = (lvl.fixed.right||[]).map(v=>({id:Date.now()+Math.random(), value:v, source:'fixed'})); moves=0; hints=0; undoStack=[]; seconds=0; paused=false; document.getElementById('levelSelect').value = i; document.getElementById('pauseBtn').textContent='⏸ Pause'; startTimer(); renderEverything(); updateStats(); }


function loadLevel(i){ startLevel(i); }


// quick select via number keys
document.addEventListener('keydown', e =>{
if(e.key >= '1' && e.key <= '9'){ const n = Number(e.key); if(n-1 < inventory.length) selectWeightFromInventory(n-1); }
if(e.key.toLowerCase() === 'z') undo();
if(e.key.toLowerCase() === 'r') resetLevel();
if(e.key.toLowerCase() === 'p') pauseToggle();
});


// bind UI Buttons
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('resetBtn').addEventListener('click', resetLevel);
document.getElementById('pauseBtn').addEventListener('click', pauseToggle);
document.getElementById('restartBtn').addEventListener('click', ()=> startLevel(currentLevel));
levelSelect.addEventListener('change', e=> loadLevel(Number(e.target.value)));


// initialize drag-drop visuals for touch (simple tap-to-place fallback)
['leftPan','rightPan'].forEach(id =>{ const el = document.getElementById(id); el.addEventListener('touchstart', ev=>{}, {passive:true}); });


// initialize
loadLevel(0);


})();

