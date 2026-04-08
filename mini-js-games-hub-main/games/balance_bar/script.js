document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME CONSTANTS & ELEMENTS ---
    const beam = document.getElementById('beam');
    const leftPan = document.getElementById('left-pan');
    const rightPan = document.getElementById('right-pan');
    const inventory = document.getElementById('inventory');
    const checkButton = document.getElementById('check-button');
    const resetButton = document.getElementById('reset-button');
    const goalMomentDisplay = document.getElementById('goal-moment');
    const differenceDisplay = document.getElementById('difference-display');
    const feedbackMessage = document.getElementById('feedback-message');
    
    // Physical constants
    const FULCRUM_DISTANCE = 1; // Distance of the pans from the fulcrum (unitless, since they are equidistant)
    const BALANCE_TOLERANCE = 0.5; // Acceptable difference for a "perfect" balance
    const MAX_TILT_DEGREES = 15; // Max visual tilt angle

    // Game state
    let inventoryState = {}; // Tracks available objects {weight: count}
    let currentMoments = { left: 0, right: 0 };
    let goalMoment = 0; // The target difference between left and right moments

    // --- 2. INITIALIZATION ---

    /**
     * Initializes the game state, inventory, and goal.
     */
    function initGame() {
        // Set Goal (e.g., balance both sides to 0, which means net moment is 0)
        goalMoment = 0;
        goalMomentDisplay.textContent = goalMoment;

        // Reset display
        resetScale();
        
        // Populate initial inventory state from HTML
        inventory.querySelectorAll('.object').forEach(obj => {
            const weight = parseInt(obj.getAttribute('data-weight'));
            const count = parseInt(obj.getAttribute('data-count'));
            inventoryState[weight] = count;
            // Update initial text display
            obj.textContent = `${weight}kg (x${count})`;
            obj.classList.remove('used');
            obj.draggable = true;
        });

        checkButton.disabled = false;
        feedbackMessage.textContent = 'Drag objects onto the scale. Goal: Balance the moments!';
    }

    /**
     * Resets all objects from the scale and updates the inventory/display.
     */
    function resetScale() {
        // Move placed objects back to inventory (virtually)
        [...leftPan.children, ...rightPan.children].forEach(obj => {
            const weight = parseInt(obj.getAttribute('data-weight'));
            inventoryState[weight]++;
            obj.remove();
        });

        // Update inventory display
        inventory.querySelectorAll('.object').forEach(obj => {
            const weight = parseInt(obj.getAttribute('data-weight'));
            obj.textContent = `${weight}kg (x${inventoryState[weight]})`;
            obj.classList.remove('used');
            obj.draggable = true;
        });

        // Reset calculations and visual
        currentMoments = { left: 0, right: 0 };
        updateScaleAndStatus();
    }

    // --- 3. PHYSICS & VISUAL FUNCTIONS ---

    /**
     * Calculates the total moment (torque) for one side of the scale.
     */
    function calculateTotalMoment(panElement) {
        let totalMoment = 0;
        
        // For simplicity, all objects are assumed to be placed at the center of the pan (distance = FULCRUM_DISTANCE)
        panElement.querySelectorAll('.object-placed').forEach(obj => {
            const weight = parseInt(obj.getAttribute('data-weight'));
            // Moment = Weight * Distance
            totalMoment += weight * FULCRUM_DISTANCE;
        });
        return totalMoment;
    }

    /**
     * Updates the total moment, tilt angle, and status displays.
     */
    function updateScaleAndStatus() {
        // 1. Calculate Moments
        currentMoments.left = calculateTotalMoment(leftPan);
        currentMoments.right = calculateTotalMoment(rightPan);
        
        // 2. Calculate Net Moment and Difference
        const netMoment = currentMoments.right - currentMoments.left; // Right positive, Left negative
        const difference = Math.abs(netMoment - goalMoment);

        // 3. Update Status Display
        differenceDisplay.textContent = `${difference.toFixed(2)}`;
        differenceDisplay.style.color = difference <= BALANCE_TOLERANCE ? '#2ecc71' : '#e74c3c';
        
        // 4. Update Visual Tilt
        // Calculate tilt degree based on the net moment difference
        // We scale the net moment (e.g., -100 to 100) to the max tilt angle (-MAX_TILT to MAX_TILT)
        const maxExpectedMoment = 25 * FULCRUM_DISTANCE * 6; // Max possible object weight * FULCRUM_DISTANCE
        const tiltRatio = netMoment / maxExpectedMoment;
        const tiltDegree = tiltRatio * MAX_TILT_DEGREES;
        
        // Apply CSS Transform
        beam.style.transform = `rotate(${tiltDegree}deg)`;
        
        // If balanced, show success message
        if (difference <= BALANCE_TOLERANCE && difference !== 0) {
            feedbackMessage.textContent = "✅ Balanced! Moments match!";
        } else if (difference !== 0) {
            feedbackMessage.textContent = "Keep trying! Moment on the right is " + currentMoments.right + ", left is " + currentMoments.left + ".";
        }
    }

    // --- 4. DRAG AND DROP HANDLERS ---
    
    // Variable to hold the cloned object currently being dragged
    let draggedObjectClone = null;

    inventory.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('object')) {
            const weight = parseInt(e.target.getAttribute('data-weight'));
            
            if (inventoryState[weight] > 0) {
                // Create a clone for the drag operation
                draggedObjectClone = e.target.cloneNode(true);
                draggedObjectClone.classList.add('object-placed');
                draggedObjectClone.draggable = true;
                e.dataTransfer.setData('text/weight', weight);
                e.dataTransfer.setData('text/originalId', e.target.id); // Not used here, but useful for complex inventory
                
                e.target.classList.add('dragging'); // Apply visual drag style to original
            } else {
                 e.preventDefault(); // Stop drag if count is zero
            }
        }
    });

    inventory.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('object')) {
            e.target.classList.remove('dragging');
        }
    });
    
    [leftPan, rightPan].forEach(pan => {
        pan.addEventListener('dragover', (e) => {
            e.preventDefault(); // Required to allow dropping
            pan.style.borderColor = '#4CAF50'; // Visual feedback
        });

        pan.addEventListener('dragleave', (e) => {
            pan.style.borderColor = '#666'; // Reset border
        });

        pan.addEventListener('drop', (e) => {
            e.preventDefault();
            pan.style.borderColor = '#666'; // Reset border
            
            const weight = parseInt(e.dataTransfer.getData('text/weight'));
            
            if (inventoryState[weight] > 0) {
                // 1. Place the object clone
                pan.appendChild(draggedObjectClone);

                // 2. Update inventory state
                inventoryState[weight]--;
                
                // 3. Update original inventory display
                const originalObject = inventory.querySelector(`.object[data-weight="${weight}"]`);
                if (originalObject) {
                    originalObject.textContent = `${weight}kg (x${inventoryState[weight]})`;
                    if (inventoryState[weight] === 0) {
                        originalObject.classList.add('used');
                        originalObject.draggable = false;
                    }
                }
                
                // 4. Recalculate and update visual
                updateScaleAndStatus();
            }
            draggedObjectClone = null;
        });
    });

    // --- 5. EVENT LISTENERS ---
    
    checkButton.addEventListener('click', () => {
        const netMoment = currentMoments.right - currentMoments.left;
        const difference = Math.abs(netMoment - goalMoment);
        
        if (difference <= BALANCE_TOLERANCE) {
            feedbackMessage.textContent = `🏆 PERFECT BALANCE! Net Moment: ${netMoment.toFixed(2)}.`;
        } else {
            feedbackMessage.textContent = `❌ NOT BALANCED. Difference is too high: ${difference.toFixed(2)}.`;
        }
    });

    resetButton.addEventListener('click', initGame); // Resetting the scale is the same as starting a new round in this simple implementation

    // Initial game setup
    initGame();
});