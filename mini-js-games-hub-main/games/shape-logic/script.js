const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const bgMusic = document.getElementById("bg-music");
const snapSound = document.getElementById("snap-sound");
const shapes = document.querySelectorAll(".shape");
const statusText = document.getElementById("status-text");

let isGameActive = false;
let isPaused = false;

startBtn.addEventListener("click", () => {
  if (!isGameActive) {
    isGameActive = true;
    isPaused = false;
    bgMusic.play();
    statusText.textContent = "🎯 Drag and rotate the shapes to match the outline!";
    enableShapeInteraction();
  }
});

pauseBtn.addEventListener("click", () => {
  if (isGameActive) {
    isPaused = !isPaused;
    if (isPaused) {
      bgMusic.pause();
      statusText.textContent = "⏸️ Game Paused";
    } else {
      bgMusic.play();
      statusText.textContent = "🎮 Game Resumed!";
    }
  }
});

restartBtn.addEventListener("click", () => {
  location.reload();
});

function enableShapeInteraction() {
  shapes.forEach(shape => {
    shape.addEventListener("mousedown", startDrag);
    shape.addEventListener("dblclick", rotateShape);
  });
}

function startDrag(e) {
  if (!isGameActive || isPaused) return;

  const shape = e.target;
  let offsetX = e.clientX - shape.getBoundingClientRect().left;
  let offsetY = e.clientY - shape.getBoundingClientRect().top;

  function moveShape(ev) {
    shape.style.position = "absolute";
    shape.style.left = ev.clientX - offsetX + "px";
    shape.style.top = ev.clientY - offsetY + "px";
  }

  function stopDrag() {
    document.removeEventListener("mousemove", moveShape);
    document.removeEventListener("mouseup", stopDrag);
    checkSnap(shape);
  }

  document.addEventListener("mousemove", moveShape);
  document.addEventListener("mouseup", stopDrag);
}

function rotateShape(e) {
  if (!isGameActive || isPaused) return;
  const shape = e.target;
  let angle = parseInt(shape.dataset.rotate) + 45;
  shape.dataset.rotate = angle;
  shape.style.transform = `rotate(${angle}deg)`;
}

function checkSnap(shape) {
  const target = document.getElementById("target-outline").getBoundingClientRect();
  const s = shape.getBoundingClientRect();

  const isNear =
    Math.abs(s.left - target.left) < 30 &&
    Math.abs(s.top - target.top) < 30;

  if (isNear) {
    shape.style.left = target.left + "px";
    shape.style.top = target.top + "px";
    shape.style.filter = "drop-shadow(0 0 25px lime)";
    snapSound.play();
    statusText.textContent = "✨ Shape Snapped!";
  }
}
