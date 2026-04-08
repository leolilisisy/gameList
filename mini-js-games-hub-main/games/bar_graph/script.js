document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME CONSTANTS & ELEMENTS ---
    const NUM_BARS = 4;
    const MAX_VALUE = 100; // Max data value for scaling
    const CHART_WIDTH = 300;
    const CHART_HEIGHT = 200;
    const BAR_GAP = 10;
    const BAR_WIDTH = (CHART_WIDTH - (NUM_BARS + 1) * BAR_GAP) / NUM_BARS;

    const targetSvg = document.getElementById('target-svg');
    const playerSvg = document.getElementById('player-svg');
    const dataInputs = document.getElementById('data-inputs');
    const checkButton = document.getElementById('check-button');
    const feedbackMessage = document.getElementById('feedback-message');
    const scoreSpan = document.getElementById('score');
    const newPuzzleButton = document.getElementById('new-puzzle-button');

    let targetData = []; // The secret solution
    let score = 0;

    // --- 2. CORE FUNCTIONS ---

    /**
     * Converts a data value to the correct pixel height for the SVG chart.
     */
    function scaleValueToHeight(value) {
        // Simple linear scaling: (value / MAX_VALUE) * CHART_HEIGHT
        return (value / MAX_VALUE) * CHART_HEIGHT;
    }

    /**
     * Renders a bar chart into the specified SVG element.
     * @param {SVGElement} svg - The SVG container to draw into.
     * @param {Array<number>} data - The array of data values.
     * @param {string} className - The CSS class for the bars.
     */
    function renderChart(svg, data, className) {
        svg.innerHTML = ''; // Clear previous bars

        data.forEach((value, index) => {
            const barHeight = scaleValueToHeight(value);
            const xPos = (index + 1) * BAR_GAP + index * BAR_WIDTH;

            const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            rect.setAttribute('x', xPos);
            rect.setAttribute('y', 0); // SVG bars start at y=0 (bottom of the inverted chart)
            rect.setAttribute('width', BAR_WIDTH);
            rect.setAttribute('height', barHeight);
            rect.classList.add(className);
            rect.setAttribute('data-value', value); // Store the raw value
            
            svg.appendChild(rect);
        });
    }
    
    /**
     * Generates a new random puzzle.
     */
    function generateNewPuzzle() {
        // 1. Generate random, visible target data (1 to 100)
        targetData = [];
        for (let i = 0; i < NUM_BARS; i++) {
            // Generate a number between 10 and 95
            targetData.push(Math.floor(Math.random() * 86) + 10);
        }

        // 2. Render the static Target Chart
        renderChart(targetSvg, targetData, 'target-bar');
        
        // 3. Reset Player Input and Chart
        dataInputs.innerHTML = '';
        renderChart(playerSvg, Array(NUM_BARS).fill(0), 'player-bar'); // Start with zero height bars
        
        // 4. Generate Input Fields
        for (let i = 0; i < NUM_BARS; i++) {
            const group = document.createElement('div');
            group.classList.add('input-group');
            group.innerHTML = `
                <label for="data-${i}">Bar ${i + 1}</label>
                <input type="number" id="data-${i}" data-index="${i}" min="0" max="${MAX_VALUE}" value="">
            `;
            dataInputs.appendChild(group);
        }

        // 5. Attach Input Listeners (Input event is key for real-time update)
        const inputs = dataInputs.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', updatePlayerChart);
            input.addEventListener('change', updatePlayerChart); // For blur/completion
        });
        
        checkButton.disabled = true;
        feedbackMessage.textContent = 'A new target is set! Input your values to match it.';
    }

    /**
     * Updates the player's chart in real-time based on their input.
     */
    function updatePlayerChart() {
        const playerInputData = [];
        let allValid = true;

        dataInputs.querySelectorAll('input').forEach(input => {
            let value = parseInt(input.value);
            
            if (isNaN(value) || value < 0 || value > MAX_VALUE) {
                value = 0; // Treat invalid/empty input as zero for rendering
                allValid = false;
            } else {
                input.style.borderColor = '#2ecc71'; // Green border for valid
            }
            playerInputData.push(value);
        });

        // Re-render the player's chart with the new data
        renderChart(playerSvg, playerInputData, 'player-bar');

        // Check if all fields are valid before enabling the check button
        checkButton.disabled = !allValid;
    }

    /**
     * Checks the player's input against the target data for a win condition.
     */
    function checkMatch() {
        const playerInputData = [];
        dataInputs.querySelectorAll('input').forEach(input => {
            playerInputData.push(parseInt(input.value));
        });

        const isMatch = playerInputData.every((value, index) => value === targetData[index]);

        if (isMatch) {
            score++;
            scoreSpan.textContent = score;
            feedbackMessage.innerHTML = '🎉 **PERFECT MATCH!** You got it!';
            feedbackMessage.style.color = '#2ecc71';
            checkButton.disabled = true; // Disable check until new puzzle starts
        } else {
            feedbackMessage.innerHTML = '❌ **NO MATCH.** Keep adjusting the values.';
            feedbackMessage.style.color = '#e74c3c';
        }
    }

    // --- 3. EVENT LISTENERS ---
    
    checkButton.addEventListener('click', checkMatch);
    newPuzzleButton.addEventListener('click', generateNewPuzzle);

    // Initial game start
    generateNewPuzzle();
});