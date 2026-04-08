// Geography Explorer Game
// Click on countries on the map to identify them correctly

// DOM elements
const scoreEl = document.getElementById('current-score');
const roundCountEl = document.getElementById('current-round');
const totalRoundsEl = document.getElementById('total-rounds');
const streakEl = document.getElementById('current-streak');
const timeLeftEl = document.getElementById('time-left');
const countryNameEl = document.getElementById('country-name');
const questionHintEl = document.getElementById('question-hint');
const worldMap = document.getElementById('world-map');
const hintContinentBtn = document.getElementById('hint-continent-btn');
const hintCapitalBtn = document.getElementById('hint-capital-btn');
const hintOptionsBtn = document.getElementById('hint-options-btn');
const multipleChoiceEl = document.getElementById('multiple-choice');
const choiceBtns = document.querySelectorAll('.choice-btn');
const messageEl = document.getElementById('message');
const startBtn = document.getElementById('start-btn');
const quitBtn = document.getElementById('quit-btn');
const resultsEl = document.getElementById('results');
const finalScoreEl = document.getElementById('final-score');
const countriesFoundEl = document.getElementById('countries-found');
const countriesTotalEl = document.getElementById('countries-total');
const accuracyEl = document.getElementById('accuracy');
const bestStreakEl = document.getElementById('best-streak');
const gradeEl = document.getElementById('grade');
const playAgainBtn = document.getElementById('play-again-btn');

// Game variables
let currentRound = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let timeLeft = 30;
let timerInterval = null;
let gameActive = false;
let countries = [];
let currentCountry = null;
let hintsUsed = {
    continent: false,
    capital: false,
    options: false
};
let countriesFound = 0;

// Country data with simplified SVG paths
const countryData = [
    {
        name: "United States",
        continent: "North America",
        capital: "Washington D.C.",
        path: "M150,200 L180,200 L180,180 L200,180 L200,160 L220,160 L220,140 L240,140 L240,120 L260,120 L260,100 L280,100 L280,120 L300,120 L300,140 L280,140 L280,160 L260,160 L260,180 L240,180 L240,200 L220,200 L220,220 L200,220 L200,240 L180,240 L180,220 L160,220 Z"
    },
    {
        name: "Canada",
        continent: "North America",
        capital: "Ottawa",
        path: "M140,180 L160,180 L160,160 L180,160 L180,140 L200,140 L200,120 L220,120 L220,100 L240,100 L240,80 L260,80 L260,100 L240,100 L240,120 L220,120 L220,140 L200,140 L200,160 L180,160 L180,180 L160,180 Z"
    },
    {
        name: "Brazil",
        continent: "South America",
        capital: "Brasília",
        path: "M280,280 L300,280 L300,300 L320,300 L320,320 L300,320 L300,340 L280,340 L280,320 L260,320 L260,300 L280,300 Z"
    },
    {
        name: "United Kingdom",
        continent: "Europe",
        capital: "London",
        path: "M480,160 L500,160 L500,180 L480,180 Z"
    },
    {
        name: "France",
        continent: "Europe",
        capital: "Paris",
        path: "M480,180 L500,180 L500,200 L480,200 Z"
    },
    {
        name: "Germany",
        continent: "Europe",
        capital: "Berlin",
        path: "M500,160 L520,160 L520,180 L500,180 Z"
    },
    {
        name: "Italy",
        continent: "Europe",
        capital: "Rome",
        path: "M500,180 L520,180 L520,200 L500,200 Z"
    },
    {
        name: "Spain",
        continent: "Europe",
        capital: "Madrid",
        path: "M460,200 L480,200 L480,220 L460,220 Z"
    },
    {
        name: "Russia",
        continent: "Europe/Asia",
        capital: "Moscow",
        path: "M520,140 L600,140 L600,160 L580,160 L580,180 L560,180 L560,160 L540,160 L540,140 Z"
    },
    {
        name: "China",
        continent: "Asia",
        capital: "Beijing",
        path: "M620,180 L680,180 L680,200 L660,200 L660,220 L640,220 L640,200 L620,200 Z"
    },
    {
        name: "Japan",
        continent: "Asia",
        capital: "Tokyo",
        path: "M700,180 L720,180 L720,200 L700,200 Z"
    },
    {
        name: "India",
        continent: "Asia",
        capital: "New Delhi",
        path: "M580,220 L620,220 L620,240 L600,240 L600,260 L580,260 Z"
    },
    {
        name: "Australia",
        continent: "Australia",
        capital: "Canberra",
        path: "M650,320 L700,320 L700,340 L680,340 L680,360 L650,360 Z"
    },
    {
        name: "Egypt",
        continent: "Africa",
        capital: "Cairo",
        path: "M500,240 L520,240 L520,260 L500,260 Z"
    },
    {
        name: "South Africa",
        continent: "Africa",
        capital: "Cape Town",
        path: "M500,300 L520,300 L520,320 L500,320 Z"
    },
    {
        name: "Mexico",
        continent: "North America",
        capital: "Mexico City",
        path: "M180,240 L200,240 L200,260 L180,260 Z"
    },
    {
        name: "Argentina",
        continent: "South America",
        capital: "Buenos Aires",
        path: "M260,340 L280,340 L280,360 L260,360 Z"
    },
    {
        name: "South Korea",
        continent: "Asia",
        capital: "Seoul",
        path: "M660,180 L680,180 L680,200 L660,200 Z"
    },
    {
        name: "Turkey",
        continent: "Europe/Asia",
        capital: "Ankara",
        path: "M520,200 L540,200 L540,220 L520,220 Z"
    },
    {
        name: "Saudi Arabia",
        continent: "Asia",
        capital: "Riyadh",
        path: "M540,240 L560,240 L560,260 L540,260 Z"
    }
];

// Initialize game
function initGame() {
    shuffleCountries();
    setupEventListeners();
    createMap();
    updateDisplay();
}

// Shuffle countries for random order
function shuffleCountries() {
    countries = [...countryData];
    for (let i = countries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [countries[i], countries[j]] = [countries[j], countries[i]];
    }
    // Take first 10 countries
    countries = countries.slice(0, 10);
    totalRoundsEl.textContent = countries.length;
}

// Create the world map
function createMap() {
    worldMap.innerHTML = '';

    // Create all country paths
    countryData.forEach(country => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', country.path);
        path.setAttribute('class', 'country');
        path.setAttribute('data-country', country.name);
        path.addEventListener('click', () => selectCountry(country.name));
        worldMap.appendChild(path);
    });
}

// Setup event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    quitBtn.addEventListener('click', endGame);
    playAgainBtn.addEventListener('click', resetGame);

    hintContinentBtn.addEventListener('click', () => useHint('continent'));
    hintCapitalBtn.addEventListener('click', () => useHint('capital'));
    hintOptionsBtn.addEventListener('click', () => useHint('options'));

    choiceBtns.forEach(btn => {
        btn.addEventListener('click', () => selectMultipleChoice(btn));
    });
}

// Start the game
function startGame() {
    gameActive = true;
    currentRound = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    countriesFound = 0;
    timeLeft = 30;

    hintsUsed = {
        continent: false,
        capital: false,
        options: false
    };

    startBtn.style.display = 'none';
    quitBtn.style.display = 'inline-block';

    hintContinentBtn.disabled = false;
    hintCapitalBtn.disabled = false;
    hintOptionsBtn.disabled = false;

    resultsEl.style.display = 'none';
    messageEl.textContent = '';
    multipleChoiceEl.style.display = 'none';

    // Reset all country colors
    document.querySelectorAll('.country').forEach(country => {
        country.classList.remove('correct', 'incorrect', 'highlight');
    });

    loadRound();
}

// Load current round
function loadRound() {
    if (currentRound >= countries.length) {
        endGame();
        return;
    }

    currentCountry = countries[currentRound];
    hintsUsed = {
        continent: false,
        capital: false,
        options: false
    };

    // Update UI
    countryNameEl.textContent = currentCountry.name;
    questionHintEl.textContent = '';

    // Reset multiple choice
    multipleChoiceEl.style.display = 'none';

    // Start timer
    startTimer();

    updateDisplay();
}

// Start round timer
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
    showMessage('Time\'s up! The correct country was highlighted.', 'incorrect');
    highlightCorrectCountry();
    streak = 0;
    setTimeout(nextRound, 3000);
}

// Select country on map
function selectCountry(countryName) {
    if (!gameActive) return;

    clearInterval(timerInterval);

    const selectedCountry = countryData.find(c => c.name === countryName);
    const correctCountry = currentCountry;

    if (countryName === correctCountry.name) {
        correctAnswer(selectedCountry);
    } else {
        incorrectAnswer(selectedCountry, correctCountry);
    }
}

// Handle correct answer
function correctAnswer(country) {
    countriesFound++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;

    // Calculate points
    let points = 10;

    // Time bonus
    if (timeLeft >= 25) points += 10;
    else if (timeLeft >= 20) points += 5;

    // Streak bonus
    if (streak >= 3) points += streak * 2;

    // Hint penalty
    const hintsUsedCount = Object.values(hintsUsed).filter(Boolean).length;
    points = Math.max(points - hintsUsedCount * 5, 5);

    score += points;

    // Highlight correct country
    const countryPath = document.querySelector(`[data-country="${country.name}"]`);
    countryPath.classList.add('correct');

    showMessage(`Correct! +${points} points (Streak: ${streak})`, 'correct');
    setTimeout(nextRound, 2000);
}

// Handle incorrect answer
function incorrectAnswer(selected, correct) {
    streak = 0;

    // Highlight selected country as incorrect
    const selectedPath = document.querySelector(`[data-country="${selected.name}"]`);
    selectedPath.classList.add('incorrect');

    // Highlight correct country
    highlightCorrectCountry();

    showMessage(`Incorrect! That was ${selected.name}. The correct answer was ${correct.name}.`, 'incorrect');
    setTimeout(nextRound, 3000);
}

// Highlight correct country
function highlightCorrectCountry() {
    const correctPath = document.querySelector(`[data-country="${currentCountry.name}"]`);
    correctPath.classList.add('highlight');
}

// Use hint
function useHint(hintType) {
    if (!gameActive || hintsUsed[hintType]) return;

    let cost = 0;
    let hintText = '';

    switch (hintType) {
        case 'continent':
            cost = 5;
            hintText = `Continent: ${currentCountry.continent}`;
            break;
        case 'capital':
            cost = 10;
            hintText = `Capital: ${currentCountry.capital}`;
            break;
        case 'options':
            cost = 15;
            showMultipleChoice();
            break;
    }

    if (score < cost) {
        showMessage(`Not enough points! Need ${cost} points for this hint.`, 'incorrect');
        return;
    }

    if (hintType !== 'options') {
        score -= cost;
        hintsUsed[hintType] = true;
        questionHintEl.textContent = hintText;
        showMessage(`Hint used! -${cost} points`, 'hint');
        updateDisplay();
    }
}

// Show multiple choice options
function showMultipleChoice() {
    if (hintsUsed.options) return;

    const cost = 15;
    if (score < cost) {
        showMessage(`Not enough points! Need ${cost} points for multiple choice.`, 'incorrect');
        return;
    }

    score -= cost;
    hintsUsed.options = true;

    // Create options (correct + 3 random wrong)
    const options = [currentCountry.name];
    const wrongCountries = countryData.filter(c => c.name !== currentCountry.name);

    while (options.length < 4) {
        const randomCountry = wrongCountries[Math.floor(Math.random() * wrongCountries.length)];
        if (!options.includes(randomCountry.name)) {
            options.push(randomCountry.name);
        }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    // Set button texts
    choiceBtns.forEach((btn, index) => {
        btn.textContent = options[index];
        btn.classList.remove('correct', 'incorrect');
    });

    multipleChoiceEl.style.display = 'block';
    showMessage(`Multiple choice activated! -${cost} points`, 'hint');
    updateDisplay();
}

// Select multiple choice answer
function selectMultipleChoice(btn) {
    if (!gameActive) return;

    clearInterval(timerInterval);

    const selectedCountry = btn.textContent;
    const correctCountry = currentCountry.name;

    choiceBtns.forEach(b => b.disabled = true);

    if (selectedCountry === correctCountry) {
        btn.classList.add('correct');
        correctAnswer(currentCountry);
    } else {
        btn.classList.add('incorrect');
        // Find and highlight correct button
        choiceBtns.forEach(b => {
            if (b.textContent === correctCountry) {
                b.classList.add('correct');
            }
        });
        incorrectAnswer({name: selectedCountry}, currentCountry);
    }
}

// Next round
function nextRound() {
    currentRound++;
    timeLeft = 30;
    loadRound();
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
    const accuracy = countries.length > 0 ? Math.round((countriesFound / countries.length) * 100) : 0;

    finalScoreEl.textContent = score.toLocaleString();
    countriesFoundEl.textContent = countriesFound;
    countriesTotalEl.textContent = countries.length;
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

    hintContinentBtn.disabled = true;
    hintCapitalBtn.disabled = true;
    hintOptionsBtn.disabled = true;
}

// Reset game
function resetGame() {
    resultsEl.style.display = 'none';
    startBtn.style.display = 'inline-block';
    quitBtn.style.display = 'none';

    hintContinentBtn.disabled = true;
    hintCapitalBtn.disabled = true;
    hintOptionsBtn.disabled = true;

    shuffleCountries();
    createMap();
    updateDisplay();
    messageEl.textContent = 'Ready for another geography exploration?';
}

// Update display elements
function updateDisplay() {
    scoreEl.textContent = score.toLocaleString();
    roundCountEl.textContent = currentRound + 1;
    streakEl.textContent = streak;
    timeLeftEl.textContent = timeLeft;
}

// Initialize the game
initGame();

// This geography game includes clickable map, hints, scoring, and multiple rounds
// Players explore world geography by identifying countries on an interactive map