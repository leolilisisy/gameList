// --- 1. GAME DATA ---
const flagData = [
    { country: "Japan", file: "japan.png" },
    { country: "Germany", file: "germany.png" },
    { country: "Brazil", file: "brazil.png" },
    { country: "Canada", file: "canada.png" },
    { country: "India", file: "india.png" },
    { country: "France", file: "france.png" },
    { country: "Australia", file: "australia.png" },
    { country: "China", file: "china.png" },
    { country: "Mexico", file: "mexico.png" }
    // NOTE: You must create a folder named 'images/flags/' and place the corresponding image files inside it.
];

// --- 2. GAME STATE VARIABLES ---
let currentQuestionIndex = 0;
let score = 0;
let answered = false;
let questions = []; // Array to hold the shuffled questions for the current game

// --- 3. DOM ELEMENTS ---
const flagImage = document.getElementById('flag-image');
const optionButtons = document.querySelectorAll('.option-button');
const feedbackMessage = document.getElementById('feedback-message');
const scoreSpan = document.getElementById('score');
const totalQuestionsSpan = document.getElementById('total-questions');
const nextButton = document.getElementById('next-button');
const OPTIONS_COUNT = 4;

// --- 4. CORE FUNCTIONS ---

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Initializes the game by shuffling the question list and setting up the score.
 */
function startGame() {
    shuffleArray(flagData);
    questions = flagData.slice(0, 5); // Use the first 5 flags for the game (can be adjusted)
    totalQuestionsSpan.textContent = questions.length;
    currentQuestionIndex = 0;
    score = 0;
    scoreSpan.textContent = score;
    nextButton.style.display = 'none';
    loadQuestion();
}

/**
 * Loads the next flag and generates four answer options.
 */
function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }

    answered = false;
    feedbackMessage.textContent = '';
    nextButton.style.display = 'none';

    const currentFlag = questions[currentQuestionIndex];
    flagImage.src = `images/flags/${currentFlag.file}`;
    flagImage.alt = `${currentFlag.country} Flag`;

    // 1. Determine the correct country name
    const correctCountry = currentFlag.country;

    // 2. Select three random, incorrect options
    const incorrectOptions = flagData
        .filter(f => f.country !== correctCountry)
        .map(f => f.country);

    shuffleArray(incorrectOptions);

    // 3. Create the list of four options (1 correct + 3 incorrect)
    let options = [correctCountry, ...incorrectOptions.slice(0, OPTIONS_COUNT - 1)];
    shuffleArray(options); // Shuffle the final options so the correct answer isn't always in the same spot

    // 4. Update the buttons with the new options
    optionButtons.forEach((button, index) => {
        button.textContent = options[index];
        button.setAttribute('data-country', options[index]);
        button.disabled = false;
        button.classList.remove('correct', 'incorrect');
        button.addEventListener('click', checkAnswer, { once: true }); // Ensure handler is added
    });
}

/**
 * Handles the user's click and checks if the answer is correct.
 */
function checkAnswer(event) {
    if (answered) return;
    answered = true;

    const selectedCountry = event.target.getAttribute('data-country');
    const correctCountry = questions[currentQuestionIndex].country;

    // Disable all buttons after an answer is chosen
    optionButtons.forEach(button => {
        button.disabled = true;

        if (button.getAttribute('data-country') === correctCountry) {
            button.classList.add('correct');
        } else if (button.getAttribute('data-country') === selectedCountry) {
            // Mark the user's incorrect choice
            button.classList.add('incorrect');
        }
    });

    if (selectedCountry === correctCountry) {
        score++;
        scoreSpan.textContent = score;
        feedbackMessage.textContent = '✅ Correct!';
        feedbackMessage.style.color = '#4CAF50';
    } else {
        feedbackMessage.textContent = `❌ Incorrect. The correct answer was ${correctCountry}.`;
        feedbackMessage.style.color = '#f44336';
    }

    // Prepare for the next round
    nextButton.style.display = 'block';
}

/**
 * Displays the final score and an option to restart.
 */
function endGame() {
    flagImage.style.display = 'none';
    document.getElementById('options-container').innerHTML = ''; // Clear buttons
    nextButton.style.display = 'block';
    nextButton.textContent = 'Play Again';
    nextButton.removeEventListener('click', nextQuestion); // Remove next listener
    nextButton.addEventListener('click', startGame, { once: true }); // Add restart listener

    feedbackMessage.textContent = `Game Over! Your final score is ${score} out of ${questions.length}.`;
    feedbackMessage.style.color = '#1a237e';
}

/**
 * Proceeds to the next question.
 */
function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

// --- 5. EVENT LISTENERS ---

nextButton.addEventListener('click', nextQuestion);

// Initial game start
startGame();