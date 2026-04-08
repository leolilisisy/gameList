// --- 1. DOM Element References ---
const testArea = document.getElementById('test-area');
const headline = document.getElementById('headline');
const instruction = document.getElementById('instruction');
const resultDisplay = document.getElementById('result-display');
const bestTimeDisplay = document.getElementById('best-time');

// --- 2. Game State Variables ---
let testPhase = 'initial'; // 'initial', 'ready', 'go'
let timeoutID; // Stores the ID for the setTimeout that controls the random delay
let startTime; // Time the screen turned green (using Date.now())
let bestTime = localStorage.getItem('bestReactionTime') ? 
               parseInt(localStorage.getItem('bestReactionTime')) : 
               Infinity;

// Update best time display immediately on load
updateBestTimeDisplay();

// --- 3. Core Game Functions ---

// Starts the waiting phase (Screen turns RED)
function startWaitingPhase() {
    testPhase = 'ready';
    
    // 1. Update UI to RED/Ready state
    testArea.classList.remove('initial');
    testArea.classList.add('ready');
    headline.textContent = 'Wait for Green...';
    instruction.textContent = 'Clicking early will restart the test!';
    resultDisplay.textContent = '';
    resultDisplay.classList.remove('critical');

    // 2. Set random delay (e.g., 1.5 to 4.5 seconds)
    const randomDelay = Math.random() * 3000 + 1500; 

    // 3. Set a timeout to switch to the GO phase
    timeoutID = setTimeout(startGoPhase, randomDelay);
}

// Starts the GO phase (Screen turns GREEN)
function startGoPhase() {
    testPhase = 'go';
    
    // 1. Record the start time with high precision
    startTime = Date.now(); 

    // 2. Update UI to GREEN/Go state
    testArea.classList.remove('ready');
    testArea.classList.add('go');
    headline.textContent = 'CLICK NOW!';
    instruction.textContent = 'Measure your speed.';
}

// Handles player interaction (click or key press)
function handleAction() {
    if (testPhase === 'initial') {
        // Start the test
        startWaitingPhase();
    } 
    else if (testPhase === 'ready') {
        // Player clicked too early!
        clearTimeout(timeoutID); // Stop the pending green switch
        endTest('Too soon! You must wait for GREEN.', 0);
    } 
    else if (testPhase === 'go') {
        // Player clicked at the right time. Measure reaction time.
        const endTime = Date.now();
        const reactionTime = endTime - startTime;
        
        // Update best time if current time is better
        if (reactionTime < bestTime) {
            bestTime = reactionTime;
            localStorage.setItem('bestReactionTime', bestTime);
            updateBestTimeDisplay();
            resultDisplay.classList.add('critical');
        }

        endTest(`Your time: ${reactionTime} ms`, reactionTime);
    }
}

// Ends the current test round
function endTest(message, time) {
    testPhase = 'initial'; // Reset state to initial
    
    // Update UI back to Blue/Initial state
    testArea.classList.remove('ready', 'go');
    testArea.classList.add('initial');
    headline.textContent = 'Click to Start Again';
    
    // Display result message
    instruction.textContent = 'Ready for another round?';
    resultDisplay.textContent = message;
}

// Updates the display for the best recorded time
function updateBestTimeDisplay() {
    if (bestTime !== Infinity) {
        bestTimeDisplay.textContent = `Best Time: ${bestTime} ms`;
    } else {
        bestTimeDisplay.textContent = 'Best Time: -- ms';
    }
}

// --- 4. Event Listeners ---

// Main listener for clicks/taps on the test area
testArea.addEventListener('click', handleAction);

// Listener for keyboard events (useful for dedicated users)
document.addEventListener('keydown', (e) => {
    // Only respond to keydown if we are in the GO phase (to prevent accidental early clicks)
    if (e.code === 'Space' || e.code === 'Enter') {
        // Prevent default action (like page scroll or button click)
        e.preventDefault();
        
        // Treat key press like a click if in the GO phase
        if (testPhase === 'go') {
            handleAction();
        }
    }
});