const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreEl = document.getElementById("score");

// Game variables
let basket = { x: 220, y: 550, width: 60, height: 20, speed: 7 };
let snowflakes = [];
let score = 0;
let gameInterval;
let paused = false;

// Online image and sound links
const snowflakeImg = new Image();
snowflakeImg.src = "https://i.postimg.cc/J4Q76qfp/snowflake.png";

const basketImg = new Image();
basketImg.src = "https://i.postimg.cc/3x0RrxR0/basket.png";

const catchSound = new Audio("https://freesound.org/data/previews/341/341695_6240037-lq.mp3");
const missSound = new Audio("https://freesound.org/data/previews/522/522264_5634465-lq.mp3");

// Snowflake class
class Snowflake {
    constructor() {
        this.x = Math.random() * (canvas.width - 30);
        this.y = -30;
        this.size = Math.random() * 25 + 15;
        this.speed = Math.random() * 2 + 1;
    }
    draw() {
        ctx.drawImage(snowflakeImg, this.x, this.y, this.size, this.size);
    }
    update() {
        this.y += this.speed;
    }
}

// Draw basket
function drawBasket() {
    ctx.drawImage(basketImg, basket.x, basket.y, basket.width, basket.height);
}

// Detect collision
function detectCollision(snowflake) {
    if (
        snowflake.y + snowflake.size >= basket.y &&
        snowflake.x + snowflake.size >= basket.x &&
        snowflake.x <= basket.x + basket.width
    ) {
        return true;
    }
    return false;
}

// Draw and update game
function updateGame() {
    if (paused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBasket();

    // Add new snowflake
    if (Math.random() < 0.03) {
        snowflakes.push(new Snowflake());
    }

    snowflakes.forEach((s, i) => {
        s.update();
        s.draw();

        if (detectCollision(s)) {
            snowflakes.splice(i, 1);
            score++;
            catchSound.play();
            scoreEl.textContent = "Score: " + score;
        } else if (s.y > canvas.height) {
            snowflakes.splice(i, 1);
            score = Math.max(0, score - 1);
            missSound.play();
            scoreEl.textContent = "Score: " + score;
        }
    });

    requestAnimationFrame(updateGame);
}

// Basket movement
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && basket.x > 0) basket.x -= basket.speed;
    if (e.key === "ArrowRight" && basket.x + basket.width < canvas.width) basket.x += basket.speed;
});

// Buttons
startBtn.addEventListener("click", () => {
    paused = false;
    updateGame();
});
pauseBtn.addEventListener("click", () => (paused = true));
restartBtn.addEventListener("click", () => {
    snowflakes = [];
    score = 0;
    scoreEl.textContent = "Score: " + score;
    paused = false;
    basket.x = 220;
    updateGame();
});
