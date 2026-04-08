// --- 1. DOM Element References ---
const numDiceInput = document.getElementById('num-dice');
const diceTypeSelect = document.getElementById('dice-type');
const rollButton = document.getElementById('roll-button');
const rollsDisplay = document.getElementById('rolls-display');
const rollTotalDisplay = document.getElementById('roll-total');

// --- 2. Core Utility Function ---

/**
 * Generates a random integer between 1 and max (inclusive).
 * @param {number} max - The maximum possible roll (e.g., 20 for a D20).
 * @returns {number} The random dice roll result.
 */
function getRandomInt(max) {
    // Math.random() gives [0, 1), multiplying by max gives [0, max).
    // Adding 1 shifts it to [1, max + 1).
    // Math.floor() makes it an integer between 1 and max.
    return Math.floor(Math.random() * max) + 1;
}

// --- 3. Main Roll Function ---

function rollDice() {
    // Get user inputs
    const numDice = parseInt(numDiceInput.value);
    const diceMax = parseInt(diceTypeSelect.value); // e.g., 20 for D20

    // Input validation (should be handled by HTML attributes, but good for safety)
    if (isNaN(numDice) || numDice < 1 || isNaN(diceMax) || diceMax < 4) {
        rollsDisplay.innerHTML = '<p class="instruction">Please enter valid dice quantities and types.</p>';
        rollTotalDisplay.textContent = '--';
        return;
    }

    let totalSum = 0;
    const resultsHtml = [];

    for (let i = 0; i < numDice; i++) {
        // 1. Roll the die
        const rollResult = getRandomInt(diceMax);
        
        // 2. Add to total sum
        totalSum += rollResult;

        // 3. Create HTML element for individual roll display
        const dieHtml = `<div class="die-result">${rollResult}</div>`;
        resultsHtml.push(dieHtml);
    }

    // 4. Update the DOM
    rollsDisplay.innerHTML = resultsHtml.join('');
    rollTotalDisplay.textContent = totalSum;
}

// --- 4. Event Listener and Initialization ---

rollButton.addEventListener('click', rollDice);