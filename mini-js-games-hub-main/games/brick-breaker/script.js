document.addEventListener("DOMContentLoaded", () => {
  const i18n = window.SiteI18n;
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const GAME_WIDTH = canvas.width;
  const GAME_HEIGHT = canvas.height;

  const scoreDisplay = document.getElementById("score");
  const livesDisplay = document.getElementById("lives");
  const startButton = document.getElementById("start-button");
  const gameMessage = document.getElementById("game-message");

  let score = 0;
  let lives = 3;
  let gameRunning = false;
  let animationFrameId;

  const PADDLE_HEIGHT = 10;
  const PADDLE_WIDTH = 75;
  let paddleX = (GAME_WIDTH - PADDLE_WIDTH) / 2;
  let rightPressed = false;
  let leftPressed = false;

  const BALL_RADIUS = 10;
  let x = GAME_WIDTH / 2;
  let y = GAME_HEIGHT - 30;
  let dx = 2;
  let dy = -2;

  const BRICK_ROW_COUNT = 5;
  const BRICK_COLUMN_COUNT = 5;
  const BRICK_WIDTH = 75;
  const BRICK_HEIGHT = 20;
  const BRICK_PADDING = 10;
  const BRICK_OFFSET_TOP = 30;
  const BRICK_OFFSET_LEFT = 30;
  let bricks = [];

  function initializeBricks() {
    bricks = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      bricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
  }

  function drawBricks() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        if (bricks[c][r].status !== 1) continue;

        const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
        const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;

        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        ctx.beginPath();
        ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
      }
    }
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#FF4500";
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, GAME_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = "#4CAF50";
    ctx.fill();
    ctx.closePath();
  }

  function updateScoreAndLives() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
  }

  function collisionDetection() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const brick = bricks[c][r];
        if (brick.status !== 1) continue;

        if (x > brick.x && x < brick.x + BRICK_WIDTH && y > brick.y && y < brick.y + BRICK_HEIGHT) {
          dy = -dy;
          brick.status = 0;
          score += 10;
          updateScoreAndLives();

          if (score === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT * 10) {
            gameOver(true);
            return;
          }
        }
      }
    }
  }

  function movePaddle() {
    if (rightPressed && paddleX < GAME_WIDTH - PADDLE_WIDTH) {
      paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
      paddleX -= 7;
    }
  }

  function draw() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    movePaddle();

    if (x + dx > GAME_WIDTH - BALL_RADIUS || x + dx < BALL_RADIUS) {
      dx = -dx;
    }

    if (y + dy < BALL_RADIUS) {
      dy = -dy;
    } else if (y + dy > GAME_HEIGHT - BALL_RADIUS - PADDLE_HEIGHT) {
      if (x > paddleX && x < paddleX + PADDLE_WIDTH) {
        dy = -dy;
      } else {
        lives--;
        updateScoreAndLives();

        if (lives === 0) {
          gameOver(false);
        } else {
          x = GAME_WIDTH / 2;
          y = GAME_HEIGHT - 30;
          dx = 2;
          dy = -2;
          paddleX = (GAME_WIDTH - PADDLE_WIDTH) / 2;
        }
      }
    }

    x += dx;
    y += dy;
    animationFrameId = requestAnimationFrame(draw);
  }

  function startGame() {
    if (gameRunning) return;

    score = 0;
    lives = 3;
    initializeBricks();
    x = GAME_WIDTH / 2;
    y = GAME_HEIGHT - 30;
    dx = 2;
    dy = -2;
    paddleX = (GAME_WIDTH - PADDLE_WIDTH) / 2;

    updateScoreAndLives();
    gameMessage.textContent = "";
    startButton.style.display = "none";

    gameRunning = true;
    draw();
  }

  function gameOver(win) {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    gameMessage.textContent = win
      ? i18n.t("gameBrick.win", { score })
      : i18n.t("gameBrick.gameOver", { score });
    startButton.textContent = i18n.t("gameBrick.playAgain");
    startButton.style.display = "block";
  }

  function keyDownHandler(event) {
    if (event.key === "Right" || event.key === "ArrowRight") {
      rightPressed = true;
    } else if (event.key === "Left" || event.key === "ArrowLeft") {
      leftPressed = true;
    }
  }

  function keyUpHandler(event) {
    if (event.key === "Right" || event.key === "ArrowRight") {
      rightPressed = false;
    } else if (event.key === "Left" || event.key === "ArrowLeft") {
      leftPressed = false;
    }
  }

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);
  startButton.addEventListener("click", startGame);

  gameMessage.textContent = i18n.t("gameBrick.ready");
  startButton.textContent = i18n.t("gameBrick.start");
  updateScoreAndLives();

  window.addEventListener("site-language-change", () => {
    if (!gameRunning && startButton.style.display !== "none" && score + lives !== 3) {
      startButton.textContent = i18n.t("gameBrick.playAgain");
      return;
    }

    startButton.textContent = i18n.t("gameBrick.start");
    if (!gameRunning && score === 0 && lives === 3) {
      gameMessage.textContent = i18n.t("gameBrick.ready");
    }
  });
});
