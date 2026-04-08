// --- 1. Game State Variables ---
let currency = 0;
let clickPower = 1;
let cps = 0; // Coins per second
let gameInterval; // For passive income

// Define upgrade types
const upgrades = {
    cursor: {
        name: "Cursor",
        baseCost: 10,
        costMultiplier: 1.15,
        baseCps: 0.1,
        level: 0
    },
    grandma: {
        name: "Grandma",
        baseCost: 100,
        costMultiplier: 1.15,
        baseCps: 1,
        level: 0
    },
    farm: {
        name: "Farm",
        baseCost: 1100,
        costMultiplier: 1.15,
        baseCps: 8,
        level: 0
    },
    mine: {
        name: "Mine",
        baseCost: 12000,
        costMultiplier: 1.15,
        baseCps: 47,
        level: 0
    }
    // Add more upgrade types here
};

// --- 2. DOM Element References ---
const currencyAmountDisplay = document.getElementById('currency-amount');
const cpsDisplay = document.getElementById('cps-display');
const mainClicker = document.getElementById('main-clicker');
const upgradesList = document.getElementById('upgrades-list');

// --- 3. Persistence (Local Storage) ---

function saveGame() {
    const gameState = {
        currency: currency,
        clickPower: clickPower,
        upgrades: upgrades
    };
    localStorage.setItem('idleClickerGame', JSON.stringify(gameState));
}

function loadGame() {
    const savedState = localStorage.getItem('idleClickerGame');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        currency = gameState.currency;
        clickPower = gameState.clickPower;
        
        // Merge saved upgrades with default ones, ensure all exist
        for (const key in upgrades) {
            if (gameState.upgrades[key]) {
                upgrades[key] = gameState.upgrades[key];
            }
        }
    }
    updateAllUI();
    calculateCps();
}

// --- 4. Game Logic Functions ---

function addCurrency(amount) {
    currency += amount;
    updateCurrencyDisplay();
    saveGame(); // Save after every currency change
}

function calculateCps() {
    let totalCps = 0;
    for (const key in upgrades) {
        const upgrade = upgrades[key];
        totalCps += upgrade.level * upgrade.baseCps;
    }
    cps = totalCps;
    cpsDisplay.textContent = cps.toFixed(1);
}

function buyUpgrade(upgradeId) {
    const upgrade = upgrades[upgradeId];
    if (!upgrade) return;

    const currentCost = Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));

    if (currency >= currentCost) {
        currency -= currentCost;
        upgrade.level++;
        addCurrency(0); // Update currency display
        calculateCps();
        renderUpgrades(); // Re-render to show new levels/costs
        saveGame();
    } else {
        // Optional: Provide feedback to the user that they don't have enough money
        console.log("Not enough coins to buy " + upgrade.name);
    }
}

function passiveIncome() {
    addCurrency(cps);
}

// --- 5. UI Update Functions ---

function updateCurrencyDisplay() {
    currencyAmountDisplay.textContent = Math.floor(currency).toLocaleString(); // Use floor for display
}

function renderUpgrades() {
    upgradesList.innerHTML = ''; // Clear existing list

    for (const key in upgrades) {
        const upgrade = upgrades[key];
        const currentCost = Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));

        const upgradeItem = document.createElement('div');
        upgradeItem.classList.add('upgrade-item');
        upgradeItem.setAttribute('data-upgrade-id', key);

        upgradeItem.innerHTML = `
            <span class="upgrade-name">${upgrade.name}</span>
            <span class="upgrade-info">Cost: <span class="cost">${currentCost.toLocaleString()}</span>, CPS: <span class="cps">${upgrade.baseCps.toFixed(1)}</span></span>
            <span class="upgrade-level">Lv: <span class="level">${upgrade.level}</span></span>
            <button class="buy-button">Buy</button>
        `;
        
        const buyButton = upgradeItem.querySelector('.buy-button');
        buyButton.disabled = currency < currentCost;
        buyButton.addEventListener('click', () => buyUpgrade(key));

        upgradesList.appendChild(upgradeItem);
    }
}

function updateAllUI() {
    updateCurrencyDisplay();
    calculateCps();
    renderUpgrades();
}

// --- 6. Event Listeners ---

mainClicker.addEventListener('click', () => {
    addCurrency(clickPower);
});

// --- 7. Game Initialization ---

function initGame() {
    loadGame(); // Load saved game state
    gameInterval = setInterval(passiveIncome, 1000); // 1 second passive income tick
    
    // Periodically update UI elements that might change (like button states)
    setInterval(() => {
        renderUpgrades(); // Re-render to update button disabled states based on current currency
    }, 500); // Update twice per second
}

initGame();