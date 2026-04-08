const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreDisplay = document.getElementById("scoreDisplay");

const nectarSound = document.getElementById("nectarSound");
const hitSound = document.getElementById("hitSound");
const bgMusic = document.getElementById("bgMusic");

let butterflyImg = new Image();
butterflyImg.src = "https://cdn.pixabay.com/photo/2016/03/31/19/58/butterfly-1293839_1280.png";

let flowerImg = new Image();
flowerImg.src = "https://cdn.pixabay.com/photo/2013/07/13/13/40/flower-161142_1280.png";

let beeImg = new Image();
beeImg.src = "https://cdn.pixabay.com/photo/2014/04/02/14/09/bee-306757_1280.png";

let butterfly = { x: 100, y: 250, size: 50, speed: 4 };
let flowers = [];
let bees = [];
let score = 0;
let gameRunning = false;
let gamePaused = false;
let frame = 0;

function drawButterfly() {
  ctx.drawImage(butterflyImg, butterfly.x, butterfly.y, butterfly.size, butterfly.size);
}

function createFlower() {
  flowers.push({ x: 800, y: Math.random() * 450, size: 40 });
}

function createBee() {
  bees.push({ x: 800, y: Math.random() * 450, size: 40 });
}

function drawFlowers() {
  flowers.forEach((f, i) => {
    f.x -= 3;
    ctx.drawImage(flowerImg, f.x, f.y, f.size, f.size);
    if (f.x < -50) flowers.splice(i, 1);
  });
}

function drawBees() {
  bees.forEach((b, i) => {
    b.x -= 5;
    ctx.drawImage(beeImg, b.x, b.y, b.size, b.size);
    if (b.x < -50) bees.splice(i, 1);
  });
}

function moveButterfly(e) {
  if (e.key === "ArrowUp" && butterfly.y > 0) butterfly.y -= butterfly.speed * 3;
  if (e.key === "ArrowDown" && butterfly.y < canvas.height - butterfly.size) butterfly.y += butterfly.speed * 3;
  if (e.key === "ArrowLeft" && butterfly.x > 0) butterfly.x -= butterfly.speed * 3;
  if (e.key === "ArrowRight" && butterfly.x < canvas.width - butterfly.size) butterfly.x += butterfly.speed * 3;
}

function detectCollisions() {
  flowers.forEach((f, i) => {
    if (Math.abs(butterfly.x - f.x) < 30 && Math.abs(butterfly.y - f.y) < 30) {
      nectarSound.currentTime = 0;
      nectarSound.play();
      flowers.splice(i, 1);
      score += 10;
      scoreDisplay.textContent = `Score: ${score}`;
    }
  });

  bees.forEach((b, i) => {
    if (Math.abs(butterfly.x - b.x) < 30 && Math.abs(butterfly.y - b.y) < 30) {
      hitSound.currentTime = 0;
      hitSound.play();
      stopGame();
      alert("💀 You hit a bee! Game Over. Final Score: " + score);
    }
  });
}

function gameLoop() {
  if (!gameRunning || gamePaused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawButterfly();
  drawFlowers();
  drawBees();
  detectCollisions();

  frame++;
  if (frame % 60 === 0) createFlower();
  if (frame % 150 === 0) createBee();

  requestAnimationFrame(gameLoop);
}

function startGame() {
  if (!gameRunning) {
    gameRunning = true;
    bgMusic.play();
    requestAnimationFrame(gameLoop);
  }
  gamePaused = false;
}

function pauseGame() {
  gamePaused = true;
  bgMusic.pause();
}

function stopGame() {
  gameRunning = false;
  bgMusic.pause();
}

function restartGame() {
  flowers = [];
  bees = [];
  score = 0;
  butterfly.x = 100;
  butterfly.y = 250;
  scoreDisplay.textContent = "Score: 0";
  bgMusic.currentTime = 0;
  gameRunning = true;
  gamePaused = false;
  bgMusic.play();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", moveButterfly);
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", restartGame);
