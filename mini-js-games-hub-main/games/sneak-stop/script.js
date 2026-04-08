const player = document.getElementById("player");
const guard = document.getElementById("guard");
const light = document.getElementById("light");
const statusText = document.getElementById("statusText");
const bgMusic = document.getElementById("bg-music");
const alertSound = document.getElementById("alert-sound");
const winSound = document.getElementById("win-sound");
const loseSound = document.getElementById("lose-sound");

const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");

let gameRunning = true;
let greenLight = true;
let position = 0;

bgMusic.volume = 0.4;
bgMusic.play();

function toggleLight() {
  if (!gameRunning) return;
  greenLight = !greenLight;
  
  if (greenLight) {
    light.className = "light green";
    guard.style.transform = "rotateY(0deg)";
    statusText.textContent = "🟢 Move!";
  } else {
    light.className = "light red";
    guard.style.transform = "rotateY(180deg)";
    statusText.textContent = "🔴 Stop!";
    alertSound.play();
  }
  
  const nextChange = Math.random() * 3000 + 2000;
  setTimeout(toggleLight, nextChange);
}

function movePlayer() {
  if (!gameRunning || !greenLight) {
    if (!greenLight) loseGame();
    return;
  }
  
  position += 4;
  player.style.left = `${position}px`;
  
  if (position >= 610) winGame();
}

function winGame() {
  gameRunning = false;
  statusText.textContent = "🎉 You Reached the Goal!";
  winSound.play();
}

function loseGame() {
  gameRunning = false;
  statusText.textContent = "💀 Caught! You Moved on Red.";
  loseSound.play();
}

let moveInterval = setInterval(() => {
  if (gameRunning && greenLight) movePlayer();
}, 200);

toggleLight();

pauseBtn.addEventListener("click", () => {
  gameRunning = false;
  bgMusic.pause();
  statusText.textContent = "⏸️ Paused";
  pauseBtn.disabled = true;
  resumeBtn.disabled = false;
});

resumeBtn.addEventListener("click", () => {
  gameRunning = true;
  bgMusic.play();
  statusText.textContent = greenLight ? "🟢 Move!" : "🔴 Stop!";
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
});

restartBtn.addEventListener("click", () => {
  location.reload();
});
