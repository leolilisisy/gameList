// Farm Life Game Logic
class FarmLife {
    constructor() {
        this.gridSize = { width: 15, height: 10 };
        this.grid = [];
        this.day = 1;
        this.season = 'spring';
        this.weather = 'sunny';
        this.seasonDay = 1;
        this.isPlaying = false;
        this.gameSpeed = 1;

        // Farm resources
        this.resources = {
            money: 100,
            seeds: 10,
            water: 20,
            feed: 15,
            eggs: 0,
            carrots: 0,
            sunflowers: 0
        };

        // Farm stats
        this.stats = {
            level: 1,
            experience: 0,
            chickens: 0,
            cows: 0,
            score: 0
        };

        // Crop data
        this.crops = {
            carrot: {
                emoji: '🥕',
                growthTime: 3,
                waterNeeded: 2,
                value: 5,
                seasons: ['spring', 'summer', 'fall']
            },
            sunflower: {
                emoji: '🌻',
                growthTime: 4,
                waterNeeded: 3,
                value: 8,
                seasons: ['summer', 'fall']
            },
            wheat: {
                emoji: '🌾',
                growthTime: 5,
                waterNeeded: 4,
                value: 6,
                seasons: ['spring', 'summer', 'fall']
            }
        };

        // Animal data
        this.animals = {
            chicken: {
                emoji: '🐔',
                cost: 20,
                feedCost: 1,
                production: 'eggs',
                productionRate: 0.8, // eggs per day
                happiness: 100
            },
            cow: {
                emoji: '🐄',
                cost: 50,
                feedCost: 2,
                production: 'milk',
                productionRate: 0.5, // milk per day
                happiness: 100
            }
        };

        this.gameLoop = null;
        this.selectedAction = 'plant';
        this.selectedCrop = 'carrot';
        this.notifications = [];
        this.init();
    }

    init() {
        this.initializeGrid();
        this.bindEvents();
        this.updateDisplay();
        this.showNotification('Welcome to Farm Life! Start by planting some crops.', 'success');
    }

    initializeGrid() {
        const gridElement = document.getElementById('farm-grid');
        gridElement.innerHTML = '';

        this.grid = [];
        for (let y = 0; y < this.gridSize.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridSize.width; x++) {
                this.grid[y][x] = {
                    type: 'empty',
                    crop: null,
                    growthStage: 0,
                    watered: false,
                    animal: null
                };

                const cell = document.createElement('div');
                cell.className = 'grid-cell empty';
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.addEventListener('click', () => this.onCellClick(x, y));
                gridElement.appendChild(cell);
            }
        }
    }

    bindEvents() {
        // Action buttons
        document.getElementById('plant-btn').addEventListener('click', () => this.selectAction('plant'));
        document.getElementById('water-btn').addEventListener('click', () => this.selectAction('water'));
        document.getElementById('harvest-btn').addEventListener('click', () => this.selectAction('harvest'));
        document.getElementById('buy-animal-btn').addEventListener('click', () => this.selectAction('buy-animal'));
        document.getElementById('feed-animals-btn').addEventListener('click', () => this.selectAction('feed-animals'));
        document.getElementById('collect-eggs-btn').addEventListener('click', () => this.selectAction('collect'));
        document.getElementById('sell-btn').addEventListener('click', () => this.selectAction('sell'));
        document.getElementById('upgrade-btn').addEventListener('click', () => this.upgradeFarm());

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
                case 'p':
                    if (!e.ctrlKey) this.selectAction('plant');
                    break;
                case 'w':
                    if (!e.ctrlKey) this.selectAction('water');
                    break;
                case 'h':
                    if (!e.ctrlKey) this.selectAction('harvest');
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

    selectAction(action) {
        this.selectedAction = action;

        // Update button styles
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${action}-btn`).classList.add('active');
    }

    onCellClick(x, y) {
        const cell = this.grid[y][x];
        const cellElement = this.getCellElement(x, y);

        switch(this.selectedAction) {
            case 'plant':
                this.plantCrop(x, y);
                break;
            case 'water':
                this.waterCrop(x, y);
                break;
            case 'harvest':
                this.harvestCrop(x, y);
                break;
            case 'buy-animal':
                this.buyAnimal(x, y);
                break;
            case 'feed-animals':
                this.feedAnimal(x, y);
                break;
            case 'collect':
                this.collectFromAnimal(x, y);
                break;
            case 'sell':
                this.showNotification('Use the sell button to sell all harvested produce!', 'info');
                break;
        }
    }

    plantCrop(x, y) {
        const cell = this.grid[y][x];

        if (cell.type !== 'empty' && cell.type !== 'plowed') {
            this.showNotification('This spot is not suitable for planting!', 'warning');
            return;
        }

        if (this.resources.seeds <= 0) {
            this.showNotification('You need seeds to plant crops!', 'error');
            return;
        }

        // Check if crop can be planted in current season
        if (!this.crops[this.selectedCrop].seasons.includes(this.season)) {
            this.showNotification(`${this.selectedCrop} cannot be planted in ${this.season}!`, 'warning');
            return;
        }

        cell.type = 'planted';
        cell.crop = this.selectedCrop;
        cell.growthStage = 1;
        cell.watered = false;

        this.resources.seeds--;

        this.updateCellDisplay(x, y);
        this.updateDisplay();
        this.showNotification(`Planted ${this.selectedCrop}!`, 'success');
        this.playSound('plant');
    }

    waterCrop(x, y) {
        const cell = this.grid[y][x];

        if (cell.type !== 'planted' && cell.type !== 'growing') {
            this.showNotification('Nothing to water here!', 'warning');
            return;
        }

        if (this.resources.water <= 0) {
            this.showNotification('You need water to water crops!', 'error');
            return;
        }

        cell.watered = true;
        this.resources.water--;

        this.updateCellDisplay(x, y);
        this.updateDisplay();
        this.showNotification('Crops watered!', 'success');
        this.playSound('water');
    }

    harvestCrop(x, y) {
        const cell = this.grid[y][x];

        if (cell.type !== 'ready') {
            this.showNotification('This crop is not ready to harvest!', 'warning');
            return;
        }

        const crop = this.crops[cell.crop];
        const harvestAmount = Math.floor(Math.random() * 3) + 1; // 1-3 items

        // Add to inventory
        if (cell.crop === 'carrot') {
            this.resources.carrots += harvestAmount;
        } else if (cell.crop === 'sunflower') {
            this.resources.sunflowers += harvestAmount;
        }

        // Reset cell
        cell.type = 'empty';
        cell.crop = null;
        cell.growthStage = 0;
        cell.watered = false;

        this.stats.experience += 5;
        this.checkLevelUp();

        this.updateCellDisplay(x, y);
        this.updateDisplay();
        this.showNotification(`Harvested ${harvestAmount} ${cell.crop}(s)!`, 'success');
        this.playSound('harvest');
    }

    buyAnimal(x, y) {
        const cell = this.grid[y][x];

        if (cell.type !== 'empty') {
            this.showNotification('This spot is occupied!', 'warning');
            return;
        }

        // Determine which animal to buy (alternates between chicken and cow)
        const animalType = this.stats.chickens <= this.stats.cows ? 'chicken' : 'cow';
        const animal = this.animals[animalType];

        if (this.resources.money < animal.cost) {
            this.showNotification(`Not enough money to buy a ${animalType}!`, 'error');
            return;
        }

        cell.type = 'animal';
        cell.animal = animalType;
        this.resources.money -= animal.cost;

        if (animalType === 'chicken') {
            this.stats.chickens++;
        } else {
            this.stats.cows++;
        }

        this.updateCellDisplay(x, y);
        this.updateDisplay();
        this.showNotification(`Bought a ${animalType}!`, 'success');
        this.playSound('buy');
    }

    feedAnimal(x, y) {
        const cell = this.grid[y][x];

        if (cell.type !== 'animal') {
            this.showNotification('No animal here to feed!', 'warning');
            return;
        }

        const animal = this.animals[cell.animal];
        if (this.resources.feed < animal.feedCost) {
            this.showNotification('Not enough feed!', 'error');
            return;
        }

        this.resources.feed -= animal.feedCost;
        this.updateDisplay();
        this.showNotification(`Fed the ${cell.animal}!`, 'success');
        this.playSound('feed');
    }

    collectFromAnimal(x, y) {
        const cell = this.grid[y][x];

        if (cell.type !== 'animal') {
            this.showNotification('No animal here to collect from!', 'warning');
            return;
        }

        const animal = this.animals[cell.animal];
        const production = Math.random() < animal.productionRate ? 1 : 0;

        if (production > 0) {
            if (cell.animal === 'chicken') {
                this.resources.eggs += production;
                this.showNotification(`Collected ${production} egg(s)!`, 'success');
            } else {
                // For cows, we'll add milk to inventory (simplified)
                this.resources.eggs += production; // Using eggs count for milk too
                this.showNotification(`Collected ${production} milk!`, 'success');
            }
            this.stats.experience += 3;
            this.checkLevelUp();
        } else {
            this.showNotification('Nothing to collect yet!', 'info');
        }

        this.playSound('collect');
    }

    upgradeFarm() {
        const upgradeCost = this.stats.level * 50;

        if (this.resources.money < upgradeCost) {
            this.showNotification('Not enough money for upgrade!', 'error');
            return;
        }

        this.resources.money -= upgradeCost;
        this.stats.level++;

        // Upgrade benefits
        this.resources.seeds += 5;
        this.resources.water += 10;
        this.resources.feed += 5;

        this.updateDisplay();
        this.showNotification(`Farm upgraded to level ${this.stats.level}!`, 'success');
        this.playSound('upgrade');
    }

    updateCellDisplay(x, y) {
        const cell = this.grid[y][x];
        const cellElement = this.getCellElement(x, y);

        cellElement.className = 'grid-cell';

        if (cell.type === 'empty') {
            cellElement.classList.add('empty');
            cellElement.textContent = '';
        } else if (cell.type === 'planted' || cell.type === 'growing') {
            cellElement.classList.add(cell.type);
            cellElement.textContent = this.crops[cell.crop].emoji;
        } else if (cell.type === 'ready') {
            cellElement.classList.add('ready');
            cellElement.textContent = this.crops[cell.crop].emoji;
        } else if (cell.type === 'animal') {
            cellElement.classList.add(cell.animal);
            cellElement.textContent = this.animals[cell.animal].emoji;
        }
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
        }, 10000 / this.gameSpeed); // 10 seconds per day at 1x speed
    }

    stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    advanceDay() {
        this.day++;
        this.seasonDay++;

        // Change season every 10 days
        if (this.seasonDay > 10) {
            this.changeSeason();
            this.seasonDay = 1;
        }

        // Random weather
        this.changeWeather();

        // Grow crops
        this.growCrops();

        // Update score
        this.updateScore();

        this.updateDisplay();

        if (this.day % 5 === 0) {
            this.showNotification(`Day ${this.day}: Your farm is growing!`, 'success');
        }
    }

    changeSeason() {
        const seasons = ['spring', 'summer', 'fall', 'winter'];
        const currentIndex = seasons.indexOf(this.season);
        this.season = seasons[(currentIndex + 1) % seasons.length];

        document.getElementById('current-season').textContent = this.season.charAt(0).toUpperCase() + this.season.slice(1);

        if (this.season === 'winter') {
            this.showNotification('Winter has arrived! Many crops won\'t grow.', 'warning');
        } else {
            this.showNotification(`${this.season.charAt(0).toUpperCase() + this.season.slice(1)} has arrived!`, 'success');
        }
    }

    changeWeather() {
        const weathers = [
            { name: 'sunny', emoji: '☀️', growth: 1.2 },
            { name: 'cloudy', emoji: '☁️', growth: 1.0 },
            { name: 'rainy', emoji: '🌧️', growth: 1.5 },
            { name: 'stormy', emoji: '⛈️', growth: 0.8 }
        ];

        const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
        this.weather = randomWeather.name;

        document.getElementById('current-weather').textContent = randomWeather.name.charAt(0).toUpperCase() + randomWeather.name.slice(1);
        document.getElementById('weather-icon').textContent = randomWeather.emoji;
    }

    growCrops() {
        for (let y = 0; y < this.gridSize.height; y++) {
            for (let x = 0; x < this.gridSize.width; x++) {
                const cell = this.grid[y][x];

                if (cell.type === 'planted' || cell.type === 'growing') {
                    const crop = this.crops[cell.crop];
                    let growthRate = 1;

                    // Weather affects growth
                    if (this.weather === 'sunny') growthRate *= 1.2;
                    else if (this.weather === 'rainy') growthRate *= 1.5;
                    else if (this.weather === 'stormy') growthRate *= 0.8;

                    // Watered crops grow faster
                    if (cell.watered) growthRate *= 1.3;

                    cell.growthStage += growthRate;

                    if (cell.growthStage >= crop.growthTime) {
                        cell.type = 'ready';
                    } else if (cell.growthStage >= crop.growthTime * 0.5) {
                        cell.type = 'growing';
                    }

                    this.updateCellDisplay(x, y);
                }
            }
        }
    }

    updateScore() {
        this.stats.score = Math.floor(
            this.resources.money * 0.1 +
            this.stats.experience +
            this.stats.chickens * 20 +
            this.stats.cows * 50 +
            this.resources.eggs * 2 +
            this.resources.carrots * 3 +
            this.resources.sunflowers * 5
        );
    }

    checkLevelUp() {
        const expNeeded = this.stats.level * 100;
        if (this.stats.experience >= expNeeded) {
            this.stats.level++;
            this.stats.experience -= expNeeded;
            this.resources.money += 25;
            this.showNotification(`Level up! You are now level ${this.stats.level}!`, 'success');
            this.playSound('levelup');
        }
    }

    updateDisplay() {
        // Resources
        document.getElementById('money').textContent = `$${this.resources.money}`;
        document.getElementById('seeds-count').textContent = this.resources.seeds;
        document.getElementById('water-count').textContent = this.resources.water;
        document.getElementById('feed-count').textContent = this.resources.feed;
        document.getElementById('eggs-count').textContent = this.resources.eggs;
        document.getElementById('carrots-count').textContent = this.resources.carrots;
        document.getElementById('sunflowers-count').textContent = this.resources.sunflowers;

        // Stats
        document.getElementById('level').textContent = this.stats.level;
        document.getElementById('experience').textContent = `${this.stats.experience}/${this.stats.level * 100}`;
        document.getElementById('chickens').textContent = this.stats.chickens;
        document.getElementById('cows').textContent = this.stats.cows;
        document.getElementById('day').textContent = this.day;
        document.getElementById('score').textContent = this.stats.score;

        // Season progress
        const seasonProgress = (this.seasonDay / 10) * 100;
        document.getElementById('season-bar').style.width = seasonProgress + '%';
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
                case 'plant': frequency = 523; break; // C5
                case 'water': frequency = 330; break; // E4
                case 'harvest': frequency = 659; break; // E5
                case 'buy': frequency = 784; break; // G5
                case 'feed': frequency = 440; break; // A4
                case 'collect': frequency = 554; break; // C#5
                case 'upgrade': frequency = 831; break; // G#5
                case 'levelup': frequency = 1047; break; // C6
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
            location.reload();
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FarmLife();
});

// Enable audio on first user interaction
document.addEventListener('click', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, { once: true });