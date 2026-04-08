const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const timeEl = document.getElementById('time');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const messageEl = document.getElementById('message');

let score = 0;
let highScore = localStorage.getItem('numberPopHighScore') || 0;
let time = 60;
let gameInterval;
let spawnInterval;

highScoreEl.textContent = highScore;

function spawnNumber() {
    const numberEl = document.createElement('div');
    const num = Math.floor(Math.random() * 9) + 1;
    numberEl.textContent = num;
    numberEl.classList.add('number');
    numberEl.classList.add(num % 2 === 0 ? 'even' : 'odd');

    const x = Math.random() * (gameArea.offsetWidth - 50);
    const y = Math.random() * (gameArea.offsetHeight - 50);
    numberEl.style.left = `${x}px`;
    numberEl.style.top = `${y}px`;

    numberEl.addEventListener('click', () => {
        if (num % 2 === 0) {
            score += 1;
            scoreEl.textContent = score;
        } else {
            score = Math.max(0, score - 1);
            scoreEl.textContent = score;
        }
        gameArea.removeChild(numberEl);
    });

    gameArea.appendChild(numberEl);

    setTimeout(() => {
        if (gameArea.contains(numberEl)) {
            gameArea.removeChild(numberEl);
        }
    }, 1500);
}

function startGame() {
    score = 0;
    time = 60;
    scoreEl.textContent = score;
    timeEl.textContent = time;
    messageEl.textContent = '';
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    gameArea.innerHTML = '';

    spawnInterval = setInterval(spawnNumber, 800);

    gameInterval = setInterval(() => {
        time -= 1;
        timeEl.textContent = time;
        if (time <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    gameArea.innerHTML = '';
    messageEl.textContent = `Game Over! Your score: ${score}`;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('numberPopHighScore', highScore);
        highScoreEl.textContent = highScore;
    }
    restartBtn.style.display = 'inline-block';
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
