const grid = document.getElementById("grid");
const nextContainer = document.getElementById("next-blocks-container");
const scoreEl = document.getElementById("score");
const gameOverEl = document.getElementById("game-over");
const finalScoreEl = document.getElementById("final-score");
const restartBtn = document.getElementById("restart");
const restartOverBtn = document.getElementById("restart-over");

const GRID_SIZE = 10;
let gridArray = [];
let score = 0;
let nextBlocks = [];

const BLOCKS = [
    [[1]],
    [[1,1]],
    [[1],[1]],
    [[1,1,1]],
    [[1],[1],[1]],
    [[1,1],[1,1]],
    [[1,1,1],[0,1,0]]
];

// Initialize grid
function initGrid() {
    grid.innerHTML = "";
    gridArray = Array.from({length: GRID_SIZE}, () => Array(GRID_SIZE).fill(0));
    for (let r=0; r<GRID_SIZE; r++) {
        for (let c=0; c<GRID_SIZE; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = r;
            cell.dataset.col = c;
            grid.appendChild(cell);
        }
    }
}

// Draw blocks on grid
function drawGrid() {
    document.querySelectorAll(".cell").forEach(cell => {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        cell.classList.toggle("filled", gridArray[r][c] === 1);
    });
}

// Generate random block
function generateBlocks() {
    nextBlocks = [];
    for(let i=0;i<3;i++){
        const rand = BLOCKS[Math.floor(Math.random()*BLOCKS.length)];
        nextBlocks.push(rand);
    }
    drawNextBlocks();
}

// Draw preview blocks
function drawNextBlocks() {
    nextContainer.innerHTML = "";
    nextBlocks.forEach(block => {
        const blockDiv = document.createElement("div");
        blockDiv.classList.add("block");
        block.forEach(row => {
            row.forEach(cell => {
                const cellDiv = document.createElement("div");
                cellDiv.classList.add("cell");
                if(cell) cellDiv.classList.add("filled");
                blockDiv.appendChild(cellDiv);
            });
        });
        nextContainer.appendChild(blockDiv);
    });
}

// Check if block can be placed at row,col
function canPlace(block,row,col){
    for(let r=0;r<block.length;r++){
        for(let c=0;c<block[0].length;c++){
            if(block[r][c]===1){
                const newR=row+r, newC=col+c;
                if(newR>=GRID_SIZE || newC>=GRID_SIZE || gridArray[newR][newC]===1) return false;
            }
        }
    }
    return true;
}

// Place block
function placeBlock(block,row,col){
    for(let r=0;r<block.length;r++){
        for(let c=0;c<block[0].length;c++){
            if(block[r][c]===1) gridArray[row+r][col+c]=1;
        }
    }
    checkRowsCols();
    drawGrid();
}

// Clear full rows and columns
function checkRowsCols(){
    for(let r=0;r<GRID_SIZE;r++){
        if(gridArray[r].every(cell=>cell===1)){
            gridArray[r].fill(0);
            score += GRID_SIZE;
        }
    }
    for(let c=0;c<GRID_SIZE;c++){
        let full = true;
        for(let r=0;r<GRID_SIZE;r++){
            if(gridArray[r][c]===0) full=false;
        }
        if(full){
            for(let r=0;r<GRID_SIZE;r++) gridArray[r][c]=0;
            score += GRID_SIZE;
        }
    }
    scoreEl.textContent = score;
}

// Check game over
function checkGameOver(){
    const canPlaceAny = nextBlocks.some(block=>{
        for(let r=0;r<GRID_SIZE;r++){
            for(let c=0;c<GRID_SIZE;c++){
                if(canPlace(block,r,c)) return true;
            }
        }
        return false;
    });
    if(!canPlaceAny){
        finalScoreEl.textContent = score;
        gameOverEl.classList.remove("hidden");
    }
}

// Restart game
function restartGame(){
    score=0;
    scoreEl.textContent=score;
    gameOverEl.classList.add("hidden");
    initGrid();
    generateBlocks();
}

// Handle block placement on click
nextContainer.addEventListener("click", (e)=>{
    const blockIndex = Array.from(nextContainer.children).indexOf(e.target.closest(".block"));
    if(blockIndex===-1) return;
    const block = nextBlocks[blockIndex];
    // Find first placeable spot (simple auto-place for demo)
    outer:
    for(let r=0;r<GRID_SIZE;r++){
        for(let c=0;c<GRID_SIZE;c++){
            if(canPlace(block,r,c)){
                placeBlock(block,r,c);
                nextBlocks.splice(blockIndex,1);
                generateBlocks();
                checkGameOver();
                break outer;
            }
        }
    }
});

// Event listeners
restartBtn.addEventListener("click", restartGame);
restartOverBtn.addEventListener("click", restartGame);

// Initialize game
initGrid();
generateBlocks();
drawGrid();
