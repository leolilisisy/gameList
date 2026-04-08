const gameGrid = document.getElementById("game-grid");
const movesEl = document.getElementById("moves");
const timerEl = document.getElementById("timer");
const restartBtn = document.getElementById("restart-btn");

let moves = 0;
let matched = 0;
let flippedCards = [];
let lockBoard = false;
let timer = 0;
let interval;

// Define card values (8 pairs)
const icons = ["🍎","🍌","🍇","🍉","🍒","🥝","🍑","🍍"];
let cardsArray = [...icons, ...icons];

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function startGame() {
  // Reset variables
  gameGrid.innerHTML = "";
  moves = 0;
  matched = 0;
  flippedCards = [];
  lockBoard = false;
  movesEl.textContent = moves;
  timer = 0;
  timerEl.textContent = timer;
  clearInterval(interval);
  interval = setInterval(() => {
    timer++;
    timerEl.textContent = timer;
  }, 1000);

  const shuffled = shuffle(cardsArray);
  shuffled.forEach((icon) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">?</div>
        <div class="card-back">${icon}</div>
      </div>
    `;
    gameGrid.appendChild(card);

    card.addEventListener("click", () => flipCard(card));
  });
}

function flipCard(card) {
  if (lockBoard || card.classList.contains("flip")) return;
  card.classList.add("flip");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    movesEl.textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  const [first, second] = flippedCards;
  const firstIcon = first.querySelector(".card-back").textContent;
  const secondIcon = second.querySelector(".card-back").textContent;

  if (firstIcon === secondIcon) {
    matched += 2;
    flippedCards = [];
    if (matched === cardsArray.length) {
      setTimeout(() => alert(`🎉 You won in ${moves} moves and ${timer} seconds!`), 300);
      clearInterval(interval);
    }
  } else {
    lockBoard = true;
    setTimeout(() => {
      first.classList.remove("flip");
      second.classList.remove("flip");
      flippedCards = [];
      lockBoard = false;
    }, 1000);
  }
}

restartBtn.addEventListener("click", startGame);

// Initialize game on load
startGame();
