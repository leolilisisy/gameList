const emojis = ["🍎", "🍌", "🍇", "🍒", "🍉", "🍍", "🍓", "🥝"];
let cards = [...emojis, ...emojis];
let flipped = [];
let matched = [];

const board = document.getElementById("game-board");
const statusText = document.getElementById("status");

shuffle(cards);
cards.forEach((emoji) => {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.emoji = emoji;
  card.addEventListener("click", flipCard);
  board.appendChild(card);
});

function flipCard() {
  if (flipped.length === 2 || this.classList.contains("flipped")) return;
  this.classList.add("flipped");
  this.textContent = this.dataset.emoji;
  flipped.push(this);

  if (flipped.length === 2) {
    setTimeout(checkMatch, 700);
  }
}

function checkMatch() {
  const [card1, card2] = flipped;
  if (card1.dataset.emoji === card2.dataset.emoji) {
    matched.push(card1, card2);
    if (matched.length === cards.length) {
      statusText.textContent = "🎉 You matched them all!";
    }
  } else {
    card1.classList.remove("flipped");
    card2.classList.remove("flipped");
    card1.textContent = "";
    card2.textContent = "";
  }
  flipped = [];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
