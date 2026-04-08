const canvas = document.getElementById("flower-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.7;

let flowers = [];
let animationId;
let running = true;
let speed = 5;

const bloomSound = document.getElementById("bloom-sound");

// Flower class
class Flower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = Math.random() * 25 + 15;
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        this.opacity = 1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        if (this.radius < this.maxRadius) this.radius += 0.3 * (speed / 5);
        else this.opacity -= 0.01;
        this.draw();
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    flowers.forEach((flower, i) => {
        flower.update();
        if (flower.opacity <= 0) flowers.splice(i, 1);
    });
    if (running) animationId = requestAnimationFrame(animate);
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    flowers.push(new Flower(x, y));
    bloomSound.currentTime = 0;
    bloomSound.play();
});

document.getElementById("pause-btn").addEventListener("click", () => {
    running = false;
});

document.getElementById("resume-btn").addEventListener("click", () => {
    if (!running) {
        running = true;
        animate();
    }
});

document.getElementById("restart-btn").addEventListener("click", () => {
    flowers = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById("speed-range").addEventListener("input", (e) => {
    speed = e.target.value;
});

// Start animation
animate();
