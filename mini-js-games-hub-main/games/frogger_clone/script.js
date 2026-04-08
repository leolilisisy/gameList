const gameGrid = document.getElementById('game-grid');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const messageDisplay = document.getElementById('message');
const startButton = document.getElementById('start-button');

// Game constants (must match CSS)
const GRID_SIZE = 10; // 10x10 grid
const CELL_SIZE = 50; // 50px cell size
const GAME_WIDTH = GRID_SIZE * CELL_SIZE;

// Lane definitions from bottom (index 0) to top (index 9)
// 'R' = Road, 'S' = Safe/Start/Finish, 'L' = River/Log
const LANE_TYPES = ['S', 'R', 'R', 'R', 'L', 'L', 'R', 'R', 'R', 'S'];

// Obstacle configurations per lane (speed in px per game tick, width in grid cells)
const LANE_CONFIGS = [
    null, // Safe zone
    { type: 'car', speed: 2, width: 2, direction: 'left' },
    { type: 'car', speed: -3, width: 1, direction: 'right' },
    { type: 'car', speed: 1.5, width: 3, direction: 'left' },
    { type: 'log', speed: 1, width: 3, direction: 'right' },
    { type: 'log', speed: -2, width: 2, direction: 'left' },
    { type: 'car', speed: 3, width: 1, direction: 'right' },
    { type: 'car', speed: -1, width: 2, direction: 'left' },
    { type: 'car', speed: 2.5, width: 1, direction: 'right' },
    null // Finish zone
];

let playerPos = { x: 0, y: 0 }; // Grid coordinates (0,0 is bottom-left)
let score = 0;
let isGameRunning = false;
let gameLoopInterval;
let obstacleList = [];

// --- Game Setup ---

/**
 * Initializes the game board by creating the lanes.
 */
function createLanes() {
    gameGrid.innerHTML = ''; // Clear existing content
    obstacleList = [];

    // Create lanes from top to bottom (index 9 down to 0)
    for (let i = GRID_SIZE - 1; i >= 0; i--) {
        const lane = document.createElement('div');
        lane.classList.add('lane');
        lane.style.top = `${(GRID_SIZE - 1 - i) * CELL_SIZE}px`; // Position from top
        lane.dataset.index = i; // Grid index (0 is bottom)

        // Assign CSS class based on type
        if (LANE_TYPES[i] === 'S') {
            lane.classList.add('start-finish-lane');
        } else if (LANE_TYPES[i] === 'R') {
            lane.classList.add('road-lane');
            createObstacles(lane, LANE_CONFIGS[i], i);
        } else if (LANE_TYPES[i] === 'L') {
            lane.classList.add('river-lane');
            createObstacles(lane, LANE_CONFIGS[i], i);
        }

        gameGrid.appendChild(lane);
    }
    gameGrid.appendChild(player); // Ensure player is on top
}

/**
 * Creates and positions initial obstacles in a lane.
 */
function createObstacles(lane, config, laneIndex) {
    if (!config) return;

    const numLanes = GAME_WIDTH / CELL_SIZE; // Always 10
    const obstacleSpacing = 5; // Spacing between obstacles (in cells)
    
    let currentX = 0;

    // Create a pattern of obstacles
    while (currentX < numLanes + obstacleSpacing) {
        if (Math.random() < 0.6) { // 60% chance to place an obstacle
            const obstacle = document.createElement('div');
            obstacle.classList.add('obstacle', config.type);
            obstacle.style.width = `${config.width * CELL_SIZE}px`;
            
            // Randomize starting position based on direction
            let startX = config.direction === 'right' ? 
                (currentX * CELL_SIZE) - GAME_WIDTH - (config.width * CELL_SIZE) : 
                (currentX * CELL_SIZE);
            
            obstacle.style.left = `${startX}px`;
            obstacle.style.top = '0'; // Obstacles are positioned relative to their lane
            
            // Store properties for game logic
            obstacle.dataset.speed = config.speed;
            obstacle.dataset.type = config.type;
            obstacle.dataset.lane = laneIndex;
            
            lane.appendChild(obstacle);
            obstacleList.push(obstacle);
        }
        currentX += config.width + obstacleSpacing;
    }
}

// --- Player Movement ---

/**
 * Updates the player's position based on grid coordinates.
 */
function updatePlayerPosition() {
    const top = (GRID_SIZE - 1 - playerPos.y) * CELL_SIZE;
    const left = playerPos.x * CELL_SIZE;
    player.style.transform = `translate(${left}px, ${top}px)`;
}

/**
 * Handles player movement input.
 */
function handleMove(e) {
    if (!isGameRunning) return;

    let newX = playerPos.x;
    let newY = playerPos.y;

    switch (e.key) {
        case 'ArrowUp':
            newY++;
            break;
        case 'ArrowDown':
            newY--;
            break;
        case 'ArrowLeft':
            newX--;
            break;
        case 'ArrowRight':
            newX++;
            break;
    }

    // Check boundaries
    if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
        playerPos.x = newX;
        playerPos.y = newY;
        updatePlayerPosition();
        checkGameStatus();
    }
}

// --- Game Loop and Collision ---

/**
 * Main game loop: moves obstacles and checks for collisions.
 */
function gameLoop() {
    if (!isGameRunning) return;

    // 1. Move Obstacles
    obstacleList.forEach(obstacle => {
        let currentLeft = parseFloat(obstacle.style.left);
        const speed = parseFloat(obstacle.dataset.speed);
        
        // Wrap obstacles around the grid
        if (speed > 0) { // Moving Right
            if (currentLeft >= GAME_WIDTH) {
                currentLeft = -(parseFloat(obstacle.style.width)); // Reset to far left
            }
        } else { // Moving Left
            if (currentLeft <= -(parseFloat(obstacle.style.width))) {
                currentLeft = GAME_WIDTH; // Reset to far right
            }
        }
        
        obstacle.style.left = `${currentLeft + speed}px`;
    });

    // 2. Check Collisions (and carry the player on logs)
    checkCollision();
}

/**
 * Checks for collisions with obstacles in the player's current lane.
 */
function checkCollision() {
    const laneType = LANE_TYPES[playerPos.y];
    let isSafe = true; // Assume safe until collision detected

    if (laneType === 'R') {
        // Road Lane: Collision with Car = Death
        obstacleList.filter(o => parseInt(o.dataset.lane) === playerPos.y && o.dataset.type === 'car').forEach(car => {
            const carRect = car.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();

            // Simple AABB collision check
            if (playerRect.left < carRect.right &&
                playerRect.right > carRect.left &&
                playerRect.top < carRect.bottom &&
                playerRect.bottom > carRect.top) {
                
                isSafe = false;
            }
        });
        
        if (!isSafe) {
            endGame('CRUNCH! Hit by a car. Game Over.');
            return;
        }

    } else if (laneType === 'L') {
        // River Lane: Must be on a Log or Die (Drowning)
        let isPlayerOnLog = false;
        let carryingLogSpeed = 0;

        obstacleList.filter(o => parseInt(o.dataset.lane) === playerPos.y && o.dataset.type === 'log').forEach(log => {
            const logRect = log.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();

            if (playerRect.left < logRect.right &&
                playerRect.right > logRect.left) {
                
                isPlayerOnLog = true;
                carryingLogSpeed = parseFloat(log.dataset.speed);
            }
        });
        
        if (!isPlayerOnLog) {
            endGame('SPLASH! Drowned in the river. Game Over.');
            return;
        }
        
        // Carry the player on the log (update player's grid X based on log speed)
        // Convert movement to grid steps
        const gridMove = carryingLogSpeed / CELL_SIZE; 
        playerPos.x += gridMove;
        
        // Prevent player from being pushed off the sides of the grid
        if (playerPos.x < 0 || playerPos.x >= GRID_SIZE) {
            endGame('Pushed off the edge! Game Over.');
            return;
        }
        
        updatePlayerPosition();
    }
}

/**
 * Checks if the player has reached the finish line or made progress.
 */
function checkGameStatus() {
    if (playerPos.y === GRID_SIZE - 1) {
        // Reached the top finish line!
        score++;
        scoreDisplay.textContent = score;
        messageDisplay.textContent = 'YOU MADE IT! Next Level...';
        
        // Reset player to the start (bottom)
        playerPos.x = 0;
        playerPos.y = 0;
        updatePlayerPosition();
    }
}

// --- Game State Management ---

/**
 * Starts the game.
 */
function startGame() {
    if (isGameRunning) return;

    createLanes();
    score = 0;
    playerPos = { x: 4, y: 0 }; // Start in the middle of the bottom lane
    updatePlayerPosition();
    scoreDisplay.textContent = score;
    messageDisplay.textContent = 'Dodge the traffic!';
    isGameRunning = true;
    startButton.style.display = 'none';

    // Set game loop interval (e.g., 50ms for smooth movement)
    gameLoopInterval = setInterval(gameLoop, 50); 
    window.addEventListener('keydown', handleMove);
}

/**
 * Ends the game.
 */
function endGame(message) {
    if (!isGameRunning) return;

    isGameRunning = false;
    clearInterval(gameLoopInterval);
    messageDisplay.textContent = `${message} Final Score: ${score}`;
    startButton.textContent = 'Play Again';
    startButton.style.display = 'block';
    window.removeEventListener('keydown', handleMove);
}

// Initial setup
startButton.addEventListener('click', startGame);
createLanes(); // Show initial grid setup before start
updatePlayerPosition(); // Set initial player position