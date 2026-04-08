// Pixel Art Creator - A simple drawing tool
// Made with love for the Mini JS Games Hub

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gridSize = 16; // 16x16 grid
const pixelSize = canvas.width / gridSize; // Size of each pixel

let currentColor = '#000000'; // Start with black

// Fill canvas with white initially
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Function to draw the grid lines
function drawGrid() {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
        // Draw vertical lines
        ctx.beginPath();
        ctx.moveTo(i * pixelSize, 0);
        ctx.lineTo(i * pixelSize, canvas.height);
        ctx.stroke();
        // Draw horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * pixelSize);
        ctx.lineTo(canvas.width, i * pixelSize);
        ctx.stroke();
    }
}

// Draw the initial grid
drawGrid();

// Set up color palette
const colors = document.querySelectorAll('.color');
colors.forEach(color => {
    color.style.backgroundColor = color.dataset.color;
    color.addEventListener('click', () => {
        currentColor = color.dataset.color;
        // Remove selected class from all
        colors.forEach(c => c.classList.remove('selected'));
        // Add to clicked one
        color.classList.add('selected');
    });
});

// Select the first color by default
colors[0].classList.add('selected');

// Handle canvas clicks to paint pixels
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Calculate which grid cell was clicked
    const gridX = Math.floor(x / pixelSize);
    const gridY = Math.floor(y / pixelSize);

    // Paint the pixel
    ctx.fillStyle = currentColor;
    ctx.fillRect(gridX * pixelSize, gridY * pixelSize, pixelSize, pixelSize);
    // Redraw grid to keep lines visible
    drawGrid();
});

// Clear button
document.getElementById('clear-btn').addEventListener('click', () => {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
});

// Save button - store in localStorage
document.getElementById('save-btn').addEventListener('click', () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = Array.from(imageData.data);
    localStorage.setItem('pixelArt', JSON.stringify(data));
    alert('Your art has been saved!');
});

// Load button - retrieve from localStorage
document.getElementById('load-btn').addEventListener('click', () => {
    const data = localStorage.getItem('pixelArt');
    if (data) {
        const imageData = new ImageData(new Uint8ClampedArray(JSON.parse(data)), canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
        drawGrid();
        alert('Art loaded successfully!');
    } else {
        alert('No saved art found. Draw something first!');
    }
});

// Export button - download as PNG
document.getElementById('export-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'my-pixel-art.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});