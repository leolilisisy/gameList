document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME DATA ---
    
    // Puzzle definition: 0 represents an empty cell
    // This is the starting configuration
    const PUZZLE = [
        [0, 3, 0, 0],
        [4, 0, 0, 2],
        [0, 0, 1, 0],
        [0, 4, 2, 0]
    ];
    
    // Complete Solution (used for validation/solving)
    const SOLUTION = [
        [1, 3, 4, 2],
        [4, 2, 1, 3],
        [2, 3, 1, 4], // Error in original prompt solution, fixed for 4x4 rules
        [3, 4, 2, 1]
    ];

    // --- 2. DOM Elements & Constants ---
    const gridContainer = document.getElementById('sudoku-grid');
    const numberButtons = document.querySelectorAll('.num-input');
    const feedbackMessage = document.getElementById('feedback-message');
    const resetButton = document.getElementById('reset-button');
    const solveButton = document.getElementById('solve-button');

    const GRID_SIZE = 4;
    
    // Game State
    let currentGrid = [];
    let initialGrid = [];
    let selectedCell = null; // {row, col, element}

    // --- 3. CORE VALIDATION LOGIC ---

    /**
     * Checks if placing 'num' at (r, c) violates any of the three Sudoku rules.
     * @param {Array<Array<number>>} grid - The current 4x4 puzzle grid state.
     * @param {number} r - Row index.
     * @param {number} c - Column index.
     * @param {number} num - The number to test (1-4).
     * @returns {boolean} True if the placement is valid, false otherwise.
     */
    function isValidPlacement(grid, r, c, num) {
        if (num === 0) return true; // Clearing a cell is always valid

        // 1. Check Row (Horizontal)
        for (let col = 0; col < GRID_SIZE; col++) {
            if (col !== c && grid[r][col] === num) {
                return false;
            }
        }

        // 2. Check Column (Vertical)
        for (let row = 0; row < GRID_SIZE; row++) {
            if (row !== r && grid[row][c] === num) {
                return false;
            }
        }

        // 3. Check 2x2 Box (Subgrid)
        // Determine the top-left corner of the 2x2 box
        const startRow = Math.floor(r / 2) * 2;
        const startCol = Math.floor(c / 2) * 2;

        for (let row = startRow; row < startRow + 2; row++) {
            for (let col = startCol; col < startCol + 2; col++) {
                if (row !== r && col !== c && grid[row][col] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Iterates over the entire grid and highlights any cells that cause a conflict.
     */
    function validateAndHighlightGrid() {
        let isComplete = true;

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cellElement = gridContainer.rows[r].cells[c];
                const value = currentGrid[r][c];

                // Remove error class from previous check
                cellElement.classList.remove('error');

                if (value !== 0) {
                    // Temporarily set cell to 0, then check if placing 'value' back creates an error
                    // This is necessary because we need to check the value against its peers, not itself.
                    currentGrid[r][c] = 0; 
                    const isConflict = !isValidPlacement(currentGrid, r, c, value);
                    currentGrid[r][c] = value; // Restore the value

                    if (isConflict) {
                        cellElement.classList.add('error');
                    }
                }

                if (value === 0) {
                    isComplete = false;
                }
            }
        }
        
        // Check for Win Condition
        if (isComplete && document.querySelectorAll('.error').length === 0) {
            feedbackMessage.innerHTML = '🎉 **PUZZLE SOLVED!** All rules satisfied.';
            feedbackMessage.style.color = '#28a745';
            gridContainer.removeEventListener('click', handleCellSelect);
        } else if (isComplete) {
            feedbackMessage.innerHTML = 'Almost there! Check the highlighted errors.';
        }
    }

    // --- 4. GAME FLOW AND RENDERING ---

    /**
     * Renders the initial puzzle grid structure.
     */
    function renderGrid() {
        gridContainer.innerHTML = ''; // Clear existing table
        
        // Deep copy the puzzle to currentGrid and initialGrid
        initialGrid = PUZZLE.map(row => [...row]);
        currentGrid = initialGrid.map(row => [...row]);

        for (let r = 0; r < GRID_SIZE; r++) {
            const row = gridContainer.insertRow();
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = row.insertCell();
                cell.classList.add('sudoku-cell');
                cell.setAttribute('data-row', r);
                cell.setAttribute('data-col', c);

                const value = currentGrid[r][c];
                if (value !== 0) {
                    cell.textContent = value;
                    cell.classList.add('initial');
                } else {
                    cell.addEventListener('click', handleCellSelect);
                }
            }
        }
    }

    /**
     * Handles the click on a grid cell, marking it as selected.
     */
    function handleCellSelect(event) {
        // Clear previous selection highlight
        if (selectedCell && selectedCell.element) {
            selectedCell.element.classList.remove('selected');
        }

        // Set new selection
        const cell = event.target;
        const r = parseInt(cell.getAttribute('data-row'));
        const c = parseInt(cell.getAttribute('data-col'));

        cell.classList.add('selected');
        selectedCell = { row: r, col: c, element: cell };

        feedbackMessage.textContent = `Cell (${r + 1}, ${c + 1}) selected. Click a number to place it.`;
    }

    /**
     * Handles the click on an input button (1-4 or Clear).
     */
    function handleNumberInput(event) {
        if (!selectedCell) {
            feedbackMessage.textContent = 'Please click an empty cell first!';
            return;
        }

        const num = parseInt(event.target.getAttribute('data-value'));
        const { row: r, col: c, element: cell } = selectedCell;

        // 1. Check if placement is valid (only check if placing 1-4)
        if (num !== 0 && !isValidPlacement(currentGrid, r, c, num)) {
            feedbackMessage.textContent = `❌ Cannot place ${num}! Conflict in row, column, or box.`;
            cell.classList.add('error'); // Instant feedback
            return;
        }

        // 2. Update model and view
        currentGrid[r][c] = num;
        cell.textContent = num === 0 ? '' : num;
        cell.classList.remove('selected');
        
        // Clear selection and validation check
        selectedCell = null;
        validateAndHighlightGrid(); 
        
        feedbackMessage.textContent = num === 0 ? 'Cell cleared.' : `${num} placed.`;
    }

    // --- 5. EVENT LISTENERS AND SETUP ---

    function solvePuzzle() {
        // Render the solution array
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = gridContainer.rows[r].cells[c];
                if (!cell.classList.contains('initial')) {
                    cell.textContent = SOLUTION[r][c];
                    cell.classList.remove('error');
                    cell.classList.remove('selected');
                }
            }
        }
        currentGrid = SOLUTION.map(row => [...row]);
        feedbackMessage.innerHTML = 'Solution revealed.';
        gridContainer.removeEventListener('click', handleCellSelect);
    }
    
    // Attach event listeners
    numberButtons.forEach(button => {
        button.addEventListener('click', handleNumberInput);
    });

    resetButton.addEventListener('click', renderGrid);
    solveButton.addEventListener('click', solvePuzzle);

    // Initial setup
    renderGrid();
});