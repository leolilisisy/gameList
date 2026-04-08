// --- 1. Game Configuration ---
const MAX_STAT = 100;
const DECAY_RATE = 1;      // How much each stat drops per tick
const REFRESH_RATE_MS = 1000; // Tick rate (1 second)
const CRITICAL_THRESHOLD = 30; // Threshold for warning emoji/low bar color

// --- 2. Game State Variables ---
let hunger = MAX_STAT;
let happiness = MAX_STAT;
let energy = MAX_STAT;
let gameInterval;
let petAlive = true;

// --- 3. DOM Element References ---
const petSprite = document.getElementById('pet-sprite');
const petDisplay = document.getElementById('pet-display');
const hungerBar = document.getElementById('hunger-bar');
const happinessBar = document.getElementById('happiness-bar');
const sleepBar = document.getElementById('sleep-bar');
const hungerValue = document.getElementById('hunger-value');
const happinessValue = document.getElementById('happiness-value');
const sleepValue = document.getElementById('sleep-value');
const messageArea = document.getElementById('message-area');

const feedButton = document.getElementById('feed-button');
const playButton = document.getElementById('play-button');
const sleepButton = document.getElementById('sleep-button');
const deathScreen = document.getElementById('death-screen');
const deathMessage = document.getElementById('death-message');
const restartButton = document.getElementById('restart-button');

// --- 4. Core Logic Functions ---

// Clamps a value between 0 and MAX_STAT
const clamp = (value) => Math.max(0, Math.min(MAX_STAT, value));

// Updates the progress bars and status text
function updateUI() {
    hungerBar.value = hunger;
    happinessBar.value = happiness;
    sleepBar.value = energy;
    
    hungerValue.textContent = hunger;
    happinessValue.textContent = happiness;
    sleepValue.textContent = energy;

    // Apply 'low' class for bar color change
    hungerBar.classList.toggle('low', hunger <= CRITICAL_THRESHOLD);
    happinessBar.classList.toggle('low', happiness <= CRITICAL_THRESHOLD);
    sleepBar.classList.toggle('low', energy <= CRITICAL_THRESHOLD);
    
    // Update pet sprite/emoji based on state
    if (hunger === 0 || happiness === 0 || energy === 0) {
        petSprite.textContent = "😵";
        petDisplay.className = 'pet-state-sad';
    } else if (hunger <= CRITICAL_THRESHOLD || happiness <= CRITICAL_THRESHOLD) {
        petSprite.textContent = "😟";
        petDisplay.className = 'pet-state-sad';
        messageArea.textContent = "Pixel is very unhappy! Please help!";
    } else if (energy <= CRITICAL_THRESHOLD) {
        petSprite.textContent = "😴";
        petDisplay.className = 'pet-state-sleepy';
        messageArea.textContent = "Pixel is tired and needs rest.";
    } else {
        petSprite.textContent = "😊";
        petDisplay.className = 'pet-state-happy';
        messageArea.textContent = "Pixel is happy and healthy!";
    }
}

// Handles the automatic decay of stats over time
function decayStats() {
    if (!petAlive) return;

    // Stats decay at different rates
    hunger = clamp(hunger - DECAY_RATE);
    happiness = clamp(happiness - (DECAY_RATE / 2)); // Slower decay
    energy = clamp(energy - DECAY_RATE);
    
    // Check for game over
    if (hunger === 0 || happiness === 0) {
        endGame(hunger === 0 ? "starvation" : "neglect");
        return;
    }
    
    updateUI();
}

// --- 5. Player Action Functions ---

function performAction(stat, amount, message, sideEffectStat, sideEffectAmount) {
    if (!petAlive) return;
    
    // Dynamically update the target stat
    let currentStatValue = window[stat];
    window[stat] = clamp(currentStatValue + amount);

    // Apply side effect
    if (sideEffectStat) {
        let currentSideEffectValue = window[sideEffectStat];
        window[sideEffectStat] = clamp(currentSideEffectValue + sideEffectAmount);
    }
    
    messageArea.textContent = message;
    updateUI();
}

feedButton.addEventListener('click', () => {
    performAction('hunger', 40, "Pixel enjoyed a hearty meal! Hunger +40", 'energy', -5);
});

playButton.addEventListener('click', () => {
    performAction('happiness', 30, "Pixel is energized from playing! Happiness +30", 'hunger', -10);
});

sleepButton.addEventListener('click', () => {
    performAction('energy', 50, "Pixel is well-rested. Energy +50", 'hunger', -5);
});

// --- 6. Game Management ---

function startGame() {
    // Reset state
    hunger = MAX_STAT;
    happiness = MAX_STAT;
    energy = MAX_STAT;
    petAlive = true;
    
    // Reset UI
    deathScreen.classList.add('hidden');
    feedButton.disabled = false;
    playButton.disabled = false;
    sleepButton.disabled = false;
    
    // Clear old interval and start new decay loop
    clearInterval(gameInterval);
    gameInterval = setInterval(decayStats, REFRESH_RATE_MS);
    
    messageArea.textContent = "Pixel has been reset and is ready to play!";
    updateUI();
}

function endGame(reason) {
    petAlive = false;
    clearInterval(gameInterval);
    
    // Show death screen
    deathScreen.classList.remove('hidden');
    deathMessage.textContent = `Pixel died from ${reason}! Final Stats: H:${hunger}, P:${happiness}, E:${energy}`;
    
    // Disable main action buttons
    feedButton.disabled = true;
    playButton.disabled = true;
    sleepButton.disabled = true;
    
    // Final UI update
    updateUI();
}

// --- 7. Initialization ---
restartButton.addEventListener('click', startGame);

// Start the game when the page loads
startGame();