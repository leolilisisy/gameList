const gameArea = document.getElementById("game-area");
const basket = document.getElementById("basket");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const restartBtn = document.getElementById("restart-btn");

let score = 0;
let lives = 3;
let basketX = 0;
let basketWidth = 80;
let basketSpeed = 20;
let emojis = ["🍎", "🍌", "🍒", "🍇", "💎"];
let targetEmoji = "🍎";
let fallInterval;
let gameInterval;

// Basket Movement
function moveBasket(direction) {
  basketX += direction * basketSpeed;
  if (basketX < 0) basketX = 0;
  if (basketX > gameArea.offsetWidth - basketWidth) basketX = gameArea.offsetWidth - basketWidth;
  basket.style.left = basketX + "px";
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") moveBasket(-1);
  if (e.key === "ArrowRight") moveBasket(1);
});

// Mouse / Touch Movement
gameArea.addEventListener("mousemove", e => {
  basketX = e.offsetX - basketWidth / 2;
  if (basketX < 0) basketX = 0;
  if (basketX > gameArea.offsetWidth - basketWidth) basketX = gameArea.offsetWidth - basketWidth;
  basket.style.left = basketX + "px";
});

// Falling Emoji Logic
function spawnEmoji() {
  const emoji = document.createElement("div");
  emoji.className = "emoji";
  emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  emoji.style.left = Math.random() * (gameArea.offsetWidth - 30) + "px";
  emoji.style.top = "0px";
  gameArea.appendChild(emoji);

  let speed = 2 + Math.random() * 3; // Random falling speed
  function fall() {
    let y = parseFloat(emoji.style.top);
    y += speed;
    emoji.style.top = y + "px";

    // Check collision
    if (
      y + 30 >= gameArea.offsetHeight - 30 &&
      parseFloat(emoji.style.left) + 30 > basketX &&
      parseFloat(emoji.style.left) < basketX + basketWidth
    ) {
      if (emoji.textContent === targetEmoji) score += 1;
      else lives -= 1;
      scoreEl.textContent = score;
      livesEl.textContent = lives;
      gameArea.removeChild(emoji);
    } else if (y > gameArea.offsetHeight) {
      gameArea.removeChild(emoji);
    }
    if (lives <= 0) endGame();
  }
  fallInterval = setInterval(fall, 20);
}

// Game Loop
function startGame() {
  score = 0;
  lives = 3;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  basketX = gameArea.offsetWidth / 2 - basketWidth / 2;
  basket.style.left = basketX + "px";

  gameInterval = setInterval(spawnEmoji, 1000); // spawn every 1s
}

function endGame() {
  clearInterval(gameInterval);
  alert("Game Over! Your score: " + score);
}

// Restart Game
restartBtn.addEventListener("click", () => {
  clearInterval(gameInterval);
  document.querySelectorAll(".emoji").forEach(e => e.remove());
  startGame();
});

// Start the game automatically
startGame();
