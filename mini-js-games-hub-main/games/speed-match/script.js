const targetSymbolEl = document.getElementById("target-symbol");
const playArea = document.getElementById("play-area");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");

const hitSound = document.getElementById("hit-sound");
const missSound = document.getElementById("miss-sound");

let symbols = ["🍎","🍌","🍇","🍓","🍒","🍉","🥝","🍍"];
let currentTarget = "";
let score = 0;
let combo = 0;
let timeLeft = 30;
let gameInterval;
let countdownInterval;
let isPaused = false;

function pickTarget() {
    currentTarget = symbols[Math.floor(Math.random() * symbols.length)];
    targetSymbolEl.textContent = currentTarget;
}

function generateSymbols() {
    playArea.innerHTML = "";
    let shuffled = [...symbols].sort(() => 0.5 - Math.random());
    shuffled.forEach(sym => {
        const div = document.createElement("div");
        div.textContent = sym;
        div.className = "symbol";
        div.addEventListener("click", () => handleClick(sym));
        playArea.appendChild(div);
    });
}

function handleClick(symbol) {
    if (isPaused) return;
    if(symbol === currentTarget) {
        score++;
        combo++;
        scoreEl.textContent = score;
        comboEl.textContent = combo;
        hitSound.currentTime = 0;
        hitSound.play();
        pickTarget();
        generateSymbols();
    } else {
        combo = 0;
        comboEl.textContent = combo;
        missSound.currentTime = 0;
        missSound.play();
    }
}

function startGame() {
    if(gameInterval) clearInterval(gameInterval);
    if(countdownInterval) clearInterval(countdownInterval);
    isPaused = false;
    score = 0;
    combo = 0;
    timeLeft = 30;
    scoreEl.textContent = score;
    comboEl.textContent = combo;
    timerEl.textContent = timeLeft;
    pickTarget();
    generateSymbols();
    countdownInterval = setInterval(() => {
        if(!isPaused) {
            timeLeft--;
            timerEl.textContent = timeLeft;
            if(timeLeft <= 0) {
                clearInterval(countdownInterval);
                alert(`Time's up! Final Score: ${score}`);
            }
        }
    }, 1000);
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", () => { isPaused = !isPaused; });
restartBtn.addEventListener("click", startGame);
