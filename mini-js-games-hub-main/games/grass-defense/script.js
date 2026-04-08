const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let coins = 100;
let lives = 10;
let wave = 1;
let enemies = [];
let plants = [];
let bullets = [];
let gameActive = false;
let selectedPlantType = null;

// DOM elements
const coinsDisplay = document.getElementById("coins");
const livesDisplay = document.getElementById("lives");
const waveDisplay = document.getElementById("wave");
const startWaveBtn = document.getElementById("startWave");

// Plant buttons
document.querySelectorAll(".plant-buttons button").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedPlantType = btn.dataset.type;
    document.querySelectorAll(".plant-buttons button").forEach(b => b.style.background = "#66bb6a");
    btn.style.background = "#2e7d32";
  });
});

// Start wave
startWaveBtn.addEventListener("click", () => {
  if (!gameActive) {
    startWave();
  }
});

// Handle canvas clicks to place plants
canvas.addEventListener("click", e => {
  if (!selectedPlantType) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / 60) * 60;
  const y = Math.floor((e.clientY - rect.top) / 60) * 60;

  if (coins >= 50 && !plants.some(p => p.x === x && p.y === y)) {
    coins -= 50;
    coinsDisplay.textContent = coins;
    plants.push({ x, y, type: selectedPlantType, cooldown: 0 });
  }
});

// Enemy generation
function spawnEnemies(num) {
  for (let i = 0; i < num; i++) {
    enemies.push({
      x: 900 + i * 80,
      y: Math.floor(Math.random() * 8) * 60,
      hp: 100 + wave * 20,
      speed: 1 + Math.random(),
    });
  }
}

// Game loop
function update() {
  if (!gameActive) return;

  // Update plants
  plants.forEach(p => {
    if (p.cooldown > 0) p.cooldown--;
    if (p.type === "shooter" && p.cooldown === 0) {
      bullets.push({ x: p.x + 50, y: p.y + 20, speed: 5, damage: 30 });
      p.cooldown = 50;
    }
  });

  // Update bullets
  bullets.forEach((b, i) => {
    b.x += b.speed;
    enemies.forEach((enemy, j) => {
      if (Math.abs(b.x - enemy.x) < 30 && Math.abs(b.y - enemy.y) < 30) {
        enemy.hp -= b.damage;
        bullets.splice(i, 1);
      }
    });
  });

  // Update enemies
  enemies.forEach((enemy, i) => {
    enemy.x -= enemy.speed;
    if (enemy.hp <= 0) {
      enemies.splice(i, 1);
      coins += 10;
      coinsDisplay.textContent = coins;
    } else if (enemy.x < 0) {
      enemies.splice(i, 1);
      lives--;
      livesDisplay.textContent = lives;
      if (lives <= 0) endGame();
    }
  });

  draw();
  if (enemies.length === 0) nextWave();
  requestAnimationFrame(update);
}

// Drawing
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = "#9ccc65";
  for (let i = 0; i < canvas.width; i += 60) {
    for (let j = 0; j < canvas.height; j += 60) {
      ctx.strokeRect(i, j, 60, 60);
    }
  }

  // Plants
  plants.forEach(p => {
    ctx.fillStyle = p.type === "shooter" ? "#43a047" : p.type === "slow" ? "#29b6f6" : "#ef5350";
    ctx.beginPath();
    ctx.arc(p.x + 30, p.y + 30, 20, 0, Math.PI * 2);
    ctx.fill();
  });

  // Enemies
  enemies.forEach(enemy => {
    ctx.fillStyle = "#6d4c41";
    ctx.fillRect(enemy.x, enemy.y + 20, 30, 20);
    ctx.fillStyle = "#d32f2f";
    ctx.fillRect(enemy.x, enemy.y + 10, enemy.hp / 2, 5);
  });

  // Bullets
  ctx.fillStyle = "#fdd835";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, 8, 4));
}

// Game control
function startWave() {
  gameActive = true;
  spawnEnemies(5 + wave * 2);
  update();
}

function nextWave() {
  gameActive = false;
  wave++;
  waveDisplay.textContent = wave;
  coins += 50;
}

function endGame() {
  gameActive = false;
  alert("Game Over! Your garden was destroyed 💀");
  location.reload();
}
