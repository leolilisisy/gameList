document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME CONSTANTS & ELEMENTS ---
    const GRID_SIZE = 4;
    const TOTAL_PIECES = GRID_SIZE * GRID_SIZE; // 16 pieces
    const PUZZLE_WIDTH = 400;
    const PIECE_SIZE = PUZZLE_WIDTH / GRID_SIZE;

    const jigsawGrid = document.getElementById('jigsaw-grid');
    const shuffleButton = document.getElementById('shuffle-button');
    const movesDisplay = document.getElementById('moves-display');
    const timeDisplay = document.getElementById('time-display');
    const feedbackMessage = document.getElementById('feedback-message');

    // --- 2. GAME STATE VARIABLES ---
    let pieces = []; // Array of piece elements in their current DOM order
    let selectedPiece = null; // The first piece clicked
    let moves = 0;
    let timer = 0;
    let timerInterval = null;
    let gameActive = false;

    // --- 3. CORE LOGIC ---

    /**
     * Calculates the CSS background-position for a piece based on its solved index (0-15).
     */
    function calculateBackgroundPosition(solvedIndex) {
        const row = Math.floor(solvedIndex / GRID_SIZE);
        const col = solvedIndex % GRID_SIZE;
        // Position is negative because the background is moved opposite to the piece's position
        const x = -col * PIECE_SIZE;
        const y = -row * PIECE_SIZE;
        return `${x}px ${y}px`;
    }

    /**
     * Shuffles an array in place (Fisher-Yates).
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Renders the pieces onto the grid based on the current order in the 'pieces' array.
     */
    function renderPieces() {
        jigsawGrid.innerHTML = ''; // Clear existing DOM
        pieces.forEach(piece => {
            jigsawGrid.appendChild(piece);
        });
    }

    /**
     * Swaps two piece elements, both visually and logically in the 'pieces' array.
     */
    function swapPieces(piece1, piece2) {
        if (piece1 === piece2) return;

        const index1 = pieces.indexOf(piece1);
        const index2 = pieces.indexOf(piece2);

        if (index1 !== -1 && index2 !== -1) {
            // Swap in the pieces array (logical state)
            [pieces[index1], pieces[index2]] = [pieces[index2], pieces[index1]];
            
            // Re-render the grid to reflect the swap
            renderPieces();

            moves++;
            movesDisplay.textContent = moves;
            
            // Check win condition after every swap
            if (checkWin()) {
                endGame(true);
            }
        }
    }
    
    /**
     * Checks if the current arrangement of pieces matches the solved state.
     */
    function checkWin() {
        // The puzzle is solved if the data-solved-index of each piece matches its current DOM position (index i)
        for (let i = 0; i < TOTAL_PIECES; i++) {
            const solvedIndex = parseInt(pieces[i].getAttribute('data-solved-index'));
            if (solvedIndex !== i) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Handles the click event on a piece for selection/swapping.
     */
    function handlePieceClick(event) {
        if (!gameActive) return;

        const clickedPiece = event.target;

        if (selectedPiece === clickedPiece) {
            // Deselect the same piece
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
            feedbackMessage.textContent = 'Piece deselected.';
        } else if (selectedPiece) {
            // Second click: Swap
            selectedPiece.classList.remove('selected');
            swapPieces(selectedPiece, clickedPiece);
            selectedPiece = null;
        } else {
            // First click: Select
            selectedPiece = clickedPiece;
            selectedPiece.classList.add('selected');
            feedbackMessage.textContent = 'Piece selected. Click another to swap.';
        }
    }

    // --- 4. GAME FLOW ---

    /**
     * Initializes the puzzle pieces in their correct order and attaches handlers.
     */
    function createPieces() {
        pieces = [];
        jigsawGrid.innerHTML = '';
        
        for (let i = 0; i < TOTAL_PIECES; i++) {
            const piece = document.createElement('div');
            piece.classList.add('jigsaw-piece');
            piece.setAttribute('data-solved-index', i); // Stores the correct position
            piece.style.backgroundPosition = calculateBackgroundPosition(i);
            piece.addEventListener('click', handlePieceClick);
            pieces.push(piece);
        }
    }
    
    /**
     * Starts the game session (shuffles and starts timer).
     */
    function startGame() {
        // Stop and reset timer
        clearInterval(timerInterval);
        moves = 0;
        timer = 0;
        movesDisplay.textContent = 0;
        timeDisplay.textContent = 0;
        selectedPiece = null;
        gameActive = true;
        
        // Ensure pieces are created
        if (pieces.length === 0) createPieces();
        
        // Shuffle (but ensure it's not solved initially)
        do {
            shuffleArray(pieces);
        } while (checkWin());
        
        renderPieces();
        feedbackMessage.textContent = 'Puzzle shuffled! Start clicking to swap.';
        
        // Start Timer
        timerInterval = setInterval(() => {
            timer++;
            timeDisplay.textContent = timer;
        }, 1000);
    }
    
    /**
     * Ends the game and stops the timer.
     */
    function endGame(win) {
        clearInterval(timerInterval);
        gameActive = false;
        
        if (win) {
            feedbackMessage.innerHTML = `🎉 **PUZZLE SOLVED!** Total Moves: ${moves}, Time: ${timer}s.`;
            feedbackMessage.style.color = '#2ecc71';
            jigsawGrid.style.border = '5px solid #2ecc71';
        }
    }

    // --- 5. EVENT LISTENERS AND INITIAL SETUP ---
    
    shuffleButton.addEventListener('click', startGame);

    // Initial creation of pieces (in solved order)
    createPieces();
    renderPieces();
    
    // Initial message
    feedbackMessage.textContent = 'Press "Shuffle & Restart" to begin the puzzle!';
});