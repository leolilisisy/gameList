document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements ---
    const problemDisplay = document.getElementById('problem-display');
    const answerButtons = document.querySelectorAll('.answer-button');
    const feedbackMessage = document.getElementById('feedback-message');
    const scoreSpan = document.getElementById('score');
    const startButton = document.getElementById('start-button');
    const timerBar = document.getElementById('timer-bar');

    // --- 2. Game Variables ---
    let score = 0;
    let correctAnswer = 0;
    let gameActive = false;

    // Timing variables
    const TIME_LIMIT_MS = 5000; // 5 seconds per problem
    const TIMER_UPDATE_INTERVAL_MS = 50;
    let timerInterval = null;
    let timeRemaining = TIME_LIMIT_MS;

    // --- 3. UTILITY FUNCTIONS ---

    /**
     * Generates a random integer between min (inclusive) and max (inclusive).
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Calculates the result of a simple math operation.
     */
    function calculateResult(num1, operator, num2) {
        switch (operator) {
            case '+':
                return num1 + num2;
            case '-':
                return num1 - num2;
            case '*':
                return num1 * num2;
            default:
                return 0;
        }
    }

    /**
     * Generates a unique incorrect answer (distractor) close to the correct answer.
     */
    function generateDistractor(correct, existingAnswers) {
        let distractor;
        do {
            // Generate a distractor within a range (e.g., +/- 5 of the answer)
            distractor = correct + getRandomInt(-5, 5);
        } while (distractor === correct || existingAnswers.includes(distractor) || distractor < 0);
        return distractor;
    }

    // --- 4. CORE GAME FUNCTIONS ---

    /**
     * Starts the game and initializes the first round.
     */
    function startGame() {
        if (gameActive) return;

        score = 0;
        scoreSpan.textContent = score;
        gameActive = true;
        startButton.textContent = 'RESTART';
        startButton.disabled = true;
        feedbackMessage.textContent = 'Solve the problem!';
        
        loadProblem();
    }

    /**
     * Creates a new problem, generates options, and starts the timer.
     */
    function loadProblem() {
        // Stop any existing timer
        stopTimer();

        // 1. Generate Problem
        const num1 = getRandomInt(1, 20);
        const num2 = getRandomInt(1, 15);
        const operator = Math.random() < 0.5 ? '+' : '-'; // Only + and -
        // Ensure result is not negative for subtraction
        const finalNum1 = (operator === '-') ? Math.max(num1, num2) : num1;
        const finalNum2 = (operator === '-') ? Math.min(num1, num2) : num2;

        correctAnswer = calculateResult(finalNum1, operator, finalNum2);
        
        problemDisplay.textContent = `${finalNum1} ${operator} ${finalNum2} = ?`;

        // 2. Generate Options
        let options = [correctAnswer];
        while (options.length < 4) {
            const distractor = generateDistractor(correctAnswer, options);
            options.push(distractor);
        }
        
        // Shuffle the options array
        options.sort(() => Math.random() - 0.5);

        // 3. Update Answer Buttons
        answerButtons.forEach((button, index) => {
            const answer = options[index];
            button.textContent = answer;
            button.setAttribute('data-value', answer);
            button.classList.remove('correct', 'incorrect');
            button.disabled = false;
            // Re-attach listener to prevent multiple triggers
            button.removeEventListener('click', handleAnswer);
            button.addEventListener('click', handleAnswer);
        });

        // 4. Start Timer
        startTimer();
    }

    /**
     * Handles the player clicking an answer button.
     */
    function handleAnswer(event) {
        if (!gameActive) return;

        // Stop timer immediately
        stopTimer();

        const playerGuess = parseInt(event.target.getAttribute('data-value'));

        // Disable all buttons to prevent further clicks
        answerButtons.forEach(btn => btn.disabled = true);
        
        // Check result
        if (playerGuess === correctAnswer) {
            score++;
            scoreSpan.textContent = score;
            feedbackMessage.textContent = '✅ Correct! Get ready for the next one...';
            event.target.classList.add('correct');
        } else {
            feedbackMessage.textContent = `❌ Incorrect! The answer was ${correctAnswer}.`;
            event.target.classList.add('incorrect');
            // Highlight the correct answer
            document.querySelector(`[data-value="${correctAnswer}"]`).classList.add('correct');
        }

        // Load next problem after a short delay
        setTimeout(loadProblem, 1500);
    }
    
    /**
     * Stops the timer and clears the interval.
     */
    function stopTimer() {
        clearInterval(timerInterval);
        timerBar.style.width = '100%'; // Reset bar for next round
    }

    /**
     * Starts the countdown timer.
     */
    function startTimer() {
        timeRemaining = TIME_LIMIT_MS;

        timerInterval = setInterval(() => {
            timeRemaining -= TIMER_UPDATE_INTERVAL_MS;
            
            // Update the bar width
            const percent = (timeRemaining / TIME_LIMIT_MS) * 100;
            timerBar.style.width = `${percent}%`;
            
            // Change color as time runs out (optional)
            if (percent < 30) {
                 timerBar.style.backgroundColor = '#e74c3c'; // Red
            } else if (percent < 60) {
                 timerBar.style.backgroundColor = '#f39c12'; // Orange
            } else {
                 timerBar.style.backgroundColor = '#2ecc71'; // Green
            }

            if (timeRemaining <= 0) {
                // Time's up!
                stopTimer();
                handleTimeout();
            }
        }, TIMER_UPDATE_INTERVAL_MS);
    }

    /**
     * Executes when the time limit for a problem is reached.
     */
    function handleTimeout() {
        if (!gameActive) return;

        feedbackMessage.textContent = `⏰ Time's Up! The answer was ${correctAnswer}.`;
        feedbackMessage.style.color = '#e74c3c';
        
        // Disable all buttons
        answerButtons.forEach(btn => btn.disabled = true);
        
        // Highlight the correct answer
        document.querySelector(`[data-value="${correctAnswer}"]`).classList.add('correct');

        // Load next problem after a delay
        setTimeout(loadProblem, 1500);
    }

    /**
     * Resets the game to the initial state.
     */
    function resetGame() {
        stopTimer();
        gameActive = false;
        score = 0;
        scoreSpan.textContent = score;
        problemDisplay.textContent = 'Press START';
        feedbackMessage.textContent = 'Ready to test your speed?';
        startButton.textContent = 'START GAME';
        startButton.disabled = false;

        answerButtons.forEach(btn => {
            btn.textContent = '';
            btn.classList.remove('correct', 'incorrect');
            btn.disabled = true;
        });
    }

    // --- 5. EVENT LISTENERS ---
    startButton.addEventListener('click', () => {
        // If the game is already active, this acts as a restart
        if (startButton.textContent === 'RESTART') {
            resetGame();
            startGame();
        } else {
            startGame();
        }
    });

    // Initial setup
    resetGame();
});