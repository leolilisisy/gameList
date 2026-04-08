class PixelHarmony {
    constructor() {
        this.score = 0;
        this.streak = 0;
        this.totalAttempts = 0;
        this.successfulAttempts = 0;
        this.targetColor = this.generateRandomColor();
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.updateTargetColor();
        this.resetPlayerColor();
        this.updateDisplay();
    }

    generateRandomColor() {
        return {
            r: Math.floor(Math.random() * 256),
            g: Math.floor(Math.random() * 256),
            b: Math.floor(Math.random() * 256)
        };
    }

    updateTargetColor() {
        this.targetColor = this.generateRandomColor();
        const targetColorElement = document.getElementById('targetColor');
        const targetCodeElement = document.getElementById('targetCode');
        
        const colorString = this.rgbToHex(this.targetColor);
        targetColorElement.style.background = colorString;
        targetCodeElement.textContent = colorString;
    }

    resetPlayerColor() {
        document.getElementById('redSlider').value = 255;
        document.getElementById('greenSlider').value = 255;
        document.getElementById('blueSlider').value = 255;
        this.updatePlayerColor();
    }

    updatePlayerColor() {
        const r = parseInt(document.getElementById('redSlider').value);
        const g = parseInt(document.getElementById('greenSlider').value);
        const b = parseInt(document.getElementById('blueSlider').value);
        
        const playerColor = { r, g, b };
        const colorString = this.rgbToHex(playerColor);
        
        document.getElementById('playerColor').style.background = colorString;
        document.getElementById('playerCode').textContent = colorString;
        
        document.getElementById('redValue').textContent = r;
        document.getElementById('greenValue').textContent = g;
        document.getElementById('blueValue').textContent = b;
        
        return playerColor;
    }

    rgbToHex(color) {
        return `#${this.componentToHex(color.r)}${this.componentToHex(color.g)}${this.componentToHex(color.b)}`;
    }

    componentToHex(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    calculateColorDifference(color1, color2) {
        const dr = color1.r - color2.r;
        const dg = color1.g - color2.g;
        const db = color1.b - color2.b;
        
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    checkMatch() {
        const playerColor = this.updatePlayerColor();
        const difference = this.calculateColorDifference(playerColor, this.targetColor);
        const maxDifference = Math.sqrt(3 * 255 * 255); 
        const similarity = 100 - (difference / maxDifference) * 100;
        
        this.totalAttempts++;
        
        let feedbackText = '';
        let points = 0;
        
        if (similarity >= 95) {
            feedbackText = 'Perfect Match! 🎯';
            points = 100;
            this.streak++;
            this.successfulAttempts++;
            this.celebrate();
        } else if (similarity >= 85) {
            feedbackText = 'Great Job! ✨';
            points = 70;
            this.streak++;
            this.successfulAttempts++;
        } else if (similarity >= 70) {
            feedbackText = 'Good! 👍';
            points = 40;
            this.streak = 0;
            this.successfulAttempts++;
        } else if (similarity >= 50) {
            feedbackText = 'Getting Closer! 💪';
            points = 20;
            this.streak = 0;
        } else {
            feedbackText = 'Keep Trying! 🔄';
            points = 0;
            this.streak = 0;
        }
        
        this.score += points;
        
        document.getElementById('feedbackText').textContent = feedbackText;
        document.getElementById('differenceFill').style.width = `${similarity}%`;
        
        document.getElementById('playerColor').classList.add('pulse');
        setTimeout(() => {
            document.getElementById('playerColor').classList.remove('pulse');
        }, 500);
        
        this.updateDisplay();
        
        if (similarity >= 95) {
            setTimeout(() => {
                this.nextColor();
            }, 1500);
        }
    }

    nextColor() {
        this.updateTargetColor();
        this.resetPlayerColor();
        document.getElementById('differenceFill').style.width = '100%';
        document.getElementById('feedbackText').textContent = 'Match the new color!';
    }

    celebrate() {
        const confetti = document.getElementById('confetti');
        confetti.style.opacity = '1';
        
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '10px';
            particle.style.height = '10px';
            particle.style.background = this.getRandomColor();
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animation = `fall ${Math.random() * 2 + 1}s linear forwards`;
            confetti.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 3000);
        }
        
        setTimeout(() => {
            confetti.style.opacity = '0';
            confetti.innerHTML = '';
        }, 2000);
        
        document.getElementById('targetColor').classList.add('celebrate');
        setTimeout(() => {
            document.getElementById('targetColor').classList.remove('celebrate');
        }, 600);
    }

    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
        
        const accuracy = this.totalAttempts > 0 
            ? Math.round((this.successfulAttempts / this.totalAttempts) * 100)
            : 0;
        document.getElementById('accuracy').textContent = accuracy + '%';
    }

    setupEventListeners() {
        document.getElementById('redSlider').addEventListener('input', () => {
            this.updatePlayerColor();
        });
        
        document.getElementById('greenSlider').addEventListener('input', () => {
            this.updatePlayerColor();
        });
        
        document.getElementById('blueSlider').addEventListener('input', () => {
            this.updatePlayerColor();
        });

        // Button events
        document.getElementById('checkBtn').addEventListener('click', () => {
            this.checkMatch();
        });

        document.getElementById('newColorBtn').addEventListener('click', () => {
            this.nextColor();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.checkMatch();
            } else if (e.code === 'Enter') {
                e.preventDefault();
                this.nextColor();
            }
        });
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

window.addEventListener('load', () => {
    new PixelHarmony();
});