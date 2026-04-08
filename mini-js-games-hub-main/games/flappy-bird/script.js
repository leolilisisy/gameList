const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const scoreNode = document.getElementById("score");
const i18n = window.SiteI18n;

const BASE_W = 320;
const BASE_H = 480;
const ASPECT = BASE_H / BASE_W;

let DPR = window.devicePixelRatio || 1;
let W = BASE_W;
let H = BASE_H;
let frame = 0;
let gameState = "menu";
let score = 0;

canvas.setAttribute("role", "application");
canvas.tabIndex = 0;

function updateUiText() {
  scoreNode.textContent = i18n.t("gameFlappy.score", { score });
  pauseBtn.textContent = gameState === "paused"
    ? i18n.t("gameFlappy.resume")
    : i18n.t("gameFlappy.pause");
}

function resizeCanvas() {
  DPR = window.devicePixelRatio || 1;
  const container = canvas.parentElement || document.body;
  const maxWidth = Math.min(window.innerWidth - 40, 720);
  const cssWidth = Math.min(container.clientWidth - 24 || BASE_W, maxWidth);
  const cssHeight = Math.round(cssWidth * ASPECT);

  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(cssWidth * DPR);
  canvas.height = Math.round(cssHeight * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  W = cssWidth;
  H = cssHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const bird = {
  x: 60,
  y: H / 2,
  r: 12,
  vy: 0,
  gravity: 0.45,
  lift: -8,
  draw() {
    ctx.fillStyle = "#ffeb3b";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.fillRect(this.x + 6, this.y - 3, 6, 4);
  },
  update() {
    this.vy += this.gravity;
    this.y += this.vy;
    if (this.y + this.r > H) {
      this.y = H - this.r;
      this.vy = 0;
      gameState = "over";
      updateUiText();
    }
    if (this.y - this.r < 0) {
      this.y = this.r;
      this.vy = 0;
    }
  },
};

class Pipe {
  constructor(x) {
    this.w = Math.round(48 * (W / BASE_W));
    this.gap = Math.round(120 * (W / BASE_W));
    this.x = x;
    this.top = Math.random() * (H - 160) + 40;
    this.passed = false;
  }

  draw() {
    ctx.fillStyle = "#2e8b57";
    ctx.fillRect(this.x, 0, this.w, this.top);
    ctx.fillRect(this.x, this.top + this.gap, this.w, H - (this.top + this.gap));
  }

  update() {
    this.x -= 2 * (W / BASE_W);
    if (!this.passed && this.x + this.w < bird.x) {
      score++;
      this.passed = true;
      updateUiText();
    }
  }
}

let pipes = [];

function reset() {
  frame = 0;
  score = 0;
  bird.y = H / 2;
  bird.vy = 0;
  pipes = [new Pipe(W + 30), new Pipe(W + 190)];
  gameState = "play";
  updateUiText();
}

function spawnIfNeeded() {
  if (pipes.length < 3 && pipes[pipes.length - 1].x < W - 140) {
    pipes.push(new Pipe(W + 30));
  }
}

function checkCollisions() {
  for (const pipe of pipes) {
    if (bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + pipe.w) {
      if (bird.y - bird.r < pipe.top || bird.y + bird.r > pipe.top + pipe.gap) {
        gameState = "over";
        updateUiText();
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.ellipse(40 + ((frame / 3) % W), 60, 32, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  pipes.forEach((pipe) => pipe.draw());
  bird.draw();

  ctx.fillStyle = "#012";
  ctx.font = `${Math.round(20 * (W / BASE_W))}px monospace`;
  ctx.fillText(score, W - 40, 28);

  if (gameState === "menu") {
    ctx.font = `${Math.round(16 * (W / BASE_W))}px sans-serif`;
    ctx.fillText(i18n.t("gameFlappy.startHint"), 22, H / 2 + 80);
  }

  if (gameState === "over") {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(20, H / 2 - 40, W - 40, 80);
    ctx.fillStyle = "#fff";
    ctx.font = `${Math.round(22 * (W / BASE_W))}px sans-serif`;
    ctx.fillText(i18n.t("gameFlappy.gameOver"), W / 2 - 52, H / 2);
    ctx.fillText(i18n.t("gameFlappy.score", { score }), W / 2 - 52, H / 2 + 28);
  }
}

function update() {
  if (gameState === "play") {
    frame++;
    pipes.forEach((pipe) => pipe.update());
    pipes = pipes.filter((pipe) => pipe.x + pipe.w > -10);
    spawnIfNeeded();
    bird.update();
    checkCollisions();
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function flap() {
  if (gameState === "menu" || gameState === "over") {
    reset();
  }
  bird.vy = bird.lift;
}

function togglePause() {
  if (gameState === "play") {
    gameState = "paused";
  } else if (gameState === "paused") {
    gameState = "play";
  }
  updateUiText();
}

canvas.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "Enter") {
    event.preventDefault();
    flap();
  }
  if (event.code === "KeyP") {
    togglePause();
  }
});

canvas.addEventListener("click", flap);
startBtn.addEventListener("click", () => {
  reset();
  canvas.focus();
});
pauseBtn.addEventListener("click", togglePause);

window.addEventListener("site-language-change", updateUiText);

setTimeout(resizeCanvas, 50);
updateUiText();
loop();
