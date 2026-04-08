const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const input = document.getElementById('word-input');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');

const words = ['apple', 'banana', 'cat', 'dog', 'elephant', 'fish', 'grape', 'house', 'ice', 'jungle', 'kite', 'lemon', 'mouse', 'nest', 'orange', 'penguin', 'queen', 'rabbit', 'sun', 'tree', 'umbrella', 'violet', 'water', 'xylophone', 'yellow', 'zebra'];

let currentWords = [];
let score = 0;
let time = 30;
let gameRunning = true;

function addWord() {
    const word = words[Math.floor(Math.random() * words.length)];
    const x = Math.random() * (canvas.width - 100);
    const y = Math.random() * (canvas.height - 50) + 50;
    currentWords.push({ word, x, y });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    currentWords.forEach(w => {
        ctx.fillText(w.word, w.x, w.y);
    });
}

function updateTimer() {
    timerDisplay.textContent = `Time: ${time}`;
    if (time <= 0) {
        gameRunning = false;
        input.disabled = true;
        alert(`Time's up! Final score: ${score}`);
    } else {
        time--;
    }
}

function checkInput() {
    const typed = input.value.trim().toLowerCase();
    const index = currentWords.findIndex(w => w.word.toLowerCase() === typed);
    if (index !== -1) {
        currentWords.splice(index, 1);
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        addWord();
        input.value = '';
    }
}

input.addEventListener('input', checkInput);

// Initialize
for (let i = 0; i < 5; i++) {
    addWord();
}
draw();

setInterval(() => {
    if (gameRunning) {
        updateTimer();
        draw();
    }
}, 1000);