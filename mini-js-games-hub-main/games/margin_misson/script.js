document.addEventListener('DOMContentLoaded', () => {
    const playerBall = document.getElementById('player-ball');
    const goal = document.getElementById('goal');
    const obstacles = document.querySelectorAll('.obstacle');
    const gameMessage = document.getElementById('game-message');
    const resetButton = document.getElementById('reset-button');
    const gameContainer = document.getElementById('game-container');

    // Store initial CSS values for reset
    const initialStyles = {
        marginTop: '10px',
        marginRight: '10px',
        marginBottom: '10px',
        marginLeft: '10px',
        padding: '10px',
        borderWidth: '5px'
    };

    // --- 1. Control Handling ---
    const controls = {
        'margin-top': { prop: 'marginTop', suffix: 'px', element: document.getElementById('margin-top'), display: document.getElementById('margin-top-val') },
        'margin-right': { prop: 'marginRight', suffix: 'px', element: document.getElementById('margin-right'), display: document.getElementById('margin-right-val') },
        'margin-bottom': { prop: 'marginBottom', suffix: 'px', element: document.getElementById('margin-bottom'), display: document.getElementById('margin-bottom-val') },
        'margin-left': { prop: 'marginLeft', suffix: 'px', element: document.getElementById('margin-left'), display: document.getElementById('margin-left-val') },
        'padding': { prop: 'padding', suffix: 'px', element: document.getElementById('padding'), display: document.getElementById('padding-val') },
        'border-width': { prop: 'borderWidth', suffix: 'px', element: document.getElementById('border-width'), display: document.getElementById('border-width-val') }
    };

    function updateBallStyle(controlId) {
        const control = controls[controlId];
        const value = control.element.value;
        playerBall.style[control.prop] = value + control.suffix;
        control.display.textContent = value + control.suffix;
        checkGameStatus(); // Re-check game status after any style change
    }

    // Attach event listeners to all range inputs
    for (const key in controls) {
        controls[key].element.addEventListener('input', () => updateBallStyle(key));
    }

    // --- 2. Game Logic (Collision Detection) ---

    function getRect(element) {
        // getBoundingClientRect gives the element's size and position relative to the viewport.
        // We'll adjust it to be relative to the game-container for simpler collision logic.
        const rect = element.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();
        return {
            left: rect.left - containerRect.left,
            top: rect.top - containerRect.top,
            right: rect.right - containerRect.left,
            bottom: rect.bottom - containerRect.top,
            width: rect.width,
            height: rect.height
        };
    }

    function checkCollision(rect1, rect2) {
        return rect1.left < rect2.right &&
               rect1.right > rect2.left &&
               rect1.top < rect2.bottom &&
               rect1.bottom > rect2.top;
    }

    function checkGameStatus() {
        // Ensure styles are applied before measuring
        requestAnimationFrame(() => {
            const playerRect = getRect(playerBall);
            const goalRect = getRect(goal);
            const containerRect = getRect(gameContainer);

            // Check Win Condition
            if (checkCollision(playerRect, goalRect)) {
                gameMessage.textContent = "🏆 Mission Accomplished! You reached the goal! 🏆";
                playerBall.style.backgroundColor = 'lime';
                disableControls();
                return; // Game over, no need to check collisions or boundaries
            }

            // Check for Wall Collisions (outside game container)
            if (playerRect.left < 0 || playerRect.right > containerRect.width ||
                playerRect.top < 0 || playerRect.bottom > containerRect.height) {
                gameMessage.textContent = "💥 Out of Bounds! You hit the container wall! 💥";
                playerBall.style.backgroundColor = 'red';
                disableControls();
                return;
            }

            // Check for Obstacle Collisions
            for (const obstacle of obstacles) {
                const obstacleRect = getRect(obstacle);
                if (checkCollision(playerRect, obstacleRect)) {
                    gameMessage.textContent = "💥 CRASH! You hit an obstacle! 💥";
                    playerBall.style.backgroundColor = 'red';
                    disableControls();
                    return;
                }
            }

            // If no win/loss conditions met
            gameMessage.textContent = "Guide the ball to the goal!";
            playerBall.style.backgroundColor = '#2196F3'; // Revert to normal color
            enableControls();
        });
    }

    function disableControls() {
        for (const key in controls) {
            controls[key].element.disabled = true;
        }
        resetButton.disabled = true; // Optionally disable reset until game reset
    }

    function enableControls() {
        for (const key in controls) {
            controls[key].element.disabled = false;
        }
        resetButton.disabled = false;
    }


    // --- 3. Reset Functionality ---
    resetButton.addEventListener('click', () => {
        // Apply initial styles
        for (const prop in initialStyles) {
            playerBall.style[prop] = initialStyles[prop];
            // Also update the sliders and their display values
            const control = Object.values(controls).find(c => c.prop === prop);
            if (control) {
                control.element.value = parseInt(initialStyles[prop]);
                control.display.textContent = initialStyles[prop];
            }
        }
        // Reset player color
        playerBall.style.backgroundColor = '#2196F3';
        enableControls();
        checkGameStatus(); // Re-evaluate game status after reset
    });

    // Initial setup
    resetButton.click(); // Apply initial values and perform first check
});