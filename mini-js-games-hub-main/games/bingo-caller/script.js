// Bingo Caller Game
// Classic bingo with number calling and card marking

// DOM elements
const calledCountEl = document.getElementById('current-called');
const lastNumberEl = document.getElementById('last-called');
const statusEl = document.getElementById('status');
const messageEl = document.getElementById('message');
const calledListEl = document.getElementById('called-list');
const callNumberBtn = document.getElementById('call-number-btn');
const autoPlayBtn = document.getElementById('auto-play-btn');
const newGameBtn = document.getElementById('new-game-btn');
const checkBingoBtn = document.getElementById('check-bingo-btn');
const autoMarkCheckbox = document.getElementById('auto-mark');
const soundEnabledCheckbox = document.getElementById('sound-enabled');

// Game variables
let availableNumbers = [];
let calledNumbers = [];
let lastCalled = null;
let isAutoPlaying = false;
let autoPlayInterval = null;
let gameActive = false;

// Initialize game
function initGame() {
    resetGame();
    setupEventListeners();
}

// Reset the game
function resetGame() {
    // Generate all numbers 1-75
    availableNumbers = [];
    for (let i = 1; i <= 75; i++) {
        availableNumbers.push(i);
    }

    calledNumbers = [];
    lastCalled = null;
    isAutoPlaying = false;

    // Clear called numbers display
    calledListEl.innerHTML = '';

    // Reset card markings
    document.querySelectorAll('.number-cell.marked').forEach(cell => {
        if (!cell.classList.contains('free-space')) {
            cell.classList.remove('marked');
        }
    });

    // Mark free space
    document.querySelector('.free-space').classList.add('marked');

    // Update display
    updateDisplay();

    gameActive = true;
    statusEl.textContent = 'Ready to Play';
    messageEl.textContent = 'Click "Call Next Number" to start!';
}

// Setup event listeners
function setupEventListeners() {
    // Number cells
    document.querySelectorAll('.number-cell').forEach(cell => {
        if (!cell.classList.contains('free-space')) {
            cell.addEventListener('click', () => markCell(cell));
        }
    });

    // Control buttons
    callNumberBtn.addEventListener('click', callNextNumber);
    autoPlayBtn.addEventListener('click', toggleAutoPlay);
    newGameBtn.addEventListener('click', resetGame);
    checkBingoBtn.addEventListener('click', checkForBingo);

    // Options
    autoMarkCheckbox.addEventListener('change', () => {
        if (autoMarkCheckbox.checked && lastCalled) {
            autoMarkNumber(lastCalled);
        }
    });
}

// Call the next random number
function callNextNumber() {
    if (!gameActive || availableNumbers.length === 0) {
        if (availableNumbers.length === 0) {
            messageEl.textContent = 'All numbers have been called!';
            statusEl.textContent = 'Game Complete';
            gameActive = false;
        }
        return;
    }

    // Get random number
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const number = availableNumbers.splice(randomIndex, 1)[0];

    calledNumbers.push(number);
    lastCalled = number;

    // Add to called list display
    addCalledNumber(number);

    // Auto-mark if enabled
    if (autoMarkCheckbox.checked) {
        autoMarkNumber(number);
    }

    // Update display
    updateDisplay();

    // Play sound if enabled
    if (soundEnabledCheckbox.checked) {
        playSound();
    }

    // Check for auto bingo
    setTimeout(() => {
        if (checkForBingo(true)) {
            if (isAutoPlaying) {
                toggleAutoPlay();
            }
        }
    }, 500);
}

// Add number to called list display
function addCalledNumber(number) {
    const numberDiv = document.createElement('div');
    numberDiv.className = 'called-number';
    numberDiv.textContent = number;
    calledListEl.appendChild(numberDiv);

    // Scroll to bottom
    calledListEl.scrollTop = calledListEl.scrollHeight;
}

// Mark a cell on the card
function markCell(cell) {
    if (!gameActive) return;

    const number = parseInt(cell.dataset.number);
    if (calledNumbers.includes(number)) {
        cell.classList.toggle('marked');
    } else {
        messageEl.textContent = 'That number hasn\'t been called yet!';
        setTimeout(() => messageEl.textContent = '', 2000);
    }
}

// Auto-mark number on card
function autoMarkNumber(number) {
    const cell = document.querySelector(`[data-number="${number}"]`);
    if (cell && !cell.classList.contains('marked')) {
        cell.classList.add('marked');
    }
}

// Toggle auto-play
function toggleAutoPlay() {
    if (isAutoPlaying) {
        stopAutoPlay();
    } else {
        startAutoPlay();
    }
}

// Start auto-play
function startAutoPlay() {
    if (!gameActive || availableNumbers.length === 0) return;

    isAutoPlaying = true;
    autoPlayBtn.textContent = 'Stop Auto Play';
    autoPlayBtn.classList.add('active');

    autoPlayInterval = setInterval(() => {
        if (availableNumbers.length > 0 && gameActive) {
            callNextNumber();
        } else {
            stopAutoPlay();
        }
    }, 2000); // Call every 2 seconds

    messageEl.textContent = 'Auto-play started! Numbers will be called automatically.';
}

// Stop auto-play
function stopAutoPlay() {
    isAutoPlaying = false;
    autoPlayBtn.textContent = 'Auto Play';
    autoPlayBtn.classList.remove('active');

    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }

    messageEl.textContent = 'Auto-play stopped.';
}

// Check for bingo
function checkForBingo(silent = false) {
    if (!gameActive) return false;

    const card = getCardState();
    const hasBingo = checkWinningPatterns(card);

    if (hasBingo) {
        gameActive = false;
        statusEl.textContent = 'BINGO! You Win!';
        messageEl.textContent = '🎉 BINGO! Congratulations! 🎉';

        if (isAutoPlaying) {
            stopAutoPlay();
        }

        // Celebrate
        celebrateWin();
        return true;
    } else if (!silent) {
        messageEl.textContent = 'No bingo yet. Keep playing!';
        setTimeout(() => messageEl.textContent = '', 2000);
    }

    return false;
}

// Get current card state
function getCardState() {
    const card = [];
    for (let row = 0; row < 5; row++) {
        card[row] = [];
        for (let col = 0; col < 5; col++) {
            const cell = document.querySelector(`.card-grid .number-cell:nth-child(${row * 5 + col + 1})`);
            card[row][col] = cell.classList.contains('marked');
        }
    }
    return card;
}

// Check winning patterns
function checkWinningPatterns(card) {
    // Check rows
    for (let row = 0; row < 5; row++) {
        if (card[row].every(cell => cell)) return true;
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
        let columnComplete = true;
        for (let row = 0; row < 5; row++) {
            if (!card[row][col]) {
                columnComplete = false;
                break;
            }
        }
        if (columnComplete) return true;
    }

    // Check diagonals
    let diagonal1 = true;
    let diagonal2 = true;
    for (let i = 0; i < 5; i++) {
        if (!card[i][i]) diagonal1 = false;
        if (!card[i][4 - i]) diagonal2 = false;
    }
    if (diagonal1 || diagonal2) return true;

    // Check four corners
    if (card[0][0] && card[0][4] && card[4][0] && card[4][4]) return true;

    // Check full house
    let fullHouse = true;
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            if (!card[row][col]) {
                fullHouse = false;
                break;
            }
        }
        if (!fullHouse) break;
    }
    if (fullHouse) return true;

    return false;
}

// Celebrate win
function celebrateWin() {
    // Add celebration animation
    document.querySelectorAll('.number-cell.marked').forEach(cell => {
        cell.style.animation = 'celebrate 0.5s ease-in-out';
    });

    // Play celebration sound if enabled
    if (soundEnabledCheckbox.checked) {
        setTimeout(() => playWinSound(), 500);
    }
}

// Update display elements
function updateDisplay() {
    calledCountEl.textContent = calledNumbers.length;
    lastNumberEl.textContent = lastCalled || '-';
}

// Play sound effect
function playSound() {
    // Create audio context for sound effects
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Sound not supported
    }
}

// Play win sound
function playWinSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Play a victory melody
        const notes = [523, 659, 784, 1047]; // C, E, G, C
        let time = audioContext.currentTime;

        notes.forEach((freq, index) => {
            oscillator.frequency.setValueAtTime(freq, time + index * 0.15);
            gainNode.gain.setValueAtTime(0.1, time + index * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + index * 0.15 + 0.1);
        });

        oscillator.start(time);
        oscillator.stop(time + 0.8);
    } catch (e) {
        // Sound not supported
    }
}

// Start the game
initGame();

// This bingo game includes all classic features
// Auto-play, auto-mark, and multiple win patterns
// The interface is clean and easy to use