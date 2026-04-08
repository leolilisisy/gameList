document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME CONSTANTS AND VARIABLES ---
    const GRID_SIZE = 3;
    const PUZZLE_SIZE = GRID_SIZE * GRID_SIZE; // 9 tiles for 3x3
    // !!! IMPORTANT: CHANGE THIS PATH TO YOUR IMAGE FILE !!!
    const IMAGE_URL = 'images/puzzle-image.jpg'; 
    const TILE_LENGTH = 300 / GRID_SIZE; // 100px per tile (based on 300px puzzle width in CSS)

    const gridElement = document.getElementById('puzzle-grid');
    const messageElement = document.getElementById('message');
    const resetButton = document.getElementById('reset-button');

    let tiles = []; // Array of tile elements in their current on-screen order
    let gameActive = false;

    // --- 2. UTILITY FUNCTIONS ---

    /**
     * Calculates the CSS background-position to show the correct slice of the full image.
     */
    function calculateBackgroundPosition(index) {
        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;
        // The background image is moved in the opposite direction of the tile's position.
        const x = -col * TILE_LENGTH;
        const y = -row * TILE_LENGTH;
        return `${x}px ${y}px`;
    }
    
    /**
     * Simple array shuffle (Fisher-Yates).
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Finds the index (0-8) of the empty tile in the current 'tiles' array.
     */
    function findEmptyTileIndex() {
        return tiles.findIndex(tile => tile.classList.contains('empty-tile'));
    }

    /**
     * Checks if two tiles are adjacent on the grid.
     */
    function isAdjacent(tileIndex, emptyIndex) {
        const tileRow = Math.floor(tileIndex / GRID_SIZE);
        const tileCol = tileIndex % GRID_SIZE;
        const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
        const emptyCol = emptyIndex % GRID_SIZE;

        const rowDiff = Math.abs(tileRow - emptyRow);
        const colDiff = Math.abs(tileCol - emptyCol);

        // Must be exactly one step in ONE direction (horizontal or vertical)
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    // --- 3. GAME LOGIC FUNCTIONS ---

    /**
     * Initializes the puzzle by creating tiles, setting background, and shuffling.
     */
    function initPuzzle() {
        // Clear previous grid
        gridElement.innerHTML = '';
        tiles = [];
        gameActive = true;
        
        // 1. Create Tiles
        for (let i = 0; i < PUZZLE_SIZE; i++) {
            const tileElement = document.createElement('div');
            tileElement.classList.add('tile');
            // data-solved-index stores the tile's permanent, correct position (0-8)
            tileElement.setAttribute('data-solved-index', i); 

            // Set the unique background slice for this tile
            tileElement.style.backgroundImage = `url(${IMAGE_URL})`;
            tileElement.style.backgroundPosition = calculateBackgroundPosition(i);
            
            tiles.push(tileElement);
            tileElement.addEventListener('click', handleTileClick);
        }

        // 2. Designate the last tile (index 8) as the empty space
        tiles[PUZZLE_SIZE - 1].classList.add('empty-tile');
        
        // 3. Shuffle
        shuffleArray(tiles);

        // 4. Render the initial (shuffled) state
        renderTiles();
        
        messageElement.textContent = 'Puzzle ready! Slide a tile.';
    }

    /**
     * Renders the tile elements onto the grid based on the current order in the 'tiles' array.
     */
    function renderTiles() {
        tiles.forEach(tile => {
            gridElement.appendChild(tile);
        });
    }

    /**
     * Handles the click event on a puzzle tile.
     */
    function handleTileClick(event) {
        if (!gameActive) return;

        const clickedTileElement = event.target;
        const clickedTileIndex = tiles.indexOf(clickedTileElement);
        const emptyTileIndex = findEmptyTileIndex();

        if (clickedTileIndex !== -1 && isAdjacent(clickedTileIndex, emptyTileIndex)) {
            // Logically swap the clicked tile and the empty tile in the array
            [tiles[clickedTileIndex], tiles[emptyTileIndex]] = 
            [tiles[emptyTileIndex], tiles[clickedTileIndex]];
            
            // Re-render the grid to reflect the new array order
            gridElement.innerHTML = '';
            renderTiles();
            
            // Check win condition
            if (checkWin()) {
                endGame(true);
            }
        }
    }

    /**
     * Checks if the current arrangement of tiles matches the solved state.
     */
    function checkWin() {
        // The puzzle is solved if the data-solved-index of each tile matches its position in the 'tiles' array (i)
        for (let i = 0; i < PUZZLE_SIZE; i++) {
            const solvedIndex = parseInt(tiles[i].getAttribute('data-solved-index'));
            if (solvedIndex !== i) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Ends the game and displays the result.
     */
    function endGame(win) {
        gameActive = false;
        if (win) {
            messageElement.textContent = '🌟 CONGRATULATIONS! Puzzle Solved!';
            // Reveal the last tile to complete the image
            tiles[PUZZLE_SIZE - 1].classList.remove('empty-tile');
            gridElement.classList.add('solved');
        }
        // Disable click listeners if needed here, or rely on the `if (!gameActive)` check
    }

    // --- 4. EVENT LISTENERS AND INITIALIZATION ---
    resetButton.addEventListener('click', initPuzzle);
    
    // Start the game immediately
    initPuzzle();
});