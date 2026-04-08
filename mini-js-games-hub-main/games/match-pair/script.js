document.addEventListener('DOMContentLoaded', () => {
    // Select all draggable items and drop zones
    const dragItems = document.querySelectorAll('.drag-item');
    const dropZones = document.querySelectorAll('.drop-zone');
    const messageElement = document.getElementById('message');
    const resetButton = document.getElementById('reset-button');
    let matchedCount = 0; // Tracks the number of successfully matched items
    const totalItems = dragItems.length;

    /**
     * DRAG EVENT HANDLERS
     */

    dragItems.forEach(item => {
        // 1. dragstart: When dragging begins
        item.addEventListener('dragstart', (e) => {
            // Set the data being dragged (the item's ID and its correct category)
            e.dataTransfer.setData('text/plain', e.target.id);
            e.dataTransfer.setData('text/category', e.target.getAttribute('data-category'));

            // Add a class for visual feedback
            setTimeout(() => {
                e.target.classList.add('dragging');
            }, 0);
        });

        // 2. dragend: When dragging stops (dropped or cancelled)
        item.addEventListener('dragend', (e) => {
            // Remove the visual feedback class
            e.target.classList.remove('dragging');
        });
    });

    /**
     * DROP ZONE EVENT HANDLERS
     */

    dropZones.forEach(zone => {
        // 1. dragover: Allows an element to be dropped (must prevent default)
        zone.addEventListener('dragover', (e) => {
            e.preventDefault(); // This is crucial!
            e.target.classList.add('drag-over');
        });

        // 2. dragleave: Removes hover feedback when leaving the zone
        zone.addEventListener('dragleave', (e) => {
            e.target.classList.remove('drag-over');
        });

        // 3. drop: When the item is dropped into the zone
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');

            // Retrieve the data set in dragstart
            const draggedItemId = e.dataTransfer.getData('text/plain');
            const draggedItemCategory = e.dataTransfer.getData('text/category');
            const draggedElement = document.getElementById(draggedItemId);

            const dropZoneAccept = e.target.getAttribute('data-accept');

            // CHECK FOR CORRECT MATCH
            if (draggedItemCategory === dropZoneAccept) {
                // Correct Match
                e.target.appendChild(draggedElement); // Move the item to the drop zone
                draggedElement.draggable = false;    // Make it non-draggable once placed
                draggedElement.classList.add('matched-item'); // Apply success style

                matchedCount++;
                updateMessage(`🎉 Correct! ${draggedElement.textContent.trim()} matched with ${e.target.textContent.trim()}.`);

                // Check if all items are matched
                if (matchedCount === totalItems) {
                    updateMessage('🏆 Puzzle Complete! You matched all pairs!');
                }

            } else {
                // Incorrect Match
                updateMessage(`❌ Try again! The item belongs to the **${draggedItemCategory.toUpperCase()}** category.`);
            }
        });
    });

    /**
     * UTILITY FUNCTIONS
     */

    function updateMessage(msg) {
        messageElement.innerHTML = msg;
    }

    resetButton.addEventListener('click', () => {
        // Simple page reload to reset the state
        window.location.reload();
    });

});