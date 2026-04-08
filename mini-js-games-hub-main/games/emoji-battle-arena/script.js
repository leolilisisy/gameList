const arena = document.querySelector('.arena');
const p1 = document.getElementById('player1');
const p2 = document.getElementById('player2');
const p1HealthBar = document.getElementById('p1-health');
const p2HealthBar = document.getElementById('p2-health');
const winnerText = document.getElementById('winner');

let player1 = { x: 50, y: 50, health: 100, width: 50, height: 50 };
let player2 = { x: 700, y: 50, health: 100, width: 50, height: 50 };
const speed = 5;
const damage = 10;

const keys = {};

// Keyboard events
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

function movePlayers() {
  // Player 1 controls: WASD
  if(keys['w'] && player1.y > 0) player1.y -= speed;
  if(keys['s'] && player1.y < arena.clientHeight - player1.height) player1.y += speed;
  if(keys['a'] && player1.x > 0) player1.x -= speed;
  if(keys['d'] && player1.x < arena.clientWidth - player1.width) player1.x += speed;

  // Player 2 controls: Arrow keys
  if(keys['ArrowUp'] && player2.y > 0) player2.y -= speed;
  if(keys['ArrowDown'] && player2.y < arena.clientHeight - player2.height) player2.y += speed;
  if(keys['ArrowLeft'] && player2.x > 0) player2.x -= speed;
  if(keys['ArrowRight'] && player2.x < arena.clientWidth - player2.width) player2.x += speed;

  // Update positions
  p1.style.left = player1.x + 'px';
  p1.style.bottom = player1.y + 'px';
  p2.style.left = player2.x + 'px';
  p2.style.bottom = player2.y + 'px';
}

function attack() {
  // Player 1 attack: 'f'
  if(keys['f'] && checkCollision(player1, player2)) player2.health -= damage;
  // Player 2 attack: 'm'
  if(keys['m'] && checkCollision(player2, player1)) player1.health -= damage;

  // Update health bars
  p1HealthBar.style.width = player1.health * 2 + 'px';
  p2HealthBar.style.width = player2.health * 2 + 'px';

  checkWinner();
}

function checkCollision(a, b) {
  return !(
    a.x + a.width < b.x ||
    a.x > b.x + b.width ||
    a.y + a.height < b.y ||
    a.y > b.y + b.height
  );
}

function checkWinner() {
  if(player1.health <= 0) {
    winnerText.style.display = 'block';
    winnerText.textContent = "Player 2 Wins! 🏆";
    stopGame();
  } else if(player2.health <= 0) {
    winnerText.style.display = 'block';
    winnerText.textContent = "Player 1 Wins! 🏆";
    stopGame();
  }
}

let gameInterval;
function startGame() {
  gameInterval = setInterval(() => {
    movePlayers();
    attack();
  }, 30);
}

function stopGame() {
  clearInterval(gameInterval);
}

// Start game
startGame();
