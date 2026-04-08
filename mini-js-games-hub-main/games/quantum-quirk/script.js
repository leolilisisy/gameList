const gameState = {
level: 1,
moves: 0,
accuracy: 0,
particles: [],
targetPattern: [],
quantumRules: [
"Gravity Inversion",
"Quantum Entanglement",
"Particle Attraction",
"Particle Repulsion",
"Dimensional Shift",
"Chronal Instability"
],
activeRule: "Gravity Inversion",
gravityEnabled: false,
entanglementEnabled: false,
attractionEnabled: false,
repulsionEnabled: false
};

const gameBoard = document.getElementById('gameBoard');
const targetPattern = document.getElementById('targetPattern');
let quantumField = document.getElementById('quantumField');
let quantumRule = document.getElementById('quantumRule');
const levelDisplay = document.getElementById('level');
const movesDisplay = document.getElementById('moves');
const accuracyDisplay = document.getElementById('accuracy');
const winMessage = document.getElementById('winMessage');
const winLevel = document.getElementById('winLevel');
const winMoves = document.getElementById('winMoves');
const winAccuracy = document.getElementById('winAccuracy');

const gravityBtn = document.getElementById('gravityBtn');
const quantumBtn = document.getElementById('quantumBtn');
const resetBtn = document.getElementById('resetBtn');
const attractBtn = document.getElementById('attractBtn');
const repelBtn = document.getElementById('repelBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const continueBtn = document.getElementById('continueBtn');

function initGame() {
createParticles();
createTargetPattern();
updateDisplay();
setupEventListeners();
animateQuantumField();
}

function createParticles() {
gameBoard.innerHTML = '<div class="quantum-field" id="quantumField"></div><div class="quantum-rule" id="quantumRule">Rule: ' + gameState.activeRule + '</div>';
quantumField = document.getElementById('quantumField');
quantumRule = document.getElementById('quantumRule');

gameState.particles = [];
const particleCount = 5 + gameState.level;

for (let i = 0; i < particleCount; i++) {
const particle = document.createElement('div');
particle.className = 'particle';

const x = Math.random() * (gameBoard.offsetWidth - 40) + 20;
const y = Math.random() * (gameBoard.offsetHeight - 40) + 20;

const size = 15 + Math.random() * 25;
const hue = Math.random() * 360;

particle.style.width = `${size}px`;
particle.style.height = `${size}px`;
particle.style.left = `${x}px`;
particle.style.top = `${y}px`;
particle.style.backgroundColor = `hsl(${hue}, 70%, 60%)`;
particle.style.boxShadow = `0 0 15px hsl(${hue}, 70%, 60%)`;

makeDraggable(particle);

gameBoard.appendChild(particle);
gameState.particles.push({
    element: particle,
    x: x,
    y: y,
    size: size,
    hue: hue,
    vx: 0,
    vy: 0
});
}
}

function createTargetPattern() {
targetPattern.innerHTML = '<div class="quantum-rule">Target Pattern</div>';
gameState.targetPattern = [];

const patternCount = 5 + gameState.level;
const centerX = targetPattern.offsetWidth / 2;
const centerY = targetPattern.offsetHeight / 2;
const radius = Math.min(centerX, centerY) - 50;

let positions = [];
if (gameState.level <= 3) {
for (let i = 0; i < patternCount; i++) {
    const angle = (i / patternCount) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    positions.push({x, y});
}
} else if (gameState.level <= 6) {
for (let i = 0; i < patternCount; i++) {
    const angle = (i / patternCount) * Math.PI * 4;
    const spiralRadius = 30 + (i / patternCount) * (radius - 30);
    const x = centerX + Math.cos(angle) * spiralRadius;
    const y = centerY + Math.sin(angle) * spiralRadius;
    positions.push({x, y});
}
} else {
for (let i = 0; i < patternCount; i++) {
    const x = centerX + (Math.random() - 0.5) * radius * 1.5;
    const y = centerY + (Math.random() - 0.5) * radius * 1.5;
    positions.push({x, y});
}
}

for (let i = 0; i < patternCount; i++) {
const targetParticle = document.createElement('div');
targetParticle.className = 'particle';

const size = 20 + Math.random() * 20;
const hue = Math.random() * 360;

targetParticle.style.width = `${size}px`;
targetParticle.style.height = `${size}px`;
targetParticle.style.left = `${positions[i].x}px`;
targetParticle.style.top = `${positions[i].y}px`;
targetParticle.style.backgroundColor = `hsl(${hue}, 70%, 60%)`;
targetParticle.style.boxShadow = `0 0 15px hsl(${hue}, 70%, 60%)`;
targetParticle.style.opacity = '0.7';

targetPattern.appendChild(targetParticle);
gameState.targetPattern.push({
    x: positions[i].x,
    y: positions[i].y,
    size: size,
    hue: hue
});
}
}

function makeDraggable(element) {
let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

element.onmousedown = dragMouseDown;

function dragMouseDown(e) {
e.preventDefault();

pos3 = e.clientX;
pos4 = e.clientY;
document.onmouseup = closeDragElement;
document.onmousemove = elementDrag;
gameState.moves++;
updateDisplay();
}

function elementDrag(e) {
e.preventDefault();

pos1 = pos3 - e.clientX;
pos2 = pos4 - e.clientY;
pos3 = e.clientX;
pos4 = e.clientY;

const newTop = element.offsetTop - pos2;
const newLeft = element.offsetLeft - pos1;

if (newTop >= 0 && newTop <= gameBoard.offsetHeight - element.offsetHeight) {
    element.style.top = newTop + "px";
}
if (newLeft >= 0 && newLeft <= gameBoard.offsetWidth - element.offsetWidth) {
    element.style.left = newLeft + "px";
}

const particleIndex = gameState.particles.findIndex(p => p.element === element);
if (particleIndex !== -1) {
    gameState.particles[particleIndex].x = newLeft;
    gameState.particles[particleIndex].y = newTop;
}

checkWinCondition();
}

function closeDragElement() {
document.onmouseup = null;
document.onmousemove = null;
}
}

function checkWinCondition() {
if (gameState.particles.length !== gameState.targetPattern.length) return;

let matched = 0;
const tolerance = 30; 

for (let i = 0; i < gameState.particles.length; i++) {
const particle = gameState.particles[i];
const target = gameState.targetPattern[i];

const distance = Math.sqrt(
    Math.pow(particle.x - target.x, 2) + 
    Math.pow(particle.y - target.y, 2)
);

if (distance < tolerance) {
    matched++;
}
}

gameState.accuracy = Math.round((matched / gameState.particles.length) * 100);
updateDisplay();

if (matched === gameState.particles.length) {
showWinMessage();
}
}

function showWinMessage() {
winLevel.textContent = gameState.level;
winMoves.textContent = gameState.moves;
winAccuracy.textContent = gameState.accuracy + '%';
winMessage.classList.add('active');
}

function updateDisplay() {
levelDisplay.textContent = gameState.level;
movesDisplay.textContent = gameState.moves;
accuracyDisplay.textContent = gameState.accuracy + '%';

quantumRule.textContent = 'Rule: ' + gameState.activeRule;
}

function animateQuantumField() {
let time = 0;

function updateField() {
time += 0.02;
const gradient = `radial-gradient(circle at ${50 + 20 * Math.sin(time)}% ${50 + 20 * Math.cos(time)}%, 
    rgba(74, 63, 224, 0.3) 0%, 
    rgba(229, 63, 140, 0.2) 30%, 
    rgba(0, 201, 255, 0.1) 70%, 
    transparent 100%)`;

quantumField.style.background = gradient;

requestAnimationFrame(updateField);
}

updateField();
}

function applyQuantumRules() {
if (gameState.gravityEnabled) {
gameState.particles.forEach(particle => {
    particle.vy += 0.1; 
    particle.y += particle.vy;
    
    if (particle.y <= 0 || particle.y >= gameBoard.offsetHeight - particle.size) {
        particle.vy *= -0.8; 
    }

    particle.y = Math.max(0, Math.min(particle.y, gameBoard.offsetHeight - particle.size));
    particle.element.style.top = `${particle.y}px`;
});
}

if (gameState.entanglementEnabled) {
const centerX = gameBoard.offsetWidth / 2;
const centerY = gameBoard.offsetHeight / 2;

gameState.particles.forEach(particle => {
    const dx = particle.x - centerX;
    const dy = particle.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const force = 0.5;
    
    particle.vx -= (dx / distance) * force;
    particle.vy -= (dy / distance) * force;
    
    particle.x += particle.vx;
    particle.y += particle.vy;
    

    particle.vx *= 0.95;
    particle.vy *= 0.95;
    

    particle.x = Math.max(0, Math.min(particle.x, gameBoard.offsetWidth - particle.size));
    particle.y = Math.max(0, Math.min(particle.y, gameBoard.offsetHeight - particle.size));
    
    particle.element.style.left = `${particle.x}px`;
    particle.element.style.top = `${particle.y}px`;
});
}

if (gameState.attractionEnabled) {
for (let i = 0; i < gameState.particles.length; i++) {
    for (let j = i + 1; j < gameState.particles.length; j++) {
        const p1 = gameState.particles[i];
        const p2 = gameState.particles[j];
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const force = 0.5 / distance;
            
            p1.vx += dx * force * 0.05;
            p1.vy += dy * force * 0.05;
            p2.vx -= dx * force * 0.05;
            p2.vy -= dy * force * 0.05;
        }
    }
}
}

if (gameState.repulsionEnabled) {
for (let i = 0; i < gameState.particles.length; i++) {
    for (let j = i + 1; j < gameState.particles.length; j++) {
        const p1 = gameState.particles[i];
        const p2 = gameState.particles[j];
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0 && distance < 150) {
            const force = 1 / (distance * distance);
            
            p1.vx -= dx * force * 0.1;
            p1.vy -= dy * force * 0.1;
            p2.vx += dx * force * 0.1;
            p2.vy += dy * force * 0.1;
        }
    }
}
}
gameState.particles.forEach(particle => {
particle.x += particle.vx;
particle.y += particle.vy;

particle.x = Math.max(0, Math.min(particle.x, gameBoard.offsetWidth - particle.size));
particle.y = Math.max(0, Math.min(particle.y, gameBoard.offsetHeight - particle.size));

particle.element.style.left = `${particle.x}px`;
particle.element.style.top = `${particle.y}px`;
});

checkWinCondition();
requestAnimationFrame(applyQuantumRules);
}
function setupEventListeners() {
gravityBtn.addEventListener('click', () => {
gameState.gravityEnabled = !gameState.gravityEnabled;
gameState.moves++;
updateDisplay();

if (gameState.gravityEnabled) {
    gravityBtn.style.background = 'linear-gradient(90deg, #e53f8c, #ff8a00)';
    gameState.activeRule = "Gravity Inversion";
} else {
    gravityBtn.style.background = 'linear-gradient(90deg, #4a3fe0, #e53f8c)';
    gameState.activeRule = gameState.quantumRules[gameState.level % gameState.quantumRules.length];
}

updateDisplay();
});

quantumBtn.addEventListener('click', () => {
gameState.entanglementEnabled = !gameState.entanglementEnabled;
gameState.moves++;
updateDisplay();

if (gameState.entanglementEnabled) {
    quantumBtn.style.background = 'linear-gradient(90deg, #e53f8c, #ff8a00)';
    gameState.activeRule = "Quantum Entanglement";
} else {
    quantumBtn.style.background = 'linear-gradient(90deg, #4a3fe0, #e53f8c)';
    gameState.activeRule = gameState.quantumRules[gameState.level % gameState.quantumRules.length];
}

updateDisplay();
});

attractBtn.addEventListener('click', () => {
gameState.attractionEnabled = !gameState.attractionEnabled;
gameState.repulsionEnabled = false; 
gameState.moves++;
updateDisplay();

if (gameState.attractionEnabled) {
    attractBtn.style.background = 'linear-gradient(90deg, #e53f8c, #ff8a00)';
    repelBtn.style.background = 'linear-gradient(90deg, #4a3fe0, #e53f8c)';
    gameState.activeRule = "Particle Attraction";
} else {
    attractBtn.style.background = 'linear-gradient(90deg, #4a3fe0, #e53f8c)';
    gameState.activeRule = gameState.quantumRules[gameState.level % gameState.quantumRules.length];
}

updateDisplay();
});

repelBtn.addEventListener('click', () => {
gameState.repulsionEnabled = !gameState.repulsionEnabled;
gameState.attractionEnabled = false;
gameState.moves++;
updateDisplay();

if (gameState.repulsionEnabled) {
    repelBtn.style.background = 'linear-gradient(90deg, #e53f8c, #ff8a00)';
    attractBtn.style.background = 'linear-gradient(90deg, #4a3fe0, #e53f8c)';
    gameState.activeRule = "Particle Repulsion";
} else {
    repelBtn.style.background = 'linear-gradient(90deg, #4a3fe0, #e53f8c)';
    gameState.activeRule = gameState.quantumRules[gameState.level % gameState.quantumRules.length];
}

updateDisplay();
});

resetBtn.addEventListener('click', () => {
createParticles();
gameState.moves++;
updateDisplay();
});

continueBtn.addEventListener('click', () => {
gameState.level++;
gameState.moves = 0;
gameState.accuracy = 0;

gameState.activeRule = gameState.quantumRules[gameState.level % gameState.quantumRules.length];

gameState.gravityEnabled = false;
gameState.entanglementEnabled = false;
gameState.attractionEnabled = false;
gameState.repulsionEnabled = false;

gravityBtn.style.background = 'linear-gradient(90deg, #4a3fe0, #e53f8c)';
quantumBtn.style.background = 'linear-gradient(90deg, #4a3fe0, #e53f8c)';
attractBtn.style.background = 'linear-gradient(90deg, #4a3fe0, #e53f8c)';
repelBtn.style.background = 'linear-gradient(90deg, #4a3fe0, #e53f8c)';

createParticles();
createTargetPattern();
updateDisplay();
winMessage.classList.remove('active');
});
}

window.onload = function() {
initGame();
applyQuantumRules();
};