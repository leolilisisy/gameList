document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const playerSide = document.getElementById('player-side');
    const opponentSide = document.getElementById('opponent-side');
    const playerFPSDisplay = document.getElementById('player-fps');
    const opponentFPSDisplay = document.getElementById('opponent-fps');
    const playerBudgetDisplay = document.getElementById('player-budget');
    const opponentBudgetDisplay = document.getElementById('opponent-budget');
    const attackButtons = document.querySelectorAll('.attack-btn');
    const defenseButton = document.getElementById('defense-btn');

    // --- Game State ---
    let gameState = {
        playerBudget: 100,
        opponentBudget: 100,
        playerFPS: 60,
        opponentFPS: 60,
        // Track active attack classes on each side
        playerDebuffs: [],
        opponentDebuffs: []
    };

    // --- 1. FPS Monitoring (Core Mechanic) ---
    let lastTime = performance.now();
    let frameCount = 0;
    const FPS_CAP = 60; // Target FPS

    /**
     * Measures and updates the FPS for a given side.
     * Since the entire game runs on one browser window, we'll monitor the overall FPS
     * and use a simulated performance impact for the opponent's side.
     * * NOTE: For a true 2-player game, you would need two separate browser tabs
     * or a complex Web Worker setup. We simplify by monitoring one and calculating the other.
     */
    function monitorFPS(timestamp) {
        const delta = timestamp - lastTime;
        
        if (delta >= 1000) { // Update FPS once per second
            // Calculate actual FPS (for the player's experience)
            gameState.playerFPS = Math.min(FPS_CAP, Math.round((frameCount * 1000) / delta));

            // Calculate Opponent's SIMULATED FPS
            // Start at player's FPS and subtract for each debuff
            let opponentLag = gameState.playerDebuffs.length * 5; // 5 FPS per player debuff
            if (opponentSide.classList.contains('heavy-shadow-attack')) opponentLag += 10;
            if (opponentSide.classList.contains('paint-churn-attack')) opponentLag += 15;
            
            gameState.opponentFPS = Math.max(1, gameState.playerFPS - opponentLag);

            // Update DOM
            playerFPSDisplay.textContent = gameState.playerFPS;
            opponentFPSDisplay.textContent = gameState.opponentFPS;
            
            frameCount = 0;
            lastTime = timestamp;
            
            updateRaceProgress();
            manageBudget();
        }
        
        frameCount++;
        requestAnimationFrame(monitorFPS);
    }

    // --- 2. Attack and Defense Logic ---

    // Object to hold any active JavaScript performance tasks (like the Reflow loop)
    let activeJsAttacks = {
        'opponent': null,
        'player': null
    };

    function launchAttack(attackType, cost) {
        if (gameState.playerBudget < cost) {
            document.getElementById('game-status').textContent = "Insufficient budget to launch attack!";
            return;
        }

        gameState.playerBudget -= cost;
        playerBudgetDisplay.textContent = gameState.playerBudget;
        
        const targetElement = opponentSide.querySelector('.animation-target');

        if (attackType === 'reflow-loop') {
            // Reflow Attack (Pure JS-based sabotage)
            if (activeJsAttacks.opponent) clearInterval(activeJsAttacks.opponent);
            
            const reflowFunc = () => {
                // Forcing Reflow/Layout Thrashing: repeatedly read and write a layout property
                // This is the heavy part of the attack!
                const targetHeight = targetElement.offsetHeight; 
                targetElement.style.height = `${targetHeight + 1}px`; 
                targetElement.style.height = `${targetHeight}px`; 
            };
            
            // Run the reflow function quickly and repeatedly
            activeJsAttacks.opponent = setInterval(reflowFunc, 10);
            document.getElementById('game-status').textContent = "Reflow Attack Injected! Opponent is recalculating layout!";
            
        } else {
            // CSS Attacks
            const cssClass = attackType + '-attack';
            opponentSide.classList.add(cssClass);
            gameState.opponentDebuffs.push(cssClass);
            document.getElementById('game-status').textContent = `${attackType} Injected! Opponent's frame render is choked!`;
        }
    }

    function cleanseDefense(cost) {
        if (gameState.playerDebuffs.length === 0 && !activeJsAttacks.player) {
            document.getElementById('game-status').textContent = "No active debuffs to cleanse.";
            return;
        }
        
        if (gameState.playerBudget < cost) {
            document.getElementById('game-status').textContent = "Insufficient budget to cleanse!";
            return;
        }
        
        gameState.playerBudget -= cost;
        playerBudgetDisplay.textContent = gameState.playerBudget;

        // 1. Remove the last CSS debuff
        const lastDebuff = gameState.playerDebuffs.pop();
        if (lastDebuff) {
            playerSide.classList.remove(lastDebuff);
            document.getElementById('game-status').textContent = `Removed ${lastDebuff}! Performance slightly recovered.`;
        }
        
        // 2. Clear any active JS debuff (Reflow Attack)
        if (activeJsAttacks.player) {
            clearInterval(activeJsAttacks.player);
            activeJsAttacks.player = null;
            document.getElementById('game-status').textContent = `Reflow attack neutralized!`;
        }
    }

    // Attach event listeners for attacks
    attackButtons.forEach(button => {
        button.addEventListener('click', () => {
            const attackType = button.dataset.attackType;
            const cost = parseInt(button.dataset.attackCost);
            launchAttack(attackType, cost);
        });
    });

    // Attach event listener for defense
    defenseButton.addEventListener('click', () => {
        const cost = parseInt(defenseButton.dataset.defenseCost);
        cleanseDefense(cost);
    });
    
    // --- 3. Race & Budget Management ---

    let playerProgress = 0;
    let opponentProgress = 0;
    const RACE_DISTANCE = 1000;
    const playerRaceCar = document.getElementById('player-race-car');
    const opponentRaceCar = document.getElementById('opponent-race-car');

    function updateRaceProgress() {
        // Progress is proportional to FPS
        playerProgress += gameState.playerFPS / FPS_CAP;
        opponentProgress += gameState.opponentFPS / FPS_CAP;

        // Visual update (simple example using opacity or a custom metric)
        playerRaceCar.style.opacity = playerProgress / RACE_DISTANCE;
        opponentRaceCar.style.opacity = opponentProgress / RACE_DISTANCE;

        if (playerProgress >= RACE_DISTANCE) {
            endGame("Player 1 Wins!");
        } else if (opponentProgress >= RACE_DISTANCE) {
            endGame("Opponent Wins!");
        }
    }

    function manageBudget() {
        // Both players generate income based on their FPS (simulated)
        const incomeRate = 0.5; // Budget gained per FPS point per second
        gameState.playerBudget += gameState.playerFPS / FPS_CAP * incomeRate;
        gameState.opponentBudget += gameState.opponentFPS / FPS_CAP * incomeRate;
        
        playerBudgetDisplay.textContent = Math.round(gameState.playerBudget);
        opponentBudgetDisplay.textContent = Math.round(gameState.opponentBudget);
    }

    function endGame(winner) {
        document.getElementById('game-status').textContent = `GAME OVER: ${winner}`;
        // Stop all animations and monitoring
        // For simplicity, we'll rely on the lack of a next requestAnimationFrame call
        // In a real game, you would clear intervals and stop the RAF loop properly.
        alert(winner);
        // Reload to play again (simple way to reset)
        // location.reload(); 
    }

    // Start the FPS monitoring loop
    monitorFPS(performance.now());
});