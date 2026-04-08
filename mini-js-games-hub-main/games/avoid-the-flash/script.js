const obstacleLine = document.querySelector('.obstacle-line');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');

const successSound = document.getElementById('success-sound');
const failSound = document.getElementById('fail-sound');

let score = 0;
let gameInterval;
let gamePaused = false;

function randomFlash() {
    const isSafe = Math.random() > 0.3; // 70% safe, 30% danger
    if (isSafe) {
        obstacleLine.style.background = '#0f0'; // green safe
    } else {
        obstacleLine.style.background = '#f00'; // red danger
    }
}

function startGame() {
    score = 0;
    scoreEl.textContent = score;
    messageEl.textContent = '';
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    restartBtn.disabled = false;
    resumeBtn.disabled = true;
    gamePaused = false;
    gameInterval = setInterval(() => {
        randomFlash();
    }, 1000);
}

function pauseGame() {
    clearInterval(gameInterval);
    gamePaused = true;
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
}

function resumeGame() {
    gamePaused = false;
    gameInterval = setInterval(() => {
        randomFlash();
    }, 1000);
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
}

function restartGame() {
    clearInterval(gameInterval);
    startGame();
}

obstacleLine.addEventListener('click', () => {
    if (gamePaused) return;
    if (obstacleLine.style.background === 'rgb(255, 0, 0)') {
        failSound.play();
        messageEl.textContent = '💀 You clicked on red! Game Over';
        clearInterval(gameInterval);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        resumeBtn.disabled = true;
    } else {
        score++;
        scoreEl.textContent = score;
        successSound.play();
        obstacleLine.style.background = '#0ff'; // flash effect
    }
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);
restartBtn.addEventListener('click', restartGame);
