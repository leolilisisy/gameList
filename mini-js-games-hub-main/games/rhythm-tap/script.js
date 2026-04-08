class RhythmTap {
    constructor() {
        this.isPlaying = false;
        this.score = 0;
        this.combo = 0;
        this.streak = 0;
        this.totalTaps = 0;
        this.accurateTaps = 0;
        this.currentBeat = 0;
        this.beatInterval = null;
        this.circleAnimation = null;
        this.difficulty = 'easy';
        this.song = 'electronic';
        
        this.beatPatterns = {
            electronic: [1, 0, 1, 0, 1, 0, 1, 1],
            jazz: [1, 0, 0, 1, 0, 1, 0, 0],
            hiphop: [1, 0, 0, 0, 1, 0, 1, 0],
            latin: [1, 0, 1, 1, 0, 1, 0, 1]
        };
        
        this.difficultySettings = {
            easy: { speed: 120, tolerance: 150 },
            medium: { speed: 140, tolerance: 100 },
            hard: { speed: 160, tolerance: 70 }
        };
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.updateDisplay();
        this.createBeatMarkers();
    }

    createBeatMarkers() {
        const indicators = document.getElementById('beatIndicators');
        indicators.innerHTML = '';
        
        const pattern = this.beatPatterns[this.song];
        const trackWidth = document.querySelector('.track').offsetWidth;
        
        pattern.forEach((beat, index) => {
            if (beat === 1) {
                const marker = document.createElement('div');
                marker.className = 'beat-marker';
                marker.style.left = `${(index / pattern.length) * 100}%`;
                indicators.appendChild(marker);
            }
        });
    }

    startGame() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentBeat = 0;
        this.updateDisplay();
        
        const settings = this.difficultySettings[this.difficulty];
        const beatDuration = 60000 / settings.speed; 
        
        this.beatInterval = setInterval(() => {
            this.playBeat();
        }, beatDuration);
        
        this.animateCircle();
        document.getElementById('playBtn').textContent = 'Stop';
    }

    stopGame() {
        this.isPlaying = false;
        clearInterval(this.beatInterval);
        cancelAnimationFrame(this.circleAnimation);
        document.getElementById('playBtn').textContent = 'Play';
        this.resetCircle();
    }

    playBeat() {
        const pattern = this.beatPatterns[this.song];
        const shouldTap = pattern[this.currentBeat] === 1;
        
        if (shouldTap) {
            this.createVisualizerEffect();
        }
        
        this.currentBeat = (this.currentBeat + 1) % pattern.length;
    }

    animateCircle() {
        const circle = document.getElementById('tapCircle');
        const track = document.querySelector('.track');
        const trackWidth = track.offsetWidth;
        const circleWidth = circle.offsetWidth;
        const duration = this.difficultySettings[this.difficulty].speed / 60 * 1000;
        
        let startTime = null;
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) % duration;
            const position = (progress / duration) * (trackWidth + circleWidth) - circleWidth;
            
            circle.style.left = `${position}px`;
            
            if (this.isPlaying) {
                this.circleAnimation = requestAnimationFrame(animate);
            }
        };
        
        this.circleAnimation = requestAnimationFrame(animate);
    }

    resetCircle() {
        const circle = document.getElementById('tapCircle');
        circle.style.left = '-60px';
    }

    handleTap() {
        if (!this.isPlaying) return;
        
        this.totalTaps++;
        const circle = document.getElementById('tapCircle');
        const track = document.querySelector('.track');
        const trackWidth = track.offsetWidth;
        const circlePos = parseInt(circle.style.left);
        const targetPos = trackWidth / 2;
        const distance = Math.abs(circlePos - targetPos);
        const tolerance = this.difficultySettings[this.difficulty].tolerance;
        
        let rating = 'miss';
        let points = 0;
        let feedback = '';
        
        if (distance < tolerance * 0.3) {
            rating = 'perfect';
            points = 100;
            feedback = 'PERFECT! 🎯';
            this.combo++;
            this.streak++;
            this.accurateTaps++;
            circle.classList.add('glow');
            setTimeout(() => circle.classList.remove('glow'), 300);
        } else if (distance < tolerance * 0.6) {
            rating = 'good';
            points = 70;
            feedback = 'Good! 👍';
            this.combo++;
            this.streak = 0;
            this.accurateTaps++;
        } else if (distance < tolerance) {
            rating = 'ok';
            points = 40;
            feedback = 'OK 👌';
            this.combo = 0;
            this.streak = 0;
            this.accurateTaps++;
        } else {
            rating = 'miss';
            points = 0;
            feedback = 'Miss! ❌';
            this.combo = 0;
            this.streak = 0;
            circle.classList.add('shake');
            setTimeout(() => circle.classList.remove('shake'), 300);
        }
        
        if (this.combo > 1) {
            points *= Math.min(this.combo, 5);
            feedback += ` x${Math.min(this.combo, 5)}`;
        }
        
        this.score += points;
        
        const timingIndicator = document.getElementById('currentTiming');
        const timingPos = (distance / tolerance) * 100;
        timingIndicator.style.left = `${Math.min(timingPos, 100)}%`;
        
        document.getElementById('feedbackText').textContent = feedback;
        
        this.playTapSound();
        
        circle.classList.add('pulse');
        setTimeout(() => circle.classList.remove('pulse'), 100);
        
        this.updateDisplay();
    }

    playTapSound() {
        const audio = document.getElementById('tapSound');
        audio.currentTime = 0;
        audio.play().catch(() => {
            
        });
    }

    createVisualizerEffect() {
        const bars = document.querySelectorAll('.frequency-bar');
        bars.forEach(bar => {
            bar.style.animation = 'none';
            void bar.offsetWidth;
            bar.style.animation = null;
        });
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('combo').textContent = this.combo;
        document.getElementById('streak').textContent = this.streak;
        
        const accuracy = this.totalTaps > 0 
            ? Math.round((this.accurateTaps / this.totalTaps) * 100)
            : 100;
        document.getElementById('accuracy').textContent = accuracy + '%';
    }

    changeDifficulty(level) {
        this.difficulty = level;
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${level}"]`).classList.add('active');
        
        if (this.isPlaying) {
            this.stopGame();
            this.startGame();
        }
    }

    changeSong(song) {
        this.song = song;
        this.createBeatMarkers();
        
        if (this.isPlaying) {
            this.stopGame();
            this.startGame();
        }
    }

    setupEventListeners() {
        document.getElementById('playBtn').addEventListener('click', () => {
            if (this.isPlaying) {
                this.stopGame();
            } else {
                this.startGame();
            }
        });

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeDifficulty(e.target.dataset.difficulty);
            });
        });

        document.getElementById('songSelect').addEventListener('change', (e) => {
            this.changeSong(e.target.value);
        });

        document.addEventListener('click', () => {
            this.handleTap();
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleTap();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
            }
        });
    }
}

window.addEventListener('load', () => {
    new RhythmTap();
});
