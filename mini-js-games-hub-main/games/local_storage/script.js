// --- 1. Global Constants and State ---
const STORAGE_KEY = 'LS_Legacy_Save';
const TICK_RATE = 1000; // 1 second
const CHECKSUM_SALT = 42; // Used for a simple integrity check

const INITIAL_STATE = {
    gold: 0,
    miners: 0,
    hackerPoints: 0,
    corruptionLevel: 0,
    gameTime: 0,
    puzzleActive: false,
    puzzleId: 0,
    checksum: 0 // Placeholder for the integrity check
};

let gameState = {};
let gameLoopInterval = null;

// --- 2. DOM Elements ---
const D = (id) => document.getElementById(id);
const $ = {
    statusDisplay: D('status-display'),
    saveEditor: D('save-editor'),
    consoleOutput: D('console-output'),
    mineGoldBtn: D('mine-gold'),
    buyMinerBtn: D('buy-miner'),
    loadSaveBtn: D('load-save'),
    applyChangesBtn: D('apply-changes'),
    corruptionMessage: D('corruption-message'),
    progressButton: D('progress-button')
};

// --- 3. LocalStorage & State Management ---

/**
 * Calculates a simple integrity checksum.
 * This function should be hard to reverse engineer by the player initially.
 */
function calculateChecksum(state) {
    // Sum of core values + a fixed salt.
    const sum = state.gold + state.miners + state.hackerPoints + CHECKSUM_SALT;
    return Math.floor(sum * state.corruptionLevel); // Multiplied by corruption for complexity
}

/**
 * Loads the state from localStorage or initializes a new game.
 */
function loadGameState() {
    const storedState = localStorage.getItem(STORAGE_KEY);
    if (storedState) {
        try {
            gameState = JSON.parse(storedState);
            // Verify checksum on load
            if (calculateChecksum(gameState) !== gameState.checksum) {
                console.error("Checksum mismatch on load. Data might be tampered with outside the editor.");
                // This could be a tougher penalty, but for now, we trust the in-game editor logic.
            }
        } catch (e) {
            console.error("Save file corrupted, starting new game.", e);
            gameState = { ...INITIAL_STATE };
        }
    } else {
        gameState = { ...INITIAL_STATE };
    }
    // Calculate and apply initial checksum for a clean start
    gameState.checksum = calculateChecksum(gameState);
    saveState();
    updateUI();
    loadEditor();
}

/**
 * Saves the current state to localStorage after updating the checksum.
 */
function saveState() {
    gameState.checksum = calculateChecksum(gameState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    loadEditor();
}

/**
 * Populates the in-game JSON editor with the current state.
 */
function loadEditor() {
    $.saveEditor.value = JSON.stringify(gameState, null, 4);
}

// --- 4. Game Loop and Idle Mechanics ---

function idleTick() {
    // 1. Idle Production
    gameState.gold += gameState.miners * 0.1; // 0.1 gold per miner per second
    gameState.gameTime += TICK_RATE / 1000;
    
    // 2. Puzzle Generation (Based on game time/progress)
    if (gameState.gameTime > 15 && gameState.puzzleId === 0) {
        introducePuzzle(1);
    } else if (gameState.gameTime > 60 && gameState.puzzleId === 1 && !gameState.puzzleActive) {
        introducePuzzle(2);
    }
    
    // 3. UI and Save
    updateUI();
    saveState();
}

function updateUI() {
    // Update Stats Display
    $.statusDisplay.innerHTML = `
        <div class="stat-item">Gold: ${gameState.gold.toFixed(2)}</div>
        <div class="stat-item">Miners: ${gameState.miners}</div>
        <div class="stat-item hacker-currency">Hacker Points: ${gameState.hackerPoints}</div>
        <div class="stat-item">Game Time: ${Math.floor(gameState.gameTime)}s</div>
    `;

    // Update Action Buttons
    $.buyMinerBtn.disabled = gameState.gold < 10;

    // Update Corruption Panel
    $.corruptionMessage.textContent = gameState.puzzleActive 
        ? `CORRUPTION DETECTED (ID:${gameState.puzzleId})! ${getPuzzleDescription(gameState.puzzleId)}`
        : "System Nominal. Awaiting next data anomaly.";
        
    $.progressButton.disabled = !gameState.puzzleActive;
}


// --- 5. Corruption Puzzles (The Core Mechanic) ---

function getPuzzleDescription(id) {
    switch(id) {
        case 1:
            return "The Gold Mine is overloaded! The 'gold' variable is showing a negative overflow. Use the editor to **fix the 'gold' value** to its maximum capacity (20).";
        case 2:
            return "The Miner production queue is stalled. The 'miners' variable is incorrectly set to 0. You must **increase 'miners' to 5** to restore production, costing 2 Hacker Points.";
        default:
            return "ERROR: Unknown corruption type.";
    }
}

function introducePuzzle(id) {
    gameState.puzzleActive = true;
    gameState.puzzleId = id;
    gameState.corruptionLevel = 1; // Increase difficulty/risk

    if (id === 1) {
        // Deliberate corruption for puzzle 1
        gameState.gold = -100;
    }
    if (id === 2) {
        // Deliberate corruption for puzzle 2
        gameState.miners = 0;
        // Cost is handled upon successful submission
    }
    updateUI();
    saveState();
}

/**
 * Checks the player's edited state against the required solution.
 */
function checkPuzzleSolution() {
    const puzzleId = gameState.puzzleId;
    let requiredState = {};

    switch(puzzleId) {
        case 1:
            requiredState = { gold: 20 };
            break;
        case 2:
            requiredState = { miners: 5 };
            if (gameState.hackerPoints < 2) {
                 $.consoleOutput.textContent = '❌ Insufficient Hacker Points (Need 2) to resolve this corruption level.';
                 return false;
            }
            break;
        default:
            return false;
    }
    
    let isSolved = true;
    
    // Check if the player's *new* state matches the required change
    for (const key in requiredState) {
        if (gameState[key] !== requiredState[key]) {
            isSolved = false;
            break;
        }
    }
    
    if (isSolved) {
        resolvePuzzle(puzzleId);
        return true;
    } else {
        $.consoleOutput.textContent = '❌ Solution does not match requirements. Check the variable and value required.';
        return false;
    }
}

function resolvePuzzle(id) {
    // Reward and reset
    gameState.puzzleActive = false;
    gameState.corruptionLevel = 0;
    
    let reward = 1; // Default
    let cost = 0;
    
    if (id === 2) {
        cost = 2; // Puzzle 2 costs Hacker Points
        reward = 3;
    }
    
    gameState.hackerPoints += reward;
    gameState.hackerPoints -= cost;

    $.consoleOutput.textContent = `✅ Corruption ID:${id} RESOLVED! Gained ${reward} Hacker Points.`;
    updateUI();
    saveState();
}

// --- 6. Editor and Action Listeners ---

function handleApplyChanges() {
    const editorValue = $.saveEditor.value;
    let newGameState;

    try {
        newGameState = JSON.parse(editorValue);
    } catch (e) {
        $.consoleOutput.textContent = '❌ JSON Parse Error. Check your syntax (missing commas, brackets, etc.).';
        return;
    }

    // 1. Check for Checksum Tampering
    const expectedChecksum = calculateChecksum(newGameState);
    if (newGameState.checksum !== expectedChecksum) {
        $.consoleOutput.textContent = '🚨 SYSTEM RESET: Checksum integrity failure! Penalty applied.';
        
        // --- Punishment ---
        gameState = { ...INITIAL_STATE, gold: 0, miners: 0 }; // Full reset but keep Hacker Points
        gameState.hackerPoints = Math.max(0, newGameState.hackerPoints - 1); // Penalize 1 Hacker Point
        // --- End Punishment ---
        
        saveState();
        return;
    }
    
    // 2. Apply Valid Changes
    // This allows the player to "cheat" (e.g., set gold to 99999) as long as the checksum is correct.
    gameState = newGameState;
    $.consoleOutput.textContent = '✅ Save file validated and applied. Current game state updated.';

    // 3. Check for Active Puzzle Solution
    if (gameState.puzzleActive) {
        checkPuzzleSolution();
    }
    
    updateUI();
    saveState(); // Re-save with the latest state and correct checksum
}


// Simple Idle Game Actions
$.mineGoldBtn.addEventListener('click', () => {
    gameState.gold += 1;
    updateUI();
    saveState();
});

$.buyMinerBtn.addEventListener('click', () => {
    if (gameState.gold >= 10) {
        gameState.gold -= 10;
        gameState.miners += 1;
        updateUI();
        saveState();
    }
});

$.loadSaveBtn.addEventListener('click', loadEditor);
$.applyChangesBtn.addEventListener('click', handleApplyChanges);
$.progressButton.addEventListener('click', checkPuzzleSolution);


// --- 7. Initialization ---
loadGameState();

// Start the idle game loop
gameLoopInterval = setInterval(idleTick, TICK_RATE);