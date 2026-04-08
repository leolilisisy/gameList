
(function(){
	'use strict';

	// Elements
	const el = {
		grid: document.getElementById('grid'),
		level: document.getElementById('level'),
		lives: document.getElementById('lives'),
		score: document.getElementById('score'),
		best: document.getElementById('best'),
		timerFill: document.getElementById('timerFill'),
		timerText: document.getElementById('timerText'),
		restartBtn: document.getElementById('restartBtn'),
		resetStatsBtn: document.getElementById('resetStatsBtn'),
		nextLevelBtn: document.getElementById('nextLevelBtn'),
		pauseBtn: document.getElementById('pauseBtn'),
		modeToggle: document.getElementById('modeToggle'),
		themeToggle: document.getElementById('themeToggle'),
		soundToggle: document.getElementById('soundToggle'),
		overlay: document.getElementById('overlay'),
		ovLevel: document.getElementById('ovLevel'),
		ovScore: document.getElementById('ovScore'),
		ovBest: document.getElementById('ovBest'),
		overlayTitle: document.getElementById('overlayTitle'),
		overlayMessage: document.getElementById('overlayMessage'),
		startBtn: document.getElementById('startBtn'),
		shareBtn: document.getElementById('shareBtn'),
		toast: document.getElementById('toast'),
		fxLayer: document.getElementById('fxLayer'),
		shareModal: document.getElementById('shareModal'),
		shareLevel: document.getElementById('shareLevel'),
		shareScore: document.getElementById('shareScore'),
		shareWhatsApp: document.getElementById('shareWhatsApp'),
		shareTelegram: document.getElementById('shareTelegram'),
		shareX: document.getElementById('shareX'),
		shareInstagram: document.getElementById('shareInstagram'),
		closeShareModal: document.getElementById('closeShareModal'),
		comboDisplay: document.getElementById('comboDisplay'),
		comboValue: document.getElementById('comboValue'),
		pauseOverlay: document.getElementById('pauseOverlay'),
		pauseLevel: document.getElementById('pauseLevel'),
		pauseScore: document.getElementById('pauseScore'),
		pauseLives: document.getElementById('pauseLives'),
		pauseStreak: document.getElementById('pauseStreak'),
		resumeBtn: document.getElementById('resumeBtn'),
		quitBtn: document.getElementById('quitBtn'),
	};

	// Persistent state
	const store = {
		get highScore(){ return parseInt(localStorage.getItem('ooo_highScore')||'0',10) },
		set highScore(v){ localStorage.setItem('ooo_highScore', String(v)) },
		get maxLevel(){ return parseInt(localStorage.getItem('ooo_maxLevel')||'1',10) },
		set maxLevel(v){ localStorage.setItem('ooo_maxLevel', String(v)) },
		get preferredMode(){ return localStorage.getItem('ooo_mode') || 'color' },
		set preferredMode(v){ localStorage.setItem('ooo_mode', v) },
		get theme(){ return localStorage.getItem('ooo_theme') || 'dark' },
		set theme(v){ localStorage.setItem('ooo_theme', v) },
		get sound(){ return localStorage.getItem('ooo_sound') !== 'off' },
		set sound(v){ localStorage.setItem('ooo_sound', v ? 'on':'off') },
	};

	// Game state
	const state = {
		level: 1,
		score: 0,
		lives: 3,
		combo: 0,
		maxCombo: 0,
		paused: false,
		mode: store.preferredMode,
		running: false,
		gridSize: 3,
		oddIndex: -1,
		timer: null,
		timeLeftMs: 0,
		timeTotalMs: 0,
		pausedTime: 0,
	};

	// Emoji sets
	const EMOJIS = [
		['🍎','🍏'], ['🐶','🐕'], ['🌞','🌤️'], ['⭐','✨'], ['🍪','🥠'], ['🍓','🍒'], ['🍋','🍊'], ['💎','🔷'], ['🔴','🟠'], ['🐱','🐈‍⬛'],
		['🎈','🎉'], ['🍇','🫐'], ['⚽','🏀'], ['🌷','🌹'], ['🎧','🎵'], ['🧩','🎲'], ['📘','📗'], ['🚗','🚙'], ['🎮','🕹️'], ['🧁','🍰']
	];

	// Audio (Web Audio API minimal beeps)
	const AudioCtx = window.AudioContext || window.webkitAudioContext;
	let audioCtx = null;
	function ensureAudio(){ if(!audioCtx) audioCtx = new AudioCtx(); }
	function beep({freq=440, dur=0.12, type='sine', vol=0.07}={}){
		if(!store.sound) return;
		try{ ensureAudio(); const o=audioCtx.createOscillator(); const g=audioCtx.createGain();
			o.type=type; o.frequency.value=freq; g.gain.value=vol; o.connect(g).connect(audioCtx.destination);
			o.start(); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+dur); o.stop(audioCtx.currentTime+dur);
		}catch(e){/* ignore */}
	}
	const sfx = {
		correct(){ beep({freq:740, dur:.12, type:'triangle'}); },
		wrong(){ beep({freq:200, dur:.2, type:'sawtooth', vol:0.06}); },
		levelUp(){ beep({freq:520, dur:.12}); setTimeout(()=>beep({freq:680,dur:.12}),90); },
		tick(){ beep({freq:900, dur:.04, type:'square', vol:.04}); },
		champion(){
			// Triumphant ascending melody
			beep({freq:523, dur:.15}); // C
			setTimeout(()=>beep({freq:659, dur:.15}), 150); // E
			setTimeout(()=>beep({freq:784, dur:.15}), 300); // G
			setTimeout(()=>beep({freq:1047, dur:.3}), 450); // C high
		},
		gameOver(){
			// Descending sad melody
			beep({freq:440, dur:.2, type:'triangle'}); // A
			setTimeout(()=>beep({freq:392, dur:.2, type:'triangle'}), 200); // G
			setTimeout(()=>beep({freq:330, dur:.3, type:'triangle'}), 400); // E
		}
	};

	// Utilities
	const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
	const rand = (n)=>Math.floor(Math.random()*n);
	const lerp = (a,b,t)=>a+(b-a)*t;

	// Color util using HSL for easy lightness tweak
	function randomBaseColor(){
		const h = Math.floor(Math.random()*360);
		const s = 60 + Math.random()*30; // 60-90
		const l = 45 + Math.random()*10; // 45-55
		return {h,s,l};
	}
	function hsl({h,s,l}){ return `hsl(${h} ${s}% ${l}%)`; }

	// Difficulty curves
	function gridForLevel(level){
		// 1->3, 2->4, ..., 10->12
		return clamp(2 + level, 3, 12);
	}
		function colorDeltaForLevel(level){
			// Slightly larger deltas for better visibility
			// 1:22%, 5:12%, 10:8% (lightness delta)
			const t = (level-1)/9; // 0..1
			return lerp(22, 8, t);
		}
		function hueDeltaForLevel(level){
			// Add a gentle hue shift that grows with level to offset reduced lightness delta
			// 1: +2°, 10: +8°
			const t = (level-1)/9;
			return lerp(2, 8, t);
		}
	function timerForLevel(level){
		// 1:10s, 5:6s, 10:3s
		const t = (level-1)/9;
		return lerp(10, 3, t);
	}

	// Build grid
	function buildGrid(){
		const n = state.gridSize = gridForLevel(state.level);
		const total = n*n;
		state.oddIndex = rand(total);

		el.grid.classList.add('enter');
		setTimeout(()=>el.grid.classList.remove('enter'), 350);

		el.grid.style.gridTemplateColumns = `repeat(${n}, minmax(32px, 1fr))`;
			el.grid.classList.toggle('compact', n>=8 && n<11);
			el.grid.classList.toggle('dense', n>=11);
		el.grid.innerHTML = '';

			if(state.mode === 'color'){
			const base = randomBaseColor();
				const delta = colorDeltaForLevel(state.level);
				const hDelta = hueDeltaForLevel(state.level) * (Math.random()>.5?1:-1);
				const odd = { ...base,
					h: (base.h + hDelta + 360) % 360,
					l: clamp(base.l + (Math.random()>.5?delta:-delta), 12, 88)
				};
			for(let i=0;i<total;i++){
				const d = document.createElement('button');
				d.className = 'tile fade';
				d.style.background = hsl(i===state.oddIndex? odd : base);
				d.style.borderColor = '#ffffff22';
				d.setAttribute('aria-label', i===state.oddIndex? 'Odd tile':'Tile');
				d.addEventListener('click', ()=>onTileClick(i,d));
				el.grid.appendChild(d);
			}
		}else{ // emoji mode
			const pair = EMOJIS[rand(EMOJIS.length)];
			const common = pair[0], odd = pair[1];
			for(let i=0;i<total;i++){
				const d = document.createElement('button');
				d.className = 'tile fade';
				d.textContent = i===state.oddIndex? odd : common;
				d.style.fontSize = tileFontSize(n);
				d.setAttribute('aria-label', i===state.oddIndex? 'Odd emoji':'Emoji');
				d.addEventListener('click', ()=>onTileClick(i,d));
				el.grid.appendChild(d);
			}
		}
	}

	function tileFontSize(n){
		if(n>=11) return '1.25rem';
		if(n>=9) return '1.5rem';
		if(n>=7) return '1.75rem';
		if(n>=5) return '2rem';
		return '2.2rem';
	}

	// Timer
	function startTimer(initialTime = null){
		if(initialTime !== null){
			// Resuming from pause
			state.timeLeftMs = initialTime;
		} else {
			// Starting fresh
			const secs = timerForLevel(state.level);
			state.timeTotalMs = Math.round(secs*1000);
			state.timeLeftMs = state.timeTotalMs;
		}
		updateTimerUI();
		if(state.timer) clearInterval(state.timer);
		let lastTick = performance.now();
		state.timer = setInterval(()=>{
			if(state.paused) return;
			const now = performance.now();
			const dt = now - lastTick; lastTick = now;
			state.timeLeftMs -= dt;
			// Tick sound in last 2 seconds every ~300ms
			if(state.timeLeftMs < 2000){ if(Math.round(state.timeLeftMs)%300<20) sfx.tick(); }
			if(state.timeLeftMs <= 0){ state.timeLeftMs = 0; updateTimerUI(); onTimeUp(); }
			else updateTimerUI();
		}, 50);
	}

	function updateTimerUI(){
		const p = state.timeTotalMs? state.timeLeftMs/state.timeTotalMs : 0;
		el.timerFill.style.width = `${p*100}%`;
		el.timerText.textContent = `${(state.timeLeftMs/1000).toFixed(1)}s`;
	}

	// Scoring
	function addScore(base=10){
		// Bonus for speed: remaining seconds * 2 rounded
		const timeBonus = Math.round((state.timeLeftMs/1000) * 2);
		// Combo multiplier: starts at 1×, becomes 2× on 2nd correct, 3× on 3rd correct, etc.
		const comboMultiplier = Math.max(1, state.combo);
		const gained = (base + timeBonus) * comboMultiplier;
		state.score += gained;
		el.score.textContent = String(state.score);
		return {gained, bonus: timeBonus, multiplier: comboMultiplier};
	}

	// Click handling
	function onTileClick(index, node){
		if(!state.running || state.paused) return;
		if(index === state.oddIndex){
			node.classList.add('correct');
			state.combo++;
			if(state.combo > state.maxCombo) state.maxCombo = state.combo;
			updateComboDisplay();
			const {gained, bonus, multiplier} = addScore(10);
			sfx.correct();
			sparkle(node);
			const msg = multiplier > 1 ? `+${gained} (×${multiplier} COMBO!)` : `+${gained} (${bonus} bonus)`;
			toast(msg, 900);
			nextLevel();
		} else {
			node.classList.add('wrong');
			sfx.wrong();
			state.combo = 0;
			updateComboDisplay();
			loseLife('Wrong tile!');
		}
	}

	function sparkle(node){
		const rect = node.getBoundingClientRect();
		const cx = rect.left + rect.width/2 + window.scrollX;
		const cy = rect.top + rect.height/2 + window.scrollY;
		for(let i=0;i<12;i++) confetti(cx, cy);
	}

	function confetti(x,y){
		const c = document.createElement('div'); c.className='confetti';
		c.style.left = x+'px'; c.style.top = y+'px';
		const hue = Math.floor(Math.random()*360);
		c.style.background = `hsl(${hue} 80% 60%)`;
		const tx = (Math.random()*2-1)*200 + 'px';
		const rot = (Math.random()*2-1)*720 + 'deg';
		const dur = (0.8 + Math.random()*0.8)+'s';
		c.style.setProperty('--tx', tx); c.style.setProperty('--rot', rot); c.style.setProperty('--dur', dur);
		el.fxLayer.appendChild(c);
		setTimeout(()=>c.remove(), 1600);
	}

	// Flow
	function startGame(){
		state.level = 1; state.score = 0; state.lives = 3; state.combo = 0; state.maxCombo = 0; state.running = true; state.paused = false;
		el.level.textContent = '1'; el.score.textContent = '0';
		updateLivesDisplay();
		updateComboDisplay();
		el.nextLevelBtn.hidden = true;
		el.pauseBtn.disabled = false;
		hideOverlay();
		newLevel();
	}

	function newLevel(){
		state.running = true;
		updateHUD();
		buildGrid();
		startTimer();
	}

	function nextLevel(){
		clearInterval(state.timer); state.timer = null;
		state.level++;
		sfx.levelUp();
		if(state.level>10){
			championCelebration();
			return;
		}
		toast(`Level ${state.level}!`, 1000);
		newLevel();
	}

	// Champion animation
	function championCelebration(){
		state.running = false;
		clearInterval(state.timer); state.timer=null;
		sfx.champion(); // Play champion sound
		// Burst confetti
		for(let i=0;i<60;i++){
			setTimeout(()=>confetti(window.innerWidth/2, window.innerHeight/2), i*18);
		}
		// Show animated modal
		showOverlay({
			title: '🎉 Champion! 🎉',
			message: 'You beat all 10 levels!<br>Congratulations!<br>Enjoy the celebration!',
			showShare: true,
		});
		// Animate modal
		const modal = document.querySelector('.modal');
		if(modal){
			modal.style.animation = 'championPop 1.2s cubic-bezier(.2,1.5,.4,1)';
			setTimeout(()=>{
				modal.style.animation = '';
				// After a delay, show game over
				setTimeout(()=>gameOver('Champion! You beat level 10!'), 1800);
			}, 1200);
		}
	}

	function onTimeUp(){
		clearInterval(state.timer); state.timer=null;
		loseLife("Time's up!");
	}

	function loseLife(reason){
		state.lives--;
		state.combo = 0;
		updateComboDisplay();
		updateLivesDisplay();
		
		if(state.lives <= 0){
			gameOver(reason);
		} else {
			state.running = false;
			toast(`💔 ${reason} ${state.lives} ${state.lives===1?'heart':'hearts'} left`, 1500);
			// Continue to same level after brief pause
			setTimeout(()=>{
				if(state.lives > 0) newLevel();
			}, 1600);
		}
	}

	function updateComboDisplay(){
		// Show streak starting from 2 consecutive correct answers
		// Multiplier increases by 1 for each consecutive correct answer: ×2, ×3, ×4, etc.
		if(state.combo >= 2){
			const multiplier = state.combo;
			el.comboValue.textContent = multiplier;
			el.comboDisplay.classList.remove('hidden');
			el.comboDisplay.classList.add('show');
		} else {
			el.comboDisplay.classList.remove('show');
			setTimeout(()=>{
				if(state.combo < 2) el.comboDisplay.classList.add('hidden');
			}, 300);
		}
	}

	function updateLivesDisplay(){
		const hearts = el.lives.querySelectorAll('.heart');
		hearts.forEach((heart, index) => {
			if(index < state.lives){
				heart.textContent = '❤️';
				heart.classList.remove('lost');
			} else {
				heart.textContent = '🖤';
				heart.classList.add('lost');
			}
		});
	}

	function gameOver(reason){
		state.running = false;
		state.paused = false;
		el.pauseBtn.disabled = true;
		clearInterval(state.timer); state.timer=null;
		sfx.gameOver(); // Play game over sound
		// Update bests
		if(state.score > store.highScore) store.highScore = state.score;
		if(state.level > store.maxLevel) store.maxLevel = state.level;
		updateHUD();
		showOverlay({
			title: 'Game Over',
			message: `${reason} You reached Level ${state.level}.`,
			showShare: true,
		});
	}

	function updateHUD(){
		el.level.textContent = String(state.level);
		el.score.textContent = String(state.score);
		el.best.textContent = String(store.highScore);
	}

	// Overlays
	function showOverlay({title, message, showShare=false}){
		// Separate emojis from text to preserve emoji colors
		const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
		const parts = title.split(emojiRegex);
		let formattedTitle = '';
		parts.forEach(part => {
			if(part && part.match(emojiRegex)){
				formattedTitle += part; // Emoji without gradient
			} else if(part && part.trim()){
				formattedTitle += `<span class="gradient-text">${part}</span>`; // Text with gradient
			}
		});
		el.overlayTitle.innerHTML = formattedTitle;
		el.overlayMessage.innerHTML = message;
		el.ovLevel.textContent = String(state.level);
		el.ovScore.textContent = String(state.score);
		el.ovBest.textContent = String(store.highScore);
		el.shareBtn.hidden = !showShare;
		el.overlay.classList.remove('hidden');
		el.overlay.setAttribute('aria-hidden','false');
	}
	function hideOverlay(){
		el.overlay.classList.add('hidden');
		el.overlay.setAttribute('aria-hidden','true');
	}

	// Toast
	let toastT=null;
	function toast(text, ms=1200){
		el.toast.textContent = text;
		el.toast.classList.add('show');
		clearTimeout(toastT);
		toastT = setTimeout(()=>el.toast.classList.remove('show'), ms);
	}

	// Toggles
	function toggleMode(){
		state.mode = state.mode==='color' ? 'emoji' : 'color';
		store.preferredMode = state.mode;
		el.modeToggle.textContent = state.mode==='color' ? '😄 Emoji Mode' : '🎨 Color Mode';
		if(state.running && !state.paused){ buildGrid(); }
	}
	function toggleTheme(){
		const root = document.documentElement;
		const next = root.getAttribute('data-theme')==='dark' ? 'light':'dark';
		root.setAttribute('data-theme', next); store.theme = next;
	}
	function toggleSound(){
		store.sound = !store.sound;
		el.soundToggle.textContent = store.sound ? '🔊 Sound' : '🔇 Sound';
	}

	// Pause/Resume
	function togglePause(){
		if(!state.running) return;
		
		if(state.paused){
			// Resume
			resumeGame();
		} else {
			// Pause
			pauseGame();
		}
	}

	function pauseGame(){
		state.paused = true;
		state.pausedTime = performance.now();
		clearInterval(state.timer);
		el.pauseBtn.textContent = '▶️ Resume';
		el.pauseLevel.textContent = String(state.level);
		el.pauseScore.textContent = String(state.score);
		el.pauseLives.textContent = String(state.lives);
		el.pauseStreak.textContent = String(state.combo);
		el.pauseOverlay.classList.remove('hidden');
		el.pauseOverlay.setAttribute('aria-hidden','false');
	}

	function resumeGame(){
		state.paused = false;
		el.pauseBtn.textContent = '⏸️ Pause';
		el.pauseOverlay.classList.add('hidden');
		el.pauseOverlay.setAttribute('aria-hidden','true');
		// Resume timer from where it left off
		startTimer(state.timeLeftMs);
	}

	function quitToMenu(){
		state.running = false;
		state.paused = false;
		clearInterval(state.timer);
		el.pauseBtn.disabled = true;
		el.pauseOverlay.classList.add('hidden');
		el.pauseOverlay.setAttribute('aria-hidden','true');
		showOverlay({
			title: 'Odd One Out 🎯',
			message: 'Find the tile that looks slightly different before time runs out! Choose a mode and press Start.',
			showShare: false,
		});
	}

	// Share
	function shareScore(){
		el.shareLevel.textContent = String(state.level);
		el.shareScore.textContent = String(state.score);
		el.shareModal.classList.remove('hidden');
		el.shareModal.setAttribute('aria-hidden','false');
	}

	function closeShareModal(){
		el.shareModal.classList.add('hidden');
		el.shareModal.setAttribute('aria-hidden','true');
	}

	function shareToWhatsApp(){
		const text = encodeURIComponent(`🎯 Odd One Out Challenge!\n\nI scored ${state.score} points and reached Level ${state.level}!\n\nCan you beat my score? Try this awesome reflex game! 🔥`);
		window.open(`https://wa.me/?text=${text}`, '_blank');
		closeShareModal();
	}

	function shareToTelegram(){
		const text = encodeURIComponent(`🎯 Odd One Out Game\n\nMy Score: ${state.score}\nLevel Reached: ${state.level}\n\nThink you can beat me? Test your reflexes! 👀`);
		window.open(`https://t.me/share/url?text=${text}`, '_blank');
		closeShareModal();
	}

	function shareToX(){
		const text = encodeURIComponent(`🎯 Just scored ${state.score} on Odd One Out (Level ${state.level})! Can you beat me? #OddOneOut #GameChallenge`);
		window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
		closeShareModal();
	}

	function shareToInstagram(){
		// Instagram doesn't support direct text sharing via URL, so copy to clipboard and redirect
		const text = `🎯 Odd One Out Challenge!\n\nScore: ${state.score}\nLevel: ${state.level}\n\nCan you beat me? 🔥`;
		navigator.clipboard.writeText(text).then(()=>{
			toast('📋 Message copied! Opening Instagram...', 2000);
			setTimeout(()=>{
				window.open('https://www.instagram.com/', '_blank');
			}, 500);
			closeShareModal();
		}).catch(()=>{
			// Fallback if clipboard fails
			window.open('https://www.instagram.com/', '_blank');
			alert(`Copy this message to share on Instagram:\n\n${text}`);
			closeShareModal();
		});
	}

	// Reset stats
	function resetStats(){
		if(confirm('Are you sure you want to reset all stats (high score and max level)?')){
			store.highScore = 0;
			store.maxLevel = 1;
			el.best.textContent = '0';
			toast('Stats reset!', 1200);
			sfx.correct();
		}
	}

	// Buttons
	el.restartBtn.addEventListener('click', startGame);
	el.resetStatsBtn.addEventListener('click', resetStats);
	el.startBtn.addEventListener('click', startGame);
	el.nextLevelBtn.addEventListener('click', nextLevel);
	el.modeToggle.addEventListener('click', toggleMode);
	el.themeToggle.addEventListener('click', toggleTheme);
	el.soundToggle.addEventListener('click', toggleSound);
	el.shareBtn.addEventListener('click', shareScore);
	el.closeShareModal.addEventListener('click', closeShareModal);
	el.shareWhatsApp.addEventListener('click', shareToWhatsApp);
	el.shareTelegram.addEventListener('click', shareToTelegram);
	el.shareX.addEventListener('click', shareToX);
	el.shareInstagram.addEventListener('click', shareToInstagram);
	el.pauseBtn.addEventListener('click', togglePause);
	el.resumeBtn.addEventListener('click', resumeGame);
	el.quitBtn.addEventListener('click', quitToMenu);

	// Init from storage
	function init(){
		document.documentElement.setAttribute('data-theme', store.theme);
		el.modeToggle.textContent = store.preferredMode==='color' ? '😄 Emoji Mode' : '🎨 Color Mode';
		el.soundToggle.textContent = store.sound ? '🔊 Sound' : '🔇 Sound';
		el.best.textContent = String(store.highScore);
		el.pauseBtn.disabled = true;
		showOverlay({
			title: 'Odd One Out 🎯',
			message: 'Find the tile that looks slightly different before time runs out! Choose a mode and press Start.',
			showShare: false,
		});
	}

	init();
})();