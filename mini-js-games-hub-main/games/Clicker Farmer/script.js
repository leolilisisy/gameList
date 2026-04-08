// --- DOM Elements ---
const moneyDisplay = document.getElementById('money-display');
const levelDisplay = document.getElementById('level-display');
const xpDisplay = document.getElementById('xp-display');
const xpNextDisplay = document.getElementById('xp-next-display');
const farmLand = document.getElementById('farm-land');
const buyLandBtn = document.getElementById('buy-land-btn');
const notificationContainer = document.getElementById('notification-container');
const cropStoreButtons = document.getElementById('crop-store-buttons');
const resetBtn = document.getElementById('reset-btn');

// --- Game State ---
let gameState = {};

// --- Game Configuration & Data ---
const CROPS_DATA = {
    wheat: { id: 'wheat', name: 'Wheat', emoji: '🌾', baseCost: 5, baseProfit: 15, growTime: 3000, xp: 10, unlockLevel: 1 },
    carrot: { id: 'carrot', name: 'Carrot', emoji: '🥕', baseCost: 20, baseProfit: 50, growTime: 5000, xp: 25, unlockLevel: 3 },
    strawberry: { id: 'strawberry', name: 'Strawberry', emoji: '🍓', baseCost: 50, baseProfit: 120, growTime: 8000, xp: 60, unlockLevel: 5 }
};

// --- Sound Effects System ---
const sounds = { plant: new Audio(''), harvest: new Audio(''), error: new Audio(''), buy: new Audio('') };
function playSound(sound) { try { sounds[sound].currentTime = 0; sounds[sound].play(); } catch (e) {} }

// --- Main Game Functions ---
function initializeGame() {
    loadGame();
    render();
    farmLand.addEventListener('click', handlePlotClick);
    buyLandBtn.addEventListener('click', buyLand);
    resetBtn.addEventListener('click', resetGame);
    setInterval(saveGame, 5000);
    setInterval(updateTimers, 100);
}

// --- State & Save/Load Functions ---
function setDefaultState() {
    gameState = {
        money: 10, level: 1, xp: 0,
        plots: Array.from({ length: 6 }, () => ({ state: 'empty', cropId: null, plantedAt: null })),
        selectedCropId: 'wheat', lastPlayed: Date.now()
    };
}

function saveGame() {
    gameState.lastPlayed = Date.now();
    localStorage.setItem('clickerFarmerSave', JSON.stringify(gameState));
}

function loadGame() {
    const savedState = localStorage.getItem('clickerFarmerSave');
    if (savedState) {
        gameState = JSON.parse(savedState);
        calculateOfflineProgress();
    } else { setDefaultState(); }
}

function resetGame() {
    showNotification("Your progress has been reset.", "info");
    setTimeout(() => {
        localStorage.removeItem('clickerFarmerSave');
        location.reload();
    }, 1000);
}

function calculateOfflineProgress() {
    const timePassed = Date.now() - (gameState.lastPlayed || Date.now());
    let offlineEarnings = 0;
    gameState.plots.forEach(plot => {
        if (plot.state === 'planted') {
            const crop = getCrop(plot.cropId);
            const timeSincePlanted = (Date.now() - plot.plantedAt);
            if (timeSincePlanted >= crop.growTime) {
                plot.state = 'ready';
                offlineEarnings += crop.profit;
                gainXP(crop.xp, false);
            }
        }
    });
    if (offlineEarnings > 0) {
        gameState.money += offlineEarnings;
        showNotification(`Welcome back! You earned ${formatNumber(offlineEarnings)} while away.`, 'info');
    }
}

// --- UI & Rendering ---
function render() {
    updateUI();
    renderStore();
    farmLand.innerHTML = '';
    gameState.plots.forEach((plot, index) => {
        const plotElement = document.createElement('div');
        plotElement.className = `farm-plot ${plot.state}`;
        plotElement.dataset.index = index;
        plotElement.innerHTML = `<div class="plot-crop"></div><div class="plot-timer"></div>`;
        if (plot.state === 'planted' || plot.state === 'ready') {
            plotElement.querySelector('.plot-crop').textContent = getCrop(plot.cropId).emoji;
        }
        farmLand.appendChild(plotElement);
    });
}

// REFINED: Update UI with number formatting
function updateUI() {
    moneyDisplay.textContent = formatNumber(gameState.money);
    levelDisplay.textContent = gameState.level;
    const xpNext = gameState.level * 100;
    xpDisplay.textContent = formatNumber(gameState.xp);
    xpNextDisplay.textContent = formatNumber(xpNext);
    const price = getLandPrice();
    buyLandBtn.innerHTML = `Buy Plot (${formatNumber(price)})`;
    buyLandBtn.disabled = gameState.money < price;
}

function updateTimers() {
    document.querySelectorAll('.farm-plot.planted').forEach(plotElement => {
        const index = parseInt(plotElement.dataset.index);
        const plot = gameState.plots[index];
        if(!plot) return;
        const crop = getCrop(plot.cropId);
        const timePassed = Date.now() - plot.plantedAt;
        const progress = Math.min(100, (timePassed / crop.growTime) * 100);
        const timerDiv = plotElement.querySelector('.plot-timer');
        if(timerDiv) timerDiv.style.width = `${progress}%`;
    });
}

function renderStore() {
    cropStoreButtons.innerHTML = '';
    for (const cropId in CROPS_DATA) {
        const crop = getCrop(cropId);
        const button = document.createElement('button');
        const isUnlocked = gameState.level >= crop.unlockLevel;
        button.innerHTML = `${crop.emoji}<br>${crop.name}`;
        button.title = `Cost: ${formatNumber(crop.cost)}, Profit: ${formatNumber(crop.profit)}, Time: ${crop.growTime/1000}s`;
        if (!isUnlocked) {
            button.disabled = true;
            button.title += ` (Unlocks at Level ${crop.unlockLevel})`;
        }
        if (gameState.selectedCropId === crop.id) { button.classList.add('selected'); }
        button.onclick = () => {
            if (isUnlocked) { gameState.selectedCropId = crop.id; playSound('buy'); renderStore(); }
            else { showNotification(`Unlock ${crop.name} at Level ${crop.unlockLevel}!`, 'error'); playSound('error'); }
        };
        cropStoreButtons.appendChild(button);
    }
}

// --- Game Logic & Actions ---
// REFINED: Get crop data with level scaling
function getCrop(cropId) {
    const cropData = CROPS_DATA[cropId];
    const levelMultiplier = 1 + (gameState.level - 1) * 0.1; // 10% increase per level
    return {
        ...cropData,
        cost: Math.floor(cropData.baseCost * levelMultiplier),
        profit: Math.floor(cropData.baseProfit * levelMultiplier)
    };
}

function getLandPrice() { return Math.floor(150 * Math.pow(1.5, gameState.plots.length - 6)); }

function buyLand() {
    const price = getLandPrice();
    if (gameState.money >= price) {
        gameState.money -= price;
        gameState.plots.push({ state: 'empty', cropId: null, plantedAt: null });
        playSound('buy'); render();
    }
}

function handlePlotClick(event) {
    const plotElement = event.target.closest('.farm-plot');
    if (!plotElement) return;
    const plotIndex = parseInt(plotElement.dataset.index);
    const plot = gameState.plots[plotIndex];
    if (plot.state === 'empty') plantCrop(plotIndex, plotElement);
    else if (plot.state === 'ready') harvestCrop(plotIndex, plotElement);
}

function plantCrop(plotIndex) {
    const crop = getCrop(gameState.selectedCropId);
    if (gameState.money >= crop.cost) {
        gameState.money -= crop.cost;
        const plot = gameState.plots[plotIndex];
        plot.state = 'planted'; plot.cropId = crop.id; plot.plantedAt = Date.now();
        playSound('plant'); render();
        setTimeout(() => { if (plot.plantedAt) { plot.state = 'ready'; render(); } }, crop.growTime);
    } else { showNotification(`Not enough money to plant ${crop.name}!`, 'error'); playSound('error'); }
}

function harvestCrop(plotIndex, plotElement) {
    const plot = gameState.plots[plotIndex];
    const crop = getCrop(plot.cropId);
    gameState.money += crop.profit;
    gainXP(crop.xp);
    createFloatingText(`+${formatNumber(crop.profit)}`, plotElement);
    plot.state = 'empty'; plot.cropId = null; plot.plantedAt = null;
    playSound('harvest'); render(); flashMoney();
}

// --- Helpers & Visuals ---
function gainXP(amount, showNotif = true) {
    gameState.xp += amount;
    const xpToNextLevel = gameState.level * 100;
    if (gameState.xp >= xpToNextLevel) {
        gameState.xp -= xpToNextLevel; gameState.level++;
        if(showNotif) showNotification(`Congratulations! You've reached Level ${gameState.level}!`, 'success');
        renderStore();
    }
}

// NEW: Number formatting utility
function formatNumber(num) {
    if (num < 1000) return num;
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    return (num / 1000000000).toFixed(1) + 'B';
}

function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    notificationContainer.appendChild(notif);
    setTimeout(() => notif.remove(), 4000);
}

function flashMoney() {
    moneyDisplay.parentElement.classList.add('ui-flash-green');
    setTimeout(() => moneyDisplay.parentElement.classList.remove('ui-flash-green'), 500);
}

// NEW: Floating text on harvest
function createFloatingText(text, element) {
    const float = document.createElement('div');
    float.className = 'harvest-float';
    float.textContent = text;
    element.appendChild(float);
    setTimeout(() => float.remove(), 1500);
}

// --- Start the Game ---
initializeGame();