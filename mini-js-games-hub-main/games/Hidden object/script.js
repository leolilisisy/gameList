const objects = document.querySelectorAll(".object");
const foundCountDisplay = document.getElementById("foundCount");
const restartBtn = document.getElementById("restartBtn");
const message = document.getElementById("message");

let foundCount = 0;
const totalObjects = objects.length;

function handleObjectClick(e) {
  const obj = e.target;

  if (obj.classList.contains("found")) return;

  obj.classList.add("found");
  foundCount++;
  foundCountDisplay.textContent = Found: ${foundCount} / ${totalObjects};
  playSound();

  if (foundCount === totalObjects) {
    setTimeout(() => {
      message.textContent = "🎉 You found all the hidden objects!";
    }, 200);
  } else {
    message.textContent = ✅ You found: ${obj.dataset.name};
    setTimeout(() => (message.textContent = ""), 1500);
  }
}

function restartGame() {
  foundCount = 0;
  foundCountDisplay.textContent = Found: 0 / ${totalObjects};
  message.textContent = "";
  objects.forEach(obj => obj.classList.remove("found"));
}

function playSound() {
  const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_50f34169e4.mp3?filename=click-124467.mp3");
  audio.volume = 0.4;
  audio.play();
}

objects.forEach(obj => obj.addEventListener("click", handleObjectClick));
restartBtn.addEventListener("click", restartGame);
