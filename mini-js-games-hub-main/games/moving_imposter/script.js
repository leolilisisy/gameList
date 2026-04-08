document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements & Constants ---
    const playingField = document.getElementById('playing-field');
    const startButton = document.getElementById('start-button');
    const scoreDisplay = document.getElementById('score-display');
    const timerDisplay = document.getElementById('timer-display');
    const feedbackMessage = document.getElementById('feedback-message');

    const FIELD_SIZE = 500;
    const OBJECT_SIZE = 25;
    const NUM_OBJECTS = 8;
    const TIME_LIMIT_SECONDS = 10;
    const INITIAL_SPEED = 0.5; // Base speed in pixels per frame
    const IMPOSTER_DIFFERENCE = 0.3; // Imposter moves 0.3px/frame faster/slower

    // --- 2. GAME STATE VARIABLES ---
    let objects = []; // Array of object states {id, x, y, vx, vy, isImposter}
    let imposterId = null;
    let score = 0;
    let timeLeft = TIME_LIMIT_SECONDS;
    let gameActive = false;
    let animationFrameId = null;
    let timerInterval = null;

    // --- 3. CORE LOGIC FUNCTIONS ---

    /**
     * Generates an array of moving objects and designates one as the imposter.
     */
    function initializeObjects() {
        objects = [];
        playingField.innerHTML = ''; // Clear existing objects
        imposterId = Math.floor(Math.random() * NUM_OBJECTS);

        for (let i = 0; i < NUM_OBJECTS; i++) {
            const isImposter = (i === imposterId);
            
            // Randomize starting position
            const x = Math.random() * (FIELD_SIZE - OBJECT_SIZE);
            const y = Math.random() * (FIELD_SIZE - OBJECT_SIZE);

            // Randomize initial velocity components
            let vx = (Math.random() - 0.5) * 2 * INITIAL_SPEED;
            let vy = (Math.random() - 0.5) * 2 * INITIAL_SPEED;

            if (isImposter) {
                // Apply the subtle difference (e.g., slightly faster speed)
                vx *= (1 + IMPOSTER_DIFFERENCE);
                vy *= (1 + IMPOSTER_DIFFERENCE);
            }
            
            objects.push({
                id: i,
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                isImposter: isImposter,
                element: createObjectElement(i)
            });
        }
    }

    /**
     * Creates and attaches a DOM element for one moving object.
     */
    function createObjectElement(id) {
        const element = document.createElement('div');
        element.classList.add('game-object');
        element.setAttribute('data-id', id);
        element.addEventListener('click', handleObjectClick);
        playingField.appendChild(element);
        return element;
    }

    /**
     * The main animation loop. Updates positions based on velocity and handles boundaries.
     */
    function gameLoop() {
        if (!gameActive) return;

        objects.forEach(obj => {
            // Update position
            obj.x += obj.vx;
            obj.y += obj.vy;

            // Boundary checks: Reverse velocity if hitting a wall
            if (obj.x <= 0 || obj.x >= FIELD_SIZE - OBJECT_SIZE) {
                obj.vx *= -1;
                // Keep within bounds
                obj.x = Math.min(Math.max(0, obj.x), FIELD_SIZE - OBJECT_SIZE); 
            }
            if (obj.y <= 0 || obj.y >= FIELD_SIZE - OBJECT_SIZE) {
                obj.vy *= -1;
                obj.y = Math.min(Math.max(0, obj.y), FIELD_SIZE - OBJECT_SIZE); 
            }

            // Apply position to DOM using CSS transform for performance
            obj.element.style.transform = `translate(${obj.x}px, ${obj.y}px)`;
        });

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // --- 4. GAME FLOW ---

    /**
     * Starts the game timer.
     */
    function startTimer() {
        timeLeft = TIME_LIMIT_SECONDS;
        timerDisplay.textContent = timeLeft;

        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;

            if (timeLeft <= 0) {
                endGame(false); // Time's up!
            }
        }, 1000);
    }

    /**
     * Starts a new game round.
     */
    function startRound() {
        // Reset state
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (timerInterval) clearInterval(timerInterval);
        gameActive = true;
        startButton.disabled = true;
        
        initializeObjects();
        startTimer();
        
        feedbackMessage.textContent = `Find the difference! ${TIME_LIMIT_SECONDS} seconds to click the imposter.`;
        
        // Start animation loop
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    /**
     * Handles the player's click on any object.
     */
    function handleObjectClick(event) {
        if (!gameActive) return;
        
        const clickedId = parseInt(event.target.getAttribute('data-id'));
        const clickedObject = objects.find(obj => obj.id === clickedId);

        if (clickedObject.isImposter) {
            // Correct guess!
            score++;
            scoreDisplay.textContent = score;
            clickedObject.element.classList.add('imposter', 'correct-guess');
            endGame(true);
        } else {
            // Incorrect guess!
            clickedObject.element.classList.add('wrong-guess');
            feedbackMessage.textContent = '❌ Incorrect! Guess again quickly.';
        }
    }

    /**
     * Stops the game loop and updates scores/status.
     */
    function endGame(win) {
        gameActive = false;
        cancelAnimationFrame(animationFrameId);
        clearInterval(timerInterval);
        startButton.disabled = false;
        startButton.textContent = 'NEXT ROUND';

        if (win) {
            feedbackMessage.innerHTML = `🎉 **SUCCESS!** Time remaining: ${timeLeft}s.`;
            feedbackMessage.style.color = '#2ecc71';
        } else {
            feedbackMessage.innerHTML = `⏰ **TIME UP!** The imposter was object #${imposterId}.`;
            feedbackMessage.style.color = '#e74c3c';
            // Show the imposter
            const imposterElement = objects.find(obj => obj.isImposter).element;
            imposterElement.style.backgroundColor = '#f1c40f'; // Highlight the correct one
        }
    }

    // --- 5. EVENT LISTENERS AND INITIAL SETUP ---

    startButton.addEventListener('click', startRound);

    // Initial setup
    initializeObjects();
    renderGrid();
    function renderGrid() {
        objects.forEach(obj => {
            obj.element.style.transform = `translate(${obj.x}px, ${obj.y}px)`;
        });
    }
});