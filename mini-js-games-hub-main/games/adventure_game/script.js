// --- DOM Elements ---
const storyText = document.getElementById('story-text');
const choicesContainer = document.getElementById('choices-container');
const healthDisplay = document.getElementById('health');
const inventoryDisplay = document.getElementById('inventory');
const restartButton = document.getElementById('restart-button');

// --- Game State Variables ---
let player = {
    health: 10,
    inventory: []
};

let currentScene = 'start';

// --- Game World Definition (The Story/State Object) ---

const gameScenes = {
    start: {
        text: "You awaken in a damp, cold chamber. A faint glow emanates from two passages: one leading **North** and one leading **East**.",
        choices: [
            { text: "Go North, toward the faint light.", nextScene: "passage_north" },
            { text: "Go East, toward the deeper shadows.", nextScene: "passage_east" },
            { text: "Check your pockets.", nextScene: "start", effect: () => alert("You find nothing but lint and despair.") }
        ]
    },
    
    passage_north: {
        text: "The northern passage opens into a circular room. In the center is a **pedestal** holding a small, rusty **key**. A large, snoring **troll** blocks the exit to the West.",
        choices: [
            { text: "Take the Key.", nextScene: "passage_north", effect: () => takeItem('Rusty Key', 1) },
            { text: "Try to sneak past the Troll (requires Key).", nextScene: "troll_fight", condition: () => player.inventory.includes('Rusty Key') },
            { text: "Go Back (South).", nextScene: "start" }
        ]
    },

    passage_east: {
        text: "The eastern passage is a dead-end. You find an ancient, ornate **dagger** lying in the dust. You hear faint whispers coming from the North.",
        choices: [
            { text: "Take the Dagger.", nextScene: "passage_east", effect: () => takeItem('Dagger', 0) },
            { text: "Go Back (West).", nextScene: "start" }
        ]
    },

    troll_fight: {
        text: "", // Text will be set dynamically based on outcome
        choices: [
            { text: "Continue...", nextScene: "passage_west" }
        ],
        // Special function to handle a combat/conditional outcome
        onEnter: () => {
            if (player.inventory.includes('Dagger')) {
                player.health -= 2;
                gameScenes.troll_fight.text = "You distract the troll with the key, then plunge the dagger into its soft belly! The troll roars and collapses. You take 2 damage in the struggle.";
            } else {
                player.health -= 5;
                gameScenes.troll_fight.text = "You manage to distract the troll with the key, but without a weapon, the troll swipes you hard before you escape. You barely slip by, taking 5 damage.";
            }
            updateStatus();
            if (player.health <= 0) {
                return 'death';
            }
            return null; // Continue to the next scene as normal
        }
    },

    passage_west: {
        text: "You stagger into a large cavern. You see the **Lost Artifact** shimmering on a ledge! You are victorious!",
        choices: [],
        onEnter: () => endGame("Victory! You found the Lost Artifact.")
    },

    death: {
        text: "Your health has fallen to zero. Your quest ends here.",
        choices: [],
        onEnter: () => endGame("Defeated.")
    }
};

// --- Game Logic Functions ---

/**
 * Updates the UI based on the player's current health and inventory.
 */
function updateStatus() {
    healthDisplay.textContent = player.health;
    inventoryDisplay.textContent = player.inventory.length > 0 ? player.inventory.join(', ') : 'Empty';
}

/**
 * Handles picking up an item.
 * @param {string} item The name of the item.
 * @param {number} healthBoost Optional health increase.
 */
function takeItem(item, healthBoost = 0) {
    if (!player.inventory.includes(item)) {
        player.inventory.push(item);
        player.health += healthBoost;
        alert(`${item} added to inventory!`);
    } else {
        alert(`You already have the ${item}.`);
    }
    updateStatus();
}

/**
 * Renders the story text and choices for the current scene.
 */
function renderScene() {
    const scene = gameScenes[currentScene];
    storyText.innerHTML = `<p>${scene.text}</p>`;
    choicesContainer.innerHTML = ''; // Clear old choices
    restartButton.style.display = 'none';

    // Handle special scene logic (like combat resolution)
    if (scene.onEnter) {
        const nextOverride = scene.onEnter();
        if (nextOverride) {
            currentScene = nextOverride;
            renderScene();
            return;
        }
    }

    // Render choices as buttons
    scene.choices.forEach((choice) => {
        const button = document.createElement('button');
        button.classList.add('choice-button');
        button.textContent = choice.text;
        
        // Check for conditions (e.g., must have key)
        if (choice.condition && !choice.condition()) {
            button.disabled = true;
            button.title = "Requires a certain item or condition.";
        } else {
            button.onclick = () => makeChoice(choice);
        }

        choicesContainer.appendChild(button);
    });
}

/**
 * Processes the player's choice and moves to the next scene.
 * @param {object} choice The selected choice object.
 */
function makeChoice(choice) {
    // 1. Apply any immediate effects (like picking up an item)
    if (choice.effect) {
        choice.effect();
    }
    
    // 2. Transition to the next scene
    currentScene = choice.nextScene;
    
    // 3. Render the new scene
    renderScene();
}

/**
 * Ends the game and cleans up the UI.
 * @param {string} finalMessage The message to display (e.g., Victory/Defeat).
 */
function endGame(finalMessage) {
    storyText.innerHTML = `<p class="game-end">**GAME OVER**</p><p>${finalMessage}</p><p>Your final health was: ${player.health}</p>`;
    choicesContainer.innerHTML = '';
    restartButton.style.display = 'block';
}

/**
 * Resets all variables and starts the game over.
 */
function restartGame() {
    player = { health: 10, inventory: [] };
    currentScene = 'start';
    updateStatus();
    renderScene();
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    updateStatus();
    renderScene();
    restartButton.onclick = restartGame;
});