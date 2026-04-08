
const canvas = document.getElementById('gameCanvas');
let ctx = null;
if (canvas) {
    ctx = canvas.getContext('2d');
} else {
    console.error('Ripple Weaver: canvas element #gameCanvas not found');
}

let score = 0;
let timeLeft = 60;
let gameActive = true;
let particles = [];
let ripples = [];
let gates = [];
let combo = 0;
let lastScoreTime = 0;

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = 6;
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        this.trail = [];
    }
    
    update() {
        ripples.forEach(ripple => {
            const dx = this.x - ripple.x;
            const dy = this.y - ripple.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < ripple.radius && dist > ripple.radius - 50) {
                const force = (ripple.strength / dist) * 0.5;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
        });
        
        this.x += this.vx;
        this.y += this.vy;
        
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        if (this.x < this.radius) { this.x = this.radius; this.vx *= -0.8; }
        if (this.x > canvas.width - this.radius) { this.x = canvas.width - this.radius; this.vx *= -0.8; }
        if (this.y < this.radius) { this.y = this.radius; this.vy *= -0.8; }
        if (this.y > canvas.height - this.radius) { this.y = canvas.height - this.radius; this.vy *= -0.8; }
        
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 10) this.trail.shift();
    }
    
    draw() {
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < this.trail.length; i++) {
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, this.radius * (i / this.trail.length), 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 200;
        this.strength = 15;
        this.alpha = 1;
    }
    
    update() {
        this.radius += 4;
        this.alpha = 1 - (this.radius / this.maxRadius);
        return this.radius < this.maxRadius;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = '#8a2be2';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#8a2be2';
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 10, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
}

class Gate {
    constructor() {
        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = Math.random() * (canvas.height - 100) + 50;
        this.width = 80;
        this.height = 15;
        this.angle = Math.random() * Math.PI;
        this.active = true;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }
    
    checkCollision(particle) {
        if (!this.active) return false;
        
        const cos = Math.cos(-this.angle);
        const sin = Math.sin(-this.angle);
        
        const dx = particle.x - this.x;
        const dy = particle.y - this.y;
        
        const rotX = dx * cos - dy * sin;
        const rotY = dx * sin + dy * cos;
        
        return Math.abs(rotX) < this.width / 2 && Math.abs(rotY) < this.height / 2;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        if (this.active) {
            const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
            ctx.shadowBlur = 20 * pulse;
            ctx.shadowColor = '#00ff88';
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 4;
            
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
            
            ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        
        ctx.restore();
        this.pulsePhase += 0.05;
    }
}

function init() {
    score = 0;
    timeLeft = 60;
    gameActive = true;
    particles = [];
    ripples = [];
    gates = [];
    combo = 0;
    
    for (let i = 0; i < 8; i++) {
        particles.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }
    
    for (let i = 0; i < 5; i++) {
        gates.push(new Gate());
    }
    
    document.getElementById('gameOver').style.display = 'none';
}

function update() {
    if (!gameActive) return;
    
    particles.forEach(p => p.update());
    
    ripples = ripples.filter(r => r.update());
    
    gates.forEach(gate => {
        particles.forEach(particle => {
            if (gate.checkCollision(particle) && gate.active) {
                gate.active = false;
                
                const now = Date.now();
                if (now - lastScoreTime < 1000) {
                    combo++;
                } else {
                    combo = 1;
                }
                lastScoreTime = now;
                
                const points = 10 * combo;
                score += points;
                
                setTimeout(() => {
                    gates[gates.indexOf(gate)] = new Gate();
                }, 2000);
                
                for (let i = 0; i < 10; i++) {
                    ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 60%)`;
                    ctx.beginPath();
                    ctx.arc(
                        gate.x + (Math.random() - 0.5) * 40,
                        gate.y + (Math.random() - 0.5) * 40,
                        Math.random() * 3 + 1,
                        0, Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        });
    });
}

function draw() {
    ctx.fillStyle = 'rgba(5, 2, 16, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ripples.forEach(r => r.draw());
    gates.forEach(g => g.draw());
    particles.forEach(p => p.draw());
    
    if (combo > 1) {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 24px Courier New';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffff00';
        ctx.fillText(`COMBO x${combo}!`, canvas.width / 2, 50);
        ctx.shadowBlur = 0;
    }
}

function gameLoop() {
    if (!ctx) return; // abort if no rendering context

    update();
    draw();

    const scoreEl = document.getElementById('score');
    const timerEl = document.getElementById('timer');
    if (scoreEl) scoreEl.textContent = `Score: ${score}`;
    if (timerEl) timerEl.textContent = `Time: ${timeLeft}s`;

    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameActive = false;
    document.getElementById('finalScore').textContent = `Final Score: ${score}`;
    
    let rating = 'Novice Weaver';
    if (score > 500) rating = 'Master Weaver';
    else if (score > 300) rating = 'Expert Weaver';
    else if (score > 150) rating = 'Skilled Weaver';
    else if (score > 50) rating = 'Apprentice Weaver';
    
    document.getElementById('rating').textContent = `Rating: ${rating}`;
    document.getElementById('gameOver').style.display = 'block';
}

canvas.addEventListener('click', (e) => {
    if (!gameActive) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ripples.push(new Ripple(x, y));
});

// Wait until DOM is ready before adding listeners and starting the game
window.addEventListener('DOMContentLoaded', () => {
    if (!canvas || !ctx) {
        console.error('Ripple Weaver: required elements missing, aborting init');
        return;
    }

    // Ensure the canvas is visually below overlays
    canvas.style.zIndex = '0';

    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            init();
        });
    }

    setInterval(() => {
        if (gameActive && timeLeft > 0) {
            timeLeft--;
            if (timeLeft === 0) endGame();
        }
    }, 1000);

    init();
    requestAnimationFrame(gameLoop);
});