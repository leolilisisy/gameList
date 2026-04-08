// Maze Master Game
// Navigate through procedurally generated mazes

// DOM elements
const canvas = document.getElementById('maze-canvas');
const ctx = canvas.getContext('2d');
const levelEl = document.getElementById('current-level');
const scoreEl = document.getElementById('current-score');
const timerEl = document.getElementById('time-display');
const messageEl = document.getElementById('message');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const hintBtn = document.getElementById('hint-btn');

// Game constants
const CELL_SIZE = 20;
const MAZE_SIZE = 25; // 25x25 grid
const CANVAS_SIZE = CELL_SIZE * MAZE_SIZE;

// Game variables
let maze = [];
let player = { x: 1, y: 1 };
let exit = { x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 };
let level = 1;
let score = 0;
let gameRunning = false;
let startTime;
let timerInterval;
let hintUsed = false;

// Event listeners
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
hintBtn.addEventListener('click', showHint);
document.addEventListener('keydown', handleKeyPress);

// Initialize the game
function initGame() {
    generateMaze();
    player = { x: 1, y: 1 };
    exit = { x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 };
    hintUsed = false;
}

// Generate a random maze using recursive backtracking
function generateMaze() {
    // Initialize maze with walls
    maze = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(1));

    // Start from a random position
    const startX = Math.floor(Math.random() * (MAZE_SIZE / 2)) * 2 + 1;
    const startY = Math.floor(Math.random() * (MAZE_SIZE / 2)) * 2 + 1;

    carvePath(startX, startY);

    // Ensure start and exit are clear
    maze[1][1] = 0;
    maze[MAZE_SIZE - 2][MAZE_SIZE - 2] = 0;
}

// Recursive function to carve paths
function carvePath(x, y) {
    const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // Up, Right, Down, Left
    shuffleArray(directions);

    for (let [dx, dy] of directions) {
        const newX = x + dx * 2;
        const newY = y + dy * 2;

        if (newX > 0 && newX < MAZE_SIZE - 1 && newY > 0 && newY < MAZE_SIZE - 1 && maze[newY][newX] === 1) {
            maze[y + dy][x + dx] = 0;
            maze[newY][newX] = 0;
            carvePath(newX, newY);
        }
    }
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Start the game
function startGame() {
    initGame();
    gameRunning = true;
    startTime = Date.now();
    startTimer();

    startBtn.style.display = 'none';
    resetBtn.style.display = 'inline-block';

    messageEl.textContent = 'Find the exit!';
    drawMaze();
}

// Reset for a new maze
function resetGame() {
    gameRunning = false;
    clearInterval(timerInterval);
    timerEl.textContent = '00:00';
    messageEl.textContent = '';
    startBtn.style.display = 'inline-block';
    resetBtn.style.display = 'none';
    drawMaze();
}

// Handle keyboard input
function handleKeyPress(event) {
    if (!gameRunning) return;

    let newX = player.x;
    let newY = player.y;

    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            newY--;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            newY++;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            newX--;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            newX++;
            break;
        default:
            return;
    }

    event.preventDefault();

    // Check if move is valid
    if (newX >= 0 && newX < MAZE_SIZE && newY >= 0 && newY < MAZE_SIZE && maze[newY][newX] === 0) {
        player.x = newX;
        player.y = newY;

        // Check if reached exit
        if (player.x === exit.x && player.y === exit.y) {
            levelComplete();
        }

        drawMaze();
    }
}

// Show hint (reveal part of the path)
function showHint() {
    if (!gameRunning || hintUsed) return;

    hintUsed = true;
    score = Math.max(0, score - 50); // Penalty for using hint
    scoreEl.textContent = score;

    // Simple hint: show direction to exit
    const dx = exit.x - player.x;
    const dy = exit.y - player.y;

    let hint = 'Try going ';
    if (Math.abs(dx) > Math.abs(dy)) {
        hint += dx > 0 ? 'right' : 'left';
    } else {
        hint += dy > 0 ? 'down' : 'up';
    }

    messageEl.textContent = `Hint: ${hint}`;
    setTimeout(() => messageEl.textContent = '', 3000);
}

// Level completed
function levelComplete() {
    gameRunning = false;
    clearInterval(timerInterval);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const timeBonus = Math.max(0, 300 - timeTaken); // Bonus for speed
    const levelBonus = level * 100;
    const hintPenalty = hintUsed ? 50 : 0;

    const levelScore = timeBonus + levelBonus - hintPenalty;
    score += levelScore;

    scoreEl.textContent = score;
    levelEl.textContent = level;

    messageEl.textContent = `Level ${level} Complete! Score: +${levelScore} (Time: ${timeTaken}s)`;

    level++;
    levelEl.textContent = level;

    setTimeout(() => {
        messageEl.textContent = 'Get ready for next level...';
        setTimeout(() => {
            startGame();
        }, 2000);
    }, 3000);
}

// Start the timer
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        timerEl.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

// Draw the maze
function drawMaze() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw maze
    for (let y = 0; y < MAZE_SIZE; y++) {
        for (let x = 0; x < MAZE_SIZE; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = '#34495e';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            } else {
                ctx.fillStyle = '#ecf0f1';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    // Draw exit
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(exit.x * CELL_SIZE, exit.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    // Draw player
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.arc(player.x * CELL_SIZE + CELL_SIZE / 2, player.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();
}

// Initialize on load
initGame();
drawMaze();

// I spent quite a bit of time figuring out the maze generation
// Recursive backtracking works well but can create some weird patterns
// Maybe I'll try a different algorithm later like Prim's or Kruskal's