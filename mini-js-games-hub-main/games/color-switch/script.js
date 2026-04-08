// Color Switch Game
// A fast-paced color matching platformer

class ColorSwitchGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.finalScoreElement = document.getElementById('final-score');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over');
        this.restartBtn = document.getElementById('restart-btn');

        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];
        this.ball = { x: this.canvas.width / 2, y: 50, radius: 12, colorIndex: 0, vy: 0 };
        this.platforms = [];
        this.score = 0;
        this.highScore = localStorage.getItem('colorSwitchHighScore') || 0;
        this.gameRunning = false;
        this.gameOver = false;
        this.difficulty = 1;

        this.setupEventListeners();
        this.showStartScreen();
        this.updateHighScoreDisplay();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', () => this.handleClick());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleClick();
        });
        this.restartBtn.addEventListener('click', () => this.restartGame());
    }

    handleClick() {
        if (!this.gameRunning && !this.gameOver) {
            this.startGame();
        } else if (this.gameRunning) {
            this.switchBallColor();
        } else if (this.gameOver) {
            this.restartGame();
        }
    }

    startGame() {
        this.gameRunning = true;
        this.gameOver = false;
        this.score = 0;
        this.difficulty = 1;
        this.ball.y = 50;
        this.ball.vy = 0;
        this.ball.colorIndex = 0;
        this.platforms = [];
        this.generatePlatforms();
        this.hideStartScreen();
        this.hideGameOverScreen();
        this.gameLoop();
    }

    switchBallColor() {
        this.ball.colorIndex = (this.ball.colorIndex + 1) % this.colors.length;
    }

    generatePlatforms() {
        this.platforms = [];
        for (let i = 0; i < 10; i++) {
            const platform = {
                x: this.canvas.width / 2,
                y: 150 + i * 120,
                radius: 60,
                rotation: 0,
                rotationSpeed: 0.02 + (this.difficulty * 0.005),
                colors: this.shuffleArray([...this.colors])
            };
            this.platforms.push(platform);
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    update() {
        if (!this.gameRunning) return;

        // Update ball physics
        this.ball.vy += 0.3; // gravity
        this.ball.y += this.ball.vy;

        // Update platforms
        this.platforms.forEach(platform => {
            platform.rotation += platform.rotationSpeed;
        });

        // Check platform collisions
        this.platforms.forEach(platform => {
            const dx = this.ball.x - platform.x;
            const dy = this.ball.y - platform.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < platform.radius + this.ball.radius) {
                // Check if ball color matches platform color at collision point
                const angle = Math.atan2(dy, dx) - platform.rotation;
                const colorIndex = Math.floor((angle + Math.PI) / (Math.PI * 2) * platform.colors.length) % platform.colors.length;
                const platformColor = platform.colors[colorIndex];

                if (platformColor !== this.colors[this.ball.colorIndex]) {
                    this.endGame();
                    return;
                }

                // Bounce off platform
                if (this.ball.vy > 0) {
                    this.ball.vy = -8 - (this.difficulty * 0.5);
                    this.score += 10;
                    this.updateScoreDisplay();

                    // Increase difficulty
                    this.difficulty += 0.1;
                    platform.rotationSpeed = 0.02 + (this.difficulty * 0.005);
                }
            }
        });

        // Check if ball fell off screen
        if (this.ball.y > this.canvas.height + 50) {
            this.endGame();
        }

        // Add new platforms as ball progresses
        const lastPlatform = this.platforms[this.platforms.length - 1];
        if (lastPlatform && this.ball.y > lastPlatform.y - 200) {
            const newPlatform = {
                x: this.canvas.width / 2,
                y: lastPlatform.y + 120,
                radius: 60,
                rotation: 0,
                rotationSpeed: 0.02 + (this.difficulty * 0.005),
                colors: this.shuffleArray([...this.colors])
            };
            this.platforms.push(newPlatform);
        }

        // Remove off-screen platforms
        this.platforms = this.platforms.filter(platform => platform.y > this.ball.y - 200);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(44, 62, 80, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw platforms
        this.platforms.forEach(platform => {
            this.ctx.save();
            this.ctx.translate(platform.x, platform.y);
            this.ctx.rotate(platform.rotation);

            const angleStep = (Math.PI * 2) / platform.colors.length;
            for (let i = 0; i < platform.colors.length; i++) {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, platform.radius, i * angleStep, (i + 1) * angleStep);
                this.ctx.lineTo(0, 0);
                this.ctx.fillStyle = platform.colors[i];
                this.ctx.fill();
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }

            this.ctx.restore();
        });

        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colors[this.ball.colorIndex];
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw ball trail
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius + 3, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.colors[this.ball.colorIndex];
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    gameLoop() {
        if (this.gameRunning && !this.gameOver) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        this.finalScoreElement.textContent = this.score;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('colorSwitchHighScore', this.highScore);
            this.updateHighScoreDisplay();
        }

        this.showGameOverScreen();
    }

    restartGame() {
        this.hideGameOverScreen();
        this.startGame();
    }

    updateScoreDisplay() {
        this.scoreElement.textContent = this.score;
        this.scoreElement.classList.add('score-flash');
        setTimeout(() => this.scoreElement.classList.remove('score-flash'), 300);
    }

    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }

    showStartScreen() {
        this.startScreen.classList.remove('hidden');
    }

    hideStartScreen() {
        this.startScreen.classList.add('hidden');
    }

    showGameOverScreen() {
        this.gameOverScreen.classList.remove('hidden');
    }

    hideGameOverScreen() {
        this.gameOverScreen.classList.add('hidden');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ColorSwitchGame();
});