// Cooking Challenge Game
// Follow recipes step by step to prepare delicious meals

// DOM elements
const scoreEl = document.getElementById('current-score');
const levelEl = document.getElementById('current-level');
const timerEl = document.getElementById('time-left');
const stepEl = document.getElementById('current-step');
const totalStepsEl = document.getElementById('total-steps');
const recipeNameEl = document.getElementById('recipe-name');
const instructionEl = document.getElementById('current-instruction');
const ingredientsArea = document.getElementById('ingredients-area');
const toolsArea = document.getElementById('tools-area');
const messageEl = document.getElementById('message');
const startBtn = document.getElementById('start-btn');
const hintBtn = document.getElementById('hint-btn');
const resetBtn = document.getElementById('reset-btn');

// Game variables
let score = 0;
let level = 1;
let currentRecipe = null;
let currentStepIndex = 0;
let timeLeft = 30;
let gameRunning = false;
let timerInterval;

// Available ingredients and tools
const ingredients = [
    '🍅 Tomato', '🧅 Onion', '🥕 Carrot', '🥬 Lettuce', '🍝 Pasta',
    '🥚 Egg', '🥛 Milk', '🧀 Cheese', '🍖 Meat', '🐟 Fish',
    '🍞 Bread', '🥔 Potato', '🌽 Corn', '🍄 Mushroom', '🍌 Banana'
];

const tools = [
    '🔪 Knife', '🍳 Pan', '🥄 Spoon', '🍴 Fork', '⏲️ Timer',
    '🥣 Bowl', '🧰 Whisk', '🔥 Stove', '🧊 Fridge', '🗑️ Trash'
];

// Recipes with steps
const recipes = [
    {
        name: 'Pasta Carbonara',
        steps: [
            { instruction: 'Gather pasta and eggs', required: ['🍝 Pasta', '🥚 Egg'], type: 'ingredients' },
            { instruction: 'Get cheese and pepper', required: ['🧀 Cheese', '🧂 Salt'], type: 'ingredients' },
            { instruction: 'Use pan to cook pasta', required: ['🍳 Pan'], type: 'tools' },
            { instruction: 'Mix with spoon', required: ['🥄 Spoon'], type: 'tools' },
            { instruction: 'Serve with fork', required: ['🍴 Fork'], type: 'tools' }
        ]
    },
    {
        name: 'Grilled Cheese Sandwich',
        steps: [
            { instruction: 'Get bread and cheese', required: ['🍞 Bread', '🧀 Cheese'], type: 'ingredients' },
            { instruction: 'Use knife to prepare', required: ['🔪 Knife'], type: 'tools' },
            { instruction: 'Cook in pan', required: ['🍳 Pan'], type: 'tools' },
            { instruction: 'Flip with spatula', required: ['🥄 Spoon'], type: 'tools' },
            { instruction: 'Serve on plate', required: ['🍽️ Plate'], type: 'tools' }
        ]
    },
    {
        name: 'Fruit Salad',
        steps: [
            { instruction: 'Select fruits', required: ['🍅 Tomato', '🍌 Banana', '🍊 Orange'], type: 'ingredients' },
            { instruction: 'Get bowl for mixing', required: ['🥣 Bowl'], type: 'tools' },
            { instruction: 'Use knife to cut', required: ['🔪 Knife'], type: 'tools' },
            { instruction: 'Mix with spoon', required: ['🥄 Spoon'], type: 'tools' },
            { instruction: 'Chill in fridge', required: ['🧊 Fridge'], type: 'tools' }
        ]
    }
];

// Initialize game
function initGame() {
    createKitchen();
    loadRecipe();
}

// Create kitchen items
function createKitchen() {
    // Create ingredients grid
    const ingredientsGrid = document.createElement('div');
    ingredientsGrid.className = 'item-grid';
    ingredientsGrid.innerHTML = '<h4>Ingredients</h4>';

    ingredients.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'item';
        itemEl.textContent = item;
        itemEl.addEventListener('click', () => selectItem(item, 'ingredients'));
        ingredientsGrid.appendChild(itemEl);
    });

    ingredientsArea.appendChild(ingredientsGrid);

    // Create tools grid
    const toolsGrid = document.createElement('div');
    toolsGrid.className = 'item-grid';
    toolsGrid.innerHTML = '<h4>Tools</h4>';

    tools.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'item';
        itemEl.textContent = item;
        itemEl.addEventListener('click', () => selectItem(item, 'tools'));
        toolsGrid.appendChild(itemEl);
    });

    toolsArea.appendChild(toolsGrid);
}

// Load a random recipe
function loadRecipe() {
    currentRecipe = recipes[Math.floor(Math.random() * recipes.length)];
    currentStepIndex = 0;
    recipeNameEl.textContent = currentRecipe.name;
    totalStepsEl.textContent = currentRecipe.steps.length;
    loadStep();
}

// Load current step
function loadStep() {
    const step = currentRecipe.steps[currentStepIndex];
    stepEl.textContent = currentStepIndex + 1;
    instructionEl.textContent = step.instruction;
    timeLeft = 30; // Reset timer for each step
    timerEl.textContent = timeLeft;

    // Reset item states
    document.querySelectorAll('.item').forEach(item => {
        item.classList.remove('selected', 'correct', 'wrong');
    });

    if (gameRunning) {
        startStepTimer();
    }
}

// Select an item
function selectItem(itemName, type) {
    if (!gameRunning) return;

    const currentStep = currentRecipe.steps[currentStepIndex];
    const isRequired = currentStep.required.includes(itemName);
    const isCorrectType = currentStep.type === type;

    if (isRequired && isCorrectType) {
        // Correct selection
        score += Math.max(10, timeLeft * 2); // Bonus for speed
        scoreEl.textContent = score;

        // Mark as correct
        document.querySelectorAll('.item').forEach(item => {
            if (item.textContent === itemName) {
                item.classList.add('correct');
            }
        });

        // Move to next step
        setTimeout(() => {
            currentStepIndex++;
            if (currentStepIndex >= currentRecipe.steps.length) {
                levelComplete();
            } else {
                loadStep();
            }
        }, 1000);

    } else {
        // Wrong selection
        document.querySelectorAll('.item').forEach(item => {
            if (item.textContent === itemName) {
                item.classList.add('wrong');
            }
        });

        messageEl.textContent = 'Wrong item! Try again.';
        setTimeout(() => messageEl.textContent = '', 2000);
    }
}

// Start the game
function startGame() {
    score = 0;
    level = 1;
    scoreEl.textContent = score;
    levelEl.textContent = level;
    gameRunning = true;
    startBtn.style.display = 'none';
    loadRecipe();
}

// Start timer for current step
function startStepTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            stepFailed();
        }
    }, 1000);
}

// Step failed (time up)
function stepFailed() {
    clearInterval(timerInterval);
    messageEl.textContent = 'Time\'s up! Step failed.';
    gameRunning = false;
    resetBtn.style.display = 'inline-block';
}

// Level complete
function levelComplete() {
    clearInterval(timerInterval);
    gameRunning = false;
    level++;
    levelEl.textContent = level;
    messageEl.textContent = `Recipe complete! Level ${level} unlocked.`;
    setTimeout(() => {
        messageEl.textContent = 'Get ready for next recipe...';
        setTimeout(() => {
            startGame();
        }, 2000);
    }, 3000);
}

// Show hint
function showHint() {
    if (!gameRunning || score < 20) return;

    score -= 20;
    scoreEl.textContent = score;

    const currentStep = currentRecipe.steps[currentStepIndex];
    const hintItem = currentStep.required[0]; // Show first required item

    messageEl.textContent = `Hint: Try using ${hintItem}`;
    setTimeout(() => messageEl.textContent = '', 3000);
}

// Reset game
function resetGame() {
    clearInterval(timerInterval);
    score = 0;
    level = 1;
    gameRunning = false;
    scoreEl.textContent = score;
    levelEl.textContent = level;
    messageEl.textContent = '';
    resetBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    loadRecipe();
}

// Event listeners
startBtn.addEventListener('click', startGame);
hintBtn.addEventListener('click', showHint);
resetBtn.addEventListener('click', resetGame);

// Initialize
initGame();

// This cooking game was fun to make
// I enjoyed creating the recipe system and item selection mechanics
// Could add more recipes or cooking mini-games later