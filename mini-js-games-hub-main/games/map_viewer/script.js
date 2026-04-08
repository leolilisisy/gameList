document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME CONSTANTS & ELEMENTS ---
    const GRID_SIZE = 25; // Map dimensions (25x25)
    const MAX_TILES_TO_CARVE = 600; // How many floor tiles to generate
    const gridContainer = document.getElementById('grid-container');
    const newMapButton = document.getElementById('new-map-button');
    const tilesCountDisplay = document.getElementById('tiles-count');
    const mapSizeDisplay = document.getElementById('map-size-display');
    
    // Tile types (used in the map array)
    const WALL = 0;
    const FLOOR = 1;

    let map = []; // The 2D array representing the dungeon
    let tilesCarved = 0;

    // --- 2. UTILITY FUNCTIONS ---
    
    /**
     * Finds a cell's corresponding element in the DOM.
     */
    function getCellElement(row, col) {
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
            return gridContainer.children[row * GRID_SIZE + col];
        }
        return null;
    }

    /**
     * Determines the CSS class based on the tile type.
     */
    function getTileClass(tileValue) {
        if (tileValue === FLOOR) return 'tile-floor';
        if (tileValue === WALL) return 'tile-wall';
        // Fallback for cells outside the generated area, though generally unused with this method
        return 'tile-empty'; 
    }

    /**
     * Generates a random integer between min (inclusive) and max (exclusive).
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // --- 3. PROCEDURAL GENERATION (RANDOM WALK) ---

    /**
     * Initializes the map array and starts the generation process.
     */
    function generateNewMap() {
        // 1. Reset state
        tilesCarved = 0;
        // Fill the entire map with WALLs (0)
        map = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(WALL));

        // 2. Start the Random Walk from a random center point
        let currentRow = getRandomInt(5, GRID_SIZE - 5);
        let currentCol = getRandomInt(5, GRID_SIZE - 5);

        // 3. Begin the Carving Process
        while (tilesCarved < MAX_TILES_TO_CARVE) {
            // Ensure walker stays within bounds
            if (currentRow >= 1 && currentRow < GRID_SIZE - 1 && 
                currentCol >= 1 && currentCol < GRID_SIZE - 1) {
                
                // If this is a new floor tile, count it
                if (map[currentRow][currentCol] === WALL) {
                    map[currentRow][currentCol] = FLOOR;
                    tilesCarved++;
                }

                // Randomly choose the next direction (0=N, 1=E, 2=S, 3=W)
                const direction = getRandomInt(0, 4);

                switch (direction) {
                    case 0: currentRow--; break; // North
                    case 1: currentCol++; break; // East
                    case 2: currentRow++; break; // South
                    case 3: currentCol--; break; // West
                }

            } else {
                // If out of bounds, jump back to a random central point
                currentRow = getRandomInt(5, GRID_SIZE - 5);
                currentCol = getRandomInt(5, GRID_SIZE - 5);
            }
        }
        
        // 4. Render the final map to the DOM
        renderMap();
        
        // 5. Update Status
        tilesCountDisplay.textContent = tilesCarved;
    }

    // --- 4. DOM RENDERING ---

    /**
     * Sets the CSS variables and builds the grid structure once.
     */
    function setupGridContainer() {
        // Update CSS variables for grid sizing
        document.documentElement.style.setProperty('--grid-rows', GRID_SIZE);
        document.documentElement.style.setProperty('--grid-cols', GRID_SIZE);
        mapSizeDisplay.textContent = `${GRID_SIZE}x${GRID_SIZE}`;

        // Create all cell elements (GRID_SIZE * GRID_SIZE)
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            gridContainer.appendChild(cell);
        }
    }

    /**
     * Updates the class (color) of every cell in the DOM based on the map array.
     */
    function renderMap() {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const index = r * GRID_SIZE + c;
                const cellElement = gridContainer.children[index];
                
                // Clear old classes
                cellElement.className = 'grid-cell'; 
                
                // Add new class based on map value
                const tileValue = map[r][c];
                cellElement.classList.add(getTileClass(tileValue));
            }
        }
    }

    // --- 5. EVENT LISTENERS ---

    newMapButton.addEventListener('click', generateNewMap);

    // Initial setup and map generation on load
    setupGridContainer();
    generateNewMap();
});