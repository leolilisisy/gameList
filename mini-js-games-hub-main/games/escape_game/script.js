document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements & Constants ---
    const roomContainer = document.getElementById('room-container');
    const wallClue = document.getElementById('wall-clue');
    const hiddenConsole = document.getElementById('hidden-console');
    const codeInput = document.getElementById('code-input');
    const submitCodeButton = document.getElementById('submit-code');
    const gridManipulator = document.getElementById('grid-manipulator');
    const door = document.getElementById('door');
    const messagePanel = document.getElementById('message');

    // --- 2. GAME STATE ---
    const CODE_ANSWER = '1337';
    let codeSolved = false;
    let manipulatorMoved = false;

    // --- 3. CORE LOGIC FUNCTIONS ---

    /**
     * Checks the submitted code against the known answer.
     */
    function checkCode() {
        if (codeInput.value === CODE_ANSWER) {
            codeSolved = true;
            messagePanel.textContent = '🔓 Console Unlocked! Key Fragment 1 found. Now, where is the final resting spot? (Hint: Grid positioning)';
            codeInput.disabled = true;
            submitCodeButton.disabled = true;
            
            // Mark the manipulator as "active" for the next puzzle
            gridManipulator.classList.add('active-clue');
            gridManipulator.textContent = 'Box: Move me to (3,3).';
            
            // Show the next clue on the console itself
            hiddenConsole.innerHTML += '<p style="color:#2ecc71;">Clue: 3 / 3 / 4 / 4</p>';
        } else {
            messagePanel.textContent = '❌ Incorrect Code. Inspect the room more thoroughly.';
        }
    }

    /**
     * Handles clicks on the grid manipulator box.
     */
    function handleManipulatorClick() {
        if (!codeSolved || manipulatorMoved) {
            messagePanel.textContent = codeSolved 
                ? 'The box is now active. Its final position is grid row 3, column 3.'
                : 'The box is locked. Find the code first!';
            return;
        }

        // --- Puzzle 3: Grid Manipulation ---
        // The player must use the browser DevTools to change the grid-area of the box
        // Target CSS: grid-area: 3 / 3 / 4 / 4; (Bottom Right - Cell 9)
        
        // This JavaScript simply checks if the player has manually updated the CSS successfully.
        
        // Get the computed grid-area property
        const computedStyle = window.getComputedStyle(gridManipulator);
        const currentGridArea = computedStyle.getPropertyValue('grid-area').replace(/\s/g, ''); // Remove spaces
        
        // Target grid-area: 3 / 3 / 4 / 4 (which should resolve to '3/3/4/4')
        const targetGridArea = '3/3/4/4'; 

        if (currentGridArea === targetGridArea) {
            manipulatorMoved = true;
            messagePanel.textContent = '🔓 Box Moved! Key Fragment 2 found. The door is now ready to receive the final action.';
            gridManipulator.textContent = 'BOX: DESTINATION REACHED.';
            
            door.textContent = '🔑 DOOR: Click to escape!';
            door.classList.add('ready-to-open');
        } else {
            messagePanel.textContent = `The box must be moved to grid-area: 3 / 3 / 4 / 4. Current area: ${currentGridArea}. Use DevTools!`;
        }
    }

    /**
     * Handles the final click on the door.
     */
    function handleDoorClick() {
        if (door.classList.contains('ready-to-open')) {
            messagePanel.innerHTML = '🏆 **YOU ESCAPED THE CSS ROOM!** All puzzles solved using DevTools!';
            door.style.backgroundColor = '#2ecc71';
            door.style.cursor = 'default';
            // Disable all interactions
            submitCodeButton.disabled = true;
            gridManipulator.removeEventListener('click', handleManipulatorClick);
            door.removeEventListener('click', handleDoorClick);
        } else {
            messagePanel.textContent = 'The door is still locked. Complete the other puzzles first.';
        }
    }

    // --- 4. HINT/STARTUP FUNCTIONS ---
    
    /**
     * A hint for Puzzle 2: The player must inject CSS to unlock the console.
     */
    function giveConsoleHint() {
        // The console is hidden by opacity: 0.1 and transform: translateY(100px).
        // The solution is to override these properties (e.g., using .unlocked class).
        messagePanel.textContent += " (HINT: The console is nearly transparent and displaced. Find its ID and override its CSS!)";
    }

    // --- 5. EVENT LISTENERS ---
    
    submitCodeButton.addEventListener('click', checkCode);
    
    // Listen for Enter keypress on the input field
    codeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkCode();
        }
    });

    // The Wall Clue requires inspection, clicking just gives a hint
    wallClue.addEventListener('click', giveConsoleHint);

    // The Grid Manipulator click handler
    gridManipulator.addEventListener('click', handleManipulatorClick);
    
    // The Final Door handler
    door.addEventListener('click', handleDoorClick);
    
    // Initial clue: tell the player to use DevTools to reveal the console
    setTimeout(() => {
        messagePanel.textContent = "HINT 1: Inspect element #hidden-console. It's almost invisible. You must manually override its CSS properties to reveal the input fields and continue.";
    }, 1000);
});