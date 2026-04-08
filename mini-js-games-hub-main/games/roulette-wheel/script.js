// Roulette Wheel Game
// European roulette with betting system and physics-based wheel

// DOM elements
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');
const balanceEl = document.getElementById('current-balance');
const betAmountEl = document.getElementById('bet-amount');
const resultNumberEl = document.getElementById('result-number');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');
const clearBetsBtn = document.getElementById('clear-bets-btn');

// Game constants
const CANVAS_SIZE = 400;
const CENTER_X = CANVAS_SIZE / 2;
const CENTER_Y = CANVAS_SIZE / 2;
const WHEEL_RADIUS = 180;

// Roulette numbers (European: 0-36)
const NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

// Game variables
let balance = 1000;
let currentChipValue = 1;
let bets = {}; // {position: amount}
let totalBet = 0;
let isSpinning = false;
let wheelAngle = 0;
let spinVelocity = 0;
let resultNumber = null;
let animationId;

// Initialize game
function initGame() {
    drawWheel();
    updateDisplay();
    setupEventListeners();
}

// Draw the roulette wheel
function drawWheel() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, WHEEL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#8B4513';
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw numbers
    const angleStep = (Math.PI * 2) / NUMBERS.length;
    NUMBERS.forEach((number, index) => {
        const angle = wheelAngle + index * angleStep;
        const x = CENTER_X + Math.cos(angle) * (WHEEL_RADIUS - 30);
        const y = CENTER_Y + Math.sin(angle) * (WHEEL_RADIUS - 30);

        // Number background
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fillStyle = getNumberColor(number);
        ctx.fill();
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Number text
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number.toString(), x, y);
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(CENTER_X, CENTER_Y - WHEEL_RADIUS - 10);
    ctx.lineTo(CENTER_X - 10, CENTER_Y - WHEEL_RADIUS + 10);
    ctx.lineTo(CENTER_X + 10, CENTER_Y - WHEEL_RADIUS + 10);
    ctx.closePath();
    ctx.fillStyle = '#FF0000';
    ctx.fill();
}

// Get color for number
function getNumberColor(number) {
    if (number === 0) return '#00FF00';
    return RED_NUMBERS.includes(number) ? '#FF0000' : '#000000';
}

// Update display elements
function updateDisplay() {
    balanceEl.textContent = balance.toLocaleString();
    betAmountEl.textContent = totalBet.toLocaleString();
    if (resultNumber !== null) {
        resultNumberEl.textContent = resultNumber;
        resultNumberEl.style.color = getNumberColor(resultNumber);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Chip selection
    document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentChipValue = parseInt(btn.dataset.value);
        });
    });

    // Number betting
    document.querySelectorAll('.number-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            if (isSpinning) return;
            placeBet(cell.dataset.number, 'straight');
        });
    });

    // Outside bets
    document.querySelectorAll('.outside-bet').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isSpinning) return;
            placeBet(btn.dataset.bet, 'outside');
        });
    });

    // Control buttons
    spinBtn.addEventListener('click', spinWheel);
    clearBetsBtn.addEventListener('click', clearBets);
}

// Place a bet
function placeBet(position, type) {
    if (balance < currentChipValue) {
        messageEl.textContent = 'Not enough balance!';
        setTimeout(() => messageEl.textContent = '', 2000);
        return;
    }

    if (!bets[position]) {
        bets[position] = 0;
    }

    bets[position] += currentChipValue;
    balance -= currentChipValue;
    totalBet += currentChipValue;

    updateDisplay();
    updateBetDisplay(position);
    messageEl.textContent = `Placed $${currentChipValue} on ${getBetDescription(position, type)}`;
}

// Update bet display on table
function updateBetDisplay(position) {
    // Remove existing chip stack
    const existingChip = document.querySelector(`[data-number="${position}"] .chip-stack`) ||
                        document.querySelector(`[data-bet="${position}"].chip-stack`);
    if (existingChip) {
        existingChip.remove();
    }

    // Add new chip stack
    const betElement = document.querySelector(`[data-number="${position}"]`) ||
                      document.querySelector(`[data-bet="${position}"]`);

    if (betElement && bets[position]) {
        const chipStack = document.createElement('div');
        chipStack.className = 'chip-stack';
        chipStack.textContent = bets[position];
        betElement.appendChild(chipStack);
        betElement.classList.add('bet-placed');
    }
}

// Get bet description
function getBetDescription(position, type) {
    if (type === 'straight') {
        return `number ${position}`;
    }

    switch (position) {
        case '1st12': return '1st 12';
        case '2nd12': return '2nd 12';
        case '3rd12': return '3rd 12';
        case '1to18': return '1 to 18';
        case '19to36': return '19 to 36';
        case 'even': return 'Even';
        case 'odd': return 'Odd';
        case 'red': return 'Red';
        case 'black': return 'Black';
        default: return position;
    }
}

// Clear all bets
function clearBets() {
    if (isSpinning) return;

    // Refund bets
    Object.values(bets).forEach(amount => {
        balance += amount;
    });

    // Clear bets
    bets = {};
    totalBet = 0;

    // Remove visual bets
    document.querySelectorAll('.chip-stack').forEach(chip => chip.remove());
    document.querySelectorAll('.bet-placed').forEach(el => el.classList.remove('bet-placed'));

    updateDisplay();
    messageEl.textContent = 'Bets cleared';
}

// Spin the wheel
function spinWheel() {
    if (isSpinning || totalBet === 0) {
        if (totalBet === 0) {
            messageEl.textContent = 'Place a bet first!';
        }
        return;
    }

    isSpinning = true;
    spinBtn.textContent = 'SPINNING...';
    spinBtn.classList.add('spinning');

    // Random spin duration and final position
    const spinDuration = 3000 + Math.random() * 2000; // 3-5 seconds
    const finalAngle = Math.random() * Math.PI * 2;

    // Physics-based spinning
    spinVelocity = 0.5 + Math.random() * 0.3; // Initial velocity
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / spinDuration;

        if (progress < 1) {
            // Decelerating spin
            const easeOut = 1 - Math.pow(1 - progress, 3);
            wheelAngle += spinVelocity * (1 - easeOut) * 0.1;
            spinVelocity *= 0.995; // Friction

            drawWheel();
            animationId = requestAnimationFrame(animate);
        } else {
            // Spin complete
            wheelAngle = finalAngle;
            drawWheel();

            // Determine winning number
            determineWinner();
        }
    }

    animate();
}

// Determine winning number based on wheel position
function determineWinner() {
    // Calculate which number the pointer is pointing to
    const normalizedAngle = (wheelAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const angleStep = (Math.PI * 2) / NUMBERS.length;
    const numberIndex = Math.round(normalizedAngle / angleStep) % NUMBERS.length;
    resultNumber = NUMBERS[numberIndex];

    // Calculate winnings
    let totalWinnings = 0;
    Object.entries(bets).forEach(([position, amount]) => {
        const winnings = calculateWinnings(position, amount, resultNumber);
        totalWinnings += winnings;
    });

    // Update balance
    balance += totalWinnings;

    // Display result
    updateDisplay();
    messageEl.textContent = `Ball landed on ${resultNumber}! You won $${totalWinnings.toLocaleString()}!`;

    // Reset for next round
    setTimeout(() => {
        clearBets();
        isSpinning = false;
        spinBtn.textContent = 'SPIN WHEEL';
        spinBtn.classList.remove('spinning');
        messageEl.textContent = 'Place your bets for the next spin!';
    }, 3000);
}

// Calculate winnings for a bet
function calculateWinnings(position, amount, winningNumber) {
    const pos = parseInt(position);

    // Straight up bet (single number)
    if (!isNaN(pos) && pos === winningNumber) {
        return amount * 36; // 35:1 payout + original bet
    }

    // Outside bets
    if (position === 'red' && RED_NUMBERS.includes(winningNumber)) {
        return amount * 2;
    }
    if (position === 'black' && BLACK_NUMBERS.includes(winningNumber)) {
        return amount * 2;
    }
    if (position === 'even' && winningNumber !== 0 && winningNumber % 2 === 0) {
        return amount * 2;
    }
    if (position === 'odd' && winningNumber !== 0 && winningNumber % 2 === 1) {
        return amount * 2;
    }
    if (position === '1to18' && winningNumber >= 1 && winningNumber <= 18) {
        return amount * 2;
    }
    if (position === '19to36' && winningNumber >= 19 && winningNumber <= 36) {
        return amount * 2;
    }
    if (position === '1st12' && winningNumber >= 1 && winningNumber <= 12) {
        return amount * 3;
    }
    if (position === '2nd12' && winningNumber >= 13 && winningNumber <= 24) {
        return amount * 3;
    }
    if (position === '3rd12' && winningNumber >= 25 && winningNumber <= 36) {
        return amount * 3;
    }

    return 0; // No win
}

// Start the game
initGame();

// This roulette game has realistic physics
// The wheel spins with deceleration for authentic feel
// Multiple bet types with proper payouts