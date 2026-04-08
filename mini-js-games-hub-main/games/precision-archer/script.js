// Precision Archer Target Game
// Physics-based archery with wind effects and moving targets

class PrecisionArcherGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.groundY = this.canvas.height - 50;
        this.bowX = 100;
        this.bowY = this.groundY - 20;

        // Game state
        this.arrows = [];
        this.targets = [];
        this.wind = { direction: 1, strength: 5 };
        this.score = 0;
        this.shots = 0;
        this.hits = 0;
        this.gameRunning = true;

        // Controls
        this.power = 50;
        this.angle = 45;

        // Physics constants
        this.gravity = 0.3;
        this.airResistance = 0.99;

        // Achievements
        this.achievements = this.initializeAchievements();

        this.initializeGame();
        this.setupEventListeners();
        this.generateTargets();
        this.updateWind();
        this.animate();
    }

    initializeGame() {
        // Set initial control values
        document.getElementById('power-slider').value = this.power;
        document.getElementById('angle-slider').value = this.angle;
        this.updateControlDisplays();
    }

    setupEventListeners() {
        document.getElementById('power-slider').addEventListener('input', (e) => {
            this.power = parseInt(e.target.value);
            this.updateControlDisplays();
        });

        document.getElementById('angle-slider').addEventListener('input', (e) => {
            this.angle = parseInt(e.target.value);
            this.updateControlDisplays();
        });

        document.getElementById('shoot-btn').addEventListener('click', () => this.shootArrow());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
    }

    updateControlDisplays() {
        document.getElementById('power-value').textContent = this.power;
        document.getElementById('angle-value').textContent = this.angle;
    }

    shootArrow() {
        if (!this.gameRunning) return;

        this.shots++;

        // Calculate initial velocity
        const angleRad = (this.angle * Math.PI) / 180;
        const velocity = (this.power / 100) * 15; // Max velocity of 15

        const arrow = {
            x: this.bowX,
            y: this.bowY,
            vx: Math.cos(angleRad) * velocity,
            vy: -Math.sin(angleRad) * velocity,
            trail: [],
            active: true
        };

        this.arrows.push(arrow);
        this.playShootSound();

        // Update stats
        this.updateStats();
    }

    updateArrows() {
        this.arrows.forEach((arrow, index) => {
            if (!arrow.active) return;

            // Apply physics
            arrow.vy += this.gravity; // Gravity
            arrow.vx *= this.airResistance; // Air resistance
            arrow.vy *= this.airResistance;

            // Apply wind
            arrow.vx += (this.wind.direction * this.wind.strength) * 0.01;

            // Update position
            arrow.x += arrow.vx;
            arrow.y += arrow.vy;

            // Add to trail
            arrow.trail.push({ x: arrow.x, y: arrow.y });
            if (arrow.trail.length > 20) {
                arrow.trail.shift();
            }

            // Check ground collision
            if (arrow.y >= this.groundY) {
                arrow.active = false;
                this.playMissSound();
            }

            // Check canvas bounds
            if (arrow.x < 0 || arrow.x > this.canvas.width || arrow.y > this.canvas.height) {
                arrow.active = false;
            }

            // Check target collisions
            this.checkTargetCollisions(arrow);
        });

        // Remove inactive arrows
        this.arrows = this.arrows.filter(arrow => arrow.active || arrow.trail.length > 0);
    }

    checkTargetCollisions(arrow) {
        this.targets.forEach((target, targetIndex) => {
            if (!target.active) return;

            const distance = Math.sqrt(
                Math.pow(arrow.x - target.x, 2) + Math.pow(arrow.y - target.y, 2)
            );

            if (distance < target.radius) {
                // Hit!
                arrow.active = false;
                target.hit = true;
                this.hits++;

                // Calculate score based on accuracy
                const centerDistance = distance / target.radius;
                let points = Math.round((1 - centerDistance) * target.maxPoints);

                if (points < 1) points = 1;
                this.score += points;

                // Visual feedback
                target.hitAnimation = 30;
                this.playHitSound();

                // Generate new target
                setTimeout(() => {
                    this.targets[targetIndex] = this.createTarget();
                }, 1000);

                this.updateStats();
                this.checkAchievements();
            }
        });
    }

    generateTargets() {
        this.targets = [];
        for (let i = 0; i < 3; i++) {
            this.targets.push(this.createTarget());
        }
    }

    createTarget() {
        const distance = 200 + Math.random() * 400; // 200-600 pixels away
        const height = this.groundY - 50 - Math.random() * 200; // 50-250 pixels high

        return {
            x: this.bowX + distance,
            y: height,
            radius: 25 + Math.random() * 15, // 25-40 pixel radius
            maxPoints: 10,
            active: true,
            hit: false,
            hitAnimation: 0,
            movement: Math.random() > 0.5 ? 'vertical' : 'horizontal',
            moveSpeed: 1 + Math.random() * 2,
            moveDirection: Math.random() > 0.5 ? 1 : -1,
            originalY: height,
            originalX: this.bowX + distance
        };
    }

    updateTargets() {
        this.targets.forEach(target => {
            if (!target.active) return;

            if (target.movement === 'vertical') {
                target.y += target.moveSpeed * target.moveDirection;
                if (target.y > target.originalY + 50 || target.y < target.originalY - 50) {
                    target.moveDirection *= -1;
                }
            } else if (target.movement === 'horizontal') {
                target.x += target.moveSpeed * target.moveDirection;
                if (target.x > target.originalX + 30 || target.x < target.originalX - 30) {
                    target.moveDirection *= -1;
                }
            }

            if (target.hitAnimation > 0) {
                target.hitAnimation--;
            }
        });
    }

    updateWind() {
        setInterval(() => {
            // Random wind changes
            this.wind.direction = Math.random() > 0.5 ? 1 : -1;
            this.wind.strength = Math.random() * 10;

            this.updateWindDisplay();
        }, 3000 + Math.random() * 4000); // Change every 3-7 seconds
    }

    updateWindDisplay() {
        const directionSymbol = this.wind.direction > 0 ? '→' : '←';
        document.getElementById('wind-direction').textContent = directionSymbol;
        document.getElementById('wind-strength').textContent = Math.round(this.wind.strength);

        // Update wind bar
        const windBar = document.getElementById('wind-bar-fill');
        const percentage = Math.min(Math.abs(this.wind.strength) / 10 * 100, 100);
        windBar.style.width = percentage + '%';

        // Color based on wind strength
        if (Math.abs(this.wind.strength) < 3) {
            windBar.style.background = 'linear-gradient(90deg, #32CD32, #228B22)'; // Green for light wind
        } else if (Math.abs(this.wind.strength) < 7) {
            windBar.style.background = 'linear-gradient(90deg, #FFD700, #DAA520)'; // Yellow for moderate wind
        } else {
            windBar.style.background = 'linear-gradient(90deg, #FF6347, #DC143C)'; // Red for strong wind
        }
    }

    updateStats() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('shots').textContent = this.shots;
        const accuracy = this.shots > 0 ? Math.round((this.hits / this.shots) * 100) : 0;
        document.getElementById('accuracy').textContent = accuracy + '%';

        // Update target info (show info for first active target)
        const activeTarget = this.targets.find(t => t.active);
        if (activeTarget) {
            const distance = Math.round((activeTarget.x - this.bowX) / 10); // Convert to meters
            document.getElementById('target-distance').textContent = distance + 'm';
            document.getElementById('target-movement').textContent = activeTarget.movement === 'vertical' ? 'Up/Down' : 'Left/Right';
            document.getElementById('target-points').textContent = activeTarget.maxPoints;
        }
    }

    initializeAchievements() {
        return [
            { id: 'first_shot', name: 'First Flight', description: 'Fire your first arrow', unlocked: false },
            { id: 'first_hit', name: 'Bullseye Beginner', description: 'Hit your first target', unlocked: false },
            { id: 'accuracy_50', name: 'Sharp Shooter', description: 'Achieve 50% accuracy', unlocked: false },
            { id: 'accuracy_80', name: 'Marksman', description: 'Achieve 80% accuracy', unlocked: false },
            { id: 'score_100', name: 'Century Scorer', description: 'Score 100 points', unlocked: false },
            { id: 'score_500', name: 'Master Archer', description: 'Score 500 points', unlocked: false },
            { id: 'perfect_shot', name: 'Perfectionist', description: 'Hit the exact center of a target', unlocked: false }
        ];
    }

    checkAchievements() {
        const accuracy = this.shots > 0 ? (this.hits / this.shots) * 100 : 0;

        if (this.shots > 0) {
            this.achievements.find(a => a.id === 'first_shot').unlocked = true;
        }
        if (this.hits > 0) {
            this.achievements.find(a => a.id === 'first_hit').unlocked = true;
        }
        if (accuracy >= 50) {
            this.achievements.find(a => a.id === 'accuracy_50').unlocked = true;
        }
        if (accuracy >= 80) {
            this.achievements.find(a => a.id === 'accuracy_80').unlocked = true;
        }
        if (this.score >= 100) {
            this.achievements.find(a => a.id === 'score_100').unlocked = true;
        }
        if (this.score >= 500) {
            this.achievements.find(a => a.id === 'score_500').unlocked = true;
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

    playShootSound() {
        this.playTone(800, 0.1, 'square');
    }

    playHitSound() {
        this.playTone(600, 0.2, 'sine');
    }

    playMissSound() {
        this.playTone(200, 0.3, 'sawtooth');
    }

    playTone(frequency, duration, type = 'sine') {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Silently fail if Web Audio API not supported
        }
    }

    resetGame() {
        this.arrows = [];
        this.score = 0;
        this.shots = 0;
        this.hits = 0;
        this.generateTargets();
        this.updateStats();
        this.renderAchievements();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawBow();
        this.drawTargets();
        this.drawArrows();
        this.updateArrows();
        this.updateTargets();

        requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.3, '#98FB98');
        gradient.addColorStop(0.7, '#F0E68C');
        gradient.addColorStop(1, '#8B4513');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);

        // Grass texture
        this.ctx.fillStyle = '#228B22';
        for (let i = 0; i < this.canvas.width; i += 4) {
            const height = Math.random() * 10 + 5;
            this.ctx.fillRect(i, this.groundY - height, 2, height);
        }
    }

    drawBow() {
        // Bow
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(this.bowX, this.bowY, 30, Math.PI * 0.2, Math.PI * 0.8);
        this.ctx.stroke();

        // Bow string
        this.ctx.beginPath();
        this.ctx.moveTo(this.bowX, this.bowY - 30);
        this.ctx.lineTo(this.bowX, this.bowY + 30);
        this.ctx.stroke();

        // Arrow on bow
        this.drawArrow(this.bowX + 10, this.bowY, 0, 0, false);
    }

    drawTargets() {
        this.targets.forEach(target => {
            if (!target.active) return;

            const scale = target.hitAnimation > 0 ? 1.2 : 1;

            // Target rings
            const colors = ['#FFFFFF', '#FFD700', '#FF6347', '#DC143C', '#8B0000'];
            for (let i = 0; i < 5; i++) {
                this.ctx.beginPath();
                this.ctx.arc(target.x, target.y, (target.radius * scale) * (1 - i * 0.15), 0, Math.PI * 2);
                this.ctx.fillStyle = colors[i];
                this.ctx.fill();
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }

            // Center dot
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, 3 * scale, 0, Math.PI * 2);
            this.ctx.fillStyle = '#000';
            this.ctx.fill();
        });
    }

    drawArrows() {
        this.arrows.forEach(arrow => {
            if (arrow.active) {
                this.drawArrow(arrow.x, arrow.y, arrow.vx, arrow.vy, true);
            }

            // Draw trail
            arrow.trail.forEach((point, index) => {
                const alpha = index / arrow.trail.length;
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(139, 69, 19, ${alpha * 0.5})`;
                this.ctx.fill();
            });
        });
    }

    drawArrow(x, y, vx, vy, showMotion = false) {
        const angle = Math.atan2(vy, vx);

        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);

        // Arrow shaft
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-20, 0);
        this.ctx.stroke();

        // Arrow head
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-5, -3);
        this.ctx.lineTo(-5, 3);
        this.ctx.closePath();
        this.ctx.fill();

        // Fletching
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(-18, -2, 4, 4);
        this.ctx.fillStyle = '#0000FF';
        this.ctx.fillRect(-14, -2, 4, 4);

        this.ctx.restore();

        // Motion blur effect
        if (showMotion && (Math.abs(vx) > 2 || Math.abs(vy) > 2)) {
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(-25, -1, 5, 2);
            this.ctx.restore();
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PrecisionArcherGame();
});