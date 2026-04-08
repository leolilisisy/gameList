document.addEventListener('DOMContentLoaded', () => {
    const targetContainer = document.getElementById('target-container');
    const messageDisplay = document.getElementById('game-message');
    const checkButton = document.getElementById('check-button');

    // Control elements and their state management
    const controls = {
        blur: { element: document.getElementById('blur-slider'), display: document.getElementById('blur-val'), unit: 'px', value: 0 },
        invert: { element: document.getElementById('invert-slider'), display: document.getElementById('invert-val'), unit: '%', value: 0 },
        hue: { element: document.getElementById('hue-rotate-slider'), display: document.getElementById('hue-rotate-val'), unit: 'deg', value: 0 },
        grayscale: { element: document.getElementById('grayscale-slider'), display: document.getElementById('grayscale-val'), unit: '%', value: 0 }
    };

    // --- 1. Initial Scramble Definition ---
    // These are the hidden values the player MUST cancel out.
    const SCRAMBLE_FILTERS = {
        blur: 5,           // Inverse is 0
        invert: 100,       // Inverse is 100 (since 100% + 100% = 0%)
        hue: 200,          // Inverse is -200deg (or 160deg)
        grayscale: 80      // Inverse is 0, but to cancel, player must match the initial level
    };

    /**
     * Applies the initial, complex filter chain to obscure the image.
     */
    function applyInitialScramble() {
        const scrambleString = `
            blur(${SCRAMBLE_FILTERS.blur}px) 
            invert(${SCRAMBLE_FILTERS.invert}%) 
            hue-rotate(${SCRAMBLE_FILTERS.hue}deg) 
            grayscale(${SCRAMBLE_FILTERS.grayscale}%)
        `;
        targetContainer.style.filter = scrambleString;
        messageDisplay.textContent = "The image is scrambled. Begin clearance!";
    }

    // --- 2. Player Interaction Logic ---

    /**
     * Dynamically builds the combined filter string from all player controls.
     * The player's filters are applied *after* the initial scramble in the CSS engine,
     * so the full effect is the result of compounding operations.
     */
    function updateCombinedFilter() {
        // Start with the initial SCRAMBLE filter values
        let filterString = `
            blur(${SCRAMBLE_FILTERS.blur}px)
            invert(${SCRAMBLE_FILTERS.invert}%)
            hue-rotate(${SCRAMBLE_FILTERS.hue}deg)
            grayscale(${SCRAMBLE_FILTERS.grayscale}%)
        `;
        
        // Append the player's CLEARANCE filters. Order matters!
        filterString += `
            blur(${controls.blur.value}${controls.blur.unit}) 
            invert(${controls.invert.value}${controls.invert.unit}) 
            hue-rotate(${controls.hue.value}${controls.hue.unit}) 
            grayscale(${controls.grayscale.value}${controls.grayscale.unit})
        `;

        targetContainer.style.filter = filterString.trim();
    }

    // Attach listeners to all sliders
    for (const key in controls) {
        const control = controls[key];
        
        // Initialize display value
        control.display.textContent = control.value + control.unit;

        control.element.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            control.value = value;
            control.display.textContent = value + control.unit;
            
            // Re-render the combined filter immediately on input
            updateCombinedFilter();
        });
    }

    // --- 3. Win Condition Check (The Core Math) ---

    function checkWinCondition() {
        // The check must confirm that the player's filters *perfectly* cancel the scramble.
        
        // 1. Blur: Inverse of blur(N) is blur(0). Player's blur must be 0.
        const isBlurCleared = controls.blur.value === 0;

        // 2. Invert: Inverse of invert(100) is invert(100). (100+100 = 200. CSS clips this to 0% effect).
        // Since we are applying *two* invert filters, the player must set their slider to 100%.
        const isInvertCleared = controls.invert.value === SCRAMBLE_FILTERS.invert;

        // 3. Hue Rotate: Inverse of hue-rotate(N) is hue-rotate(360 - N).
        // The scramble hue is 200. The inverse is 160 (or -200, but we use 0-360 scale).
        const inverseHue = 360 - SCRAMBLE_FILTERS.hue;
        const isHueCleared = controls.hue.value === inverseHue;

        // 4. Grayscale: Inverse of grayscale(N) is grayscale(0). 
        // The initial scramble applies grayscale(80). To cancel it, the player must apply 
        // the remaining 20% to reach 100%, and then 0% to remove it. This is tricky.
        // A simpler puzzle: require the player to set grayscale to 0 to make the total effect 0.
        const isGrayscaleCleared = controls.grayscale.value === 0;
        
        if (isBlurCleared && isInvertCleared && isHueCleared && isGrayscaleCleared) {
            messageDisplay.textContent = "🏆 CONGRATULATIONS! Filter chain successfully cleared! 🏆";
            messageDisplay.style.color = 'lime';
            checkButton.disabled = true;
        } else {
            messageDisplay.textContent = "Filters are not perfectly canceled. Keep adjusting!";
            messageDisplay.style.color = 'yellow';
        }
    }

    checkButton.addEventListener('click', checkWinCondition);

    // Initial setup
    applyInitialScramble();
    updateCombinedFilter(); // Apply initial player state (all 0s) on top of scramble
});