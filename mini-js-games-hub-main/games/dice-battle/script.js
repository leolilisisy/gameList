const dice1Img = document.querySelector("#dice1 img");
const dice2Img = document.querySelector("#dice2 img");
const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");
const roundEl = document.getElementById("round");
const lastRollEl = document.getElementById("lastRoll");

const rollBtn = document.getElementById("rollBtn");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");

const rollSound = document.getElementById("rollSound");
const winSound = document.getElementById("winSound");

let score1 = 0;
let score2 = 0;
let round = 1;
let paused = false;

function rollDice() {
  if(paused) return;

  rollSound.currentTime = 0;
  rollSound.play();

  const roll1 = Math.floor(Math.random() * 6) + 1;
  const roll2 = Math.floor(Math.random() * 6) + 1;

  dice1Img.src = `https://upload.wikimedia.org/wikipedia/commons/${["1/1b","5/5a","2/26","f/f5","a/a0","2/2c"][roll1-1]}/Dice-${roll1}-b.svg`;
  dice2Img.src = `https://upload.wikimedia.org/wikipedia/commons/${["1/1b","5/5a","2/26","f/f5","a/a0","2/2c"][roll2-1]}/Dice-${roll2}-b.svg`;

  dice1Img.classList.add("dice-roll");
  dice2Img.classList.add("dice-roll");

  setTimeout(() => {
    dice1Img.classList.remove("dice-roll");
    dice2Img.classList.remove("dice-roll");

    if(roll1 > roll2) score1++;
    else if(roll2 > roll1) score2++;
    // tie => no change

    score1El.textContent = score1;
    score2El.textContent = score2;
    lastRollEl.textContent = `P1: ${roll1} | P2: ${roll2}`;
    round++;
    roundEl.textContent = round;

    if(score1 >= 5 || score2 >= 5) {
      winSound.play();
      alert(`Game Over! ${score1 > score2 ? "Player 1 Wins 🎉" : "Player 2 Wins 🎉"}`);
      rollBtn.disabled = true;
    }
  }, 500);
}

rollBtn.addEventListener("click", rollDice);

restartBtn.addEventListener("click", () => {
  score1 = 0;
  score2 = 0;
  round = 1;
  score1El.textContent = 0;
  score2El.textContent = 0;
  roundEl.textContent = 1;
  lastRollEl.textContent = "-";
  rollBtn.disabled = false;
});

pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume ▶️" : "Pause ⏸️";
});
