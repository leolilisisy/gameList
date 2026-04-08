document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME CONSTANTS & ELEMENTS ---
    const GRID_SIZE = 40; // 40x40 grid
    const gridContainer = document.getElementById('grid-container');
    const startButton = document.getElementById('start-button');
    const stopButton = document.getElementById('stop-button');
    const resetButton = document.getElementById('reset-button');
    const stepButton = document.getElementById('step-button');
    const generationDisplay = document.getElementById('generation-display');
    const liveCountDisplay = document.getElementById('live-count');

    // --- 2. GAME STATE VARIABLES ---
    let grid = [];           // The 2D array holding the current state (1 for live, 0 for dead)
    let generation = 0;
    let simulationInterval = null;
    const SIMULATION_SPEED_MS = 100; // 10 generations per second

    // --- 3. CORE LOGIC (Conway's Rules) ---

    /**
     * Counts the number of live neighbors for a cell at (r, c).
     */
    function countLiveNeighbors(r, c) {
        let count = 0;
        
        // Loop through the 8 surrounding cells
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip the cell itself

                const neighborRow = r + i;
                const neighborCol = c + j;

                // Check boundary conditions (toroidal/wrapping can be added here)
                if (neighborRow >= 0 && neighborRow < GRID_SIZE && 
                    neighborCol >= 0 && neighborCol < GRID_SIZE) {
                    
                    count += grid[neighborRow][neighborCol];
                }
            }
        }
        return count;
    }

    /**
     * Calculates the state of the *next* generation based on the current grid.
     */
    function calculateNextGeneration() {
        // Use a "double buffer" (a new grid) to hold the state of the next generation.
        // This prevents the state change of an early cell from affecting the calculation
        // of a later cell in the same generation.
        const newGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
        let liveCount = 0;

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const liveNeighbors = countLiveNeighbors(r, c);
                const isLive = grid[r][c] === 1;

                if (isLive) {
                    // Rule 1 & 2: Survival
                    // A live cell survives with 2 or 3 live neighbors.
                    if (liveNeighbors === 2 || liveNeighbors === 3) {
                        newGrid[r][c] = 1;
                    } 
                    // Rule 4: Death by underpopulation (< 2) or overpopulation (> 3)
                    // If not 2 or 3, it dies (newGrid[r][c] remains 0).
                } else {
                    // Rule 3: Reproduction
                    // A dead cell becomes live with exactly 3 live neighbors.
                    if (liveNeighbors === 3) {
                        newGrid[r][c] = 1;
                    }
                }
                
                if (newGrid[r][c] === 1) {
                    liveCount++;
                }
            }
        }

        // Update global state
        grid = newGrid;
        generation++;
        
        // Update DOM
        renderGrid();
        generationDisplay.textContent = generation;
        liveCountDisplay.textContent = liveCount;
    }

    // --- 4. GAME FLOW AND RENDERING ---

    /**
     * Creates the initial grid data array and DOM elements.
     */
    function setupGrid() {
        gridContainer.innerHTML = '';
        grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
        generation = 0;
        
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.setAttribute('data-row', r);
                cell.setAttribute('data-col', c);
                cell.addEventListener('click', handleCellClick);
                gridContainer.appendChild(cell);
            }
        }
        generationDisplay.textContent = 0;
        liveCountDisplay.textContent = 0;
    }

    /**
     * Updates the CSS classes of the cells based on the 'grid' array.
     */
    function renderGrid() {
        let liveCount = 0;
        
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const index = r * GRID_SIZE + c;
                const cellElement = gridContainer.children[index];
                
                if (grid[r][c] === 1) {
                    cellElement.classList.add('live');
                    liveCount++;
                } else {
                    cellElement.classList.remove('live');
                }
            }
        }
        liveCountDisplay.textContent = liveCount;
    }

    /**
     * Handles the user clicking a cell to toggle its state (setup mode).
     */
    function handleCellClick(event) {
        if (simulationInterval) return; // Cannot edit during simulation

        const cell = event.target;
        const r = parseInt(cell.getAttribute('data-row'));
        const c = parseInt(cell.getAttribute('data-col'));
        
        // Toggle the state
        if (grid[r][c] === 1) {
            grid[r][c] = 0;
            cell.classList.remove('live');
        } else {
            grid[r][c] = 1;
            cell.classList.add('live');
        }
        
        // Update live cell count
        liveCountDisplay.textContent = grid.flat().filter(val => val === 1).length;
    }

    /**
     * Starts the continuous simulation loop.
     */
    function startSimulation() {
        if (simulationInterval) return;

        simulationInterval = setInterval(calculateNextGeneration, SIMULATION_SPEED_MS);
        startButton.disabled = true;
        stopButton.disabled = false;
        stepButton.disabled = true;
        resetButton.disabled = true;
        feedbackMessage.textContent = 'Running simulation...';
    }

    /**
     * Stops the continuous simulation loop.
     */
    function stopSimulation() {
        clearInterval(simulationInterval);
        simulationInterval = null;
        startButton.disabled = false;
        stopButton.disabled = true;
        stepButton.disabled = false;
        resetButton.disabled = false;
        feedbackMessage.textContent = 'Paused. You can step or restart.';
    }

    // --- 5. EVENT LISTENERS AND INITIAL SETUP ---

    startButton.addEventListener('click', startSimulation);
    stopButton.addEventListener('click', stopSimulation);
    stepButton.addEventListener('click', calculateNextGeneration);
    
    resetButton.addEventListener('click', () => {
        stopSimulation();
        setupGrid();
        feedbackMessage.textContent = 'Grid cleared. Set a new pattern.';
    });

    // Initial setup
    setupGrid();
});