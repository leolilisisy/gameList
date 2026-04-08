const bulbs = Array.from(document.querySelectorAll('.bulb'));
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const messageEl = document.getElementById('message');

const successSound = document.getElementById('success-sound');
const failSound = document.getElementById('fail-sound');

let sequence = [];
let userSequence = [];
let interval;
let running = false;

function generateSequence(length = 5) {
    const colors = ['#0ff', '#f0f', '#ff0', '#f00', '#0f0'];
    return Array.from({ length }, () => colors[Math.floor(Math.random() * colors.length)]);
}

function showSequence(seq) {
    let i = 0;
    interval = setInterval(() => {
        if (i > 0) bulbs[i-1].style.backgroundColor = '#222';
        if (i >= seq.length) {
            clearInterval(interval);
            running = true;
            messageEl.textContent = "Your turn: reproduce the sequence!";
            return;
        }
        bulbs[i].style.backgroundColor = seq[i];
        bulbs[i].classList.add('active');
        i++;
    }, 700);
}

function resetBulbs() {
    bulbs.forEach(b => {
        b.style.backgroundColor = '#222';
        b.classList.remove('active');
    });
}

bulbs.forEach((bulb, idx) => {
    bulb.addEventListener('click', () => {
        if (!running) return;
        const color = sequence[userSequence.length];
        bulb.style.backgroundColor = color;
        userSequence.push(color);
        if (userSequence[userSequence.length-1] !== sequence[userSequence.length-1]) {
            failSound.play();
            messageEl.textContent = "Wrong sequence! Try again.";
            running = false;
        } else if (userSequence.length === sequence.length) {
            successSound.play();
            messageEl.textContent = "Unlocked! 🎉";
            running = false;
        }
    });
});

startBtn.addEventListener('click', () => {
    sequence = generateSequence();
    userSequence = [];
    resetBulbs();
    showSequence(sequence);
});

pauseBtn.addEventListener('click', () => {
    clearInterval(interval);
    running = false;
    messageEl.textContent = "Paused";
});

restartBtn.addEventListener('click', () => {
    clearInterval(interval);
    sequence = generateSequence();
    userSequence = [];
    resetBulbs();
    messageEl.textContent = "Sequence restarted!";
    showSequence(sequence);
});
