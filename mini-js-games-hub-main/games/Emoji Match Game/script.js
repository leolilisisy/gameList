const grid = document.getElementById("grid");
const movesEl = document.getElementById("moves");
const timerEl = document.getElementById("timer");
const restartBtn = document.getElementById("restart-btn");

let moves = 0;
let time = 0;
let timerInterval;
let flippedCards = [];
let matchedCount = 0;

// Emoji deck
const emojis = ["🍎","🍌","🍇","🍒","🍉","🍍","🥝","🍑"];
let deck = [...emojis, ...emojis]; // duplicate for pairs

// Shuffle function
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Create cards
function createGrid() {
  grid.innerHTML = "";
  shuffle(deck).forEach((emoji) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <div class="front">${emoji}</div>
      <div class="back">❓</div>
    `;
    card.addEventListener("click", flipCard);
    grid.appendChild(card);
  });
}

// Flip logic
function flipCard(e) {
  const card = e.currentTarget;
  if (card.classList.contains("flipped") || flippedCards.length === 2) return;

  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    movesEl.textContent = moves;
    checkMatch();
  }
}

// Check for match
function checkMatch() {
  const [first, second] = flippedCards;
  const firstEmoji = first.querySelector(".front").textContent;
  const secondEmoji = second.querySelector(".front").textContent;

  if (firstEmoji === secondEmoji) {
    matchedCount++;
    flippedCards = [];
    if (matchedCount === emojis.length) {
      clearInterval(timerInterval);
      setTimeout(() => alert(`🎉 You won in ${moves} moves and ${formatTime(time)}!`), 200);
    }
  } else {
    setTimeout(() => {
      first.classList.remove("flipped");
      second.classList.remove("flipped");
      flippedCards = [];
    }, 800);
  }
}

// Timer
function startTimer() {
  clearInterval(timerInterval);
  time = 0;
  timerInterval = setInterval(() => {
    time++;
    timerEl.textContent = formatTime(time);
  }, 1000);
}

// Format time
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2,"0");
  const secs = (seconds % 60).toString().padStart(2,"0");
  return `${mins}:${secs}`;
}

// Restart
restartBtn.addEventListener("click", () => {
  moves = 0;
  movesEl.textContent = moves;
  matchedCount = 0;
  flippedCards = [];
  createGrid();
  startTimer();
});

// Initial setup
createGrid();
startTimer();
