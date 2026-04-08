const board = document.getElementById("game-board");
const moveSound = document.getElementById("move-sound");
const winSound = document.getElementById("win-sound");
const restartBtn = document.getElementById("restart");
const nextLevelBtn = document.getElementById("next-level");
const levelDisplay = document.getElementById("level");

let level = 1;
let grid, player, goal;

const levels = [
  [
    ["P", ".", ".", ".", "W", "."],
    [".", "W", ".", ".", "W", "."],
    [".", ".", ".", ".", ".", "."],
    [".", "W", ".", "W", ".", "."],
    [".", ".", ".", ".", ".", "G"],
    [".", ".", "W", ".", ".", "."],
  ],
  [
    ["P", ".", "W", ".", ".", "."],
    [".", ".", ".", "W", ".", "."],
    [".", "W", ".", ".", ".", "W"],
    [".", ".", ".", "W", ".", "."],
    [".", ".", ".", ".", ".", "G"],
    [".", ".", "W", ".", ".", "."],
  ]
];

function createBoard() {
  board.innerHTML = "";
  grid = levels[level - 1];
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      const div = document.createElement("div");
      div.classList.add("cell");
      if (cell === "W") div.classList.add("wall");
      if (cell === "P") {
        div.classList.add("player");
        player = { x, y };
      }
      if (cell === "G") {
        div.classList.add("goal");
        goal = { x, y };
      }
      board.appendChild(div);
    });
  });
}

function movePlayer(dx, dy) {
  let { x, y } = player;
  while (true) {
    const nx = x + dx;
    const ny = y + dy;
    if (
      ny < 0 ||
      ny >= grid.length ||
      nx < 0 ||
      nx >= grid[0].length ||
      grid[ny][nx] === "W"
    ) break;
    x = nx;
    y = ny;
  }

  if (x === player.x && y === player.y) return;
  moveSound.play();
  grid[player.y][player.x] = ".";
  player.x = x;
  player.y = y;
  grid[y][x] = "P";

  if (x === goal.x && y === goal.y) {
    winSound.play();
    alert("🎉 Level Complete!");
  }

  createBoard();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") movePlayer(0, -1);
  if (e.key === "ArrowDown") movePlayer(0, 1);
  if (e.key === "ArrowLeft") movePlayer(-1, 0);
  if (e.key === "ArrowRight") movePlayer(1, 0);
});

restartBtn.addEventListener("click", () => {
  createBoard();
});

nextLevelBtn.addEventListener("click", () => {
  level = (level % levels.length) + 1;
  levelDisplay.textContent = `Level: ${level}`;
  createBoard();
});

createBoard();
