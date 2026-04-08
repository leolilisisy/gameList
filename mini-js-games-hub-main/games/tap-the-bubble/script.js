// ========== GAME STATE ==========
const gameState = {
    score: 0,
    combo: 0,
    comboTimer: null,
    maxCombo: 0,
    bubblesPopped: 0,
    bubblesMissed: 0,
    timeLeft: 60,
    isPaused: false,
    isPlaying: false,
    difficulty: 'medium',
    gameMode: 'timed',
    theme: 'ocean',
    playerName: 'Player',
    
    // Power-up states
    doublePoints: false,
    freezeTime: false,
    
    // Settings
    musicEnabled: true,
    sfxEnabled: true,
    vibrationEnabled: true,
    
    // Achievements
    achievements: [],
    unlockedAchievements: []
};

// ========== DIFFICULTY SETTINGS ==========
const difficultySettings = {
    easy: { spawnInterval: 1500, bubbleLifetime: 5000, maxBubbles: 8 },
    medium: { spawnInterval: 1000, bubbleLifetime: 4000, maxBubbles: 12 },
    hard: { spawnInterval: 700, bubbleLifetime: 3000, maxBubbles: 15 }
};

// ========== AUDIO CONTEXT ==========
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine') {
    if (!gameState.sfxEnabled) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playPopSound(size) {
    const baseFreq = 800 - (size * 2);
    playSound(baseFreq, 0.1, 'sine');
    setTimeout(() => playSound(baseFreq * 1.5, 0.05, 'sine'), 50);
}

function playPowerUpSound() {
    playSound(1000, 0.1);
    setTimeout(() => playSound(1200, 0.1), 100);
    setTimeout(() => playSound(1500, 0.2), 200);
}

function playComboSound() {
    playSound(600 + (gameState.combo * 50), 0.15, 'square');
}

// ========== VIBRATION ==========
function vibrate(pattern) {
    if (gameState.vibrationEnabled && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

// ========== DOM ELEMENTS ==========
const elements = {
    // Screens
    startMenu: document.getElementById('startMenu'),
    howToPlayMenu: document.getElementById('howToPlayMenu'),
    settingsMenu: document.getElementById('settingsMenu'),
    leaderboardMenu: document.getElementById('leaderboardMenu'),
    gameScreen: document.getElementById('gameScreen'),
    pauseMenu: document.getElementById('pauseMenu'),
    endScreen: document.getElementById('endScreen'),
    
    // Game elements
    gameContainer: document.getElementById('gameContainer'),
    countdown: document.getElementById('countdown'),
    floatingText: document.getElementById('floatingText'),
    
    // HUD
    score: document.getElementById('score'),
    combo: document.getElementById('combo'),
    comboDisplay: document.getElementById('comboDisplay'),
    timer: document.getElementById('timer'),
    timerProgress: document.getElementById('timerProgress'),
    
    // Buttons
    playBtn: document.getElementById('playBtn'),
    howToPlayBtn: document.getElementById('howToPlayBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    leaderboardBtn: document.getElementById('leaderboardBtn'),
    backFromHowTo: document.getElementById('backFromHowTo'),
    backFromSettings: document.getElementById('backFromSettings'),
    backFromLeaderboard: document.getElementById('backFromLeaderboard'),
        resetStatsBtn: document.getElementById('resetStatsBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    muteBtn: document.getElementById('muteBtn'),
    resumeBtn: document.getElementById('resumeBtn'),
    restartFromPause: document.getElementById('restartFromPause'),
    quitBtn: document.getElementById('quitBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    backToMenuBtn: document.getElementById('backToMenuBtn'),
    
    // Settings
    playerName: document.getElementById('playerName'),
    musicToggle: document.getElementById('musicToggle'),
    sfxToggle: document.getElementById('sfxToggle'),
    vibrationToggle: document.getElementById('vibrationToggle'),
    difficultySelect: document.getElementById('difficultySelect'),
    gameModeSelect: document.getElementById('gameModeSelect'),
    themeSelect: document.getElementById('themeSelect'),
    
    // End screen
    finalScore: document.getElementById('finalScore'),
    bubblesPopped: document.getElementById('bubblesPopped'),
    bubblesMissed: document.getElementById('bubblesMissed'),
    accuracy: document.getElementById('accuracy'),
    bestCombo: document.getElementById('bestCombo'),
    highScore: document.getElementById('highScore'),
    achievementsUnlocked: document.getElementById('achievementsUnlocked'),
    
    // Leaderboard
    leaderboardList: document.getElementById('leaderboardList')
};

// ========== INITIALIZATION ==========
function init() {
    loadSettings();
    applyTheme();
    setupEventListeners();
    updateLeaderboard();
    initCursor();
    
    // Load player name from localStorage
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
        elements.playerName.value = savedName;
        gameState.playerName = savedName;
    }
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('gameSettings') || '{}');
    
    gameState.musicEnabled = settings.musicEnabled !== false;
    gameState.sfxEnabled = settings.sfxEnabled !== false;
    gameState.vibrationEnabled = settings.vibrationEnabled !== false;
    gameState.difficulty = settings.difficulty || 'medium';
    gameState.gameMode = settings.gameMode || 'timed';
    gameState.theme = settings.theme || 'ocean';
    
    elements.musicToggle.textContent = gameState.musicEnabled ? 'ON' : 'OFF';
    elements.musicToggle.classList.toggle('active', gameState.musicEnabled);
    
    elements.sfxToggle.textContent = gameState.sfxEnabled ? 'ON' : 'OFF';
    elements.sfxToggle.classList.toggle('active', gameState.sfxEnabled);
    
    elements.vibrationToggle.textContent = gameState.vibrationEnabled ? 'ON' : 'OFF';
    elements.vibrationToggle.classList.toggle('active', gameState.vibrationEnabled);
    
    elements.difficultySelect.value = gameState.difficulty;
    elements.gameModeSelect.value = gameState.gameMode;
    elements.themeSelect.value = gameState.theme;
}

function saveSettings() {
    const settings = {
        musicEnabled: gameState.musicEnabled,
        sfxEnabled: gameState.sfxEnabled,
        vibrationEnabled: gameState.vibrationEnabled,
        difficulty: gameState.difficulty,
        gameMode: gameState.gameMode,
        theme: gameState.theme
    };
    localStorage.setItem('gameSettings', JSON.stringify(settings));
}

function applyTheme() {
    const body = document.body;
    body.className = '';
    
    if (gameState.theme === 'auto') {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 18) {
            body.classList.add('day-mode');
        } else {
            body.classList.add('night-mode');
        }
    } else {
        body.classList.add('theme-' + gameState.theme);
    }
}

// ========== CUSTOM CURSOR ==========
function initCursor() {
    const cursorTrail = document.querySelector('.cursor-trail');
    
    document.addEventListener('mousemove', (e) => {
        cursorTrail.style.left = e.clientX - 15 + 'px';
        cursorTrail.style.top = e.clientY - 15 + 'px';
    });
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    // Menu navigation
    elements.playBtn.addEventListener('click', startGame);
    elements.howToPlayBtn.addEventListener('click', () => showScreen('howToPlayMenu'));
    elements.settingsBtn.addEventListener('click', () => showScreen('settingsMenu'));
    elements.leaderboardBtn.addEventListener('click', () => {
        updateLeaderboard();
        showScreen('leaderboardMenu');
    });
    
    elements.backFromHowTo.addEventListener('click', () => showScreen('startMenu'));
    elements.backFromSettings.addEventListener('click', () => {
        saveSettings();
        showScreen('startMenu');
    });
    elements.backFromLeaderboard.addEventListener('click', () => showScreen('startMenu'));
    
        // Reset stats
        elements.resetStatsBtn.addEventListener('click', resetStats);
    
    // Player name
    elements.playerName.addEventListener('input', (e) => {
        gameState.playerName = e.target.value || 'Player';
        localStorage.setItem('playerName', gameState.playerName);
    });
    
    // Settings toggles
    elements.musicToggle.addEventListener('click', () => {
        gameState.musicEnabled = !gameState.musicEnabled;
        elements.musicToggle.textContent = gameState.musicEnabled ? 'ON' : 'OFF';
        elements.musicToggle.classList.toggle('active');
    });
    
    elements.sfxToggle.addEventListener('click', () => {
        gameState.sfxEnabled = !gameState.sfxEnabled;
        elements.sfxToggle.textContent = gameState.sfxEnabled ? 'ON' : 'OFF';
        elements.sfxToggle.classList.toggle('active');
        playSound(800, 0.1);
    });
    
    elements.vibrationToggle.addEventListener('click', () => {
        gameState.vibrationEnabled = !gameState.vibrationEnabled;
        elements.vibrationToggle.textContent = gameState.vibrationEnabled ? 'ON' : 'OFF';
        elements.vibrationToggle.classList.toggle('active');
        vibrate(50);
    });
    
    elements.difficultySelect.addEventListener('change', (e) => {
        gameState.difficulty = e.target.value;
    });
    
    elements.gameModeSelect.addEventListener('change', (e) => {
        gameState.gameMode = e.target.value;
    });
    
    elements.themeSelect.addEventListener('change', (e) => {
        gameState.theme = e.target.value;
        applyTheme();
    });
    
    // Game controls
    elements.pauseBtn.addEventListener('click', () => {
        if (gameState.isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    });
    elements.muteBtn.addEventListener('click', toggleMute);
    elements.resumeBtn.addEventListener('click', resumeGame);
    elements.restartFromPause.addEventListener('click', () => {
        // Close pause menu and clear intervals
        elements.pauseMenu.classList.remove('active');
        gameState.isPaused = false;
        clearInterval(gameState.spawnInterval);
        if (gameState.timerInterval) clearInterval(gameState.timerInterval);
        clearInterval(gameState.difficultyInterval);
        // Start fresh game
        startGame();
    });
    elements.quitBtn.addEventListener('click', quitToMenu);
    
    // End screen
    elements.playAgainBtn.addEventListener('click', startGame);
    elements.backToMenuBtn.addEventListener('click', () => showScreen('startMenu'));
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && gameState.isPlaying) {
            e.preventDefault();
            if (gameState.isPaused) {
                resumeGame();
            } else {
                pauseGame();
            }
        }
    });
    
    // Click effects
    document.addEventListener('click', createRipple);
}

function showScreen(screenId) {
    document.querySelectorAll('.menu-screen, .game-screen, .overlay-menu').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
    }
}

// ========== GAME FLOW ==========
function startGame() {
    // Reset game state
    gameState.score = 0;
    gameState.combo = 0;
    gameState.maxCombo = 0;
    gameState.bubblesPopped = 0;
    gameState.bubblesMissed = 0;
    gameState.isPaused = false;
    gameState.isPlaying = false;
    gameState.doublePoints = false;
    gameState.freezeTime = false;
    gameState.unlockedAchievements = [];
    
    // Set time based on game mode
    if (gameState.gameMode === 'timed') {
        gameState.timeLeft = 60;
    } else {
        gameState.timeLeft = 0;
    }
    
    // Clear game container
    elements.gameContainer.innerHTML = '';
    
    // Update UI
    updateScore();
    updateCombo();
    updateTimer();
    
    // Reset pause button to pause emoji
    elements.pauseBtn.textContent = '⏸️';
    
    // Show game screen
    showScreen('gameScreen');
    
    // Start countdown
    startCountdown();
}

function startCountdown() {
    let count = 3;
    elements.countdown.classList.add('active');
    elements.countdown.textContent = count;
    playSound(800, 0.2);
    
    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            elements.countdown.textContent = count;
            playSound(800, 0.2);
        } else {
            elements.countdown.textContent = 'GO!';
            playSound(1200, 0.3);
            setTimeout(() => {
                elements.countdown.classList.remove('active');
                beginGame();
            }, 500);
            clearInterval(countdownInterval);
        }
    }, 1000);
}

function beginGame() {
    gameState.isPlaying = true;
    
    // Delay bubble spawning by 500ms after countdown ends
    setTimeout(() => {
        // Start bubble spawning
        gameState.spawnInterval = setInterval(spawnBubble, difficultySettings[gameState.difficulty].spawnInterval);
    }, 500);
    
    // Start timer (for timed mode)
    if (gameState.gameMode === 'timed') {
        gameState.timerInterval = setInterval(updateGameTimer, 1000);
    }
    
    // Gradually increase difficulty
    gameState.difficultyInterval = setInterval(increaseDifficulty, 10000);
}

function pauseGame() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    gameState.isPaused = true;
    clearInterval(gameState.spawnInterval);
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    clearInterval(gameState.difficultyInterval);
    
    elements.pauseMenu.classList.add('active');
    elements.pauseBtn.textContent = '▶️';
}

function resumeGame() {
    if (!gameState.isPaused) return;
    
    gameState.isPaused = false;
    elements.pauseMenu.classList.remove('active');
    elements.pauseBtn.textContent = '⏸️';
    
    gameState.spawnInterval = setInterval(spawnBubble, difficultySettings[gameState.difficulty].spawnInterval);
    
    if (gameState.gameMode === 'timed' && gameState.timeLeft > 0) {
        gameState.timerInterval = setInterval(updateGameTimer, 1000);
    }
    
    gameState.difficultyInterval = setInterval(increaseDifficulty, 10000);
}

function toggleMute() {
    gameState.sfxEnabled = !gameState.sfxEnabled;
    gameState.musicEnabled = !gameState.musicEnabled;
    elements.muteBtn.textContent = gameState.sfxEnabled ? '🔊' : '🔇';
}

function quitToMenu() {
    endGame(false);
    showScreen('startMenu');
}

function endGame(showEndScreen = true) {
    gameState.isPlaying = false;
    gameState.isPaused = false;
    
    clearInterval(gameState.spawnInterval);
    clearInterval(gameState.timerInterval);
    clearInterval(gameState.difficultyInterval);
    clearTimeout(gameState.comboTimer);
    
    // Clear all bubbles
    elements.gameContainer.innerHTML = '';
    
    if (showEndScreen) {
        // Calculate stats
        const totalBubbles = gameState.bubblesPopped + gameState.bubblesMissed;
        const accuracy = totalBubbles > 0 ? Math.round((gameState.bubblesPopped / totalBubbles) * 100) : 0;
        
        // Update end screen
        elements.finalScore.textContent = gameState.score;
        elements.bubblesPopped.textContent = gameState.bubblesPopped;
        elements.bubblesMissed.textContent = gameState.bubblesMissed;
        elements.accuracy.textContent = accuracy + '%';
        elements.bestCombo.textContent = gameState.maxCombo;
        
        // Check and save high score
        const highScore = parseInt(localStorage.getItem('highScore') || '0');
        if (gameState.score > highScore) {
            localStorage.setItem('highScore', gameState.score);
            elements.highScore.textContent = gameState.score + ' 🎉 NEW!';
        } else {
            elements.highScore.textContent = highScore;
        }
        
        // Save to leaderboard
        saveToLeaderboard();
        
        // Check achievements
        checkAchievements();
        displayAchievements();
        
        // Show end screen
        showScreen('endScreen');
    }
}

// ========== GAME TIMER ==========
function updateGameTimer() {
    if (gameState.freezeTime) return;
    
    gameState.timeLeft--;
    updateTimer();
    
    if (gameState.timeLeft <= 0) {
        endGame();
    }
}

function updateTimer() {
    if (gameState.gameMode === 'timed') {
        elements.timer.textContent = gameState.timeLeft;
        
        // Update circle progress
        const maxTime = 60;
        const progress = (gameState.timeLeft / maxTime) * 283;
        elements.timerProgress.style.strokeDashoffset = 283 - progress;
    } else if (gameState.gameMode === 'endless') {
        elements.timer.textContent = '∞';
        elements.timerProgress.style.strokeDashoffset = 0;
    }
}

// ========== BUBBLE SPAWNING ==========
function spawnBubble() {
    const settings = difficultySettings[gameState.difficulty];
    const currentBubbles = elements.gameContainer.children.length;
    
    if (currentBubbles >= settings.maxBubbles) return;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    // Random size (smaller = more points)
    const size = Math.random() * 60 + 40; // 40-100px
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    
    // Random position
    const maxX = window.innerWidth - size - 20;
    const maxY = window.innerHeight - size - 150;
    bubble.style.left = Math.random() * maxX + 'px';
    bubble.style.top = Math.random() * maxY + 100 + 'px';
    
    // Determine bubble type
    const rand = Math.random();
    if (rand < 0.05) {
        // 5% trap bubble
        bubble.classList.add('trap');
        bubble.dataset.type = 'trap';
    } else if (rand < 0.08) {
        // 3% power-up
        const powerUps = ['freeze', 'bomb', 'double'];
        const powerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
        bubble.classList.add('powerup-' + powerUp);
        bubble.dataset.type = 'powerup';
        bubble.dataset.powerup = powerUp;
    } else {
        // Normal bubble with random color
        const hue = Math.random() * 360;
        bubble.style.background = `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${hue + 30}, 70%, 70%))`;
        bubble.dataset.type = 'normal';
    }
    
    bubble.dataset.size = size;
    bubble.dataset.points = Math.round(150 - size);
    
    // Add click event
    bubble.addEventListener('click', (e) => {
        e.stopPropagation();
        popBubble(bubble);
    });
    
    // Add touch event for mobile
    bubble.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        popBubble(bubble);
    });
    
    elements.gameContainer.appendChild(bubble);
    
    // Auto-pop after lifetime
    bubble.autoPopTimeout = setTimeout(() => {
        if (bubble.parentElement && bubble.dataset.type !== 'trap') {
            missedBubble(bubble);
        }
    }, settings.bubbleLifetime);
}

// ========== BUBBLE INTERACTION ==========
function popBubble(bubble) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    if (bubble.classList.contains('popping')) return;
    
    clearTimeout(bubble.autoPopTimeout);
    
    const type = bubble.dataset.type;
    const size = parseFloat(bubble.dataset.size);
    const rect = bubble.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    if (type === 'trap') {
        // Trap bubble - lose points
        const penalty = Math.max(100, Math.floor(gameState.score * 0.1));
        gameState.score = Math.max(0, gameState.score - penalty);
        updateScore();
        playSound(200, 0.3);
        vibrate(200);
        showFloatingText('OOPS! -' + penalty, x, y, '#ff0000');
        
        // Reset combo
        gameState.combo = 0;
        updateCombo();
    } else if (type === 'powerup') {
        // Power-up bubble
        activatePowerUp(bubble.dataset.powerup, x, y);
        playPowerUpSound();
        vibrate(50);
    } else {
        // Normal bubble
        let points = parseInt(bubble.dataset.points);
        
        // Apply combo multiplier
        gameState.combo++;
        if (gameState.combo > gameState.maxCombo) {
            gameState.maxCombo = gameState.combo;
        }
        
        const multiplier = Math.min(Math.floor(gameState.combo / 5) + 1, 10);
        points *= multiplier;
        
        // Apply double points power-up
        if (gameState.doublePoints) {
            points *= 2;
        }
        
        gameState.score += points;
        gameState.bubblesPopped++;
        
        updateScore();
        updateCombo();
        
        playPopSound(size);
        vibrate(30);
        
        // Show points
        showFloatingText('+' + points, x, y, '#00d9ff');
        
        // Combo feedback
        if (gameState.combo % 5 === 0 && gameState.combo > 0) {
            playComboSound();
            showFloatingText('COMBO x' + multiplier + '!', x, y - 50, '#ffeb3b');
            elements.comboDisplay.classList.add('active');
            setTimeout(() => elements.comboDisplay.classList.remove('active'), 300);
        }
        
        // Reset combo timer
        clearTimeout(gameState.comboTimer);
        gameState.comboTimer = setTimeout(() => {
            gameState.combo = 0;
            updateCombo();
        }, 2000);
    }
    
    // Pop animation
    bubble.classList.add('popping');
    createParticles(x, y, bubble.style.background || '#00d9ff');
    
    setTimeout(() => {
        if (bubble.parentElement) {
            bubble.remove();
        }
    }, 300);
}

function missedBubble(bubble) {
    gameState.bubblesMissed++;
    
    // Reset combo
    gameState.combo = 0;
    updateCombo();
    
    playSound(150, 0.2);
    
    if (bubble.parentElement) {
        bubble.classList.add('popping');
        setTimeout(() => bubble.remove(), 300);
    }
}

// ========== POWER-UPS ==========
function activatePowerUp(type, x, y) {
    switch(type) {
        case 'freeze':
            gameState.freezeTime = true;
            showFloatingText('🧊 TIME FROZEN!', x, y, '#00d9ff');
            setTimeout(() => {
                gameState.freezeTime = false;
            }, 5000);
            break;
            
        case 'bomb':
            showFloatingText('💥 BOMB!', x, y, '#ff6b00');
            const bubbles = elements.gameContainer.querySelectorAll('.bubble');
            bubbles.forEach(b => {
                if (b.dataset.type === 'normal') {
                    setTimeout(() => popBubble(b), Math.random() * 500);
                }
            });
            break;
            
        case 'double':
            gameState.doublePoints = true;
            showFloatingText('⭐ DOUBLE POINTS!', x, y, '#ffd700');
            setTimeout(() => {
                gameState.doublePoints = false;
            }, 10000);
            break;
    }
}

// ========== UI UPDATES ==========
function updateScore() {
    elements.score.textContent = gameState.score;
}

function updateCombo() {
    if (gameState.combo > 1) {
        elements.combo.textContent = 'x' + gameState.combo;
        elements.comboDisplay.style.opacity = '1';
    } else {
        elements.combo.textContent = 'x1';
        elements.comboDisplay.style.opacity = '0.5';
    }
}

// ========== VISUAL EFFECTS ==========
function createParticles(x, y, color) {
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = color;
        
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 50 + Math.random() * 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 600);
    }
}

function showFloatingText(text, x, y, color) {
    const floatingText = document.createElement('div');
    floatingText.className = 'floating-text';
    floatingText.textContent = text;
    floatingText.style.left = x + 'px';
    floatingText.style.top = y + 'px';
    floatingText.style.color = color;
    
    document.body.appendChild(floatingText);
    
    setTimeout(() => floatingText.remove(), 1000);
}

function createRipple(e) {
    if (!gameState.isPlaying) return;
    
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = e.clientX - 50 + 'px';
    ripple.style.top = e.clientY - 50 + 'px';
    
    document.body.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// ========== DIFFICULTY PROGRESSION ==========
function increaseDifficulty() {
    const settings = difficultySettings[gameState.difficulty];
    
    // Increase spawn rate
    if (settings.spawnInterval > 300) {
        settings.spawnInterval -= 50;
        clearInterval(gameState.spawnInterval);
        gameState.spawnInterval = setInterval(spawnBubble, settings.spawnInterval);
    }
    
    // Decrease bubble lifetime
    if (settings.bubbleLifetime > 2000) {
        settings.bubbleLifetime -= 200;
    }
}

// ========== LEADERBOARD ==========
function saveToLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    
    leaderboard.push({
        name: gameState.playerName,
        score: gameState.score,
        date: new Date().toLocaleDateString(),
        difficulty: gameState.difficulty,
        mode: gameState.gameMode
    });
    
    // Sort and keep top 10
    leaderboard.sort((a, b) => b.score - a.score);
    const top10 = leaderboard.slice(0, 10);
    
    localStorage.setItem('leaderboard', JSON.stringify(top10));
}

function updateLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    elements.leaderboardList.innerHTML = '';
    
    if (leaderboard.length === 0) {
        elements.leaderboardList.innerHTML = '<p style="color: white; text-align: center;">No scores yet!</p>';
        return;
    }
    
    leaderboard.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        if (index === 0) item.classList.add('rank-1');
        else if (index === 1) item.classList.add('rank-2');
        else if (index === 2) item.classList.add('rank-3');
        
        item.innerHTML = `
            <span>${index + 1}. ${entry.name}</span>
            <span>${entry.score}</span>
        `;
        
        elements.leaderboardList.appendChild(item);
    });
}

    function resetStats() {
        // Confirmation dialog
        const confirmed = confirm('Are you sure you want to reset all stats? This will clear:\n\n• Leaderboard\n• High Score\n• Achievements\n\nThis action cannot be undone!');
    
        if (confirmed) {
            // Clear leaderboard
            localStorage.removeItem('leaderboard');
        
            // Clear high score
            localStorage.removeItem('highScore');
        
            // Clear achievements
            localStorage.removeItem('achievements');
        
            // Update leaderboard display
            updateLeaderboard();
        
            // Play sound feedback
            playSound(600, 0.1);
            setTimeout(() => playSound(400, 0.1), 100);
            setTimeout(() => playSound(200, 0.2), 200);
        
            // Visual feedback
            alert('✅ All stats have been reset!');
        }
    }

// ========== ACHIEVEMENTS ==========
function checkAchievements() {
    const achievements = [
        { id: 'first_pop', name: '🫧 First Pop', condition: () => gameState.bubblesPopped >= 1 },
        { id: 'century', name: '💯 Century Club', condition: () => gameState.bubblesPopped >= 100 },
        { id: 'combo_master', name: '⚡ Combo Master', condition: () => gameState.maxCombo >= 20 },
        { id: 'perfectionist', name: '🎯 Perfectionist', condition: () => {
            const total = gameState.bubblesPopped + gameState.bubblesMissed;
            return total > 0 && (gameState.bubblesPopped / total) >= 0.95;
        }},
        { id: 'high_scorer', name: '🏆 High Scorer', condition: () => gameState.score >= 5000 },
        { id: 'survivor', name: '💪 Survivor', condition: () => gameState.bubblesPopped >= 50 }
    ];
    
    const unlockedBefore = JSON.parse(localStorage.getItem('achievements') || '[]');
    
    achievements.forEach(achievement => {
        if (achievement.condition() && !unlockedBefore.includes(achievement.id)) {
            gameState.unlockedAchievements.push(achievement);
            unlockedBefore.push(achievement.id);
        }
    });
    
    localStorage.setItem('achievements', JSON.stringify(unlockedBefore));
}

function displayAchievements() {
    elements.achievementsUnlocked.innerHTML = '';
    
    if (gameState.unlockedAchievements.length > 0) {
        const title = document.createElement('h3');
        title.textContent = '🎉 New Achievements!';
        title.style.color = 'var(--text-color)';
        title.style.marginBottom = '10px';
        elements.achievementsUnlocked.appendChild(title);
        
        gameState.unlockedAchievements.forEach(achievement => {
            const badge = document.createElement('div');
            badge.className = 'achievement';
            badge.textContent = achievement.name;
            elements.achievementsUnlocked.appendChild(badge);
        });
    }
}

// ========== START THE GAME ==========
init();
