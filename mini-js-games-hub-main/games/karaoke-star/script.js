// Karaoke Star Game Logic
class KaraokeStar {
    constructor() {
        this.currentSong = null;
        this.isPlaying = false;
        this.currentLineIndex = 0;
        this.score = 0;
        this.performance = 0;
        this.startTime = 0;
        this.timer = null;
        this.audioContext = null;

        // Song data with lyrics and timing
        this.songs = {
            'happy-birthday': {
                title: 'Happy Birthday',
                duration: 25,
                lyrics: [
                    { text: 'Happy birthday to you', start: 0, end: 4 },
                    { text: 'Happy birthday to you', start: 4, end: 8 },
                    { text: 'Happy birthday dear friend', start: 8, end: 12 },
                    { text: 'Happy birthday to you!', start: 12, end: 16 },
                    { text: '🎂🎈🎉', start: 16, end: 25 }
                ]
            },
            'twinkle-twinkle': {
                title: 'Twinkle Twinkle Little Star',
                duration: 30,
                lyrics: [
                    { text: 'Twinkle, twinkle, little star', start: 0, end: 4 },
                    { text: 'How I wonder what you are', start: 4, end: 8 },
                    { text: 'Up above the world so high', start: 8, end: 12 },
                    { text: 'Like a diamond in the sky', start: 12, end: 16 },
                    { text: 'Twinkle, twinkle, little star', start: 16, end: 20 },
                    { text: 'How I wonder what you are', start: 20, end: 24 },
                    { text: '✨🌟⭐', start: 24, end: 30 }
                ]
            },
            'row-row': {
                title: 'Row Row Row Your Boat',
                duration: 20,
                lyrics: [
                    { text: 'Row, row, row your boat', start: 0, end: 3 },
                    { text: 'Gently down the stream', start: 3, end: 6 },
                    { text: 'Merrily, merrily, merrily, merrily', start: 6, end: 10 },
                    { text: 'Life is but a dream', start: 10, end: 13 },
                    { text: '🚣‍♀️🌊💭', start: 13, end: 20 }
                ]
            },
            'amazing-grace': {
                title: 'Amazing Grace',
                duration: 35,
                lyrics: [
                    { text: 'Amazing grace, how sweet the sound', start: 0, end: 6 },
                    { text: 'That saved a wretch like me', start: 6, end: 10 },
                    { text: 'I once was lost, but now am found', start: 10, end: 16 },
                    { text: 'Was blind, but now I see', start: 16, end: 20 },
                    { text: '🎵🙏✨', start: 20, end: 35 }
                ]
            }
        };

        this.init();
    }

    init() {
        this.initAudio();
        this.bindEvents();
        this.updateDisplay();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    bindEvents() {
        // Song selection
        document.querySelectorAll('.song-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectSong(e.target.dataset.song);
            });
        });

        // Control buttons
        document.getElementById('play-btn').addEventListener('click', () => this.play());
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('stop-btn').addEventListener('click', () => this.stop());
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.isPlaying ? this.pause() : this.play();
                    break;
                case 'KeyR':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.restart();
                    }
                    break;
                case 'KeyS':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.stop();
                    }
                    break;
            }
        });
    }

    selectSong(songKey) {
        // Clear previous selection
        document.querySelectorAll('.song-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Set new selection
        document.querySelector(`[data-song="${songKey}"]`).classList.add('active');

        this.currentSong = this.songs[songKey];
        this.resetGame();
        this.updateDisplay();
    }

    play() {
        if (!this.currentSong) {
            alert('Please select a song first!');
            return;
        }

        this.isPlaying = true;
        this.startTime = Date.now() - (this.getCurrentTime() * 1000);

        this.updateControls();
        this.startTimer();
        this.playBackgroundMusic();
    }

    pause() {
        this.isPlaying = false;
        this.updateControls();
        this.stopTimer();
    }

    stop() {
        this.isPlaying = false;
        this.currentLineIndex = 0;
        this.score = 0;
        this.performance = 0;
        this.startTime = 0;
        this.updateControls();
        this.stopTimer();
        this.updateDisplay();
    }

    restart() {
        if (!this.currentSong) return;

        this.stop();
        setTimeout(() => this.play(), 100);
    }

    resetGame() {
        this.currentLineIndex = 0;
        this.score = 0;
        this.performance = 0;
        this.startTime = 0;
        this.isPlaying = false;
        this.updateControls();
        this.stopTimer();
    }

    startTimer() {
        this.stopTimer(); // Clear any existing timer
        this.timer = setInterval(() => {
            this.updateProgress();
            this.updateLyrics();
            this.checkSongEnd();
        }, 100);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    getCurrentTime() {
        if (!this.startTime) return 0;
        return (Date.now() - this.startTime) / 1000;
    }

    updateProgress() {
        const currentTime = this.getCurrentTime();
        const progress = (currentTime / this.currentSong.duration) * 100;

        document.getElementById('progress-fill').style.width = Math.min(progress, 100) + '%';
        document.getElementById('current-time').textContent = this.formatTime(currentTime);
        document.getElementById('total-time').textContent = this.formatTime(this.currentSong.duration);
    }

    updateLyrics() {
        const currentTime = this.getCurrentTime();
        const lyrics = this.currentSong.lyrics;

        // Find current line
        let currentIndex = -1;
        for (let i = 0; i < lyrics.length; i++) {
            if (currentTime >= lyrics[i].start && currentTime < lyrics[i].end) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex !== this.currentLineIndex) {
            this.currentLineIndex = currentIndex;
            this.updateLyricsDisplay();
            this.updateScore();
        }
    }

    updateLyricsDisplay() {
        const lyrics = this.currentSong.lyrics;
        const currentLineEl = document.getElementById('current-line');
        const nextLineEl = document.getElementById('next-line');

        if (this.currentLineIndex >= 0 && this.currentLineIndex < lyrics.length) {
            currentLineEl.textContent = lyrics[this.currentLineIndex].text;

            const nextIndex = this.currentLineIndex + 1;
            if (nextIndex < lyrics.length) {
                nextLineEl.textContent = lyrics[nextIndex].text;
            } else {
                nextLineEl.textContent = '';
            }
        } else {
            currentLineEl.textContent = 'Select a song to start singing!';
            nextLineEl.textContent = '';
        }
    }

    updateScore() {
        if (!this.isPlaying) return;

        // Simple scoring based on timing accuracy
        const currentTime = this.getCurrentTime();
        const currentLine = this.currentSong.lyrics[this.currentLineIndex];

        if (currentLine) {
            const lineCenter = (currentLine.start + currentLine.end) / 2;
            const timingAccuracy = 1 - Math.abs(currentTime - lineCenter) / ((currentLine.end - currentLine.start) / 2);

            if (timingAccuracy > 0.5) { // Good timing
                this.score += Math.floor(timingAccuracy * 100);
                this.performance = Math.min(100, this.performance + 10);
            }
        }

        this.updateDisplay();
    }

    checkSongEnd() {
        const currentTime = this.getCurrentTime();
        if (currentTime >= this.currentSong.duration) {
            this.songComplete();
        }
    }

    songComplete() {
        this.stop();
        this.showCompletionMessage();
        this.playCompletionSound();
    }

    showCompletionMessage() {
        const stars = Math.floor((this.score / 1000) * 5); // Max 5 stars for 1000+ points
        const starElements = document.querySelectorAll('.star');

        starElements.forEach((star, index) => {
            if (index < stars) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });

        setTimeout(() => {
            alert(`🎉 Song Complete! 🎉\n\nScore: ${this.score}\nStars: ${stars}/5\n\nGreat singing!`);
        }, 500);
    }

    updateControls() {
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const stopBtn = document.getElementById('stop-btn');
        const restartBtn = document.getElementById('restart-btn');

        playBtn.disabled = this.isPlaying;
        pauseBtn.disabled = !this.isPlaying;
        stopBtn.disabled = !this.currentSong;
        restartBtn.disabled = !this.currentSong;
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('performance-fill').style.width = this.performance + '%';

        const performanceText = document.getElementById('performance-text');
        if (this.performance >= 80) {
            performanceText.textContent = 'Amazing! ⭐';
            performanceText.style.color = '#6bcf7f';
        } else if (this.performance >= 60) {
            performanceText.textContent = 'Great job! 👍';
            performanceText.style.color = '#ffd93d';
        } else if (this.performance >= 40) {
            performanceText.textContent = 'Keep singing! 🎤';
            performanceText.style.color = '#ff6b6b';
        } else {
            performanceText.textContent = this.currentSong ? 'Sing along!' : 'Ready to sing!';
            performanceText.style.color = '#ffffff';
        }
    }

    playBackgroundMusic() {
        if (!this.audioContext) return;

        // Create a simple background melody
        const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C4 to C5

        let noteIndex = 0;
        const playNote = () => {
            if (!this.isPlaying) return;

            const frequency = notes[noteIndex % notes.length];
            this.playTone(frequency, 0.5);

            noteIndex++;
            setTimeout(playNote, 1000); // Play a note every second
        };

        playNote();
    }

    playTone(frequency, duration) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playCompletionSound() {
        if (!this.audioContext) return;

        // Play a celebratory chord
        const frequencies = [261.63, 329.63, 392.00]; // C4, E4, G4
        frequencies.forEach((freq, index) => {
            setTimeout(() => this.playTone(freq, 1), index * 100);
        });
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new KaraokeStar();
});

// Enable audio on first user interaction
document.addEventListener('click', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, { once: true });