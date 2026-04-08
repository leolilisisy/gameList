const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 600;

const restartBtn = document.getElementById("restartBtn");
const scoreEl = document.getElementById("score");

let score = 0;
let ball = { x: canvas.width/2, y: 500, radius: 15, color: "red", dy: 0 };
let gravity = 0.6;
let jumpPower = -10;
let obstacles = [];
let gameOver = false;
let colors = ["red", "yellow", "blue", "green"];

function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

class Obstacle {
    constructor(y) {
        this.y = y;
        this.rotation = 0;
        this.radius = 80;
        this.thickness = 15;
        this.speed = 0.02 + Math.random()*0.02;
        this.colors = [randomColor(), randomColor(), randomColor(), randomColor()];
    }

    draw() {
        for(let i=0;i<4;i++){
            ctx.beginPath();
            ctx.strokeStyle = this.colors[i];
            ctx.lineWidth = this.thickness;
            ctx.arc(canvas.width/2, this.y, this.radius, i*Math.PI/2 + this.rotation, (i+1)*Math.PI/2 + this.rotation);
            ctx.stroke();
        }
    }

    update() {
        this.rotation += this.speed;
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.fillStyle = ball.color;
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fill();
}

function collisionCheck(ob) {
    let dx = ball.x - canvas.width/2;
    let dy = ball.y - ob.y;
    let distance = Math.sqrt(dx*dx + dy*dy);
    if(distance > ob.radius - ball.radius && distance < ob.radius + ball.radius){
        // Find which quarter the ball is in
        let angle = Math.atan2(dy, dx) - ob.rotation;
        if(angle < 0) angle += 2*Math.PI;
        let quarter = Math.floor(angle / (Math.PI/2));
        if(ob.colors[quarter] !== ball.color){
            endGame();
        }
    }
}

function endGame() {
    gameOver = true;
    restartBtn.style.display = "block";
}

function gameLoop() {
    if(gameOver) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ball.dy += gravity;
    ball.y += ball.dy;

    // Draw obstacles
    obstacles.forEach(ob => {
        ob.update();
        ob.draw();
        collisionCheck(ob);
    });

    // Spawn new obstacle
    if(obstacles.length === 0 || obstacles[obstacles.length-1].y > 200){
        obstacles.push(new Obstacle(-80));
    }

    // Remove offscreen obstacles
    obstacles = obstacles.filter(ob => ob.y < canvas.height + 100);

    // Move obstacles downward
    obstacles.forEach(ob => ob.y += 2);

    // Draw ball
    drawBall();

    // Ball falls below
    if(ball.y - ball.radius > canvas.height){
        endGame();
    }

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e)=>{
    if(e.code === "Space" && !gameOver){
        ball.dy = jumpPower;
    }
});

document.addEventListener("click", ()=>{
    if(!gameOver) ball.dy = jumpPower;
});

// Change ball color after passing an obstacle
function checkScore() {
    obstacles.forEach(ob => {
        if(!ob.passed && ball.y < ob.y){
            ob.passed = true;
            score++;
            ball.color = randomColor();
            scoreEl.textContent = score;
        }
    });
}

// Restart
restartBtn.addEventListener("click", ()=>{
    score = 0;
    ball = { x: canvas.width/2, y: 500, radius: 15, color: "red", dy: 0 };
    obstacles = [];
    gameOver = false;
    restartBtn.style.display = "none";
    scoreEl.textContent = score;
    gameLoop();
});

// Update score in loop
function loop() {
    if(!gameOver) checkScore();
    requestAnimationFrame(loop);
}

// Start game
gameLoop();
loop();
