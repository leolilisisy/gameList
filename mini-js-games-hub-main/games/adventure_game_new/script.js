// --- 1. Game Constants and State ---
const PLAYER_SIZE = 20;
const LEVEL_CONFIG = [
    {
        id: 1,
        goalW: 800, 
        goalH: 600, 
        goalRatio: 1.3333, // Target Aspect Ratio: 4:3
        message: "Resize to 800x600 to align the hidden platform and reach the Goal!",
        platforms: {
            'platform-a': { w: 200, h: 20, relX: -100, relY: 100 }, 
            'platform-b': { w: 100, h: 20, relX: 300, relY: -50 },
            'platform-c': { w: 0, h: 0, relX: 0, relY: 0 }, // Placeholder to keep keys consistent
            'hidden-platform': { w: 150, h: 20, relX: 0, relY: 150, revealW: 790, revealH: 590 }
        },
        goal: { w: 30, h: 30, relX: 350, relY: -100 }
    },
    {
        id: 2,
        goalW: 900, // Example dimensions (W/H = 1.5)
        goalH: 600,
        goalRatio: 1.5, // Target Aspect Ratio: 3:2
        message: "Level 2: The Ratio Riser. Resize the window until the Aspect Ratio (W/H) is exactly 1.50!",
        platforms: {
            // These platforms move diagonally based on the ratio
            'platform-a': { w: 150, h: 20, relX: -250, relY: 150, ratioXMult: 0.5 }, 
            'platform-b': { w: 150, h: 20, relX: 50, relY: 0, ratioXMult: 0.2 },
            'platform-c': { w: 150, h: 20, relX: 250, relY: -150, ratioXMult: 0.1 }, // New platform
            'hidden-platform': { w: 0, h: 0, relX: 0, relY: 0 } // Hide in this level
        },
        goal: { w: 30, h: 30, relX: 300, relY: -50 }
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
    platformC: D('platform-c'), // Reference to the new platform
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
    const currentRatio = width / height;
    
    // UI Update
    $.dimW.textContent = width;
    $.dimH.textContent = height;
    
    const centerX = width / 2;
    const centerY = height / 2;

    // --- Determine Dynamic Shift Factor ---
    let shiftFactor = 0;
    
    if (levelData.id === 1) {
        // Level 1: Shift based on deviation from fixed target W
        shiftFactor = (width - levelData.goalW) * 0.5;
    } else if (levelData.id === 2) {
        // Level 2: Shift based on deviation from target Aspect Ratio (1.5)
        shiftFactor = (currentRatio - levelData.goalRatio) * 400; // Multiplier adjusts sensitivity
    }
    
    // --- Dynamic Positioning ---
    
    for (const key in levelData.platforms) {
        const platformElement = D(key);
        // Ensure element exists and is required for the level
        if (!platformElement) continue;

        const p = levelData.platforms[key];
        
        // Hide/Show element based on its size in the level config
        if (p.w === 0 && p.h === 0) {
            platformElement.style.display = 'none';
            continue;
        } else {
            platformElement.style.display = 'block';
        }

        let finalX = centerX + p.relX;
        let finalY = centerY + p.relY;

        // 2. Apply Shift Factor
        if (levelData.id === 1) {
             finalX -= shiftFactor;
             // Hidden platform reveal logic
             if (key === 'hidden-platform' && p.revealW && p.revealH) {
                 const distW = Math.abs(width - p.revealW);
                 const distH = Math.abs(height - p.revealH);
                 platformElement.style.opacity = (distW < 20 && distH < 20) ? 1 : 0.1;
             }
        } else if (levelData.id === 2) {
            // Level 2: Platforms shift diagonally based on the ratio factor
            finalX -= shiftFactor * (p.ratioXMult || 1); 
            finalY += shiftFactor * (p.ratioXMult || 1); 
            
            platformElement.style.opacity = 1;
        }

        platformElement.style.width = `${p.w}px`;
        platformElement.style.height = `${p.h}px`;
        platformElement.style.left = `${finalX}px`;
        platformElement.style.top = `${finalY}px`;
    }
    
    // Goal Positioning
    let goalShiftX = (levelData.id === 1) ? shiftFactor : shiftFactor * 0.5;
    let goalShiftY = (levelData.id === 2) ? shiftFactor * 0.5 : 0;

    $.goal.style.left = `${centerX + levelData.goal.relX - goalShiftX}px`;
    $.goal.style.top = `${centerY + levelData.goal.relY + goalShiftY}px`;
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
    
    const elements = document.querySelectorAll('.platform, .goal');
    
    for (const element of elements) {
        // Skip hidden/placeholder elements
        if (element.style.display === 'none' || element.style.opacity < 0.5) continue;
        
        const elementRect = element.getBoundingClientRect();

        const overlapX = playerRect.left < elementRect.right && playerRect.right > elementRect.left;
        const overlapY = playerRect.top < elementRect.bottom && playerRect.bottom > elementRect.top;

        if (overlapX && overlapY) {
            if (element.classList.contains('goal')) {
                handleGoalReached();
                return;
            } 
            
            if (playerBottom > elementRect.top && playerBottom < elementRect.top + 5) {
                isGrounded = true;
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
    
    if (levelData.id === 1) {
        // Level 1: Fixed Dimensions
        const W_TOLERANCE = 10;
        const H_TOLERANCE = 10;
        
        const nearW = Math.abs(width - levelData.goalW) < W_TOLERANCE;
        const nearH = Math.abs(height - levelData.goalH) < H_TOLERANCE;
        
        if (nearW && nearH) {
            $.gameMessage.textContent = "🎯 Perfect dimensions! The platform is stable.";
        } else {
             $.gameMessage.textContent = levelData.message;
        }
        
        const totalDistance = Math.abs(width - levelData.goalW) + Math.abs(height - levelData.goalH);
        const darkness = Math.min(0.8, totalDistance / 1000); 
        document.body.style.backgroundColor = `hsl(240, 10%, ${10 + darkness * 10}%)`;
        
    } else if (levelData.id === 2) {
        // Level 2: Aspect Ratio
        const currentRatio = width / height;
        const RATIO_TOLERANCE = 0.02; // Tight tolerance

        const nearRatio = Math.abs(currentRatio - levelData.goalRatio) < RATIO_TOLERANCE;
        
        if (nearRatio) {
            $.gameMessage.textContent = `⭐ ASPECT RATIO ACHIEVED! Ratio: ${currentRatio.toFixed(3)}. The path is aligned!`;
            document.body.style.backgroundColor = 'hsl(120, 50%, 15%)';
        } else {
            $.gameMessage.textContent = `${levelData.message} Current Ratio: ${currentRatio.toFixed(3)}`;
            
            const ratioDistance = Math.abs(currentRatio - levelData.goalRatio);
            const tint = Math.min(100, ratioDistance * 500); 
            document.body.style.backgroundColor = `hsl(0, ${tint}%, 15%)`;
        }
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