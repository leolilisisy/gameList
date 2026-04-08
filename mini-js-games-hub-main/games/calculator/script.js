document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME DATA ---
    const puzzleData = {
        target: 42,
        startNumbers: [5, 10, 3, 2],
        numButtons: [] // Will hold DOM references to number buttons
    };
    
    // --- 2. GAME STATE VARIABLES ---
    let currentValue = 0;
    let operationHistory = "START";
    let isAwaitingNumber = true; // True if the user should press a number next
    let numbersUsed = {}; // Tracks which numbers have been used in the calculation
    let gameWon = false;

    // --- 3. DOM Elements ---
    const targetNumberDisplay = document.getElementById('target-number');
    const currentValueDisplay = document.getElementById('current-value');
    const historyDisplay = document.getElementById('operation-history');
    const calculatorGrid = document.getElementById('calculator-grid');
    const feedbackMessage = document.getElementById('feedback-message');
    const mathButtons = document.querySelectorAll('.op-math');

    // --- 4. CORE FUNCTIONS ---

    /**
     * Updates the UI displays based on the current state.
     */
    function updateDisplay() {
        currentValueDisplay.textContent = currentValue;
        historyDisplay.textContent = operationHistory;
        
        // Check for Win Condition
        if (currentValue === puzzleData.target && !gameWon) {
            gameWon = true;
            feedbackMessage.textContent = '🥳 Success! You hit the target!';
            feedbackMessage.classList.add('win');
            disableAllButtons();
        }
    }

    /**
     * Sets up the initial puzzle state and generates number buttons.
     */
    function initGame() {
        // Reset state
        currentValue = 0;
        operationHistory = "START";
        isAwaitingNumber = true;
        numbersUsed = {};
        gameWon = false;
        
        targetNumberDisplay.textContent = puzzleData.target;
        feedbackMessage.textContent = 'Use the numbers and operations to reach the target!';
        feedbackMessage.classList.remove('win', 'lose');
        
        // Enable all buttons
        enableAllButtons();

        // Dynamically create number buttons (must be done only once)
        if (puzzleData.numButtons.length === 0) {
            puzzleData.startNumbers.forEach((num, index) => {
                const button = document.createElement('button');
                button.classList.add('num-button');
                button.textContent = num;
                button.setAttribute('data-num', num);
                button.setAttribute('data-index', index);
                
                // Find the index of the first op-button and insert before it
                const firstOpButton = calculatorGrid.querySelector('.op-button');
                calculatorGrid.insertBefore(button, firstOpButton);
                
                puzzleData.numButtons.push(button);
                button.addEventListener('click', handleNumberClick);
            });
        }
        
        // Reset button states
        puzzleData.numButtons.forEach(btn => btn.disabled = false);
        mathButtons.forEach(btn => btn.disabled = true);
        
        updateDisplay();
    }

    /**
     * Handles clicks on the starting number buttons.
     */
    function handleNumberClick(event) {
        if (!isAwaitingNumber || gameWon) return;

        const button = event.target;
        const num = parseFloat(button.getAttribute('data-num'));
        const index = button.getAttribute('data-index');

        // Check if this is the very first number
        if (operationHistory === "START") {
            currentValue = num;
            operationHistory = `${num}`;
        } else {
            // Apply the operation (the last character in history is the operator)
            const operator = operationHistory.slice(-1);
            
            // Perform calculation
            try {
                switch (operator) {
                    case '+':
                        currentValue += num;
                        break;
                    case '-':
                        currentValue -= num;
                        break;
                    case '*':
                        currentValue *= num;
                        break;
                    case '/':
                        if (num === 0) throw new Error("Division by zero");
                        currentValue /= num;
                        break;
                }
                // Ensure result is manageable (e.g., handle floats)
                currentValue = Math.round(currentValue * 100000) / 100000;
                
                // Update history
                operationHistory += `${num}`;
            } catch (error) {
                feedbackMessage.textContent = `Error: ${error.message}. Starting over.`;
                feedbackMessage.classList.add('lose');
                setTimeout(initGame, 2000);
                return;
            }
        }

        // Mark number as used and update state
        numbersUsed[index] = true;
        button.disabled = true;
        isAwaitingNumber = false;
        
        // Enable math operators
        mathButtons.forEach(btn => btn.disabled = false);

        updateDisplay();
    }

    /**
     * Handles clicks on the operation buttons (+, -, *, /).
     */
    function handleOperationClick(event) {
        if (isAwaitingNumber || gameWon) return;

        const operator = event.target.getAttribute('data-op');
        
        if (operator) {
            operationHistory += operator;
            isAwaitingNumber = true; // Now awaiting the next number
            
            // Disable math operators until a number is pressed
            mathButtons.forEach(btn => btn.disabled = true);

        } else if (event.target.getAttribute('data-action') === 'clear') {
            // Clear only the last number/operator, or reset entirely if only one value
            handleClear();
            return; // Don't proceed to updateDisplay immediately
        } else if (event.target.getAttribute('data-action') === 'reset') {
            initGame();
            return;
        }

        updateDisplay();
    }
    
    /**
     * Custom clear logic (simplified for this puzzle).
     * Since this is a chain, C acts like a partial undo.
     */
    function handleClear() {
        // Simple full reset for now due to complex undo required for chain logic
        initGame();
    }

    /**
     * Disables all number and math buttons.
     */
    function disableAllButtons() {
        puzzleData.numButtons.forEach(btn => btn.disabled = true);
        mathButtons.forEach(btn => btn.disabled = true);
        document.querySelectorAll('.op-button').forEach(btn => btn.disabled = true);
    }
    
    /**
     * Enables all relevant buttons for the start of a round.
     */
    function enableAllButtons() {
        document.querySelectorAll('.op-button').forEach(btn => btn.disabled = false);
    }

    // --- 5. EVENT LISTENERS ---
    
    // Attach event listeners to all operation buttons
    document.querySelectorAll('.op-button').forEach(button => {
        button.addEventListener('click', handleOperationClick);
    });

    // Start the game when the page loads
    initGame();
});