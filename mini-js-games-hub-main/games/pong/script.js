const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

const paddleWidth = 12;
const paddleHeight = 96;
const paddleSpeed = 6;

const ballSize = 12;

const left = {
  x: 20,
  y: H / 2 - paddleHeight / 2,
  dy: 0,
  score: 0,
};

const right = {
  x: W - 20 - paddleWidth,
  y: H / 2 - paddleHeight / 2,
  dy: 0,
  score: 0,
};

const ball = {
  x: W / 2 - ballSize / 2,
  y: H / 2 - ballSize / 2,
  vx: 4 * (Math.random() > 0.5 ? 1 : -1),
  vy: 2 * (Math.random() > 0.5 ? 1 : -1),
};

let keys = {};
let playCPU = true;

const restartBtn = document.getElementById('restart');
const cpuToggle = document.getElementById('cpuToggle');
const i18n = window.SiteI18n;

cpuToggle.checked = playCPU;
cpuToggle.addEventListener('change', () => (playCPU = cpuToggle.checked));

restartBtn.addEventListener('click', reset);

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

function reset() {
  left.y = H / 2 - paddleHeight / 2;
  right.y = H / 2 - paddleHeight / 2;
  left.score = 0;
  right.score = 0;
  ball.x = W / 2 - ballSize / 2;
  ball.y = H / 2 - ballSize / 2;
  ball.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
  ball.vy = 2 * (Math.random() > 0.5 ? 1 : -1);
}

function update() {
  // player controls: w/s for left, ArrowUp/ArrowDown for right (when not CPU)
  if (keys['w']) left.y -= paddleSpeed;
  if (keys['s']) left.y += paddleSpeed;
  if (!playCPU) {
    if (keys['arrowup']) right.y -= paddleSpeed;
    if (keys['arrowdown']) right.y += paddleSpeed;
  }

  // clamp paddles
  left.y = Math.max(0, Math.min(H - paddleHeight, left.y));
  right.y = Math.max(0, Math.min(H - paddleHeight, right.y));

  // simple CPU: follow ball with some damping
  if (playCPU) {
    const target = ball.y - paddleHeight / 2 + ballSize / 2;
    const diff = target - right.y;
    right.y += Math.sign(diff) * Math.min(Math.abs(diff), 4.2);
  }

  // move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // top/bottom collision
  if (ball.y <= 0) {
    ball.y = 0;
    ball.vy *= -1;
  }
  if (ball.y + ballSize >= H) {
    ball.y = H - ballSize;
    ball.vy *= -1;
  }

  // paddle collisions
  if (
    ball.x <= left.x + paddleWidth &&
    ball.x >= left.x &&
    ball.y + ballSize >= left.y &&
    ball.y <= left.y + paddleHeight
  ) {
    ball.x = left.x + paddleWidth;
    ball.vx = Math.abs(ball.vx) + 0.5;
    // add some vertical based on where it hit
    const hitPos = (ball.y + ballSize / 2) - (left.y + paddleHeight / 2);
    ball.vy = hitPos * 0.06;
  }

  if (
    ball.x + ballSize >= right.x &&
    ball.x + ballSize <= right.x + paddleWidth &&
    ball.y + ballSize >= right.y &&
    ball.y <= right.y + paddleHeight
  ) {
    ball.x = right.x - ballSize;
    ball.vx = -Math.abs(ball.vx) - 0.5;
    const hitPos = (ball.y + ballSize / 2) - (right.y + paddleHeight / 2);
    ball.vy = hitPos * 0.06;
  }

  // score
  if (ball.x + ballSize < 0) {
    right.score++;
    serve(-1);
  } else if (ball.x > W) {
    left.score++;
    serve(1);
  }
}

function serve(direction = (Math.random() > 0.5 ? 1 : -1)) {
  ball.x = W / 2 - ballSize / 2;
  ball.y = H / 2 - ballSize / 2;
  ball.vx = 4 * direction;
  ball.vy = 2 * (Math.random() > 0.5 ? 1 : -1);
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // middle line
  ctx.fillStyle = '#ffffff22';
  for (let y = 20; y < H; y += 28) {
    ctx.fillRect(W / 2 - 2, y, 4, 16);
  }

  // paddles
  ctx.fillStyle = '#61dafb';
  ctx.fillRect(left.x, left.y, paddleWidth, paddleHeight);
  ctx.fillRect(right.x, right.y, paddleWidth, paddleHeight);

  // ball
  ctx.fillStyle = '#e6eef8';
  ctx.fillRect(ball.x, ball.y, ballSize, ballSize);

  // scores
  ctx.fillStyle = '#cfe8f6';
  ctx.font = '28px system-ui, Segoe UI, Arial';
  ctx.textAlign = 'center';
  ctx.fillText(left.score.toString(), W / 2 - 72, 44);
  ctx.fillText(right.score.toString(), W / 2 + 72, 44);

  // hints
  ctx.font = '12px system-ui, Segoe UI, Arial';
  ctx.fillStyle = '#9fb3c8';
  ctx.fillText(i18n.t('gamePong.leftHint'), 52, H - 18);
  ctx.fillText(i18n.t('gamePong.rightHint'), W - 58, H - 18);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

reset();
requestAnimationFrame(loop);
