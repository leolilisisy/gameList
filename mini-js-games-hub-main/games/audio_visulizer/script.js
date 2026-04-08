// --- 1. Global State and Audio Context ---
let audioContext;
let sourceNode;
let analyserNode;
let frequencyData;
let animationFrameId;

const GAME_STATE = {
    running: false,
    player: { x: 60, y: 200, health: 100 },
    enemies: [],
    spawnRate: 100, // Initial time between enemy spawns (ms)
    lastSpawnTime: 0,
    bassThreshold: 100,
    trebleThreshold: 150
};

// --- 2. DOM Elements ---
const D = (id) => document.getElementById(id);
const $ = {
    audioUpload: D('audio-upload'),
    startGameBtn: D('start-game'),
    audioStatus: D('audio-status'),
    canvas: D('frequency-canvas'),
    player: D('player'),
    enemies: D('enemies'),
    trapDoor: D('trap-door'),
    bassData: D('bass-data'),
    trebleData: D('treble-data'),
    playerHealth: D('player-health')
};

const canvasCtx = $.canvas.getContext('2d');
const PLAYER_SPEED = 10;
const ENEMY_WIDTH = 15;
const DUNGEON_WIDTH = 600;

// --- 3. Web Audio API Setup ---

/**
 * Initializes the Audio Context and AnalyserNode.
 */
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyserNode = audioContext.createAnalyser();
    
    // Settings for the AnalyserNode
    analyserNode.fftSize = 256; // 128 frequency bins
    frequencyData = new Uint8Array(analyserNode.frequencyBinCount);
}

/**
 * Handles the uploaded audio file.
 */
$.audioUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!audioContext) initAudio();

    const reader = new FileReader();
    reader.onload = (event) => {
        audioContext.decodeAudioData(event.target.result)
            .then(buffer => {
                // Create source node
                sourceNode = audioContext.createBufferSource();
                sourceNode.buffer = buffer;
                sourceNode.loop = true;

                // Connect the chain: Source -> Analyser -> Destination (Speakers)
                sourceNode.connect(analyserNode);
                analyserNode.connect(audioContext.destination);

                $.audioStatus.textContent = `Status: Audio loaded. Ready to crawl!`;
                $.startGameBtn.disabled = false;
            })
            .catch(error => {
                console.error('Error decoding audio:', error);
                $.audioStatus.textContent = `Error: Could not decode audio file.`;
            });
    };
    reader.readAsArrayBuffer(file);
});

// --- 4. Game Loop and Audio Analysis ---

function startGame() {
    if (GAME_STATE.running || !sourceNode) return;
    
    sourceNode.start(0);
    GAME_STATE.running = true;
    $.startGameBtn.disabled = true;
    $.audioStatus.textContent = `Status: Dungeon crawling... RHYTHM DETECTED!`;
    
    // Start the game loop
    gameLoop();
}

function gameLoop(timestamp) {
    if (!GAME_STATE.running) return;

    // 1. Analyze Audio Data
    analyserNode.getByteFrequencyData(frequencyData);
    
    // Calculate Rhythmic Triggers (Key Gameplay Logic)
    const bass = frequencyData.slice(0, 5).reduce((a, b) => a + b) / 5; // Low Frequencies (Bass)
    const treble = frequencyData.slice(analyserNode.frequencyBinCount - 5, analyserNode.frequencyBinCount).reduce((a, b) => a + b) / 5; // High Frequencies (Treble)
    
    // 2. Gameplay Mechanics
    
    // a. Enemy Spawning (Controlled by Bass)
    if (bass > GAME_STATE.bassThreshold) {
        // Bass drop = faster enemy spawning!
        GAME_STATE.spawnRate = Math.max(100, 1000 - bass * 5); 
    } else {
        GAME_STATE.spawnRate = 1000; // Slow spawn rate
    }

    if (timestamp - GAME_STATE.lastSpawnTime > GAME_STATE.spawnRate) {
        spawnEnemy();
        GAME_STATE.lastSpawnTime = timestamp;
    }

    // b. Trap Door State (Controlled by Treble)
    if (treble > GAME_STATE.trebleThreshold) {
        $.trapDoor.classList.add('open'); // Trap opens on high-pitch sound
    } else {
        $.trapDoor.classList.remove('open'); // Trap closes otherwise
    }

    // c. Enemy Movement and Collision
    updateEnemies();
    checkPlayerCollision();
    
    // 3. Visuals and UI Update
    drawVisualizer(frequencyData);
    updateUI(bass, treble);

    animationFrameId = requestAnimationFrame(gameLoop);
}

// --- 5. Gameplay Logic Functions ---

function spawnEnemy() {
    const enemy = {
        id: Date.now(),
        x: DUNGEON_WIDTH - ENEMY_WIDTH, // Start on the far right
        y: Math.random() * (400 - ENEMY_WIDTH), // Random height
        speed: 1 + Math.random() * 2 // Speed variation
    };
    GAME_STATE.enemies.push(enemy);

    const enemyEl = document.createElement('div');
    enemyEl.className = 'enemy';
    enemyEl.id = `enemy-${enemy.id}`;
    enemyEl.style.left = `${enemy.x}px`;
    enemyEl.style.top = `${enemy.y}px`;
    $.enemies.appendChild(enemyEl);
}

function updateEnemies() {
    const playerRect = $.player.getBoundingClientRect();
    const trapDoorRect = $.trapDoor.getBoundingClientRect();
    const gameRect = D('game-grid').getBoundingClientRect();
    
    GAME_STATE.enemies.forEach((enemy) => {
        const enemyEl = D(`enemy-${enemy.id}`);
        if (!enemyEl) return;
        
        // Move towards the player's y-position (simple AI)
        const playerYInGrid = playerRect.top - gameRect.top + playerRect.height / 2;
        if (enemy.y < playerYInGrid) enemy.y += enemy.speed * 0.5;
        if (enemy.y > playerYInGrid) enemy.y -= enemy.speed * 0.5;

        // Base movement: move left
        enemy.x -= enemy.speed;

        // Trap Door Collision Check (Obstacle)
        const isDoorClosed = $.trapDoor.classList.contains('closed');
        const enemyRect = enemyEl.getBoundingClientRect();

        // Check if enemy is hitting a closed door
        if (isDoorClosed && enemyRect.right > trapDoorRect.left && enemyRect.left < trapDoorRect.right) {
            enemy.x += enemy.speed; // Stop enemy movement (like a wall)
        }
        
        enemyEl.style.left = `${enemy.x}px`;
        enemyEl.style.top = `${enemy.y}px`;
    });

    // Clean up enemies that leave the screen
    GAME_STATE.enemies = GAME_STATE.enemies.filter(enemy => {
        if (enemy.x < -ENEMY_WIDTH) {
            const el = D(`enemy-${enemy.id}`);
            if (el) el.remove();
            return false;
        }
        return true;
    });
}

function checkPlayerCollision() {
    const playerRect = $.player.getBoundingClientRect();
    const gameRect = D('game-grid').getBoundingClientRect();

    GAME_STATE.enemies.forEach((enemy) => {
        const enemyEl = D(`enemy-${enemy.id}`);
        if (!enemyEl) return;
        
        const enemyRect = enemyEl.getBoundingClientRect();

        // Basic AABB Collision Check
        const overlapX = playerRect.left < enemyRect.right && playerRect.right > enemyRect.left;
        const overlapY = playerRect.top < enemyRect.bottom && playerRect.bottom > enemyRect.top;

        if (overlapX && overlapY) {
            GAME_STATE.player.health -= 5;
            // Remove enemy immediately after collision
            GAME_STATE.enemies = GAME_STATE.enemies.filter(e => e.id !== enemy.id);
            enemyEl.remove();
            
            if (GAME_STATE.player.health <= 0) {
                endGame("You succumbed to the rhythm of the dungeon!");
            }
        }
    });
}

function endGame(message) {
    GAME_STATE.running = false;
    cancelAnimationFrame(animationFrameId);
    sourceNode.stop();
    alert(`Game Over! ${message}`);
    // Reload for simplicity
    window.location.reload(); 
}

function updateUI(bass, treble) {
    $.bassData.textContent = Math.round(bass);
    $.trebleData.textContent = Math.round(treble);
    $.playerHealth.textContent = GAME_STATE.player.health;
    
    // Apply bass-driven light pulse to the dungeon
    const pulseStrength = Math.min(10, bass / 10);
    D('dungeon-visualizer').style.boxShadow = `0 0 ${pulseStrength}px ${pulseStrength / 2}px #ffb86c`;
}

// --- 6. Visualizer Drawing ---

function drawVisualizer(dataArray) {
    canvasCtx.clearRect(0, 0, $.canvas.width, $.canvas.height);
    
    const barWidth = ($.canvas.width / analyserNode.frequencyBinCount) * 2.5;
    let x = 0;

    for (let i = 0; i < analyserNode.frequencyBinCount; i++) {
        const barHeight = dataArray[i];
        
        // Gradient color from low (bass) to high (treble)
        const colorH = 100 + (i / analyserNode.frequencyBinCount) * 200; // Shift hue
        const color = `hsl(${colorH}, 100%, 50%)`;
        
        canvasCtx.fillStyle = color;
        canvasCtx.fillRect(x, $.canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }
}

// --- 7. Player Movement (WASD) ---

document.addEventListener('keydown', (e) => {
    if (!GAME_STATE.running) return;

    let newX = GAME_STATE.player.x;
    let newY = GAME_STATE.player.y;

    const gameRect = D('game-grid').getBoundingClientRect();
    const trapDoorRect = $.trapDoor.getBoundingClientRect();
    
    const isDoorOpen = $.trapDoor.classList.contains('open');

    if (e.key === 'w' || e.key === 'ArrowUp') newY -= PLAYER_SPEED;
    if (e.key === 's' || e.key === 'ArrowDown') newY += PLAYER_SPEED;
    if (e.key === 'a' || e.key === 'ArrowLeft') newX -= PLAYER_SPEED;
    if (e.key === 'd' || e.key === 'ArrowRight') newX += PLAYER_SPEED;

    // Boundary check
    newX = Math.max(10, Math.min(DUNGEON_WIDTH - 10, newX));
    newY = Math.max(10, Math.min(400 - 10, newY));

    // Trap Door Collision Check (Player)
    const playerFutureRect = { 
        left: newX - 10 + gameRect.left, 
        right: newX + 10 + gameRect.left,
        top: newY - 10 + gameRect.top,
        bottom: newY + 10 + gameRect.top
    };

    if (!isDoorOpen) {
        // If the door is CLOSED, check for collision with the door barrier
        const overlapsX = playerFutureRect.left < trapDoorRect.right && playerFutureRect.right > trapDoorRect.left;
        const overlapsY = playerFutureRect.top < trapDoorRect.bottom && playerFutureRect.bottom > trapDoorRect.top;
        
        if (overlapsX && overlapsY) {
            // Player is trying to move into a closed door, cancel the move
            return; 
        }
    }


    // Apply valid movement
    GAME_STATE.player.x = newX;
    GAME_STATE.player.y = newY;
    $.player.style.left = `${GAME_STATE.player.x}px`;
    $.player.style.top = `${GAME_STATE.player.y}px`;
});


// --- 8. Initialization ---

$.startGameBtn.addEventListener('click', startGame);

// Initialize canvas size to match container
$.canvas.width = DUNGEON_WIDTH;
$.canvas.height = 400;

// Initialize Web Audio API on first user interaction to satisfy browser policy
document.addEventListener('click', () => {
    if (!audioContext) initAudio();
}, { once: true });