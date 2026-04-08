document.addEventListener('DOMContentLoaded', () => {
    const pieces = document.querySelectorAll('.piece');
    const controlButtons = document.getElementById('piece-control-buttons');
    const winMessage = document.getElementById('win-message');
    let selectedPiece = null;

    // The required state for a solved piece is 'none' (or 'initial')
    const SOLVED_TRANSFORM = 'none'; 

    // --- 1. Piece Selection ---
    pieces.forEach(piece => {
        // Initialize a state property for easier tracking
        piece.dataset.currentTransform = getComputedStyle(piece).transform || 'none';

        piece.addEventListener('click', () => {
            if (selectedPiece) {
                selectedPiece.classList.remove('selected');
            }
            selectedPiece = piece;
            selectedPiece.classList.add('selected');
            controlButtons.classList.remove('hidden');
        });
    });

    // --- 2. Control Button Logic ---
    document.getElementById('rotate-btn').addEventListener('click', () => {
        if (selectedPiece) {
            applyTransform(selectedPiece, 'rotate');
            checkWinCondition();
        }
    });

    document.getElementById('flipX-btn').addEventListener('click', () => {
        if (selectedPiece) {
            applyTransform(selectedPiece, 'flipX');
            checkWinCondition();
        }
    });
    
    document.getElementById('flipY-btn').addEventListener('click', () => {
        if (selectedPiece) {
            applyTransform(selectedPiece, 'flipY');
            checkWinCondition();
        }
    });

    // --- 3. Transform Application Function (CORE LOGIC) ---
    /**
     * Updates the piece's transform based on the current state.
     * This uses *inline styles* to override the initial CSS scramble.
     * Using inline style.transform is simpler than managing many CSS classes.
     */
    function applyTransform(piece, action) {
        let currentTransform = piece.style.transform || piece.dataset.currentTransform;
        let newTransform = '';

        // Simplistic way to track state: Just append the new transform.
        // For a more robust solution, you'd parse the matrix() value.
        // This simple version works well for discrete operations like rotate/flip.
        
        if (action === 'rotate') {
             // Example: Cycle through 0, 90, 180, 270 degrees
             // This simple example just adds a rotation to whatever is already there.
             // For a true puzzle, you'd manage the full rotation state.
             newTransform = currentTransform + ' rotate(90deg)';
        } else if (action === 'flipX') {
             // For simplicity, this assumes a flipX is a toggle
             const isFlippedX = currentTransform.includes('scaleX(-1)');
             newTransform = isFlippedX 
                 ? currentTransform.replace('scaleX(-1)', '')
                 : currentTransform + ' scaleX(-1)';
        } else if (action === 'flipY') {
             const isFlippedY = currentTransform.includes('scaleY(-1)');
             newTransform = isFlippedY 
                 ? currentTransform.replace('scaleY(-1)', '')
                 : currentTransform + ' scaleY(-1)';
        }

        piece.style.transform = newTransform;
        piece.dataset.currentTransform = newTransform; // Update the state tracker
    }


    // --- 4. Win Condition Check (MINIMAL JS) ---
    function checkWinCondition() {
        let allSolved = true;
        pieces.forEach(piece => {
            // Get the computed style, which will be a matrix() string.
            // When a transform is 'none', it resolves to 'matrix(1, 0, 0, 1, 0, 0)'.
            // When *only* the CSS is applied, it will be the scrambled matrix.
            // The goal is to get the final computed matrix() back to the 'none' matrix.

            // The 'style.transform' will be an empty string or 'none' when solved 
            // *if* the player successfully reverts all operations.
            
            // For a robust check: compare the current calculated matrix against the solved matrix.
            // The 'solved' matrix for all pieces is always 'matrix(1, 0, 0, 1, 0, 0)'.
            const currentMatrix = getComputedStyle(piece).transform;

            // This simplified check will only work if the player can undo the initial
            // CSS transforms *exactly* to reach 'transform: none'.
            // A more reliable way: check if the computed matrix is the identity matrix.
            if (currentMatrix !== 'none' && currentMatrix !== 'matrix(1, 0, 0, 1, 0, 0)') {
                 allSolved = false;
            }
        });

        if (allSolved) {
            winMessage.classList.remove('hidden');
            controlButtons.classList.add('hidden');
        } else {
            winMessage.classList.add('hidden');
        }
    }

    // Initial check is needed if we want the game to start with an immediate win check
    // In a real scramble, this will initially return false.
    // We can also call checkWinCondition() after a short delay on load 
    // to ensure all initial CSS transforms are resolved.
    setTimeout(checkWinCondition, 100); 
});