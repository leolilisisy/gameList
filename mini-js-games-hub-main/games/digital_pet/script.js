// --- 1. Game State Variables ---
const DECAY_RATE = 2; // How much stats decrease per tick
const REFRESH_RATE_MS = 1000; // Time per tick (1 second)
const CRITICAL_THRESHOLD = 20; // Point where status is critical

let hunger = 100;
let happiness = 100;
let petStatus = "😊";
let gameInterval; // To hold the setInterval ID

// --- 2. DOM Element References ---
const petEmoji = document.getElementById('pet-emoji');
const hungerBar = document.getElementById('hunger-bar');
const happinessBar = document.getElementById('happiness-bar');
const hungerValue = document.getElementById('hunger-value');
const happinessValue = document.getElementById('happiness-value');
const messageArea = document.getElementById('message-area');

const feedButton = document.getElementById('feed-button');
const playButton = document.getElementById('play-button');
const sleepButton = document.getElementById('sleep-button');

// --- 3. Core Logic Functions ---

// Clamps a value between 0 and 100
function clampStat(value) {
    return Math.max(0, Math.min(100, value));
}

// Updates the progress bars and status text
function updateUI() {
    hungerBar.value = hunger;
    happinessBar.value = happiness;
    hungerValue.textContent = `${hunger}%`;
    happinessValue.textContent = `${happiness}%`;
    petEmoji.textContent = petStatus;

    // Change progress bar color if status is low
    if (hunger <= CRITICAL_THRESHOLD) {
        hungerBar.classList.add('low');
    } else {
        hungerBar.classList.remove('low');
    }
    if (happiness <= CRITICAL_THRESHOLD) {
        happinessBar.classList.add('low');
    } else {
        happinessBar.classList.remove('low');
    }

    // Check for game over (both stats at 0)
    if (hunger === 0 && happiness === 0) {
        endGame("Pixel gave up! Try to keep both stats above zero next time.");
    }
}

// Handles the automatic decay of stats
function decayStats() {
    // Decrease stats by decay rate
    hunger = clampStat(hunger - DECAY_RATE);
    happiness = clampStat(happiness - DECAY_RATE / 2); // Happiness drains slower

    // Update pet's visual state (emoji)
    if (hunger <= CRITICAL_THRESHOLD || happiness <= CRITICAL_THRESHOLD) {
        petStatus = "😫"; // Sad/Stressed
        messageArea.classList.add('critical');
        messageArea.textContent = "Pixel is suffering! Please help!";
    } else if (hunger < 50 || happiness < 50) {
        petStatus = "😟"; // Neutral/Worried
        messageArea.classList.remove('critical');
        messageArea.textContent = "Pixel is getting restless...";
    } else {
        petStatus = "😊"; // Happy
        messageArea.classList.remove('critical');
        messageArea.textContent = "Pixel is happy and thriving!";
    }
    
    updateUI();
}

// --- 4. Player Action Functions ---

function feedPet() {
    if (hunger === 100) {
        messageArea.textContent = "Pixel is too full right now!";
        return;
    }
    hunger = clampStat(hunger + 30);
    messageArea.textContent = "Pixel enjoys the tasty snack! Hunger +30";
    updateUI();
}

function playPet() {
    if (happiness === 100) {
        messageArea.textContent = "Pixel needs a moment to breathe!";
        return;
    }
    happiness = clampStat(happiness + 25);
    hunger = clampStat(hunger - 5); // Playing makes the pet slightly hungry
    messageArea.textContent = "Pixel had fun! Happiness +25, Hunger -5";
    updateUI();
}

function sleepPet() {
    // Sleep significantly boosts happiness, but also makes them a bit hungrier
    happiness = clampStat(happiness + 15);
    hunger = clampStat(hunger - 10); 
    messageArea.textContent = "Zzz... Pixel is well-rested. Happiness +15, Hunger -10";
    updateUI();
}

// --- 5. Game Management ---

function startGame() {
    // Set initial stats and UI
    hunger = 100;
    happiness = 100;
    petStatus = "😊";
    messageArea.textContent = "Welcome Pixel! Let the game begin.";
    
    // Clear any existing interval and start the new one
    clearInterval(gameInterval);
    gameInterval = setInterval(decayStats, REFRESH_RATE_MS);
    
    // Re-enable buttons
    feedButton.disabled = false;
    playButton.disabled = false;
    sleepButton.disabled = false;

    updateUI();
}

function endGame(reason) {
    clearInterval(gameInterval);
    petStatus = "💀"; // Game Over emoji
    messageArea.textContent = `GAME OVER: ${reason} Click any button to restart.`;
    
    // Disable buttons to indicate game end
    feedButton.disabled = true;
    playButton.disabled = true;
    sleepButton.disabled = true;

    updateUI();
    
    // Set up a click listener on the buttons to restart the game
    feedButton.addEventListener('click', startGame, { once: true });
    playButton.addEventListener('click', startGame, { once: true });
    sleepButton.addEventListener('click', startGame, { once: true });
}

// --- 6. Event Listeners ---
feedButton.addEventListener('click', feedPet);
playButton.addEventListener('click', playPet);
sleepButton.addEventListener('click', sleepPet);


// --- 7. Initialization ---
startGame();