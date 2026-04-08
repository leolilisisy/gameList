document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const minesLeftDisplay = document.getElementById('mines-left');
    const resetButton = document.getElementById('reset-button');
    const gameMessage = document.getElementById('game-message');

    // --- Game Configuration ---
    const BOARD_SIZE = 10;
    const NUM_MINES = 10;
    let board = [];
    let isGameOver = false;
    let cellsUncovered = 0;

    // --- Utility Functions ---

    // 1. Function to initialize and build the game board HTML
    function createBoard() {
        // Clear previous board
        gameBoard.innerHTML = '';
        board = [];
        isGameOver = false;
        cellsUncovered = 0;
        gameMessage.textContent = '';
        
        // Set up CSS Grid layout for the board
        gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
        gameBoard.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 1fr)`;
        
        // Initialize the array that holds the game logic
        for (let y = 0; y < BOARD_SIZE; y++) {
            board[y] = [];
            for (let x = 0; x < BOARD_SIZE; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Set initial state for logic
                board[y][x] = {
                    isMine: false,
                    isFlagged: false,
                    isUncovered: false,
                    neighborMines: 0,
                    element: cell
                };
                
                // Add click listeners (left-click for uncovering, right-click for flagging)
                cell.addEventListener('click', () => handleCellClick(x, y));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault(); // Prevent default right-click menu
                    handleCellFlag(x, y);
                });
                
                gameBoard.appendChild(cell);
            }
        }
        
        placeMines();
        calculateNeighborMines();
        updateMinesLeftDisplay();
    }

    // 2. Function to randomly place mines on the board
    function placeMines() {
        // Implementation for randomly placing NUM_MINES in the board array
        // ... (This is where your main logic development starts)
    }

    // 3. Function to calculate the number of adjacent mines for each non-mine cell
    function calculateNeighborMines() {
        // Implementation for looping through all cells and calculating neighborMines
        // ...
    }

    // 4. Function to handle left-click (uncovering the cell)
    function handleCellClick(x, y) {
        if (isGameOver) return;
        
        // Main game logic for uncovering a cell
        // ...
        
        checkWin();
    }

    // 5. Function to handle right-click (flagging the cell)
    function handleCellFlag(x, y) {
        if (isGameOver) return;
        
        // Logic for toggling a flag
        // ...
        
        updateMinesLeftDisplay();
    }

    // 6. Function to update the mines left counter
    function updateMinesLeftDisplay() {
        // Logic to count unflagged mines and update minesLeftDisplay.textContent
        // ...
    }
    
    // 7. Function to check if the player has won
    function checkWin() {
        // Logic to check if all non-mine cells are uncovered
        // ...
    }
    
    // 8. Function to handle game loss
    function gameOver() {
        isGameOver = true;
        gameMessage.textContent = "Game Over! You hit a mine.";
        // ... (Reveal all mines)
    }

    // --- Event Listeners ---
    resetButton.addEventListener('click', createBoard);

    // --- Start the game! ---
    createBoard();
});