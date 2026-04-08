// --- 1. Global Constants and Cookie Keys ---
const COOKIE_KEYS = ['gold', 'health', 'food', 'army'];
const CHECKSUM_KEY = 'hash';
const AUDIT_THRESHOLD_GOLD = 1000; // Gold amount that triggers audit rules
const START_VALUES = { gold: 100, health: 10, food: 50, army: 1 };

// --- 2. DOM Elements ---
const D = (id) => document.getElementById(id);
const $ = {
    resGold: D('res-gold'),
    resHealth: D('res-health'),
    resFood: D('res-food'),
    resArmy: D('res-army'),
    auditMessage: D('audit-message'),
    collectTaxBtn: D('collect-tax'),
    trainArmyBtn: D('train-army'),
    advanceDayBtn: D('advance-day')
};

// --- 3. Cookie Management (The Core API) ---

/**
 * Reads a single cookie value and attempts to parse it as a float.
 */
function getCookie(key) {
    const name = key + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            // Return the value, parsed as a float
            return parseFloat(c.substring(name.length, c.length));
        }
    }
    return null;
}

/**
 * Sets a cookie with a given key and value.
 * Cookies persist for a week.
 */
function setCookie(key, value) {
    const d = new Date();
    d.setTime(d.getTime() + (7*24*60*60*1000)); // 7 days expiration
    const expires = "expires="+ d.toUTCString();
    document.cookie = key + "=" + value + ";" + expires + ";path=/";
}

/**
 * Calculates a simple checksum based on resource cookies.
 * This is the value the player MUST manually update if they cheat.
 */
function calculateChecksum(resources) {
    // Simple sum of all core resources, multiplied by a 'salt' (Health)
    const sum = resources.gold + resources.health + resources.food + resources.army;
    // Use the string version of the sum to make it slightly less guessable
    return sum.toFixed(2); 
}

/**
 * Loads all resources from cookies into a map. Initializes if cookies are missing.
 */
function loadResources() {
    let resources = {};
    let initialized = false;

    // Load existing cookies
    COOKIE_KEYS.forEach(key => {
        const value = getCookie(key);
        if (value === null || isNaN(value)) {
            resources[key] = START_VALUES[key];
            initialized = true;
        } else {
            resources[key] = value;
        }
    });

    // If game is new or cookies are broken, save initial state and checksum
    if (initialized) {
        saveResources(resources);
    }
    
    return resources;
}

/**
 * Saves the current state of resources and updates the checksum cookie.
 */
function saveResources(resources) {
    // 1. Save all resource cookies
    COOKIE_KEYS.forEach(key => {
        // Round to 2 decimal places to allow for non-integer cheating
        setCookie(key, resources[key].toFixed(2)); 
    });

    // 2. Calculate and save the checksum
    const hash = calculateChecksum(resources);
    setCookie(CHECKSUM_KEY, hash);
}


// --- 4. Audit and Game Logic ---

function checkAudit(resources) {
    const currentHash = getCookie(CHECKSUM_KEY);
    const calculatedHash = calculateChecksum(resources);

    // --- Critical Check 1: Checksum Integrity ---
    if (currentHash !== calculatedHash) {
        gameOver("🚨 **Audit Failed: CHECKSUM MISMATCH!** You edited resources but forgot to update the 'hash' cookie.");
        return true;
    }

    // --- Critical Check 2: Suspiciously Clean Data ---
    if (resources.gold > AUDIT_THRESHOLD_GOLD && resources.gold % 100 === 0 && resources.food % 10 === 0) {
        gameOver("🚨 **Audit Failed: SUSPICIOUSLY CLEAN BOOKS!** Perfect numbers are impossible. You were caught!");
        return true;
    }
    
    // --- Critical Check 3: Implausible Army Size ---
    if (resources.army > 50 && resources.health < 5) {
        gameOver("🚨 **Audit Failed: UNBELIEVABLE POWER!** Your weak kingdom cannot possibly sustain that army size. Busted!");
        return true;
    }

    // Pass
    $.auditMessage.textContent = "Audit Status: System Nominal (For now...)";
    $.auditMessage.className = "nominal";
    return false;
}

function advanceDay() {
    let resources = loadResources();

    // 1. Consumption (Natural Game Progression)
    resources.food -= resources.army * 1; // Army consumes food
    resources.health -= 1; // Daily health attrition

    // 2. Negative Value Penalty
    if (resources.food < 0 || resources.health < 0) {
        gameOver("👑 **Game Over:** Resource consumption led to collapse.");
        return;
    }

    // 3. Audit Check (Happens every day)
    if (checkAudit(resources)) return;

    // 4. Save and Update
    saveResources(resources);
    updateUI(resources);
}

// --- 5. Action Handlers ---

function collectTax() {
    let resources = loadResources();
    resources.gold += 10 + Math.random(); // Add a random float to encourage non-rounded cheating
    saveResources(resources);
    updateUI(resources);
}

function trainArmy() {
    let resources = loadResources();
    if (resources.gold >= 20) {
        resources.gold -= 20;
        resources.army += 1;
        saveResources(resources);
    } else {
        alert("Not enough gold to train army!");
    }
    updateUI(resources);
}

// --- 6. UI and Game End ---

function updateUI(resources) {
    if (!resources) resources = loadResources();
    
    $.resGold.textContent = resources.gold.toFixed(2);
    $.resHealth.textContent = resources.health.toFixed(0);
    $.resFood.textContent = resources.food.toFixed(0);
    $.resArmy.textContent = resources.army.toFixed(0);
}

function gameOver(message) {
    // Disable actions
    $.collectTaxBtn.disabled = true;
    $.trainArmyBtn.disabled = true;
    $.advanceDayBtn.disabled = true;
    
    // Display failure message
    $.auditMessage.innerHTML = message;
    $.auditMessage.className = "warning";
    
    alert(message + "\n\nTo try again, manually clear all game cookies and refresh.");
}


// --- 7. Initialization ---

$.collectTaxBtn.addEventListener('click', collectTax);
$.trainArmyBtn.addEventListener('click', trainArmy);
$.advanceDayBtn.addEventListener('click', advanceDay);

// Initial load and render
updateUI();