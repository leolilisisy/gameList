const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const submitBtn = document.getElementById("submit-btn");
const questionEl = document.getElementById("question");
const answerInput = document.getElementById("answer");
const runner1 = document.getElementById("runner1");
const runner2 = document.getElementById("runner2");
const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");
const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");
const winSound = document.getElementById("win-sound");

let player1Score = 0;
let player2Score = 0;
let currentPlayer = 1;
let interval;
let paused = true;

let currentAnswer = 0;

// Generate random math question
function generateQuestion() {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const operators = ["+", "-", "*", "/"];
    const op = operators[Math.floor(Math.random() * operators.length)];

    switch(op) {
        case "+": currentAnswer = a + b; break;
        case "-": currentAnswer = a - b; break;
        case "*": currentAnswer = a * b; break;
        case "/": currentAnswer = Math.round(a / b); break;
    }

    questionEl.textContent = `Player ${currentPlayer}: ${a} ${op} ${b} = ?`;
}

// Move runner
function moveRunner(player) {
    const track = player === 1 ? runner1 : runner2;
    const trackWidth = track.parentElement.offsetWidth - track.offsetWidth;
    const newPos = (player === 1 ? player1Score : player2Score) * 10;
    track.style.left = `${Math.min(newPos, trackWidth)}px`;
}

// Check answer
function submitAnswer() {
    const val = parseInt(answerInput.value);
    if (isNaN(val)) return;
    if (val === currentAnswer) {
        correctSound.play();
        if (currentPlayer === 1) {
            player1Score++;
            moveRunner(1);
        } else {
            player2Score++;
            moveRunner(2);
        }
    } else {
        wrongSound.play();
    }

    answerInput.value = "";
    if (player1Score >= 20 || player2Score >= 20) {
        endGame();
    } else {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        generateQuestion();
    }
}

// Start game
function startGame() {
    if (!paused) return;
    paused = false;
    generateQuestion();
}

// Pause game
function pauseGame() {
    paused = true;
    questionEl.textContent = "Game Paused";
}

// Restart game
function restartGame() {
    paused = true;
    player1Score = 0;
    player2Score = 0;
    moveRunner(1);
    moveRunner(2);
    score1El.textContent = player1Score;
    score2El.textContent = player2Score;
    currentPlayer = 1;
    generateQuestion();
}

// End game
function endGame() {
    paused = true;
    const winner = player1Score > player2Score ? 1 : 2;
    questionEl.textContent = `Player ${winner} Wins! 🎉`;
    winSound.play();
}

// Event listeners
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", restartGame);
submitBtn.addEventListener("click", submitAnswer);
answerInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") submitAnswer();
});
