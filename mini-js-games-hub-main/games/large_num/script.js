document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements ---
    const numberDisplay = document.getElementById('number-display');
    const startButton = document.getElementById('start-button');
    const inputArea = document.getElementById('input-area');
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('submit-button');
    const feedbackMessage = document.getElementById('feedback-message');
    const scoreSpan = document.getElementById('score');

    // --- 2. Game Variables ---
    let currentSequence = [];
    let largestNumber = 0;
    let score = 0;
    const SEQUENCE_LENGTH = 7;      // Number of numbers to show (5-10 suggested)
    const DISPLAY_DURATION = 300;   // How long each number is visible (in ms)
    const PAUSE_DURATION = 100;     // Pause time between numbers (in ms)
    const NUMBER_RANGE = 99;        // Max number value (from 1 to 99)

    // --- 3. Core Functions ---

    /**
     * Generates a unique random integer between 1 and max.
     */
    function getRandomNumber(max) {
        return Math.floor(Math.random() * max) + 1;
    }

    /**
     * Prepares the game by generating the number sequence.
     */
    function generateSequence() {
        currentSequence = [];
        largestNumber = 0;
        
        for (let i = 0; i < SEQUENCE_LENGTH; i++) {
            const newNumber = getRandomNumber(NUMBER_RANGE);
            currentSequence.push(newNumber);
            if (newNumber > largestNumber) {
                largestNumber = newNumber;
            }
        }
        console.log("Generated Sequence:", currentSequence);
        console.log("Largest Number (Answer):", largestNumber);
    }

    /**
     * Manages the flashing display of the number sequence.
     */
    function startSequenceDisplay() {
        startButton.disabled = true;
        inputArea.style.display = 'none';
        feedbackMessage.textContent = 'Get ready...';
        numberDisplay.textContent = '👁️';

        let sequenceIndex = 0;
        
        // Use a recursive setTimeout function for a precise, non-blocking delay loop
        function displayNextNumber() {
            if (sequenceIndex < currentSequence.length) {
                // Display the number
                numberDisplay.textContent = currentSequence[sequenceIndex];
                
                // Set timeout to clear the number (PAUSE_DURATION)
                setTimeout(() => {
                    numberDisplay.textContent = '';
                    sequenceIndex++;
                    
                    // Set timeout for the next number (DISPLAY_DURATION + PAUSE_DURATION)
                    setTimeout(displayNextNumber, PAUSE_DURATION); 
                }, DISPLAY_DURATION);
                
            } else {
                // Sequence finished, enable input
                endSequenceDisplay();
            }
        }

        // Start the process after a short delay
        setTimeout(displayNextNumber, 1000);
    }

    /**
     * Enables the user input section after the sequence has finished flashing.
     */
    function endSequenceDisplay() {
        numberDisplay.textContent = '❓';
        feedbackMessage.textContent = 'Input the largest number you saw.';
        
        inputArea.style.display = 'flex';
        answerInput.disabled = false;
        submitButton.disabled = false;
        answerInput.focus();
    }

    /**
     * Checks the player's input against the actual largest number.
     */
    function checkAnswer() {
        const playerAnswer = parseInt(answerInput.value);

        // Disable controls immediately after submission
        answerInput.disabled = true;
        submitButton.disabled = true;

        if (playerAnswer === largestNumber) {
            score++;
            scoreSpan.textContent = score;
            feedbackMessage.textContent = '✅ Correct! Well done!';
            feedbackMessage.style.color = '#1abc9c';
        } else {
            feedbackMessage.textContent = `❌ Incorrect. The largest number was ${largestNumber}.`;
            feedbackMessage.style.color = '#e74c3c'; // Red
        }

        // Reset for the next round
        startButton.textContent = 'NEXT ROUND';
        startButton.disabled = false;
        answerInput.value = '';
    }

    // --- 4. Event Listeners ---

    startButton.addEventListener('click', () => {
        generateSequence();
        startSequenceDisplay();
    });

    submitButton.addEventListener('click', checkAnswer);

    // Allow submission via the Enter key in the input field
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !submitButton.disabled) {
            checkAnswer();
        }
    });
});