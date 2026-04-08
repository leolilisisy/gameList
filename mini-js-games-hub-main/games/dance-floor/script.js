// Dance Floor Game
// Follow dance moves and hit arrows at the right time

// DOM elements
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const changeSongBtn = document.getElementById('change-song-btn');

const currentScoreEl = document.getElementById('current-score');
const currentComboEl = document.getElementById('current-combo');
const perfectCountEl = document.getElementById('perfect-count');
const progressFillEl = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');

const finalScoreEl = document.getElementById('final-score');
const finalComboEl = document.getElementById('final-combo');
const finalPerfectEl = document.getElementById('final-perfect');
const finalAccuracyEl = document.getElementById('final-accuracy');
const finalGradeEl = document.getElementById('final-grade');

const resultsScreen = document.getElementById('results-screen');
const moveQueueEl = document.getElementById('move-queue');
const messageEl = document.getElementById('message');

const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const songSelect = document.getElementById('song-select');
const floorTiles = document.querySelectorAll('.floor-tile');

// Game state
let gameActive = false;
let gamePaused = false;
let currentDifficulty = 'easy';
let currentSong = 'upbeat';
let score = 0;
let combo = 0;
let perfectMoves = 0;
let totalMoves = 0;
let gameStartTime = 0;
let gameDuration = 60000; // 60 seconds
let moveSequence = [];
let currentMoveIndex = 0;
let upcomingMoves = [];
let activeArrows = new Set();
let gameLoop = null;
let audioContext = null;

// Difficulty settings
const difficultySettings = {
    easy: {
        speed: 2000, // ms for arrow to reach bottom
        sequenceLength: 50,
        perfectWindow: 200, // ms perfect timing window
        goodWindow: 400, // ms good timing window
        points: { perfect: 100, good: 50, miss: 0 }
    },
    medium: {
        speed: 1500,
        sequenceLength: 75,
        perfectWindow: 150,
        goodWindow: 300,
        points: { perfect: 150, good: 75, miss: 0 }
    },
    hard: {
        speed: 1200,
        sequenceLength: 100,
        perfectWindow: 120,
        goodWindow: 250,
        points: { perfect: 200, good: 100, miss: 0 }
    },
    expert: {
        speed: 1000,
        sequenceLength: 125,
        perfectWindow: 100,
        goodWindow: 200,
        points: { perfect: 300, good: 150, miss: 0 }
    }
};

// Song data (simplified beat patterns)
const songs = {
    upbeat: {
        name: 'Upbeat Groove',
        bpm: 120,
        pattern: ['up', 'right', 'down', 'left', 'up', 'right', 'down', 'left']
    },
    electronic: {
        name: 'Electronic Beat',
        bpm: 140,
        pattern: ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right']
    },
    pop: {
        name: 'Pop Rhythm',
        bpm: 100,
        pattern: ['right', 'up', 'left', 'down', 'right', 'up', 'left', 'down']
    },
    rock: {
        name: 'Rock Anthem',
        bpm: 160,
        pattern: ['down', 'right', 'up', 'left', 'down', 'right', 'up', 'left']
    },
    jazz: {
        name: 'Jazz Swing',
        bpm: 110,
        pattern: ['up', 'left', 'down', 'right', 'up', 'left', 'down', 'right']
    }
};

// Initialize the game
function initGame() {
    setupAudioContext();
    setupEventListeners();
    generateMoveSequence();
    updateDisplay();
    showMessage('Welcome to Dance Floor! Choose difficulty and start dancing!', 'success');
}

// Setup Web Audio API
function setupAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not supported');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Game controls
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', restartGame);
    changeSongBtn.addEventListener('click', () => {
        resultsScreen.classList.remove('show');
        showMessage('Choose a new song and start dancing!', 'info');
    });

    // Difficulty selection
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => selectDifficulty(btn.dataset.difficulty));
    });

    // Song selection
    songSelect.addEventListener('change', (e) => {
        currentSong = e.target.value;
        generateMoveSequence();
        showMessage(`Selected: ${songs[currentSong].name}`, 'info');
    });

    // Floor tiles (mouse/touch)
    floorTiles.forEach(tile => {
        tile.addEventListener('click', () => handleTilePress(tile.dataset.direction));
    });

    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
}

// Select difficulty
function selectDifficulty(difficulty) {
    currentDifficulty = difficulty;

    // Update UI
    difficultyBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');

    generateMoveSequence();
    showMessage(`Difficulty set to ${difficulty.toUpperCase()}`, 'info');
}

// Generate move sequence based on song and difficulty
function generateMoveSequence() {
    const song = songs[currentSong];
    const settings = difficultySettings[currentDifficulty];
    const pattern = song.pattern;

    moveSequence = [];
    upcomingMoves = [];

    // Generate sequence based on song pattern
    for (let i = 0; i < settings.sequenceLength; i++) {
        const direction = pattern[i % pattern.length];
        const timing = (i * 60 / song.bpm) * 1000; // Convert to milliseconds

        moveSequence.push({
            direction: direction,
            timing: timing,
            id: i
        });
    }

    // Set game duration based on sequence
    gameDuration = moveSequence[moveSequence.length - 1].timing + 2000;
    updateTimeDisplay();
}

// Start the game
function startGame() {
    if (gameActive) return;

    gameActive = true;
    gamePaused = false;
    gameStartTime = Date.now();
    currentMoveIndex = 0;
    score = 0;
    combo = 0;
    perfectMoves = 0;
    totalMoves = 0;

    // Reset UI
    startBtn.classList.add('active');
    pauseBtn.classList.remove('active');
    resultsScreen.classList.remove('show');

    // Clear active arrows
    activeArrows.clear();
    document.querySelectorAll('.arrow').forEach(arrow => {
        arrow.classList.remove('active');
    });

    // Start game loop
    gameLoop = setInterval(updateGame, 16); // ~60 FPS

    // Schedule moves
    scheduleMoves();

    updateDisplay();
    showMessage('Dance started! Follow the arrows!', 'success');
}

// Schedule upcoming moves
function scheduleMoves() {
    moveSequence.forEach((move, index) => {
        setTimeout(() => {
            if (gameActive && !gamePaused) {
                spawnArrow(move);
            }
        }, move.timing);
    });
}

// Spawn arrow indicator
function spawnArrow(move) {
    const direction = move.direction;
    const arrowEl = document.querySelector(`.${direction}-arrow`);
    const indicatorEl = document.querySelector(`.${direction}-indicator`);

    if (!arrowEl || !indicatorEl) return;

    // Create arrow object
    const arrow = {
        element: arrowEl,
        direction: direction,
        spawnTime: Date.now(),
        move: move,
        position: 0
    };

    activeArrows.add(arrow);
    arrowEl.classList.add('active');

    // Add to upcoming moves display
    addToUpcomingMoves(move);
}

// Update game state
function updateGame() {
    if (!gameActive || gamePaused) return;

    const currentTime = Date.now() - gameStartTime;
    const progress = (currentTime / gameDuration) * 100;

    // Update progress bar
    progressFillEl.style.width = Math.min(progress, 100) + '%';

    // Update time display
    updateTimeDisplay();

    // Update arrow positions
    updateArrows(currentTime);

    // Check for game end
    if (currentTime >= gameDuration) {
        endGame();
    }
}

// Update arrow positions and check for misses
function updateArrows(currentTime) {
    activeArrows.forEach(arrow => {
        const elapsed = currentTime - arrow.spawnTime;
        const settings = difficultySettings[currentDifficulty];
        const progress = elapsed / settings.speed;

        arrow.position = progress;

        // Check for miss (arrow passed the hit zone)
        if (progress > 1.2) { // 20% grace period
            handleMiss(arrow);
        }
    });
}

// Handle tile press
function handleTilePress(direction) {
    if (!gameActive || gamePaused) return;

    // Find the closest arrow for this direction
    let closestArrow = null;
    let closestDistance = Infinity;

    activeArrows.forEach(arrow => {
        if (arrow.direction === direction) {
            const distance = Math.abs(arrow.position - 1); // 1 = hit zone
            if (distance < closestDistance) {
                closestDistance = distance;
                closestArrow = arrow;
            }
        }
    });

    if (closestArrow) {
        const settings = difficultySettings[currentDifficulty];
        const timingError = closestDistance * settings.speed;

        if (timingError <= settings.perfectWindow) {
            handleHit(closestArrow, 'perfect');
        } else if (timingError <= settings.goodWindow) {
            handleHit(closestArrow, 'good');
        } else {
            handleMiss(closestArrow);
        }
    } else {
        // No arrow to hit - incorrect press
        handleIncorrectPress(direction);
    }

    // Visual feedback
    const tile = document.querySelector(`[data-direction="${direction}"]`);
    if (tile) {
        tile.classList.add('active');
        setTimeout(() => tile.classList.remove('active'), 200);
    }

    // Play sound
    playSound(direction, 'press');
}

// Handle successful hit
function handleHit(arrow, quality) {
    const settings = difficultySettings[currentDifficulty];
    const basePoints = settings.points[quality];

    // Combo multiplier
    const comboMultiplier = Math.min(combo * 0.1 + 1, 5);
    const points = Math.round(basePoints * comboMultiplier);

    score += points;
    combo++;
    totalMoves++;

    if (quality === 'perfect') {
        perfectMoves++;
    }

    // Remove arrow
    activeArrows.delete(arrow);
    arrow.element.classList.remove('active');

    // Visual feedback
    const tile = document.querySelector(`[data-direction="${arrow.direction}"]`);
    if (tile) {
        tile.classList.add('correct');
        setTimeout(() => tile.classList.remove('correct'), 500);
    }

    // Update upcoming moves
    removeFromUpcomingMoves(arrow.move);

    updateDisplay();
    showMessage(`${quality.toUpperCase()}! +${points} (${combo}x combo)`, quality === 'perfect' ? 'success' : 'info');
}

// Handle miss
function handleMiss(arrow) {
    combo = 0;
    totalMoves++;

    // Remove arrow
    activeArrows.delete(arrow);
    arrow.element.classList.remove('active');

    // Visual feedback
    const tile = document.querySelector(`[data-direction="${arrow.direction}"]`);
    if (tile) {
        tile.classList.add('incorrect');
        setTimeout(() => tile.classList.remove('incorrect'), 500);
    }

    // Update upcoming moves
    removeFromUpcomingMoves(arrow.move);

    updateDisplay();
    showMessage('Miss! Combo broken!', 'error');
}

// Handle incorrect press
function handleIncorrectPress(direction) {
    combo = 0;

    const tile = document.querySelector(`[data-direction="${direction}"]`);
    if (tile) {
        tile.classList.add('incorrect');
        setTimeout(() => tile.classList.remove('incorrect'), 500);
    }

    showMessage('Wrong timing!', 'warning');
}

// Keyboard controls
function handleKeyPress(e) {
    if (!gameActive || gamePaused) return;

    const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
    };

    if (keyMap[e.key]) {
        e.preventDefault();
        handleTilePress(keyMap[e.key]);
    }
}

// Toggle pause
function togglePause() {
    if (!gameActive) return;

    gamePaused = !gamePaused;

    if (gamePaused) {
        pauseBtn.classList.add('active');
        showMessage('Game paused', 'info');
    } else {
        pauseBtn.classList.remove('active');
        gameStartTime = Date.now() - (Date.now() - gameStartTime); // Adjust start time
        showMessage('Game resumed', 'info');
    }
}

// End game
function endGame() {
    gameActive = false;
    clearInterval(gameLoop);

    // Clear active arrows
    activeArrows.clear();
    document.querySelectorAll('.arrow').forEach(arrow => {
        arrow.classList.remove('active');
    });

    // Calculate final stats
    const accuracy = totalMoves > 0 ? Math.round((perfectMoves / totalMoves) * 100) : 0;
    const grade = calculateGrade(accuracy, score, combo);

    // Update results screen
    finalScoreEl.textContent = score.toLocaleString();
    finalComboEl.textContent = combo;
    finalPerfectEl.textContent = perfectMoves;
    finalAccuracyEl.textContent = accuracy + '%';
    finalGradeEl.textContent = grade;
    finalGradeEl.className = `stat-value grade ${grade}`;

    // Show results
    resultsScreen.classList.add('show');

    // Reset UI
    startBtn.classList.remove('active');
    pauseBtn.classList.remove('active');

    showMessage('Dance complete! Check your results!', 'success');
}

// Restart game
function restartGame() {
    endGame();
    setTimeout(startGame, 500);
}

// Calculate grade
function calculateGrade(accuracy, score, maxCombo) {
    const weightedScore = (accuracy * 0.4) + (Math.min(score / 10000, 1) * 0.4) + (Math.min(maxCombo / 50, 1) * 0.2);

    if (weightedScore >= 0.95) return 'S';
    if (weightedScore >= 0.85) return 'A';
    if (weightedScore >= 0.75) return 'B';
    if (weightedScore >= 0.65) return 'C';
    if (weightedScore >= 0.55) return 'D';
    return 'F';
}

// Add to upcoming moves display
function addToUpcomingMoves(move) {
    upcomingMoves.push(move);

    // Keep only next 5 moves
    if (upcomingMoves.length > 5) {
        upcomingMoves.shift();
    }

    updateUpcomingMovesDisplay();
}

// Remove from upcoming moves display
function removeFromUpcomingMoves(move) {
    upcomingMoves = upcomingMoves.filter(m => m.id !== move.id);
    updateUpcomingMovesDisplay();
}

// Update upcoming moves display
function updateUpcomingMovesDisplay() {
    if (upcomingMoves.length === 0) {
        moveQueueEl.innerHTML = '<div class="empty-queue">🎵 Start the game to see upcoming moves!</div>';
        return;
    }

    let html = '';
    upcomingMoves.slice(0, 5).forEach(move => {
        const arrowEmoji = getArrowEmoji(move.direction);
        const timing = Math.max(0, Math.round((move.timing - (Date.now() - gameStartTime)) / 1000));
        html += `<div class="move-item">
            <span class="move-arrow">${arrowEmoji}</span>
            <span class="move-timing">${timing}s</span>
        </div>`;
    });

    moveQueueEl.innerHTML = html;
}

// Get arrow emoji
function getArrowEmoji(direction) {
    const emojis = {
        up: '⬆️',
        down: '⬇️',
        left: '⬅️',
        right: '➡️'
    };
    return emojis[direction] || '❓';
}

// Play sound effect
function playSound(type, subtype = '') {
    if (!audioContext) return;

    let frequency = 440;
    let duration = 0.1;

    // Different sounds for different actions
    if (type === 'up') frequency = 523; // C5
    else if (type === 'down') frequency = 294; // D4
    else if (type === 'left') frequency = 349; // F4
    else if (type === 'right') frequency = 392; // G4
    else if (type === 'press') {
        frequency = 800;
        duration = 0.05;
    }

    // Create oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Update display elements
function updateDisplay() {
    currentScoreEl.textContent = score.toLocaleString();
    currentComboEl.textContent = combo;
    perfectCountEl.textContent = perfectMoves;
}

// Update time display
function updateTimeDisplay() {
    if (!gameActive) return;

    const currentTime = Date.now() - gameStartTime;
    const remaining = Math.max(0, gameDuration - currentTime);

    currentTimeEl.textContent = formatTime(currentTime);
    totalTimeEl.textContent = formatTime(gameDuration);
}

// Format time as MM:SS
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Show message
function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type} show`;

    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

// Initialize the game
initGame();

// This dance floor game includes arrow-based rhythm gameplay,
// multiple difficulty levels, scoring system with combos,
// song selection, and timing-based accuracy detection