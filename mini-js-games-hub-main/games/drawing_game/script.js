document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM and Canvas Setup ---
    const canvas = document.getElementById('drawing-canvas');
    // Get the 2D rendering context
    const ctx = canvas.getContext('2d');

    const colorPicker = document.getElementById('color-picker');
    const brushSize = document.getElementById('brush-size');
    const sizeDisplay = document.getElementById('size-display');
    const clearButton = document.getElementById('clear-button');

    // --- 2. State Variables ---
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Set canvas dimensions (must be done in JS to work correctly for drawing)
    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 400;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Set initial context drawing properties
    ctx.strokeStyle = colorPicker.value;
    ctx.lineJoin = 'round'; // Gives smooth corners
    ctx.lineCap = 'round';  // Gives smooth line ends
    ctx.lineWidth = brushSize.value;


    // --- 3. Core Drawing Function ---

    /**
     * Draws a line segment from (lastX, lastY) to (e.offsetX, e.offsetY).
     * @param {MouseEvent} e - The mousemove event object.
     */
    function draw(e) {
        if (!isDrawing) return; // Stop the function if mouse is not down

        // Update drawing style based on controls
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = brushSize.value;

        // Begin the path
        ctx.beginPath();
        
        // Move the drawing start point to the previous coordinates
        ctx.moveTo(lastX, lastY);
        
        // Draw a line to the current mouse coordinates
        ctx.lineTo(e.offsetX, e.offsetY);
        
        // Apply the stroke (i.e., actually draw the line)
        ctx.stroke();

        // Update the last position to the current position for the next segment
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }


    // --- 4. Event Handlers ---

    // A. MOUSE DOWN: Start drawing
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        // Set the starting point for the first line segment
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    // B. MOUSE MOVE: Continue drawing
    canvas.addEventListener('mousemove', draw);

    // C. MOUSE UP: Stop drawing
    window.addEventListener('mouseup', () => {
        isDrawing = false;
    });
    
    // D. MOUSE LEAVE: Stop drawing if the mouse leaves the canvas area
    canvas.addEventListener('mouseout', () => {
        isDrawing = false;
    });
    
    // E. Control Handlers
    
    // Update brush size display when range input changes
    brushSize.addEventListener('input', () => {
        sizeDisplay.textContent = brushSize.value;
        ctx.lineWidth = brushSize.value;
    });

    // Handle clearing the canvas
    clearButton.addEventListener('click', () => {
        // Clear the entire canvas rectangle
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    });
});