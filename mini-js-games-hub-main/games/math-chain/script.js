const targetEl = document.getElementById("target-number");
const tilesContainer = document.getElementById("tiles-container");
const expressionEl = document.getElementById("current-expression");
const resultEl = document.getElementById("current-result");
const messageEl = document.getElementById("message");

const clickSound = document.getElementById("click-sound");
const successSound = document.getElementById("success-sound");
const errorSound = document.getElementById("error-sound");

let targetNumber;
let tiles = [];
let currentExpression = [];
let paused = false;

// Operators and numbers
const operators = ["+", "-", "*", "/"];
const numbers = Array.from({length: 9}, (_, i) => (i+1).toString());

// Utility to shuffle array
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Generate new round
function generateRound() {
  targetNumber = Math.floor(Math.random() * 50) + 10;
  targetEl.textContent = targetNumber;

  tiles = shuffle([...numbers, ...operators, ...numbers, ...operators]);
  tilesContainer.innerHTML = "";
  tiles.forEach(val => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = val;
    tile.addEventListener("click", () => {
      if(paused) return;
      clickSound.play();
      currentExpression.push(val);
      updateExpression();
    });
    tilesContainer.appendChild(tile);
  });

  currentExpression = [];
  updateExpression();
  messageEl.textContent = "";
}

// Update expression display
function updateExpression() {
  expressionEl.innerHTML = "";
  currentExpression.forEach((val, idx) => {
    const span = document.createElement("span");
    span.textContent = val;
    span.addEventListener("click", () => {
      if(paused) return;
      currentExpression.splice(idx, 1);
      updateExpression();
    });
    expressionEl.appendChild(span);
  });
  resultEl.textContent = currentExpression.length ? "= ?" : "= ?";
}

// Submit expression
document.getElementById("submit-btn").addEventListener("click", () => {
  if(paused) return;
  try {
    const expr = currentExpression.join("");
    const evalResult = Function('"use strict";return (' + expr + ')')();
    if(Math.abs(evalResult - targetNumber) < 0.0001){
      successSound.play();
      messageEl.textContent = "✅ Correct! Next round...";
      setTimeout(generateRound, 1500);
    } else {
      errorSound.play();
      messageEl.textContent = `❌ Incorrect! Result: ${evalResult}`;
    }
  } catch {
    errorSound.play();
    messageEl.textContent = "❌ Invalid Expression!";
  }
});

// Undo
document.getElementById("undo-btn").addEventListener("click", () => {
  if(paused) return;
  currentExpression.pop();
  updateExpression();
  clickSound.play();
});

// Restart
document.getElementById("restart-btn").addEventListener("click", () => {
  paused = false;
  document.getElementById("resume-btn").hidden = true;
  document.getElementById("pause-btn").hidden = false;
  generateRound();
});

// Pause / Resume
document.getElementById("pause-btn").addEventListener("click", () => {
  paused = true;
  document.getElementById("pause-btn").hidden = true;
  document.getElementById("resume-btn").hidden = false;
  messageEl.textContent = "⏸️ Game Paused";
});

document.getElementById("resume-btn").addEventListener("click", () => {
  paused = false;
  document.getElementById("pause-btn").hidden = false;
  document.getElementById("resume-btn").hidden = true;
  messageEl.textContent = "";
});

// Initialize game
generateRound();
