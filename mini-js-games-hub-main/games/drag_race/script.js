document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements & Constants ---
    const vehicle = document.getElementById('vehicle');
    const raceTrack = document.getElementById('race-track');
    const startButton = document.getElementById('start-button');
    const speedDisplay = document.getElementById('speed-display');
    const timeDisplay = document.getElementById('time-display');
    const feedbackMessage = document.getElementById('feedback-message');

    const TRACK_WIDTH = raceTrack.clientWidth;
    const VEHICLE_SIZE = vehicle.clientWidth;
    const FINISH_LINE = TRACK_WIDTH - VEHICLE_SIZE; // Target vehicle's left position
    const MAX_SPEED_CAP = 100; // Cap displayed speed for readability
    const ACCELERATION_MULTIPLIER = 0.5; // How quickly mouse speed translates to vehicle progress

    // --- 2. Game State Variables ---
    let gameActive = false;
    let isDragging = false;
    let vehicleProgress = 0; // 0 to FINISH_LINE
    
    // Mouse tracking for velocity calculation
    let lastMouseX = 0;
    let lastTime = 0;
    
    // Timing variables
    let raceStartTime = 0;
    let timerInterval = null;

    // --- 3. CORE LOGIC FUNCTIONS ---

    /**
     * Resets all game parameters for a new race.
     */
    function resetGame() {
        gameActive = false;
        isDragging = false;
        vehicleProgress = 0;
        raceStartTime = 0;
        clearInterval(timerInterval);
        
        vehicle.style.transform = `translateX(0px)`;
        speedDisplay.textContent = 0;
        timeDisplay.textContent = '0.00';
        startButton.textContent = 'START RACE';
        startButton.disabled = false;
        feedbackMessage.textContent = 'Drag rapidly to accelerate!';
    }

    /**
     * Starts the race and the timer.
     */
    function startRace() {
        resetGame(); // Ensure clean start
        gameActive = true;
        startButton.disabled = true;
        
        raceStartTime = performance.now();
        
        // Start the timer display
        timerInterval = setInterval(() => {
            if (gameActive) {
                const elapsed = (performance.now() - raceStartTime) / 1000;
                timeDisplay.textContent = elapsed.toFixed(2);
            }
        }, 50); // Update time every 50ms
        
        feedbackMessage.textContent = 'GO! Drag left and right!';
    }

    /**
     * Calculates the horizontal mouse speed and accelerates the vehicle.
     * @param {MouseEvent} e - The mousemove event.
     */
    function calculateSpeed(e) {
        if (!gameActive || !isDragging) return;

        const currentTime = performance.now();
        
        // --- Velocity Calculation ---
        // Distance traveled by mouse (delta X)
        const dx = Math.abs(e.clientX - lastMouseX); 
        // Time elapsed since last check (delta T)
        const dt = currentTime - lastTime; 

        if (dt > 0) {
            // Speed = Distance / Time
            // We multiply by a large factor (e.g., 100) to get a visible speed number
            const currentSpeed = (dx / dt) * 100; 
            
            // Map the mouse speed to vehicle acceleration
            // Only apply acceleration if the mouse is moving quickly
            if (currentSpeed > 5) {
                // Apply a portion of the mouse movement to the vehicle's progress
                const progressToAdd = dx * ACCELERATION_MULTIPLIER;
                vehicleProgress = Math.min(FINISH_LINE, vehicleProgress + progressToAdd);
            }

            // Update display speed (Cap the display)
            speedDisplay.textContent = Math.min(MAX_SPEED_CAP, currentSpeed.toFixed(0));

            // Update state variables for the next frame calculation
            lastMouseX = e.clientX;
            lastTime = currentTime;
            
            updateVehiclePosition();
            checkWinCondition();
        }
    }

    /**
     * Applies the current progress to the vehicle's visual position.
     */
    function updateVehiclePosition() {
        // Use translateX for smoother animation performance
        vehicle.style.transform = `translateX(${vehicleProgress}px)`;
    }

    /**
     * Checks if the vehicle has crossed the finish line.
     */
    function checkWinCondition() {
        if (vehicleProgress >= FINISH_LINE) {
            endRace();
        }
    }

    /**
     * Stops the race and displays the final time.
     */
    function endRace() {
        if (!gameActive) return;
        gameActive = false;
        clearInterval(timerInterval);

        const finalTime = timeDisplay.textContent;
        feedbackMessage.innerHTML = `🏆 **FINISH!** Your time is **${finalTime}s**!`;
        feedbackMessage.style.color = '#2ecc71';
        
        startButton.textContent = 'PLAY AGAIN';
        startButton.disabled = false;
    }

    // --- 4. EVENT LISTENERS ---

    startButton.addEventListener('click', startRace);

    // 1. Mouse Down: Start the dragging state and initialize coordinates
    raceTrack.addEventListener('mousedown', (e) => {
        if (!gameActive) return;
        isDragging = true;
        lastMouseX = e.clientX;
        lastTime = performance.now();
    });

    // 2. Mouse Move: Calculate speed and progress
    raceTrack.addEventListener('mousemove', calculateSpeed);

    // 3. Mouse Up/Out: Stop the dragging state
    window.addEventListener('mouseup', () => {
        isDragging = false;
        speedDisplay.textContent = 0;
    });

    // Initial setup to display the track dimensions
    resetGame();
});