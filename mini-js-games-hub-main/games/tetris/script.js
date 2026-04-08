document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('tetris-grid');
  const width = 10;
  const height = 20;
  const cells = [];
  const scoreDisplay = document.getElementById('score');
  const levelDisplay = document.getElementById('level');
  const linesDisplay = document.getElementById('lines');
  const nextGrid = document.getElementById('next-grid');
  const holdGrid = document.getElementById('hold-grid');
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');

  let timerId;
  let score = 0;
  let level = 1;
  let lines = 0;
  let currentPosition = 4;
  let currentRotation = 0;
  let current;
  let nextRandom = 0;
  let hold = null;
  let canHold = true;
  let gamePaused = false;

  // create grid
  for (let i = 0; i < width * height; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    grid.appendChild(cell);
    cells.push(cell);
  }

  // Tetrominoes
  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ];

  const zTetromino = [
    [0,width,width+1,width*2+1],
    [width+1,width+2,width*2,width*2+1],
    [0,width,width+1,width*2+1],
    [width+1,width+2,width*2,width*2+1]
  ];

  const tTetromino = [
    [1,width,width+1,width+2],
    [1,width+1,width+2,width*2+1],
    [width,width+1,width+2,width*2+1],
    [1,width,width+1,width*2+1]
  ];

  const oTetromino = [
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1]
  ];

  const iTetromino = [
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3],
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3]
  ];

  const tetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

  // random tetromino
  function randomTetromino() {
    const rand = Math.floor(Math.random() * tetrominoes.length);
    return rand;
  }

  function draw() {
    current.forEach(index => {
      cells[currentPosition + index].classList.add('active');
    });
  }

  function undraw() {
    current.forEach(index => {
      cells[currentPosition + index].classList.remove('active');
    });
  }

  function moveDown() {
    if (!gamePaused) {
      undraw();
      currentPosition += width;
      draw();
      freeze();
    }
  }

  function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
    if (!isAtLeftEdge) currentPosition -=1;
    if (current.some(index => cells[currentPosition + index].classList.contains('taken'))) currentPosition +=1;
    draw();
  }

  function moveRight() {
    undraw();
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width-1);
    if (!isAtRightEdge) currentPosition +=1;
    if (current.some(index => cells[currentPosition + index].classList.contains('taken'))) currentPosition -=1;
    draw();
  }

  function rotate() {
    undraw();
    currentRotation++;
    if (currentRotation === current.length) currentRotation = 0;
    current = tetrominoes[random][currentRotation];
    draw();
  }

  function freeze() {
    if (current.some(index => cells[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(index => cells[currentPosition + index].classList.add('taken'));
      // start new tetromino
      random = nextRandom;
      nextRandom = randomTetromino();
      current = tetrominoes[random][currentRotation];
      currentPosition = 4;
      draw();
      displayNext();
      addScore();
      gameOver();
      canHold = true;
    }
  }

  function displayNext() {
    nextGrid.innerHTML = '';
    for (let i=0;i<16;i++){
      const cell = document.createElement('div');
      cell.classList.add('cell');
      nextGrid.appendChild(cell);
    }
    const next = tetrominoes[nextRandom][0];
    next.forEach(index => nextGrid.querySelectorAll('.cell')[index].classList.add('active'));
  }

  function holdTetromino() {
    if (!canHold) return;
    undraw();
    if (hold === null) {
      hold = random;
      random = nextRandom;
      nextRandom = randomTetromino();
    } else {
      [hold, random] = [random, hold];
    }
    current = tetrominoes[random][currentRotation];
    currentPosition = 4;
    draw();
    displayNext();
    canHold = false;
  }

  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = Array.from({length: width}, (_, k) => i + k);
      if (row.every(index => cells[index].classList.contains('taken'))) {
        score += 10;
        lines += 1;
        scoreDisplay.textContent = score;
        linesDisplay.textContent = lines;
        row.forEach(index => {
          cells[index].classList.remove('taken');
          cells[index].classList.remove('active');
        });
        const removed = cells.splice(i, width);
        cells.unshift(...removed);
        cells.forEach(cell => grid.appendChild(cell));
      }
    }
    if (lines % 10 === 0 && lines !== 0) {
      level += 1;
      levelDisplay.textContent = level;
      clearInterval(timerId);
      timerId = setInterval(moveDown, 1000 - (level*100));
    }
  }

  function gameOver() {
    if (current.some(index => cells[currentPosition + index].classList.contains('taken'))) {
      clearInterval(timerId);
      alert("Game Over! Score: " + score);
    }
  }

  // Controls
  document.addEventListener('keydown', e => {
    if (!gamePaused) {
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
      if (e.key === 'ArrowDown') moveDown();
      if (e.key === 'ArrowUp' || e.key === ' ') rotate();
      if (e.key.toLowerCase() === 'c') holdTetromino();
    }
  });

  startBtn.addEventListener('click', () => {
    if (timerId) clearInterval(timerId);
    random = randomTetromino();
    nextRandom = randomTetromino();
    current = tetrominoes[random][currentRotation];
    draw();
    displayNext();
    timerId = setInterval(moveDown, 1000);
    score = 0; lines = 0; level = 1;
    scoreDisplay.textContent = score;
    linesDisplay.textContent = lines;
    levelDisplay.textContent = level;
  });

  pauseBtn.addEventListener('click', () => {
    gamePaused = !gamePaused;
    if (!gamePaused) timerId = setInterval(moveDown, 1000 - (level*100));
    else clearInterval(timerId);
  });
});
