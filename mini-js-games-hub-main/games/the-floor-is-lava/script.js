// --- DOM Elements ---
const gameBoard = document.getElementById('game-board');
const currentScoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const gameOverOverlay = document.getElementById('game-over-overlay');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// --- Game Constants & State ---
const GRID_SIZE = 8;
const LAVA_COOLDOWN = 5000;
const MAX_NEW_WARNINGS = 5; // REBALANCE: Cap the number of new warnings
let grid = [];
let playerPosition = { row: 0, col: 0 };
let score = 0, highScore = 0;
let gameInterval;
let gameSpeed = 1000;
let gameState = 'playing';

// --- Sound Effects ---
const sounds = { move: new Audio(''), warn: new Audio(''), sizzle: new Audio(''), gameover: new Audio('') };
function playSound(sound) { try { sounds[sound].currentTime = 0; sounds[sound].play(); } catch (e) {} }

// --- Game Setup ---
function createGrid() {
    gameBoard.innerHTML = ''; grid = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        const row = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = r; cell.dataset.col = c;
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
            row.push({ state: 'safe', element: cell, lavaTimestamp: 0 });
        }
        grid.push(row);
    }
}

function startGame() {
    gameState = 'playing';
    score = 0; gameSpeed = 1000;
    gameOverOverlay.classList.add('hidden');
    currentScoreEl.textContent = score;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            grid[r][c].state = 'safe';
            grid[r][c].lavaTimestamp = 0;
        }
    }
    
    playerPosition = { row: Math.floor(GRID_SIZE / 2), col: Math.floor(GRID_SIZE / 2) };
    render();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameTick, gameSpeed);
}

// --- Main Game Tick ---
function gameTick() {
    score++;
    currentScoreEl.textContent = score;

    updateLavaStates();
    
    if (checkGameOver()) {
        gameOver();
        return;
    }

    generateNewWarnings();
    render();
    adjustGameSpeed();
}

// --- REFACTORED: Game Logic Functions ---
function updateLavaStates() {
    const now = Date.now();
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = grid[r][c];
            if (cell.state === 'lava' && now - cell.lavaTimestamp > LAVA_COOLDOWN) {
                cell.state = 'safe';
            }
            if (cell.state === 'warning') {
                cell.state = 'lava';
                cell.lavaTimestamp = now;
                playSound('sizzle');
            }
        }
    }
}

function checkGameOver() {
    const playerIsOnLava = grid[playerPosition.row][playerPosition.col].state === 'lava';
    const playerIsTrapped = !hasValidMoves(playerPosition);
    return playerIsOnLava || playerIsTrapped;
}

function generateNewWarnings() {
    // ENHANCEMENT: Player's tile is no longer safe from warnings.
    const safeTiles = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c].state === 'safe') {
                safeTiles.push({ r, c });
            }
        }
    }
    safeTiles.sort(() => Math.random() - 0.5);

    // REBALANCE: Apply the cap to the number of new warnings.
    const baseWarnings = 1 + Math.floor(score / 10);
    const numNewWarnings = Math.min(safeTiles.length, baseWarnings, MAX_NEW_WARNINGS);

    if (numNewWarnings > 0) playSound('warn');
    for (let i = 0; i < numNewWarnings; i++) {
        const tileToWarn = safeTiles[i];
        grid[tileToWarn.r][tileToWarn.c].state = 'warning';
    }
}

function adjustGameSpeed() {
    if (score % 10 === 0 && gameSpeed > 300) {
        gameSpeed -= 50;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameTick, gameSpeed);
    }
}

function handleCellClick(event) {
    if (gameState !== 'playing') return;
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    if (isValidMove(row, col)) {
        playerPosition = { row, col };
        playSound('move');
        render();
    }
}

// --- Helper & UI Functions ---
function isValidMove(row, col) {
    const isAdjacent = Math.abs(row - playerPosition.row) <= 1 && Math.abs(col - playerPosition.col) <= 1;
    const isSelf = row === playerPosition.row && col === playerPosition.col;
    return !isSelf && isAdjacent && grid[row][col].state === 'safe';
}

function hasValidMoves(position) {
    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            if (r === 0 && c === 0) continue;
            const newRow = position.row + r;
            const newCol = position.col + c;
            if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
                if (grid[newRow][newCol].state === 'safe') return true;
            }
        }
    }
    return false;
}

function render() {
    const now = Date.now();
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = grid[r][c];
            cell.element.className = 'grid-cell';
            cell.element.classList.add(cell.state);
            if (gameState === 'playing' && isValidMove(r, c)) {
                cell.element.classList.add('movable');
            }
            if (cell.state === 'lava' && now - cell.lavaTimestamp > LAVA_COOLDOWN - 2000) {
                cell.element.classList.add('cooling');
            }
        }
    }
    if (gameState === 'playing') {
        grid[playerPosition.row][playerPosition.col].element.classList.add('player');
    }
}

function gameOver() {
    gameState = 'game_over';
    clearInterval(gameInterval);
    playSound('gameover');
    
    const playerCell = grid[playerPosition.row][playerPosition.col].element;
    playerCell.classList.add('game-over');

    if (score > highScore) { highScore = score; saveGame(); highScoreEl.textContent = highScore; }
    finalScoreEl.textContent = score;
    render();
    setTimeout(() => { gameOverOverlay.classList.remove('hidden'); }, 500);
}

// --- Save/Load & Initialization ---
function saveGame() { localStorage.setItem('floorIsLava_highScore', highScore); }
function loadGame() {
    highScore = parseInt(localStorage.getItem('floorIsLava_highScore')) || 0;
    highScoreEl.textContent = highScore;
}

restartBtn.addEventListener('click', startGame);
createGrid();
loadGame();
startGame();