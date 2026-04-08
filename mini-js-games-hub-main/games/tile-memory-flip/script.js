const tileLine = document.getElementById("tile-line");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");

const flipSound = document.getElementById("flip-sound");
const matchSound = document.getElementById("match-sound");
const winSound = document.getElementById("win-sound");
const wrongSound = document.getElementById("wrong-sound");

let tiles = [];
let firstTile = null;
let secondTile = null;
let moves = 0;
let time = 0;
let timerInterval = null;
let isPaused = false;

// Online images (emoji icons)
const icons = ["🟦","🟩","🟥","🟨","🟪","🟧","🟫","⬛","⬜","🔵","🔴","🟢"];
let gameTiles = [];

// Initialize game
function initGame() {
    tileLine.innerHTML = "";
    moves = 0;
    time = 0;
    movesEl.textContent = moves;
    timeEl.textContent = time;
    firstTile = null;
    secondTile = null;
    isPaused = false;
    clearInterval(timerInterval);

    // Prepare pairs
    gameTiles = [...icons, ...icons].slice(0, 12); // 12 pairs = 24 tiles
    shuffle(gameTiles);

    gameTiles.forEach(icon => {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.innerHTML = `<div class="front">?</div><div class="back">${icon}</div>`;
        tile.addEventListener("click", flipTile);
        tileLine.appendChild(tile);
    });
}

function flipTile(e) {
    if (isPaused) return;
    const tile = e.currentTarget;
    if (tile.classList.contains("flipped")) return;

    tile.classList.add("flipped");
    flipSound.play();

    if (!firstTile) {
        firstTile = tile;
    } else {
        secondTile = tile;
        moves++;
        movesEl.textContent = moves;

        const firstIcon = firstTile.querySelector(".back").textContent;
        const secondIcon = secondTile.querySelector(".back").textContent;

        if (firstIcon === secondIcon) {
            matchSound.play();
            firstTile = null;
            secondTile = null;
            checkWin();
        } else {
            wrongSound.play();
            setTimeout(() => {
                firstTile.classList.remove("flipped");
                secondTile.classList.remove("flipped");
                firstTile = null;
                secondTile = null;
            }, 800);
        }
    }
}

function checkWin() {
    const allFlipped = [...document.querySelectorAll(".tile")].every(t => t.classList.contains("flipped"));
    if (allFlipped) {
        clearInterval(timerInterval);
        winSound.play();
        alert(`🎉 You won in ${moves} moves and ${time} seconds!`);
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isPaused) {
            time++;
            timeEl.textContent = time;
        }
    }, 1000);
}

// Buttons
startBtn.addEventListener("click", () => {
    isPaused = false;
    startTimer();
});

pauseBtn.addEventListener("click", () => {
    isPaused = true;
});

restartBtn.addEventListener("click", () => {
    initGame();
    startTimer();
});

// Initialize at load
initGame();
