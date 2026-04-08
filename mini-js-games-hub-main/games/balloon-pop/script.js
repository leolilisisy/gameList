const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('score');
let score = 0;


const balloonGradients = [
    "radial-gradient(circle at 35% 25%, #ff5f87, #ff2e63)", // red
    "radial-gradient(circle at 35% 25%, #6BCBFF, #007ACC)", // blue
    "radial-gradient(circle at 35% 25%, #FFD93D, #FFB800)", // yellow
    "radial-gradient(circle at 35% 25%, #8AFF7A, #00CC44)", // green
    "radial-gradient(circle at 35% 25%, #C68AFF, #8A00CC)"  // purple
];

function createBalloon() {
    const balloon = document.createElement('div');
    balloon.classList.add('balloon');

    // Random gradient color
    const randomColor = balloonGradients[Math.floor(Math.random() * balloonGradients.length)];
    balloon.style.setProperty('--balloon-color', randomColor);

    // Random horizontal position
    balloon.style.left = Math.random() * (gameArea.offsetWidth - 60) + 'px';

    // Click to pop
    balloon.addEventListener('click', () => {
        score++;
        scoreEl.textContent = score;
        popAnimation(balloon);
        createConfetti(balloon);
    });

    balloon.addEventListener('animationend', () => balloon.remove());

    gameArea.appendChild(balloon);
}

// Pop animation
function popAnimation(balloon) {
    balloon.style.transform = "scale(1.5)";
    balloon.style.opacity = 0;
    setTimeout(() => balloon.remove(), 150);
}

// Pixel confetti
function createConfetti(balloon) {
    for (let i = 0; i < 4; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '6px';
        confetti.style.height = '6px';
        confetti.style.background = balloonGradients[Math.floor(Math.random() * balloonGradients.length)];
        confetti.style.left = (balloon.offsetLeft + 20 + Math.random() * 10) + 'px';
        confetti.style.top = (balloon.offsetTop + 20) + 'px';
        confetti.style.transition = 'all 0.6s linear';
        confetti.style.borderRadius = '0%';

        gameArea.appendChild(confetti);

        setTimeout(() => {
            confetti.style.top = (balloon.offsetTop - Math.random() * 100) + 'px';
            confetti.style.left = (balloon.offsetLeft + (Math.random() - 0.5) * 60) + 'px';
            confetti.style.opacity = 0;
        }, 10);

        setTimeout(() => confetti.remove(), 600);
    }
}

setInterval(createBalloon, 2500);
