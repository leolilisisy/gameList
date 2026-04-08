// --- Game Constants and Setup ---
const GRID_SIZE = 6;
const TILE_SIZE = 60; // Must match CSS
const TIMER_SECONDS = 60;
const PIPE_TYPES = {
    STRAIGHT: 'straight',
    CORNER: 'corner',
    T_JUNCTION: 'tjunction'
};

const gridElement = document.getElementById('pipe-grid');
const timerElement = document.getElementById('timer');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restart-button');

let grid = []; // The 2D array holding tile data
let timerInterval;
let timeLeft;
let gameActive = false;

// --- Pipe Connection Data ---
// Defines which sides (N, E, S, W) are open for a pipe piece at 0 degrees rotation (0 * 90deg)
// The pipe class will handle rotating these connections.
const PIPE_CONNECTIONS = {
    // [N, E, S, W] where 1 is open, 0 is closed
    [PIPE_TYPES.STRAIGHT]: [1, 0, 1, 0], // Vertical straight pipe
    [PIPE_TYPES.CORNER]:   [1, 1, 0, 0], // Top-right corner
    [PIPE_TYPES.T_JUNCTION]: [1, 1, 1, 0] // T-junction open N, E, S
};

// --- Tile Class (Data Model) ---
class Tile {
    constructor(row, col, type, rotation) {
        this.row = row;
        this.col = col;
        this.type = type;
        this.rotation = rotation; // 0, 90, 180, 270 (degrees)
        this.isStart = false;
        this.isEnd = false;
        this.element = null; // Reference to the DOM element
    }

    /**
     * Gets the current connection points [N, E, S, W] based on type and rotation.
     * @returns {Array<number>} An array of 0s and 1s representing open connections.
     */
    getConnections() {
        if (this.isStart || this.isEnd) {
            // Start/End connections are fixed and set at generation
            return this.type; // type holds the [N, E, S, W] for start/end
        }
        
        const baseConnections = PIPE_CONNECTIONS[this.type];
        const numRotations = this.rotation / 90;

        // Rotate the array based on the rotation value
        // Example: [1, 0, 1, 0] rotated 90deg becomes [0, 1, 0, 1]
        let connections = [...baseConnections];
        for (let i = 0; i < numRotations; i++) {
            connections.unshift(connections.pop());
        }
        return connections;
    }

    rotate() {
        this.rotation = (this.rotation + 90) % 360;
        this.render();
    }

    render() {
        const pipeElement = this.element.querySelector('.pipe');
        if (pipeElement) {
            pipeElement.style.setProperty('--rotation', `${this.rotation}deg`);
        }
    }
}

// --- Game Initialization ---

function initGame() {
    // Clear previous state
    clearInterval(timerInterval);
    gridElement.innerHTML = '';
    grid = [];
    gameActive = true;
    timeLeft = TIMER_SECONDS;
    restartButton.classList.add('hidden');
    messageElement.textContent = 'Rotate pipes to connect the flow!';

    // Set up the grid structure in CSS via JS (optional, but good practice)
    gridElement.style.gridTemplateColumns = `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`;
    gridElement.style.gridTemplateRows = `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`;

    createGrid();
    startGameTimer();
}

/**
 * Creates the randomized grid with Start and End points.
 */
function createGrid() {
    // Randomly select start and end points on the border
    const borderTiles = [];
    for(let i = 0; i < GRID_SIZE; i++) {
        // Top/Bottom rows
        borderTiles.push({r: 0, c: i});
        borderTiles.push({r: GRID_SIZE - 1, c: i});
        // Left/Right columns (excluding corners already added)
        if (i > 0 && i < GRID_SIZE - 1) {
            borderTiles.push({r: i, c: 0});
            borderTiles.push({r: i, c: GRID_SIZE - 1});
        }
    }
    
    // Select two random, distinct border tiles for start/end
    const startIndex = Math.floor(Math.random() * borderTiles.length);
    let endIndex;
    do {
        endIndex = Math.floor(Math.random() * borderTiles.length);
    } while (endIndex === startIndex);

    const startPos = borderTiles[startIndex];
    const endPos = borderTiles[endIndex];

    for (let r = 0; r < GRID_SIZE; r++) {
        grid[r] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            let tile;
            let typeKey = Object.keys(PIPE_TYPES);
            let randomType = PIPE_TYPES[typeKey[Math.floor(Math.random() * typeKey.length)]];
            let randomRotation = Math.floor(Math.random() * 4) * 90;

            if (r === startPos.r && c === startPos.c) {
                // Start tile setup
                tile = new Tile(r, c, getFixedConnection(r, c), 0); 
                tile.isStart = true;
            } else if (r === endPos.r && c === endPos.c) {
                // End tile setup
                tile = new Tile(r, c, getFixedConnection(r, c), 0);
                tile.isEnd = true;
            } else {
                // Regular pipe tile
                tile = new Tile(r, c, randomType, randomRotation);
            }
            
            grid[r][c] = tile;
            createTileElement(tile);
        }
    }
}

/**
 * Determines the fixed connection for border Start/End tiles.
 * @param {number} r - Row index.
 * @param {number} c - Column index.
 * @returns {Array<number>} The fixed connection array [N, E, S, W].
 */
function getFixedConnection(r, c) {
    if (r === 0) return [0, 0, 1, 0]; // Connects South
    if (r === GRID_SIZE - 1) return [1, 0, 0, 0]; // Connects North
    if (c === 0) return [0, 1, 0, 0]; // Connects East
    if (c === GRID_SIZE - 1) return [0, 0, 0, 1]; // Connects West
    // Should not happen for border tiles
    return [0, 0, 0, 0];
}

/**
 * Creates the DOM element for a tile and attaches the click handler.
 * @param {Tile} tile - The Tile data object.
 */
function createTileElement(tile) {
    const tileDiv = document.createElement('div');
    tileDiv.classList.add('tile');
    
    // Add pipe element inside the tile to handle rotation
    const pipeDiv = document.createElement('div');
    pipeDiv.classList.add('pipe');

    if (tile.isStart) {
        tileDiv.classList.add('start-tile');
    } else if (tile.isEnd) {
        tileDiv.classList.add('end-tile');
    } else {
        pipeDiv.classList.add(`pipe-${tile.type}`);
    }

    tileDiv.appendChild(pipeDiv);
    tile.element = tileDiv; // Store reference

    // Initial render for the rotation
    tile.render();

    // Attach event listener for rotation
    if (!tile.isStart && !tile.isEnd) {
        tileDiv.addEventListener('click', () => {
            if (gameActive) {
                tile.rotate();
                checkWinCondition();
            }
        });
    }

    gridElement.appendChild(tileDiv);
}

// --- Timer Logic ---

function startGameTimer() {
    timerElement.textContent = `Time: ${timeLeft}s`;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver(false);
        }
    }, 1000);
}

// --- Path Validation Logic (The Core Challenge) ---

/**
 * The main function to check if a continuous path exists from start to end.
 */
function checkWinCondition() {
    let startTile;
    let endTile;
    let visitedTiles = new Set();

    // 1. Find Start and End
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c].isStart) startTile = grid[r][c];
            if (grid[r][c].isEnd) endTile = grid[r][c];
        }
    }
    
    if (!startTile || !endTile) return; // Should never happen

    // 2. Identify initial movement direction from the Start tile
    let startConnections = startTile.getConnections();
    let initialDirection; // 0=N, 1=E, 2=S, 3=W

    // Find the single open side of the Start tile
    for(let i = 0; i < 4; i++) {
        if(startConnections[i] === 1) {
            initialDirection = i;
            break;
        }
    }

    // 3. Start the recursive search
    const startRow = startTile.row;
    const startCol = startTile.col;
    
    // Determine the coordinates of the first tile to visit
    let nextRow = startRow, nextCol = startCol;
    if (initialDirection === 0) nextRow--; // North
    else if (initialDirection === 1) nextCol++; // East
    else if (initialDirection === 2) nextRow++; // South
    else if (initialDirection === 3) nextCol--; // West

    // Direction the *pipe leaves* the current tile (initialDirection)
    // The opposite is the direction the *pipe enters* the next tile (entryDirection)
    const entryDirection = (initialDirection + 2) % 4; 
    
    // Clear connection highlights
    grid.flat().forEach(tile => tile.element.classList.remove('connected'));

    // Perform the depth-first search (DFS)
    const pathFound = recursiveValidate(nextRow, nextCol, entryDirection, endTile, visitedTiles);

    if (pathFound) {
        gameOver(true);
    }
}

/**
 * Recursive Depth-First Search (DFS) to find the path.
 * @param {number} r - Current tile row.
 * @param {number} c - Current tile column.
 * @param {number} entryDirection - The side the flow *enters* this tile (0=N, 1=E, 2=S, 3=W).
 * @param {Tile} endTile - The target end tile.
 * @param {Set} visited - Set of previously visited tile coordinates (as "r,c").
 * @returns {boolean} True if the path reaches the end tile.
 */
function recursiveValidate(r, c, entryDirection, endTile, visited) {
    const key = `${r},${c}`;

    // 1. Out of Bounds or Already Visited
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE || visited.has(key)) {
        return false;
    }

    const currentTile = grid[r][c];
    visited.add(key);
    
    // Highlight connection (temporarily, or permanently on win)
    currentTile.element.classList.add('connected');

    // 2. Check for Connection Match
    const currentConnections = currentTile.getConnections();
    
    // The tile MUST have an open connection on the side the flow is ENTERING
    if (currentConnections[entryDirection] === 0) {
        currentTile.element.classList.remove('connected'); // Backtrack highlight
        return false;
    }

    // 3. Check for Win (End Tile)
    if (currentTile === endTile) {
        // Must check if the tile's exit matches the END tile's entry point
        const endConnections = endTile.getConnections();
        if (endConnections[entryDirection] === 1) {
            return true; // WIN!
        }
        currentTile.element.classList.remove('connected'); // Backtrack highlight
        return false;
    }

    // 4. Explore Next Tile
    // Find the exit point(s) from the current tile
    for (let exitDirection = 0; exitDirection < 4; exitDirection++) {
        // Exit direction cannot be the same as the entry direction (0 vs 2, 1 vs 3)
        if (exitDirection === (entryDirection + 2) % 4) continue;
        
        // If this side is open for exit
        if (currentConnections[exitDirection] === 1) {
            let nextR = r, nextC = c;
            
            // Calculate coordinates of the neighbor tile
            if (exitDirection === 0) nextR--; // North
            else if (exitDirection === 1) nextC++; // East
            else if (exitDirection === 2) nextR++; // South
            else if (exitDirection === 3) nextC--; // West

            // The direction the flow *exits* the current tile is the opposite of the direction 
            // the flow *enters* the next tile.
            const nextEntryDirection = (exitDirection + 2) % 4;

            // Recurse to the next tile
            if (recursiveValidate(nextR, nextC, nextEntryDirection, endTile, visited)) {
                return true; // Path found down this branch
            }
        }
    }
    
    // 5. Backtrack
    // If we get here, the path failed at this tile. Remove highlight and backtrack.
    currentTile.element.classList.remove('connected'); 
    visited.delete(key);
    return false;
}

// --- Game End ---

function gameOver(won) {
    gameActive = false;
    clearInterval(timerInterval);
    
    if (won) {
        messageElement.textContent = 'SUCCESS! Flow Connected!';
        grid.flat().forEach(tile => tile.element.classList.add('connected'));
    } else {
        messageElement.textContent = 'TIME UP! Try again.';
    }

    restartButton.classList.remove('hidden');
}

// --- Event Listener ---
restartButton.addEventListener('click', initGame);

// --- Start Game ---
initGame();