// --- 1. Canvas Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverMessage = document.getElementById('gameOverMessage');
const restartButton = document.getElementById('restartButton');

// Set Canvas Dimensions
canvas.width = 800;
canvas.height = 600;

// --- 2. Game Constants and Variables ---
const PLAYER_SPEED = 5;
const PLAYER_BULLET_SPEED = 7;
const ALIEN_SPEED_X = 1;
const ALIEN_SPEED_Y = 20; // How much aliens drop when hitting wall
const ALIEN_BULLET_SPEED = 3;
const ALIEN_FIRE_RATE = 200; // Lower is faster (chance to fire each frame)

let player;
let playerBullets = [];
let aliens = [];
let alienBullets = [];
let alienDirection = 1; // 1 for right, -1 for left
let gameActive = false;
let score = 0;
let level = 1;
let lastAlienFire = 0;

// Input tracking
let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// --- 3. Game Objects (Classes) ---

// Player Ship
class Player {
    constructor() {
        this.width = 40;
        this.height = 20;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 30; // Position above bottom
        this.color = '#00ff00'; // Green
    }

    draw() {
        ctx.fillStyle = this.color;
        // Simple triangular ship
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        // Base
        ctx.fillRect(this.x, this.y + this.height - 5, this.width, 5);
    }

    update() {
        if (keys.ArrowLeft) {
            this.x -= PLAYER_SPEED;
        }
        if (keys.ArrowRight) {
            this.x += PLAYER_SPEED;
        }

        // Boundary checks
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }

    shoot() {
        playerBullets.push(new PlayerBullet(this.x + this.width / 2, this.y));
    }
}

// Player Bullet
class PlayerBullet {
    constructor(x, y) {
        this.x = x - 2; // Center bullet
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.color = '#00ffff'; // Cyan
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= PLAYER_BULLET_SPEED;
    }
}

// Alien
class Alien {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 20;
        this.color = '#ff00ff'; // Magenta
    }

    draw() {
        ctx.fillStyle = this.color;
        // Simple blocky alien
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillRect(this.x - 5, this.y + 5, 5, 10); // Legs
        ctx.fillRect(this.x + this.width, this.y + 5, 5, 10);
    }

    update() {
        // Aliens are moved by a collective update function, not individually
    }
}

// Alien Bullet
class AlienBullet {
    constructor(x, y) {
        this.x = x - 2; // Center bullet
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.color = '#ff0000'; // Red
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += ALIEN_BULLET_SPEED;
    }
}

// --- 4. Game Setup and Initialization ---

function initGame() {
    // Reset all game state
    player = new Player();
    playerBullets = [];
    aliens = [];
    alienBullets = [];
    alienDirection = 1;
    score = 0;
    level = 1;
    gameActive = false;
    
    // Create aliens grid
    const numRows = 4;
    const aliensPerRow = 8;
    const startX = (canvas.width - (aliensPerRow * 40)) / 2; // Center aliens
    const startY = 50;

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < aliensPerRow; c++) {
            aliens.push(new Alien(startX + c * 40, startY + r * 30));
        }
    }
    
    // Hide game over screen, show start screen initially
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

// --- 5. Main Game Loop ---

function gameLoop() {
    if (!gameActive) return;

    // 1. Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Update Game Objects
    player.update();
    updateAliens();
    updateBullets();
    
    // 3. Handle Collisions
    checkCollisions();

    // 4. Draw Game Objects
    player.draw();
    playerBullets.forEach(bullet => bullet.draw());
    aliens.forEach(alien => alien.draw());
    alienBullets.forEach(bullet => bullet.draw());
    
    // 5. Draw Score/Level
    ctx.fillStyle = 'white';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`Level: ${level}`, canvas.width - 120, 25);


    // 6. Check Win/Lose Conditions
    if (aliens.length === 0) {
        // Player wins the level
        level++;
        initNextLevel();
        return; // Skip remaining frame logic for this loop
    }
    
    // Check if aliens reached player's level
    if (aliens.some(alien => alien.y + alien.height > player.y)) {
        endGame(false); // Player loses
        return;
    }

    requestAnimationFrame(gameLoop);
}

function updateAliens() {
    let hitWall = false;
    
    aliens.forEach(alien => {
        alien.x += ALIEN_SPEED_X * alienDirection * level * 0.5; // Aliens get faster with level
        if (alien.x + alien.width > canvas.width || alien.x < 0) {
            hitWall = true;
        }
    });

    if (hitWall) {
        alienDirection *= -1; // Reverse direction
        aliens.forEach(alien => {
            alien.y += ALIEN_SPEED_Y; // Drop down
            alien.x += ALIEN_SPEED_X * alienDirection; // Adjust position slightly to be off wall
        });
    }

    // Alien firing logic
    if (Math.random() * ALIEN_FIRE_RATE < level) { // Chance to fire, increases with level
        const firingAlien = aliens[Math.floor(Math.random() * aliens.length)];
        if (firingAlien) {
            alienBullets.push(new AlienBullet(firingAlien.x + firingAlien.width / 2, firingAlien.y + firingAlien.height));
        }
    }
}

function updateBullets() {
    // Update player bullets and remove off-screen
    playerBullets = playerBullets.filter(bullet => {
        bullet.update();
        return bullet.y > 0;
    });

    // Update alien bullets and remove off-screen
    alienBullets = alienBullets.filter(bullet => {
        bullet.update();
        return bullet.y < canvas.height;
    });
}

// AABB (Axis-Aligned Bounding Box) collision detection
function collides(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function checkCollisions() {
    // Player bullet - Alien collision
    playerBullets.forEach((pBullet, pIndex) => {
        aliens.forEach((alien, aIndex) => {
            if (collides(pBullet, alien)) {
                // Remove bullet and alien
                playerBullets.splice(pIndex, 1);
                aliens.splice(aIndex, 1);
                score += 100; // Increase score
            }
        });
    });

    // Alien bullet - Player collision
    alienBullets.forEach((aBullet, bIndex) => {
        if (collides(aBullet, player)) {
            alienBullets.splice(bIndex, 1); // Remove bullet
            endGame(false); // Player hit, game over
        }
    });
}

function endGame(win) {
    gameActive = false;
    clearInterval(gameLoop); // Stop game loop (though requestAnimationFrame is better for this)
    
    // Show game over screen with appropriate message
    gameOverScreen.classList.remove('hidden');
    gameOverMessage.textContent = win ? 'YOU WIN! 🎉' : 'GAME OVER!';
    gameOverMessage.style.color = win ? '#00ff00' : '#ff0000';
}

function initNextLevel() {
    // Increase difficulty or just reset board with more aliens/faster movement
    gameActive = false; // Pause briefly
    playerBullets = []; // Clear bullets
    alienBullets = [];
    alienDirection = 1;
    
    // Re-populate aliens
    const numRows = 4 + (level - 1); // More rows each level
    const aliensPerRow = 8 + (level - 1);
    const startX = (canvas.width - (aliensPerRow * 40)) / 2;
    const startY = 50;

    aliens = [];
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < aliensPerRow; c++) {
            aliens.push(new Alien(startX + c * 40, startY + r * 30));
        }
    }
    
    setTimeout(() => { // Give a brief pause before starting next level
        gameActive = true;
        requestAnimationFrame(gameLoop);
    }, 1000);
}


// --- 6. Event Listeners (Input) ---

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.code === 'ArrowRight') keys.ArrowRight = true;
    if (e.code === 'Space') {
        if (!keys.Space && gameActive) { // Prevent continuous firing on hold
            player.shoot();
        }
        keys.Space = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
    if (e.code === 'ArrowRight') keys.ArrowRight = false;
    if (e.code === 'Space') keys.Space = false;
});

startButton.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameActive = true;
    requestAnimationFrame(gameLoop);
});

restartButton.addEventListener('click', () => {
    initGame(); // Re-initialize everything
    startScreen.classList.add('hidden'); // Ensure start screen is hidden on restart
    gameActive = true;
    requestAnimationFrame(gameLoop); // Start game loop again
});


// --- 7. Initialization ---
initGame();