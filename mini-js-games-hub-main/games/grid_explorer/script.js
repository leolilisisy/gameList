document.addEventListener('DOMContentLoaded', () => {
    const gridMap = document.getElementById('grid-map');
    const player = document.getElementById('player');
    const key = document.getElementById('key');
    const messageDisplay = document.getElementById('message');
    const GRID_DIMENSION = 4;
    const TOTAL_TILES = GRID_DIMENSION * GRID_DIMENSION;
    
    // Convert NodeList to Array for easier iteration
    let tiles = Array.from(document.querySelectorAll('.tile'));

    // --- 1. Utility Functions ---

    /**
     * Retrieves the current visual order of a tile.
     * It uses the inline style.order if set, otherwise falls back to the data-order (for initial state).
     */
    function getCurrentOrder(tile) {
        // The inline style.order (set by JS) takes precedence
        if (tile.style.order) {
            return parseInt(tile.style.order);
        }
        // Fallback to the initial setup from HTML data attribute (or CSS class)
        return parseInt(tile.dataset.order);
    }
    
    /**
     * Finds the tile currently occupying a specific visual order slot.
     */
    function getTileByOrder(order) {
        return tiles.find(tile => getCurrentOrder(tile) === order);
    }

    /**
     * Checks if two tile orders are adjacent (horizontally or vertically).
     */
    function isAdjacent(orderA, orderB) {
        const diff = Math.abs(orderA - orderB);
        
        // 1. Check for immediate horizontal adjacency (order difference of 1)
        const isHorizontal = diff === 1 && (Math.ceil(orderA / GRID_DIMENSION) === Math.ceil(orderB / GRID_DIMENSION));
        
        // 2. Check for vertical adjacency (order difference of GRID_DIMENSION)
        const isVertical = diff === GRID_DIMENSION;
        
        return isHorizontal || isVertical;
    }

    /**
     * CORE GAME MECHANIC: Swaps the order of two tiles.
     * This makes them visually swap positions on the grid.
     */
    function swapTiles(tileA, tileB) {
        const orderA = getCurrentOrder(tileA);
        const orderB = getCurrentOrder(tileB);
        
        // Apply the swap using inline styles to override the CSS class
        tileA.style.order = orderB;
        tileB.style.order = orderA;
    }

    // --- 2. Game Logic ---

    function movePlayer(targetOrder) {
        const targetTile = getTileByOrder(targetOrder);
        
        if (!targetTile) return; // Should not happen

        const playerOrder = getCurrentOrder(player);

        if (!isAdjacent(playerOrder, targetOrder)) {
            messageDisplay.textContent = "Cannot move there. Must target an adjacent empty space.";
            return;
        }

        // --- PUSH/SWAP LOGIC ---

        if (targetTile.classList.contains('empty')) {
            // Standard Player Movement: Swap player and empty tile
            swapTiles(player, targetTile);
            messageDisplay.textContent = "Swapped player and empty space.";
        } else if (targetTile.classList.contains('key') && playerCanPush(playerOrder, targetOrder)) {
            // Puzzle Mechanic: If the player moves toward the key, they try to push it.
            
            const nextOrder = getOrderInPushDirection(playerOrder, targetOrder);
            const nextTile = getTileByOrder(nextOrder);
            
            if (nextTile && nextTile.classList.contains('empty')) {
                // Pushing is successful: Swap Key with the Empty space, then Player with Key's old spot (the Empty space).
                swapTiles(targetTile, nextTile);
                swapTiles(player, targetTile); // Player moves into the key's previous spot
                messageDisplay.textContent = "Pushed the key one space!";
            } else {
                messageDisplay.textContent = "The key cannot be pushed that way (space is blocked).";
                return;
            }
        } else {
            messageDisplay.textContent = "That space is a wall or a blocked exit.";
            return;
        }

        checkWinCondition();
    }

    // Helper for push logic
    function playerCanPush(playerOrder, targetOrder) {
        return targetOrder === getOrderInPushDirection(playerOrder, targetOrder);
    }

    // Helper for push logic
    function getOrderInPushDirection(playerOrder, targetOrder) {
        const diff = targetOrder - playerOrder;
        
        // Calculate the order of the tile *beyond* the target (the push destination)
        return targetOrder + diff;
    }


    function checkWinCondition() {
        const keyOrder = getCurrentOrder(key);
        const exitOrder = getCurrentOrder(document.getElementById('exit'));

        if (keyOrder === exitOrder) {
            messageDisplay.textContent = "🎉 PUZZLE SOLVED! The Key is in the Exit! 🎉";
            document.removeEventListener('keydown', handleKeyPress);
        }
    }


    // --- 3. Input Handling (Arrow Keys) ---

    function handleKeyPress(event) {
        const currentOrder = getCurrentOrder(player);
        let targetOrder = null;
        
        // Determine the target order based on the key pressed
        switch (event.key) {
            case 'ArrowUp':
                targetOrder = currentOrder - GRID_DIMENSION;
                break;
            case 'ArrowDown':
                targetOrder = currentOrder + GRID_DIMENSION;
                break;
            case 'ArrowLeft':
                // Check boundary: cannot move left from column 1 (orders 1, 5, 9, 13)
                if ((currentOrder - 1) % GRID_DIMENSION !== 0) {
                    targetOrder = currentOrder - 1;
                }
                break;
            case 'ArrowRight':
                 // Check boundary: cannot move right from column 4 (orders 4, 8, 12, 16)
                if (currentOrder % GRID_DIMENSION !== 0) {
                    targetOrder = currentOrder + 1;
                }
                break;
            default:
                return;
        }

        if (targetOrder !== null && targetOrder >= 1 && targetOrder <= TOTAL_TILES) {
            movePlayer(targetOrder);
        }
    }

    document.addEventListener('keydown', handleKeyPress);

    // Initial game message
    messageDisplay.textContent = "Find the Key and guide it to the Exit!";
});