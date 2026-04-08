// Starry Night Sky Relaxation Game
// A calming experience for mindfulness and stress relief

class StarryNightGame {
    constructor() {
        this.canvas = document.getElementById('star-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.connections = [];
        this.selectedStars = [];
        this.constellations = [];
        this.achievements = this.initializeAchievements();
        this.musicEnabled = true;
        this.audioContext = null;
        this.musicSource = null;
        this.startTime = Date.now();
        this.sessionTimer = null;

        this.initializeGame();
        this.setupEventListeners();
        this.startSessionTimer();
        this.createBreathingGuide();
        this.renderAchievements();
    }

    initializeGame() {
        this.generateStars();
        this.setupAudio();
        this.animate();
    }

    generateStars() {
        this.stars = [];
        const numStars = 50 + Math.random() * 30; // 50-80 stars

        for (let i = 0; i < numStars; i++) {
            const star = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 1,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                id: i
            };
            this.stars.push(star);
        }
    }

    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createAmbientMusic();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    createAmbientMusic() {
        if (!this.audioContext) return;

        // Create a soothing ambient sound using oscillators
        const createOscillator = (frequency, gain) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(gain, this.audioContext.currentTime + 2);

            oscillator.start();
            return { oscillator, gainNode };
        };

        // Create multiple gentle tones for ambient atmosphere
        this.musicLayers = [
            createOscillator(220, 0.05), // A3
            createOscillator(330, 0.03), // E4
            createOscillator(440, 0.02), // A4
            createOscillator(165, 0.04), // E3
        ];
    }

    toggleMusic() {
        if (!this.audioContext) return;

        if (this.musicEnabled) {
            this.musicLayers.forEach(layer => {
                layer.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
            });
        } else {
            this.musicLayers.forEach(layer => {
                layer.gainNode.gain.linearRampToValueAtTime(layer.gainNode.gain.value * 2, this.audioContext.currentTime + 1);
            });
        }
        this.musicEnabled = !this.musicEnabled;
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        document.getElementById('music-toggle').addEventListener('click', () => this.toggleMusic());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
    }

    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Find clicked star
        const clickedStar = this.stars.find(star => {
            const distance = Math.sqrt((star.x - x) ** 2 + (star.y - y) ** 2);
            return distance < star.radius + 10;
        });

        if (clickedStar) {
            this.selectStar(clickedStar);
        }
    }

    selectStar(star) {
        if (this.selectedStars.includes(star)) {
            // Deselect if already selected
            this.selectedStars = this.selectedStars.filter(s => s !== star);
        } else {
            this.selectedStars.push(star);
        }

        // Check for constellation when we have 3+ stars
        if (this.selectedStars.length >= 3) {
            this.checkForConstellation();
        }

        this.updateStats();
    }

    checkForConstellation() {
        // Simple constellation detection - check if stars form a reasonable shape
        if (this.selectedStars.length >= 4) {
            const constellation = {
                stars: [...this.selectedStars],
                id: this.constellations.length,
                discovered: true
            };

            this.constellations.push(constellation);
            this.selectedStars = []; // Clear selection after forming constellation

            // Play success sound
            this.playSuccessSound();

            // Update achievements
            this.checkAchievements();

            document.getElementById('constellation-count').textContent = this.constellations.length;
            document.getElementById('total-constellations').textContent = this.constellations.length;
        }
    }

    playSuccessSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(659, this.audioContext.currentTime + 0.5); // E5

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    initializeAchievements() {
        return [
            { id: 'first_star', name: 'First Light', description: 'Connect your first star', unlocked: false },
            { id: 'constellation_1', name: 'Stargazer', description: 'Discover 1 constellation', unlocked: false },
            { id: 'constellation_5', name: 'Astronomer', description: 'Discover 5 constellations', unlocked: false },
            { id: 'constellation_10', name: 'Master Observer', description: 'Discover 10 constellations', unlocked: false },
            { id: 'relax_5min', name: 'Mindful Moment', description: 'Relax for 5 minutes', unlocked: false },
            { id: 'relax_15min', name: 'Deep Meditation', description: 'Relax for 15 minutes', unlocked: false },
            { id: 'big_constellation', name: 'Celestial Network', description: 'Create a constellation with 7+ stars', unlocked: false }
        ];
    }

    checkAchievements() {
        const constellationCount = this.constellations.length;
        const sessionMinutes = (Date.now() - this.startTime) / 60000;

        // Update achievement statuses
        if (this.selectedStars.length > 0 || this.connections.length > 0) {
            this.achievements.find(a => a.id === 'first_star').unlocked = true;
        }

        if (constellationCount >= 1) {
            this.achievements.find(a => a.id === 'constellation_1').unlocked = true;
        }
        if (constellationCount >= 5) {
            this.achievements.find(a => a.id === 'constellation_5').unlocked = true;
        }
        if (constellationCount >= 10) {
            this.achievements.find(a => a.id === 'constellation_10').unlocked = true;
        }

        if (sessionMinutes >= 5) {
            this.achievements.find(a => a.id === 'relax_5min').unlocked = true;
        }
        if (sessionMinutes >= 15) {
            this.achievements.find(a => a.id === 'relax_15min').unlocked = true;
        }

        // Check for large constellation
        if (this.constellations.some(c => c.stars.length >= 7)) {
            this.achievements.find(a => a.id === 'big_constellation').unlocked = true;
        }

        this.renderAchievements();
    }

    renderAchievements() {
        const achievementList = document.getElementById('achievement-list');
        achievementList.innerHTML = '';

        this.achievements.forEach(achievement => {
            const item = document.createElement('div');
            item.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
            item.innerHTML = `
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            `;
            achievementList.appendChild(item);
        });
    }

    createBreathingGuide() {
        const breathText = document.getElementById('breath-text');
        const phases = ['Breathe In...', 'Hold...', 'Breathe Out...', 'Hold...'];
        let phaseIndex = 0;

        setInterval(() => {
            breathText.textContent = phases[phaseIndex];
            phaseIndex = (phaseIndex + 1) % phases.length;
        }, 2000); // 2 seconds per phase = 8 second cycle
    }

    startSessionTimer() {
        this.sessionTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('relax-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            this.checkAchievements(); // Check time-based achievements
        }, 1000);
    }

    updateStats() {
        document.getElementById('stars-connected').textContent = this.selectedStars.length;
    }

    resetGame() {
        this.selectedStars = [];
        this.connections = [];
        this.constellations = [];
        this.generateStars();
        this.startTime = Date.now();
        this.updateStats();
        document.getElementById('constellation-count').textContent = '0';
        document.getElementById('total-constellations').textContent = '0';
        document.getElementById('relax-time').textContent = '0:00';
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stars
        this.stars.forEach(star => {
            star.brightness += star.twinkleSpeed;
            if (star.brightness > 1) star.brightness = 0;

            const alpha = 0.3 + star.brightness * 0.7;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.fill();

            // Glow effect
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 212, 255, ${alpha * 0.1})`;
            this.ctx.fill();
        });

        // Draw connections
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        for (let i = 0; i < this.selectedStars.length - 1; i++) {
            const star1 = this.selectedStars[i];
            const star2 = this.selectedStars[i + 1];
            this.ctx.moveTo(star1.x, star1.y);
            this.ctx.lineTo(star2.x, star2.y);
        }
        this.ctx.stroke();

        // Draw constellation outlines
        this.constellations.forEach(constellation => {
            this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();

            for (let i = 0; i < constellation.stars.length - 1; i++) {
                const star1 = constellation.stars[i];
                const star2 = constellation.stars[i + 1];
                this.ctx.moveTo(star1.x, star1.y);
                this.ctx.lineTo(star2.x, star2.y);
            }
            // Close the constellation
            if (constellation.stars.length > 2) {
                this.ctx.lineTo(constellation.stars[0].x, constellation.stars[0].y);
            }
            this.ctx.stroke();
        });

        // Highlight selected stars
        this.selectedStars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius + 3, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new StarryNightGame();
});