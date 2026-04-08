// --- 1. Question Data ---
const questions = [
    {
        question: "What is the capital of France?",
        choices: ["Berlin", "Madrid", "Paris", "Rome"],
        correct: "Paris"
    },
    {
        question: "Which planet is known as the Red Planet?",
        choices: ["Mars", "Venus", "Jupiter", "Saturn"],
        correct: "Mars"
    },
    {
        question: "What is the largest ocean on Earth?",
        choices: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correct: "Pacific Ocean"
    },
    {
        question: "In which year did the first man walk on the moon?",
        choices: ["1965", "1969", "1971", "1975"],
        correct: "1969"
    },
    {
        question: "What is 7 multiplied by 8?",
        choices: ["54", "56", "64", "49"],
        correct: "56"
    }
];

// --- 2. Game State Variables ---
let currentQuestionIndex = 0;
let score = 0;
let answered = false; // Flag to prevent multiple clicks per question

// --- 3. DOM Element References ---
const scoreDisplay = document.getElementById('score');
const questionCountDisplay = document.getElementById('question-count');
const questionText = document.getElementById('question-text');
const answerButtonsContainer = document.getElementById('answer-buttons');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');
const quizArea = document.getElementById('quiz-area');
const resultScreen = document.getElementById('result-screen');
const finalScoreDisplay = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// --- 4. Main Game Functions ---

// Renders the current question to the screen
function displayQuestion() {
    // Hide results screen and show quiz area
    quizArea.classList.remove('hidden');
    resultScreen.classList.add('hidden');
    nextButton.classList.add('hidden');
    feedbackElement.classList.add('hidden');
    
    // Update header
    scoreDisplay.textContent = `Score: ${score}`;
    questionCountDisplay.textContent = `Question: ${currentQuestionIndex + 1}/${questions.length}`;

    // Get current question data
    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;

    // Clear previous buttons
    answerButtonsContainer.innerHTML = '';

    // Create new buttons for choices
    currentQuestion.choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.classList.add('answer-btn');
        // Attach event listener to check the answer when clicked
        button.addEventListener('click', () => checkAnswer(choice, currentQuestion.correct, button));
        answerButtonsContainer.appendChild(button);
    });
    
    answered = false; // Reset answered flag for the new question
}

// Checks the player's selected answer
function checkAnswer(selectedChoice, correctAnswer, clickedButton) {
    if (answered) return; // Prevent double-clicking
    answered = true;

    // Disable all buttons
    Array.from(answerButtonsContainer.children).forEach(button => {
        button.disabled = true;
    });

    // Update feedback message and style
    if (selectedChoice === correctAnswer) {
        score++;
        feedbackElement.textContent = '✅ Correct!';
        feedbackElement.className = 'correct';
        clickedButton.classList.add('correct');
    } else {
        feedbackElement.textContent = `❌ Incorrect. The correct answer was: ${correctAnswer}`;
        feedbackElement.className = 'incorrect';
        clickedButton.classList.add('incorrect');
        
        // Highlight the correct answer
        Array.from(answerButtonsContainer.children).forEach(button => {
            if (button.textContent === correctAnswer) {
                button.classList.add('correct');
            }
        });
    }

    feedbackElement.classList.remove('hidden');
    nextButton.classList.remove('hidden');
    scoreDisplay.textContent = `Score: ${score}`; // Update score immediately
}

// Moves to the next question or ends the game
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        endGame();
    }
}

// Shows the final score screen
function endGame() {
    quizArea.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = `You scored ${score} out of ${questions.length}!`;
}

// Resets game state and starts over
function restartGame() {
    currentQuestionIndex = 0;
    score = 0;
    displayQuestion();
}

// --- 5. Event Listeners ---
nextButton.addEventListener('click', nextQuestion);
restartButton.addEventListener('click', restartGame);

// --- 6. Initialization ---
// Start the quiz when the script loads
displayQuestion();