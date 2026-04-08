// --- 1. Game Constants and State ---
const PLAYER_SIZE = 20;
const LEVEL_CONFIG = [
    {
        id: 1,
        goalW: 800, // Target window width to solve the puzzle
        goalH: 600, // Target window height
        message: "Resize to 800x600 to align the hidden platform and reach the Goal!",
        platforms: {
            'platform-a': { w: 200, h: 20, relX: -100, relY: 100 }, // Positioned relative to center
            'platform-b': { w: 100, h: 20, relX: 300, relY: -50 },
            'hidden-platform': { w: 150, h: 20, relX: 0, relY: 150, revealW: 790, revealH: 590 }
        },
        goal: { w: 30, h: 30, relX: 350, relY: -100 }
    }
];

let currentLevelIndex = 0;
let playerOffsetX = 0; // Player offset from the center (for WASD)
let playerOffsetY = 0;
let isGrounded = false;

// --- 2. DOM Elements ---
const D = (id) => document.getElementById(id);
const $ = {
    player: D('player'),
    dimW: D('dim-w'),
    dimH: D('dim-h'),
    gameMessage: D('game-message'),
    levelStatus: D('level-status'),
    goal: D('goal'),
    platformA: D('platform-a'),
    platformB: D('platform-b'),
    hiddenPlatform: D('hidden-platform')
};

// --- 3. Core Geometry and Resize Functions ---

/**
 * Updates the position and size of all level elements based on the current viewport.
 */
function updateLevelGeometry() {
    const levelData = LEVEL_CONFIG[currentLevelIndex];
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // UI Update
    $.dimW.textContent = width;
    $.dimH.textContent = height;
    
    // Calculate center of the viewport (which is the player's fixed point)
    const centerX = width / 2;
    const centerY = height / 2;

    // --- Dynamic Positioning ---
    
    // Platforms: Positioned relative to the viewport's center
    // We use a combination of screen size and the relative coordinates defined in LEVEL_CONFIG.
    
    for (const key in levelData.platforms) {
        const platformElement = D(key);
        const p = levelData.platforms[key];

        // 1. Position based on center offset
        let finalX = centerX + p.relX;
        let finalY = centerY + p.relY;

        // 2. Add an effect based on screen dimension (e.g., platforms move closer to the center as screen shrinks)
        // Example: Shift the platform more negatively (left/up) as width/height increase
        finalX -= (width - levelData.goalW) * 0.5; // Platform A shifts left if window is wider than goalW
        
        platformElement.style.width = `${p.w}px`;
        platformElement.style.height = `${p.h}px`;
        platformElement.style.left = `${finalX}px`;
        platformElement.style.top = `${finalY}px`;

        // Hidden Platform Reveal Logic
        if (p.revealW && p.revealH) {
             const distW = Math.abs(width - p.revealW);
             const distH = Math.abs(height - p.revealH);
             // When both dimensions are within a small range (e.g., 20px)
             if (distW < 20 && distH < 20) {
                 platformElement.style.opacity = 1;
             } else {
                 platformElement.style.opacity = 0.1;
             }
        }
    }
    
    // Goal Positioning (Similar to platforms)
    $.goal.style.left = `${centerX + levelData.goal.relX - (width - levelData.goalW) * 0.5}px`;
    $.goal.style.top = `${centerY + levelData.goal.relY}px`;
    $.goal.textContent = levelData.id;
    
    // Recalculate everything after moving the world
    checkCollisions();
    checkPuzzleState();
}

/**
 * Checks if the player is touching any platform or the goal.
 */
function checkCollisions() {
    isGrounded = false;
    
    const playerRect = $.player.getBoundingClientRect();
    const playerBottom = playerRect.top + playerRect.height;
    
    // Collect all elements to check (Platforms + Goal)
    const elements = document.querySelectorAll('.platform, .goal');
    
    for (const element of elements) {
        const elementRect = element.getBoundingClientRect();

        // Basic AABB Collision Check
        const overlapX = playerRect.left < elementRect.right && playerRect.right > elementRect.left;
        const overlapY = playerRect.top < elementRect.bottom && playerRect.bottom > elementRect.top;

        if (overlapX && overlapY) {
            // Collision occurred!
            if (element.classList.contains('goal')) {
                // Goal Collision
                handleGoalReached();
                return;
            } 
            
            // Simple Grounding check (for vertical movement later)
            // If the player's bottom is within the platform's top edge
            if (playerBottom > elementRect.top && playerBottom < elementRect.top + 5) {
                isGrounded = true;
                // Optional: Snap player to the platform top (removes small gaps)
                // playerOffsetY = elementRect.top - centerY - PLAYER_SIZE / 2;
                // $.player.style.marginTop = `${playerOffsetY}px`;
            }
        }
    }
}

/**
 * Checks if the current viewport dimensions meet the level's specific requirements.
 */
function checkPuzzleState() {
    const levelData = LEVEL_CONFIG[currentLevelIndex];
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const W_TOLERANCE = 10; // Pixels of tolerance
    const H_TOLERANCE = 10;
    
    // Check if the window is near the solution size
    const nearW = Math.abs(width - levelData.goalW) < W_TOLERANCE;
    const nearH = Math.abs(height - levelData.goalH) < H_TOLERANCE;

    if (nearW && nearH) {
        // Subtle feedback when the player hits the sweet spot
        $.gameMessage.textContent = "🎯 Perfect dimensions! Check your alignment now.";
        document.body.style.backgroundColor = 'var(--world-bg)';
    } else {
        $.gameMessage.textContent = levelData.message;
        // Subtle visual cue for distance (e.g., world darkens/brightens)
        const totalDistance = Math.abs(width - levelData.goalW) + Math.abs(height - levelData.goalH);
        const darkness = Math.min(0.8, totalDistance / 1000); 
        document.body.style.backgroundColor = `hsl(240, 10%, ${10 + darkness * 10}%)`;
    }
}

/**
 * Handles what happens when the goal is reached.
 */
function handleGoalReached() {
    alert(`Level ${LEVEL_CONFIG[currentLevelIndex].id} Complete!`);
    currentLevelIndex++;
    if (currentLevelIndex < LEVEL_CONFIG.length) {
        loadLevel();
    } else {
        $.gameMessage.textContent = "Game Complete! You are a master Viewport Voyager!";
        alert("You beat the game!");
    }
}

/**
 * Initializes the game for the current level.
 */
function loadLevel() {
    const levelData = LEVEL_CONFIG[currentLevelIndex];
    
    // Reset player position (center)
    playerOffsetX = 0;
    playerOffsetY = 0;
    $.player.style.marginLeft = '0px';
    $.player.style.marginTop = '0px';

    // Update UI
    $.levelStatus.textContent = `Current Level: ${levelData.id}`;
    $.gameMessage.textContent = levelData.message;

    // Immediately update geometry based on current window size
    updateLevelGeometry();
}


// --- 4. Event Listeners and Initialization ---

// CRITICAL: Rerun the geometry calculation and collision check on every resize
window.addEventListener('resize', updateLevelGeometry);

// Optional: WASD/Arrow Key player movement for minor adjustments
window.addEventListener('keydown', (e) => {
    const moveSpeed = 5; // Pixels per key press
    
    if (e.key === 'w' || e.key === 'ArrowUp') {
        playerOffsetY -= moveSpeed;
    } else if (e.key === 's' || e.key === 'ArrowDown') {
        // Only allow falling if not grounded (simple gravity simulation)
        // For simplicity in this version, we'll allow full movement:
        playerOffsetY += moveSpeed;
    } else if (e.key === 'a' || e.key === 'ArrowLeft') {
        playerOffsetX -= moveSpeed;
    } else if (e.key === 'd' || e.key === 'ArrowRight') {
        playerOffsetX += moveSpeed;
    }

    // Apply movement offset
    $.player.style.marginLeft = `${playerOffsetX}px`;
    $.player.style.marginTop = `${playerOffsetY}px`;
    
    // Check collisions after movement
    checkCollisions();
});


// Start the game!
loadLevel();