// Words of Wonders Game Logic
const words = ["CODE", "NODE", "CONE", "DONE", "ONCE"];
const letters = ["C", "O", "D", "E", "N"];
const totalWords = words.length;

let foundWords = [];
let currentWord = "";

const grid = document.getElementById("grid");
const lettersContainer = document.getElementById("letters-container");
const wordsFoundEl = document.getElementById("words-found");
const totalWordsEl = document.getElementById("total-words");
const messageEl = document.getElementById("message");
const shuffleBtn = document.getElementById("shuffle-btn");
const hintBtn = document.getElementById("hint-btn");
const resetBtn = document.getElementById("reset-btn");

totalWordsEl.textContent = totalWords;

// Initialize crossword grid (placeholder 5x5)
function createGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < 25; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    grid.appendChild(cell);
  }
}

// Render draggable letters
function renderLetters() {
  lettersContainer.innerHTML = "";
  letters.forEach((ltr) => {
    const letterEl = document.createElement("div");
    letterEl.classList.add("letter");
    letterEl.textContent = ltr;
    letterEl.addEventListener("click", () => selectLetter(ltr));
    lettersContainer.appendChild(letterEl);
  });
}

function selectLetter(ltr) {
  currentWord += ltr;
  messageEl.textContent = currentWord;
  if (currentWord.length >= 3) checkWord();
}

function checkWord() {
  if (words.includes(currentWord)) {
    if (!foundWords.includes(currentWord)) {
      foundWords.push(currentWord);
      updateGrid();
      wordsFoundEl.textContent = foundWords.length;
      showMessage(`✅ Found: ${currentWord}`, "#a3be8c");
    } else {
      showMessage("⚠️ Already found!", "#d08770");
    }
  }
  if (foundWords.length === totalWords) {
    showMessage("🎉 All words found! You win!", "#a3be8c");
  }
  currentWord = "";
}

function showMessage(text, color = "#2e3440") {
  messageEl.textContent = text;
  messageEl.style.color = color;
  setTimeout(() => (messageEl.textContent = ""), 2000);
}

function updateGrid() {
  const cells = document.querySelectorAll(".cell");
  for (let i = 0; i < foundWords.length; i++) {
    cells[i].classList.add("filled");
    cells[i].textContent = foundWords[i][0];
  }
}

function shuffleLetters() {
  letters.sort(() => Math.random() - 0.5);
  renderLetters();
}

function showHint() {
  const remaining = words.filter((w) => !foundWords.includes(w));
  if (remaining.length > 0) {
    const hintWord = remaining[0];
    showMessage(`💡 Hint: starts with "${hintWord[0]}"`, "#ebcb8b");
    highlightHint(hintWord[0]);
  } else {
    showMessage("All words found!", "#a3be8c");
  }
}

function highlightHint(char) {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    if (cell.textContent === "") cell.classList.remove("hint");
  });
  const emptyCell = Array.from(cells).find((c) => !c.textContent);
  if (emptyCell) {
    emptyCell.classList.add("hint");
    emptyCell.textContent = char;
  }
}

function resetGame() {
  foundWords = [];
  currentWord = "";
  createGrid();
  renderLetters();
  wordsFoundEl.textContent = "0";
  showMessage("🔁 Game reset!", "#5e81ac");
}

shuffleBtn.addEventListener("click", shuffleLetters);
hintBtn.addEventListener("click", showHint);
resetBtn.addEventListener("click", resetGame);

// Initialize
createGrid();
renderLetters();
