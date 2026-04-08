// --- 1. Level Data ---
const levels = [
    {
        id: 1,
        title: "The Invisible Button",
        description: "The button should be visible! It's currently blending into the background. Fix its **color** property.",
        targetId: "level-target",
        initialClass: "broken-level-1",
        // The *required* resulting CSS properties/values for success
        requiredStyles: {
            color: 'rgb(248, 248, 242)', // Must change to a visible color
            backgroundColor: 'rgb(80, 250, 123)' // Must change background
        },
        successMessage: "Great job! The button is now visible and clickable."
    },
    {
        id: 2,
        title: "Misaligned Text",
        description: "The paragraph text is stuck to the right. Use a **text-align** property to center it.",
        targetId: "level-target",
        initialClass: "broken-level-2",
        requiredStyles: {
            textAlign: 'center', // The computed style must be 'center'
        },
        successMessage: "Perfect! The text is now centered and readable."
    },
    {
        id: 3,
        title: "The Squished Image",
        description: "The image is squished! Use the **height** property to make it taller (300px).",
        targetId: "level-target",
        initialClass: "broken-level-3",
        requiredStyles: {
            height: '300px', // The computed style must be '300px'
        },
        successMessage: "Resizing complete! The image now has the correct aspect ratio."
    }
    // Add more levels here...
];

// --- 2. Game State Variables ---
let currentLevelIndex = 0;
let currentLevelData = levels[currentLevelIndex];

// --- 3. DOM Elements ---
const targetElement = document.getElementById('level-target');
const cssInput = document.getElementById('css-input');
const applyButton = document.getElementById('apply-css');
const resetButton = document.getElementById('reset-level');
const nextLevelButton = document.getElementById('next-level');
const messageBox = document.getElementById('message-box');
const levelTitle = document.getElementById('level-title');
const levelDescription = document.getElementById('level-description');

// --- 4. Core Functions ---

/**
 * Loads the current level's data and resets the target element.
 */
function loadLevel() {
    currentLevelData = levels[currentLevelIndex];
    if (!currentLevelData) {
        // End of game scenario
        alert("🎉 Congratulations! You have completed all levels!");
        levelTitle.textContent = "Game Over!";
        levelDescription.textContent = "You are a true CSS Inspector!";
        nextLevelButton.classList.add('hidden');
        applyButton.disabled = true;
        resetButton.disabled = true;
        cssInput.disabled = true;
        return;
    }

    // Update level info
    levelTitle.textContent = `Level ${currentLevelData.id}: ${currentLevelData.title}`;
    levelDescription.innerHTML = currentLevelData.description; // Use innerHTML for bolding
    
    // Reset and apply initial broken state
    targetElement.removeAttribute('style'); // Clear any previous inline styles
    targetElement.className = `target-element ${currentLevelData.initialClass}`;
    targetElement.id = currentLevelData.targetId;
    targetElement.textContent = `Target Element for Level ${currentLevelData.id}`; // Simple placeholder content

    // UI cleanup
    cssInput.value = '';
    messageBox.innerHTML = `<p>Level ${currentLevelData.id} loaded. Ready to debug.</p>`;
    nextLevelButton.classList.add('hidden');
    applyButton.disabled = false;
    resetButton.disabled = false;
    cssInput.disabled = false;
}

/**
 * Applies the player's CSS input to the target element.
 */
function applyCSS() {
    const playerInput = cssInput.value.trim();

    if (!playerInput) {
        messageBox.innerHTML = '<p class="error">Please enter some CSS code!</p>';
        return;
    }

    try {
        // Dynamically apply the new CSS. The 'cssText' method is robust.
        // It's important to use += to append to any existing inline style (from previous, valid inputs).
        targetElement.style.cssText += playerInput;
        messageBox.innerHTML = `<p>CSS applied: <code>${playerInput}</code></p>`;
        
        // Check for success after applying the CSS
        checkForSuccess();

    } catch (e) {
        messageBox.innerHTML = `<p class="error">Invalid CSS Syntax! Check your semicolons (;) and colons (:).</p>`;
    }
}

/**
 * Checks the *computed* visual state against the required solution.
 * This is the core of the robust logic.
 */
function checkForSuccess() {
    // Get the element's currently applied/computed styles
    const computedStyle = window.getComputedStyle(targetElement);
    const required = currentLevelData.requiredStyles;
    let isSuccess = true;

    // Iterate through all required properties
    for (const prop in required) {
        // Normalize the computed style value (e.g., trim, check for common inconsistencies)
        const computedValue = computedStyle[prop].toString().trim().toLowerCase();
        const requiredValue = required[prop].toString().trim().toLowerCase();
        
        // Simple string comparison for the target property
        if (computedValue !== requiredValue) {
            isSuccess = false;
            break; // Fail fast
        }
    }

    // Handle Success/Failure
    if (isSuccess) {
        messageBox.innerHTML = `<p class="success">✅ ${currentLevelData.successMessage}</p>`;
        nextLevelButton.classList.remove('hidden');
        applyButton.disabled = true;
        cssInput.disabled = true;
    } else {
        // Only show a failure message if they didn't succeed
        messageBox.innerHTML += '<p class="error">Not quite right. The display is still broken. Try another property or value!</p>';
    }
}

/**
 * Advances the game to the next level.
 */
function nextLevel() {
    currentLevelIndex++;
    loadLevel();
}

/**
 * Resets the current level's target element to its initial broken state.
 */
function resetLevel() {
    loadLevel();
}


// --- 5. Event Listeners ---

applyButton.addEventListener('click', applyCSS);
resetButton.addEventListener('click', resetLevel);
nextLevelButton.addEventListener('click', nextLevel);

// Allow pressing Enter to apply CSS (must prevent default form submit if in a form)
cssInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Shift+Enter for new line
        e.preventDefault();
        applyCSS();
    }
});

// --- 6. Initialization ---
loadLevel();