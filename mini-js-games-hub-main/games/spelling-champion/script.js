// Spelling Champion Game
// Test your spelling skills with words of varying difficulty

// DOM elements
const scoreEl = document.getElementById('current-score');
const wordCountEl = document.getElementById('current-word');
const totalWordsEl = document.getElementById('total-words');
const streakEl = document.getElementById('current-streak');
const timeLeftEl = document.getElementById('time-left');
const wordCategoryEl = document.getElementById('word-category');
const wordTextEl = document.getElementById('word-text');
const wordHintEl = document.getElementById('word-hint');
const spellingInput = document.getElementById('spelling-input');
const checkBtn = document.getElementById('check-btn');
const hintBtn = document.getElementById('hint-btn');
const skipBtn = document.getElementById('skip-btn');
const startBtn = document.getElementById('start-btn');
const quitBtn = document.getElementById('quit-btn');
const messageEl = document.getElementById('message');
const resultsEl = document.getElementById('results');
const finalScoreEl = document.getElementById('final-score');
const wordsCorrectEl = document.getElementById('words-correct');
const wordsTotalEl = document.getElementById('words-total');
const accuracyEl = document.getElementById('accuracy');
const bestStreakEl = document.getElementById('best-streak');
const gradeEl = document.getElementById('grade');
const playAgainBtn = document.getElementById('play-again-btn');

// Game variables
let currentWordIndex = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let timeLeft = 60;
let timerInterval = null;
let gameActive = false;
let words = [];
let currentWord = null;
let hintUsed = false;
let wordsCorrect = 0;

// Spelling words database
const spellingWords = [
    // Easy words
    { word: "cat", category: "Animals", difficulty: "easy", hint: "A common pet that says meow" },
    { word: "dog", category: "Animals", difficulty: "easy", hint: "A loyal pet that barks" },
    { word: "sun", category: "Nature", difficulty: "easy", hint: "It shines during the day" },
    { word: "moon", category: "Nature", difficulty: "easy", hint: "It shines at night" },
    { word: "book", category: "Objects", difficulty: "easy", hint: "You read this" },
    { word: "tree", category: "Nature", difficulty: "easy", hint: "It has leaves and branches" },
    { word: "house", category: "Buildings", difficulty: "easy", hint: "Where people live" },
    { word: "water", category: "Nature", difficulty: "easy", hint: "You drink this" },
    { word: "apple", category: "Food", difficulty: "easy", hint: "A red or green fruit" },
    { word: "school", category: "Places", difficulty: "easy", hint: "Where children learn" },

    // Medium words
    { word: "elephant", category: "Animals", difficulty: "medium", hint: "A large animal with a trunk" },
    { word: "computer", category: "Technology", difficulty: "medium", hint: "You use this to browse the internet" },
    { word: "beautiful", category: "Adjectives", difficulty: "medium", hint: "Something very pretty" },
    { word: "restaurant", category: "Places", difficulty: "medium", hint: "Where you eat food" },
    { word: "chocolate", category: "Food", difficulty: "medium", hint: "A sweet treat" },
    { word: "mountain", category: "Nature", difficulty: "medium", hint: "A very tall hill" },
    { word: "library", category: "Places", difficulty: "medium", hint: "A place with many books" },
    { word: "telephone", category: "Technology", difficulty: "medium", hint: "You use this to call people" },
    { word: "adventure", category: "Nouns", difficulty: "medium", hint: "An exciting experience" },
    { word: "happiness", category: "Emotions", difficulty: "medium", hint: "Feeling very joyful" },

    // Hard words
    { word: "chrysanthemum", category: "Plants", difficulty: "hard", hint: "A type of flower" },
    { word: "entrepreneurship", category: "Business", difficulty: "hard", hint: "Starting and running a business" },
    { word: "incomprehensible", category: "Adjectives", difficulty: "hard", hint: "Very difficult to understand" },
    { word: "responsibility", category: "Nouns", difficulty: "hard", hint: "Being accountable for something" },
    { word: "unbelievable", category: "Adjectives", difficulty: "hard", hint: "Extremely surprising" },
    { word: "pronunciation", category: "Language", difficulty: "hard", hint: "How to say a word correctly" },
    { word: "extraordinary", category: "Adjectives", difficulty: "hard", hint: "Very unusual or remarkable" },
    { word: "consciousness", category: "Psychology", difficulty: "hard", hint: "Being aware of your surroundings" },
    { word: "infrastructure", category: "Engineering", difficulty: "hard", hint: "Basic facilities and systems" },
    { word: "bureaucracy", category: "Government", difficulty: "hard", hint: "Complex administrative system" }
];

// Initialize game
function initGame() {
    shuffleWords();
    setupEventListeners();
    updateDisplay();
}

// Shuffle words for random order
function shuffleWords() {
    words = [...spellingWords];
    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
    }
    // Take first 15 words
    words = words.slice(0, 15);
    totalWordsEl.textContent = words.length;
}

// Setup event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    checkBtn.addEventListener('click', checkSpelling);
    hintBtn.addEventListener('click', useHint);
    skipBtn.addEventListener('click', skipWord);
    quitBtn.addEventListener('click', endGame);
    playAgainBtn.addEventListener('click', resetGame);

    spellingInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkSpelling();
        }
    });

    spellingInput.addEventListener('input', () => {
        if (gameActive) {
            messageEl.textContent = '';
            messageEl.className = 'message';
        }
    });
}

// Start the game
function startGame() {
    gameActive = true;
    currentWordIndex = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    wordsCorrect = 0;
    timeLeft = 60;

    startBtn.style.display = 'none';
    quitBtn.style.display = 'inline-block';
    checkBtn.disabled = false;
    hintBtn.disabled = false;
    skipBtn.disabled = false;

    resultsEl.style.display = 'none';
    messageEl.textContent = '';
    spellingInput.value = '';
    spellingInput.focus();

    loadWord();
}

// Load current word
function loadWord() {
    if (currentWordIndex >= words.length) {
        endGame();
        return;
    }

    currentWord = words[currentWordIndex];
    hintUsed = false;

    // Update UI
    wordCategoryEl.textContent = currentWord.category;
    wordTextEl.textContent = currentWord.word;
    wordHintEl.textContent = '';

    // Clear input and focus
    spellingInput.value = '';
    spellingInput.focus();

    updateDisplay();
}

// Check spelling
function checkSpelling() {
    if (!gameActive) return;

    const userSpelling = spellingInput.value.trim().toLowerCase();
    const correctSpelling = currentWord.word.toLowerCase();

    if (userSpelling === '') {
        showMessage('Please type a spelling first!', 'incorrect');
        return;
    }

    if (userSpelling === correctSpelling) {
        correctAnswer();
    } else {
        incorrectAnswer();
    }
}

// Handle correct answer
function correctAnswer() {
    wordsCorrect++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;

    // Calculate points based on difficulty and time
    let points = 10; // Base points

    // Difficulty bonus
    if (currentWord.difficulty === 'hard') points *= 3;
    else if (currentWord.difficulty === 'medium') points *= 2;

    // Streak bonus
    if (streak >= 3) points += streak * 5;

    // Hint penalty
    if (hintUsed) points = Math.floor(points * 0.7);

    score += points;

    showMessage(`Correct! +${points} points (Streak: ${streak})`, 'correct');
    wordTextEl.classList.add('correct-animation');

    setTimeout(() => {
        wordTextEl.classList.remove('correct-animation');
        nextWord();
    }, 1500);
}

// Handle incorrect answer
function incorrectAnswer() {
    streak = 0;
    showMessage(`Incorrect! The correct spelling is: ${currentWord.word}`, 'incorrect');
    wordTextEl.classList.add('incorrect-animation');

    setTimeout(() => {
        wordTextEl.classList.remove('incorrect-animation');
        nextWord();
    }, 2500);
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
    wordHintEl.textContent = currentWord.hint;
    showMessage('Hint used! -20 points', 'hint');
    updateDisplay();
}

// Skip word
function skipWord() {
    if (!gameActive || score < 10) return;

    if (score < 10) {
        showMessage('Not enough points to skip! (10 points required)', 'incorrect');
        return;
    }

    score -= 10;
    streak = 0;
    showMessage('Word skipped! -10 points', 'hint');
    updateDisplay();

    setTimeout(nextWord, 1500);
}

// Next word
function nextWord() {
    currentWordIndex++;
    loadWord();
}

// Show message
function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
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
    const accuracy = words.length > 0 ? Math.round((wordsCorrect / words.length) * 100) : 0;

    finalScoreEl.textContent = score.toLocaleString();
    wordsCorrectEl.textContent = wordsCorrect;
    wordsTotalEl.textContent = words.length;
    accuracyEl.textContent = accuracy + '%';
    bestStreakEl.textContent = bestStreak;

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
    checkBtn.disabled = true;
    hintBtn.disabled = true;
    skipBtn.disabled = true;
}

// Reset game
function resetGame() {
    resultsEl.style.display = 'none';
    startBtn.style.display = 'inline-block';
    quitBtn.style.display = 'none';
    checkBtn.disabled = true;
    hintBtn.disabled = true;
    skipBtn.disabled = true;

    shuffleWords();
    updateDisplay();
    messageEl.textContent = 'Ready for another spelling challenge?';
}

// Update display elements
function updateDisplay() {
    scoreEl.textContent = score.toLocaleString();
    wordCountEl.textContent = currentWordIndex + 1;
    streakEl.textContent = streak;
    timeLeftEl.textContent = timeLeft;
}

// Start timer (optional - could be added later)
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// Initialize the game
initGame();

// This spelling game includes word categories, hints, scoring, and streaks
// Players can test their spelling skills across different difficulty levels