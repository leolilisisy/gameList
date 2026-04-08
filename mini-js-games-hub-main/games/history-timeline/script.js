// History Timeline Game
// Arrange historical events in the correct chronological order

// DOM elements
const scoreEl = document.getElementById('current-score');
const eventCountEl = document.getElementById('current-event');
const totalEventsEl = document.getElementById('total-events');
const streakEl = document.getElementById('current-streak');
const timeLeftEl = document.getElementById('time-left');
const timelineEl = document.getElementById('timeline');
const eventsContainerEl = document.getElementById('events-container');
const hintBtn = document.getElementById('hint-btn');
const checkBtn = document.getElementById('check-btn');
const clearBtn = document.getElementById('clear-btn');
const startBtn = document.getElementById('start-btn');
const quitBtn = document.getElementById('quit-btn');
const messageEl = document.getElementById('message');
const resultsEl = document.getElementById('results');
const finalScoreEl = document.getElementById('final-score');
const eventsCorrectEl = document.getElementById('events-correct');
const eventsTotalEl = document.getElementById('events-total');
const accuracyEl = document.getElementById('accuracy');
const timeBonusEl = document.getElementById('time-bonus');
const gradeEl = document.getElementById('grade');
const playAgainBtn = document.getElementById('play-again-btn');

// Game variables
let currentEventIndex = 0;
let score = 0;
let streak = 0;
let timeLeft = 120;
let timerInterval = null;
let gameActive = false;
let events = [];
let timelineSlots = [];
let draggedEvent = null;
let hintUsed = false;
let eventsCorrect = 0;

// Historical events database
const historicalEvents = [
    {
        year: 1066,
        title: "Battle of Hastings",
        description: "William the Conqueror defeats Harold Godwinson, leading to the Norman Conquest of England."
    },
    {
        year: 1215,
        title: "Magna Carta Signed",
        description: "King John of England signs the Magna Carta, limiting royal power and establishing principles of liberty."
    },
    {
        year: 1492,
        title: "Columbus Reaches America",
        description: "Christopher Columbus arrives in the Americas, opening the New World to European exploration."
    },
    {
        year: 1776,
        title: "American Declaration of Independence",
        description: "The United States declares independence from Great Britain."
    },
    {
        year: 1789,
        title: "French Revolution Begins",
        description: "Storming of the Bastille marks the start of the French Revolution."
    },
    {
        year: 1914,
        title: "World War I Begins",
        description: "Assassination of Archduke Franz Ferdinand triggers the start of World War I."
    },
    {
        year: 1945,
        title: "World War II Ends",
        description: "Japan surrenders, ending World War II and leading to the atomic age."
    },
    {
        year: 1969,
        title: "Moon Landing",
        description: "Apollo 11 astronauts Neil Armstrong and Buzz Aldrin become the first humans to walk on the Moon."
    },
    {
        year: 1989,
        title: "Berlin Wall Falls",
        description: "The Berlin Wall is dismantled, symbolizing the end of the Cold War."
    },
    {
        year: 2001,
        title: "September 11 Attacks",
        description: "Terrorist attacks on the World Trade Center and Pentagon change global security policies."
    },
    {
        year: 2011,
        title: "Arab Spring Begins",
        description: "Popular uprisings across the Middle East and North Africa challenge authoritarian regimes."
    },
    {
        year: 2020,
        title: "COVID-19 Pandemic",
        description: "Global pandemic caused by SARS-CoV-2 affects billions and changes daily life worldwide."
    }
];

// Initialize game
function initGame() {
    shuffleEvents();
    setupEventListeners();
    createTimeline();
    createEventCards();
    updateDisplay();
}

// Shuffle events for random order
function shuffleEvents() {
    events = [...historicalEvents];
    for (let i = events.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [events[i], events[j]] = [events[j], events[i]];
    }
    // Take first 8 events
    events = events.slice(0, 8);
    totalEventsEl.textContent = events.length;
}

// Create timeline slots
function createTimeline() {
    timelineEl.innerHTML = '';
    timelineSlots = [];

    for (let i = 0; i < events.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'timeline-slot';
        slot.dataset.index = i;

        const slotNumber = document.createElement('div');
        slotNumber.className = 'slot-number';
        slotNumber.textContent = i + 1;

        slot.appendChild(slotNumber);
        slot.addEventListener('click', () => selectSlot(i));
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', (e) => handleDrop(e, i));

        timelineEl.appendChild(slot);
        timelineSlots.push(slot);
    }
}

// Create event cards
function createEventCards() {
    eventsContainerEl.innerHTML = '';

    events.forEach((event, index) => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.dataset.index = index;
        card.draggable = true;

        card.innerHTML = `
            <div class="event-year">${event.year}</div>
            <div class="event-title">${event.title}</div>
            <div class="event-description">${event.description}</div>
        `;

        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('click', () => selectEvent(index));

        eventsContainerEl.appendChild(card);
    });
}

// Setup event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    quitBtn.addEventListener('click', endGame);
    playAgainBtn.addEventListener('click', resetGame);

    hintBtn.addEventListener('click', useHint);
    checkBtn.addEventListener('click', checkTimeline);
    clearBtn.addEventListener('click', clearTimeline);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!gameActive) return;

        if (e.key === 'Enter') {
            checkTimeline();
        } else if (e.key === 'Escape') {
            clearTimeline();
        }
    });
}

// Start the game
function startGame() {
    gameActive = true;
    currentEventIndex = 0;
    score = 0;
    streak = 0;
    timeLeft = 120;
    eventsCorrect = 0;
    hintUsed = false;

    startBtn.style.display = 'none';
    quitBtn.style.display = 'inline-block';

    hintBtn.disabled = false;
    checkBtn.disabled = false;
    clearBtn.disabled = false;

    resultsEl.style.display = 'none';
    messageEl.textContent = '';

    startTimer();
    updateDisplay();
}

// Start game timer
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeUp();
        }
    }, 1000);
}

// Handle time up
function timeUp() {
    showMessage('Time\'s up! Checking your timeline...', 'incorrect');
    setTimeout(checkTimeline, 2000);
}

// Drag and drop handlers
function handleDragStart(e) {
    draggedEvent = e.target;
    e.target.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e, slotIndex) {
    e.preventDefault();

    if (!draggedEvent) return;

    const eventIndex = parseInt(draggedEvent.dataset.index);
    placeEventInSlot(eventIndex, slotIndex);

    draggedEvent.classList.remove('dragging');
    draggedEvent = null;
}

// Select event (click alternative to drag)
function selectEvent(eventIndex) {
    if (!gameActive) return;

    // If an event is already selected, try to place it
    if (draggedEvent) {
        const slotIndex = timelineSlots.findIndex(slot => slot.classList.contains('selected'));
        if (slotIndex !== -1) {
            placeEventInSlot(parseInt(draggedEvent.dataset.index), slotIndex);
        }
        draggedEvent.classList.remove('selected');
        draggedEvent = null;
        clearSlotSelection();
    } else {
        // Select this event
        draggedEvent = document.querySelector(`[data-index="${eventIndex}"]`);
        draggedEvent.classList.add('selected');
        showMessage('Click on a timeline slot to place this event.', 'hint');
    }
}

// Select timeline slot
function selectSlot(slotIndex) {
    if (!gameActive) return;

    clearSlotSelection();
    timelineSlots[slotIndex].classList.add('selected');

    if (draggedEvent) {
        placeEventInSlot(parseInt(draggedEvent.dataset.index), slotIndex);
        draggedEvent.classList.remove('selected');
        draggedEvent = null;
        clearSlotSelection();
    } else {
        showMessage('Now select an event to place here.', 'hint');
    }
}

// Place event in timeline slot
function placeEventInSlot(eventIndex, slotIndex) {
    const event = events[eventIndex];
    const slot = timelineSlots[slotIndex];

    // Check if slot is already filled
    if (slot.classList.contains('filled')) {
        showMessage('This slot is already filled! Clear it first.', 'incorrect');
        return;
    }

    // Create event content for slot
    const eventContent = document.createElement('div');
    eventContent.className = 'slot-event';
    eventContent.innerHTML = `
        <div class="event-year">${event.year}</div>
        <div class="event-title">${event.title}</div>
    `;

    slot.appendChild(eventContent);
    slot.classList.add('filled');
    slot.dataset.eventIndex = eventIndex;

    // Mark event card as placed
    const eventCard = document.querySelector(`.event-card[data-index="${eventIndex}"]`);
    eventCard.classList.add('placed');

    showMessage(`Placed "${event.title}" in position ${slotIndex + 1}.`, 'correct');
    updateDisplay();
}

// Clear timeline
function clearTimeline() {
    timelineSlots.forEach(slot => {
        slot.classList.remove('filled', 'correct', 'incorrect', 'selected');
        slot.dataset.eventIndex = '';
        const eventContent = slot.querySelector('.slot-event');
        if (eventContent) {
            eventContent.remove();
        }
    });

    document.querySelectorAll('.event-card').forEach(card => {
        card.classList.remove('placed', 'selected');
    });

    draggedEvent = null;
    showMessage('Timeline cleared. Start arranging events again.', 'hint');
}

// Use hint
function useHint() {
    if (!gameActive || hintUsed || score < 20) return;

    if (score < 20) {
        showMessage('Not enough points for hint! (20 points required)', 'incorrect');
        return;
    }

    score -= 20;
    hintUsed = true;

    // Show the earliest event
    const earliestEvent = events.reduce((earliest, event, index) => {
        return event.year < earliest.event.year ? { event, index } : earliest;
    }, { event: events[0], index: 0 });

    // Highlight the earliest event
    const eventCard = document.querySelector(`.event-card[data-index="${earliestEvent.index}"]`);
    eventCard.style.border = '3px solid #f39c12';
    eventCard.style.boxShadow = '0 0 20px rgba(243, 156, 18, 0.5)';

    showMessage(`Hint: "${earliestEvent.event.title}" is the earliest event. -20 points`, 'hint');

    setTimeout(() => {
        eventCard.style.border = '';
        eventCard.style.boxShadow = '';
    }, 3000);

    updateDisplay();
}

// Check timeline order
function checkTimeline() {
    if (!gameActive) return;

    clearInterval(timerInterval);

    let allSlotsFilled = true;
    let correctOrder = true;
    eventsCorrect = 0;

    // Check if all slots are filled
    timelineSlots.forEach(slot => {
        if (!slot.classList.contains('filled')) {
            allSlotsFilled = false;
        }
    });

    if (!allSlotsFilled) {
        showMessage('Please fill all timeline slots before checking!', 'incorrect');
        startTimer();
        return;
    }

    // Sort events by year for correct order
    const sortedEvents = [...events].sort((a, b) => a.year - b.year);

    // Check each slot
    timelineSlots.forEach((slot, index) => {
        const eventIndex = parseInt(slot.dataset.eventIndex);
        const placedEvent = events[eventIndex];
        const correctEvent = sortedEvents[index];

        if (placedEvent.year === correctEvent.year) {
            slot.classList.add('correct');
            eventsCorrect++;
        } else {
            slot.classList.add('incorrect');
            correctOrder = false;
        }
    });

    // Calculate score
    if (correctOrder) {
        let points = 50; // Base points for correct order

        // Time bonus
        if (timeLeft >= 60) points += 30;
        else if (timeLeft >= 30) points += 15;

        // Hint penalty
        if (hintUsed) points = Math.floor(points * 0.8);

        score += points;
        streak++;
        showMessage(`Perfect! All events in correct order! +${points} points`, 'correct');
    } else {
        streak = 0;
        const accuracy = Math.round((eventsCorrect / events.length) * 100);
        showMessage(`Some events are out of order. ${eventsCorrect}/${events.length} correct (${accuracy}%).`, 'incorrect');
    }

    setTimeout(endGame, 3000);
}

// Show message
function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

// Clear slot selection
function clearSlotSelection() {
    timelineSlots.forEach(slot => slot.classList.remove('selected'));
}

// End game
function endGame() {
    gameActive = false;
    clearInterval(timerInterval);

    // Show results
    showResults();
}

// Show final results
function showResults() {
    const accuracy = events.length > 0 ? Math.round((eventsCorrect / events.length) * 100) : 0;
    const timeBonus = Math.max(0, Math.floor(timeLeft / 10));

    finalScoreEl.textContent = score.toLocaleString();
    eventsCorrectEl.textContent = eventsCorrect;
    eventsTotalEl.textContent = events.length;
    accuracyEl.textContent = accuracy + '%';
    timeBonusEl.textContent = timeBonus;

    // Calculate grade
    let grade = 'F';
    if (accuracy >= 90) grade = 'A';
    else if (accuracy >= 80) grade = 'B';
    else if (accuracy >= 70) grade = 'C';
    else if (accuracy >= 60) grade = 'D';

    gradeEl.textContent = grade;
    gradeEl.className = `final-value grade ${grade}`;

    resultsEl.style.display = 'block';
    startBtn.style.display = 'none';
    quitBtn.style.display = 'none';

    hintBtn.disabled = true;
    checkBtn.disabled = true;
    clearBtn.disabled = true;
}

// Reset game
function resetGame() {
    resultsEl.style.display = 'none';
    startBtn.style.display = 'inline-block';
    quitBtn.style.display = 'none';

    hintBtn.disabled = true;
    checkBtn.disabled = true;
    clearBtn.disabled = true;

    shuffleEvents();
    createTimeline();
    createEventCards();
    updateDisplay();
    messageEl.textContent = 'Ready for another historical timeline?';
}

// Update display elements
function updateDisplay() {
    scoreEl.textContent = score.toLocaleString();
    eventCountEl.textContent = currentEventIndex + 1;
    streakEl.textContent = streak;
    timeLeftEl.textContent = timeLeft;
}

// Initialize the game
initGame();

// This history timeline game includes drag-and-drop functionality,
// chronological ordering, scoring, hints, and educational content
// Players learn about historical events while arranging them correctly