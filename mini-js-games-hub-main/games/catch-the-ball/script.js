const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const startBtn = document.getElementById("start-btn");

let score = 0;
let playing = false;
let timer;

function randomPosition() {
  const x = Math.random() * (gameArea.clientWidth - 60);
  const y = Math.random() * (gameArea.clientHeight - 60);
  return { x, y };
}

function createBall() {
  const ball = document.createElement("div");
  ball.classList.add("ball");
  const { x, y } = randomPosition();
  ball.style.left = `${x}px`;
  ball.style.top = `${y}px`;

  ball.addEventListener("click", () => {
    score++;
    scoreDisplay.textContent = score;
    ball.remove();
    spawnBall();
  });

  gameArea.appendChild(ball);
}

function spawnBall() {
  if (playing) {
    createBall();
    clearTimeout(timer);
    timer = setTimeout(() => {
      const balls = document.querySelectorAll(".ball");
      if (balls.length) balls.forEach(b => b.remove());
      spawnBall();
    }, 1000);
  }
}

startBtn.addEventListener("click", () => {
  if (playing) return;
  score = 0;
  scoreDisplay.textContent = score;
  playing = true;
  startBtn.textContent = "Playing...";
  startBtn.disabled = true;

  spawnBall();

  // End game after 30 seconds
  setTimeout(() => {
    playing = false;
    clearTimeout(timer);
    document.querySelectorAll(".ball").forEach(b => b.remove());
    alert(`Game Over! Your final score is ${score}.`);
    startBtn.textContent = "Start Game";
    startBtn.disabled = false;
  }, 30000);
});
