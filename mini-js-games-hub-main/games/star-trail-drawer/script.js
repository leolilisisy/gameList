const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

let stars = [];
let trail = [];
let targetTrail = [];
let isDrawing = false;
let paused = false;

const connectSound = document.getElementById("connectSound");
const successSound = document.getElementById("successSound");

// Generate stars
function createStars(count = 20) {
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * (canvas.width - 60) + 30,
      y: Math.random() * (canvas.height - 60) + 30,
      radius: 6,
      id: i,
      glow: 0
    });
  }
}

// Draw stars
function drawStars() {
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${0.5 + star.glow})`;
    ctx.shadowBlur = 20 * star.glow;
    ctx.shadowColor = 'white';
    ctx.fill();
    ctx.closePath();
    star.glow += Math.random()*0.05;
    if(star.glow>1) star.glow=0.5;
  });
}

// Draw trail
function drawTrail() {
  if(trail.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(trail[0].x, trail[0].y);
  for(let i=1;i<trail.length;i++){
    ctx.lineTo(trail[i].x, trail[i].y);
  }
  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#0ff";
  ctx.stroke();
  ctx.closePath();
}

// Animation loop
function animate() {
  if(paused) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawStars();
  drawTrail();
  requestAnimationFrame(animate);
}

// Check if clicked near star
function getStarAt(x, y) {
  return stars.find(star => {
    const dx = x - star.x;
    const dy = y - star.y;
    return Math.sqrt(dx*dx + dy*dy) < star.radius + 10;
  });
}

// Event listeners
canvas.addEventListener("mousedown", (e)=>{
  if(paused) return;
  isDrawing = true;
  const star = getStarAt(e.offsetX, e.offsetY);
  if(star && !trail.includes(star)){
    trail.push(star);
    connectSound.play();
  }
});

canvas.addEventListener("mousemove", (e)=>{
  if(!isDrawing || paused) return;
  const star = getStarAt(e.offsetX, e.offsetY);
  if(star && !trail.includes(star)){
    trail.push(star);
    connectSound.play();
  }
});

canvas.addEventListener("mouseup", ()=>{
  isDrawing = false;
});

// Controls
document.getElementById("pauseBtn").addEventListener("click", ()=>{
  paused = !paused;
  if(!paused) animate();
});

document.getElementById("restartBtn").addEventListener("click", ()=>{
  trail = [];
  createStars();
  paused=false;
  animate();
  document.getElementById("message").textContent="";
});

document.getElementById("clearBtn").addEventListener("click", ()=>{
  trail=[];
});

document.getElementById("hintBtn").addEventListener("click", ()=>{
  document.getElementById("message").textContent="Hint: Connect the first 3 stars!";
});

// Initialize
createStars();
animate();
