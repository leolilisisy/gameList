document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GAME DATA AND CONSTANTS ---
    const QUESTIONS = [
        "What is your favorite color?",
        "What is the name of your first pet?",
        "What is your dream travel destination?",
        "What is your go-to snack?",
        "What is your preferred programming language?"
    ];
    
    const STORAGE_KEY = 'personaQuizAnswers';

    // --- 2. DOM Elements ---
    const gameContainer = document.getElementById('game-container');
    const setupMode = document.getElementById('setup-mode');
    const quizMode = document.getElementById('quiz-mode');
    
    // Setup Mode elements
    const setupQuestionArea = document.getElementById('setup-question-area');
    const nextSetupButton = document.getElementById('next-setup-button');
    const startQuizButton = document.getElementById('start-quiz-button');

    // Quiz Mode elements
    const quizQuestionArea = document.getElementById('quiz-question-area');
    const submitQuizButton = document.getElementById('submit-quiz-button');
    const quizFeedbackMessage = document.getElementById('quiz-feedback-message');
    const quizScoreSpan = document.getElementById('quiz-score');
    const quizTotalSpan = document.getElementById('quiz-total');
    
    // Global elements
    const resetButton = document.getElementById('reset-button');

    // --- 3. GAME STATE VARIABLES ---
    let player1Answers = {}; // Stores {question: answer} for P1
    let currentQuestionIndex = 0;
    let quizScore = 0;

    // --- 4. CORE WEB STORAGE FUNCTIONS ---

    /**
     * Loads answers from localStorage.
     * @returns {Object|null} The stored answers or null.
     */
    function loadAnswers() {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        }
        return null;
    }

    /**
     * Saves Player 1's answers to localStorage.
     */
    function saveAnswers() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(player1Answers));
    }

    // --- 5. INITIALIZATION AND MODE SWITCHING ---

    /**
     * Determines the game mode based on localStorage and starts the appropriate phase.
     */
    function initGame() {
        const storedAnswers = loadAnswers();
        
        if (storedAnswers && Object.keys(storedAnswers).length === QUESTIONS.length) {
            // Answers exist: Start Quiz Mode (Player 2)
            player1Answers = storedAnswers;
            quizTotalSpan.textContent = QUESTIONS.length;
            switchMode('quiz');
            startQuizMode();
        } else {
            // Answers don't exist/incomplete: Start Setup Mode (Player 1)
            player1Answers = {};
            switchMode('setup');
            startSetupMode();
        }
    }

    /**
     * Visually switches between Setup and Quiz mode.
     */
    function switchMode(mode) {
        if (mode === 'setup') {
            setupMode.style.display = 'block';
            quizMode.style.display = 'none';
        } else if (mode === 'quiz') {
            setupMode.style.display = 'none';
            quizMode.style.display = 'block';
        }
    }

    // --- 6. SETUP MODE (Player 1) ---

    /**
     * Displays the current question for Player 1 to answer.
     */
    function startSetupMode() {
        currentQuestionIndex = 0;
        nextSetupButton.style.display = 'block';
        startQuizButton.style.display = 'none';
        
        displaySetupQuestion();
    }
    
    /**
     * Renders the current question and input field for Player 1.
     */
    function displaySetupQuestion() {
        if (currentQuestionIndex >= QUESTIONS.length) {
            // All questions answered
            nextSetupButton.style.display = 'none';
            startQuizButton.style.display = 'block';
            setupQuestionArea.innerHTML = '<p class="correct">Setup Complete! Ready to save your persona.</p>';
            return;
        }

        const question = QUESTIONS[currentQuestionIndex];
        setupQuestionArea.innerHTML = `
            <label for="setup-input"><strong>Question ${currentQuestionIndex + 1}/${QUESTIONS.length}:</strong></label>
            <p>${question}</p>
            <input type="text" id="setup-input" placeholder="Your answer" autocomplete="off">
        `;
        
        const setupInput = document.getElementById('setup-input');
        setupInput.addEventListener('input', () => {
            nextSetupButton.disabled = setupInput.value.trim() === '';
        });
        setupInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !nextSetupButton.disabled) {
                handleSetupNext();
            }
        });
        setupInput.focus();
        nextSetupButton.disabled = true;
    }

    /**
     * Saves the current answer and advances to the next question.
     */
    function handleSetupNext() {
        const input = document.getElementById('setup-input');
        const question = QUESTIONS[currentQuestionIndex];
        
        if (input.value.trim() !== '') {
            player1Answers[question] = input.value.trim();
            currentQuestionIndex++;
            displaySetupQuestion();
        }
    }

    // --- 7. QUIZ MODE (Player 2) ---

    /**
     * Starts the guessing phase for Player 2.
     */
    function startQuizMode() {
        currentQuestionIndex = 0;
        quizScore = 0;
        quizScoreSpan.textContent = quizScore;
        
        displayQuizQuestion();
    }
    
    /**
     * Displays the current quiz question and input field for Player 2.
     */
    function displayQuizQuestion() {
        if (currentQuestionIndex >= QUESTIONS.length) {
            endGame();
            return;
        }

        const question = QUESTIONS[currentQuestionIndex];
        quizQuestionArea.innerHTML = `
            <label for="quiz-input"><strong>Guess ${currentQuestionIndex + 1}/${QUESTIONS.length}:</strong></label>
            <p>${question}</p>
            <input type="text" id="quiz-input" placeholder="Player 1's answer" autocomplete="off">
        `;
        quizFeedbackMessage.textContent = '';
        
        const quizInput = document.getElementById('quiz-input');
        quizInput.addEventListener('input', () => {
            submitQuizButton.disabled = quizInput.value.trim() === '';
        });
        quizInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !submitQuizButton.disabled) {
                handleSubmitGuess();
            }
        });
        quizInput.focus();
        submitQuizButton.disabled = true;
    }

    /**
     * Checks Player 2's guess against Player 1's saved answer.
     */
    function handleSubmitGuess() {
        const input = document.getElementById('quiz-input');
        const question = QUESTIONS[currentQuestionIndex];
        const player2Guess = input.value.trim().toLowerCase();
        const correctAnswer = player1Answers[question].toLowerCase();
        
        // Normalize answers for better tolerance (e.g., ignore white space)
        const normalizedGuess = player2Guess.replace(/\s/g, '');
        const normalizedAnswer = correctAnswer.replace(/\s/g, '');

        submitQuizButton.disabled = true;
        
        if (normalizedGuess === normalizedAnswer) {
            quizScore++;
            quizScoreSpan.textContent = quizScore;
            quizFeedbackMessage.innerHTML = `<span class="correct">✅ CORRECT! The answer was "${player1Answers[question]}".</span>`;
        } else {
            quizFeedbackMessage.innerHTML = `<span class="incorrect">❌ INCORRECT. The answer was "${player1Answers[question]}".</span>`;
        }

        // Advance to the next question after a brief delay
        currentQuestionIndex++;
        setTimeout(displayQuizQuestion, 2500);
    }
    
    /**
     * Concludes the game and shows the final score.
     */
    function endGame() {
        quizQuestionArea.innerHTML = '';
        submitQuizButton.style.display = 'none';
        quizFeedbackMessage.style.color = '#007bff';
        quizFeedbackMessage.innerHTML = `
            <h2>GAME COMPLETE!</h2>
            <p>Final Score: <strong>${quizScore} out of ${QUESTIONS.length}</strong>.</p>
            <p>Press **Reset Data** to set up a new persona.</p>
        `;
    }

    // --- 8. EVENT LISTENERS ---

    // Setup Mode Listener
    nextSetupButton.addEventListener('click', handleSetupNext);
    
    // Save & Start Quiz Listener
    startQuizButton.addEventListener('click', () => {
        saveAnswers();
        initGame(); // Re-initialize to start the quiz mode
    });
    
    // Quiz Mode Listener
    submitQuizButton.addEventListener('click', handleSubmitGuess);

    // Global Reset Listener
    resetButton.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        player1Answers = {};
        alert('All saved persona data has been cleared. Starting Player 1 setup.');
        initGame();
    });

    // Start the whole application
    initGame();
});