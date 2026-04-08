const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Game state
let ballRadius = 6;
let x = WIDTH / 2;
let y = HEIGHT - 30;
let dx = 2.5;
let dy = -2.5;

let paddleHeight = 8;
let paddleWidth = 80;
let paddleX = (WIDTH - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

let brickRowCount = 5;
let brickColumnCount = 7;
let brickWidth = 56;
let brickHeight = 16;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 20;

let score = 0;
let lives = 3;

let bricks = [];
let running = false;
let animationId = null;

function initBricks(){
  bricks = [];
  for(let c=0;c<brickColumnCount;c++){
    bricks[c]=[];
    for(let r=0;r<brickRowCount;r++){
      bricks[c][r] = { x:0, y:0, status:1 };
    }
  }
}

function reset(){
  x = WIDTH / 2;
  y = HEIGHT - 30;
  dx = 2.5 * (Math.random() > 0.5 ? 1 : -1);
  dy = -2.5;
  paddleWidth = 80;
  paddleX = (WIDTH - paddleWidth) / 2;
  score = 0;
  lives = 3;
  initBricks();
  updateUI();
}

function start(){
  if(running) cancelAnimationFrame(animationId);
  reset();
  running = true;
  loop();
}

function updateUI(){
  scoreEl.textContent = 'Score: ' + score;
  livesEl.textContent = 'Lives: ' + lives;
}

function drawBall(){
  ctx.beginPath();
  ctx.arc(x,y,ballRadius,0,Math.PI*2);
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.closePath();
}

function drawPaddle(){
  ctx.beginPath();
  ctx.rect(paddleX, HEIGHT - paddleHeight - 6, paddleWidth, paddleHeight);
  ctx.fillStyle = '#06d6a0';
  ctx.fill();
  ctx.closePath();
}

function drawBricks(){
  for(let c=0;c<brickColumnCount;c++){
    for(let r=0;r<brickRowCount;r++){
      if(bricks[c][r].status==1){
        let brickX = c*(brickWidth+brickPadding)+brickOffsetLeft;
        let brickY = r*(brickHeight+brickPadding)+brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        const hue = 200 - r*20;
        ctx.fillStyle = `hsl(${hue} 60% 55%)`;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.stroke();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection(){
  for(let c=0;c<brickColumnCount;c++){
    for(let r=0;r<brickRowCount;r++){
      let b = bricks[c][r];
      if(b.status==1){
        if(x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight){
          dy = -dy;
          b.status = 0;
          score += 10;
          updateUI();
          if(checkWin()){
            running = false;
            cancelAnimationFrame(animationId);
            setTimeout(()=>{alert('You win!');},50);
          }
        }
      }
    }
  }
}

function checkWin(){
  for(let c=0;c<brickColumnCount;c++){
    for(let r=0;r<brickRowCount;r++){
      if(bricks[c][r].status==1) return false;
    }
  }
  return true;
}

function draw(){
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();
}

function update(){
  // movement
  if(rightPressed){
    paddleX += 6;
    if (paddleX + paddleWidth > WIDTH) paddleX = WIDTH - paddleWidth;
  } else if(leftPressed){
    paddleX -= 6;
    if (paddleX < 0) paddleX = 0;
  }

  x += dx;
  y += dy;

  // wall collisions
  if(x + dx > WIDTH - ballRadius || x + dx < ballRadius){
    dx = -dx;
  }
  if(y + dy < ballRadius){
    dy = -dy;
  } else if(y + dy > HEIGHT - ballRadius - paddleHeight - 6){
    // check paddle
    if(x > paddleX && x < paddleX + paddleWidth){
      // add a bit of spin based on where it hit the paddle
      let hitPos = (x - (paddleX + paddleWidth/2)) / (paddleWidth/2);
      dx = dx + hitPos * 1.5;
      dy = -Math.abs(dy);
    } else if(y + dy > HEIGHT - ballRadius){
      lives--;
      updateUI();
      if(!lives){
        running = false;
        cancelAnimationFrame(animationId);
        setTimeout(()=>{alert('Game Over');},50);
        return;
      } else {
        x = WIDTH/2;
        y = HEIGHT-30;
        dx = 2.5 * (Math.random() > 0.5 ? 1 : -1);
        dy = -2.5;
        paddleX = (WIDTH - paddleWidth)/2;
      }
    }
  }
}

function loop(){
  draw();
  update();
  if(running) animationId = requestAnimationFrame(loop);
}

// Input handlers
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
  else if(e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
});
document.addEventListener('keyup', (e)=>{
  if(e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
  else if(e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
});

// mouse move
document.addEventListener('mousemove', (e)=>{
  const rect = canvas.getBoundingClientRect();
  const clientX = e.clientX - rect.left;
  paddleX = clientX - paddleWidth/2;
  if(paddleX < 0) paddleX = 0;
  if(paddleX + paddleWidth > WIDTH) paddleX = WIDTH - paddleWidth;
});

startBtn.addEventListener('click', start);

// initialize
initBricks();
updateUI();

// Auto-start a paused demo state: draw once
draw();
