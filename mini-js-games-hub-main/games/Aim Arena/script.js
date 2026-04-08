const canvas = document.getElementById("arena");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart");

let striker, coins, score, dragging;

function resetGame() {
  striker = { x: 200, y: 350, r: 15, dx: 0, dy: 0, color: "#38bdf8" };
  coins = [
    { x: 200, y: 120, r: 10, color: "#facc15" },
    { x: 180, y: 140, r: 10, color: "#f97316" },
    { x: 220, y: 140, r: 10, color: "#ef4444" }
  ];
  score = 0;
  dragging = false;
  scoreEl.textContent = "Score: 0";
}

function drawCircle(x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  coins.forEach(c => drawCircle(c.x, c.y, c.r, c.color));
  drawCircle(striker.x, striker.y, striker.r, striker.color);
}

function update() {
  striker.x += striker.dx;
  striker.y += striker.dy;

  striker.dx *= 0.98;
  striker.dy *= 0.98;

  // Bounce
  if (striker.x < striker.r || striker.x > 400 - striker.r) striker.dx *= -1;
  if (striker.y < striker.r || striker.y > 400 - striker.r) striker.dy *= -1;

  // Collision check
  coins = coins.filter(c => {
    const dist = Math.hypot(striker.x - c.x, striker.y - c.y);
    if (dist < striker.r + c.r) {
      score += 10;
      scoreEl.textContent = Score: ${score};
      return false;
    }
    return true;
  });

  drawBoard();
  requestAnimationFrame(update);
}

canvas.addEventListener("mousedown", () => (dragging = true));
canvas.addEventListener("mouseup", e => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const dx = (striker.x - (e.clientX - rect.left)) / 10;
  const dy = (striker.y - (e.clientY - rect.top)) / 10;
  striker.dx = dx;
  striker.dy = dy;
  dragging = false;
});

restartBtn.addEventListener("click", resetGame);

resetGame();
update();
