// Harmonic Havoc Game Script
// Create musical chaos by arranging notes and rhythms in this rhythm-based puzzle.

const staff = document.getElementById('staff');
const playButton = document.getElementById('play-button');
const scoreElement = document.getElementById('score');

// Game variables
let draggedNote = null;
let staffNotes = [];
let score = 0;

// Note frequencies
const noteFreqs = {
    C: 261.63,
    D: 293.66,
    E: 329.63,
    F: 349.23,
    G: 392.00,
    A: 440.00,
    B: 493.88
};

// Initialize staff lines
function initStaff() {
    for (let i = 0; i < 5; i++) {
        const line = document.createElement('div');
        line.className = 'line';
        staff.appendChild(line);
    }
}

// Drag and drop
document.addEventListener('dragstart', e => {
    if (e.target.classList.contains('note')) {
        draggedNote = e.target;
        e.target.classList.add('dragging');
    }
});

document.addEventListener('dragend', e => {
    if (draggedNote) {
        draggedNote.classList.remove('dragging');
        draggedNote = null;
    }
});

staff.addEventListener('dragover', e => {
    e.preventDefault();
});

staff.addEventListener('drop', e => {
    e.preventDefault();
    if (draggedNote) {
        const rect = staff.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create note on staff
        const note = document.createElement('div');
        note.className = 'note';
        note.textContent = draggedNote.dataset.note;
        note.dataset.note = draggedNote.dataset.note;
        note.style.position = 'absolute';
        note.style.left = x - 20 + 'px';
        note.style.top = y - 20 + 'px';
        note.draggable = true;
        staff.appendChild(note);

        // Add to staffNotes
        staffNotes.push({ note: draggedNote.dataset.note, x: x, y: y });
    }
});

// Play melody
playButton.addEventListener('click', () => {
    if (staffNotes.length === 0) return;

    // Sort by x position
    staffNotes.sort((a, b) => a.x - b.x);

    // Play notes
    let delay = 0;
    staffNotes.forEach(noteObj => {
        setTimeout(() => playNote(noteObj.note), delay);
        delay += 500;
    });

    // Calculate score
    setTimeout(() => {
        score = calculateHarmony(staffNotes);
        scoreElement.textContent = 'Harmony Score: ' + score;
    }, delay + 500);
});

// Play note
function playNote(note) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(noteFreqs[note], audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Calculate harmony score
function calculateHarmony(notes) {
    if (notes.length < 2) return 0;

    let harmony = 0;
    for (let i = 0; i < notes.length - 1; i++) {
        const interval = Math.abs(noteFreqs[notes[i].note] - noteFreqs[notes[i+1].note]);
        if (interval < 50) harmony += 10; // Close notes
        else if (interval < 100) harmony += 5; // Medium
        else harmony -= 5; // Dissonant
    }
    return Math.max(0, harmony);
}

// Initialize
initStaff();