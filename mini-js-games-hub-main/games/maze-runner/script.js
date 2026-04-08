// --- Canvas Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- DOM Elements ---
const messageEl = document.getElementById('message');
const newGameBtn = document.getElementById('new-game-btn');

// --- Game Constants ---
const CELL_SIZE = 30; // Size of each cell in the maze
const MAZE_WIDTH = canvas.width;
const MAZE_HEIGHT = canvas.height;
const COLS = MAZE_WIDTH / CELL_SIZE;
const ROWS = MAZE_HEIGHT / CELL_SIZE;

const WALL_COLOR = '#2c3e50'; // Dark blue-gray
const PATH_COLOR = '#ecf0f1'; // Light gray
const PLAYER_COLOR = '#e74c3c'; // Red
const GOAL_COLOR = '#2ecc71'; // Green

// --- Game State Variables ---
let maze = [];
let player = { x: 0, y: 0, size: CELL_SIZE * 0.6 }; // Player size slightly smaller than cell
let goal = { x: 0, y: 0 };
let gameActive = false;
let gameLoopId;

// --- Maze Cell Class ---
/**
 * Represents a single cell in the maze.
 * @param {number} col - Column index.
 * @param {number} row - Row index.
 */
class Cell {
    constructor(col, row) {
        this.col = col;
        this.row = row;
        this.visited = false;
        // Walls: [top, right, bottom, left]
        this.walls = [true, true, true, true];
    }

    /**
     * Draws the cell and its walls on the canvas.
     */
    draw() {
        const x = this.col * CELL_SIZE;
        const y = this.row * CELL_SIZE;

        ctx.strokeStyle = WALL_COLOR;
        ctx.lineWidth = 2;

        // Draw Top wall
        if (this.walls[0]) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + CELL_SIZE, y);
            ctx.stroke();
        }
        // Draw Right wall
        if (this.walls[1]) {
            ctx.beginPath();
            ctx.moveTo(x + CELL_SIZE, y);
            ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
            ctx.stroke();
        }
        // Draw Bottom wall
        if (this.walls[2]) {
            ctx.beginPath();
            ctx.moveTo(x + CELL_SIZE, y + CELL_SIZE);
            ctx.lineTo(x, y + CELL_SIZE);
            ctx.stroke();
        }
        // Draw Left wall
        if (this.walls[3]) {
            ctx.beginPath();
            ctx.moveTo(x, y + CELL_SIZE);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
}

// --- Maze Generation Algorithm (Recursive Backtracking) ---

/**
 * Initializes the maze grid with Cell objects.
 */
function createGrid() {
    maze = Array(ROWS).fill(0).map((_, r) =>
        Array(COLS).fill(0).map((_, c) => new Cell(c, r))
    );
}

/**
 * Gets a neighbor of the current cell that has not been visited yet.
 * @param {Cell} current - The current cell.
 * @returns {Cell|undefined} An unvisited neighbor cell, or undefined if none.
 */
function getUnvisitedNeighbor(current) {
    const neighbors = [];
    const { col, row } = current;

    // Possible neighbors: [neighbor_cell, wall_to_break, neighbor_wall_to_break]
    // Wall indices: 0:Top, 1:Right, 2:Bottom, 3:Left
    // Top
    if (row > 0 && !maze[row - 1][col].visited) {
        neighbors.push([maze[row - 1][col], 0, 2]); 
    }
    // Right
    if (col < COLS - 1 && !maze[row][col + 1].visited) {
        neighbors.push([maze[row][col + 1], 1, 3]);
    }
    // Bottom
    if (row < ROWS - 1 && !maze[row + 1][col].visited) {
        neighbors.push([maze[row + 1][col], 2, 0]);
    }
    // Left
    if (col > 0 && !maze[row][col - 1].visited) {
        neighbors.push([maze[row][col - 1], 3, 1]);
    }

    if (neighbors.length > 0) {
        return neighbors[Math.floor(Math.random() * neighbors.length)];
    }
    return undefined;
}

/**
 * Generates the maze using a recursive backtracking algorithm.
 */
function generateMaze() {
    createGrid();
    const stack = [];
    let current = maze[0][0]; // Start at top-left
    current.visited = true;
    stack.push(current);

    while (stack.length > 0) {
        const next = getUnvisitedNeighbor(current);

        if (next) {
            const [nextCell, currentWall, nextWall] = next;
            stack.push(nextCell);

            // Break walls between current and next cell
            current.walls[currentWall] = false;
            nextCell.walls[nextWall] = false;

            current = nextCell;
            current.visited = true;
        } else if (stack.length > 0) {
            current = stack.pop(); // Backtrack
        }
    }

    // Set player start and goal positions
    player.x = CELL_SIZE / 2;
    player.y = CELL_SIZE / 2;
    goal.x = (COLS - 1) * CELL_SIZE + CELL_SIZE / 2;
    goal.y = (ROWS - 1) * CELL_SIZE + CELL_SIZE / 2;
}

// --- Drawing Functions ---

/**
 * Clears the canvas and draws the entire maze.
 */
function drawMaze() {
    ctx.clearRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT);
    ctx.fillStyle = PATH_COLOR;
    ctx.fillRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT); // Fill background as paths

    // Draw all cell walls
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            maze[r][c].draw();
        }
    }
}

/**
 * Draws the player circle.
 */
function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fill();
    ctx.closePath();
}

/**
 * Draws the goal square.
 */
function drawGoal() {
    ctx.fillStyle = GOAL_COLOR;
    const goalX = goal.x - CELL_SIZE / 2;
    const goalY = goal.y - CELL_SIZE / 2;
    ctx.fillRect(goalX, goalY, CELL_SIZE, CELL_SIZE);
}

// --- Player Movement and Collision ---

/**
 * Handles player movement based on arrow key input.
 * @param {KeyboardEvent} e - The keyboard event.
 */
function handleKeyDown(e) {
    if (!gameActive) return;

    let newPlayerX = player.x;
    let newPlayerY = player.y;
    const speed = 5;

    switch (e.key) {
        case 'ArrowUp':    newPlayerY -= speed; break;
        case 'ArrowDown':  newPlayerY += speed; break;
        case 'ArrowLeft':  newPlayerX -= speed; break;
        case 'ArrowRight': newPlayerX += speed; break;
        default: return; // Ignore other keys
    }

    e.preventDefault(); // Prevent page scrolling

    // Check for wall collisions
    if (!checkWallCollision(newPlayerX, newPlayerY)) {
        player.x = newPlayerX;
        player.y = newPlayerY;
    }
}

/**
 * Checks if the player's potential new position collides with any maze wall.
 * This is the most complex part of the collision detection.
 * @param {number} nextX - The player's potential new X position.
 * @param {number} nextY - The player's potential new Y position.
 * @returns {boolean} True if a collision occurs, false otherwise.
 */
function checkWallCollision(nextX, nextY) {
    const playerHalfSize = player.size / 2;

    // Calculate the bounding box for the player's potential new position
    const playerLeft = nextX - playerHalfSize;
    const playerRight = nextX + playerHalfSize;
    const playerTop = nextY - playerHalfSize;
    const playerBottom = nextY + playerHalfSize;

    // Clamp player within canvas boundaries
    if (playerLeft < 0 || playerRight > MAZE_WIDTH || playerTop < 0 || playerBottom > MAZE_HEIGHT) {
        return true;
    }

    // Determine which cells the player's bounding box overlaps
    // We need to check all cells that the player's bounding box touches
    const startCol = Math.floor(playerLeft / CELL_SIZE);
    const endCol = Math.floor(playerRight / CELL_SIZE);
    const startRow = Math.floor(playerTop / CELL_SIZE);
    const endRow = Math.floor(playerBottom / CELL_SIZE);

    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            // Ensure cell indices are within bounds
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;

            const cell = maze[r][c];
            const cellX = c * CELL_SIZE;
            const cellY = r * CELL_SIZE;

            // Check walls relative to the current cell
            // Top wall
            if (cell.walls[0] && playerTop <= cellY && playerBottom > cellY) {
                if (playerRight > cellX && playerLeft < cellX + CELL_SIZE) return true;
            }
            // Right wall
            if (cell.walls[1] && playerRight >= cellX + CELL_SIZE && playerLeft < cellX + CELL_SIZE) {
                if (playerBottom > cellY && playerTop < cellY + CELL_SIZE) return true;
            }
            // Bottom wall
            if (cell.walls[2] && playerBottom >= cellY + CELL_SIZE && playerTop < cellY + CELL_SIZE) {
                if (playerRight > cellX && playerLeft < cellX + CELL_SIZE) return true;
            }
            // Left wall
            if (cell.walls[3] && playerLeft <= cellX && playerRight > cellX) {
                if (playerBottom > cellY && playerTop < cellY + CELL_SIZE) return true;
            }
        }
    }
    return false;
}

/**
 * Checks if the player has reached the goal.
 * @returns {boolean} True if player is at the goal.
 */
function checkGoalCollision() {
    const distanceX = player.x - goal.x;
    const distanceY = player.y - goal.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    // Check if the center of the player is within a certain radius of the goal center
    return distance < (player.size / 2 + CELL_SIZE / 2) * 0.4; 
}


// --- Game Loop ---

function gameLoop() {
    if (!gameActive) {
        cancelAnimationFrame(gameLoopId);
        return;
    }

    // 1. Draw everything
    drawMaze();
    drawGoal();
    drawPlayer();

    // 2. Check game conditions
    if (checkGoalCollision()) {
        messageEl.textContent = "You reached the exit! 🎉";
        messageEl.style.color = GOAL_COLOR;
        gameActive = false;
        newGameBtn.textContent = "Play Again";
    }

    gameLoopId = requestAnimationFrame(gameLoop);
}

/**
 * Starts a new game by generating a maze and initializing player.
 */
function newGame() {
    generateMaze();
    gameActive = true;
    messageEl.textContent = "Use Arrow Keys to move. Find the green exit!";
    messageEl.style.color = 'black';
    newGameBtn.textContent = "New Maze";
    cancelAnimationFrame(gameLoopId); // Stop any existing loop
    gameLoopId = requestAnimationFrame(gameLoop); // Start new loop
}

// --- Event Listeners ---
document.addEventListener('keydown', handleKeyDown);
newGameBtn.addEventListener('click', newGame);

// --- Initial Game Start ---
newGame();