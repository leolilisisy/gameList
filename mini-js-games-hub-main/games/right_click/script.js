// --- 1. Game State ---
const GAME_STATE = {
    hasKey: false,
    hasJournalEntry: false,
    doorUnlocked: false,
    finalPuzzleSolved: false
};

const D = (id) => document.getElementById(id);
const $ = {
    gameScreen: D('game-screen'),
    messageBox: D('message-box'),
    customMenu: D('custom-menu'),
    strangeObject: D('strange-object'),
    lockedDoor: D('locked-door'),
    emptyFrame: D('empty-frame'),
    centralFocus: D('central-focus'),
};

let currentTarget = null; // The element that was right-clicked

// --- 2. Custom Context Menu Handler ---

// 1. Disable default context menu and show custom one
$.gameScreen.addEventListener('contextmenu', (e) => {
    // Only intercept if an interactable element was clicked
    if (e.target.classList.contains('interactable')) {
        e.preventDefault();
        currentTarget = e.target;
        
        // Populate menu options dynamically
        $.customMenu.innerHTML = `
            <div class="menu-item" data-option="look">👁️ Look Closer</div>
            <div class="menu-item" data-option="touch">✋ Touch</div>
        `;

        // Add context-specific actions
        if (currentTarget.id === 'locked-door' && GAME_STATE.hasKey) {
            $.customMenu.innerHTML += `<div class="menu-item special-action" data-option="unlock">🔑 Use Key (1709)</div>`;
        }

        // Position and show the custom menu
        $.customMenu.style.top = `${e.clientY}px`;
        $.customMenu.style.left = `${e.clientX}px`;
        $.customMenu.classList.remove('hidden');
    }
});

// 2. Hide custom menu on any click outside
document.addEventListener('click', () => {
    $.customMenu.classList.add('hidden');
    currentTarget = null;
});

// 3. Handle custom menu option clicks
$.customMenu.addEventListener('click', (e) => {
    if (!e.target.classList.contains('menu-item')) return;
    
    const option = e.target.dataset.option;
    if (currentTarget) {
        handleInteraction(currentTarget, option);
    }
});

// --- 3. Interaction Logic ---

function handleInteraction(target, option) {
    const targetId = target.id;

    switch (targetId) {
        case 'strange-object':
            if (option === 'look') {
                showMessage("The journal is filled with scribbles. The first page reads: 'THE KEY IS IN THE SOURCE.'");
                GAME_STATE.hasJournalEntry = true;
            } else if (option === 'touch') {
                showMessage("The cover is cold, like old leather. Nothing happens.");
            }
            break;

        case 'locked-door':
            if (option === 'look') {
                showMessage("It’s an old, heavy wooden door. It requires a 4-digit code, not a physical key.");
            } else if (option === 'unlock') {
                // This 'unlock' option only appears if hasKey is true
                GAME_STATE.doorUnlocked = true;
                showMessage("🔑 The code 1709 clicks. The door is unlocked! Go to the central light.");
                $.lockedDoor.textContent = "An old, UNLOCKED door.";
                $.lockedDoor.classList.remove('interactable');
            } else {
                 showMessage("The door is locked.");
            }
            break;
            
        case 'empty-frame':
             if (option === 'look') {
                showMessage("The frame is empty. The wood feels cheap.");
                // Check hidden clue in alt text
                const hiddenClue = target.getAttribute('alt');
                if (hiddenClue) {
                    showMessage(`You notice a tiny inscription: "${hiddenClue}"`);
                }
            } else if (option === 'touch') {
                showMessage("You run your finger along the dusty glass. Nothing.");
            }
            break;

        default:
            showMessage("I can't do that right now.");
    }
}

// --- 4. Metagaming/Dev Tool Puzzle Logic ---

/**
 * Puzzle 1: Find the Key/Code (1709)
 * Goal: Player must use "Inspect Element" on the #locked-door to find the "content" of the ::after pseudo-element in style.css.
 * Result: Sets GAME_STATE.hasKey = true.
 */
function checkForKey() {
    // This function doesn't actually 'check' anything dynamically, it just relies on the player
    // to find the clue (1709) and then click the right option on the door.
    // We can simulate the finding by letting the player type it in the console.
    
    // For a real game, the simple act of clicking 'examine' on the door would prompt the player
    // to find the code. We'll set hasKey to true upon finding the journal entry.
    if (GAME_STATE.hasJournalEntry) {
        GAME_STATE.hasKey = true; // The player has the meta-knowledge to find the code.
    }
}

/**
 * Final Puzzle: The Source Code
 * Goal: The player must find the comment in index.html inside #central-focus.
 * Clue: "THE TARGET IS THE SOURCE"
 * Action: Player must right-click the central focus and choose an action based on this final clue.
 */
function handleCentralFocusClick(e) {
    e.preventDefault(); // Prevent default context menu
    
    if (!GAME_STATE.doorUnlocked) {
        showMessage("The light pulses faintly. I should focus on the door first.");
        return;
    }

    // This is the trigger for the final puzzle
    if (e.type === 'contextmenu') {
        // Find the HTML comment hidden inside the element
        const commentNode = Array.from(e.target.childNodes).find(node => node.nodeType === 8); // Node.COMMENT_NODE is 8
        
        if (commentNode) {
            const finalClue = commentNode.textContent.trim();
            if (finalClue.includes("THE TARGET IS THE SOURCE")) {
                // The player is inspecting the source, which is the target.
                if (!GAME_STATE.finalPuzzleSolved) {
                    GAME_STATE.finalPuzzleSolved = true;
                    showMessage("You hear a whisper: 'The source is the target.' A void opens behind the light.");
                    $.centralFocus.style.backgroundColor = 'black';
                    $.centralFocus.style.color = 'var(--pulse-color)';
                    $.centralFocus.textContent = "EXIT: Click to escape the ritual.";
                    
                    $.centralFocus.addEventListener('click', () => {
                        alert("The Ritual is Complete. You have escaped the source.");
                        document.body.innerHTML = `<h1>RITUAL COMPLETE.</h1><p>Thank you for playing The Right-Click Ritual.</p>`;
                    });
                }
            } else {
                 showMessage("The light simply pulses.");
            }
        }
    }
}

// --- 5. Utility ---

function showMessage(text) {
    $.messageBox.querySelector('p').textContent = text;
}


// --- 6. Initialization and Setup ---

function initGame() {
    // Start listeners
    $.centralFocus.addEventListener('contextmenu', handleCentralFocusClick);
    
    // Check if player has found the initial clue
    setInterval(checkForKey, 500);
}

initGame();