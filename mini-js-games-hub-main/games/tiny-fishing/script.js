const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.7;

const startBtn = document.getElementById("startBtn");
const upgradeDepth = document.getElementById("upgradeDepth");
const upgradeHooks = document.getElementById("upgradeHooks");

const coinsEl = document.getElementById("coins");
const depthEl = document.getElementById("depth");
const hooksEl = document.getElementById("hooks");

let coins = 0;
let depth = 100;
let hooks = 1;
let fishing = false;
let lineY = 0;
let direction = "down";
let fishes = [];

class Fish {
  constructor(x, y, size, speed, value, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.value = value;
    this.color = color;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 1.5, this.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.x - this.size, this.y);
    ctx.lineTo(this.x - this.size - 10, this.y - 5);
    ctx.lineTo(this.x - this.size - 10, this.y + 5);
    ctx.closePath();
    ctx.fill();
  }

  update() {
    this.x += this.speed;
    if (this.x > canvas.width + 50) this.x = -50;
    if (this.x < -50) this.x = canvas.width + 50;
  }
}

function generateFish() {
  fishes = [];
  for (let i = 0; i < 10; i++) {
    const size = Math.random() * 15 + 10;
    const y = Math.random() * canvas.height;
    const x = Math.random() * canvas.width;
    const speed = (Math.random() - 0.5) * 2;
    const value = Math.floor(size);
    const colors = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    fishes.push(new Fish(x, y, size, speed, value, color));
  }
}

let hookX = canvas.width / 2;
let hookY = 0;
let caughtFish = [];

function drawLine() {
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(hookX, hookY);
  ctx.stroke();
}

function drawHook() {
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(hookX, hookY, 5, 0, Math.PI * 2);
  ctx.fill();
}

function detectCatch() {
  fishes.forEach((fish, index) => {
    const dx = hookX - fish.x;
    const dy = hookY - fish.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < fish.size + 5 && caughtFish.length < hooks) {
      caughtFish.push(fish);
      fishes.splice(index, 1);
    }
  });
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background water waves
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#4ec0ca");
  gradient.addColorStop(1, "#023047");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  fishes.forEach((fish) => {
    fish.update();
    fish.draw();
  });

  drawLine();
  drawHook();

  if (fishing) {
    if (direction === "down") {
      hookY += 5;
      if (hookY > canvas.height - depth) {
        direction = "up";
      }
      detectCatch();
    } else {
      hookY -= 5;
      caughtFish.forEach((fish) => {
        fish.y = hookY + 10;
        fish.x = hookX;
        fish.draw();
      });
      if (hookY <= 0) {
        fishing = false;
        coins += caughtFish.reduce((sum, f) => sum + f.value, 0);
        coinsEl.textContent = coins;
        caughtFish = [];
        startBtn.disabled = false;
      }
    }
  }

  requestAnimationFrame(updateGame);
}

startBtn.addEventListener("click", () => {
  if (!fishing) {
    fishing = true;
    direction = "down";
    hookY = 0;
    caughtFish = [];
    startBtn.disabled = true;
  }
});

upgradeDepth.addEventListener("click", () => {
  if (coins >= 50) {
    coins -= 50;
    depth += 50;
    coinsEl.textContent = coins;
    depthEl.textContent = depth;
  }
});

upgradeHooks.addEventListener("click", () => {
  if (coins >= 100) {
    coins -= 100;
    hooks += 1;
    coinsEl.textContent = coins;
    hooksEl.textContent = hooks;
  }
});

generateFish();
updateGame();

window.addEventListener("mousemove", (e) => {
  if (fishing) {
    hookX = e.clientX - canvas.getBoundingClientRect().left;
  }
});
