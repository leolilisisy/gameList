// --- 1. Game State and Constants ---
const GAME_STATE = {
    health: 10,
    inventory: ['Rusted Key'],
    location: 'Cell',
    enemyPresent: false,
    enemyHealth: 5
};

const LOCATIONS = {
    'Cell': {
        description: "You are in a damp cell. There is a locked door (north) and a cracked wall (west).",
        options: {
            examine: {
                wall: "The cracked wall is thin. Perhaps a heavy blow could break it.",
                door: "The door is locked. It looks like it needs a key.",
                key: (target) => GAME_STATE.inventory.includes(target) ? `A simple key, rusty but functional.` : `You don't have a ${target}.`
            },
            move: {
                north: (action) => GAME_STATE.inventory.includes('Rusted Key') ? 'You unlock the door! You move north.' : 'The door is locked. You need a key!',
                west: (action) => 'The wall is too thick to break without a tool.',
                east: 'There is a solid wall here.',
                south: 'There is a solid wall here.'
            }
        }
    },
    'Corridor': {
        description: "You are in a dark corridor. A Goblin stands before you!",
        enemyPresent: true,
        options: {
            move: {
                south: 'You retreat back into the cell.',
                north: 'A solid wall blocks your path.'
            },
            examine: {
                goblin: 'A sickly looking goblin. Easy pickings.',
                floor: 'The corridor floor is slimy.'
            }
        }
    }
    // Add more locations here...
};

// --- 2. DOM Elements ---
const D = (id) => document.getElementById(id);
const $ = {
    form: D('action-form'),
    gameText: D('game-text'),
    health: D('player-health'),
    inventory: D('player-inventory'),
    actionSelect: D('action-select'),
    targetInput: D('target-input')
};

// --- 3. Core Logic: Form Submission Handler ---

$.form.addEventListener('submit', (e) => {
    e.preventDefault(); // STOP the default form submission (Crucial for RPG loop)

    // Gather data from the form using FormData API
    const formData = new FormData($.form);
    const action = formData.get('action').toLowerCase();
    const target = formData.get('target').toLowerCase().trim();

    let narrative = "You stand confused. That command yielded no results.";

    // Process the command
    if (GAME_STATE.location === 'Corridor' && action === 'attack') {
        narrative = handleCombat(target);
    } else {
        narrative = handleExploration(action, target);
    }

    // Update the game state based on the outcome
    updateGameState(narrative);
});


// --- 4. Game Command Handlers ---

function handleExploration(action, target) {
    const locationData = LOCATIONS[GAME_STATE.location];
    const targetHandler = locationData.options[action];

    if (!targetHandler) {
        return `I do not understand the action: ${action}.`;
    }

    let result = targetHandler[target];

    if (typeof result === 'function') {
        result = result(action); // Execute function if it's dynamic logic
    }

    if (result) {
        // Handle successful location change if the result is a move command
        if (action === 'move' && result.includes('You move')) {
             if (target === 'north' && GAME_STATE.location === 'Cell') {
                GAME_STATE.location = 'Corridor';
                return 'The door creaks open. You step into a dark corridor. Be careful!';
             } else if (target === 'south' && GAME_STATE.location === 'Corridor') {
                GAME_STATE.location = 'Cell';
                return 'You cautiously retreat into the cell, feeling safer there.';
             }
        }
        return result;
    } else {
        return `You cannot ${action} the ${target} here.`;
    }
}

function handleCombat(target) {
    if (!GAME_STATE.enemyPresent) {
        return "You swing at the air. No enemies here.";
    }

    if (target !== 'goblin') {
        return `You should attack the Goblin!`;
    }

    // Player attack
    const playerDamage = 2;
    GAME_STATE.enemyHealth -= playerDamage;
    let narrative = `You strike the Goblin for ${playerDamage} damage! (Goblin Health: ${GAME_STATE.enemyHealth}).\n`;

    if (GAME_STATE.enemyHealth <= 0) {
        GAME_STATE.enemyPresent = false;
        narrative += "The Goblin falls dead. The corridor is clear!";
        return narrative;
    }

    // Enemy counter-attack
    const enemyDamage = 1;
    GAME_STATE.health -= enemyDamage;
    narrative += `The Goblin strikes back, hitting you for ${enemyDamage} damage!`;
    
    return narrative;
}


// --- 5. Game State and UI Renderer ---

function updateGameState(narrative) {
    // 1. Render Narrative
    if (narrative) {
        $.gameText.textContent = `> ${narrative}\n\n${LOCATIONS[GAME_STATE.location].description}`;
    }

    // 2. Render Status
    $.health.textContent = GAME_STATE.health;
    $.inventory.textContent = GAME_STATE.inventory.join(', ') || 'None';
    
    // 3. Update Form Controls based on location/state
    const locationData = LOCATIONS[GAME_STATE.location];
    
    // Update the Attack option
    if (locationData.enemyPresent) {
        // If enemy is present, ensure Attack is enabled
        $.actionSelect.querySelector('option[value="attack"]').disabled = false;
        $.actionSelect.value = 'attack';
        $.targetInput.placeholder = 'Enter target (e.g., goblin)';
    } else {
        // If no enemy, disable Attack
        $.actionSelect.querySelector('option[value="attack"]').disabled = true;
        $.targetInput.placeholder = 'Enter target or direction...';
        $.actionSelect.value = 'examine'; // Default back to examine
    }
    
    // Check for Game Over
    if (GAME_STATE.health <= 0) {
        $.gameText.textContent = "You collapse from your wounds. GAME OVER.";
        $.form.style.display = 'none';
    }
}

// --- 6. Initialization ---

// Set initial description
$.gameText.textContent = LOCATIONS[GAME_STATE.location].description;

// Run initial UI update
updateGameState(null);