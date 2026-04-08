// --- Game State Variables ---
const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const resetButton = document.getElementById('reset-button');
const winMessage = document.getElementById('win-message');
const finalMovesSpan = document.getElementById('final-moves');
const playAgainButton = document.getElementById('play-again-button');

let hasFlippedCard = false;
let lockBoard = false; // Flag to prevent rapid clicking while cards are flipping
let firstCard, secondCard;
let moves = 0;
let matchedPairs = 0;
const TOTAL_PAIRS = 8; // For a 4x4 grid (16 cards)
const CARD_FLIP_DELAY = 1000; // 1000ms delay for unmatched cards

// The 8 card pairs. Using simple emojis for the card values.
const cardValues = [
    '🍎', '🍌', '🍇', '🍉',
    '🍓', '🥝', '🥭', '🍍'
];


// --- Core Functions ---

/**
 * Shuffles an array using the Fisher-Yates (Knuth) algorithm.
 * @param {Array} array - The array to shuffle.
 */
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

/**
 * Initializes and shuffles the board.
 */
function initializeBoard() {
    // 1. Create the full set of cards (8 pairs = 16 cards)
    let cards = [...cardValues, ...cardValues];
    
    // 2. Shuffle the array
    cards = shuffle(cards);

    // 3. Reset game state
    gameBoard.innerHTML = '';
    moves = 0;
    matchedPairs = 0;
    movesDisplay.textContent = `Moves: ${moves}`;
    winMessage.classList.add('hidden');
    
    // 4. Create and append card elements to the DOM
    cards.forEach((value, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.value = value;
        card.dataset.id = index; // Unique ID for each card instance

        // Card Front (The value)
        const frontFace = document.createElement('div');
        frontFace.classList.add('front-face');
        frontFace.textContent = value;
        
        // Card Back (The cover)
        const backFace = document.createElement('div');
        backFace.classList.add('back-face');
        backFace.textContent = '?'; // A simple symbol for the back

        card.appendChild(frontFace);
        card.appendChild(backFace);
        
        // Attach the click listener
        card.addEventListener('click', flipCard);
        
        gameBoard.appendChild(card);
    });
}

/**
 * Handles the card flip action on click.
 */
function flipCard() {
    // 1. Prevent action if board is locked (waiting for unmatched cards to flip back)
    if (lockBoard) return;
    
    // 2. Prevent clicking the same card twice
    if (this === firstCard) return;

    // 3. Flip the card
    this.classList.add('flip');

    if (!hasFlippedCard) {
        // FIRST CARD FLIP
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    // SECOND CARD FLIP
    secondCard = this;
    moves++;
    movesDisplay.textContent = `Moves: ${moves}`;
    
    checkForMatch();
}

/**
 * Checks if the two flipped cards are a match.
 */
function checkForMatch() {
    let isMatch = firstCard.dataset.value === secondCard.dataset.value;

    isMatch ? disableCards() : unflipCards();
}

/**
 * Cards match: remove event listeners and mark as matched.
 */
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    // Optional: Add a visual cue for matched cards
    firstCard.classList.add('match');
    secondCard.classList.add('match');

    matchedPairs++;
    
    resetBoard();
    
    // Check for win condition
    if (matchedPairs === TOTAL_PAIRS) {
        showWinMessage();
    }
}

/**
 * Cards DO NOT match: flip them back over after a delay.
 */
function unflipCards() {
    lockBoard = true; // Lock the board to prevent more flips

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');

        resetBoard();
    }, CARD_FLIP_DELAY); // Uses the defined delay
}

/**
 * Resets the variables for the next turn.
 */
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

/**
 * Shows the congratulatory message.
 */
function showWinMessage() {
    finalMovesSpan.textContent = moves;
    winMessage.classList.remove('hidden');
}


// --- Event Listeners ---

// Reset/Play Again button initiates a new game
resetButton.addEventListener('click', initializeBoard);
playAgainButton.addEventListener('click', initializeBoard);


// --- Initial Game Setup ---
document.addEventListener('DOMContentLoaded', initializeBoard);