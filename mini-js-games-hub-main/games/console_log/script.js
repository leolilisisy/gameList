document.addEventListener('DOMContentLoaded', () => {
    const narrativeDisplay = document.getElementById('narrative');
    const visualCue = document.getElementById('visual-cue');
    
    // --- 1. Global Game State (The DevTools Focus) ---
    
    // These objects are intentionally exposed to the window object (global scope)
    // so the player can inspect and modify them directly in the console.
    window.playerState = {
        location: 'ENTRANCE',
        health: 100
    };

    window.inventory = {
        key: false,
        torch: true,
        secretCode: null
    };

    // --- 2. Game Functions (The Hidden Commands) ---

    // The player must discover and call this function from the console.
    window.useItem = function(item, target) {
        // Output to the console first
        console.info(`> Attempting to use ${item} on ${target}...`);

        if (!window.inventory[item]) {
            console.warn(`You do not possess the item: ${item}. Check 'window.inventory'`);
            return false;
        }

        // Logic for different item/target combinations
        if (item === 'torch' && target === 'room') {
            if (window.playerState.location === 'DARK_HALLWAY') {
                window.playerState.location = 'BRIGHT_HALLWAY';
                console.log("The torch illuminates the corridor! You can now see the door.");
                return true;
            }
        } else if (item === 'key' && target === 'door') {
            if (window.playerState.location === 'BRIGHT_HALLWAY') {
                console.log("The heavy, ornate door clicks open.");
                window.playerState.location = 'TREASURE_ROOM';
                return true;
            }
        }
        
        console.error("That combination of item and target seems useless here.");
        return false;
    };
    
    // Another secret function the player must find
    window.readSign = function() {
        if (window.playerState.location === 'ENTRANCE') {
            console.log("The sign reads: 'I am the beginning. Your inventory holds the light.'");
        } else if (window.playerState.location === 'BRIGHT_HALLWAY') {
            // Advanced Puzzle Clue: The player must find this ID in the HTML using querySelector
            console.warn("A hidden number is inscribed on the ceiling. It is bound to the element with ID: 'secret-clue-data'.");
        } else {
            console.log("There are no signs here.");
        }
    };
    
    // Initial Setup Puzzle: Player must find the item and call useItem
    window.findItem = function(code) {
        if (code === "SECRET_KEY_CODE_123") {
            window.inventory.key = true;
            console.log("You have found a rusty key! Type 'window.inventory' to confirm.");
            return true;
        }
        console.error("Incorrect code. You must find the code first!");
        return false;
    };


    // --- 3. Game Loop and Display Update ---

    function updateGame() {
        const state = window.playerState;
        
        // Clear console and log status
        console.clear();
        console.info(`--- Console Log Quest ---`);
        console.log(`Current Location: ${state.location}`);
        console.log(`Type 'window.inventory' to see your items.`);
        console.log(`Need help? Try calling 'window.readSign()'`);
        console.warn(`Health: ${state.health}`);

        let narrativeText = "";
        let cue = "❓";

        // Logic based on location
        switch (state.location) {
            case 'ENTRANCE':
                cue = "🚪";
                narrativeText = "You stand at the ENTRANCE of a dark dungeon.\n\n" + 
                                "The air is heavy. A sign hangs nearby. You must find a key to proceed. \n\n" +
                                "The key is unlocked by a secret code. Call 'window.findItem(code)' once you have the code.";
                // Hidden clue for the first puzzle (requires inspecting the DOM/Code)
                document.body.setAttribute('data-key-code', 'SECRET_KEY_CODE_123');
                break;

            case 'DARK_HALLWAY':
                cue = "⚫";
                narrativeText = "It is pitch black. You can feel a heavy door, but can't see the lock.\n\n" +
                                "Try using an item from your inventory to light the room: 'window.useItem(\"torch\", \"room\")'";
                break;
                
            case 'BRIGHT_HALLWAY':
                cue = "💡";
                narrativeText = "The torchlight reveals a solid, ornate DOOR at the end of the hall.\n\n" +
                                "You have a key! Try using it: 'window.useItem(\"key\", \"door\")'";
                // Inject the element with the hidden ID needed for the 'readSign' clue
                narrativeText += "<div id='secret-clue-data' style='display:none;' data-code='6810'></div>";
                break;
            
            case 'TREASURE_ROOM':
                cue = "💎";
                narrativeText = "CONGRATULATIONS! You have found the Treasure Room.\n\n" + 
                                "The puzzle is complete! Now go build something cool.";
                break;

            default:
                narrativeText = "Lost in the void.";
        }

        narrativeDisplay.innerHTML = narrativeText;
        visualCue.textContent = cue;
        
        // Continuous check using a simple interval, as there's no native listener for console input
        setTimeout(updateGame, 500); 
    }

    // Initial call to start the game loop
    updateGame();
});