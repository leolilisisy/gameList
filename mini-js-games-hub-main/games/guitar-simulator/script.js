// Guitar Simulator Game Logic
class GuitarSimulator {
    constructor() {
        this.strings = 6;
        this.frets = 13;
        this.pressedFrets = new Set();
        this.audioContext = null;
        this.currentTuning = 'standard';
        this.tunings = {
            standard: ['E', 'B', 'G', 'D', 'A', 'E'],
            'drop-d': ['D', 'B', 'G', 'D', 'A', 'E'],
            'open-g': ['D', 'B', 'G', 'D', 'G', 'D']
        };

        this.chords = {
            'A': [{string: 5, fret: 0}, {string: 4, fret: 2}, {string: 3, fret: 2}, {string: 2, fret: 2}],
            'Am': [{string: 5, fret: 0}, {string: 4, fret: 2}, {string: 3, fret: 2}],
            'C': [{string: 5, fret: 3}, {string: 4, fret: 2}, {string: 3, fret: 0}, {string: 2, fret: 1}],
            'Cm': [{string: 5, fret: 3}, {string: 4, fret: 4}, {string: 3, fret: 5}],
            'D': [{string: 4, fret: 0}, {string: 3, fret: 0}, {string: 2, fret: 2}, {string: 1, fret: 3}],
            'Dm': [{string: 4, fret: 0}, {string: 3, fret: 0}, {string: 2, fret: 2}],
            'E': [{string: 5, fret: 0}, {string: 4, fret: 0}, {string: 3, fret: 0}],
            'Em': [{string: 5, fret: 0}, {string: 4, fret: 0}],
            'G': [{string: 5, fret: 3}, {string: 4, fret: 2}, {string: 3, fret: 0}, {string: 2, fret: 0}],
            'Gm': [{string: 5, fret: 3}, {string: 4, fret: 3}, {string: 3, fret: 3}]
        };

        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.init();
    }

    init() {
        this.initAudio();
        this.createFretboard();
        this.bindEvents();
        this.updateStringNames();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    createFretboard() {
        const fretboard = document.getElementById('fretboard');
        fretboard.innerHTML = '';

        for (let string = 0; string < this.strings; string++) {
            const stringElement = document.createElement('div');
            stringElement.className = 'string';

            for (let fret = 0; fret < this.frets; fret++) {
                const fretElement = document.createElement('div');
                fretElement.className = 'fret';
                fretElement.dataset.string = string;
                fretElement.dataset.fret = fret;

                // Add note marker for open strings and certain frets
                if (fret > 0) {
                    const note = this.getNoteName(string, fret);
                    const marker = document.createElement('div');
                    marker.className = 'fret-marker';
                    marker.textContent = note;
                    fretElement.appendChild(marker);
                }

                stringElement.appendChild(fretElement);
            }

            fretboard.appendChild(stringElement);
        }
    }

    getNoteName(stringIndex, fret) {
        const openNote = this.tunings[this.currentTuning][stringIndex];
        const openNoteIndex = this.noteNames.indexOf(openNote);
        const noteIndex = (openNoteIndex + fret) % 12;
        return this.noteNames[noteIndex];
    }

    getNoteFrequency(stringIndex, fret) {
        const openNote = this.tunings[this.currentTuning][stringIndex];
        const openNoteIndex = this.noteNames.indexOf(openNote);
        const noteIndex = (openNoteIndex + fret) % 12;
        const octave = Math.floor((openNoteIndex + fret) / 12);

        // Base frequency for C4 = 261.63 Hz
        const baseFrequency = 261.63;
        const semitoneRatio = Math.pow(2, 1/12);

        // Calculate frequency based on note index from C4
        const noteOffset = noteIndex - this.noteNames.indexOf('C');
        return baseFrequency * Math.pow(semitoneRatio, noteOffset + (octave * 12));
    }

    playNote(stringIndex, fret) {
        if (!this.audioContext) return;

        const frequency = this.getNoteFrequency(stringIndex, fret);

        // Create oscillator for the note
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // Guitar-like sound with some harmonics
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // Add some filtering for guitar tone
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);

        // Envelope for attack/decay
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);

        // Connect nodes
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Play the note
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1);
    }

    bindEvents() {
        // Fret click events
        document.getElementById('fretboard').addEventListener('click', (e) => {
            if (e.target.classList.contains('fret')) {
                const stringIndex = parseInt(e.target.dataset.string);
                const fret = parseInt(e.target.dataset.fret);
                this.toggleFret(stringIndex, fret);
            }
        });

        // Tuning selector
        document.getElementById('tuning-select').addEventListener('change', (e) => {
            this.currentTuning = e.target.value;
            this.updateStringNames();
            this.createFretboard();
            this.clearAllFrets();
        });

        // Chord selector
        document.getElementById('chord-select').addEventListener('change', (e) => {
            const chord = e.target.value;
            if (chord) {
                this.showChord(chord);
            }
        });

        // Play chord button
        document.getElementById('play-chord-btn').addEventListener('click', () => {
            this.playCurrentChord();
        });

        // Clear button
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearAllFrets();
        });
    }

    toggleFret(stringIndex, fret) {
        const fretKey = `${stringIndex}-${fret}`;
        const fretElement = document.querySelector(`[data-string="${stringIndex}"][data-fret="${fret}"]`);

        if (this.pressedFrets.has(fretKey)) {
            this.pressedFrets.delete(fretKey);
            fretElement.classList.remove('pressed');
        } else {
            this.pressedFrets.add(fretKey);
            fretElement.classList.add('pressed');
            this.playNote(stringIndex, fret);
        }

        this.updateDisplay();
    }

    clearAllFrets() {
        this.pressedFrets.clear();
        document.querySelectorAll('.fret.pressed').forEach(fret => {
            fret.classList.remove('pressed');
        });
        this.updateDisplay();
    }

    showChord(chordName) {
        this.clearAllFrets();
        const chord = this.chords[chordName];
        if (chord) {
            chord.forEach(({string, fret}) => {
                this.toggleFret(string, fret);
            });
        }
    }

    playCurrentChord() {
        const notes = Array.from(this.pressedFrets).map(key => {
            const [stringIndex, fret] = key.split('-').map(Number);
            return { stringIndex, fret };
        });

        // Play all notes in the chord simultaneously
        notes.forEach(({stringIndex, fret}) => {
            setTimeout(() => this.playNote(stringIndex, fret), Math.random() * 50);
        });
    }

    updateDisplay() {
        // Update current note display
        const notes = Array.from(this.pressedFrets).map(key => {
            const [stringIndex, fret] = key.split('-').map(Number);
            return this.getNoteName(stringIndex, fret);
        });

        const currentNoteDisplay = document.getElementById('current-note-display');
        if (notes.length === 1) {
            currentNoteDisplay.textContent = notes[0];
        } else {
            currentNoteDisplay.textContent = notes.length > 0 ? 'Chord' : '-';
        }

        // Update played notes display
        const playedNotesDisplay = document.getElementById('played-notes-display');
        playedNotesDisplay.innerHTML = '';
        notes.forEach(note => {
            const chip = document.createElement('div');
            chip.className = 'note-chip';
            chip.textContent = note;
            playedNotesDisplay.appendChild(chip);
        });

        // Update chord display
        const chordDisplay = document.getElementById('chord-display');
        const detectedChord = this.detectChord(notes);
        chordDisplay.textContent = detectedChord || '-';
    }

    detectChord(notes) {
        if (notes.length < 3) return null;

        // Simple chord detection - this could be expanded
        const uniqueNotes = [...new Set(notes)].sort();

        // Check for common chords
        const chordPatterns = {
            'A': ['A', 'C#', 'E'],
            'Am': ['A', 'C', 'E'],
            'C': ['C', 'E', 'G'],
            'Cm': ['C', 'D#', 'G'],
            'D': ['D', 'F#', 'A'],
            'Dm': ['D', 'F', 'A'],
            'E': ['E', 'G#', 'B'],
            'Em': ['E', 'G', 'B'],
            'G': ['G', 'B', 'D'],
            'Gm': ['G', 'A#', 'D']
        };

        for (const [chordName, pattern] of Object.entries(chordPatterns)) {
            if (this.arraysEqual(uniqueNotes, pattern)) {
                return chordName;
            }
        }

        return null;
    }

    arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        return a.every((val, index) => val === b[index]);
    }

    updateStringNames() {
        const stringNames = document.querySelectorAll('.string-name');
        const tuning = this.tunings[this.currentTuning];

        stringNames.forEach((nameElement, index) => {
            nameElement.textContent = tuning[index];
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GuitarSimulator();
});

// Enable audio on first user interaction
document.addEventListener('click', () => {
    if (window.AudioContext && window.AudioContext.prototype.resume) {
        const audioContext = new AudioContext();
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }
}, { once: true });