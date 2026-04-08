// Science Lab Game
// Conduct virtual experiments and learn scientific principles

// DOM elements
const scoreEl = document.getElementById('current-score');
const experimentNameEl = document.getElementById('current-experiment');
const accuracyEl = document.getElementById('current-accuracy');
const timeLeftEl = document.getElementById('time-left');
const experimentSelectionEl = document.getElementById('experiment-selection');
const labWorkspaceEl = document.getElementById('lab-workspace');
const experimentTitleEl = document.getElementById('experiment-title');
const toolsPanelEl = document.getElementById('tools-panel');
const experimentCanvasEl = document.getElementById('experiment-canvas');
const resultsPanelEl = document.getElementById('results-panel');
const observationsEl = document.getElementById('observations');
const measurementsEl = document.getElementById('measurements');
const resetBtn = document.getElementById('reset-btn');
const hintBtn = document.getElementById('hint-btn');
const checkBtn = document.getElementById('check-btn');
const backToSelectionBtn = document.getElementById('back-to-selection-btn');
const startBtn = document.getElementById('start-btn');
const quitBtn = document.getElementById('quit-btn');
const messageEl = document.getElementById('message');
const resultsEl = document.getElementById('results');
const finalScoreEl = document.getElementById('final-score');
const experimentsCompletedEl = document.getElementById('experiments-completed');
const averageAccuracyEl = document.getElementById('average-accuracy');
const scientificGradeEl = document.getElementById('scientific-grade');
const playAgainBtn = document.getElementById('play-again-btn');

// Game variables
let currentExperiment = null;
let score = 0;
let timeLeft = 60;
let timerInterval = null;
let gameActive = false;
let experimentsCompleted = 0;
let totalAccuracy = 0;
let hintUsed = false;

// Experiment configurations
const experiments = {
    pendulum: {
        name: "Pendulum Physics",
        description: "Study how pendulum length affects oscillation period",
        objective: "Measure the relationship between pendulum length and period",
        tools: [
            { id: 'length-tool', icon: '📏', label: 'Adjust Length', action: 'adjustLength' },
            { id: 'release-tool', icon: '🎯', label: 'Release Bob', action: 'releaseBob' },
            { id: 'measure-tool', icon: '⏱️', label: 'Measure Period', action: 'measurePeriod' }
        ],
        setup: setupPendulumExperiment,
        check: checkPendulumResults,
        hint: "Longer pendulums take more time to complete one swing"
    },

    circuit: {
        name: "Electric Circuit",
        description: "Build a complete circuit to light the bulb",
        objective: "Connect battery, wires, and bulb in the correct sequence",
        tools: [
            { id: 'battery-tool', icon: '🔋', label: 'Battery', action: 'placeBattery' },
            { id: 'wire-tool', icon: '🔌', label: 'Wire', action: 'placeWire' },
            { id: 'bulb-tool', icon: '💡', label: 'Bulb', action: 'placeBulb' },
            { id: 'resistor-tool', icon: '⚡', label: 'Resistor', action: 'placeResistor' }
        ],
        setup: setupCircuitExperiment,
        check: checkCircuitResults,
        hint: "Connect positive (+) to negative (-) through the bulb"
    },

    'color-mixing': {
        name: "Color Chemistry",
        description: "Mix primary colors to create secondary colors",
        objective: "Predict and create the correct mixed color",
        tools: [
            { id: 'red-paint', icon: '🔴', label: 'Red Paint', action: 'addRed' },
            { id: 'blue-paint', icon: '🔵', label: 'Blue Paint', action: 'addBlue' },
            { id: 'yellow-paint', icon: '🟡', label: 'Yellow Paint', action: 'addYellow' },
            { id: 'mix-tool', icon: '🌀', label: 'Mix Colors', action: 'mixColors' }
        ],
        setup: setupColorMixingExperiment,
        check: checkColorMixingResults,
        hint: "Red + Blue = Purple, Red + Yellow = Orange, Blue + Yellow = Green"
    },

    'plant-growth': {
        name: "Plant Biology",
        description: "Observe how different conditions affect plant growth",
        objective: "Determine the optimal conditions for plant growth",
        tools: [
            { id: 'water-tool', icon: '💧', label: 'Add Water', action: 'addWater' },
            { id: 'sunlight-tool', icon: '☀️', label: 'Adjust Light', action: 'adjustLight' },
            { id: 'soil-tool', icon: '🌱', label: 'Change Soil', action: 'changeSoil' },
            { id: 'time-tool', icon: '⏰', label: 'Advance Time', action: 'advanceTime' }
        ],
        setup: setupPlantGrowthExperiment,
        check: checkPlantGrowthResults,
        hint: "Plants need water, sunlight, and good soil to grow"
    },

    projectile: {
        name: "Projectile Motion",
        description: "Launch objects and study their trajectory",
        objective: "Predict where the projectile will land",
        tools: [
            { id: 'angle-tool', icon: '📐', label: 'Set Angle', action: 'setAngle' },
            { id: 'power-tool', icon: '💪', label: 'Set Power', action: 'setPower' },
            { id: 'launch-tool', icon: '🚀', label: 'Launch', action: 'launchProjectile' },
            { id: 'measure-tool', icon: '📏', label: 'Measure Distance', action: 'measureDistance' }
        ],
        setup: setupProjectileExperiment,
        check: checkProjectileResults,
        hint: "Higher angles give longer range, higher power gives more distance"
    },

    density: {
        name: "Density Layers",
        description: "Observe how liquids of different densities separate",
        objective: "Arrange liquids in order of density",
        tools: [
            { id: 'honey-tool', icon: '🍯', label: 'Add Honey', action: 'addHoney' },
            { id: 'oil-tool', icon: '🛢️', label: 'Add Oil', action: 'addOil' },
            { id: 'water-tool', icon: '💧', label: 'Add Water', action: 'addWater' },
            { id: 'alcohol-tool', icon: '🥃', label: 'Add Alcohol', action: 'addAlcohol' }
        ],
        setup: setupDensityExperiment,
        check: checkDensityResults,
        hint: "Denser liquids sink below less dense liquids"
    }
};

// Initialize game
function initGame() {
    setupEventListeners();
    updateDisplay();
}

// Setup event listeners
function setupEventListeners() {
    // Experiment selection
    document.querySelectorAll('.experiment-card').forEach(card => {
        card.addEventListener('click', () => selectExperiment(card.dataset.experiment));
    });

    // Game controls
    startBtn.addEventListener('click', startGame);
    quitBtn.addEventListener('click', endGame);
    playAgainBtn.addEventListener('click', resetGame);
    backToSelectionBtn.addEventListener('click', backToSelection);

    // Lab controls
    resetBtn.addEventListener('click', resetExperiment);
    hintBtn.addEventListener('click', useHint);
    checkBtn.addEventListener('click', checkResults);
}

// Start the game
function startGame() {
    gameActive = true;
    score = 0;
    experimentsCompleted = 0;
    totalAccuracy = 0;

    startBtn.style.display = 'none';
    quitBtn.style.display = 'inline-block';

    updateDisplay();
    showMessage('Choose an experiment to begin your scientific journey!', 'hint');
}

// Select experiment
function selectExperiment(experimentId) {
    if (!gameActive) return;

    currentExperiment = experiments[experimentId];
    experimentNameEl.textContent = currentExperiment.name;
    experimentTitleEl.textContent = currentExperiment.name;

    // Hide selection, show lab
    experimentSelectionEl.style.display = 'none';
    labWorkspaceEl.style.display = 'block';
    backToSelectionBtn.style.display = 'inline-block';

    // Setup experiment
    setupTools();
    currentExperiment.setup();

    // Start timer
    startTimer();

    showMessage(`Objective: ${currentExperiment.objective}`, 'hint');
}

// Setup tools panel
function setupTools() {
    toolsPanelEl.innerHTML = '<h4>Tools</h4>';

    currentExperiment.tools.forEach(tool => {
        const toolElement = document.createElement('div');
        toolElement.className = 'tool-item';
        toolElement.dataset.tool = tool.id;
        toolElement.innerHTML = `
            <div class="tool-icon">${tool.icon}</div>
            <div class="tool-label">${tool.label}</div>
        `;
        toolElement.addEventListener('click', () => useTool(tool.action));
        toolsPanelEl.appendChild(toolElement);
    });
}

// Use tool
function useTool(action) {
    if (!currentExperiment || !gameActive) return;

    // Highlight selected tool
    document.querySelectorAll('.tool-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.target.closest('.tool-item').classList.add('selected');

    // Execute tool action
    const experimentActions = {
        // Pendulum actions
        adjustLength: () => adjustPendulumLength(),
        releaseBob: () => releasePendulumBob(),
        measurePeriod: () => measurePendulumPeriod(),

        // Circuit actions
        placeBattery: () => placeCircuitComponent('battery'),
        placeWire: () => placeCircuitComponent('wire'),
        placeBulb: () => placeCircuitComponent('bulb'),
        placeResistor: () => placeCircuitComponent('resistor'),

        // Color mixing actions
        addRed: () => addColor('red'),
        addBlue: () => addColor('blue'),
        addYellow: () => addColor('yellow'),
        mixColors: () => mixColors(),

        // Plant growth actions
        addWater: () => adjustPlantCondition('water'),
        adjustLight: () => adjustPlantCondition('light'),
        changeSoil: () => adjustPlantCondition('soil'),
        advanceTime: () => advancePlantTime(),

        // Projectile actions
        setAngle: () => setProjectileAngle(),
        setPower: () => setProjectilePower(),
        launchProjectile: () => launchProjectile(),
        measureDistance: () => measureProjectileDistance(),

        // Density actions
        addHoney: () => addLiquid('honey'),
        addOil: () => addLiquid('oil'),
        addWater: () => addLiquid('water'),
        addAlcohol: () => addLiquid('alcohol')
    };

    if (experimentActions[action]) {
        experimentActions[action]();
    }
}

// Pendulum Experiment
function setupPendulumExperiment() {
    experimentCanvasEl.innerHTML = `
        <div class="pendulum-setup">
            <div class="pendulum-pivot"></div>
            <div class="pendulum-string" id="pendulum-string" style="transform: rotate(0deg);">
                <div class="pendulum-bob" id="pendulum-bob"></div>
            </div>
        </div>
    `;

    // Initialize pendulum state
    window.pendulumState = {
        length: 200,
        angle: 0,
        swinging: false,
        period: 0,
        measurements: []
    };

    updateObservations('Pendulum ready for experimentation');
}

function adjustPendulumLength() {
    const lengths = [150, 200, 250, 300];
    const currentIndex = lengths.indexOf(window.pendulumState.length);
    const newIndex = (currentIndex + 1) % lengths.length;
    window.pendulumState.length = lengths[newIndex];

    const pendulumString = document.getElementById('pendulum-string');
    pendulumString.style.height = window.pendulumState.length + 'px';

    updateObservations(`Pendulum length adjusted to ${window.pendulumState.length}px`);
}

function releasePendulumBob() {
    if (window.pendulumState.swinging) return;

    window.pendulumState.swinging = true;
    window.pendulumState.startTime = Date.now();

    const pendulumString = document.getElementById('pendulum-string');
    let angle = 30;
    let direction = 1;

    const swing = () => {
        angle += direction * 2;
        if (Math.abs(angle) >= 30) {
            direction *= -1;
        }

        pendulumString.style.transform = `rotate(${angle}deg)`;

        if (window.pendulumState.swinging) {
            requestAnimationFrame(swing);
        }
    };

    swing();
    updateObservations('Pendulum released and swinging');
}

function measurePendulumPeriod() {
    if (!window.pendulumState.swinging) {
        showMessage('Release the pendulum first!', 'incorrect');
        return;
    }

    const period = Math.sqrt(window.pendulumState.length / 980) * 2 * Math.PI;
    window.pendulumState.period = period;
    window.pendulumState.measurements.push(period);

    updateMeasurements(`Period: ${period.toFixed(2)}s (Length: ${window.pendulumState.length}px)`);
    updateObservations(`Measured period: ${period.toFixed(2)} seconds`);
}

// Circuit Experiment
function setupCircuitExperiment() {
    experimentCanvasEl.innerHTML = `
        <div class="circuit-board" id="circuit-board">
            <div class="circuit-component battery" id="battery" style="display: none;"></div>
            <div class="circuit-component bulb" id="bulb" style="display: none;"></div>
            <div class="circuit-component resistor" id="resistor" style="display: none;"></div>
        </div>
    `;

    window.circuitState = {
        components: [],
        wires: [],
        circuitComplete: false
    };

    updateObservations('Circuit board ready. Place components to complete the circuit.');
}

function placeCircuitComponent(type) {
    const board = document.getElementById('circuit-board');
    const component = document.getElementById(type);

    if (!component) return;

    component.style.display = 'block';
    component.style.left = Math.random() * 300 + 'px';
    component.style.top = Math.random() * 200 + 'px';

    // Make component draggable
    makeDraggable(component);

    window.circuitState.components.push({ type, element: component });
    updateObservations(`${type.charAt(0).toUpperCase() + type.slice(1)} placed on circuit board`);
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        checkCircuitCompletion();
    }
}

function checkCircuitCompletion() {
    const battery = document.getElementById('battery');
    const bulb = document.getElementById('bulb');
    const resistor = document.getElementById('resistor');

    if (battery.style.display !== 'none' && bulb.style.display !== 'none') {
        // Simple proximity check
        const batteryRect = battery.getBoundingClientRect();
        const bulbRect = bulb.getBoundingClientRect();

        const distance = Math.sqrt(
            Math.pow(batteryRect.left - bulbRect.left, 2) +
            Math.pow(batteryRect.top - bulbRect.top, 2)
        );

        if (distance < 150) {
            bulb.classList.add('lit');
            window.circuitState.circuitComplete = true;
            updateObservations('Circuit complete! Bulb is lit.');
        } else {
            bulb.classList.remove('lit');
            window.circuitState.circuitComplete = false;
        }
    }
}

// Color Mixing Experiment
function setupColorMixingExperiment() {
    experimentCanvasEl.innerHTML = `
        <div class="color-mixing">
            <div class="color-containers">
                <div class="color-container" id="container1">
                    <div class="color-liquid" id="liquid1" style="height: 0%; background: #ff6b6b;"></div>
                </div>
                <div class="color-container" id="container2">
                    <div class="color-liquid" id="liquid2" style="height: 0%; background: #4ecdc4;"></div>
                </div>
                <div class="mixing-result" id="result">
                    <div class="color-liquid" id="mixed-liquid" style="height: 0%;"></div>
                </div>
            </div>
        </div>
    `;

    window.colorState = {
        container1: { red: 0, blue: 0, yellow: 0 },
        container2: { red: 0, blue: 0, yellow: 0 },
        mixed: false
    };

    updateObservations('Add colors to containers and mix them to create new colors');
}

function addColor(color) {
    // Alternate between containers
    const container = window.colorState.mixed ? 'container1' : 'container2';
    const containerState = window.colorState[container];

    containerState[color] = Math.min(100, containerState[color] + 25);

    const liquid = document.getElementById(`liquid${container.slice(-1)}`);
    const total = containerState.red + containerState.blue + containerState.yellow;
    liquid.style.height = Math.min(100, total) + '%';

    // Update color based on mixture
    const r = containerState.red;
    const g = containerState.yellow;
    const b = containerState.blue;
    liquid.style.background = `rgb(${r * 2.55}, ${g * 2.55}, ${b * 2.55})`;

    updateObservations(`Added ${color} to ${container}`);
}

function mixColors() {
    const c1 = window.colorState.container1;
    const c2 = window.colorState.container2;

    const mixed = {
        red: (c1.red + c2.red) / 2,
        green: (c1.yellow + c2.yellow) / 2,
        blue: (c1.blue + c2.blue) / 2
    };

    const mixedLiquid = document.getElementById('mixed-liquid');
    mixedLiquid.style.height = '100%';
    mixedLiquid.style.background = `rgb(${mixed.red * 2.55}, ${mixed.green * 2.55}, ${mixed.blue * 2.55})`;

    window.colorState.mixed = true;
    updateObservations('Colors mixed! Observe the resulting color.');
}

// Plant Growth Experiment
function setupPlantGrowthExperiment() {
    experimentCanvasEl.innerHTML = `
        <div class="plant-experiment">
            <div class="plant-pot" id="plant-pot">
                <div class="plant" id="plant" style="height: 20px;"></div>
            </div>
        </div>
    `;

    window.plantState = {
        water: 50,
        light: 50,
        soil: 50,
        time: 0,
        height: 20
    };

    updateObservations('Adjust conditions to help the plant grow');
    updateMeasurements('Height: 20px');
}

function adjustPlantCondition(condition) {
    const levels = [25, 50, 75, 100];
    const currentIndex = levels.indexOf(window.plantState[condition]);
    const newIndex = (currentIndex + 1) % levels.length;
    window.plantState[condition] = levels[newIndex];

    updateObservations(`${condition.charAt(0).toUpperCase() + condition.slice(1)} level: ${window.plantState[condition]}%`);
}

function advancePlantTime() {
    window.plantState.time += 1;

    // Calculate growth based on conditions
    const waterFactor = window.plantState.water / 100;
    const lightFactor = window.plantState.light / 100;
    const soilFactor = window.plantState.soil / 100;

    const growthRate = (waterFactor + lightFactor + soilFactor) / 3;
    const growth = Math.round(growthRate * 10);

    window.plantState.height += growth;

    const plant = document.getElementById('plant');
    plant.style.height = window.plantState.height + 'px';

    if (growth > 5) {
        plant.classList.add('growing');
        setTimeout(() => plant.classList.remove('growing'), 1000);
    }

    updateMeasurements(`Height: ${window.plantState.height}px (Time: ${window.plantState.time} days)`);
    updateObservations(`Plant grew ${growth}px in the last day`);
}

// Projectile Experiment
function setupProjectileExperiment() {
    experimentCanvasEl.innerHTML = `
        <div style="position: relative; width: 100%; height: 400px; background: linear-gradient(180deg, #87ceeb 0%, #98fb98 100%); overflow: hidden;">
            <div id="cannon" style="position: absolute; bottom: 20px; left: 50px; width: 40px; height: 20px; background: #333; transform-origin: left center;"></div>
            <div id="projectile" style="position: absolute; bottom: 30px; left: 80px; width: 10px; height: 10px; background: #e74c3c; border-radius: 50%; display: none;"></div>
            <div id="target" style="position: absolute; bottom: 20px; right: 100px; width: 20px; height: 40px; background: #f39c12;"></div>
        </div>
    `;

    window.projectileState = {
        angle: 45,
        power: 50,
        launched: false,
        distance: 0
    };

    updateObservations('Set angle and power, then launch the projectile');
}

function setProjectileAngle() {
    const angles = [30, 45, 60, 75];
    const currentIndex = angles.indexOf(window.projectileState.angle);
    const newIndex = (currentIndex + 1) % angles.length;
    window.projectileState.angle = angles[newIndex];

    const cannon = document.getElementById('cannon');
    cannon.style.transform = `rotate(${-window.projectileState.angle}deg)`;

    updateObservations(`Launch angle set to ${window.projectileState.angle}°`);
}

function setProjectilePower() {
    const powers = [30, 50, 70, 90];
    const currentIndex = powers.indexOf(window.projectileState.power);
    const newIndex = (currentIndex + 1) % powers.length;
    window.projectileState.power = powers[newIndex];

    updateObservations(`Launch power set to ${window.projectileState.power}%`);
}

function launchProjectile() {
    if (window.projectileState.launched) return;

    window.projectileState.launched = true;
    const projectile = document.getElementById('projectile');
    projectile.style.display = 'block';

    const angle = window.projectileState.angle * Math.PI / 180;
    const power = window.projectileState.power / 10;
    const gravity = 0.5;

    let x = 80;
    let y = 350;
    let vx = Math.cos(angle) * power;
    let vy = -Math.sin(angle) * power;

    const animate = () => {
        x += vx;
        y += vy;
        vy += gravity;

        projectile.style.left = x + 'px';
        projectile.style.top = y + 'px';

        if (y < 380 && x < 800) {
            requestAnimationFrame(animate);
        } else {
            window.projectileState.distance = x - 80;
            updateObservations(`Projectile landed at ${window.projectileState.distance.toFixed(0)}px from launch point`);
        }
    };

    animate();
}

function measureProjectileDistance() {
    if (!window.projectileState.launched) {
        showMessage('Launch the projectile first!', 'incorrect');
        return;
    }

    updateMeasurements(`Distance: ${window.projectileState.distance.toFixed(0)}px (Angle: ${window.projectileState.angle}°, Power: ${window.projectileState.power}%)`);
}

// Density Experiment
function setupDensityExperiment() {
    experimentCanvasEl.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: flex-end; height: 400px; padding: 20px;">
            <div id="density-cylinder" style="width: 100px; height: 300px; border: 3px solid #333; border-radius: 10px; position: relative; background: rgba(255, 255, 255, 0.5);">
            </div>
        </div>
    `;

    window.densityState = {
        liquids: [],
        order: []
    };

    updateObservations('Add liquids to see how they separate by density');
}

function addLiquid(type) {
    const cylinder = document.getElementById('density-cylinder');

    const colors = {
        honey: '#D2691E',
        oil: '#FFD700',
        water: '#4169E1',
        alcohol: '#F0F8FF'
    };

    const densities = {
        honey: 1.42,
        oil: 0.92,
        water: 1.00,
        alcohol: 0.79
    };

    window.densityState.liquids.push({
        type,
        density: densities[type],
        color: colors[type]
    });

    // Sort by density (higher density sinks)
    window.densityState.liquids.sort((a, b) => b.density - a.density);

    // Update visual
    cylinder.innerHTML = '';
    let currentHeight = 0;
    const layerHeight = 300 / window.densityState.liquids.length;

    window.densityState.liquids.forEach(liquid => {
        const layer = document.createElement('div');
        layer.style.position = 'absolute';
        layer.style.bottom = currentHeight + 'px';
        layer.style.width = '100%';
        layer.style.height = layerHeight + 'px';
        layer.style.background = liquid.color;
        layer.style.opacity = '0.8';
        cylinder.appendChild(layer);
        currentHeight += layerHeight;
    });

    updateObservations(`Added ${type} to the cylinder`);
}

// Check results
function checkResults() {
    if (!currentExperiment) return;

    clearInterval(timerInterval);
    hintUsed = false;

    const accuracy = currentExperiment.check();
    const points = Math.round(accuracy * 10);

    score += points;
    experimentsCompleted++;
    totalAccuracy += accuracy;

    const grade = accuracy >= 90 ? 'A' : accuracy >= 80 ? 'B' : accuracy >= 70 ? 'C' : accuracy >= 60 ? 'D' : 'F';

    showMessage(`Experiment complete! Accuracy: ${accuracy}%, Grade: ${grade}, Points: ${points}`, 'correct');

    setTimeout(() => {
        backToSelection();
    }, 3000);
}

// Individual experiment check functions
function checkPendulumResults() {
    if (!window.pendulumState || window.pendulumState.measurements.length === 0) {
        return 0;
    }

    // Check if period roughly follows physics (T = 2π√(L/g))
    const measuredPeriod = window.pendulumState.measurements[0];
    const expectedPeriod = Math.sqrt(window.pendulumState.length / 980) * 2 * Math.PI;
    const accuracy = Math.max(0, 100 - Math.abs(measuredPeriod - expectedPeriod) * 10);

    return Math.min(100, accuracy);
}

function checkCircuitResults() {
    return window.circuitState && window.circuitState.circuitComplete ? 100 : 0;
}

function checkColorMixingResults() {
    if (!window.colorState || !window.colorState.mixed) {
        return 0;
    }

    // Check if mixed color is reasonable
    const c1 = window.colorState.container1;
    const c2 = window.colorState.container2;

    // Simple check for primary color mixing
    const hasRed = c1.red > 0 || c2.red > 0;
    const hasBlue = c1.blue > 0 || c2.blue > 0;
    const hasYellow = c1.yellow > 0 || c2.yellow > 0;

    if ((hasRed && hasBlue) || (hasRed && hasYellow) || (hasBlue && hasYellow)) {
        return 85; // Good mixing
    }

    return 40; // Poor mixing
}

function checkPlantGrowthResults() {
    if (!window.plantState) return 0;

    const height = window.plantState.height;
    const optimalConditions = window.plantState.water > 60 && window.plantState.light > 60 && window.plantState.soil > 60;

    if (optimalConditions && height > 100) return 100;
    if (optimalConditions && height > 50) return 80;
    if (height > 50) return 60;

    return 30;
}

function checkProjectileResults() {
    if (!window.projectileState || !window.projectileState.launched) return 0;

    // Calculate expected distance using projectile motion formula
    const angle = window.projectileState.angle * Math.PI / 180;
    const power = window.projectileState.power / 10;
    const expectedDistance = (power * power * Math.sin(2 * angle)) / 9.8 * 100;

    const actualDistance = window.projectileState.distance;
    const accuracy = Math.max(0, 100 - Math.abs(actualDistance - expectedDistance) / expectedDistance * 100);

    return Math.min(100, accuracy);
}

function checkDensityResults() {
    if (!window.densityState || window.densityState.liquids.length < 2) return 0;

    // Check if liquids are in correct density order (honey > water > oil > alcohol)
    const correctOrder = ['honey', 'water', 'oil', 'alcohol'];
    const currentOrder = window.densityState.liquids.map(l => l.type);

    let correct = 0;
    for (let i = 0; i < Math.min(currentOrder.length, correctOrder.length); i++) {
        if (currentOrder[i] === correctOrder[i]) correct++;
    }

    return (correct / currentOrder.length) * 100;
}

// Use hint
function useHint() {
    if (!currentExperiment || hintUsed || score < 10) return;

    if (score < 10) {
        showMessage('Not enough points for hint! (10 points required)', 'incorrect');
        return;
    }

    score -= 10;
    hintUsed = true;
    showMessage(`Hint: ${currentExperiment.hint}`, 'hint');
    updateDisplay();
}

// Reset experiment
function resetExperiment() {
    if (currentExperiment) {
        currentExperiment.setup();
        hintUsed = false;
        showMessage('Experiment reset. Start over!', 'hint');
    }
}

// Back to selection
function backToSelection() {
    labWorkspaceEl.style.display = 'none';
    experimentSelectionEl.style.display = 'block';
    backToSelectionBtn.style.display = 'none';
    currentExperiment = null;
    experimentNameEl.textContent = 'None';
    clearInterval(timerInterval);
    timeLeft = 60;
    updateDisplay();
}

// Start timer
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeUp();
        }
    }, 1000);
}

// Time up
function timeUp() {
    showMessage('Time\'s up! Checking your results...', 'incorrect');
    setTimeout(checkResults, 2000);
}

// Update observations
function updateObservations(text) {
    observationsEl.innerHTML = `<div class="observation-item">${text}</div>` + observationsEl.innerHTML;
}

// Update measurements
function updateMeasurements(text) {
    measurementsEl.innerHTML = `<div class="measurement-item">
        <span class="measurement-label">${text}</span>
    </div>` + measurementsEl.innerHTML;
}

// Show message
function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

// End game
function endGame() {
    gameActive = false;
    clearInterval(timerInterval);

    // Show results
    showResults();
}

// Show final results
function showResults() {
    const averageAccuracy = experimentsCompleted > 0 ? Math.round(totalAccuracy / experimentsCompleted) : 0;

    finalScoreEl.textContent = score.toLocaleString();
    experimentsCompletedEl.textContent = experimentsCompleted;
    averageAccuracyEl.textContent = averageAccuracy + '%';

    // Calculate grade
    let grade = 'F';
    if (averageAccuracy >= 90) grade = 'A';
    else if (averageAccuracy >= 80) grade = 'B';
    else if (averageAccuracy >= 70) grade = 'C';
    else if (averageAccuracy >= 60) grade = 'D';

    scientificGradeEl.textContent = grade;
    scientificGradeEl.className = `final-value grade ${grade}`;

    resultsEl.style.display = 'block';
    startBtn.style.display = 'none';
    quitBtn.style.display = 'none';
}

// Reset game
function resetGame() {
    resultsEl.style.display = 'none';
    startBtn.style.display = 'inline-block';
    quitBtn.style.display = 'none';

    gameActive = false;
    clearInterval(timerInterval);
    backToSelection();
    updateDisplay();
    messageEl.textContent = 'Ready for a new science lab session?';
}

// Update display elements
function updateDisplay() {
    scoreEl.textContent = score.toLocaleString();
    accuracyEl.textContent = experimentsCompleted > 0 ? Math.round(totalAccuracy / experimentsCompleted) + '%' : '0%';
    timeLeftEl.textContent = timeLeft;
}

// Initialize the game
initGame();

// This science lab game includes multiple experiments with interactive tools,
// educational content, scoring, and scientific accuracy validation