document.addEventListener('DOMContentLoaded', () => {
    const targetBox = document.getElementById('target-box');
    const scoreDisplay = document.getElementById('score');
    const accuracyDisplay = document.getElementById('accuracy');
    const feedbackMessage = document.getElementById('feedback-message');
    const instructionMessage = document.getElementById('instruction-message');

    // --- Core Timing and State Variables ---
    const ANIMATION_DURATION_MS = 2500; // Must match CSS --animation-duration (2.5s)
    let score = 0;
    let lastIterationEndTime = performance.now(); // Tracks when the last animation cycle finished
    let requiredHitState = 'start'; // Can be 'start', 'mid', or 'end'
    const HIT_TOLERANCE_MS = 50; // Max deviation allowed (e.g., 50ms)

    // --- Utility Functions ---

    function getTheoreticalHitTime(state) {
        // Calculate the theoretical timestamp when the target state should occur
        let offset = 0;
        if (state === 'start') {
            // Hit at 0% (which is the animation-iteration event)
            offset = 0;
        } else if (state === 'end') {
            // Hit at 100% (which is the animation-end event)
            offset = ANIMATION_DURATION_MS;
        } else if (state === 'mid') {
            // Hit at 50% mark
            offset = ANIMATION_DURATION_MS / 2;
        }
        
        return lastIterationEndTime + offset;
    }

    function updateRequiredState() {
        // Cycle the required hit state to increase complexity
        if (requiredHitState === 'start') {
            requiredHitState = 'end';
            targetBox.className = 'state-end';
            instructionMessage.textContent = "Hit the **SPACEBAR** when the box is on the **RIGHT** side!";
        } else if (requiredHitState === 'end') {
            requiredHitState = 'mid';
            targetBox.className = 'state-mid';
            instructionMessage.textContent = "Hit the **SPACEBAR** when the box is **GREEN** (midpoint)!";
        } else {
            requiredHitState = 'start';
            targetBox.className = 'state-start';
            instructionMessage.textContent = "Hit the **SPACEBAR** when the box is on the **LEFT** side!";
        }
    }


    // --- 1. Player Input Logic (The Challenge) ---
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault(); // Stop scrolling the page
            checkTiming();
        }
    });

    function checkTiming() {
        const playerTime = performance.now();
        const theoreticalTime = getTheoreticalHitTime(requiredHitState);
        const timeDifference = Math.abs(playerTime - theoreticalTime);

        if (timeDifference <= HIT_TOLERANCE_MS) {
            // Success!
            score++;
            scoreDisplay.textContent = score;
            accuracyDisplay.textContent = `${timeDifference.toFixed(2)}ms OFF`;
            
            // Visual/Audio feedback for success
            feedbackMessage.textContent = `PERFECT RHYTHM! (${timeDifference.toFixed(2)}ms off)`;
            feedbackMessage.style.color = 'lime';

            // Advance the required state immediately after a successful hit
            updateRequiredState();

        } else {
            // Failure
            feedbackMessage.textContent = `MISSED! Too far off (${timeDifference.toFixed(2)}ms off)`;
            feedbackMessage.style.color = 'red';
            
            // Optionally, penalize score or pause the game
            // score = Math.max(0, score - 1); // Simple penalty
            scoreDisplay.textContent = score;
        }
    }


    // --- 2. CSS Event Listeners (The Metronome) ---
    
    targetBox.addEventListener('animationiteration', (event) => {
        // This fires when the animation cycle returns to 0% (the 'start' state).
        // Update the reference time for the *next* cycle's calculations.
        lastIterationEndTime = performance.now();
        
        // If the player was supposed to hit the 'start' state but didn't, it's a passive failure.
        if (requiredHitState === 'start') {
            // Since the event already fired, we check for a *previous* unsuccessful check.
            // This is complex, so we'll rely mainly on the user's manual keypress check.
        }
    });

    targetBox.addEventListener('animationend', (event) => {
        // This fires when the animation cycle hits 100% (the 'end' state) in the 'alternate' direction.
        // Update the reference time again.
        lastIterationEndTime = performance.now();
        
        // The animation restarts immediately due to 'infinite', so we rely on this event
        // to reset our timing clock for the next calculation.
    });


    // --- Initialization ---
    targetBox.className = 'state-start'; // Set initial required state and class
    // Start the timing loop by setting the initial reference point
    lastIterationEndTime = performance.now(); 
});