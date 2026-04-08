// Game State
let headsCount = 0;
let tailsCount = 0;
let totalFlips = 0;
let winStreak = 0;
let correctGuesses = 0;
let isFlipping = false;

// DOM Elements
const headsBtn = document.getElementById('headsBtn');
const tailsBtn = document.getElementById('tailsBtn');
const coin = document.getElementById('coin');
const resultMessage = document.getElementById('resultMessage');
const resultDetail = document.getElementById('resultDetail');
const headsCountEl = document.getElementById('headsCount');
const tailsCountEl = document.getElementById('tailsCount');
const totalFlipsEl = document.getElementById('totalFlips');
const winStreakEl = document.getElementById('winStreak');
const correctGuessesEl = document.getElementById('correctGuesses');
const resetBtn = document.getElementById('resetBtn');
const confettiContainer = document.getElementById('confettiContainer');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    updateDisplay();
});

// Event Listeners
headsBtn.addEventListener('click', () => flipCoin('heads'));
tailsBtn.addEventListener('click', () => flipCoin('tails'));
resetBtn.addEventListener('click', resetStats);

// Main Flip Function
function flipCoin(userChoice) {
    if (isFlipping) return;
    
    isFlipping = true;
    disableButtons();
    
    // Add selection animation
    if (userChoice === 'heads') {
        headsBtn.classList.add('selected');
    } else {
        tailsBtn.classList.add('selected');
    }
    
    // Clear previous result
    resultMessage.textContent = '';
    resultDetail.textContent = '';
    
    // Remove previous animation classes
    coin.classList.remove('flip-heads', 'flip-tails');
    
    // Simulate coin flip
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    
    // Add flip animation
    setTimeout(() => {
        if (result === 'heads') {
            coin.classList.add('flip-heads');
        } else {
            coin.classList.add('flip-tails');
        }
    }, 100);
    
    // Show result after animation
    setTimeout(() => {
        showResult(userChoice, result);
        updateStats(result);
        enableButtons();
        isFlipping = false;
        
        // Remove selection
        headsBtn.classList.remove('selected');
        tailsBtn.classList.remove('selected');
    }, 2100);
}

// Show Result
function showResult(userChoice, result) {
    const win = userChoice === result;
    if (win) {
        resultMessage.textContent = '🎉 You Win! 🎉';
        resultMessage.className = 'result-message win';
        resultDetail.textContent = `The coin landed on ${result.toUpperCase()}!`;
        winStreak++;
        correctGuesses++;
        launchConfetti();
        playWinSound();
    } else {
        resultMessage.textContent = '😔 You Lose!';
        resultMessage.className = 'result-message lose';
        resultDetail.textContent = `The coin landed on ${result.toUpperCase()}. Better luck next time!`;
        winStreak = 0;
        playLoseSound();
    }
    updateDisplay();
}

// Update Stats
function updateStats(result) {
    totalFlips++;
    
    if (result === 'heads') {
        headsCount++;
    } else {
        tailsCount++;
    }
    
    saveStats();
    updateDisplay();
}

// Update Display
function updateDisplay() {
    headsCountEl.textContent = headsCount;
    tailsCountEl.textContent = tailsCount;
    totalFlipsEl.textContent = totalFlips;
    winStreakEl.textContent = winStreak;
    correctGuessesEl.textContent = correctGuesses;
    
    // Animate stat updates
    animateValue(headsCountEl);
    animateValue(tailsCountEl);
    animateValue(totalFlipsEl);
    animateValue(winStreakEl);
    animateValue(correctGuessesEl);
}

// Animate Value Update
function animateValue(element) {
    element.style.transform = 'scale(1.3)';
    element.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 300);
}

// Reset Stats
function resetStats() {
    if (confirm('Are you sure you want to reset all statistics?')) {
        headsCount = 0;
        tailsCount = 0;
        totalFlips = 0;
        winStreak = 0;
        correctGuesses = 0;
        
        resultMessage.textContent = '';
        resultDetail.textContent = '';
        
        saveStats();
        updateDisplay();
        
        // Reset coin position
        coin.classList.remove('flip-heads', 'flip-tails');
        
        showResetAnimation();
    }
}

// Show Reset Animation
function showResetAnimation() {
    const container = document.querySelector('.container');
    container.style.animation = 'none';
    
    setTimeout(() => {
        container.style.animation = 'slideIn 0.8s ease-out';
    }, 10);
}

// Canvas Confetti Animation
function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const colors = ['#ffd700', '#ff6b6b', '#51cf66', '#4facfe', '#f093fb'];
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    let confetti = [];
    for (let i = 0; i < 60; i++) {
        confetti.push({
            x: Math.random() * W,
            y: Math.random() * -H,
            r: Math.random() * 8 + 4,
            d: Math.random() * 80 + 40,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 10,
            tiltAngle: 0,
            tiltAngleIncremental: (Math.random() * 0.07) + 0.05
        });
    }
    let angle = 0;
    let frame = 0;
    function drawConfetti() {
        ctx.clearRect(0, 0, W, H);
        angle += 0.01;
        for (let i = 0; i < confetti.length; i++) {
            let c = confetti[i];
            c.tiltAngle += c.tiltAngleIncremental;
            c.y += (Math.cos(angle + c.d) + 3 + c.r / 2) / 2;
            c.x += Math.sin(angle);
            c.tilt = Math.sin(c.tiltAngle - (i % 3)) * 15;
            ctx.beginPath();
            ctx.lineWidth = c.r;
            ctx.strokeStyle = c.color;
            ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
            ctx.lineTo(c.x + c.tilt, c.y + c.tilt + 10);
            ctx.stroke();
        }
        frame++;
        if (frame < 80) {
            requestAnimationFrame(drawConfetti);
        } else {
            ctx.clearRect(0, 0, W, H);
        }
    }
    drawConfetti();
}

// Sound Effects (using Web Audio API)
let audioContext;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playWinSound() {
    initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playLoseSound() {
    initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(392, audioContext.currentTime); // G4
    oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime + 0.1); // F4
    oscillator.frequency.setValueAtTime(293.66, audioContext.currentTime + 0.2); // D4
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Button State Management
function disableButtons() {
    headsBtn.disabled = true;
    tailsBtn.disabled = true;
}

function enableButtons() {
    headsBtn.disabled = false;
    tailsBtn.disabled = false;
}

// Local Storage
function saveStats() {
    const stats = {
        headsCount,
        tailsCount,
        totalFlips,
        winStreak,
        correctGuesses
    };
    localStorage.setItem('coinTossStats', JSON.stringify(stats));
}

function loadStats() {
    const saved = localStorage.getItem('coinTossStats');
    
    if (saved) {
        const stats = JSON.parse(saved);
        headsCount = stats.headsCount || 0;
        tailsCount = stats.tailsCount || 0;
        totalFlips = stats.totalFlips || 0;
        winStreak = stats.winStreak || 0;
        correctGuesses = stats.correctGuesses || 0;
    }
}

tailsBtn.addEventListener('mouseenter', () => playHoverSound());
// Keyboard Shortcuts, Accessibility, and Visual Feedback
document.addEventListener('keydown', (e) => {
    if (isFlipping) return;
    if (e.key === 'h' || e.key === 'H') {
        flipCoin('heads');
        headsBtn.style.transform = 'scale(0.95)';
        setTimeout(() => { headsBtn.style.transform = ''; }, 100);
    } else if (e.key === 't' || e.key === 'T') {
        flipCoin('tails');
        tailsBtn.style.transform = 'scale(0.95)';
        setTimeout(() => { tailsBtn.style.transform = ''; }, 100);
    } else if (e.key === 'r' || e.key === 'R') {
        resetStats();
    } else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement) {
        if (document.activeElement === headsBtn) {
            flipCoin('heads');
        } else if (document.activeElement === tailsBtn) {
            flipCoin('tails');
        }
    }
});

headsBtn.addEventListener('mouseenter', () => playHoverSound());
tailsBtn.addEventListener('mouseenter', () => playHoverSound());

function playHoverSound() {
    initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Easter Egg: Triple Click on Title for Random Flips
let clickCount = 0;
let clickTimer;

document.querySelector('.title').addEventListener('click', () => {
    clickCount++;
    
    clearTimeout(clickTimer);
    
    if (clickCount === 3) {
        autoFlip();
        clickCount = 0;
    }
    
    clickTimer = setTimeout(() => {
        clickCount = 0;
    }, 500);
});

function autoFlip() {
    if (isFlipping) return;
    
    const randomChoice = Math.random() < 0.5 ? 'heads' : 'tails';
    flipCoin(randomChoice);
}

// Add visual feedback for keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') {
        headsBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            headsBtn.style.transform = '';
        }, 100);
    } else if (e.key === 't' || e.key === 'T') {
        tailsBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            tailsBtn.style.transform = '';
        }, 100);
    }
});

console.log('🪙 Coin Toss Simulator loaded!');
console.log('💡 Keyboard shortcuts: H = Heads, T = Tails, R = Reset');
console.log('🎨 Triple-click the title for a random flip!');
