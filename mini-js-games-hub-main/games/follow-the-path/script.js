// --- DOM Elements ---
const gameBoard = document.getElementById('game-board');
const statusMessage = document.getElementById('status-message');
const levelDisplay = document.getElementById('level-display');
const highScoreDisplay = document.getElementById('high-score-display');
const gameOverOverlay = document.getElementById('game-over-overlay');
const finalLevelEl = document.getElementById('final-level');
const restartBtn = document.getElementById('restart-btn');

// --- Game Constants & State ---
const GRID_SIZE = 4;
let gameState = 'watching';
let currentLevel = 1;
let highScore = 1;
let path = [];
let playerPathIndex = 0;

// --- NEW: Sound Effects ---
const sounds = {
    blip: new Audio(''), // NOTE: Add paths to your sound files
    correct: new Audio(''),
    wrong: new Audio(''),
    levelUp: new Audio('')
};
function playSound(sound) { try { sounds[sound].currentTime = 0; sounds[sound].play(); } catch (e) {} }

// --- Game Logic ---
function generateLevel() {
    gameState = 'watching';
    path = [];
    playerPathIndex = 0;
    statusMessage.textContent = "Memorize the sequence!";
    levelDisplay.textContent = `Level: ${currentLevel}`;
    
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('player-wrong', 'player-correct');
    });

    let currentRow = Math.floor(Math.random() * GRID_SIZE);
    let currentCol = Math.floor(Math.random() * GRID_SIZE);
    path.push({ row: currentRow, col: currentCol });

    for (let i = 0; i < currentLevel + 1; i++) {
        const neighbors = getValidNeighbors(currentRow, currentCol);
        const nextMove = neighbors[Math.floor(Math.random() * neighbors.length)];
        currentRow = nextMove.row;
        currentCol = nextMove.col;
        path.push({ row: currentRow, col: currentCol });
    }
    
    animatePath();
}

function getValidNeighbors(row, col) {
    const neighbors = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
            if (path.length > 1 && newRow === path[path.length - 2].row && newCol === path[path.length - 2].col) continue;
            neighbors.push({ row: newRow, col: newCol });
        }
    }
    return neighbors.length > 0 ? neighbors : [{row, col}];
}

function animatePath() {
    let i = 0;
    const interval = setInterval(() => {
        if (i >= path.length) {
            clearInterval(interval);
            gameState = 'repeating';
            statusMessage.textContent = "Your turn. Repeat the sequence!";
            return;
        }
        const { row, col } = path[i];
        const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
        cell.classList.add('path-flash');
        playSound('blip');
        setTimeout(() => cell.classList.remove('path-flash'), 500);
        i++;
    }, 600);
}

function handleCellClick(event) {
    if (gameState !== 'repeating') return;

    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const correctMove = path[playerPathIndex];

    if (row === correctMove.row && col === correctMove.col) {
        playSound('correct');
        cell.classList.add('player-correct');
        setTimeout(() => cell.classList.remove('player-correct'), 300);
        playerPathIndex++;

        if (playerPathIndex === path.length) {
            // Level complete
            playSound('levelUp');
            currentLevel++;
            statusMessage.textContent = "Correct! Get ready...";
            // NEW: Visual feedback for level complete
            gameBoard.classList.add('level-complete-flash');
            setTimeout(() => {
                gameBoard.classList.remove('level-complete-flash');
                generateLevel();
            }, 1500);
        }
    } else {
        // Wrong move
        playSound('wrong');
        cell.classList.add('player-wrong');
        gameState = 'game_over';
        
        if (currentLevel > highScore) {
            highScore = currentLevel;
            saveGame();
            highScoreDisplay.textContent = `Best: ${highScore}`;
        }
        
        finalLevelEl.textContent = currentLevel;
        setTimeout(() => gameOverOverlay.classList.remove('hidden'), 500);
    }
}

function createGrid() {
    gameBoard.innerHTML = '';
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
    }
}

function startGame() {
    currentLevel = 1;
    gameOverOverlay.classList.add('hidden');
    generateLevel();
}

// --- Save/Load Progress ---
function saveGame() {
    localStorage.setItem('followThePath_highScore', highScore);
}

function loadGame() {
    const savedHighScore = localStorage.getItem('followThePath_highScore');
    highScore = savedHighScore ? parseInt(savedHighScore) : 1;
    highScoreDisplay.textContent = `Best: ${highScore}`;
}

// --- Event Listeners & Initialization ---
restartBtn.addEventListener('click', startGame);

createGrid();
loadGame();
startGame();