// Pet Care Game Logic
class PetCare {
    constructor() {
        this.pet = {
            name: 'Buddy',
            age: 1,
            level: 1,
            experience: 0,
            coins: 50,
            hunger: 100,
            happiness: 100,
            health: 100,
            energy: 100,
            mood: 'Happy',
            isSleeping: false,
            lastFed: 0,
            lastPlayed: 0,
            lastCleaned: 0,
            lastHealed: 0,
            lastSlept: 0
        };

        this.gameLoop = null;
        this.notifications = [];
        this.currentMinigame = null;
        this.cooldowns = {
            feed: 0,
            play: 0,
            clean: 0,
            heal: 0,
            sleep: 0
        };

        this.init();
    }

    init() {
        this.loadGame();
        this.bindEvents();
        this.startGameLoop();
        this.updateDisplay();
        this.showNotification('Welcome back! Take good care of your pet!', 'success');
    }

    bindEvents() {
        // Action buttons
        document.getElementById('feed-btn').addEventListener('click', () => this.feedPet());
        document.getElementById('play-btn').addEventListener('click', () => this.playWithPet());
        document.getElementById('clean-btn').addEventListener('click', () => this.cleanPet());
        document.getElementById('heal-btn').addEventListener('click', () => this.healPet());
        document.getElementById('sleep-btn').addEventListener('click', () => this.putPetToSleep());

        // Mini game buttons
        document.getElementById('fetch-game-btn').addEventListener('click', () => this.startFetchGame());
        document.getElementById('puzzle-game-btn').addEventListener('click', () => this.startPuzzleGame());
        document.getElementById('memory-game-btn').addEventListener('click', () => this.startMemoryGame());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'f':
                    if (!e.ctrlKey) this.feedPet();
                    break;
                case 'p':
                    if (!e.ctrlKey) this.playWithPet();
                    break;
                case 'c':
                    if (!e.ctrlKey) this.cleanPet();
                    break;
                case 'h':
                    if (!e.ctrlKey) this.healPet();
                    break;
                case 's':
                    if (!e.ctrlKey && e.shiftKey) this.putPetToSleep();
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

    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.updatePetStats();
            this.updateCooldowns();
            this.checkPetStatus();
            this.updateDisplay();
            this.autoSave();
        }, 1000); // Update every second
    }

    updatePetStats() {
        const now = Date.now();

        // Decrease stats over time
        if (!this.pet.isSleeping) {
            this.pet.hunger = Math.max(0, this.pet.hunger - 0.5);
            this.pet.happiness = Math.max(0, this.pet.happiness - 0.3);
            this.pet.energy = Math.max(0, this.pet.energy - 0.4);
        } else {
            // Sleeping restores energy
            this.pet.energy = Math.min(100, this.pet.energy + 1);
        }

        // Health decreases if other stats are low
        if (this.pet.hunger < 20 || this.pet.happiness < 20 || this.pet.energy < 20) {
            this.pet.health = Math.max(0, this.pet.health - 0.2);
        } else if (this.pet.health < 100) {
            // Slowly recover health if all stats are good
            this.pet.health = Math.min(100, this.pet.health + 0.1);
        }

        // Update age (1 day = 1 minute of playtime)
        this.pet.age += 1/60; // Roughly 1 minute = 1 day

        // Update mood based on stats
        this.updateMood();
    }

    updateMood() {
        const avgStats = (this.pet.hunger + this.pet.happiness + this.pet.health + this.pet.energy) / 4;

        if (this.pet.health < 30) {
            this.pet.mood = 'Sick';
        } else if (avgStats > 80) {
            this.pet.mood = 'Very Happy';
        } else if (avgStats > 60) {
            this.pet.mood = 'Happy';
        } else if (avgStats > 40) {
            this.pet.mood = 'Okay';
        } else if (avgStats > 20) {
            this.pet.mood = 'Sad';
        } else {
            this.pet.mood = 'Very Sad';
        }
    }

    updateCooldowns() {
        const now = Date.now();
        Object.keys(this.cooldowns).forEach(action => {
            if (this.cooldowns[action] > 0) {
                this.cooldowns[action] = Math.max(0, this.cooldowns[action] - 1000);
            }
        });
    }

    checkPetStatus() {
        // Check for critical conditions
        if (this.pet.health <= 0) {
            this.showNotification('Your pet has passed away! Game Over.', 'error');
            this.resetGame();
            return;
        }

        if (this.pet.hunger <= 10) {
            this.showNotification('Your pet is very hungry!', 'warning');
        }

        if (this.pet.happiness <= 10) {
            this.showNotification('Your pet is very sad!', 'warning');
        }

        if (this.pet.energy <= 10) {
            this.showNotification('Your pet is very tired!', 'warning');
        }

        if (this.pet.health <= 20) {
            this.showNotification('Your pet is sick! Use medicine.', 'error');
        }
    }

    feedPet() {
        if (this.cooldowns.feed > 0) return;

        this.pet.hunger = Math.min(100, this.pet.hunger + 30);
        this.pet.happiness = Math.min(100, this.pet.happiness + 5);
        this.cooldowns.feed = 10000; // 10 second cooldown
        this.pet.lastFed = Date.now();

        this.showEffect('🍎');
        this.showNotification('Yummy! Your pet enjoyed the food!', 'success');
        this.playSound('feed');
    }

    playWithPet() {
        if (this.cooldowns.play > 0) return;

        this.pet.happiness = Math.min(100, this.pet.happiness + 25);
        this.pet.energy = Math.max(0, this.pet.energy - 10);
        this.pet.experience += 10;
        this.cooldowns.play = 15000; // 15 second cooldown
        this.pet.lastPlayed = Date.now();

        this.showEffect('🎾');
        this.showNotification('Your pet had fun playing!', 'success');
        this.checkLevelUp();
        this.playSound('play');
    }

    cleanPet() {
        if (this.cooldowns.clean > 0) return;

        this.pet.health = Math.min(100, this.pet.health + 15);
        this.pet.happiness = Math.min(100, this.pet.happiness + 10);
        this.cooldowns.clean = 20000; // 20 second cooldown
        this.pet.lastCleaned = Date.now();

        this.showEffect('🧼');
        this.showNotification('Your pet is clean and happy!', 'success');
        this.playSound('clean');
    }

    healPet() {
        if (this.cooldowns.heal > 0 || this.pet.coins < 20) return;

        this.pet.health = Math.min(100, this.pet.health + 40);
        this.pet.coins -= 20;
        this.cooldowns.heal = 30000; // 30 second cooldown
        this.pet.lastHealed = Date.now();

        this.showEffect('💊');
        this.showNotification('Your pet feels much better!', 'success');
        this.playSound('heal');
    }

    putPetToSleep() {
        if (this.cooldowns.sleep > 0) return;

        this.pet.isSleeping = !this.pet.isSleeping;
        this.cooldowns.sleep = 60000; // 60 second cooldown
        this.pet.lastSlept = Date.now();

        if (this.pet.isSleeping) {
            this.showEffect('😴');
            this.showNotification('Your pet is sleeping peacefully...', 'success');
            this.updatePetAppearance('sleeping');
        } else {
            this.showNotification('Your pet woke up refreshed!', 'success');
            this.updatePetAppearance('awake');
        }
        this.playSound('sleep');
    }

    checkLevelUp() {
        const expNeeded = this.pet.level * 100;
        if (this.pet.experience >= expNeeded) {
            this.pet.level++;
            this.pet.experience -= expNeeded;
            this.pet.coins += 25;
            this.showNotification(`Level up! Your pet is now level ${this.pet.level}!`, 'success');
            this.showEffect('⭐');
            this.playSound('levelup');
        }
    }

    startFetchGame() {
        this.currentMinigame = 'fetch';
        this.showMinigame('fetch');
        this.showNotification('Play fetch with your pet!', 'success');

        // Simple fetch game
        setTimeout(() => {
            const success = Math.random() > 0.3; // 70% success rate
            if (success) {
                this.pet.happiness += 15;
                this.pet.experience += 15;
                this.pet.coins += 5;
                this.showNotification('Great catch! Your pet earned 5 coins!', 'success');
                this.checkLevelUp();
            } else {
                this.showNotification('The ball got away. Try again!', 'warning');
            }
            this.endMinigame();
        }, 3000);
    }

    startPuzzleGame() {
        this.currentMinigame = 'puzzle';
        this.showMinigame('puzzle');
        this.showNotification('Solve the puzzle with your pet!', 'success');

        // Simple puzzle game
        setTimeout(() => {
            const success = Math.random() > 0.4; // 60% success rate
            if (success) {
                this.pet.happiness += 20;
                this.pet.experience += 20;
                this.pet.coins += 8;
                this.showNotification('Puzzle solved! Your pet earned 8 coins!', 'success');
                this.checkLevelUp();
            } else {
                this.showNotification('Puzzle was too tricky. Try again!', 'warning');
            }
            this.endMinigame();
        }, 4000);
    }

    startMemoryGame() {
        this.currentMinigame = 'memory';
        this.showMinigame('memory');
        this.showNotification('Test your pet\'s memory!', 'success');

        // Simple memory game
        setTimeout(() => {
            const success = Math.random() > 0.5; // 50% success rate
            if (success) {
                this.pet.happiness += 25;
                this.pet.experience += 25;
                this.pet.coins += 10;
                this.showNotification('Perfect memory! Your pet earned 10 coins!', 'success');
                this.checkLevelUp();
            } else {
                this.showNotification('Memory failed. Keep practicing!', 'warning');
            }
            this.endMinigame();
        }, 5000);
    }

    showMinigame(gameType) {
        const gameArea = document.getElementById('game-area-display');
        gameArea.innerHTML = `
            <div class="minigame-active">
                <h4>${gameType.charAt(0).toUpperCase() + gameType.slice(1)} Game</h4>
                <div class="game-animation">🎮</div>
                <p>Playing...</p>
            </div>
        `;
    }

    endMinigame() {
        this.currentMinigame = null;
        const gameArea = document.getElementById('game-area-display');
        gameArea.innerHTML = `
            <div class="game-placeholder">
                <p>Choose a mini game to play with your pet!</p>
                <div class="pet-game-icon">🎮</div>
            </div>
        `;
    }

    showEffect(emoji) {
        const effectsContainer = document.getElementById('pet-effects');
        const effect = document.createElement('div');
        effect.className = 'effect';
        effect.textContent = emoji;
        effect.style.left = Math.random() * 100 + 'px';
        effectsContainer.appendChild(effect);

        setTimeout(() => {
            effect.remove();
        }, 2000);
    }

    updatePetAppearance(state) {
        const mouth = document.getElementById('mouth');
        const eyes = document.querySelectorAll('.eye');

        if (state === 'sleeping') {
            mouth.textContent = 'u';
            eyes.forEach(eye => eye.textContent = '-');
        } else {
            mouth.textContent = 'ω';
            eyes.forEach(eye => eye.textContent = '•');
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
                case 'feed': frequency = 523; break; // C5
                case 'play': frequency = 659; break; // E5
                case 'clean': frequency = 784; break; // G5
                case 'heal': frequency = 988; break; // B5
                case 'sleep': frequency = 330; break; // E4
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

    updateDisplay() {
        // Update pet info
        document.getElementById('pet-name').textContent = this.pet.name;
        document.getElementById('pet-mood').textContent = this.pet.mood;
        document.getElementById('pet-age').textContent = Math.floor(this.pet.age) + ' days';
        document.getElementById('pet-level').textContent = this.pet.level;
        document.getElementById('pet-exp').textContent = `${this.pet.experience}/${this.pet.level * 100}`;
        document.getElementById('pet-coins').textContent = this.pet.coins;

        // Update stat bars
        document.getElementById('hunger-fill').style.width = this.pet.hunger + '%';
        document.getElementById('happiness-fill').style.width = this.pet.happiness + '%';
        document.getElementById('health-fill').style.width = this.pet.health + '%';
        document.getElementById('energy-fill').style.width = this.pet.energy + '%';

        // Update stat values
        document.getElementById('hunger-value').textContent = Math.round(this.pet.hunger) + '%';
        document.getElementById('happiness-value').textContent = Math.round(this.pet.happiness) + '%';
        document.getElementById('health-value').textContent = Math.round(this.pet.health) + '%';
        document.getElementById('energy-value').textContent = Math.round(this.pet.energy) + '%';

        // Update cooldown displays
        Object.keys(this.cooldowns).forEach(action => {
            const cooldownEl = document.getElementById(`${action}-cooldown`);
            const btn = document.getElementById(`${action}-btn`);

            if (this.cooldowns[action] > 0) {
                const seconds = Math.ceil(this.cooldowns[action] / 1000);
                cooldownEl.textContent = seconds + 's';
                btn.disabled = true;
            } else {
                cooldownEl.textContent = '';
                btn.disabled = false;
            }
        });

        // Update heal button based on coins
        const healBtn = document.getElementById('heal-btn');
        healBtn.disabled = this.pet.coins < 20 || this.cooldowns.heal > 0;
    }

    saveGame() {
        const gameData = {
            pet: this.pet,
            timestamp: Date.now()
        };
        localStorage.setItem('petCareGame', JSON.stringify(gameData));
    }

    loadGame() {
        const savedData = localStorage.getItem('petCareGame');
        if (savedData) {
            const gameData = JSON.parse(savedData);
            this.pet = { ...this.pet, ...gameData.pet };
        }
    }

    autoSave() {
        // Auto-save every 30 seconds
        if (Date.now() % 30000 < 1000) {
            this.saveGame();
        }
    }

    resetGame() {
        if (confirm('Are you sure you want to reset the game? All progress will be lost!')) {
            localStorage.removeItem('petCareGame');
            location.reload();
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PetCare();
});

// Enable audio on first user interaction
document.addEventListener('click', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, { once: true });