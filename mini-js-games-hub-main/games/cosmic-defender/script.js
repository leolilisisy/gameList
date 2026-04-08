class CosmicDefender {
    constructor() {
        this.gameActive = false;
        this.gamePaused = false;
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.powerLevel = 1;
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.powerups = [];
        this.keys = {};
        this.lastShot = 0;
        this.shotDelay = 300;
        this.enemySpawnRate = 2000;
        this.lastEnemySpawn = 0;
        this.lastPowerupSpawn = 0;
        this.powerupSpawnRate = 10000;
        this.enemiesKilled = 0;
        
        this.gameScreen = document.getElementById('gameScreen');
        this.playerShip = document.getElementById('playerShip');
        this.enemiesContainer = document.getElementById('enemiesContainer');
        this.projectilesContainer = document.getElementById('projectilesContainer');
        this.powerupsContainer = document.getElementById('powerupsContainer');
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.updateHUD();
        this.playerShip.style.left = '50%';
    }

    startGame() {
        if (this.gameActive) return;
        
        this.gameActive = true;
        this.gamePaused = false;
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.powerLevel = 1;
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.powerups = [];
        this.enemiesKilled = 0;
        
        this.updateHUD();
        this.hideGameOver();
        this.showWaveAlert();
        this.gameLoop();
    }

    pauseGame() {
        if (!this.gameActive) return;
        this.gamePaused = !this.gamePaused;
    }

    gameLoop() {
        if (!this.gameActive || this.gamePaused) return;

        this.updatePlayer();
        this.spawnEnemies();
        this.spawnPowerups();
        this.updateProjectiles();
        this.updateEnemies();
        this.updatePowerups();
        this.checkCollisions();
        this.updateHUD();

        requestAnimationFrame(() => this.gameLoop());
    }

    updatePlayer() {
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.movePlayer(-8);
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.movePlayer(8);
        }
        if (this.keys['Space'] && Date.now() - this.lastShot > this.shotDelay) {
            this.shoot();
        }
    }

    movePlayer(deltaX) {
        const rect = this.gameScreen.getBoundingClientRect();
        const playerRect = this.playerShip.getBoundingClientRect();
        const currentLeft = parseInt(this.playerShip.style.left) || 400;
        const newLeft = Math.max(20, Math.min(rect.width - 20, currentLeft + deltaX));
        
        this.playerShip.style.left = `${newLeft}px`;
    }

    shoot() {
        this.lastShot = Date.now();
        const playerRect = this.playerShip.getBoundingClientRect();
        
        for (let i = 0; i < this.powerLevel; i++) {
            const offset = (i - (this.powerLevel - 1) / 2) * 15;
            this.createProjectile(
                playerRect.left + playerRect.width / 2 + offset - 2,
                playerRect.top - 10,
                false
            );
        }
    }

    createProjectile(x, y, isEnemy) {
        const projectile = document.createElement('div');
        projectile.className = isEnemy ? 'projectile enemy-projectile' : 'projectile';
        projectile.style.left = `${x}px`;
        projectile.style.top = `${y}px`;
        
        if (isEnemy) {
            this.enemyProjectiles.push({
                element: projectile,
                x: x,
                y: y,
                speed: 5
            });
        } else {
            this.projectiles.push({
                element: projectile,
                x: x,
                y: y,
                speed: -8
            });
        }
        
        this.projectilesContainer.appendChild(projectile);
    }

    spawnEnemies() {
        if (Date.now() - this.lastEnemySpawn > this.enemySpawnRate) {
            this.lastEnemySpawn = Date.now();
            
            const enemyCount = Math.min(5 + this.wave, 15);
            for (let i = 0; i < enemyCount; i++) {
                setTimeout(() => {
                    if (this.gameActive && !this.gamePaused) {
                        this.createEnemy();
                    }
                }, i * 300);
            }
        }
    }

    createEnemy() {
        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        
        const x = Math.random() * (this.gameScreen.offsetWidth - 40) + 20;
        enemy.style.left = `${x}px`;
        enemy.style.top = '-40px';
        
        const enemyObj = {
            element: enemy,
            x: x,
            y: -40,
            speed: 1 + this.wave * 0.2,
            health: 1,
            lastShot: Date.now(),
            shotDelay: 1500 + Math.random() * 1000
        };
        
        this.enemies.push(enemyObj);
        this.enemiesContainer.appendChild(enemy);
    }

    spawnPowerups() {
        if (Date.now() - this.lastPowerupSpawn > this.powerupSpawnRate && Math.random() < 0.3) {
            this.lastPowerupSpawn = Date.now();
            this.createPowerup();
        }
    }

    createPowerup() {
        const powerup = document.createElement('div');
        powerup.className = 'powerup';
        
        const x = Math.random() * (this.gameScreen.offsetWidth - 30) + 15;
        powerup.style.left = `${x}px`;
        powerup.style.top = '-30px';
        
        const powerupObj = {
            element: powerup,
            x: x,
            y: -30,
            speed: 2,
            type: Math.random() < 0.7 ? 'power' : 'life'
        };
        
        this.powerups.push(powerupObj);
        this.powerupsContainer.appendChild(powerup);
    }

    updateProjectiles() {
        this.projectiles.forEach((projectile, index) => {
            projectile.y += projectile.speed;
            projectile.element.style.top = `${projectile.y}px`;
            
            if (projectile.y < -20) {
                projectile.element.remove();
                this.projectiles.splice(index, 1);
            }
        });

        this.enemyProjectiles.forEach((projectile, index) => {
            projectile.y += projectile.speed;
            projectile.element.style.top = `${projectile.y}px`;
            
            if (projectile.y > this.gameScreen.offsetHeight) {
                projectile.element.remove();
                this.enemyProjectiles.splice(index, 1);
            }
        });
    }

    updateEnemies() {
        this.enemies.forEach((enemy, index) => {
            enemy.y += enemy.speed;
            enemy.element.style.top = `${enemy.y}px`;
            
            if (enemy.y > this.gameScreen.offsetHeight) {
                enemy.element.remove();
                this.enemies.splice(index, 1);
            } else if (Date.now() - enemy.lastShot > enemy.shotDelay) {
                enemy.lastShot = Date.now();
                this.enemyShoot(enemy);
            }
        });
    }

    updatePowerups() {
        this.powerups.forEach((powerup, index) => {
            powerup.y += powerup.speed;
            powerup.element.style.top = `${powerup.y}px`;
            
            if (powerup.y > this.gameScreen.offsetHeight) {
                powerup.element.remove();
                this.powerups.splice(index, 1);
            }
        });
    }

    enemyShoot(enemy) {
        const enemyRect = enemy.element.getBoundingClientRect();
        const gameRect = this.gameScreen.getBoundingClientRect();
        
        this.createProjectile(
            enemyRect.left + enemyRect.width / 2 - 2,
            enemyRect.bottom,
            true
        );
    }

    checkCollisions() {
        this.checkPlayerProjectileCollisions();
        this.checkPlayerEnemyCollisions();
        this.checkPlayerPowerupCollisions();
    }

    checkPlayerProjectileCollisions() {
        const playerRect = this.playerShip.getBoundingClientRect();
        
        this.enemyProjectiles.forEach((projectile, pIndex) => {
            const projRect = projectile.element.getBoundingClientRect();
            
            if (this.rectIntersect(playerRect, projRect)) {
                this.takeDamage();
                projectile.element.remove();
                this.enemyProjectiles.splice(pIndex, 1);
            }
        });
    }

    checkPlayerEnemyCollisions() {
        const playerRect = this.playerShip.getBoundingClientRect();
        
        this.enemies.forEach((enemy, eIndex) => {
            const enemyRect = enemy.element.getBoundingClientRect();
            
            if (this.rectIntersect(playerRect, enemyRect)) {
                this.takeDamage();
                this.createExplosion(enemy.x, enemy.y);
                enemy.element.remove();
                this.enemies.splice(eIndex, 1);
            }
        });
    }

    checkPlayerPowerupCollisions() {
        const playerRect = this.playerShip.getBoundingClientRect();
        
        this.powerups.forEach((powerup, pIndex) => {
            const powerupRect = powerup.element.getBoundingClientRect();
            
            if (this.rectIntersect(playerRect, powerupRect)) {
                this.collectPowerup(powerup.type);
                powerup.element.remove();
                this.powerups.splice(pIndex, 1);
            }
        });
        
        this.projectiles.forEach((projectile, pIndex) => {
            this.enemies.forEach((enemy, eIndex) => {
                const projRect = projectile.element.getBoundingClientRect();
                const enemyRect = enemy.element.getBoundingClientRect();
                
                if (this.rectIntersect(projRect, enemyRect)) {
                    enemy.health--;
                    
                    if (enemy.health <= 0) {
                        this.score += 100 * this.wave;
                        this.enemiesKilled++;
                        this.createExplosion(enemy.x, enemy.y);
                        enemy.element.remove();
                        this.enemies.splice(eIndex, 1);
                        
                        if (this.enemies.length === 0) {
                            this.nextWave();
                        }
                    }
                    
                    projectile.element.remove();
                    this.projectiles.splice(pIndex, 1);
                }
            });
        });
    }

    collectPowerup(type) {
        if (type === 'power') {
            this.powerLevel = Math.min(this.powerLevel + 1, 5);
        } else if (type === 'life') {
            this.lives = Math.min(this.lives + 1, 5);
        }
    }

    takeDamage() {
        this.lives--;
        this.createExplosion(
            parseInt(this.playerShip.style.left),
            this.gameScreen.offsetHeight - 50
        );
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    nextWave() {
        this.wave++;
        this.showWaveAlert();
        this.enemySpawnRate = Math.max(500, 2000 - this.wave * 100);
    }

    createExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = `${x - 25}px`;
        explosion.style.top = `${y - 25}px`;
        
        this.gameScreen.appendChild(explosion);
        
        setTimeout(() => {
            explosion.remove();
        }, 500);
    }

    rectIntersect(rect1, rect2) {
        return !(rect2.left > rect1.right || 
                rect2.right < rect1.left || 
                rect2.top > rect1.bottom ||
                rect2.bottom < rect1.top);
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('wave').textContent = this.wave;
        
        let powerText = 'NORMAL';
        if (this.powerLevel >= 4) powerText = 'ULTRA';
        else if (this.powerLevel >= 3) powerText = 'SUPER';
        else if (this.powerLevel >= 2) powerText = 'POWER';
        
        document.getElementById('power').textContent = powerText;
    }

    showWaveAlert() {
        const waveAlert = document.getElementById('waveAlert');
        const waveNumber = document.getElementById('waveNumber');
        
        waveNumber.textContent = this.wave;
        waveAlert.classList.add('active');
        
        setTimeout(() => {
            waveAlert.classList.remove('active');
        }, 2000);
    }

    gameOver() {
        this.gameActive = false;
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalWave').textContent = this.wave;
        document.getElementById('finalKills').textContent = this.enemiesKilled;
        
        this.showGameOver();
        
        this.enemies.forEach(enemy => enemy.element.remove());
        this.projectiles.forEach(projectile => projectile.element.remove());
        this.enemyProjectiles.forEach(projectile => projectile.element.remove());
        this.powerups.forEach(powerup => powerup.element.remove());
        
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.powerups = [];
    }

    showGameOver() {
        document.getElementById('gameOver').classList.add('active');
    }

    hideGameOver() {
        document.getElementById('gameOver').classList.remove('active');
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'KeyP') {
                this.pauseGame();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseGame();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('retryBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.querySelectorAll('.move-btn').forEach(btn => {
            btn.addEventListener('mousedown', (e) => {
                this.keys[`Arrow${e.target.dataset.direction.toUpperCase()}`] = true;
            });

            btn.addEventListener('mouseup', (e) => {
                this.keys[`Arrow${e.target.dataset.direction.toUpperCase()}`] = false;
            });

            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys[`Arrow${e.target.dataset.direction.toUpperCase()}`] = true;
            });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys[`Arrow${e.target.dataset.direction.toUpperCase()}`] = false;
            });
        });

        document.querySelector('.shoot-btn').addEventListener('mousedown', () => {
            this.keys['Space'] = true;
        });

        document.querySelector('.shoot-btn').addEventListener('mouseup', () => {
            this.keys['Space'] = false;
        });

        document.querySelector('.shoot-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys['Space'] = true;
        });

        document.querySelector('.shoot-btn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys['Space'] = false;
        });
    }
}

window.addEventListener('load', () => {
    new CosmicDefender();
});