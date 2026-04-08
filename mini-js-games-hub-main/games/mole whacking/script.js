// Select elements
const holes = document.querySelectorAll('.hole');
const scoreBoard = document.getElementById('score');
const timeBoard = document.getElementById('time');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

let score = 0;
let time = 30;
let moleTimer;
let countdownTimer;

// Function to show a mole randomly
function showMole() {
    const randomIndex = Math.floor(Math.random() * holes.length);
    const mole = document.createElement('div');
    mole.classList.add('mole');
    holes[randomIndex].appendChild(mole);

    // Remove mole after 800ms if not clicked
    setTimeout(() => {
        if (holes[randomIndex].contains(mole)) {
            holes[randomIndex].removeChild(mole);
        }
    }, 800);
}

// Function to start game
function startGame() {
    score = 0;
    time = 30;
    scoreBoard.textContent = score;
    timeBoard.textContent = time;
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';

    // Mole appears every 1s
    moleTimer = setInterval(showMole, 1000);

    // Countdown timer
    countdownTimer = setInterval(() => {
        time--;
        timeBoard.textContent = time;
        if (time <= 0) {
            endGame();
        }
    }, 1000);
}

// Function to end game
function endGame() {
    clearInterval(moleTimer);
    clearInterval(countdownTimer);
    alert(`Time's up! Your final score is ${score}`);
    restartBtn.style.display = 'inline-block';
}

// Event listener to whack mole
holes.forEach(hole => {
    hole.addEventListener('click', (e) => {
        if (e.target.classList.contains('mole')) {
            score++;
            scoreBoard.textContent = score;
            e.target.remove();
        }
    });
});

// Button listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
