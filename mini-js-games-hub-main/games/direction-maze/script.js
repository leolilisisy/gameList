const mazeContainer = document.getElementById("maze");
const movesEl = document.getElementById("moves");
const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");

const moveSound = document.getElementById("move-sound");
const goalSound = document.getElementById("goal-sound");
const hitSound = document.getElementById("hit-sound");

let maze = [];
let playerPos = {x: 0, y: 0};
let moves = 0;
let timer = 0;
let interval;
let paused = false;

// Maze layout (S = start, G = goal, ↑↓←→ = arrows, X = obstacle)
const layout = [
  ["S","→","→","↓","X"],
  ["X","↓","X","↓","↓"],
  ["→","→","→","→","↓"],
  ["X","↓","X","→","G"]
];

function drawMaze() {
  mazeContainer.innerHTML = "";
  maze = [];
  for(let i=0;i<layout.length;i++){
    maze[i] = [];
    for(let j=0;j<layout[i].length;j++){
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.textContent = layout[i][j];
      
      if(layout[i][j]==="S") tile.classList.add("start");
      if(layout[i][j]==="G") tile.classList.add("goal");
      if(["↑","↓","←","→"].includes(layout[i][j])) tile.classList.add("arrow");
      if(layout[i][j]==="X") tile.classList.add("obstacle");
      
      mazeContainer.appendChild(tile);
      maze[i][j] = tile;
    }
  }
  placePlayer();
}

function placePlayer() {
  maze[playerPos.x][playerPos.y].classList.add("player");
}

function removePlayer() {
  maze[playerPos.x][playerPos.y].classList.remove("player");
}

function movePlayer(dir) {
  if(paused) return;
  removePlayer();
  const current = layout[playerPos.x][playerPos.y];
  
  // Move according to current tile
  if(current==="→") playerPos.y +=1;
  else if(current==="←") playerPos.y -=1;
  else if(current==="↑") playerPos.x -=1;
  else if(current==="↓") playerPos.x +=1;
  else return;
  
  // Bounds check
  if(playerPos.x<0||playerPos.x>=layout.length||playerPos.y<0||playerPos.y>=layout[0].length){
    playerPos.x = Math.max(0,Math.min(playerPos.x,layout.length-1));
    playerPos.y = Math.max(0,Math.min(playerPos.y,layout[0].length-1));
    hitSound.play();
  } else {
    moveSound.play();
  }
  
  // Check goal
  if(layout[playerPos.x][playerPos.y]==="G"){
    placePlayer();
    goalSound.play();
    clearInterval(interval);
    alert(`🎉 You reached the goal in ${moves} moves and ${timer}s!`);
    return;
  }
  
  placePlayer();
  moves++;
  movesEl.textContent = moves;
}

function startGame(){
  drawMaze();
  moves=0;
  timer=0;
  movesEl.textContent = moves;
  timerEl.textContent = timer;
  paused = false;
  clearInterval(interval);
  interval = setInterval(()=> {
    if(!paused) timer++;
    timerEl.textContent = timer;
    movePlayer(); // auto move per tile
  }, 800);
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", ()=>paused=true);
resumeBtn.addEventListener("click", ()=>paused=false);
restartBtn.addEventListener("click", startGame);
