// --- DOM Elements ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const winOverlay = document.getElementById('win-overlay');
const nextLevelBtn = document.getElementById('next-level-btn');
const levelDisplay = document.getElementById('level-display');
const movesCountEl = document.getElementById('moves-count');
const timerDisplayEl = document.getElementById('timer-display');
const winStatsEl = document.getElementById('win-stats');
const hintBtn = document.getElementById('hint-btn');
const restartBtn = document.getElementById('restart-btn');

// --- Game Constants ---
const NODE_RADIUS = 15;
const NODE_COLOR = '#3498db';
const NODE_DRAG_COLOR = '#f1c40f';
const LINE_COLOR = '#ecf0f1';
const LINE_INTERSECT_COLOR = '#e74c3c';
const PADDING = 40;

// --- Game State ---
let nodes = [];
let lines = [];
let selectedNodeIndex = -1;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
let currentLevel = 0;
let moveCount = 0;
let timerInterval;
let startTime;
let hintNodeIndex = -1;

// --- Level Generation & Game Flow ---
function generateLevel(levelNumber) {
    nodes = [];
    lines = [];
    const numNodes = Math.min(15, 4 + levelNumber);
    const numLines = Math.floor(numNodes * (1.2 + levelNumber * 0.1));
    for (let i = 0; i < numNodes; i++) {
        nodes.push({ x: PADDING + Math.random() * (canvas.width - PADDING * 2), y: PADDING + Math.random() * (canvas.height - PADDING * 2) });
    }
    const connectedNodes = new Set();
    for (let i = 0; i < numNodes - 1; i++) { lines.push([i, i + 1]); connectedNodes.add(`${i}-${i+1}`); }
    while (lines.length < numLines) {
        const nodeA = Math.floor(Math.random() * numNodes);
        const nodeB = Math.floor(Math.random() * numNodes);
        const connection1 = `${nodeA}-${nodeB}`; const connection2 = `${nodeB}-${nodeA}`;
        if (nodeA !== nodeB && !connectedNodes.has(connection1) && !connectedNodes.has(connection2)) {
            lines.push([nodeA, nodeB]); connectedNodes.add(connection1);
        }
    }
}

function loadLevel(levelIndex) {
    currentLevel = levelIndex;
    moveCount = 0;
    movesCountEl.textContent = moveCount;
    generateLevel(currentLevel);
    
    winOverlay.classList.add('hidden');
    levelDisplay.textContent = `Level: ${currentLevel + 1}`;
    startTimer();
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const intersectingLines = findIntersectingLines();
    
    lines.forEach((line, index) => {
        const [startNode, endNode] = [nodes[line[0]], nodes[line[1]]];
        ctx.beginPath();
        ctx.moveTo(startNode.x, startNode.y);
        ctx.lineTo(endNode.x, endNode.y);
        ctx.lineWidth = 4;
        ctx.strokeStyle = intersectingLines.has(index) ? LINE_INTERSECT_COLOR : LINE_COLOR;
        ctx.stroke();
    });

    nodes.forEach((node, index) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = (index === selectedNodeIndex) ? NODE_DRAG_COLOR : NODE_COLOR;
        ctx.fill();
        if (index === hintNodeIndex) { ctx.strokeStyle = NODE_DRAG_COLOR; ctx.lineWidth = 3; ctx.stroke(); }
    });

    if (intersectingLines.size === 0 && lines.length > 0) {
        levelComplete();
    }
}

function levelComplete() {
    stopTimer();
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    winStatsEl.innerHTML = `Moves: ${moveCount} &nbsp; | &nbsp; Time: ${timeTaken}s`;
    winOverlay.classList.remove('hidden');
    saveGame();
}

// --- Scoring and Timer ---
function startTimer() {
    startTime = Date.now();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        timerDisplayEl.textContent = `${seconds}s`;
    }, 1000);
}
function stopTimer() { clearInterval(timerInterval); }

// --- Hint System ---
function getHint() {
    const intersectingLines = findIntersectingLines();
    if (intersectingLines.size === 0) return;
    const nodeIntersectionCount = new Array(nodes.length).fill(0);
    intersectingLines.forEach(lineIndex => { const [nodeA, nodeB] = lines[lineIndex]; nodeIntersectionCount[nodeA]++; nodeIntersectionCount[nodeB]++; });
    let maxIntersections = -1;
    let mostTangledNode = -1;
    for (let i = 0; i < nodeIntersectionCount.length; i++) { if (nodeIntersectionCount[i] > maxIntersections) { maxIntersections = nodeIntersectionCount[i]; mostTangledNode = i; } }
    if (mostTangledNode !== -1) {
        hintNodeIndex = mostTangledNode;
        draw();
        hintBtn.disabled = true;
        setTimeout(() => { hintNodeIndex = -1; hintBtn.disabled = false; draw(); }, 1500);
    }
}

// --- Event Handlers ---
canvas.addEventListener('mousedown', (e) => {
    const mousePos = getMousePos(e);
    for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        const dist = Math.sqrt((mousePos.x - node.x) ** 2 + (mousePos.y - node.y) ** 2);
        if (dist < NODE_RADIUS) { isDragging = true; selectedNodeIndex = i; offsetX = mousePos.x - node.x; offsetY = mousePos.y - node.y; break; }
    }
});
canvas.addEventListener('mousemove', (e) => {
    if (isDragging) { const mousePos = getMousePos(e); nodes[selectedNodeIndex].x = mousePos.x - offsetX; nodes[selectedNodeIndex].y = mousePos.y - offsetY; draw(); }
});
canvas.addEventListener('mouseup', () => { if (isDragging) { moveCount++; movesCountEl.textContent = moveCount; } isDragging = false; selectedNodeIndex = -1; draw(); });
canvas.addEventListener('mouseout', () => { if (isDragging) { moveCount++; movesCountEl.textContent = moveCount; } isDragging = false; selectedNodeIndex = -1; draw(); });
nextLevelBtn.addEventListener('click', () => { loadLevel(currentLevel + 1); });
hintBtn.addEventListener('click', getHint);
restartBtn.addEventListener('click', restartGame);

// --- Game Reset Functionality ---
function restartGame() {
    if (confirm("Are you sure you want to restart from Level 1? Your saved progress will be lost.")) {
        localStorage.removeItem('untangle_level');
        loadLevel(0); // Soft reset without reloading page
    }
}

// --- Save/Load Progress ---
function saveGame() { localStorage.setItem('untangle_level', currentLevel + 1); }
function loadGame() {
    const savedLevel = localStorage.getItem('untangle_level');
    currentLevel = savedLevel ? parseInt(savedLevel) : 0;
    loadLevel(currentLevel);
}

// --- Core Intersection Logic (Unchanged) ---
function findIntersectingLines() {
    const intersecting = new Set();
    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            const l1 = lines[i], l2 = lines[j];
            const p1 = nodes[l1[0]], p2 = nodes[l1[1]], p3 = nodes[l2[0]], p4 = nodes[l2[1]];
            if (l1[0] === l2[0] || l1[0] === l2[1] || l1[1] === l2[0] || l1[1] === l2[1]) continue;
            if (doLinesIntersect(p1, p2, p3, p4)) { intersecting.add(i); intersecting.add(j); }
        }
    }
    return intersecting;
}
function doLinesIntersect(p1,p2,p3,p4){function o(p,q,r){const v=(q.y-p.y)*(r.x-q.x)-(q.x-p.x)*(r.y-q.y);if(v===0)return 0;return(v>0)?1:2}function on(p,q,r){return(q.x<=Math.max(p.x,r.x)&&q.x>=Math.min(p.x,r.x)&&q.y<=Math.max(p.y,r.y)&&q.y>=Math.min(p.y,r.y))}const o1=o(p1,p2,p3),o2=o(p1,p2,p4),o3=o(p3,p4,p1),o4=o(p3,p4,p2);if(o1!==o2&&o3!==o4)return true;if(o1===0&&on(p1,p3,p2))return true;if(o2===0&&on(p1,p4,p2))return true;if(o3===0&&on(p3,p1,p4))return true;if(o4===0&&on(p3,p2,p4))return true;return false}

// --- REFACTORED: Utility for Responsive Canvas ---
function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    // Translate mouse coordinates from screen space to canvas's internal 600x600 space
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (evt.clientX - rect.left) * scaleX, y: (evt.clientY - rect.top) * scaleY };
}

// --- Start Game ---
loadGame();