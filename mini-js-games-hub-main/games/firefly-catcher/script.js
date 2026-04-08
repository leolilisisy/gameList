const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');

const bgSound = document.getElementById('bg-sound');
const catchSound = document.getElementById('catch-sound');

let score = 0;
let timeLeft = 30;
let interval;
let spawnInterval;
let paused = false;

function createFirefly() {
    const firefly = document.createElement('div');
    firefly.classList.add('firefly');

    const x = Math.random() * (gameArea.clientWidth - 40);
    const y = Math.random() * (gameArea.clientHeight - 40);
    firefly.style.left = x + 'px';
    firefly.style.top = y + 'px';

    // random glow animation speed
    firefly.style.animationDuration = (Math.random() * 3 + 2) + 's';

    firefly.addEventListener('click', () => {
        if (!paused) {
            score++;
            scoreEl.textContent = score;
            catchSound.currentTime = 0;
            catchSound.play();
            gameArea.removeChild(firefly);
        }
    });

    gameArea.appendChild(firefly);

    // remove firefly after 5-7 seconds if not clicked
    setTimeout(() => {
        if (gameArea.contains(firefly)) {
            gameArea.removeChild(firefly);
        }
    }, 5000 + Math.random() * 2000);
}

function startGame() {
    if (!paused) {
        bgSound.play();
    }
    score = 0;
    timeLeft = 30;
    scoreEl.textContent = score;
    timeEl.textContent = timeLeft;

    clearInterval(interval);
    clearInterval(spawnInterval);

    interval = setInterval(() => {
        if (!paused) {
            timeLeft--;
            timeEl.textContent = timeLeft;
            if (timeLeft <= 0) endGame();
        }
    }, 1000);

    spawnInterval = setInterval(() => {
        if (!paused) createFirefly();
    }, 800);
}

function pauseGame() {
    paused = !paused;
    if (!paused) {
        bgSound.play();
        startBtn.textContent = 'Resume';
    } else {
        bgSound.pause();
    }
}

function restartGame() {
    paused = false;
    bgSound.currentTime = 0;
    bgSound.play();
    startGame();
}

function endGame() {
    clearInterval(interval);
    clearInterval(spawnInterval);
    bgSound.pause();
    alert(`Game Over! Your score: ${score}`);
    gameArea.innerHTML = '';
}

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);
