// --- 1. Game Constants and State ---
const ARENA_WIDTH = 400;
const MOVEMENT_SPEED = 10;
const LAG_DURATION = 500; // Time in ms the lag attack is active
const LAG_INTENSITY = 8000000; // Number of loops for intentional lag

const GAME_STATE = {
    p1: { health: 100, x: 50, fps: 60, lagActive: false },
    p2: { health: 100, x: 320, fps: 60, lagActive: false }
};

let lastFrameTime = performance.now();
let frameCount = 0;

// --- 2. DOM Elements ---
const D = (id) => document.getElementById(id);
const $ = {
    p1El: D('player-1'),
    p2El: D('player-2'),
    p1Health: D('p1-health'),
    p2Health: D('p2-health'),
    p1HealthBar: D('p1-health-bar'),
    p2HealthBar: D('p2-health-bar'),
    p1FPS: D('p1-fps'),
    p2FPS: D('p2-fps'),
    gameMessage: D('game-message'),
    arena: D('arena')
};

// --- 3. Core Logic: FPS Calculation and Game Loop ---

/**
 * Calculates FPS and drives the game loop.
 */
function gameLoop() {
    const now = performance.now();
    const deltaTime = now - lastFrameTime;

    // --- FPS Calculation (Crucial for the core mechanic) ---
    // The player's perception of "lag" is measured by this
    const currentFPS = 1000 / deltaTime;

    // The FPS is the same for the entire browser process, but we calculate it twice
    // to track the "defender's" (P1) FPS when P2 attacks, and vice versa.
    // In a local 2-player game, both players run on the same thread, so FPS is global.
    // We update both FPS counters with the same value for realistic feedback.
    GAME_STATE.p1.fps = Math.round(currentFPS);
    GAME_STATE.p2.fps = Math.round(currentFPS);

    // --- State Update ---
    updateFighterPosition();
    updateUI();

    lastFrameTime = now;
    requestAnimationFrame(gameLoop);
}

// --- 4. Lag and Attack Mechanics ---

/**
 * Creates intentional, CPU-blocking lag.
 * This is the weaponized function.
 */
function runLagAttack(attacker, defender) {
    if (defender.lagActive) return; // Cannot stack lag attacks
    
    // --- INTENTIONAL CPU BLOCKING ---
    // This heavy loop blocks the main thread, causing the deltaTime to spike 
    // and the calculated FPS to plummet in the next few frames.
    const start = performance.now();
    for (let i = 0; i < LAG_INTENSITY; i++) {
        // Run a complex, non-optimizable math function
        Math.sqrt(i) * Math.sin(i);
    }
    const duration = performance.now() - start;
    console.log(`Lag attack blocked thread for: ${duration.toFixed(2)}ms`);
    // ---------------------------------

    // Damage Calculation: Damage = Base Damage / Current FPS
    const baseDamage = 30; // High base damage for dramatic effect
    
    // Crucially, we use the FPS *after* the lag attack finishes (i.e., the current low FPS)
    // for damage calculation, rewarding timing the lag.
    const damageFactor = (1 / GAME_STATE[defender.id].fps) * 60; // Normalize by 60 FPS
    let damageTaken = baseDamage * damageFactor;
    
    // Cap damage to prevent instant KOs on very slow systems
    damageTaken = Math.min(damageTaken, 50); 
    
    // Apply Damage
    defender.health -= damageTaken;
    defender.health = Math.max(0, defender.health);

    // Visual feedback
    $.gameMessage.textContent = `💥 LAG ATTACK HIT! ${defender.id} took ${damageTaken.toFixed(1)} damage! FPS: ${GAME_STATE[defender.id].fps}`;
    
    checkGameOver();
}

/**
 * Executes a simple, non-lagging attack.
 */
function runLightAttack(attacker, defender) {
    if (Math.abs(GAME_STATE[attacker.id].x - GAME_STATE[defender.id].x) > 100) {
        $.gameMessage.textContent = "Too far for a Light Attack!";
        return;
    }
    
    // Simple fixed damage
    defender.health -= 5;
    defender.health = Math.max(0, defender.health);
    
    $.gameMessage.textContent = `🗡️ Light Attack hit! ${defender.id} took 5 damage.`;
    checkGameOver();
}

// --- 5. Movement and Collision ---

function updateFighterPosition() {
    $.p1El.style.left = `${GAME_STATE.p1.x}px`;
    $.p2El.style.left = `${GAME_STATE.p2.x}px`;
}

// --- 6. Event Listeners ---

document.addEventListener('keydown', (e) => {
    if (GAME_STATE.p1.health <= 0 || GAME_STATE.p2.health <= 0) return;

    // Player 1 Controls (WASD, C/V)
    if (e.key === 'w' || e.key === 'W') { /* Jump logic */ }
    if (e.key === 'a' || e.key === 'A') GAME_STATE.p1.x = Math.max(10, GAME_STATE.p1.x - MOVEMENT_SPEED);
    if (e.key === 'd' || e.key === 'D') GAME_STATE.p1.x = Math.min(ARENA_WIDTH - 40, GAME_STATE.p1.x + MOVEMENT_SPEED);
    
    if (e.key === 'c' || e.key === 'C') runLightAttack({ id: 'p1' }, GAME_STATE.p2);
    if (e.key === 'v' || e.key === 'V') {
        // P1 attacks P2 with lag
        $.p2El.classList.add('lag-attack');
        runLagAttack({ id: 'p1' }, GAME_STATE.p2);
        setTimeout(() => $.p2El.classList.remove('lag-attack'), 500);
    }
    
    // Player 2 Controls (Arrows, L/K)
    if (e.key === 'ArrowUp') { /* Jump logic */ }
    if (e.key === 'ArrowLeft') GAME_STATE.p2.x = Math.max(10, GAME_STATE.p2.x - MOVEMENT_SPEED);
    if (e.key === 'ArrowRight') GAME_STATE.p2.x = Math.min(ARENA_WIDTH - 40, GAME_STATE.p2.x + MOVEMENT_SPEED);
    
    if (e.key === 'l' || e.key === 'L') runLightAttack({ id: 'p2' }, GAME_STATE.p1);
    if (e.key === 'k' || e.key === 'K') {
        // P2 attacks P1 with lag
        $.p1El.classList.add('lag-attack');
        runLagAttack({ id: 'p2' }, GAME_STATE.p1);
        setTimeout(() => $.p1El.classList.remove('lag-attack'), 500);
    }
});


// --- 7. Utility and Game End ---

function updateUI() {
    // Update FPS displays
    const fpsColor = (fps) => fps < 20 ? 'red' : fps < 50 ? 'orange' : 'inherit';

    $.p1FPS.textContent = GAME_STATE.p1.fps;
    $.p1FPS.style.color = fpsColor(GAME_STATE.p1.fps);
    
    $.p2FPS.textContent = GAME_STATE.p2.fps;
    $.p2FPS.style.color = fpsColor(GAME_STATE.p2.fps);

    // Update Health Displays
    $.p1Health.textContent = GAME_STATE.p1.health;
    $.p2Health.textContent = GAME_STATE.p2.health;
    
    $.p1HealthBar.style.width = `${GAME_STATE.p1.health}%`;
    $.p2HealthBar.style.width = `${GAME_STATE.p2.health}%`;
}

function checkGameOver() {
    if (GAME_STATE.p1.health <= 0) {
        $.gameMessage.innerHTML = `🎉 **PLAYER 2 WINS!** Player 1 was defeated by poor optimization.`;
        cancelAnimationFrame(animationFrameId);
    } else if (GAME_STATE.p2.health <= 0) {
        $.gameMessage.innerHTML = `🎉 **PLAYER 1 WINS!** Player 2 was defeated by poor optimization.`;
        cancelAnimationFrame(animationFrameId);
    }
}

// Start the game
let animationFrameId = requestAnimationFrame(gameLoop);