// Mystic Maze Game Script
// Navigate enchanted mazes, solve puzzles, and find the hidden artifact.

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game variables
const gridSize = 40;
const cols = Math.floor(canvas.width / gridSize);
const rows = Math.floor(canvas.height / gridSize);

let player = { x: 1, y: 1 };
let keys = 0;
let gameRunning = true;

// Maze layout: 0 = empty, 1 = wall, 2 = key, 3 = door, 4 = trap, 5 = artifact
let maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,0,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Place items
maze[2][5] = 2; // Key
maze[4][8] = 3; // Door
maze[6][10] = 4; // Trap
maze[8][12] = 5; // Artifact

// Initialize game
function init() {
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Handle input (will be added in event listeners)
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = maze[y][x];
            if (cell === 1) {
                ctx.fillStyle = '#666';
                ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
            } else if (cell === 2) {
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(x * gridSize + 10, y * gridSize + 10, 20, 20);
            } else if (cell === 3) {
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
            } else if (cell === 4) {
                ctx.fillStyle = '#800080';
                ctx.beginPath();
                ctx.moveTo(x * gridSize + 10, y * gridSize + 30);
                ctx.lineTo(x * gridSize + 20, y * gridSize + 10);
                ctx.lineTo(x * gridSize + 30, y * gridSize + 30);
                ctx.closePath();
                ctx.fill();
            } else if (cell === 5) {
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                ctx.arc(x * gridSize + 20, y * gridSize + 20, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x * gridSize + 20, y * gridSize + 20, 10, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Draw player
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(player.x * gridSize + 20, player.y * gridSize + 20, 15, 0, Math.PI * 2);
    ctx.fill();

    // Update score
    scoreElement.textContent = 'Keys: ' + keys;
}

// Handle input
document.addEventListener('keydown', function(event) {
    let newX = player.x;
    let newY = player.y;

    if (event.code === 'ArrowUp') newY--;
    else if (event.code === 'ArrowDown') newY++;
    else if (event.code === 'ArrowLeft') newX--;
    else if (event.code === 'ArrowRight') newX++;

    // Check bounds
    if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
        const cell = maze[newY][newX];
        if (cell === 0 || cell === 2 || cell === 5) {
            player.x = newX;
            player.y = newY;

            // Collect key
            if (cell === 2) {
                maze[newY][newX] = 0;
                keys++;
                // Open doors
                for (let y = 0; y < rows; y++) {
                    for (let x = 0; x < cols; x++) {
                        if (maze[y][x] === 3) maze[y][x] = 0;
                    }
                }
            }

            // Find artifact
            if (cell === 5) {
                gameRunning = false;
                alert('You found the artifact! Congratulations!');
            }
        } else if (cell === 4) {
            // Trap: reset position
            player.x = 1;
            player.y = 1;
        }
    }
});

// Start the game
init();