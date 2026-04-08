// Prism Puzzle Game Script
// Bend light through prisms to illuminate targets and solve optical challenges.

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game variables
let lightSource = { x: 50, y: 300 };
let prisms = [];
let targets = [];
let beams = [];
let draggedPrism = null;
let litTargets = 0;

// Initialize game
function init() {
    // Create prisms
    prisms.push({ x: 300, y: 200, angle: 0 });
    prisms.push({ x: 500, y: 400, angle: 0 });

    // Create targets
    targets.push({ x: 700, y: 150, lit: false });
    targets.push({ x: 700, y: 300, lit: false });
    targets.push({ x: 700, y: 450, lit: false });

    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Calculate beams
    beams = [];
    castBeam(lightSource.x, lightSource.y, 0, 0); // Horizontal beam

    // Check targets
    litTargets = 0;
    targets.forEach(target => {
        target.lit = false;
        beams.forEach(beam => {
            if (Math.abs(beam.endX - target.x) < 20 && Math.abs(beam.endY - target.y) < 20) {
                target.lit = true;
                litTargets++;
            }
        });
    });

    scoreElement.textContent = 'Targets Lit: ' + litTargets + '/3';
    if (litTargets === 3) {
        setTimeout(() => alert('All targets illuminated! Puzzle solved!'), 100);
    }
}

// Cast beam recursively
function castBeam(startX, startY, dirX, dirY) {
    let currentX = startX;
    let currentY = startY;
    let currentDirX = dirX;
    let currentDirY = dirY;

    for (let i = 0; i < 1000; i++) { // Max length
        currentX += currentDirX;
        currentY += currentDirY;

        // Check prism collision
        let hitPrism = null;
        prisms.forEach(prism => {
            const dist = Math.sqrt((currentX - prism.x)**2 + (currentY - prism.y)**2);
            if (dist < 30) { // Prism size
                hitPrism = prism;
            }
        });

        if (hitPrism) {
            // Reflect: simple 90 degree turn for demo
            if (currentDirX > 0) { currentDirX = 0; currentDirY = currentDirY > 0 ? -1 : 1; }
            else if (currentDirX < 0) { currentDirX = 0; currentDirY = currentDirY > 0 ? -1 : 1; }
            else if (currentDirY > 0) { currentDirY = 0; currentDirX = currentDirX > 0 ? -1 : 1; }
            else { currentDirY = 0; currentDirX = currentDirX > 0 ? -1 : 1; }
        }

        // Check canvas bounds
        if (currentX < 0 || currentX > canvas.width || currentY < 0 || currentY > canvas.height) {
            beams.push({ startX: startX, startY: startY, endX: currentX, endY: currentY });
            break;
        }
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000022';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw light source
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(lightSource.x, lightSource.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw prisms
    ctx.fillStyle = '#00ffff';
    prisms.forEach(prism => {
        ctx.save();
        ctx.translate(prism.x, prism.y);
        ctx.rotate(prism.angle);
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(20, 20);
        ctx.lineTo(-20, 20);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    });

    // Draw targets
    targets.forEach(target => {
        ctx.fillStyle = target.lit ? '#00ff00' : '#ff0000';
        ctx.beginPath();
        ctx.arc(target.x, target.y, 15, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw beams
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    beams.forEach(beam => {
        ctx.beginPath();
        ctx.moveTo(beam.startX, beam.startY);
        ctx.lineTo(beam.endX, beam.endY);
        ctx.stroke();
    });
}

// Handle mouse
let isDragging = false;
let dragStartX, dragStartY;

canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    prisms.forEach(prism => {
        const dist = Math.sqrt((mouseX - prism.x)**2 + (mouseY - prism.y)**2);
        if (dist < 30) {
            draggedPrism = prism;
            dragStartX = mouseX;
            dragStartY = mouseY;
            isDragging = true;
        }
    });
});

canvas.addEventListener('mousemove', e => {
    if (isDragging && draggedPrism) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const deltaX = mouseX - dragStartX;
        const deltaY = mouseY - dragStartY;
        draggedPrism.angle = Math.atan2(deltaY, deltaX);
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    draggedPrism = null;
});

// Start the game
init();