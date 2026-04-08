const board = document.getElementById("board");
const messageEl = document.getElementById("message");
const rotateSound = document.getElementById("rotate-sound");
const successSound = document.getElementById("success-sound");
const failSound = document.getElementById("fail-sound");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");

let gamePaused = false;

// Game nodes setup (6x6)
const rows = 6;
const cols = 6;
let nodes = [];

function createBoard() {
    board.innerHTML = "";
    nodes = [];
    for (let i = 0; i < rows * cols; i++) {
        const node = document.createElement("div");
        node.classList.add("node");
        node.dataset.index = i;
        // Randomly add obstacle
        if (Math.random() < 0.15) {
            node.dataset.obstacle = "true";
            node.style.background = "#333";
        } else {
            node.dataset.obstacle = "false";
        }
        node.addEventListener("click", () => rotateNode(i));
        board.appendChild(node);
        nodes.push(node);
    }
    messageEl.textContent = "";
}

function rotateNode(index) {
    if (gamePaused) return;
    const node = nodes[index];
    if (node.dataset.obstacle === "true") return;

    node.classList.toggle("glow");
    rotateSound.play();
    checkWin();
}

function checkWin() {
    const activeNodes = nodes.filter(n => n.dataset.obstacle === "false" && n.classList.contains("glow"));
    const totalActive = nodes.filter(n => n.dataset.obstacle === "false").length;
    if (activeNodes.length === totalActive) {
        messageEl.textContent = "🎉 All nodes connected! You win!";
        messageEl.style.color = "#0ff";
        successSound.play();
    }
}

// Controls
pauseBtn.addEventListener("click", () => {
    gamePaused = true;
    messageEl.textContent = "⏸ Game Paused";
    messageEl.style.color = "#ff0";
});

resumeBtn.addEventListener("click", () => {
    gamePaused = false;
    messageEl.textContent = "▶ Game Resumed";
    messageEl.style.color = "#0ff";
});

restartBtn.addEventListener("click", () => {
    gamePaused = false;
    createBoard();
});

// Initial board
createBoard();
