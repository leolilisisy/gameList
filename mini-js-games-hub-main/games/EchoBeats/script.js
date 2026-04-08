const pads = document.querySelectorAll('.pad');
const startBtn = document.getElementById('start-btn');
const statusText = document.getElementById('status');
const levelText = document.getElementById('level');
const scoreText = document.getElementById('score');

let sequence = [];
let playerSequence = [];
let level = 0;
let score = 0;
let canClick = false;

function playSound(id) {
  const sound = document.getElementById(id);
  sound.currentTime = 0;
  sound.play();
}

function flashPad(pad) {
  pad.classList.add('active');
  playSound(pad.dataset.sound);
  setTimeout(() => pad.classList.remove('active'), 500);
}

function nextSequence() {
  playerSequence = [];
  canClick = false;
  level++;
  levelText.textContent = level;
  statusText.textContent = "Watch closely...";

  const randomPad = pads[Math.floor(Math.random() * pads.length)];
  sequence.push(randomPad);

  let i = 0;
  const interval = setInterval(() => {
    flashPad(sequence[i]);
    i++;
    if (i >= sequence.length) {
      clearInterval(interval);
      canClick = true;
      statusText.textContent = "Now repeat the pattern!";
    }
  }, 800);
}

pads.forEach(pad => {
  pad.addEventListener('click', () => {
    if (!canClick) return;

    flashPad(pad);
    playerSequence.push(pad);

    const index = playerSequence.length - 1;
    if (playerSequence[index] !== sequence[index]) {
      statusText.textContent = "❌ Wrong! Game Over!";
      canClick = false;
      sequence = [];
      level = 0;
      score = 0;
      levelText.textContent = "0";
      scoreText.textContent = "0";
      return;
    }

    if (playerSequence.length === sequence.length) {
      score += level * 10;
      scoreText.textContent = score;
      setTimeout(nextSequence, 1000);
    }
  });
});

startBtn.addEventListener('click', () => {
  sequence = [];
  level = 0;
  score = 0;
  scoreText.textContent = "0";
  levelText.textContent = "0";
  statusText.textContent = "Get ready...";
  setTimeout(nextSequence, 1000);
});
