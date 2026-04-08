// City Builder Game Logic
class CityBuilder {
    constructor() {
        this.gridSize = { width: 20, height: 15 };
        this.grid = [];
        this.selectedBuilding = 'residential';
        this.currentTool = 'build';
        this.isPlaying = false;
        this.gameSpeed = 1;
        this.day = 1;

        // City stats
        this.city = {
            population: 0,
            happiness: 50,
            budget: 1000,
            power: { current: 0, capacity: 0 },
            water: { current: 0, capacity: 0 },
            jobs: { current: 0, capacity: 0 },
            score: 0
        };

        // Building data
        this.buildings = {
            residential: {
                emoji: '🏠',
                cost: 100,
                population: 4,
                powerUsage: 1,
                waterUsage: 1,
                happiness: 0
            },
            commercial: {
                emoji: '🏪',
                cost: 200,
                jobs: 6,
                powerUsage: 2,
                waterUsage: 1,
                happiness: 5,
                income: 50
            },
            industrial: {
                emoji: '🏭',
                cost: 300,
                jobs: 8,
                powerUsage: 4,
                waterUsage: 3,
                happiness: -10,
                income: 75
            },
            power: {
                emoji: '⚡',
                cost: 500,
                powerCapacity: 20,
                powerUsage: 2,
                waterUsage: 1,
                happiness: -5
            },
            water: {
                emoji: '💧',
                cost: 400,
                waterCapacity: 15,
                powerUsage: 1,
                waterUsage: 1,
                happiness: -3
            },
            park: {
                emoji: '🌳',
                cost: 150,
                happiness: 15,
                powerUsage: 0,
                waterUsage: 0
            },
            hospital: {
                emoji: '🏥',
                cost: 600,
                happiness: 20,
                powerUsage: 3,
                waterUsage: 2,
                population: -2 // Staff
            },
            school: {
                emoji: '🏫',
                cost: 350,
                happiness: 10,
                powerUsage: 2,
                waterUsage: 1,
                population: -3 // Staff
            }
        };

        this.gameLoop = null;
        this.notifications = [];
        this.init();
    }

    init() {
        this.initializeGrid();
        this.bindEvents();
        this.updateDisplay();
        this.showNotification('Welcome to City Builder! Start by placing some residential buildings.', 'success');
    }

    initializeGrid() {
        const gridElement = document.getElementById('city-grid');
        gridElement.innerHTML = '';

        this.grid = [];
        for (let y = 0; y < this.gridSize.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridSize.width; x++) {
                this.grid[y][x] = null;

                const cell = document.createElement('div');
                cell.className = 'grid-cell empty';
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.addEventListener('click', () => this.onCellClick(x, y));
                cell.addEventListener('mouseenter', () => this.onCellHover(x, y));
                gridElement.appendChild(cell);
            }
        }
    }

    bindEvents() {
        // Building selection
        document.querySelectorAll('.building-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectBuilding(e.target.dataset.building);
            });
        });

        // Tool selection
        document.getElementById('build-btn').addEventListener('click', () => this.selectTool('build'));
        document.getElementById('demolish-btn').addEventListener('click', () => this.selectTool('demolish'));
        document.getElementById('info-btn').addEventListener('click', () => this.selectTool('info'));

        // Game controls
        document.getElementById('play-pause-btn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('speed-btn').addEventListener('click', () => this.changeSpeed());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case '1':
                case '2':
                case '3':
                    e.preventDefault();
                    const tools = ['build', 'demolish', 'info'];
                    this.selectTool(tools[parseInt(e.key) - 1]);
                    break;
                case 'r':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.resetGame();
                    }
                    break;
            }
        });
    }

    selectBuilding(buildingType) {
        this.selectedBuilding = buildingType;
        this.currentTool = 'build';

        // Update UI
        document.querySelectorAll('.building-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-building="${buildingType}"]`).classList.add('active');

        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById('build-btn').classList.add('active');
    }

    selectTool(tool) {
        this.currentTool = tool;

        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${tool}-btn`).classList.add('active');
    }

    onCellClick(x, y) {
        const cell = this.getCellElement(x, y);

        if (this.currentTool === 'build') {
            this.placeBuilding(x, y);
        } else if (this.currentTool === 'demolish') {
            this.demolishBuilding(x, y);
        } else if (this.currentTool === 'info') {
            this.showBuildingInfo(x, y);
        }
    }

    onCellHover(x, y) {
        // Clear previous selection
        document.querySelectorAll('.grid-cell.selected').forEach(cell => {
            cell.classList.remove('selected');
        });

        // Show selection if building
        if (this.currentTool === 'build') {
            const cell = this.getCellElement(x, y);
            if (this.grid[y][x] === null) {
                cell.classList.add('selected');
            }
        }
    }

    placeBuilding(x, y) {
        if (this.grid[y][x] !== null) {
            this.showNotification('This space is already occupied!', 'warning');
            return;
        }

        const building = this.buildings[this.selectedBuilding];
        if (this.city.budget < building.cost) {
            this.showNotification('Not enough money to build this!', 'error');
            return;
        }

        // Place building
        this.grid[y][x] = this.selectedBuilding;
        this.city.budget -= building.cost;

        // Update cell display
        const cell = this.getCellElement(x, y);
        cell.className = `grid-cell ${this.selectedBuilding}`;
        cell.textContent = building.emoji;

        this.updateCityStats();
        this.showNotification(`Built ${this.selectedBuilding} for $${building.cost}!`, 'success');
        this.playSound('build');
    }

    demolishBuilding(x, y) {
        const buildingType = this.grid[y][x];
        if (buildingType === null) {
            this.showNotification('Nothing to demolish here!', 'warning');
            return;
        }

        const building = this.buildings[buildingType];
        const demolitionCost = Math.floor(building.cost * 0.5);

        if (this.city.budget < demolitionCost) {
            this.showNotification('Not enough money to demolish!', 'error');
            return;
        }

        // Remove building
        this.grid[y][x] = null;
        this.city.budget -= demolitionCost;

        // Update cell display
        const cell = this.getCellElement(x, y);
        cell.className = 'grid-cell empty';
        cell.textContent = '';

        this.updateCityStats();
        this.showNotification(`Demolished ${buildingType} for $${demolitionCost}!`, 'success');
        this.playSound('demolish');
    }

    showBuildingInfo(x, y) {
        const buildingType = this.grid[y][x];
        if (buildingType === null) {
            this.showNotification('Empty land - perfect for building!', 'info');
            return;
        }

        const building = this.buildings[buildingType];
        let info = `${buildingType.toUpperCase()}\n`;
        info += `Cost: $${building.cost}\n`;

        if (building.population) info += `Population: ${building.population > 0 ? '+' : ''}${building.population}\n`;
        if (building.jobs) info += `Jobs: +${building.jobs}\n`;
        if (building.powerCapacity) info += `Power: +${building.powerCapacity}\n`;
        if (building.waterCapacity) info += `Water: +${building.waterCapacity}\n`;
        if (building.happiness) info += `Happiness: ${building.happiness > 0 ? '+' : ''}${building.happiness}\n`;
        if (building.income) info += `Income: $${building.income}/day\n`;

        alert(info);
    }

    updateCityStats() {
        // Reset stats
        let newStats = {
            population: 0,
            happiness: 50,
            power: { current: 0, capacity: 0 },
            water: { current: 0, capacity: 0 },
            jobs: { current: 0, capacity: 0 },
            dailyIncome: 0
        };

        // Calculate from buildings
        for (let y = 0; y < this.gridSize.height; y++) {
            for (let x = 0; x < this.gridSize.width; x++) {
                const buildingType = this.grid[y][x];
                if (buildingType) {
                    const building = this.buildings[buildingType];

                    if (building.population) newStats.population += building.population;
                    if (building.jobs) newStats.jobs.capacity += building.jobs;
                    if (building.powerCapacity) newStats.power.capacity += building.powerCapacity;
                    if (building.waterCapacity) newStats.water.capacity += building.waterCapacity;
                    if (building.happiness) newStats.happiness += building.happiness;
                    if (building.income) newStats.dailyIncome += building.income;

                    // Resource usage
                    if (building.powerUsage) newStats.power.current += building.powerUsage;
                    if (building.waterUsage) newStats.water.current += building.waterUsage;
                }
            }
        }

        // Apply resource shortages
        if (newStats.power.current > newStats.power.capacity) {
            newStats.happiness -= 20;
        }
        if (newStats.water.current > newStats.water.capacity) {
            newStats.happiness -= 15;
        }

        // Population can't exceed housing
        newStats.population = Math.max(0, Math.min(newStats.population, this.city.population + 1));

        // Update city stats
        this.city.population = newStats.population;
        this.city.happiness = Math.max(0, Math.min(100, newStats.happiness));
        this.city.power = newStats.power;
        this.city.water = newStats.water;
        this.city.jobs = newStats.jobs;

        // Calculate score
        this.city.score = Math.floor(
            this.city.population * 10 +
            this.city.happiness * 5 +
            (this.city.power.capacity - this.city.power.current) * 2 +
            (this.city.water.capacity - this.city.water.current) * 2 +
            this.city.jobs.capacity * 3
        );

        this.updateDisplay();
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        const btn = document.getElementById('play-pause-btn');

        if (this.isPlaying) {
            btn.textContent = '⏸️ Pause';
            this.startGameLoop();
        } else {
            btn.textContent = '▶️ Play';
            this.stopGameLoop();
        }
    }

    changeSpeed() {
        const speeds = [1, 2, 4];
        const currentIndex = speeds.indexOf(this.gameSpeed);
        this.gameSpeed = speeds[(currentIndex + 1) % speeds.length];

        document.getElementById('speed-btn').textContent = `${this.gameSpeed}x Speed`;
    }

    startGameLoop() {
        this.stopGameLoop();
        this.gameLoop = setInterval(() => {
            this.advanceDay();
        }, 5000 / this.gameSpeed); // 5 seconds per day at 1x speed
    }

    stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    advanceDay() {
        this.day++;

        // Daily income
        let dailyIncome = 0;
        for (let y = 0; y < this.gridSize.height; y++) {
            for (let x = 0; x < this.gridSize.width; x++) {
                const buildingType = this.grid[y][x];
                if (buildingType && this.buildings[buildingType].income) {
                    dailyIncome += this.buildings[buildingType].income;
                }
            }
        }

        // Tax income from population
        dailyIncome += Math.floor(this.city.population * 2);

        this.city.budget += dailyIncome;

        // Population growth
        if (this.city.happiness > 60 && this.city.population < this.getMaxPopulation()) {
            this.city.population += Math.floor(Math.random() * 3) + 1;
        } else if (this.city.happiness < 30) {
            this.city.population = Math.max(0, this.city.population - Math.floor(Math.random() * 2) + 1);
        }

        this.updateCityStats();

        if (this.day % 10 === 0) {
            this.showNotification(`Day ${this.day}: Your city is growing!`, 'success');
        }
    }

    getMaxPopulation() {
        let housing = 0;
        for (let y = 0; y < this.gridSize.height; y++) {
            for (let x = 0; x < this.gridSize.width; x++) {
                const buildingType = this.grid[y][x];
                if (buildingType === 'residential') {
                    housing += this.buildings.residential.population;
                }
            }
        }
        return housing;
    }

    updateDisplay() {
        document.getElementById('population').textContent = this.city.population;
        document.getElementById('happiness').textContent = `${this.city.happiness}%`;
        document.getElementById('budget').textContent = `$${this.city.budget}`;
        document.getElementById('power').textContent = `${this.city.power.current}/${this.city.power.capacity}`;
        document.getElementById('water').textContent = `${this.city.water.current}/${this.city.water.capacity}`;
        document.getElementById('jobs').textContent = `${this.city.jobs.current}/${this.city.jobs.capacity}`;
        document.getElementById('score').textContent = this.city.score;
        document.getElementById('day').textContent = this.day;

        // Update stat colors
        this.updateStatColor('happiness', this.city.happiness, 30, 70);
        this.updateStatColor('budget', this.city.budget, 0, 500);
        this.updateStatColor('power', this.city.power.capacity - this.city.power.current, -10, 5);
        this.updateStatColor('water', this.city.water.capacity - this.city.water.current, -10, 5);
    }

    updateStatColor(statId, value, warningThreshold, dangerThreshold) {
        const element = document.getElementById(statId);
        element.className = 'stat-value';

        if (value <= dangerThreshold) {
            element.classList.add('danger');
        } else if (value <= warningThreshold) {
            element.classList.add('warning');
        } else {
            element.classList.add('positive');
        }
    }

    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        notifications.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    playSound(action) {
        // Simple sound effects using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            let frequency = 440; // A4
            switch(action) {
                case 'build': frequency = 523; break; // C5
                case 'demolish': frequency = 330; break; // E4
            }

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            // Web Audio API not supported, skip sound
        }
    }

    getCellElement(x, y) {
        return document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    }

    resetGame() {
        if (confirm('Are you sure you want to reset the game? All progress will be lost!')) {
            this.stopGameLoop();
            this.day = 1;
            this.city = {
                population: 0,
                happiness: 50,
                budget: 1000,
                power: { current: 0, capacity: 0 },
                water: { current: 0, capacity: 0 },
                jobs: { current: 0, capacity: 0 },
                score: 0
            };
            this.initializeGrid();
            this.updateDisplay();
            this.showNotification('Game reset! Start building your city again.', 'success');
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CityBuilder();
});

// Enable audio on first user interaction
document.addEventListener('click', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, { once: true });