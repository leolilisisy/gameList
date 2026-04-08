  (()=>{
    const stage = document.getElementById('stage');
    const startBtn = document.getElementById('startBtn');
    const nextBtn = document.getElementById('nextBtn');
    const choicesEl = document.getElementById('choices');
    const timeMeter = document.getElementById('timeMeter');
    const scoreEl = document.getElementById('score');
    const roundInfo = document.getElementById('roundInfo');
    const difficultySel = document.getElementById('difficulty');
    const muteCb = document.getElementById('mute');

    const SHAPES = ['Circle','Square','Triangle','Rectangle','Star'];
    let round=0,score=0,current=null,timer=null,timeLeft=0,timeMax=8;

    function randInt(a,b){return Math.floor(Math.random()*(b-a+1))+a}

    function pickRandom(exclude){
      let arr = SHAPES.filter(s=>s!==exclude);
      const choices = [];
      while(choices.length<3){
        const idx = randInt(0,arr.length-1);
        choices.push(arr.splice(idx,1)[0]);
      }
      return choices;
    }

    function clearStage(){stage.innerHTML=''}

    function createShadow(shapeName,opts={}){
      const el = document.createElement('div');
      el.className = 'shadow-entity';
      el.setAttribute('data-shape',shapeName);
      // base size & style
      let size = 110;
      if(shapeName==='Rectangle') size=140;
      if(shapeName==='Star') size=120;

      // choose inner content
      const inner = document.createElement('div');
      inner.style.width = size+'px';
      inner.style.height = size+'px';

      switch(shapeName){
        case 'Circle': inner.className='shape-circle'; break;
        case 'Square': inner.className='shape-square'; break;
        case 'Rectangle': inner.className='shape-rect'; break;
        case 'Triangle': inner.className='shape-triangle'; break;
        case 'Star': inner.className='shape-star'; inner.innerHTML = `
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="${getComputedStyle(document.documentElement).getPropertyValue('--shadow-color') || 'black'}">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>`; break;
      }

      el.appendChild(inner);
      stage.appendChild(el);

      // random start position
      const pad = 40;
      const left = randInt(pad, stage.clientWidth - pad - size);
      const top = randInt(pad, stage.clientHeight - pad - size);
      el.style.left = left+'px';
      el.style.top = top+'px';

      // animation duration depends on difficulty
      const diff = difficultySel.value;
      let speedMult = diff==='easy'?1.8: diff==='medium'?1:0.6;
      const duration = (randInt(6,12) * speedMult).toFixed(2);
      el.style.animation = `floatX ${duration}s ease-in-out infinite`;

      // rotate randomly and slightly
      el.style.transformOrigin = '50% 50%';

      // also add subtle vertical float
      inner.style.animation = `floatY ${ (randInt(6,12) * speedMult).toFixed(2) }s ease-in-out infinite`;

      // adjust blur and opacity per difficulty
      const blur = diff==='easy'?6: diff==='medium'?8:12;
      inner.style.filter = `blur(${blur}px)`;
      inner.style.opacity = diff==='hard'?0.95:0.86;

      return el;
    }

    function buildChoices(correct){
      choicesEl.innerHTML='';
      const wrongs = pickRandom(correct);
      const pool = [correct, ...wrongs].sort(()=>Math.random()-.5);
      pool.forEach(text=>{
        const c = document.createElement('button');
        c.className='choice';
        c.textContent = text;
        c.dataset.val = text;
        c.onclick = ()=>handleChoice(c);
        choicesEl.appendChild(c);
      });
    }

    function handleChoice(button){
      if(!current) return;
      const val = button.dataset.val;
      // prevent double
      if(button.classList.contains('checked')) return;
      button.classList.add('checked');

      if(val === current){
        // correct
        button.classList.add('correct');
        score += 2;
        playSound('correct');
        flashMeter('+2');
      } else {
        button.classList.add('wrong');
        score = Math.max(0, score-1);
        playSound('wrong');
        flashMeter('-1');
      }
      updateScore();
      endRound();
    }

    function flashMeter(text){
      const f = document.createElement('div');
      f.textContent = text;
      f.style.position='absolute';f.style.right='18px';f.style.top='18px';f.style.color='white';f.style.fontWeight=700;f.style.opacity=0.95;f.style.padding='6px 10px';f.style.borderRadius='8px';f.style.background='rgba(0,0,0,0.3)';
      document.querySelector('.wrap').appendChild(f);
      setTimeout(()=>{f.style.transition='all .6s';f.style.opacity='0';f.style.transform='translateY(-8px)';},800);
      setTimeout(()=>f.remove(),1400);
    }

    function updateScore(){
      scoreEl.textContent = 'Score: '+score;
      roundInfo.textContent = 'Round: '+round;
    }

    function startRound(){
      clearStage();
      round++;
      updateScore();
      // select shape
      const shape = SHAPES[randInt(0,SHAPES.length-1)];
      current = shape;

      // difficulty impacts timer
      const diff = difficultySel.value;
      timeMax = diff==='easy'?10: diff==='medium'?7:5;
      timeLeft = timeMax;

      // create one or two shadow entities for extra confusion
      const count = diff==='hard'?2:1;
      for(let i=0;i<count;i++) createShadow(shape);

      // build choices
      buildChoices(shape);

      // start timer
      startTimer();

      // subtle stage pulse
      stage.animate([{boxShadow:'0 6px 18px rgba(0,0,0,0.2)'},{boxShadow:'0 6px 22px rgba(0,0,0,0.35)'}],{duration:600,iterations:2})
    }

    function endRound(){
      clearInterval(timer);
      timer=null;
      // briefly show which was correct if user guessed wrong
      const elems = choicesEl.querySelectorAll('.choice');
      elems.forEach(b=>{
        if(b.dataset.val === current) b.classList.add('correct');
      });
      current=null;
      setTimeout(()=>{
        // auto start next
        // don't auto-start; wait for Start/Next button as per acceptance
      },900);
    }

    function startTimer(){
      timeMeter.style.width = '100%';
      clearInterval(timer);
      timer = setInterval(()=>{
        timeLeft -= 0.1;
        const pct = Math.max(0,(timeLeft/timeMax)*100);
        timeMeter.style.width = pct+'%';
        if(timeLeft <= 0){
          // time up
          score = Math.max(0, score-1);
          updateScore();
          playSound('timeout');
          endRound();
          clearInterval(timer);
        }
      },100);
    }

    // basic sounds (beeps) created with WebAudio
    const audioCtx = window.AudioContext ? new AudioContext() : null;
    function playBeep(freq,dur,vol=0.09){
      if(!audioCtx || muteCb.checked) return;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type='sine';o.frequency.value=freq;g.gain.value=vol;
      o.connect(g);g.connect(audioCtx.destination);
      o.start();
      setTimeout(()=>{o.stop()},dur);
    }
    function playSound(kind){
      if(muteCb.checked) return;
      if(!audioCtx) return;
      if(kind==='correct') playBeep(880,140,0.09);
      else if(kind==='wrong') playBeep(220,200,0.06);
      else if(kind==='timeout') playBeep(120,250,0.04);
    }

    // Skip/next button behaviour
    nextBtn.onclick = ()=>{
      if(!current){ startRound(); return; }
      // penalty
      score = Math.max(0, score-1);
      updateScore();
      playSound('wrong');
      endRound();
    }

    startBtn.onclick = ()=>{ if(current) return; startRound(); }

    // keyboard support
    window.addEventListener('keydown',e=>{
      if(e.key===' '){ if(!current) startRound(); }
    });

    // initial UI population (first placeholder)
    function initUI(){
      choicesEl.innerHTML='';
      // show sample placeholders
      const shuffled = SHAPES.slice().sort(()=>Math.random()-.5).slice(0,4);
      shuffled.forEach(t=>{ const b=document.createElement('div'); b.className='choice'; b.textContent=t; choicesEl.appendChild(b) });
      updateScore();
    }

    initUI();

  })();
