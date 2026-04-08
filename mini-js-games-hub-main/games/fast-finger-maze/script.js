const gridSize = 5;
let playerPos = { x: 0, y: 0 };
let endPos = { x: gridSize - 1, y: gridSize - 1 };
let timer = 30;
let timerInterval;
let moves = 0;

const mazeGrid = document.getElementById("maze-grid");
const timerEl = document.getElementById("timer");
const movesEl = document.getElementById("moves");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");

function createMaze() {
    mazeGrid.innerHTML = "";
    for(let y=0; y<gridSize; y++){
        for(let x=0; x<gridSize; x++){
            const cell = document.createElement("div");
            cell.classList.add("cell");
            if(x === 0 && y === 0) cell.classList.add("start");
            if(x === endPos.x && y === endPos.y) cell.classList.add("end");
            mazeGrid.appendChild(cell);
        }
    }
    renderPlayer();
}

function renderPlayer() {
    document.querySelectorAll(".cell").forEach(cell => cell.classList.remove("player"));
    const index = playerPos.y * gridSize + playerPos.x;
    mazeGrid.children[index].classList.add("player");
}

function startGame() {
    playerPos = { x: 0, y: 0 };
    moves = 0;
    timer = 30;
    timerEl.textContent = timer;
    movesEl.textContent = moves;
    messageEl.textContent = "";
    createMaze();

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer--;
        timerEl.textContent = timer;
        if(timer <= 0){
            messageEl.textContent = "⏰ Time's up! Try again.";
            clearInterval(timerInterval);
        }
    }, 1000);
}

function resetGame() {
    clearInterval(timerInterval);
    startGame();
}

function handleMove(e) {
    if(timer <= 0) return;

    const key = e.key;
    if(key === "ArrowUp" && playerPos.y > 0) playerPos.y--;
    if(key === "ArrowDown" && playerPos.y < gridSize - 1) playerPos.y++;
    if(key === "ArrowLeft" && playerPos.x > 0) playerPos.x--;
    if(key === "ArrowRight" && playerPos.x < gridSize - 1) playerPos.x++;
    moves++;
    movesEl.textContent = moves;
    renderPlayer();
    checkWin();
}

function checkWin() {
    if(playerPos.x === endPos.x && playerPos.y === endPos.y){
        messageEl.textContent = "🎉 You reached the goal! Well done!";
        clearInterval(timerInterval);
    }
}

// Event listeners
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
window.addEventListener("keydown", handleMove);

// Initialize maze
createMaze();
