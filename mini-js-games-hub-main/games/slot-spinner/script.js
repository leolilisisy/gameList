// Slot Spinner Game
// Classic slot machine with spinning reels and payouts

// DOM elements
const balanceEl = document.getElementById('current-balance');
const betEl = document.getElementById('current-bet');
const winEl = document.getElementById('current-win');
const betAmountEl = document.getElementById('bet-amount');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');
const maxBetBtn = document.getElementById('max-bet-btn');
const decreaseBetBtn = document.getElementById('decrease-bet');
const increaseBetBtn = document.getElementById('increase-bet');

const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');

// Game constants
const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '7️⃣'];
const PAYOUTS = {
    '🍒': 50,
    '🍋': 75,
    '🍊': 100,
    '🍇': 150,
    '🔔': 200,
    '⭐': 300,
    '7️⃣': 1000
};

// Game variables
let balance = 1000;
let currentBet = 10;
let lastWin = 0;
let isSpinning = false;

// Initialize game
function initGame() {
    updateDisplay();
}

// Update display elements
function updateDisplay() {
    balanceEl.textContent = balance.toLocaleString();
    betEl.textContent = currentBet.toLocaleString();
    winEl.textContent = lastWin.toLocaleString();
    betAmountEl.textContent = '$' + currentBet.toLocaleString();
}

// Adjust bet amount
function adjustBet(amount) {
    if (isSpinning) return;

    currentBet += amount;

    // Ensure bet is within valid range
    if (currentBet < 1) currentBet = 1;
    if (currentBet > balance) currentBet = balance;
    if (currentBet > 100) currentBet = 100; // Max bet limit

    updateDisplay();
}

// Set maximum bet
function setMaxBet() {
    if (isSpinning) return;

    currentBet = Math.min(balance, 100);
    updateDisplay();
}

// Spin the reels
function spin() {
    if (isSpinning || balance < currentBet) {
        if (balance < currentBet) {
            messageEl.textContent = 'Not enough balance!';
            setTimeout(() => messageEl.textContent = '', 2000);
        }
        return;
    }

    isSpinning = true;
    spinBtn.textContent = 'SPINNING...';
    spinBtn.classList.add('spinning');
    messageEl.textContent = 'Good luck!';

    // Deduct bet from balance
    balance -= currentBet;
    updateDisplay();

    // Start spinning animation
    startSpinAnimation();

    // Stop reels at different times for realistic effect
    setTimeout(() => stopReel(reel1, 0), 1000 + Math.random() * 500);
    setTimeout(() => stopReel(reel2, 1), 1500 + Math.random() * 500);
    setTimeout(() => stopReel(reel3, 2), 2000 + Math.random() * 500);
}

// Start spin animation
function startSpinAnimation() {
    [reel1, reel2, reel3].forEach(reel => {
        reel.classList.add('spinning');
    });
}

// Stop a specific reel
function stopReel(reel, index) {
    reel.classList.remove('spinning');

    // Generate random symbol
    const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
    const symbol = SYMBOLS[randomIndex];

    // Update reel display
    updateReelDisplay(reel, randomIndex);

    // Store result for win checking
    reel.result = symbol;

    // Check for win when all reels stopped
    if (index === 2) {
        setTimeout(() => checkWin(), 500);
    }
}

// Update reel visual display
function updateReelDisplay(reel, targetIndex) {
    const symbols = reel.querySelectorAll('.symbol');

    // Calculate offset to show target symbol in center
    const offset = -50 * (targetIndex - 1); // -50px per symbol, center is at index 1

    symbols.forEach((symbol, index) => {
        const position = (index - 1) * 50 + offset;
        symbol.style.top = position + 'px';
    });
}

// Check for winning combinations
function checkWin() {
    const result1 = reel1.result;
    const result2 = reel2.result;
    const result3 = reel3.result;

    let winAmount = 0;
    let winMessage = '';

    // Check for three of a kind
    if (result1 === result2 && result2 === result3) {
        winAmount = PAYOUTS[result1] * currentBet / 10; // Scale payout based on bet
        winMessage = `JACKPOT! Three ${result1} - $${winAmount.toLocaleString()}!`;
    }
    // Check for two of a kind (partial wins)
    else if (result1 === result2 || result2 === result3 || result1 === result3) {
        const matchingSymbol = result1 === result2 ? result1 : (result2 === result3 ? result2 : result1);
        winAmount = Math.floor(PAYOUTS[matchingSymbol] * 0.3 * currentBet / 10); // 30% of three-match payout
        winMessage = `Nice! Two ${matchingSymbol} - $${winAmount.toLocaleString()}`;
    }
    else {
        winMessage = 'No win this time. Try again!';
    }

    // Award winnings
    if (winAmount > 0) {
        balance += winAmount;
        lastWin = winAmount;
    } else {
        lastWin = 0;
    }

    // Update display
    updateDisplay();

    // Show result message
    messageEl.textContent = winMessage;

    // Reset spin state
    isSpinning = false;
    spinBtn.textContent = 'SPIN!';
    spinBtn.classList.remove('spinning');

    // Check for game over
    if (balance <= 0) {
        messageEl.textContent = 'Game Over! You ran out of money.';
        spinBtn.disabled = true;
        setTimeout(() => {
            resetGame();
        }, 3000);
    }
}

// Reset the game
function resetGame() {
    balance = 1000;
    currentBet = 10;
    lastWin = 0;
    updateDisplay();
    messageEl.textContent = 'New game started! Good luck!';
    spinBtn.disabled = false;
}

// Event listeners
spinBtn.addEventListener('click', spin);
maxBetBtn.addEventListener('click', setMaxBet);
decreaseBetBtn.addEventListener('click', () => adjustBet(-1));
increaseBetBtn.addEventListener('click', () => adjustBet(1));

// Keyboard controls
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !isSpinning) {
        event.preventDefault();
        spin();
    }
    if (event.code === 'ArrowUp') {
        event.preventDefault();
        adjustBet(1);
    }
    if (event.code === 'ArrowDown') {
        event.preventDefault();
        adjustBet(-1);
    }
});

// Initialize the game
initGame();

// This slot machine has realistic spinning animations
// The payout system is balanced for fun gameplay
// Could add more paylines or bonus features later