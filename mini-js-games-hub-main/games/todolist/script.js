// --- 1. Game State and Configuration ---
const XP_BASE = 100; // Base XP needed for Level 2
const XP_MULTIPLIER = 1.5; // XP needed for next level: Current XP * Multiplier

let player = {
    level: 1,
    xp: 0,
    gold: 0,
    inventory: []
};

let tasks = [];

// --- 2. DOM Element References ---
const levelDisplay = document.getElementById('player-level');
const xpDisplay = document.getElementById('player-xp');
const xpToLevelDisplay = document.getElementById('xp-to-level');
const xpProgress = document.getElementById('xp-progress');
const goldDisplay = document.getElementById('player-gold');
const taskList = document.getElementById('task-list');

const newTaskText = document.getElementById('new-task-text');
const newTaskXP = document.getElementById('new-task-xp');
const addTaskButton = document.getElementById('add-task-button');

const shopMessage = document.getElementById('shop-message');
const inventoryDisplay = document.getElementById('inventory-display');

// --- 3. Persistence (Local Storage) Functions ---

function loadGame() {
    const savedPlayer = localStorage.getItem('choreRpgPlayer');
    const savedTasks = localStorage.getItem('choreRpgTasks');

    if (savedPlayer) {
        player = JSON.parse(savedPlayer);
    }
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    updateStatsUI();
    renderTasks();
}

function saveGame() {
    localStorage.setItem('choreRpgPlayer', JSON.stringify(player));
    localStorage.setItem('choreRpgTasks', JSON.stringify(tasks));
}

// --- 4. Game Logic Functions ---

function getXpNeeded(level) {
    return Math.floor(XP_BASE * Math.pow(XP_MULTIPLIER, level - 1));
}

function checkLevelUp() {
    let xpNeeded = getXpNeeded(player.level);
    
    while (player.xp >= xpNeeded) {
        player.level++;
        player.xp -= xpNeeded; // Carry over excess XP
        xpNeeded = getXpNeeded(player.level); // Calculate XP for the *new* level
        
        shopMessage.textContent = `**LEVEL UP!** You are now Level ${player.level}!`;
        // Optional: Grant bonus gold for leveling up
        player.gold += player.level * 10;
    }
    updateStatsUI();
}

function updateStatsUI() {
    const xpNeeded = getXpNeeded(player.level);

    levelDisplay.textContent = player.level;
    xpDisplay.textContent = player.xp;
    goldDisplay.textContent = player.gold;
    xpToLevelDisplay.textContent = xpNeeded;

    xpProgress.max = xpNeeded;
    xpProgress.value = player.xp;

    inventoryDisplay.textContent = player.inventory.length > 0 
        ? player.inventory.join(', ') 
        : "None";

    saveGame(); // Save state after every stat change
}

function completeTask(taskIndex) {
    const task = tasks[taskIndex];
    
    // 1. Grant Rewards
    player.xp += task.xp;
    player.gold += task.gold;

    // 2. Check for Level Up
    checkLevelUp();

    // 3. Provide Feedback
    shopMessage.textContent = `Quest Complete! You earned ${task.xp} XP and ${task.gold} Gold.`;
    
    // 4. Remove Task
    tasks.splice(taskIndex, 1);
    
    // 5. Update UI
    renderTasks();
    updateStatsUI();
}

// --- 5. DOM Manipulation and Rendering ---

function addTask() {
    const text = newTaskText.value.trim();
    const xpValue = parseInt(newTaskXP.value);

    if (text && xpValue > 0) {
        const newTask = {
            id: Date.now(), // Unique ID
            text: text,
            xp: xpValue,
            gold: Math.ceil(xpValue / 2) // Gold is half the XP value
        };

        tasks.push(newTask);
        newTaskText.value = '';
        renderTasks();
        saveGame();
    }
}

function renderTasks() {
    taskList.innerHTML = ''; // Clear the list
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<p style="text-align:center; color:#999;">Your quest log is empty! Time to add some tasks.</p>';
        return;
    }

    tasks.forEach((task, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('task-item');
        
        // Task Text
        const textSpan = document.createElement('span');
        textSpan.classList.add('task-text');
        textSpan.textContent = task.text;

        // Reward Display
        const rewardSpan = document.createElement('span');
        rewardSpan.classList.add('task-reward');
        rewardSpan.textContent = `(XP: ${task.xp}, G: ${task.gold})`;

        // Complete Button
        const completeBtn = document.createElement('button');
        completeBtn.classList.add('complete-btn');
        completeBtn.textContent = 'Complete';
        completeBtn.onclick = () => completeTask(index);
        
        listItem.appendChild(textSpan);
        listItem.appendChild(rewardSpan);
        listItem.appendChild(completeBtn);
        taskList.appendChild(listItem);
    });
}

// --- 6. Shop Logic ---

function buyUpgrade(event) {
    const button = event.target;
    const cost = parseInt(button.dataset.cost);
    const itemName = button.textContent.split('(')[0].trim();

    if (player.gold >= cost) {
        if (!player.inventory.includes(itemName)) {
            player.gold -= cost;
            player.inventory.push(itemName);
            shopMessage.textContent = `You bought a ${itemName}! It looks great!`;
        } else {
            shopMessage.textContent = `You already own the ${itemName}!`;
            return;
        }
    } else {
        shopMessage.textContent = `Not enough Gold! You need ${cost - player.gold} more.`;
        return;
    }
    updateStatsUI(); // Re-render gold and inventory
}


// --- 7. Event Listeners and Initialization ---

addTaskButton.addEventListener('click', addTask);
newTaskText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

document.getElementById('buy-hat-button').addEventListener('click', buyUpgrade);
document.getElementById('buy-cloak-button').addEventListener('click', buyUpgrade);


// Initial load
loadGame();