const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.6;

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const levelDisplay = document.getElementById("levelDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");

const connectSound = document.getElementById("connectSound");
const levelUpSound = document.getElementById("levelUpSound");

let stars = []; 
let connections = [];
let obstacles = [];
let level = 1;
let score = 0;
let gameRunning = false;
let currentLine = null;

const STAR_RADIUS = 10;
const OBSTACLE_RADIUS = 20;
const LINE_WIDTH = 4;

// Initialize stars and obstacles
function setupLevel() {
    stars = [];
    obstacles = [];
    connections = [];
    currentLine = null;
    const numStars = 5 + level;
    for(let i=0;i<numStars;i++){
        stars.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: Math.random() * (canvas.height - 100) + 50,
            connected: false
        });
    }
    const numObstacles = Math.floor(level / 2);
    for(let i=0;i<numObstacles;i++){
        obstacles.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: Math.random() * (canvas.height - 100) + 50
        });
    }
    levelDisplay.textContent = `Level: ${level}`;
}

// Draw everything
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Draw obstacles
    obstacles.forEach(o=>{
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.globalAlpha = 0.6;
        ctx.arc(o.x,o.y,OBSTACLE_RADIUS,0,Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    // Draw stars
    stars.forEach(s=>{
        ctx.beginPath();
        ctx.fillStyle = s.connected ? "yellow" : "white";
        ctx.shadowColor = "yellow";
        ctx.shadowBlur = 20;
        ctx.arc(s.x,s.y,STAR_RADIUS,0,Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Draw connections
    connections.forEach(line=>{
        ctx.beginPath();
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = LINE_WIDTH;
        ctx.shadowColor = "cyan";
        ctx.shadowBlur = 15;
        ctx.moveTo(line.start.x,line.start.y);
        ctx.lineTo(line.end.x,line.end.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
    });

    // Draw current line
    if(currentLine){
        ctx.beginPath();
        ctx.strokeStyle = "lime";
        ctx.lineWidth = LINE_WIDTH;
        ctx.shadowColor = "lime";
        ctx.shadowBlur = 15;
        ctx.moveTo(currentLine.start.x,currentLine.start.y);
        ctx.lineTo(currentLine.end.x,currentLine.end.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

// Check if line intersects obstacle
function checkObstacleCollision(x1,y1,x2,y2){
    for(const o of obstacles){
        const dx = x2 - x1;
        const dy = y2 - y1;
        const t = ((o.x - x1)*dx + (o.y - y1)*dy) / (dx*dx + dy*dy);
        const nearestX = x1 + t*dx;
        const nearestY = y1 + t*dy;
        const dist = Math.hypot(nearestX - o.x, nearestY - o.y);
        if(dist < OBSTACLE_RADIUS + 2) return true;
    }
    return false;
}

// Mouse / touch events
let draggingStar = null;

canvas.addEventListener("mousedown", startLine);
canvas.addEventListener("touchstart", e=>startLine(e.touches[0]));

canvas.addEventListener("mousemove", moveLine);
canvas.addEventListener("touchmove", e=>moveLine(e.touches[0]));

canvas.addEventListener("mouseup", endLine);
canvas.addEventListener("touchend", endLine);

function startLine(e){
    if(!gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for(const s of stars){
        if(!s.connected && Math.hypot(s.x-x,s.y-y) < STAR_RADIUS+5){
            draggingStar = s;
            currentLine = {start:{x:s.x,y:s.y},end:{x:x,y:y}};
            break;
        }
    }
}

function moveLine(e){
    if(!draggingStar) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    currentLine.end.x = x;
    currentLine.end.y = y;
}

function endLine(e){
    if(!draggingStar) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - rect.left;
    const y = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - rect.top;
    for(const s of stars){
        if(s!==draggingStar && !s.connected && Math.hypot(s.x-x,s.y-y)<STAR_RADIUS+5){
            if(!checkObstacleCollision(draggingStar.x,draggingStar.y,s.x,s.y)){
                connections.push({start:{x:draggingStar.x,y:draggingStar.y}, end:{x:s.x,y:s.y}});
                draggingStar.connected = true;
                s.connected = true;
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
                connectSound.play();
                break;
            }
        }
    }
    draggingStar = null;
    currentLine = null;

    // Check level completion
    if(stars.every(s=>s.connected)){
        levelUpSound.play();
        level++;
        setupLevel();
    }
}

// Game loop
function loop(){
    draw();
    if(gameRunning) requestAnimationFrame(loop);
}

// Button events
startBtn.addEventListener("click", ()=>{
    gameRunning = true;
    loop();
});

pauseBtn.addEventListener("click", ()=>{
    gameRunning = false;
});

restartBtn.addEventListener("click", ()=>{
    gameRunning = true;
    score = 0;
    level = 1;
    scoreDisplay.textContent = `Score: ${score}`;
    setupLevel();
    loop();
});

// Init first level
setupLevel();
draw();
