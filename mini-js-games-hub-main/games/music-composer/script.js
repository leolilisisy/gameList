// Music Composer Game
// Compose simple tunes with piano keyboard and various instruments

// DOM elements
const playBtn = document.getElementById('play-btn');
const recordBtn = document.getElementById('record-btn');
const stopBtn = document.getElementById('stop-btn');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const fileInput = document.getElementById('file-input');
const loopBtn = document.getElementById('loop-btn');
const exportBtn = document.getElementById('export-btn');

const instrumentSelect = document.getElementById('instrument-select');
const tempoSlider = document.getElementById('tempo-slider');
const tempoValue = document.getElementById('tempo-value');

const octaveUpBtn = document.getElementById('octave-up');
const octaveDownBtn = document.getElementById('octave-down');
const currentOctaveEl = document.getElementById('current-octave');

const noteSequenceEl = document.getElementById('note-sequence');
const noteCountEl = document.getElementById('note-count');
const compositionDurationEl = document.getElementById('composition-duration');
const recordingStatusEl = document.getElementById('recording-status');

const presetBtns = document.querySelectorAll('.preset-btn');
const whiteKeys = document.querySelectorAll('.white-key');
const blackKeys = document.querySelectorAll('.black-key');

const messageEl = document.getElementById('message');

// Audio context and synthesizer
let audioContext = null;
let currentInstrument = 'piano';
let currentOctave = 4;
let tempo = 120; // BPM
let isRecording = false;
let isPlaying = false;
let isLooping = false;
let composition = [];
let playbackIndex = 0;
let playbackTimeout = null;

// Note frequencies (A4 = 440Hz)
const noteFrequencies = {
    'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
    'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
    'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
};

// Instrument settings
const instruments = {
    piano: {
        oscillator: 'triangle',
        attack: 0.01,
        decay: 0.1,
        sustain: 0.8,
        release: 0.3,
        filter: { frequency: 2000, Q: 1 }
    },
    guitar: {
        oscillator: 'sawtooth',
        attack: 0.02,
        decay: 0.2,
        sustain: 0.6,
        release: 0.5,
        filter: { frequency: 1500, Q: 2 }
    },
    drums: {
        oscillator: 'square',
        attack: 0.001,
        decay: 0.05,
        sustain: 0.1,
        release: 0.1,
        filter: { frequency: 800, Q: 0.5 }
    },
    flute: {
        oscillator: 'sine',
        attack: 0.1,
        decay: 0.3,
        sustain: 0.7,
        release: 0.8,
        filter: { frequency: 2500, Q: 1 }
    },
    bell: {
        oscillator: 'sine',
        attack: 0.001,
        decay: 0.5,
        sustain: 0.2,
        release: 2.0,
        filter: { frequency: 3000, Q: 3 }
    },
    organ: {
        oscillator: 'square',
        attack: 0.05,
        decay: 0.1,
        sustain: 0.9,
        release: 0.2,
        filter: { frequency: 1200, Q: 0.8 }
    }
};

// Preset songs
const presetSongs = {
    twinkle: [
        { note: 'C4', duration: 0.5 }, { note: 'C4', duration: 0.5 },
        { note: 'G4', duration: 0.5 }, { note: 'G4', duration: 0.5 },
        { note: 'A4', duration: 0.5 }, { note: 'A4', duration: 0.5 },
        { note: 'G4', duration: 1.0 },
        { note: 'F4', duration: 0.5 }, { note: 'F4', duration: 0.5 },
        { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
        { note: 'D4', duration: 0.5 }, { note: 'D4', duration: 0.5 },
        { note: 'C4', duration: 1.0 }
    ],
    'happy': [
        { note: 'C4', duration: 0.25 }, { note: 'C4', duration: 0.25 },
        { note: 'D4', duration: 0.5 }, { note: 'C4', duration: 0.5 },
        { note: 'F4', duration: 0.5 }, { note: 'E4', duration: 1.0 },
        { note: 'C4', duration: 0.25 }, { note: 'C4', duration: 0.25 },
        { note: 'D4', duration: 0.5 }, { note: 'C4', duration: 0.5 },
        { note: 'G4', duration: 0.5 }, { note: 'F4', duration: 1.0 }
    ],
    'fur-elise': [
        { note: 'E5', duration: 0.25 }, { note: 'D#5', duration: 0.25 },
        { note: 'E5', duration: 0.25 }, { note: 'D#5', duration: 0.25 },
        { note: 'E5', duration: 0.25 }, { note: 'B4', duration: 0.25 },
        { note: 'D5', duration: 0.25 }, { note: 'C5', duration: 0.25 },
        { note: 'A4', duration: 0.5 }
    ],
    'ode-joy': [
        { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
        { note: 'F4', duration: 0.5 }, { note: 'G4', duration: 0.5 },
        { note: 'G4', duration: 0.5 }, { note: 'F4', duration: 0.5 },
        { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 0.5 },
        { note: 'C4', duration: 0.5 }, { note: 'C4', duration: 0.5 },
        { note: 'D4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
        { note: 'E4', duration: 0.75 }, { note: 'D4', duration: 0.25 },
        { note: 'D4', duration: 1.0 }
    ],
    'greensleeves': [
        { note: 'A4', duration: 0.5 }, { note: 'C5', duration: 0.5 },
        { note: 'D5', duration: 0.5 }, { note: 'E5', duration: 0.5 },
        { note: 'D5', duration: 0.5 }, { note: 'C5', duration: 0.5 },
        { note: 'A4', duration: 0.5 }, { note: 'A4', duration: 0.5 },
        { note: 'B4', duration: 0.5 }, { note: 'C5', duration: 0.5 },
        { note: 'D5', duration: 0.5 }, { note: 'C5', duration: 0.5 },
        { note: 'B4', duration: 0.5 }, { note: 'A4', duration: 0.5 }
    ],
    'random': []
};

// Initialize the game
function initGame() {
    setupAudioContext();
    setupEventListeners();
    updateDisplay();
    showMessage('Welcome to Music Composer! Start by selecting an instrument and playing some notes.', 'success');
}

// Setup Web Audio API
function setupAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        showMessage('Web Audio API not supported in this browser.', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Control buttons
    playBtn.addEventListener('click', togglePlayback);
    recordBtn.addEventListener('click', toggleRecording);
    stopBtn.addEventListener('click', stopAll);
    clearBtn.addEventListener('click', clearComposition);
    saveBtn.addEventListener('click', saveComposition);
    loadBtn.addEventListener('click', () => fileInput.click());
    loopBtn.addEventListener('click', toggleLoop);
    exportBtn.addEventListener('click', exportComposition);

    // File input
    fileInput.addEventListener('change', loadComposition);

    // Instrument and tempo
    instrumentSelect.addEventListener('change', changeInstrument);
    tempoSlider.addEventListener('input', updateTempo);

    // Octave controls
    octaveUpBtn.addEventListener('click', () => changeOctave(1));
    octaveDownBtn.addEventListener('click', () => changeOctave(-1));

    // Piano keys
    whiteKeys.forEach(key => {
        key.addEventListener('mousedown', () => playNote(key.dataset.note));
        key.addEventListener('mouseup', stopNote);
        key.addEventListener('mouseout', stopNote);
    });

    blackKeys.forEach(key => {
        key.addEventListener('mousedown', () => playNote(key.dataset.note));
        key.addEventListener('mouseup', stopNote);
        key.addEventListener('mouseout', stopNote);
    });

    // Preset songs
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => loadPreset(btn.dataset.song));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

// Play a note
function playNote(noteName) {
    if (!audioContext) return;

    const fullNote = noteName + currentOctave;
    const frequency = getNoteFrequency(fullNote);

    if (frequency) {
        playTone(frequency, currentInstrument);

        // Visual feedback
        const key = document.querySelector(`[data-note="${noteName}"]`);
        if (key) {
            key.classList.add('active');
        }

        // Record if recording is active
        if (isRecording) {
            recordNote(fullNote);
        }
    }
}

// Stop note (visual feedback)
function stopNote(e) {
    const key = e.target;
    key.classList.remove('active');
}

// Get note frequency
function getNoteFrequency(note) {
    const match = note.match(/^([A-G]#?)(\d+)$/);
    if (!match) return null;

    const noteName = match[1];
    const octave = parseInt(match[2]);

    if (!(noteName in noteFrequencies)) return null;

    const baseFreq = noteFrequencies[noteName];
    const octaveOffset = octave - 4; // A4 is our reference

    return baseFreq * Math.pow(2, octaveOffset);
}

// Play tone using Web Audio API
function playTone(frequency, instrument = currentInstrument) {
    const instrumentSettings = instruments[instrument];

    // Create oscillator
    const oscillator = audioContext.createOscillator();
    oscillator.type = instrumentSettings.oscillator;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Create gain node for envelope
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    // Envelope
    const now = audioContext.currentTime;
    const attackTime = now + instrumentSettings.attack;
    const decayTime = attackTime + instrumentSettings.decay;
    const sustainTime = decayTime + 0.1; // Short sustain period
    const releaseTime = sustainTime + instrumentSettings.release;

    gainNode.gain.linearRampToValueAtTime(0.3, attackTime); // Attack
    gainNode.gain.linearRampToValueAtTime(instrumentSettings.sustain * 0.3, decayTime); // Decay
    gainNode.gain.setValueAtTime(instrumentSettings.sustain * 0.3, sustainTime); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, releaseTime); // Release

    // Create filter
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(instrumentSettings.filter.frequency, audioContext.currentTime);
    filter.Q.setValueAtTime(instrumentSettings.filter.Q, audioContext.currentTime);

    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start and stop
    oscillator.start(now);
    oscillator.stop(releaseTime);
}

// Record note
function recordNote(note) {
    const timestamp = Date.now();
    composition.push({
        note: note,
        duration: 0.5, // Default duration, can be adjusted later
        timestamp: timestamp
    });

    updateCompositionDisplay();
}

// Toggle recording
function toggleRecording() {
    if (isPlaying) {
        stopPlayback();
    }

    isRecording = !isRecording;

    if (isRecording) {
        composition = [];
        recordBtn.classList.add('active');
        recordingStatusEl.textContent = 'Recording...';
        showMessage('Recording started! Play some notes.', 'info');
    } else {
        recordBtn.classList.remove('active');
        recordingStatusEl.textContent = 'Ready';
        showMessage(`Recording complete! ${composition.length} notes recorded.`, 'success');
    }

    updateDisplay();
}

// Toggle playback
function togglePlayback() {
    if (isRecording) {
        toggleRecording();
    }

    if (isPlaying) {
        stopPlayback();
    } else {
        startPlayback();
    }
}

// Start playback
function startPlayback() {
    if (composition.length === 0) {
        showMessage('No composition to play! Record some notes first.', 'warning');
        return;
    }

    isPlaying = true;
    playbackIndex = 0;
    playBtn.classList.add('active');
    playBtn.querySelector('.btn-text').textContent = 'Stop';

    playNextNote();
    showMessage('Playback started!', 'success');
}

// Play next note in sequence
function playNextNote() {
    if (!isPlaying || playbackIndex >= composition.length) {
        if (isLooping) {
            playbackIndex = 0;
            playNextNote();
        } else {
            stopPlayback();
        }
        return;
    }

    const note = composition[playbackIndex];
    const frequency = getNoteFrequency(note.note);

    if (frequency) {
        playTone(frequency, currentInstrument);
        highlightNote(playbackIndex);
    }

    // Calculate delay to next note based on tempo
    const noteDuration = (60 / tempo) * note.duration * 1000; // Convert to milliseconds
    playbackTimeout = setTimeout(() => {
        playbackIndex++;
        playNextNote();
    }, noteDuration);
}

// Stop playback
function stopPlayback() {
    isPlaying = false;
    playBtn.classList.remove('active');
    playBtn.querySelector('.btn-text').textContent = 'Play';

    if (playbackTimeout) {
        clearTimeout(playbackTimeout);
        playbackTimeout = null;
    }

    clearNoteHighlights();
    showMessage('Playback stopped.', 'info');
}

// Stop all activities
function stopAll() {
    if (isRecording) toggleRecording();
    if (isPlaying) stopPlayback();
}

// Clear composition
function clearComposition() {
    if (composition.length === 0) return;

    if (confirm('Are you sure you want to clear the composition?')) {
        composition = [];
        updateCompositionDisplay();
        updateDisplay();
        showMessage('Composition cleared.', 'info');
    }
}

// Toggle loop
function toggleLoop() {
    isLooping = !isLooping;
    loopBtn.classList.toggle('active');
    showMessage(isLooping ? 'Loop enabled!' : 'Loop disabled.', 'info');
}

// Change instrument
function changeInstrument() {
    currentInstrument = instrumentSelect.value;
    showMessage(`Instrument changed to ${currentInstrument}!`, 'info');
}

// Update tempo
function updateTempo() {
    tempo = parseInt(tempoSlider.value);
    tempoValue.textContent = tempo + ' BPM';
}

// Change octave
function changeOctave(delta) {
    currentOctave = Math.max(1, Math.min(7, currentOctave + delta));
    currentOctaveEl.textContent = `Octave ${currentOctave}`;
}

// Load preset song
function loadPreset(songName) {
    if (songName === 'random') {
        generateRandomComposition();
    } else {
        composition = [...presetSongs[songName]];
    }

    updateCompositionDisplay();
    updateDisplay();
    showMessage(`Loaded preset: ${songName.replace('-', ' ').toUpperCase()}`, 'success');
}

// Generate random composition
function generateRandomComposition() {
    composition = [];
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const durations = [0.25, 0.5, 0.75, 1.0];

    for (let i = 0; i < 16; i++) {
        const note = notes[Math.floor(Math.random() * notes.length)] + currentOctave;
        const duration = durations[Math.floor(Math.random() * durations.length)];

        composition.push({
            note: note,
            duration: duration
        });
    }
}

// Save composition
function saveComposition() {
    if (composition.length === 0) {
        showMessage('No composition to save!', 'warning');
        return;
    }

    const data = {
        composition: composition,
        instrument: currentInstrument,
        tempo: tempo,
        timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `music-composer-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showMessage('Composition saved!', 'success');
}

// Load composition
function loadComposition(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            composition = data.composition || [];
            currentInstrument = data.instrument || 'piano';
            tempo = data.tempo || 120;

            instrumentSelect.value = currentInstrument;
            tempoSlider.value = tempo;
            updateTempo();

            updateCompositionDisplay();
            updateDisplay();
            showMessage('Composition loaded!', 'success');
        } catch (error) {
            showMessage('Error loading composition file.', 'error');
        }
    };
    reader.readAsText(file);
}

// Export as MIDI (simplified)
function exportComposition() {
    if (composition.length === 0) {
        showMessage('No composition to export!', 'warning');
        return;
    }

    // This is a simplified MIDI export - in a real implementation,
    // you'd use a proper MIDI library
    showMessage('MIDI export feature coming soon!', 'info');
}

// Update composition display
function updateCompositionDisplay() {
    if (composition.length === 0) {
        noteSequenceEl.innerHTML = '<div class="empty-composition"><span>🎵 Click "Record" and play some notes to start composing!</span></div>';
        return;
    }

    let html = '<div class="note-display">';
    composition.forEach((note, index) => {
        const noteName = note.note.replace(/\d+/, '');
        const octave = note.note.replace(/[A-G]#?/, '');
        html += `<div class="note-item" data-index="${index}">
            <span class="note-name">${noteName}<sub>${octave}</sub></span>
            <span class="note-duration">${note.duration}s</span>
        </div>`;
    });
    html += '</div>';

    noteSequenceEl.innerHTML = html;
}

// Highlight note during playback
function highlightNote(index) {
    clearNoteHighlights();
    const noteElement = noteSequenceEl.querySelector(`[data-index="${index}"]`);
    if (noteElement) {
        noteElement.classList.add('playing');
    }
}

// Clear note highlights
function clearNoteHighlights() {
    noteSequenceEl.querySelectorAll('.note-item').forEach(item => {
        item.classList.remove('playing');
    });
}

// Update display elements
function updateDisplay() {
    noteCountEl.textContent = composition.length;

    const totalDuration = composition.reduce((sum, note) => sum + note.duration, 0);
    const durationInSeconds = Math.round(totalDuration * (60 / tempo));
    compositionDurationEl.textContent = `${durationInSeconds}s`;
}

// Keyboard shortcuts
function handleKeyDown(e) {
    // Piano key mappings (QWERTY layout)
    const keyMap = {
        'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E',
        'f': 'F', 't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A',
        'u': 'A#', 'j': 'B'
    };

    if (keyMap[e.key.toLowerCase()]) {
        e.preventDefault();
        playNote(keyMap[e.key.toLowerCase()]);
    }

    // Control shortcuts
    switch (e.key.toLowerCase()) {
        case ' ':
            e.preventDefault();
            togglePlayback();
            break;
        case 'r':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                toggleRecording();
            }
            break;
        case 'c':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                clearComposition();
            }
            break;
    }
}

function handleKeyUp(e) {
    const keyMap = {
        'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E',
        'f': 'F', 't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A',
        'u': 'A#', 'j': 'B'
    };

    if (keyMap[e.key.toLowerCase()]) {
        const key = document.querySelector(`[data-note="${keyMap[e.key.toLowerCase()]}"]`);
        if (key) {
            key.classList.remove('active');
        }
    }
}

// Show message
function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type} show`;

    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

// Initialize the game
initGame();

// This music composer game includes piano keyboard simulation,
// multiple instruments, recording/playback, tempo control,
// save/load functionality, and preset songs