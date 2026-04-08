let score = 0;
let time = 20; // Game duration in seconds
let timer;
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const highScoreEl = document.getElementById("highScore");
const messageEl = document.getElementById("message");
const tapBtn = document.getElementById("tap-btn");
const restartBtn = document.getElementById("restart-btn");

// Get high score from localStorage
let highScore = localStorage.getItem("tapHighScore") || 0;
highScoreEl.textContent = highScore;

// Start the game timer
function startTimer() {
    timer = setInterval(() => {
        time--;
        timeEl.textContent = time;
        if(time <= 0) {
            endGame();
        }
    }, 1000);
}

// End the game
function endGame() {
    clearInterval(timer);
    tapBtn.disabled = true;
    messageEl.textContent = `⏰ Time's up! Your score: ${score}`;
    if(score > highScore) {
        localStorage.setItem("tapHighScore", score);
        highScoreEl.textContent = score;
        messageEl.textContent += " 🎉 New High Score!";
    }
}

// Handle tap button click
tapBtn.addEventListener("click", () => {
    if(time === 20 && score === 0) startTimer(); // Start timer on first tap
    score++;
    scoreEl.textContent = score;

    // Optional: button moves randomly for extra challenge
    const maxX = tapBtn.parentElement.offsetWidth - tapBtn.offsetWidth;
    const maxY = tapBtn.parentElement.offsetHeight - tapBtn.offsetHeight - 60; // padding
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);
    tapBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
});

// Restart game
restartBtn.addEventListener("click", () => {
    clearInterval(timer);
    score = 0;
    time = 20;
    scoreEl.textContent = score;
    timeEl.textContent = time;
    tapBtn.disabled = false;
    tapBtn.style.transform = `translate(0,0)`;
    messageEl.textContent = "";
});
