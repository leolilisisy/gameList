const canvas = document.getElementById("rippleCanvas");
const ctx = canvas.getContext("2d");
const rainSound = document.getElementById("rain-sound");
let ripples = [];
let animationFrame;
let isPaused = true;

// Set canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Ripple class
class Ripple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.alpha = 1;
    this.maxRadius = 200;
  }

  update() {
    this.radius += 2;
    this.alpha -= 0.01;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(this.x, this.y, this.radius * 0.3, this.x, this.y, this.radius);
    gradient.addColorStop(0, `rgba(0,255,255,${this.alpha})`);
    gradient.addColorStop(1, `rgba(0,50,100,0)`);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00ffff";
    ctx.stroke();
  }
}

canvas.addEventListener("click", (e) => {
  if (!isPaused) {
    ripples.push(new Ripple(e.clientX, e.clientY));
  }
});

function animate() {
  ctx.fillStyle = "rgba(0, 10, 20, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ripples.forEach((ripple, index) => {
    ripple.update();
    ripple.draw();
    if (ripple.alpha <= 0) ripples.splice(index, 1);
  });

  if (!isPaused) {
    animationFrame = requestAnimationFrame(animate);
  }
}

// Button controls
document.getElementById("start-btn").addEventListener("click", () => {
  if (isPaused) {
    isPaused = false;
    rainSound.volume = 0.5;
    rainSound.play();
    animate();
  }
});

document.getElementById("pause-btn").addEventListener("click", () => {
  isPaused = true;
  rainSound.pause();
  cancelAnimationFrame(animationFrame);
});

document.getElementById("restart-btn").addEventListener("click", () => {
  ripples = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  isPaused = false;
  rainSound.currentTime = 0;
  rainSound.play();
  animate();
});
