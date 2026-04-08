const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const collectSound = document.getElementById("collectSound");
const hitSound = document.getElementById("hitSound");
const bgMusic = document.getElementById("bgMusic");

let orb = { x: 400, y: 250, radius: 15, speed: 4 };
let keys = {};
let score = 0;
let best = localStorage.getItem("orbBestScore") || 0;
let paused = false;

document.getElementById("best").textContent = best;

const dots = [];
const obstacles = [];

function randomPos(max) {
  return Math.floor(Math.random() * (max - 50)) + 25;
}

// Create glowing collectible dots
for (let i = 0; i < 8; i++) {
  dots.push({ x: randomPos(canvas.width), y: randomPos(canvas.height), radius: 10 });
}

// Create obstacles
for (let i = 0; i < 4; i++) {
  obstacles.push({ x: randomPos(canvas.width), y: randomPos(canvas.height), size: 50 });
}

// Controls
window.addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

document.getElementById("pauseBtn").addEventListener("click", () => {
  paused = !paused;
  if (paused) {
    bgMusic.pause();
  } else {
    bgMusic.play();
    update();
  }
});

document.getElementById("restartBtn").addEventListener("click", restartGame);

function restartGame() {
  orb = { x: 400, y: 250, radius: 15, speed: 4 };
  score = 0;
  paused = false;
  dots.forEach((dot) => {
    dot.x = randomPos(canvas.width);
    dot.y = randomPos(canvas.height);
  });
  bgMusic.currentTime = 0;
  bgMusic.play();
  update();
}

function moveOrb() {
  if (keys["arrowup"] || keys["w"]) orb.y -= orb.speed;
  if (keys["arrowdown"] || keys["s"]) orb.y += orb.speed;
  if (keys["arrowleft"] || keys["a"]) orb.x -= orb.speed;
  if (keys["arrowright"] || keys["d"]) orb.x += orb.speed;

  orb.x = Math.max(orb.radius, Math.min(canvas.width - orb.radius, orb.x));
  orb.y = Math.max(orb.radius, Math.min(canvas.height - orb.radius, orb.y));
}

function drawOrb() {
  const gradient = ctx.createRadialGradient(orb.x, orb.y, 5, orb.x, orb.y, 20);
  gradient.addColorStop(0, "rgba(0,255,150,1)");
  gradient.addColorStop(1, "rgba(0,255,150,0)");
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.closePath();
}

function drawDots() {
  dots.forEach((dot) => {
    const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, 10);
    gradient.addColorStop(0, "rgba(255,255,0,1)");
    gradient.addColorStop(1, "rgba(255,255,0,0)");
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  });
}

function drawObstacles() {
  obstacles.forEach((ob) => {
    ctx.fillStyle = "rgba(255,0,0,0.5)";
    ctx.fillRect(ob.x, ob.y, ob.size, ob.size);
  });
}

function detectCollisions() {
  // Collect dots
  dots.forEach((dot) => {
    const dx = orb.x - dot.x;
    const dy = orb.y - dot.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < orb.radius + dot.radius) {
      score += 10;
      document.getElementById("score").textContent = score;
      collectSound.currentTime = 0;
      collectSound.play();
      dot.x = randomPos(canvas.width);
      dot.y = randomPos(canvas.height);
    }
  });

  // Hit obstacle
  obstacles.forEach((ob) => {
    if (
      orb.x + orb.radius > ob.x &&
      orb.x - orb.radius < ob.x + ob.size &&
      orb.y + orb.radius > ob.y &&
      orb.y - orb.radius < ob.y + ob.size
    ) {
      hitSound.play();
      restartGame();
    }
  });
}

function update() {
  if (paused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  moveOrb();
  detectCollisions();
  drawDots();
  drawObstacles();
  drawOrb();

  if (score > best) {
    best = score;
    localStorage.setItem("orbBestScore", best);
    document.getElementById("best").textContent = best;
  }

  requestAnimationFrame(update);
}

bgMusic.volume = 0.3;
bgMusic.play();
update();
