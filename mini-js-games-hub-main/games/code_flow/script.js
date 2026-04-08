document.addEventListener('DOMContentLoaded', () => {
    const animatedBox = document.getElementById('animated-box');
    const lineIndicator = document.getElementById('line-indicator');
    const rhythmCue = document.getElementById('rhythm-cue');
    const feedbackMessage = document.getElementById('feedback-message');
    const accuracyDisplay = document.getElementById('accuracy-display');
    const scoreDisplay = document.getElementById('score-display');
    
    // Expose element for the visual code in the HTML
    window.animatedBox = animatedBox; 

    // --- 1. Game State and Rhythm Engine ---
    
    let isPaused = false; // State flag for the while loop trick
    let rhythmScore = 0;
    const BPM = 120; // Beats Per Minute
    const BEAT_INTERVAL_MS = 60000 / BPM; // 500ms for 120 BPM
    const BEAT_TOLERANCE_MS = 80; // Allowable deviation for a successful hit
    
    let lastBeatTime = performance.now();
    let nextBreakpointTime = lastBeatTime + BEAT_INTERVAL_MS;

    function startRhythmEngine() {
        // Use a simple setInterval as a master clock
        setInterval(() => {
            const currentTime = performance.now();
            
            // Check if it's time for a beat cue
            if (currentTime >= nextBreakpointTime - 100) { // Cue starts 100ms before beat
                rhythmCue.style.opacity = 0.5;
            }
            
            if (currentTime >= nextBreakpointTime) {
                // Flash the cue on the beat
                rhythmCue.style.opacity = 1.0;
                setTimeout(() => rhythmCue.style.opacity = 0, 50); // Flash off quickly
                
                // Set the next target time
                lastBeatTime = nextBreakpointTime;
                nextBreakpointTime += BEAT_INTERVAL_MS;
            }
        }, 10); // Check frequently
    }

    // --- 2. The Breakpoint Trick ---

    function simulateBreakpoint() {
        // Line 3 is the breakpoint location
        lineIndicator.style.top = '5em'; 
        
        // This is the core trick: Entering a busy-wait loop
        while (isPaused) {
            // Wait for the player's next input to set isPaused = false
            // This loop effectively freezes JavaScript execution (including RAF)
            // It will also temporarily block the main thread.
        }
        
        // Execution resumes here: Move past the breakpoint
        lineIndicator.style.top = '6.5em'; 
    }

    // --- 3. Animation and Game Flow ---

    let animationTime = 0;
    
    function animateElement(timestamp) {
        // Line 1: Timer logic (simplified)
        animationTime += 0.01;
        
        // Line 2: The loop starts here
        lineIndicator.style.top = '3.5em'; 
        
        // Line 3: Check for pause/breakpoint
        if (isPaused) {
            simulateBreakpoint(); // Enters the busy-wait loop
        }
        
        // Execution resumes/continues here
        
        // Line 4: Calculate movement
        const x = Math.sin(animationTime) * 100;
        
        // Line 5: Apply visual transform
        animatedBox.style.transform = `translateX(${x}px)`;
        
        // Line 6 & 7: Loop continuation
        requestAnimationFrame(animateElement);
    }

    // --- 4. Player Input & Timing Check ---

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            const pressTime = performance.now();
            
            if (!isPaused) {
                // Player is setting the BREAKPOINT (PAUSE)
                checkHitTiming(pressTime);
                isPaused = true;
                
                // Visual feedback that the flow is stopped
                document.body.classList.add('flow-error'); 
                feedbackMessage.textContent = "Code Paused (Breakpoint Set)... Press SPACE to resume!";

            } else {
                // Player is clearing the BREAKPOINT (RESUME)
                isPaused = false;
                document.body.classList.remove('flow-error');
                feedbackMessage.textContent = "Code Resumed. Execution continues.";
            }
        }
    });

    function checkHitTiming(pressTime) {
        const timeDifference = pressTime - lastBeatTime;
        // Calculate difference relative to the target beat time
        let accuracy = timeDifference % BEAT_INTERVAL_MS; 
        
        // Normalize accuracy to be between -BEAT_INTERVAL_MS/2 and +BEAT_INTERVAL_MS/2
        if (accuracy > BEAT_INTERVAL_MS / 2) {
            accuracy -= BEAT_INTERVAL_MS;
        }

        const absAccuracy = Math.abs(accuracy);

        if (absAccuracy <= BEAT_TOLERANCE_MS) {
            // Success!
            rhythmScore++;
            scoreDisplay.textContent = rhythmScore;
            accuracyDisplay.textContent = `${absAccuracy.toFixed(2)}ms OFF`;
            
            // Set the next target time based on the successful hit to maintain the rhythm lock
            nextBreakpointTime = pressTime + BEAT_INTERVAL_MS - (pressTime % BEAT_INTERVAL_MS);

        } else {
            // Failure!
            accuracyDisplay.textContent = `FAILED! ${absAccuracy.toFixed(2)}ms OFF`;
            
            // If the player fails, throw the timing off for the next beat
            nextBreakpointTime = pressTime + BEAT_INTERVAL_MS; // Just move to the next interval
        }
    }


    // --- Initialization ---
    startRhythmEngine();
    animateElement(performance.now()); // Start the animation loop
});