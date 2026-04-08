const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let oxygen = 100;
let lives = 3;
let powerup = "None";
let isPaused = false;

// HUD elements
const scoreEl = document.getElementById("score");
const oxygenEl = document.getElementById("oxygen");
const livesEl = document.getElementById("lives");
const powerupEl = document.getElementById("powerup");

// Sounds
const collectSound = document.getElementById("collectSound");
const hitSound = document.getElementById("hitSound");
const powerupSound = document.getElementById("powerupSound");
const bgMusic = document.getElementById("bgMusic");

// Buttons
document.getElementById("pauseBtn").addEventListener("click", () => {
    isPaused = !isPaused;
});
document.getElementById("restartBtn").addEventListener("click", () => {
    restartGame();
});

// Diver
const diver = {
    x: 100,
    y: canvas.height / 2,
    width: 60,
    height: 60,
    vy: 0,
    color: "#FFD700",
    thrust: -0.7,
    gravity: 0.3
};

// Obstacles
const obstacles = [];
const pearls = [];

// Control
let up = false;
window.addEventListener("keydown", (e) => {
    if(e.key === "w" || e.key === "ArrowUp") up = true;
});
window.addEventListener("keyup", (e) => {
    if(e.key === "w" || e.key === "ArrowUp") up = false;
});
canvas.addEventListener("touchstart", ()=> up = true);
canvas.addEventListener("touchend", ()=> up = false);

function spawnObstacle() {
    const height = Math.random() * 150 + 50;
    obstacles.push({x: canvas.width, y: Math.random() * (canvas.height - height), width: 50, height, color: "#FF4500"});
}
function spawnPearl() {
    const y = Math.random() * (canvas.height - 30);
    pearls.push({x: canvas.width, y, radius: 15, color: "#00FFFF"});
}

let frame = 0;
function update() {
    if(isPaused) return;
    frame++;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Diver movement
    if(up) diver.vy += diver.thrust;
    diver.vy += diver.gravity;
    diver.y += diver.vy;
    diver.vy *= 0.9; // damping
    if(diver.y < 0) diver.y = 0;
    if(diver.y + diver.height > canvas.height) diver.y = canvas.height - diver.height;

    // Spawn obstacles
    if(frame % 150 === 0) spawnObstacle();
    if(frame % 200 === 0) spawnPearl();

    // Move obstacles
    obstacles.forEach((ob, i) => {
        ob.x -= 5;
        ctx.fillStyle = ob.color;
        ctx.fillRect(ob.x, ob.y, ob.width, ob.height);

        // Collision
        if(diver.x < ob.x + ob.width &&
           diver.x + diver.width > ob.x &&
           diver.y < ob.y + ob.height &&
           diver.y + diver.height > ob.y) {
            hitSound.play();
            lives--;
            obstacles.splice(i,1);
        }

        if(ob.x + ob.width < 0) obstacles.splice(i,1);
    });

    // Move pearls
    pearls.forEach((p, i) => {
        p.x -= 5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = "#00FFFF";
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Collect
        if(diver.x < p.x + p.radius &&
           diver.x + diver.width > p.x - p.radius &&
           diver.y < p.y + p.radius &&
           diver.y + diver.height > p.y - p.radius) {
            collectSound.play();
            score += 10;
            pearls.splice(i,1);
        }

        if(p.x + p.radius < 0) pearls.splice(i,1);
    });

    // Oxygen decreases
    if(frame % 60 === 0) oxygen -= 1;
    if(oxygen <= 0 || lives <= 0) {
        alert("Game Over! Score: " + score);
        restartGame();
    }

    // Draw diver
    ctx.fillStyle = diver.color;
    ctx.fillRect(diver.x, diver.y, diver.width, diver.height);

    // Update HUD
    scoreEl.textContent = score;
    oxygenEl.textContent = oxygen;
    livesEl.textContent = lives;
    powerupEl.textContent = powerup;

    requestAnimationFrame(update);
}

function restartGame() {
    score = 0;
    oxygen = 100;
    lives = 3;
    frame = 0;
    diver.y = canvas.height / 2;
    obstacles.length = 0;
    pearls.length = 0;
    isPaused = false;
}

update();
