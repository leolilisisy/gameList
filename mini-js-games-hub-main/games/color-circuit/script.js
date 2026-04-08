const canvas = document.getElementById("circuit-canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

// Sounds
const connectSound = document.getElementById("connect-sound");
const successSound = document.getElementById("success-sound");
const errorSound = document.getElementById("error-sound");

// Game variables
let nodes = [];
let connections = [];
let currentLine = null;
let isDrawing = false;
let paused = false;

// Colors
const colors = ["#ff0040","#00ff00","#00ffff"];
const nodeRadius = 15;

// Obstacles
const obstacles = [
    {x: 300, y: 200, w: 100, h: 20},
    {x: 500, y: 400, w: 150, h: 20}
];

// Generate random nodes
function initNodes() {
    nodes = [];
    colors.forEach(color => {
        for (let i = 0; i < 3; i++) {
            nodes.push({
                x: Math.random() * (canvas.width-100)+50,
                y: Math.random() * (canvas.height-100)+50,
                color: color,
                connected: false
            });
        }
    });
}

// Draw nodes, obstacles, connections
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Draw connections
    connections.forEach(line => {
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 6;
        ctx.shadowColor = line.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(line.from.x,line.from.y);
        ctx.lineTo(line.to.x,line.to.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
    });

    // Draw obstacles
    obstacles.forEach(obs => {
        ctx.fillStyle = "#880000";
        ctx.fillRect(obs.x,obs.y,obs.w,obs.h);
    });

    // Draw nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x,node.y,nodeRadius,0,Math.PI*2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw current line
    if(currentLine) {
        ctx.strokeStyle = currentLine.color;
        ctx.lineWidth = 6;
        ctx.shadowColor = currentLine.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(currentLine.from.x,currentLine.from.y);
        ctx.lineTo(currentLine.to.x,currentLine.to.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

function distance(a,b) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

// Mouse events
canvas.addEventListener("mousedown", e => {
    if(paused) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    nodes.forEach(node => {
        if(distance(node,{x:mx,y:my}) < nodeRadius) {
            isDrawing = true;
            currentLine = {from: node, to: {x:mx,y:my}, color: node.color};
        }
    });
});

canvas.addEventListener("mousemove", e => {
    if(!isDrawing || paused) return;
    const rect = canvas.getBoundingClientRect();
    currentLine.to.x = e.clientX - rect.left;
    currentLine.to.y = e.clientY - rect.top;
});

canvas.addEventListener("mouseup", e => {
    if(!isDrawing || paused) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let validConnection = false;

    nodes.forEach(node => {
        if(distance(node,{x:mx,y:my})<nodeRadius && node.color===currentLine.color && node!==currentLine.from) {
            connections.push({from: currentLine.from, to: node, color: currentLine.color});
            connectSound.play();
            validConnection = true;
        }
    });

    if(!validConnection) errorSound.play();
    currentLine = null;
    isDrawing = false;

    checkWin();
});

function checkWin() {
    let colorMap = {};
    colors.forEach(color => colorMap[color] = nodes.filter(n=>n.color===color));
    let won = colors.every(color=>{
        return colorMap[color].every(node=>{
            return connections.some(c=>c.from===node || c.to===node);
        });
    });
    if(won){
        successSound.play();
        document.getElementById("message").textContent = "🎉 All circuits completed!";
    }
}

// Buttons
document.getElementById("restart-btn").addEventListener("click", ()=>{
    initNodes();
    connections = [];
    currentLine = null;
    draw();
    document.getElementById("message").textContent = "";
});
document.getElementById("reset-btn").addEventListener("click", ()=>{
    connections = [];
    currentLine = null;
    draw();
    document.getElementById("message").textContent = "";
});
document.getElementById("pause-btn").addEventListener("click", ()=>{
    paused = !paused;
    document.getEl
