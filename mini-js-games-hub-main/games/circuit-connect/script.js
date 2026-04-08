const canvas = document.getElementById('circuit-board');
const ctx = canvas.getContext('2d');
const placeSound = document.getElementById('place-sound');
const successSound = document.getElementById('success-sound');
const errorSound = document.getElementById('error-sound');

let wires = [];
let activePiece = null;
let paused = false;
let undoStack = [], redoStack = [];

const boardWidth = canvas.width;
const boardHeight = canvas.height;

// Piece size
const pieceSize = 60;

// Power & Bulb positions
const powerPos = {x: 50, y: boardHeight/2};
const bulbPos = {x: boardWidth-50, y: boardHeight/2};

// Obstacles
const obstacles = [
    {x: 300, y: 100, radius: 20},
    {x: 400, y: 300, radius: 25}
];

function drawBoard() {
    ctx.clearRect(0,0,boardWidth,boardHeight);

    // Draw obstacles
    obstacles.forEach(o => {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(o.x,o.y,o.radius,0,Math.PI*2);
        ctx.fill();
    });

    // Draw power source
    ctx.fillStyle = '#0f0';
    ctx.beginPath();
    ctx.arc(powerPos.x,powerPos.y,20,0,Math.PI*2);
    ctx.fill();

    // Draw bulb
    ctx.fillStyle = isPowered() ? '#ff0' : '#555';
    ctx.beginPath();
    ctx.arc(bulbPos.x,bulbPos.y,20,0,Math.PI*2);
    ctx.fill();

    // Draw wires
    wires.forEach(w => {
        ctx.strokeStyle = w.powered ? '#0ff' : '#888';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(w.x1,w.y1);
        ctx.lineTo(w.x2,w.y2);
        ctx.stroke();
    });
}

// Power flow check
function isPowered() {
    // Simple check: any wire connects power to bulb without hitting obstacles
    for(let w of wires){
        if(lineHitsCircle(w.x1,w.y1,w.x2,w.y2,obstacles)) return false;
    }
    for(let w of wires){
        if(distance(w.x2,w.y2,bulbPos.x,bulbPos.y)<30 && distance(w.x1,w.y1,powerPos.x,powerPos.y)<30) return true;
    }
    return false;
}

// Check collision with obstacles
function lineHitsCircle(x1,y1,x2,y2,circles){
    for(let c of circles){
        let dx = x2-x1;
        let dy = y2-y1;
        let fx = x1-c.x;
        let fy = y1-c.y;
        let a = dx*dx + dy*dy;
        let b = 2*(fx*dx + fy*dy);
        let cVal = fx*fx + fy*fy - c.radius*c.radius;
        let disc = b*b - 4*a*cVal;
        if(disc>=0){
            let t1 = (-b - Math.sqrt(disc)) / (2*a);
            let t2 = (-b + Math.sqrt(disc)) / (2*a);
            if((t1>=0 && t1<=1) || (t2>=0 && t2<=1)) return true;
        }
    }
    return false;
}

function distance(x1,y1,x2,y2){return Math.sqrt((x2-x1)**2+(y2-y1)**2);}

// Mouse events
canvas.addEventListener('click', e=>{
    if(paused) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if(activePiece){
        wires.push({x1:powerPos.x,y1:powerPos.y,x2:x,y2:y,powered:false});
        placeSound.play();
        undoStack.push(JSON.parse(JSON.stringify(wires)));
        drawBoard();
        if(isPowered()) successSound.play();
    }
});

document.querySelectorAll('.piece-btn').forEach(b=>{
    b.addEventListener('click', ()=>{
        activePiece = b.dataset.type;
    });
});

// Buttons
document.getElementById('restart-btn').addEventListener('click', ()=>{
    wires = [];
    paused = false;
    drawBoard();
});
document.getElementById('pause-btn').addEventListener('click', ()=>{
    paused = !paused;
});
document.getElementById('undo-btn').addEventListener('click', ()=>{
    if(undoStack.length>0){
        redoStack.push(JSON.parse(JSON.stringify(wires)));
        wires = undoStack.pop();
        drawBoard();
    }
});
document.getElementById('redo-btn').addEventListener('click', ()=>{
    if(redoStack.length>0){
        undoStack.push(JSON.parse(JSON.stringify(wires)));
        wires = redoStack.pop();
        drawBoard();
    }
});

drawBoard();
