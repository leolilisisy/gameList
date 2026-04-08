// --- Game Setup and Constants ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game state variables
let game = {
    running: true,
    score: 0,
    scrollSpeed: 0 // How fast the screen is currently scrolling down
};

const PLATFORM_COUNT = 15;
const GRAVITY = 0.5;
const JUMP_VELOCITY = -15;
const SCROLL_THRESHOLD = canvas.height * 0.4; // Scroll starts when player is in the top 40% of the screen

// --- Player Object ---
let player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 30,
    height: 30,
    velX: 0,
    velY: 0,
    speed: 6,
    onGround: false,
    keys: {
        left: false,
        right: false
    }
};

// --- Platform Object Array ---
let platforms = [];

/**
 * Platform Class for creating different types of platforms.
 */
class Platform {
    constructor(x, y, width, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 10;
        this.type = type; // 'normal', 'moving', 'breakable'
        this.color = this.getColor();
        this.movingDir = (Math.random() > 0.5) ? 1 : -1; // For 'moving' platforms
        this.moveSpeed = 1;
        this.life = 1; // For 'breakable' platforms
    }

    getColor() {
        switch(this.type) {
            case 'moving': return 'lightgreen';
            case 'breakable': return 'tomato';
            default: return 'white'; // 'normal'
        }
    }

    update() {
        if (this.type === 'moving') {
            this.x += this.movingDir * this.moveSpeed;
            // Reverse direction if hitting canvas edges
            if (this.x + this.width > canvas.width || this.x < 0) {
                this.movingDir *= -1;
            }
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// --- Initialization Functions ---

/**
 * Initializes the starting platforms and the player position.
 */
function initPlatforms() {
    // Starting platform for the player
    platforms.push(new Platform(player.x - 50, player.y + player.height, 100));

    // Generate platforms randomly above the starting point
    for (let i = 0; i < PLATFORM_COUNT; i++) {
        generateNewPlatform();
    }
}

/**
 * Generates a single new platform at the top of the screen.
 */
function generateNewPlatform() {
    // Find the highest platform's Y position
    const highestPlatformY = platforms.reduce((minY, p) => Math.min(minY, p.y), Infinity);
    
    // Y position is randomly a bit above the previous highest
    const y = highestPlatformY - 80 - Math.random() * 50;
    
    // X position is randomly across the width
    const width = 60 + Math.random() * 60; // Random width
    const x = Math.random() * (canvas.width - width);
    
    // Random platform type (20% moving, 10% breakable, 70% normal)
    const rand = Math.random();
    let type = 'normal';
    if (rand < 0.2) type = 'moving';
    else if (rand < 0.3) type = 'breakable';

    platforms.push(new Platform(x, y, width, type));
}

// --- Game Logic Functions ---

/**
 * Handles all player physics: movement, gravity, and wrap-around.
 */
function updatePlayer() {
    // Apply gravity
    player.velY += GRAVITY;

    // Horizontal movement from keyboard
    player.velX = 0;
    if (player.keys.left) {
        player.velX = -player.speed;
    }
    if (player.keys.right) {
        player.velX = player.speed;
    }
    player.x += player.velX;

    // Wrap-around horizontal movement (left edge to right edge and vice-versa)
    if (player.x + player.width < 0) {
        player.x = canvas.width;
    } else if (player.x > canvas.width) {
        player.x = -player.width;
    }

    // Check if player has fallen off the bottom (Game Over condition)
    if (player.y > canvas.height) {
        gameOver();
    }
}

/**
 * Handles the vertical scrolling effect and updates platforms.
 */
function updatePlatforms() {
    // 1. Calculate Scrolling: If player is high up, scroll everything down.
    if (player.y < SCROLL_THRESHOLD) {
        // Calculate scroll speed based on how far above the threshold the player is
        game.scrollSpeed = SCROLL_THRESHOLD - player.y;
        
        // Move all platforms down
        platforms.forEach(p => p.y += game.scrollSpeed);
        
        // Move player down relative to the scroll
        player.y += game.scrollSpeed;
        
        // Increase score based on the scroll distance
        game.score += Math.floor(game.scrollSpeed);
        scoreElement.textContent = `Score: ${game.score}`;
    } else {
        game.scrollSpeed = 0; // Stop scrolling when player is falling or stable
    }

    // 2. Platform Updates and Generation
    let highestPlatformY = Infinity;
    
    for (let i = platforms.length - 1; i >= 0; i--) {
        const p = platforms[i];
        p.update(); // Update moving platforms
        
        highestPlatformY = Math.min(highestPlatformY, p.y);

        // Remove platforms that have scrolled off the bottom of the screen
        if (p.y > canvas.height + 50) {
            platforms.splice(i, 1);
        }
    }
    
    // 3. Generate new platforms if the highest one is too far down
    if (highestPlatformY > 0) {
        // Keep generating until the highest platform is above the screen
        generateNewPlatform();
    }
}


/**
 * Checks for collision between the player and any platform.
 */
function checkCollisions() {
    player.onGround = false;
    player.y += player.velY; // Apply vertical movement temporarily

    platforms.forEach(p => {
        // Simplified AABB (Axis-Aligned Bounding Box) collision check
        const overlapX = player.x < p.x + p.width && player.x + player.width > p.x;
        const overlapY = player.y + player.height > p.y && player.y + player.height < p.y + p.height;

        // Check for landing from above (only if falling)
        if (player.velY > 0 && overlapX && overlapY) {
            // Collision detected! Stop falling and perform a jump.
            player.velY = JUMP_VELOCITY;
            player.y = p.y - player.height; // Snap player to the top of the platform
            player.onGround = true;

            // Handle breakable platforms
            if (p.type === 'breakable') {
                p.life -= 1;
            }
        }
    });

    // Final position update after collision checks
    if (!player.onGround) {
        // If no collision occurred, the temporary y change is final
        // (This is a simplified physics model, a more robust one would
        // re-subtract the applied velY and re-apply it based on collisions)
    }
    
    // Remove broken platforms
    platforms = platforms.filter(p => p.life > 0);
}

// --- Rendering Functions ---

/**
 * Clears the canvas and draws all game elements.
 */
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    platforms.forEach(p => p.draw());

    // Draw the player (simple square)
    ctx.fillStyle = 'yellow';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// --- Main Game Loop ---

let lastTime = 0;
function gameLoop(timestamp) {
    if (!game.running) return;

    // Use requestAnimationFrame's timestamp for frame-independent movement
    // (A full implementation would use delta time for physics, but for a
    // simple game, constant update rate is often sufficient)
    
    updatePlayer();
    updatePlatforms();
    checkCollisions();
    draw();

    // Call the game loop again
    requestAnimationFrame(gameLoop);
}

// --- Event Handlers ---

function handleKeydown(event) {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        player.keys.left = true;
    } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        player.keys.right = true;
    }
}

function handleKeyup(event) {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        player.keys.left = false;
    } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        player.keys.right = false;
    }
}

function gameOver() {
    game.running = false;
    alert(`Game Over! Final Score: ${game.score}`);
    // Optional: Reload the page or show a restart button
    // window.location.reload(); 
}

// --- Start the Game ---
document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);

initPlatforms();
requestAnimationFrame(gameLoop);