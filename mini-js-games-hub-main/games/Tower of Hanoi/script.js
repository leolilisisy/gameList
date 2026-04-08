const towers = {
  A: document.getElementById("towerA"),
  B: document.getElementById("towerB"),
  C: document.getElementById("towerC")
};

let selectedDisk = null;
let moves = 0;
let diskCount = 3;

const moveCount = document.getElementById("moveCount");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const diskSelector = document.getElementById("diskCount");

const colors = ["#38bdf8", "#818cf8", "#f472b6", "#fb923c", "#4ade80", "#eab308"];

function createDisks(n) {
  for (let tower of Object.values(towers)) tower.innerHTML = '<div class="label">' + tower.id.slice(-1) + '</div>';
  for (let i = n; i > 0; i--) {
    const disk = document.createElement("div");
    disk.className = "disk";
    disk.style.width = 60 + i * 20 + "px";
    disk.style.background = colors[i % colors.length];
    towers.A.appendChild(disk);
  }
  moves = 0;
  moveCount.textContent = "Moves: 0";
  message.textContent = "";
}

function handleTowerClick(e) {
  const tower = e.currentTarget;
  const topDisk = tower.lastElementChild?.classList.contains("label") ? null : tower.lastElementChild;

  if (!selectedDisk) {
    if (!topDisk) return;
    selectedDisk = topDisk;
    selectedDisk.style.transform = "translateY(-20px)";
    selectedDisk.style.filter = "brightness(1.3)";
  } else {
    if (tower === selectedDisk.parentElement) {
      resetDiskSelection();
      return;
    }

    const destTop = topDisk;
    if (!destTop || selectedDisk.offsetWidth < destTop.offsetWidth) {
      tower.appendChild(selectedDisk);
      moves++;
      moveCount.textContent = `Moves: ${moves}`;
      playSound();
      resetDiskSelection();
      checkWin();
    } else {
      shakeTower(tower);
      resetDiskSelection();
    }
  }
}

function shakeTower(tower) {
  tower.style.animation = "shake 0.3s";
  tower.addEventListener("animationend", () => (tower.style.animation = ""), { once: true });
}

function resetDiskSelection() {
  if (selectedDisk) {
    selectedDisk.style.transform = "";
    selectedDisk.style.filter = "";
    selectedDisk = null;
  }
}

function checkWin() {
  if (towers.C.childElementCount - 1 === diskCount) {
    message.textContent = `🎉 You solved it in ${moves} moves!`;
  }
}

function playSound() {
  const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_50f34169e4.mp3?filename=click-124467.mp3");
  audio.volume = 0.4;
  audio.play();
}

startBtn.addEventListener("click", () => {
  diskCount = parseInt(diskSelector.value);
  createDisks(diskCount);
});

Object.values(towers).forEach(t => t.addEventListener("click", handleTowerClick));

createDisks(diskCount);
