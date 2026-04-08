// Treasure Seeker Game
// Dig through the grid to find hidden treasures while avoiding bombs

// DOM elements
const gameBoard = document.getElementById('game-board');
const levelEl = document.getElementById('current-level');
const scoreEl = document.getElementById('current-score');
const treasuresLeftEl = document.getElementById('remaining-treasures');
const timerEl = document.getElementById('time-display');
const messageEl = document.getElementById('message');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const hintBtn = document.getElementById('hint-btn');

// Game constants
const GRID_SIZE = 10;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

// Game variables
let level = 1;
let score = 0;
let gameGrid = [];
let revealedCells = 0;
let treasuresFound = 0;
let totalTreasures = 0;
let gameRunning = false;
let startTime;
let timerInterval;

// Initialize game
function initGame() {
    createGrid();
    placeItems();
    updateDisplay();
}

// Create the grid HTML
function createGrid() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < TOTAL_CELLS; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => revealCell(i));
        gameBoard.appendChild(cell);
    }
}

// Place treasures and bombs randomly
function placeItems() {
    gameGrid = new Array(TOTAL_CELLS).fill('empty');

    // Calculate number of items based on level
    const numTreasures = Math.min(5 + level, 12);
    const numBombs = Math.min(3 + Math.floor(level / 2), 8);

    totalTreasures = numTreasures;

    // Place treasures
    let placed = 0;
    while (placed < numTreasures) {
        const index = Math.floor(Math.random() * TOTAL_CELLS);
        if (gameGrid[index] === 'empty') {
            gameGrid[index] = 'treasure';
            placed++;
        }
    }

    // Place bombs
    placed = 0;
    while (placed < numBombs) {
        const index = Math.floor(Math.random() * TOTAL_CELLS);
        if (gameGrid[index] === 'empty') {
            gameGrid[index] = 'bomb';
            placed++;
        }
    }

    console.log(`Level ${level}: ${numTreasures} treasures, ${numBombs} bombs placed`);
}

// Reveal a cell
function revealCell(index) {
    if (!gameRunning) return;

    const cell = gameBoard.children[index];
    if (cell.classList.contains('revealed')) return;

    cell.classList.add('revealed');
    revealedCells++;

    const item = gameGrid[index];
    cell.textContent = getCellSymbol(item);
    cell.classList.add(item);

    if (item === 'treasure') {
        treasuresFound++;
        score += 100 * level;
        updateDisplay();

        if (treasuresFound === totalTreasures) {
            levelComplete();
        }
    } else if (item === 'bomb') {
        gameOver();
    }
}

// Get symbol for cell content
function getCellSymbol(item) {
    switch (item) {
        case 'treasure': return '💰';
        case 'bomb': return '💣';
        default: return '';
    }
}

// Use shovel hint
function useShovel() {
    if (!gameRunning || score < 50) return;

    score -= 50;
    scoreEl.textContent = score;

    // Find a random unrevealed cell
    const unrevealed = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
        if (!gameBoard.children[i].classList.contains('revealed')) {
            unrevealed.push(i);
        }
    }

    if (unrevealed.length === 0) return;

    const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    revealCell(randomIndex);

    // Also reveal adjacent cells
    const row = Math.floor(randomIndex / GRID_SIZE);
    const col = randomIndex % GRID_SIZE;

    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
                const adjacentIndex = newRow * GRID_SIZE + newCol;
                if (!gameBoard.children[adjacentIndex].classList.contains('revealed')) {
                    gameBoard.children[adjacentIndex].classList.add('shovel-hint');
                    setTimeout(() => {
                        gameBoard.children[adjacentIndex].classList.remove('shovel-hint');
                    }, 1000);
                }
            }
        }
    }
}

// Start the game
function startGame() {
    level = 1;
    score = 0;
    treasuresFound = 0;
    revealedCells = 0;
    gameRunning = true;
    startTime = Date.now();

    initGame();
    startTimer();

    startBtn.style.display = 'none';
    resetBtn.style.display = 'inline-block';

    messageEl.textContent = 'Dig for treasure!';
}

// Level completed
function levelComplete() {
    gameRunning = false;
    clearInterval(timerInterval);

    const timeBonus = Math.max(0, 300 - Math.floor((Date.now() - startTime) / 1000));
    score += timeBonus;

    messageEl.textContent = `Level ${level} Complete! Time bonus: +${timeBonus}`;

    level++;
    levelEl.textContent = level;

    setTimeout(() => {
        messageEl.textContent = 'Get ready for next level...';
        setTimeout(() => {
            startGame();
        }, 2000);
    }, 3000);
}

// Game over
function gameOver() {
    gameRunning = false;
    clearInterval(timerInterval);

    messageEl.textContent = '💣 Boom! Game Over!';

    // Reveal all bombs
    for (let i = 0; i < TOTAL_CELLS; i++) {
        if (gameGrid[i] === 'bomb') {
            gameBoard.children[i].classList.add('revealed', 'bomb');
            gameBoard.children[i].textContent = '💣';
        }
    }

    resetBtn.style.display = 'inline-block';
}

// Reset game
function resetGame() {
    gameRunning = false;
    clearInterval(timerInterval);
    timerEl.textContent = '00:00';
    messageEl.textContent = '';
    startBtn.style.display = 'inline-block';
    resetBtn.style.display = 'none';
    initGame();
}

// Update display
function updateDisplay() {
    scoreEl.textContent = score;
    treasuresLeftEl.textContent = totalTreasures - treasuresFound;
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        timerEl.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

// Event listeners
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
hintBtn.addEventListener('click', useShovel);

// Initialize on load
initGame();

// I had fun making this grid-based game
// The shovel hint feature adds a nice strategic element
// Maybe I'll add different shovel types later