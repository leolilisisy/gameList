const canvas = document.getElementById('auroraCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let animationId;
let particles = [];
let isRunning = false;

const backgroundMusic = document.getElementById('backgroundMusic');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const glowRange = document.getElementById('glowRange');
const speedRange = document.getElementById('speedRange');

const colors = ['#00ffe7', '#ff00c8', '#fffb00', '#00ff38', '#ff6d00'];

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = Math.random() * 2 - 1;
        this.vy = Math.random() * 2 - 1;
        this.size = Math.random() * 2 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.history = [];
    }

    update() {
        this.history.push({x: this.x, y: this.y});
        if(this.history.length > 30) this.history.shift();

        this.x += this.vx * speedRange.value;
        this.y += this.vy * speedRange.value;

        if(this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if(this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        for(let i=0; i<this.history.length; i++){
            const pos = this.history[i];
            ctx.lineTo(pos.x, pos.y);
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = glowRange.value / 2;
        ctx.shadowBlur = glowRange.value;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.closePath();
    }
}

function initParticles(count=50) {
    particles = [];
    for(let i=0; i<count; i++){
        particles.push(new Particle(Math.random()*canvas.width, Math.random()*canvas.height));
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0,0,16,0.1)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    animationId = requestAnimationFrame(animate);
}

startBtn.addEventListener('click', () => {
    if(!isRunning){
        isRunning = true;
        animate();
        backgroundMusic.play();
    }
});

pauseBtn.addEventListener('click', () => {
    if(isRunning){
        cancelAnimationFrame(animationId);
        isRunning = false;
        backgroundMusic.pause();
    }
});

restartBtn.addEventListener('click', () => {
    cancelAnimationFrame(animationId);
    initParticles();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    isRunning = false;
    backgroundMusic.currentTime = 0;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    initParticles();
});

canvas.addEventListener('mousemove', (e) => {
    for(let i=0; i<5; i++){
        const p = new Particle(e.clientX + Math.random()*20-10, e.clientY + Math.random()*20-10);
        particles.push(p);
        if(particles.length > 200) particles.shift();
    }
});

// Initialize
initParticles(100);
