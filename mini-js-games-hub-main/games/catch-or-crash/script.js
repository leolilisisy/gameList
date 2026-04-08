const gameArea = document.getElementById('gameArea');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const catchSound = document.getElementById('catchSound');
const crashSound = document.getElementById('crashSound');

let objects = [];
let score = 0;
let lives = 3;
let gameInterval;
let spawnInterval;
let paused = false;

function randomX() {
    return Math.random() * (gameArea.clientWidth - 40);
}

function spawnObject() {
    const obj = document.createElement('div');
    obj.classList.add('object');
    const typeRand = Math.random();
    if (typeRand < 0.6) obj.classList.add('good');
    else if (typeRand < 0.85) obj.classList.add('bad');
    else obj.classList.add('tricky');

    obj.style.left = randomX() + 'px';
    obj.style.top = '-50px';
    gameArea.appendChild(obj);

    objects.push({el: obj, type: obj.classList.contains('good') ? 'good' : obj.classList.contains('bad') ? 'bad' : 'tricky', y: -50});
}

function moveObjects() {
    if (paused) return;
    objects.forEach((objData, index) => {
        objData.y += 3 + score*0.05;
        objData.el.style.top = objData.y + 'px';
        if (objData.y > gameArea.clientHeight) {
            if (objData.type === 'good') lives--;
            objData.el.remove();
            objects.splice(index, 1);
            updateScoreLives();
            checkGameOver();
        }
    });
    requestAnimationFrame(moveObjects);
}

function updateScoreLives() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
}

function checkGameOver() {
    if (lives <= 0) {
        clearInterval(spawnInterval);
        alert('Game Over! Your score: ' + score);
        resetGame();
    }
}

function resetGame() {
    objects.forEach(o => o.el.remove());
    objects = [];
    score = 0;
    lives = 3;
    updateScoreLives();
}

function startGame() {
    resetGame();
    paused = false;
    moveObjects();
    spawnInterval = setInterval(spawnObject, 1000);
}

function pauseGame() {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
}

function restartGame() {
    clearInterval(spawnInterval);
    startGame();
}

// Catch / Avoid Logic
gameArea.addEventListener('click', (e) => {
    const rect = gameArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = gameArea.clientWidth / 2;
    let action = x < half ? 'catch' : 'avoid';
    objects.forEach((objData, index) => {
        if (objData.y + 40 > gameArea.clientHeight - 50 && objData.y + 40 < gameArea.clientHeight + 10) {
            if ((action === 'catch' && objData.type === 'good') || (action === 'avoid' && objData.type === 'bad')) {
                score += 10;
                catchSound.currentTime = 0;
                catchSound.play();
            } else {
                score -= 5;
                if(score<0) score=0;
                crashSound.currentTime = 0;
                crashSound.play();
                if(objData.type==='good') lives--;
            }
            objData.el.remove();
            objects.splice(index,1);
            updateScoreLives();
            checkGameOver();
        }
    });
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);
