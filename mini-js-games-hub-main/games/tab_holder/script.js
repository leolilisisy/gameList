// --- 1. Global State Management & Constants ---

const STORAGE_KEY = 'tabHoarderGameData';
const FACILITY_KEY = new URLSearchParams(window.location.search).get('facility') || 'mine';

const FACILITY_DATA = {
    mine: {
        name: "Deep Core Mine ⛏️",
        theme: "mine-theme",
        dangerLabel: "Overheat Level",
        resourceOutput: { metal: 5, food: -1, science: 0 }, // Mine consumes food
        actionCooldown: 5000, // 5 seconds
        unlocks: 'farm',
        unlockCost: { metal: 50, food: 20 },
        dangerIncreaseRate: 2, // Per second when inactive
        dangerThreshold: 90,
        disaster: "Mine Overheat! 🔩 Metal production halved until reset."
    },
    farm: {
        name: "Hydroponics Farm 🍎",
        theme: "farm-theme",
        dangerLabel: "Decay Rate",
        resourceOutput: { metal: 0, food: 10, science: -2 }, // Farm consumes science
        actionCooldown: 4000,
        unlocks: 'lab',
        unlockCost: { food: 100, science: 50 },
        dangerIncreaseRate: 3, // Per second when inactive
        dangerThreshold: 80,
        disaster: "Crop Rot! 🍎 Food production halved until reset."
    },
    lab: {
        name: "Research Lab 🧪",
        theme: "lab-theme",
        dangerLabel: "Contamination",
        resourceOutput: { metal: -2, food: 0, science: 10 }, // Lab consumes metal
        actionCooldown: 7000,
        unlocks: null, // End of available facilities for now
        unlockCost: {},
        dangerIncreaseRate: 1.5, // Per second when inactive
        dangerThreshold: 95,
        disaster: "Contamination! 🧪 Science production halved until reset."
    }
};

let gameData = {};
let lastUpdateTime = performance.now();
let facilityCooldown = 0;
let facilityState = FACILITY_DATA[FACILITY_KEY];
let productionRunning = false;
let gameLoopInterval = null;

// --- 2. DOM Elements ---
const D = (id) => document.getElementById(id);
const $ = {
    container: D('game-container'),
    name: D('facility-name'),
    resMetal: D('res-metal'),
    resFood: D('res-food'),
    resScience: D('res-science'),
    statusText: D('status-text'),
    dangerBar: D('danger-bar'),
    dangerLabel: D('danger-label'),
    actionButton: D('action-button'),
    cooldownText: D('cooldown-text'),
    unlockButton: D('unlock-button'),
    unlockCostText: D('unlock-cost-text'),
    unlockedLinks: D('unlocked-links')
};

// --- 3. LocalStorage & State Functions ---

/**
 * Initializes or loads the global game state from localStorage.
 */
function loadInitialState() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        gameData = JSON.parse(storedData);
    } else {
        // Initial setup for a new game
        gameData = {
            resources: { metal: 10, food: 10, science: 0 },
            facilities: {
                mine: { unlocked: true, danger: 0, disaster: false, lastAction: 0 },
                farm: { unlocked: false, danger: 0, disaster: false, lastAction: 0 },
                lab: { unlocked: false, danger: 0, disaster: false, lastAction: 0 }
            }
        };
    }
    // Update local state and UI
    updateUI();
    initializeFacilityUI();
}

/**
 * Saves the global game state to localStorage.
 */
function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameData));
}

/**
 * Updates the resource and facility status in the UI.
 */
function updateUI() {
    // Update Global Resources
    $.resMetal.textContent = `🔩 Metal: ${Math.floor(gameData.resources.metal)}`;
    $.resFood.textContent = `🍎 Food: ${Math.floor(gameData.resources.food)}`;
    $.resScience.textContent = `🧪 Science: ${Math.floor(gameData.resources.science)}`;

    // Update Current Facility Status
    const currentFacilityData = gameData.facilities[FACILITY_KEY];
    $.dangerBar.value = currentFacilityData.danger;
    
    // Status text and disaster
    if (currentFacilityData.disaster) {
        $.statusText.textContent = `🚨 DISASTER: ${facilityState.disaster} Click action button to reset!`;
        $.statusText.classList.add('disaster-text');
        $.actionButton.textContent = "RESET FACILITY";
    } else if (productionRunning) {
        $.statusText.textContent = "SYSTEM NOMINAL: Production is active and running.";
        $.statusText.classList.remove('disaster-text');
        $.actionButton.textContent = "START CYCLE";
    } else {
         $.statusText.textContent = "SYSTEM PAUSED: Wait for cooldown or refocus tab.";
         $.statusText.classList.remove('disaster-text');
         $.actionButton.textContent = "START CYCLE";
    }
    
    updateUnlockUI();
    saveState();
}

// --- 4. Game Loop and Time Dilation Logic ---

/**
 * The main game loop that runs only when the tab is focused.
 */
function gameLoop() {
    // Read the latest state from storage in case another tab updated it
    loadInitialState(); 
    
    const now = performance.now();
    const deltaTime = now - lastUpdateTime; // Time since last frame (in milliseconds)
    const currentFacility = gameData.facilities[FACILITY_KEY];

    // 1. Production Logic (Runs only if not in disaster and action has been taken)
    if (!currentFacility.disaster && productionRunning) {
        const secondsElapsed = deltaTime / 1000;
        
        // Resource generation (per second)
        gameData.resources.metal += facilityState.resourceOutput.metal * secondsElapsed;
        gameData.resources.food += facilityState.resourceOutput.food * secondsElapsed;
        gameData.resources.science += facilityState.resourceOutput.science * secondsElapsed;

        // Ensure resources don't go below zero
        gameData.resources.metal = Math.max(0, gameData.resources.metal);
        gameData.resources.food = Math.max(0, gameData.resources.food);
        gameData.resources.science = Math.max(0, gameData.resources.science);
        
        // Danger reduction when actively managed
        currentFacility.danger = Math.max(0, currentFacility.danger - (0.5 * secondsElapsed));
    }
    
    // 2. Cooldown Logic
    facilityCooldown = Math.max(0, currentFacility.lastAction + facilityState.actionCooldown - now);
    $.cooldownText.textContent = facilityCooldown > 0 
        ? `Ready in: ${Math.ceil(facilityCooldown / 1000)}s` 
        : "READY!";

    // Button activation logic
    $.actionButton.disabled = currentFacility.disaster ? false : facilityCooldown > 0;
    
    lastUpdateTime = now;
    updateUI();
    saveState();
}


/**
 * Core Time Dilation handler: Calculates offline time and applies decay.
 */
function handleVisibilityChange() {
    if (document.hidden) {
        // Tab loses focus: Pause the loop and record time.
        clearInterval(gameLoopInterval);
        lastUpdateTime = performance.now(); // Record current time
        productionRunning = false;
        console.log(`${facilityState.name} paused.`);
        $.statusText.textContent = "SYSTEM DORMANT: Tab is inactive. Danger is RISING!";
    } else {
        // Tab gains focus: Calculate offline time and apply decay/disaster.
        const timePaused = performance.now() - lastUpdateTime;
        const secondsOffline = timePaused / 1000;
        const currentFacility = gameData.facilities[FACILITY_KEY];

        if (secondsOffline > 1) { // Only process if more than 1 second has passed
            
            // 1. Danger Calculation (Decay)
            const dangerIncrease = facilityState.dangerIncreaseRate * secondsOffline;
            currentFacility.danger += dangerIncrease;
            console.log(`Offline for ${secondsOffline.toFixed(1)}s. Danger +${dangerIncrease.toFixed(1)}.`);

            // 2. Disaster Check
            if (currentFacility.danger >= facilityState.dangerThreshold) {
                currentFacility.disaster = true;
                currentFacility.danger = 100; // Max out danger on disaster
                console.warn(`${facilityState.name} suffered a DISASTER!`);
            }
        }
        
        // Re-start the loop
        lastUpdateTime = performance.now(); // Reset update time for a clean start
        gameLoopInterval = setInterval(gameLoop, 50); // Run at 20 FPS
        console.log(`${facilityState.name} resumed.`);
        
        updateUI(); // Immediately update UI after potential offline decay
    }
}

// --- 5. UI and Action Handlers ---

/**
 * Sets up facility-specific styles and information.
 */
function initializeFacilityUI() {
    document.title = facilityState.name;
    $.container.className = facilityState.theme;
    $.name.textContent = facilityState.name;
    $.dangerLabel.textContent = facilityState.dangerLabel;
    
    // Apply danger bar styling
    $.dangerBar.classList.add(`danger-${FACILITY_KEY}`);
}

/**
 * Handles the main action button click (Start Production or Reset Disaster).
 */
function handleActionButton() {
    const currentFacility = gameData.facilities[FACILITY_KEY];

    if (currentFacility.disaster) {
        // Reset Disaster
        currentFacility.disaster = false;
        currentFacility.danger = 0;
        currentFacility.lastAction = performance.now(); // Give player a fresh cooldown
        productionRunning = false;
        $.actionButton.disabled = true; // Set to disabled until cooldown is over
        $.statusText.textContent = "System Reset Successful. Start production when ready.";
    } else if (facilityCooldown <= 0) {
        // Start Production Cycle
        currentFacility.lastAction = performance.now();
        productionRunning = true;
        $.actionButton.disabled = true;
        $.statusText.textContent = "Production Cycle Initiated!";
    }
    saveState();
    updateUI();
}

/**
 * Handles the logic for unlocking and generating new facility links.
 */
function updateUnlockUI() {
    const nextFacilityKey = facilityState.unlocks;
    const currentFacilityData = gameData.facilities[FACILITY_KEY];
    
    $.unlockedLinks.innerHTML = '<h3>Active Facilities:</h3>';
    let canUnlock = true;
    
    // Display links to all UNLOCKED facilities
    for (const key in gameData.facilities) {
        if (gameData.facilities[key].unlocked) {
            const link = document.createElement('a');
            link.href = `index.html?facility=${key}`;
            link.target = '_blank';
            link.textContent = FACILITY_DATA[key].name;
            $.unlockedLinks.appendChild(link);
            $.unlockedLinks.appendChild(document.createElement('br'));
        }
    }

    // Handle Unlock Button and Cost
    if (nextFacilityKey && !gameData.facilities[nextFacilityKey].unlocked) {
        const cost = facilityState.unlockCost;
        let costString = '';

        for (const res in cost) {
            costString += `${cost[res]} ${res} / `;
            if (gameData.resources[res] < cost[res]) {
                canUnlock = false;
            }
        }
        
        $.unlockCostText.textContent = costString.slice(0, -3); // Remove trailing ' / '
        $.unlockButton.disabled = !canUnlock;
        $.unlockButton.onclick = () => {
            if (canUnlock) {
                // Deduct cost
                for (const res in cost) {
                    gameData.resources[res] -= cost[res];
                }
                // Unlock facility
                gameData.facilities[nextFacilityKey].unlocked = true;
                saveState();
                updateUI(); // Re-render links
                alert(`Facility ${FACILITY_DATA[nextFacilityKey].name} Unlocked! Open it in a NEW TAB!`);
            }
        };
    } else {
        $.unlockCostText.textContent = "N/A (All available facilities unlocked)";
        $.unlockButton.style.display = 'none';
    }
}

// --- 6. Initialization ---

// Start listening for tab focus changes immediately
document.addEventListener('visibilitychange', handleVisibilityChange);

// Handle the main button click
$.actionButton.addEventListener('click', handleActionButton);

// Initial setup and start of the loop
loadInitialState();
handleVisibilityChange(); // This starts the game loop if the tab is focused.