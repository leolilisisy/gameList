const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bottleImg = new Image();
bottleImg.src = "https://i.ibb.co/4T7vNrd/bottle.png"; // online bottle image

const flipSound = new Audio("https://www.soundjay.com/button/sounds/button-16.mp3");
const successSound = new Audio("https://www.soundjay.com/button/sounds/button-10.mp3");
const failSound = new Audio("https://www.soundjay.com/button/sounds/button-09.mp3");

let gameRunning = false;
let score = 0;
let combo = 0;

let bottle = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 50,
    height: 80,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    isFlipping: false,
};

const gravity = 0.6;

function resetBottle() {
    bottle.x = canvas.width / 2 - 25;
    bottle.y = canvas.height - 80;
    bottle.vx = 0;
    bottle.vy = 0;
    bottle.angle = 0;
    bottle.angularVelocity = 0;
    bottle.isFlipping = false;
}

function drawBottle() {
    ctx.save();
    ctx.translate(bottle.x + bottle.width / 2, bottle.y + bottle.height / 2);
    ctx.rotate(bottle.angle);
    ctx.drawImage(bottleImg, -bottle.width / 2, -bottle.height / 2, bottle.width, bottle.height);
    ctx.restore();
}

function updateBottle() {
    if (bottle.isFlipping) {
        bottle.vy += gravity;
        bottle.x += bottle.vx;
        bottle.y += bottle.vy;
        bottle.angle += bottle.angularVelocity;

        // Check landing
        if (bottle.y + bottle.height >= canvas.height) {
            if (Math.abs(bottle.angle % (2 * Math.PI)) < 0.2) {
                score += 10 + combo * 5;
                combo++;
                successSound.play();
            } else {
                combo = 0;
                failSound.play();
            }
            bottle.isFlipping = false;
            bottle.vx = 0;
            bottle.vy = 0;
            bottle.angularVelocity = 0;
            bottle.y = canvas.height - bottle.height;
            bottle.angle = 0;
        }
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBottle();
    updateBottle();
    requestAnimationFrame(render);
}

// Mouse / touch controls
let isDragging = false;
let dragStart = {x:0, y:0};
canvas.addEventListener("mousedown", e => { if(!bottle.isFlipping){isDragging=true; dragStart={x:e.offsetX, y:e.offsetY};} });
canvas.addEventListener("mousemove", e => { if(isDragging) { /* optional: draw aim arrow */ } });
canvas.addEventListener("mouseup", e => {
    if(isDragging){
        isDragging=false;
        const dx = dragStart.x - e.offsetX;
        const dy = dragStart.y - e.offsetY;
        bottle.vx = dx / 5;
        bottle.vy = dy / 5;
        bottle.angularVelocity = dx / 50;
        bottle.isFlipping = true;
        flipSound.play();
    }
});

// Buttons
document.getElementById("startBtn").addEventListener("click", () => { gameRunning = true; render(); });
document.getElementById("pauseBtn").addEventListener("click", () => { gameRunning = false; });
document.getElementById("restartBtn").addEventListener("click", () => { resetBottle(); score=0; combo=0; });

// Score display
setInterval(() => {
    document.getElementById("score").textContent = score;
    document.getElementById("combo").textContent = combo;
}, 100);
