const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const jumpSound = document.getElementById("jumpSound");
const hitSound = document.getElementById("hitSound");
const restartBtn = document.getElementById("restartBtn");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");

let gameSpeed = 5;
let gravity = 0.6;
let score = 0;
let highScore = localStorage.getItem("endlessRunnerHighScore") || 0;
let gameOver = false;
let obstacles = [];

highScoreEl.textContent = highScore;

// Runner
const player = {
  x: 80,
  y: 300,
  width: 50,
  height: 50,
  dy: 0,
  jumping: false,
  sliding: false,
  slideTimer: 0,

  draw() {
    ctx.fillStyle = "#ff5f5f";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  },

  update() {
    if (this.sliding) {
      this.height = 30;
      this.y = 320;
      this.slideTimer--;
      if (this.slideTimer <= 0) this.sliding = false;
    } else {
      this.height = 50;
    }

    this.y += this.dy;
    if (this.y + this.height < canvas.height - 30) {
      this.dy += gravity;
    } else {
      this.y = canvas.height - this.height - 30;
      this.dy = 0;
      this.jumping = false;
    }
    this.draw();
  },
};

// Background layers
const bgLayers = [
  { x: 0, speed: 1, color: "#b0e0e6" },
  { x: 0, speed: 2, color: "#87ceeb" },
  { x: 0, speed: 3, color: "#4682b4" },
];

function drawBackground() {
  bgLayers.forEach(layer => {
    ctx.fillStyle = layer.color;
    ctx.fillRect(layer.x, 0, canvas.width, canvas.height);
    ctx.fillRect(layer.x + canvas.width, 0, canvas.width, canvas.height);

    layer.x -= layer.speed;
    if (layer.x <= -canvas.width) layer.x = 0;
  });
}

// Obstacles
class Obstacle {
  constructor() {
    this.width = 40;
    this.height = Math.random() > 0.5 ? 40 : 60;
    this.x = canvas.width;
    this.y = canvas.height - this.height - 30;
    this.color = "#333";
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.x -= gameSpeed;
    this.draw();
  }
}

// Controls
document.addEventListener("keydown", (e) => {
  if ((e.code === "Space" || e.code === "ArrowUp") && !player.jumping) {
    player.dy = -12;
    player.jumping = true;
    jumpSound.play();
  }
  if (e.code === "ArrowDown" && !player.sliding && !player.jumping) {
    player.sliding = true;
    player.slideTimer = 25;
  }
});

// Game functions
function spawnObstacle() {
  if (Math.random() < 0.03) obstacles.push(new Obstacle());
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  player.update();

  obstacles.forEach((obstacle, index) => {
    obstacle.update();

    if (obstacle.x + obstacle.width < 0) {
      obstacles.splice(index, 1);
      score++;
      if (score % 10 === 0) gameSpeed += 0.5; // Increase difficulty
    }

    if (checkCollision(player, obstacle)) {
      hitSound.play();
      gameOver = true;
      restartBtn.classList.remove("hidden");

      if (score > highScore) {
        highScore = score;
        localStorage.setItem("endlessRunnerHighScore", highScore);
      }
    }
  });

  scoreEl.textContent = score;
  highScoreEl.textContent = highScore;

  spawnObstacle();

  if (!gameOver) requestAnimationFrame(update);
}

restartBtn.addEventListener("click", () => {
  obstacles = [];
  score = 0;
  gameSpeed = 5;
  player.y = 300;
  gameOver = false;
  restartBtn.classList.add("hidden");
  update();
});

update();
