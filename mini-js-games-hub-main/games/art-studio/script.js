// Art Studio Game
// Create digital art with various tools and colors

// DOM elements
const canvas = document.getElementById('art-canvas');
const ctx = canvas.getContext('2d');
const canvasOverlay = document.getElementById('canvas-overlay');
const messageEl = document.getElementById('message');

// Tool buttons
const brushTool = document.getElementById('brush-tool');
const eraserTool = document.getElementById('eraser-tool');
const fillTool = document.getElementById('fill-tool');
const lineTool = document.getElementById('line-tool');
const rectangleTool = document.getElementById('rectangle-tool');
const circleTool = document.getElementById('circle-tool');

// Color elements
const colorBtns = document.querySelectorAll('.color-btn');
const customColorInput = document.getElementById('custom-color');

// Brush size
const brushSizeInput = document.getElementById('brush-size');
const sizeValue = document.getElementById('size-value');

// Action buttons
const clearBtn = document.getElementById('clear-canvas');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const saveBtn = document.getElementById('save-btn');

// Stamp buttons
const stampBtns = document.querySelectorAll('.stamp-btn');

// Info display
const currentToolEl = document.getElementById('current-tool');
const currentColorEl = document.getElementById('current-color');
const currentSizeEl = document.getElementById('current-size');

// Game state
let currentTool = 'brush';
let currentColor = '#000000';
let brushSize = 5;
let isDrawing = false;
let startX, startY;
let currentStamp = null;

// Drawing state
let drawingHistory = [];
let historyIndex = -1;
let maxHistory = 50;

// Initialize the game
function initGame() {
    setupCanvas();
    setupEventListeners();
    setupTools();
    saveState(); // Save initial blank state
    updateInfo();
    showMessage('Welcome to Art Studio! Start creating your masterpiece!', 'success');
}

// Setup canvas
function setupCanvas() {
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = 800;
    canvas.height = 600;

    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set initial drawing properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

// Setup event listeners
function setupEventListeners() {
    // Canvas mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    // Tool selection
    brushTool.addEventListener('click', () => selectTool('brush'));
    eraserTool.addEventListener('click', () => selectTool('eraser'));
    fillTool.addEventListener('click', () => selectTool('fill'));
    lineTool.addEventListener('click', () => selectTool('line'));
    rectangleTool.addEventListener('click', () => selectTool('rectangle'));
    circleTool.addEventListener('click', () => selectTool('circle'));

    // Color selection
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => selectColor(btn.dataset.color));
    });
    customColorInput.addEventListener('change', (e) => selectColor(e.target.value));

    // Brush size
    brushSizeInput.addEventListener('input', updateBrushSize);

    // Action buttons
    clearBtn.addEventListener('click', clearCanvas);
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    saveBtn.addEventListener('click', saveCanvas);

    // Stamp selection
    stampBtns.forEach(btn => {
        btn.addEventListener('click', () => selectStamp(btn.dataset.stamp));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
}

// Setup tools
function setupTools() {
    selectTool('brush');
    selectColor('#000000');
    updateBrushSize();
}

// Select tool
function selectTool(tool) {
    currentTool = tool;
    currentStamp = null;

    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`#${tool}-tool`).classList.add('active');

    // Update cursor
    updateCursor();

    updateInfo();
    showMessage(`Selected ${tool} tool`, 'info');
}

// Select color
function selectColor(color) {
    currentColor = color;

    // Update UI
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    const colorBtn = document.querySelector(`[data-color="${color}"]`);
    if (colorBtn) {
        colorBtn.classList.add('selected');
    }

    customColorInput.value = color;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    updateInfo();
}

// Update brush size
function updateBrushSize() {
    brushSize = brushSizeInput.value;
    sizeValue.textContent = brushSize + 'px';
    ctx.lineWidth = brushSize;
    currentSizeEl.textContent = brushSize + 'px';
}

// Select stamp
function selectStamp(stamp) {
    currentStamp = stamp;
    currentTool = 'stamp';

    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.stamp-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    event.target.classList.add('active');
    updateCursor();
    updateInfo();
    showMessage(`Selected ${stamp} stamp`, 'info');
}

// Update cursor based on tool
function updateCursor() {
    canvas.className = '';

    if (currentTool === 'brush') {
        canvas.classList.add('brush-cursor');
    } else if (currentTool === 'eraser') {
        canvas.classList.add('eraser-cursor');
    } else if (currentTool === 'fill') {
        canvas.classList.add('fill-cursor');
    } else if (currentTool === 'stamp') {
        canvas.style.cursor = 'pointer';
    } else {
        canvas.style.cursor = 'crosshair';
    }
}

// Update info display
function updateInfo() {
    currentToolEl.textContent = currentTool.charAt(0).toUpperCase() + currentTool.slice(1);
    currentColorEl.style.background = currentColor;
    currentSizeEl.textContent = brushSize + 'px';
}

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    if (currentTool === 'fill') {
        fillArea(startX, startY);
        isDrawing = false;
        saveState();
    } else if (currentTool === 'stamp') {
        placeStamp(startX, startY);
        isDrawing = false;
        saveState();
    } else {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'brush') {
        drawBrush(x, y);
    } else if (currentTool === 'eraser') {
        erase(x, y);
    }
    // Shape tools draw on mouse up
}

function stopDrawing(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    if (currentTool === 'line') {
        drawLine(startX, startY, endX, endY);
    } else if (currentTool === 'rectangle') {
        drawRectangle(startX, startY, endX, endY);
    } else if (currentTool === 'circle') {
        drawCircle(startX, startY, endX, endY);
    }

    isDrawing = false;
    saveState();
}

// Drawing tool functions
function drawBrush(x, y) {
    ctx.lineTo(x, y);
    ctx.stroke();
}

function erase(x, y) {
    const prevColor = ctx.strokeStyle;
    const prevComposite = ctx.globalCompositeOperation;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.strokeStyle = prevColor;
    ctx.globalCompositeOperation = prevComposite;
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawRectangle(x1, y1, x2, y2) {
    const width = x2 - x1;
    const height = y2 - y1;

    ctx.strokeRect(x1, y1, width, height);
}

function drawCircle(x1, y1, x2, y2) {
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function fillArea(x, y) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Get the color at the clicked position
    const startPos = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    // Convert current color to RGB
    const fillColor = hexToRgb(currentColor);
    if (!fillColor) return;

    // If clicking on the same color, return
    if (startR === fillColor.r && startG === fillColor.g && startB === fillColor.b && startA === 255) {
        return;
    }

    // Flood fill algorithm
    const stack = [[Math.floor(x), Math.floor(y)]];
    const visited = new Set();

    while (stack.length > 0) {
        const [cx, cy] = stack.pop();
        const key = `${cx},${cy}`;

        if (visited.has(key)) continue;
        visited.add(key);

        const pos = (cy * canvas.width + cx) * 4;

        if (pos < 0 || pos >= data.length - 3) continue;

        const r = data[pos];
        const g = data[pos + 1];
        const b = data[pos + 2];
        const a = data[pos + 3];

        // Check if this pixel matches the start color
        if (r === startR && g === startG && b === startB && a === startA) {
            // Fill this pixel
            data[pos] = fillColor.r;
            data[pos + 1] = fillColor.g;
            data[pos + 2] = fillColor.b;
            data[pos + 3] = 255;

            // Add neighboring pixels to stack
            stack.push([cx + 1, cy]);
            stack.push([cx - 1, cy]);
            stack.push([cx, cy + 1]);
            stack.push([cx, cy - 1]);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function placeStamp(x, y) {
    if (!currentStamp) return;

    ctx.font = `${brushSize * 3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentStamp, x, y);
}

// Touch event handlers
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchEnd(e) {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup');
    canvas.dispatchEvent(mouseEvent);
}

// Utility functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// History management
function saveState() {
    // Remove any history after current index
    drawingHistory = drawingHistory.slice(0, historyIndex + 1);

    // Add current state
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    drawingHistory.push(imageData);

    // Limit history size
    if (drawingHistory.length > maxHistory) {
        drawingHistory.shift();
    }

    historyIndex = drawingHistory.length - 1;
    updateUndoRedoButtons();
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        ctx.putImageData(drawingHistory[historyIndex], 0, 0);
        updateUndoRedoButtons();
        showMessage('Undid last action', 'info');
    }
}

function redo() {
    if (historyIndex < drawingHistory.length - 1) {
        historyIndex++;
        ctx.putImageData(drawingHistory[historyIndex], 0, 0);
        updateUndoRedoButtons();
        showMessage('Redid last action', 'info');
    }
}

function updateUndoRedoButtons() {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= drawingHistory.length - 1;

    undoBtn.style.opacity = undoBtn.disabled ? 0.5 : 1;
    redoBtn.style.opacity = redoBtn.disabled ? 0.5 : 1;
}

// Clear canvas
function clearCanvas() {
    if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = currentColor;
        saveState();
        showMessage('Canvas cleared', 'info');
    }
}

// Save canvas
function saveCanvas() {
    const link = document.createElement('a');
    link.download = 'art-studio-masterpiece.png';
    link.href = canvas.toDataURL();
    link.click();
    showMessage('Artwork saved as PNG!', 'success');
}

// Keyboard shortcuts
function handleKeyDown(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'z':
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                break;
            case 'y':
                e.preventDefault();
                redo();
                break;
            case 's':
                e.preventDefault();
                saveCanvas();
                break;
        }
    }

    // Tool shortcuts
    switch (e.key) {
        case 'b':
            selectTool('brush');
            break;
        case 'e':
            selectTool('eraser');
            break;
        case 'f':
            selectTool('fill');
            break;
        case 'l':
            selectTool('line');
            break;
        case 'r':
            selectTool('rectangle');
            break;
        case 'c':
            selectTool('circle');
            break;
    }
}

// Show message
function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type} show`;

    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

// Initialize the game
initGame();

// This art studio game includes various drawing tools,
// color selection, brush size control, undo/redo functionality,
// and the ability to save artwork as PNG images