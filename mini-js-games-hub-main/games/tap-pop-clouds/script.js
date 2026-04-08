const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 400;

let score = 0;
let lives = 3;
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const restartBtn = document.getElementById('restart-btn');

class Cloud {
  constructor() {
    this.width = 80 + Math.random() * 40;
    this.height = 50 + Math.random() * 20;
    this.x = Math.random() * (canvas.width - this.width);
    this.y = canvas.height + this.height;
    this.speed = 1 + Math.random() * 2;
    this.color = '#fff';
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(this.x + this.width/2, this.y, this.width/2, this.height/2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    this.y -= this.speed;
    if(this.y + this.height < 0) {
      lives--;
      livesEl.textContent = lives;
      this.reset();
    }
  }

  reset() {
    this.width = 80 + Math.random() * 40;
    this.height = 50 + Math.random() * 20;
    this.x = Math.random() * (canvas.width - this.width);
    this.y = canvas.height + this.height;
    this.speed = 1 + Math.random() * 2;
  }

  isClicked(mouseX, mouseY) {
    const dx = mouseX - (this.x + this.width / 2);
    const dy = mouseY - this.y;
    return (dx*dx)/(this.width*this.width/4) + (dy*dy)/(this.height*this.height/4) <= 1;
  }
}

const clouds = [];
for(let i=0;i<5;i++) clouds.push(new Cloud());

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  clouds.forEach(cloud => cloud.draw());
}

function update() {
  clouds.forEach(cloud => cloud.update());
}

function gameLoop() {
  draw();
  update();
  if(lives > 0) requestAnimationFrame(gameLoop);
  else alert(`Game Over! Your score: ${score}`);
}

canvas.addEventListener('click', (e)=>{
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  clouds.forEach(cloud => {
    if(cloud.isClicked(mouseX, mouseY)) {
      score++;
      scoreEl.textContent = score;
      cloud.reset();
    }
  });
});

restartBtn.addEventListener('click', ()=>{
  score = 0;
  lives = 3;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  clouds.forEach(c => c.reset());
  gameLoop();
});

// Start game
gameLoop();
