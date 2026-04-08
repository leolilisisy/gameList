const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

const player = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  width: 10,
  height: 50,
  color: '#00ffff',
  speed: 5,
  dx: 0,
  dy: 0,
};

let obstacles = [];
let score = 0;
let gameOver = false;
let frame = 0;

// Control
document.addEventListener('keydown', move);
document.addEventListener('keyup', stop);
canvas.addEventListener('mousemove', mouseControl);
restartBtn.addEventListener('click', restartGame);

function move(e) {
  if (e.key === 'ArrowLeft') player.dx = -player.speed;
  if (e.key === 'ArrowRight') player.dx = player.speed;
  if (e.key === 'ArrowUp') player.dy = -player.speed;
  if (e.key === 'ArrowDown') player.dy = player.speed;
}

function stop(e) {
  if (
    ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
  ) {
    player.dx = 0;
    player.dy = 0;
  }
}

function mouseControl(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  player.x = mouseX - player.width / 2;
}

// Obstacle generation
function generateObstacle() {
  const width = Math.random() * 100 + 50;
  const x = Math.random() * (canvas.width - width);
  const y = -30;
  const speed = Math.random() * 2 + 2;
  obstacles.push({ x, y, width, height: 20, speed, color: '#ff007f' });
}

// Draw player
function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Draw obstacles
function drawObstacles() {
  obstacles.forEach((ob) => {
    ctx.fillStyle = ob.color;
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
  });
}

// Move player & obstacles
function updatePositions() {
  player.x += player.dx;
  player.y += player.dy;

  // Boundaries
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width)
    player.x = canvas.width - player.width;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height)
    player.y = canvas.height - player.height;

  obstacles.forEach((ob) => (ob.y += ob.speed));
  obstacles = obstacles.filter((ob) => ob.y < canvas.height + 20);
}

// Collision detection
function detectCollision() {
  for (let ob of obstacles) {
    if (
      player.x < ob.x + ob.width &&
      player.x + player.width > ob.x &&
      player.y < ob.y + ob.height &&
      player.y + player.height > ob.y
    ) {
      gameOver = true;
      return true;
    }
  }
  return false;
}

// Update Score
function updateScore() {
  if (!gameOver) {
    score++;
    scoreEl.textContent = score;
  }
}

// Restart
function restartGame() {
  score = 0;
  obstacles = [];
  frame = 0;
  gameOver = false;
  player.x = canvas.width / 2;
  player.y = canvas.height - 60;
  loop();
}

// Main game loop
function loop() {
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '30px Poppins';
    ctx.fillText('💀 Game Over', canvas.width / 2 - 100, canvas.height / 2);
    ctx.font = '18px Poppins';
    ctx.fillText('Press Restart to Play Again', canvas.width / 2 - 120, canvas.height / 2 + 40);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawObstacles();
  updatePositions();

  if (frame % 60 === 0) generateObstacle();
  detectCollision();
  updateScore();

  frame++;
  requestAnimationFrame(loop);
}

// Start
loop();
