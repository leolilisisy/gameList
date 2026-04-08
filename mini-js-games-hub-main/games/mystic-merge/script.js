// Mystic Merge Game
const gridSize = 5;
let grid = [];
let selectedOrb = null;
let score = 0;
let level = parseInt(localStorage.getItem('mysticMergeLevel') || 1);
let progress = 0;
let objective = {type: 'rune', level: 2};

const gridElement = document.getElementById('grid');
const orbSelection = document.getElementById('orbSelection');
const progressBar = document.getElementById('progressBar');
const objectiveElement = document.getElementById('objective');
const levelElement = document.getElementById('level');
const scoreElement = document.getElementById('score');
const resetBtn = document.getElementById('resetBtn');
const nextBtn = document.getElementById('nextBtn');

function initGame() {
  createGrid();
  createOrbSelection();
  updateUI();
  selectedOrb = null;
  score = 0;
  progress = 0;
  updateProgress();
  nextBtn.style.display = 'none';
}

function createGrid() {
  grid = [];
  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = null;
    }
  }
  renderGrid();
}

function renderGrid() {
  gridElement.innerHTML = '';
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = i;
      cell.dataset.col = j;
      if (grid[i][j]) {
        const orb = document.createElement('div');
        orb.className = `orb level${grid[i][j]}`;
        orb.textContent = grid[i][j];
        cell.appendChild(orb);
      }
      cell.addEventListener('click', () => handleCellClick(i, j));
      gridElement.appendChild(cell);
    }
  }
}

function createOrbSelection() {
  orbSelection.innerHTML = '';
  const availableLevels = Math.min(3 + Math.floor(level / 2), 7);
  for (let i = 1; i <= availableLevels; i++) {
    const orb = document.createElement('div');
    orb.className = `selection-orb level${i}`;
    orb.textContent = i;
    orb.dataset.level = i;
    orb.addEventListener('click', () => selectOrb(i));
    orbSelection.appendChild(orb);
  }
}

function selectOrb(level) {
  selectedOrb = level;
  document.querySelectorAll('.selection-orb').forEach(orb => orb.classList.remove('selected'));
  document.querySelector(`.selection-orb[data-level="${level}"]`).classList.add('selected');
}

function handleCellClick(row, col) {
  if (selectedOrb && !grid[row][col]) {
    grid[row][col] = selectedOrb;
    selectedOrb = null;
    document.querySelectorAll('.selection-orb').forEach(orb => orb.classList.remove('selected'));
    renderGrid();
    checkMerges();
    updateProgress();
  }
}

function checkMerges() {
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (grid[i][j]) {
          // Check adjacent cells
          const directions = [[0,1], [1,0], [0,-1], [-1,0]];
          for (const [di, dj] of directions) {
            const ni = i + di, nj = j + dj;
            if (ni >= 0 && ni < gridSize && nj >= 0 && nj < gridSize && grid[ni][nj] === grid[i][j]) {
              // Merge
              const newLevel = grid[i][j] + 1;
              grid[i][j] = newLevel;
              grid[ni][nj] = null;
              score += newLevel * 10;
              merged = true;
              // Animate
              const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"] .orb`);
              if (cell) {
                cell.classList.add('merging');
                setTimeout(() => cell.classList.remove('merging'), 600);
                createParticles(cell);
              }
              break;
            }
          }
          if (merged) break;
        }
      }
      if (merged) break;
    }
  }
  renderGrid();
}

function createParticles(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.setProperty('--angle', (i * 45) + 'deg');
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }
}

function updateProgress() {
  let maxRune = 0;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] && grid[i][j] > maxRune) maxRune = grid[i][j];
    }
  }
  if (objective.type === 'rune') {
    progress = Math.min(maxRune / objective.level, 1);
  }
  progressBar.style.width = (progress * 100) + '%';
  if (progress >= 1) {
    nextBtn.style.display = 'inline-block';
  }
  scoreElement.textContent = 'Score: ' + score;
}

function updateUI() {
  levelElement.textContent = 'Level: ' + level;
  objectiveElement.textContent = `Reach Rune Level ${objective.level}`;
}

function nextLevel() {
  level++;
  localStorage.setItem('mysticMergeLevel', level);
  objective.level = Math.min(objective.level + 1, 7);
  initGame();
}

resetBtn.addEventListener('click', initGame);
nextBtn.addEventListener('click', nextLevel);

initGame();