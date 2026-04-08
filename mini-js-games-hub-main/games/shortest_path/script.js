document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME CONSTANTS & VARIABLES ---
    const GRID_SIZE = 10;
    const GRID_TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
    const gridContainer = document.getElementById('grid-container');
    const pathLengthSpan = document.getElementById('path-length');
    const clickCountSpan = document.getElementById('click-count');
    const feedbackMessage = document.getElementById('feedback-message');
    const resetButton = document.getElementById('reset-button');
    const newPuzzleButton = document.getElementById('new-puzzle-button');

    let gridState = [];      // 1D array representing the state (0: empty, 1: wall, 2: path, 3: start, 4: end)
    let startCellIndex = 0;
    let endCellIndex = 0;
    let currentPath = [];    // Array of cell indices making up the player's path
    let clickCount = 0;
    let gameActive = false;
    
    // --- 2. UTILITY FUNCTIONS ---

    /**
     * Converts a 1D index (0-99) to a 2D coordinate {row, col}.
     */
    function getCoords(index) {
        return {
            row: Math.floor(index / GRID_SIZE),
            col: index % GRID_SIZE
        };
    }
    
    /**
     * Converts a 2D coordinate {row, col} to a 1D index (0-99).
     */
    function getIndex(row, col) {
        if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
            return -1; // Out of bounds
        }
        return row * GRID_SIZE + col;
    }

    /**
     * Resets the path and re-renders the grid without changing the walls, start, or end.
     */
    function resetPath() {
        if (!gameActive) return;
        
        // Clear old path classes from DOM and reset grid state to 0
        currentPath.forEach(index => {
            const cell = gridContainer.children[index];
            if (cell && cell.classList.contains('path')) {
                cell.classList.remove('path');
                gridState[index] = 0; // Set back to empty
            }
        });

        currentPath = [];
        clickCount = 0;
        pathLengthSpan.textContent = 0;
        clickCountSpan.textContent = 0;
        feedbackMessage.textContent = 'Path reset. Start clicking from the Start (S) cell!';
        
        // Re-add start cell to currentPath and update display
        const startCell = gridContainer.children[startCellIndex];
        if (startCell) {
             startCell.click(); // Simulate a click on start to begin path
        }
    }

    // --- 3. GAME LOGIC ---

    /**
     * Generates a new random grid layout with walls and sets start/end points.
     */
    function generateNewPuzzle() {
        // 1. Reset state
        gridState = Array(GRID_TOTAL_CELLS).fill(0); // 0 = empty
        currentPath = [];
        clickCount = 0;
        gameActive = true;
        gridContainer.innerHTML = ''; // Clear old DOM elements
        
        // 2. Randomly set Walls (20% chance)
        for (let i = 0; i < GRID_TOTAL_CELLS; i++) {
            if (Math.random() < 0.20) { // 20% chance of a wall
                gridState[i] = 1; // 1 = wall
            }
        }

        // 3. Randomly set Start (3) and End (4) points (must be unique and not walls)
        do {
            startCellIndex = Math.floor(Math.random() * GRID_TOTAL_CELLS);
        } while (gridState[startCellIndex] !== 0);
        gridState[startCellIndex] = 3;

        do {
            endCellIndex = Math.floor(Math.random() * GRID_TOTAL_CELLS);
        } while (gridState[endCellIndex] !== 0 || endCellIndex === startCellIndex);
        gridState[endCellIndex] = 4;
        
        // 4. Render the grid and initial path
        renderGrid();
        
        feedbackMessage.textContent = 'New puzzle generated. Click on the Start (S) cell to begin.';
    }

    /**
     * Renders the grid based on the gridState array.
     */
    function renderGrid() {
        gridContainer.innerHTML = '';
        
        for (let i = 0; i < GRID_TOTAL_CELLS; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', handleCellClick);

            switch (gridState[i]) {
                case 1: // Wall
                    cell.classList.add('wall');
                    break;
                case 3: // Start
                    cell.classList.add('start');
                    cell.textContent = 'S';
                    break;
                case 4: // End
                    cell.classList.add('end');
                    cell.textContent = 'E';
                    break;
            }
            gridContainer.appendChild(cell);
        }
    }

    /**
     * Checks if a click on a new cell is a valid move from the last cell in the path.
     */
    function isValidMove(newIndex) {
        if (currentPath.length === 0) {
            // First click must be on the start cell
            return newIndex === startCellIndex;
        }

        const lastIndex = currentPath[currentPath.length - 1];
        const lastCoords = getCoords(lastIndex);
        const newCoords = getCoords(newIndex);
        
        // 1. Check if the cell is a wall
        if (gridState[newIndex] === 1) {
            feedbackMessage.textContent = "Cannot cross a Wall!";
            return false;
        }
        
        // 2. Check adjacency (must be 1 unit away horizontally or vertically)
        const rowDiff = Math.abs(lastCoords.row - newCoords.row);
        const colDiff = Math.abs(lastCoords.col - newCoords.col);
        
        // Valid if (rowDiff=1 AND colDiff=0) OR (rowDiff=0 AND colDiff=1)
        if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
            // 3. Check if the cell is already in the path (to prevent overlapping)
            if (currentPath.includes(newIndex) && newIndex !== endCellIndex) {
                // Allow clicking the cell BEFORE the last one to backtrack
                if (currentPath.indexOf(newIndex) === currentPath.length - 2) {
                    return 'backtrack';
                }
                feedbackMessage.textContent = "Cannot cross your own path!";
                return false;
            }
            return true;
        }

        feedbackMessage.textContent = "You can only move to adjacent cells (up, down, left, right)!";
        return false;
    }

    /**
     * Main handler for all cell clicks.
     */
    function handleCellClick(event) {
        if (!gameActive) return;
        
        const cell = event.target;
        const newIndex = parseInt(cell.getAttribute('data-index'));
        const moveStatus = isValidMove(newIndex);
        
        if (moveStatus === 'backtrack') {
            // Remove the last cell (the one we're clicking *back* to)
            const lastCellIndex = currentPath.pop();
            const lastCell = gridContainer.children[lastCellIndex];
            if (lastCell) {
                lastCell.classList.remove('path');
                gridState[lastCellIndex] = 0; // Reset state
            }
            currentPath.pop(); // Remove the second-to-last cell (the one we're standing on now)
            
            // Re-call the function to place the click correctly
            handleCellClick(event);
            return;
        }
        
        if (moveStatus === true) {
            // Valid forward move
            
            // If the cell isn't the start or end, mark it as part of the path
            if (gridState[newIndex] !== 3 && gridState[newIndex] !== 4) {
                cell.classList.add('path');
                gridState[newIndex] = 2; // 2 = path
            }
            
            currentPath.push(newIndex);
            clickCount++;
            
            // Update stats
            pathLengthSpan.textContent = currentPath.length - 1; // Subtract 1 because the start cell is included
            clickCountSpan.textContent = clickCount;
            feedbackMessage.textContent = `Moved to cell (${getCoords(newIndex).row}, ${getCoords(newIndex).col}).`;
            
            // Check win condition
            if (newIndex === endCellIndex) {
                feedbackMessage.innerHTML = `🎉 **SUCCESS!** Path found in ${currentPath.length - 1} steps. Try to beat your score!`;
                gameActive = false;
            }
            
        } else if (currentPath.length === 0 && newIndex === startCellIndex) {
             // Initial click on 'S' to start the path
             currentPath.push(newIndex);
             clickCount++;
             pathLengthSpan.textContent = 0;
             clickCountSpan.textContent = clickCount;
             feedbackMessage.textContent = 'Path started. Follow the empty spaces!';
        }
    }

    // --- 4. EVENT LISTENERS ---
    
    resetButton.addEventListener('click', resetPath);
    newPuzzleButton.addEventListener('click', generateNewPuzzle);

    // Initial game start
    generateNewPuzzle();
});