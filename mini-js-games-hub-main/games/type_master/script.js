// --- 1. Game Data & State ---
const testParagraphs = [
    "The quick brown fox jumps over the lazy dog.",
    "Jinxed wizards pluck ivy from the big quilt.",
    "Waltz, bad nymph, for quick jigs vex him.",
    "Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump!"
];

let startTime;
let timerInterval;
let timerRunning = false;
let currentParagraph = "";
let totalCharacters = 0;
let correctCharacters = 0;

// --- 2. DOM Element References ---
const textDisplay = document.getElementById('text-display');
const textInput = document.getElementById('text-input');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const resultsFeedback = document.getElementById('results-feedback');

// --- 3. Utility Functions ---

// Loads a random paragraph and prepares the display area
function loadNewTest() {
    // 1. Reset State
    clearInterval(timerInterval);
    timerRunning = false;
    currentParagraph = testParagraphs[Math.floor(Math.random() * testParagraphs.length)];
    totalCharacters = currentParagraph.length;
    correctCharacters = 0;
    
    // 2. Reset UI
    timerDisplay.textContent = '0:00';
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100%';
    textInput.value = '';
    textInput.disabled = true;
    startButton.textContent = 'Start Test';
    startButton.disabled = false;
    resetButton.classList.add('hidden');
    resultsFeedback.classList.add('hidden');
    
    // 3. Prepare Display Text
    textDisplay.innerHTML = `<p>${currentParagraph.split('').map(char => `<span>${char}</span>`).join('')}</p>`;
}

// Starts the timer
function startTimer() {
    if (timerRunning) return;
    
    startTime = new Date().getTime();
    timerRunning = true;

    timerInterval = setInterval(() => {
        const elapsedTime = (new Date().getTime() - startTime) / 1000;
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = Math.floor(elapsedTime % 60);
        
        // Format time as M:SS
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        // Update WPM in real-time
        updateWPM(elapsedTime);
        
    }, 1000);
}

// Stops the timer and ends the test
function endTest() {
    clearInterval(timerInterval);
    timerRunning = false;
    textInput.disabled = true;
    startButton.classList.add('hidden');
    
    // Calculate final results
    const finalTimeSeconds = (new Date().getTime() - startTime) / 1000;
    const finalWPM = calculateWPM(finalTimeSeconds);
    const finalAccuracy = calculateAccuracy();

    // Display final results
    resultsFeedback.querySelector('.final-wpm-display span').textContent = finalWPM;
    resultsFeedback.querySelector('.final-accuracy-display span').textContent = finalAccuracy;
    resultsFeedback.classList.remove('hidden');
}

// --- 4. Calculation Functions ---

function calculateWPM(timeInSeconds) {
    // Formula: (Total Characters / 5) / (Time in Minutes)
    // 5 characters is the standard definition of a "Word"
    const totalWords = correctCharacters / 5;
    const timeInMinutes = timeInSeconds / 60;
    
    if (timeInMinutes === 0) return 0;
    
    return Math.round(totalWords / timeInMinutes);
}

function calculateAccuracy() {
    if (totalCharacters === 0) return '100%';
    const accuracy = (correctCharacters / totalCharacters) * 100;
    return `${Math.max(0, accuracy).toFixed(1)}%`;
}

function updateWPM(elapsedTime) {
    const wpm = calculateWPM(elapsedTime);
    wpmDisplay.textContent = wpm;
}

// --- 5. Event Handlers ---

function handleInput() {
    const typedText = textInput.value;
    const targetChars = textDisplay.querySelectorAll('span');
    correctCharacters = 0;
    let testFinished = true;

    // Iterate through the typed characters and compare them to the target
    for (let i = 0; i < totalCharacters; i++) {
        const targetChar = currentParagraph[i];
        const typedChar = typedText[i];
        const charElement = targetChars[i];

        if (typedChar == null) {
            // Character not yet typed (game continues)
            charElement.className = '';
            testFinished = false;
        } else if (typedChar === targetChar) {
            // Correct character
            charElement.className = 'correct';
            correctCharacters++;
        } else {
            // Incorrect character
            charElement.className = 'incorrect';
            testFinished = false;
        }
    }
    
    // Update accuracy display in real-time
    accuracyDisplay.textContent = calculateAccuracy();

    // Check for test completion
    if (typedText.length >= totalCharacters && testFinished) {
        endTest();
    }
}

// --- 6. Event Listeners and Initialization ---

startButton.addEventListener('click', () => {
    // 1. Enable input and focus
    textInput.disabled = false;
    textInput.focus();
    
    // 2. Start the timer logic
    startTimer();
    
    // 3. Update buttons
    startButton.disabled = true;
    startButton.textContent = 'Typing...';
    resetButton.classList.remove('hidden');
});

textInput.addEventListener('input', handleInput);

resetButton.addEventListener('click', loadNewTest);

// Initialize the game on load
loadNewTest();