document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM and Canvas Setup ---
    const canvas = document.getElementById('symmetry-canvas');
    const ctx = canvas.getContext('2d');

    const colorPicker = document.getElementById('color-picker');
    const brushSizeInput = document.getElementById('brush-size');
    const sizeDisplay = document.getElementById('size-display');
    const symmetryType = document.getElementById('symmetry-type');
    const clearButton = document.getElementById('clear-button');

    // Set canvas dimensions
    const CANVAS_SIZE = 500;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const CENTER_X = CANVAS_SIZE / 2;
    const CENTER_Y = CANVAS_SIZE / 2;

    // --- 2. State Variables ---
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Set initial context drawing properties
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // --- 3. Core Drawing Logic ---

    /**
     * The main function that draws the line segment and its symmetrical copies.
     * @param {number} x1 - Previous X position (relative to canvas).
     * @param {number} y1 - Previous Y position (relative to canvas).
     * @param {number} x2 - Current X position (relative to canvas).
     * @param {number} y2 - Current Y position (relative to canvas).
     */
    function drawSymmetrical(x1, y1, x2, y2) {
        // 1. Get current settings
        const segments = parseInt(symmetryType.value);
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = brushSizeInput.value;
        
        // 2. Translate to the center of the canvas
        ctx.save();
        ctx.translate(CENTER_X, CENTER_Y);

        // 3. Loop through segments and apply transformations
        for (let i = 0; i < segments; i++) {
            // Calculate the angle for rotation
            const angle = (2 * Math.PI) / segments;
            
            // --- DRAW THE PRIMARY SEGMENT ---
            ctx.beginPath();
            
            // Translate coordinates to be relative to the center
            const pX1 = x1 - CENTER_X;
            const pY1 = y1 - CENTER_Y;
            const pX2 = x2 - CENTER_X;
            const pY2 = y2 - CENTER_Y;
            
            ctx.moveTo(pX1, pY1);
            ctx.lineTo(pX2, pY2);
            ctx.stroke();
            
            // --- DRAW THE MIRROR SEGMENT (Across the rotation line) ---
            // If symmetry is even (4 or 8), draw a reflection across the Y-axis (vertical)
            if (segments % 2 === 0) {
                ctx.beginPath();
                // Scale(-1, 1) reflects the coordinates
                ctx.moveTo(-pX1, pY1);
                ctx.lineTo(-pX2, pY2);
                ctx.stroke();
            }

            // Apply rotation for the next segment
            ctx.rotate(angle);
        }

        // Restore the canvas state (translate, rotate, and strokeStyle reset)
        ctx.restore();
    }


    // --- 4. Event Handlers ---

    // A. MOUSE MOVE: Draw when mouse is down
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        
        // Draw segment from (lastX, lastY) to (current X, Y)
        drawSymmetrical(lastX, lastY, e.offsetX, e.offsetY);
        
        // Update the last position
        lastX = e.offsetX;
        lastY = e.offsetY;
    });

    // B. MOUSE DOWN: Start drawing
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        // Start a new path at the current position
        [lastX, lastY] = [e.offsetX, e.offsetY];
        
        // Draw a single dot to prevent starting segment from (0,0)
        drawSymmetrical(lastX, lastY, lastX + 0.1, lastY + 0.1);
    });

    // C. MOUSE UP/OUT: Stop drawing
    window.addEventListener('mouseup', () => {
        isDrawing = false;
    });
    
    canvas.addEventListener('mouseout', () => {
        isDrawing = false;
    });
    
    // D. Control Handlers
    
    // Update brush size display
    brushSizeInput.addEventListener('input', () => {
        sizeDisplay.textContent = brushSizeInput.value;
    });

    // Clear the canvas
    clearButton.addEventListener('click', () => {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        // Draw center lines for easier symmetry orientation
        drawCenterLines();
    });
    
    // Helper to draw visual guides
    function drawCenterLines() {
        ctx.save();
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(CENTER_X, 0);
        ctx.lineTo(CENTER_X, CANVAS_SIZE);
        ctx.moveTo(0, CENTER_Y);
        ctx.lineTo(CANVAS_SIZE, CENTER_Y);
        ctx.stroke();
        ctx.restore();
    }

    // Initial setup
    drawCenterLines();
});