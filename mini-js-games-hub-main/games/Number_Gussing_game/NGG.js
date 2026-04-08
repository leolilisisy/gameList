let targetNumber;
let attempts;

function initGame() {
    targetNumber = Math.floor(Math.random() * 101);
    attempts = 0;
    document.getElementById('attempts').textContent = attempts;
    document.getElementById('guessInput').value = '';
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('gameArea').classList.remove('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    // Remove any previous balloons
    const container = document.querySelector('.container');
    if (container) {
        container.querySelectorAll('.balloon').forEach(b => b.remove());
    }

    document.getElementById('guessInput').focus();
}

function checkGuess() {
    const input = document.getElementById('guessInput');
    const guess = parseInt(input.value);
    const feedback = document.getElementById('feedback');

    if (isNaN(guess) || guess < 0 || guess > 100) {
        feedback.className = 'feedback higher';
        feedback.textContent = '⚠️ Please enter a valid number between 0 and 100';
        feedback.classList.remove('hidden');
        return;
    }

    attempts++;
    document.getElementById('attempts').textContent = attempts;

    if (guess === targetNumber) {
        winGame();
    } else if (guess < targetNumber) {
        feedback.className = 'feedback lower';
        feedback.textContent = '📈 Too Low! Try a higher number';
        feedback.classList.remove('hidden');
    } else {
        feedback.className = 'feedback higher';
        feedback.textContent = '📉 Too High! Try a lower number';
        feedback.classList.remove('hidden');
    }

    input.value = '';
    input.focus();
}

function winGame() {
    document.getElementById('gameArea').classList.add('hidden');
    document.getElementById('resultArea').classList.remove('hidden');
    document.getElementById('finalAttempts').textContent = attempts;

    createBalloons();
}

function createBalloons() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'];
    const container = document.querySelector('.container');

    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const balloon = document.createElement('div');
            balloon.className = 'balloon';
            balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            balloon.style.left = Math.random() * 100 + '%';
            balloon.style.bottom = '0';
            container.appendChild(balloon);

            setTimeout(() => {
                balloon.remove();
            }, 3000);
        }, i * 200);
    }
}

function resetGame() {
    initGame();
}

document.getElementById('guessInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        checkGuess();
    }
});

initGame();