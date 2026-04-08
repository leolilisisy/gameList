let rows = 10;
let cols = 10;
let minesCount = 15;
let grid = [];
let gameOver = false;

const gridEl = document.getElementById('grid');
const messageEl = document.getElementById('message');
const rowsInput = document.getElementById('rows');
const colsInput = document.getElementById('cols');
const minesInput = document.getElementById('mines');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

startBtn.addEventListener('click', () => {
  rows = parseInt(rowsInput.value);
  cols = parseInt(colsInput.value);
  minesCount = parseInt(minesInput.value);
  startGame();
});

restartBtn.addEventListener('click', startGame);

function startGame() {
  grid = [];
  gameOver = false;
  messageEl.textContent = '';
  gridEl.innerHTML = '';
  gridEl.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

  // Initialize grid
  for(let r=0; r<rows; r++){
    grid[r] = [];
    for(let c=0; c<cols; c++){
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      gridEl.appendChild(cell);
      grid[r][c] = {
        element: cell,
        mine: false,
        revealed: false,
        flagged: false,
        adjacent: 0
      };

      cell.addEventListener('click', () => revealCell(r,c));
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        flagCell(r,c);
      });
    }
  }

  // Place mines
  let placed = 0;
  while(placed < minesCount){
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if(!grid[r][c].mine){
      grid[r][c].mine = true;
      placed++;
    }
  }

  // Calculate adjacent numbers
  for(let r=0; r<rows; r++){
    for(let c=0; c<cols; c++){
      if(!grid[r][c].mine){
        grid[r][c].adjacent = countAdjacentMines(r,c);
      }
    }
  }
}

function countAdjacentMines(r,c){
  let count = 0;
  for(let i=-1; i<=1; i++){
    for(let j=-1; j<=1; j++){
      if(r+i >=0 && r+i<rows && c+j>=0 && c+j<cols){
        if(grid[r+i][c+j].mine) count++;
      }
    }
  }
  return count;
}

function revealCell(r,c){
  if(gameOver) return;
  const cell = grid[r][c];
  if(cell.revealed || cell.flagged) return;
  cell.revealed = true;
  cell.element.classList.add('revealed');

  if(cell.mine){
    cell.element.classList.add('mine');
    endGame(false);
  } else {
    if(cell.adjacent > 0){
      cell.element.textContent = cell.adjacent;
    } else {
      // Reveal neighbors recursively
      for(let i=-1;i<=1;i++){
        for(let j=-1;j<=1;j++){
          const nr = r+i, nc = c+j;
          if(nr>=0 && nr<rows && nc>=0 && nc<cols){
            revealCell(nr,nc);
          }
        }
      }
    }
  }

  checkWin();
}

function flagCell(r,c){
  if(gameOver) return;
  const cell = grid[r][c];
  if(cell.revealed) return;
  cell.flagged = !cell.flagged;
  cell.element.classList.toggle('flag');
}

function endGame(won){
  gameOver = true;
  messageEl.textContent = won ? '🎉 You Win!' : '💥 Game Over!';
  // Reveal all mines
  if(!won){
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        if(grid[r][c].mine){
          grid[r][c].element.classList.add('revealed','mine');
        }
      }
    }
  }
}

function checkWin(){
  let revealedCount = 0;
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      if(grid[r][c].revealed) revealedCount++;
    }
  }
  if(revealedCount === rows*cols - minesCount){
    endGame(true);
  }
}

// Start default game
startGame();
