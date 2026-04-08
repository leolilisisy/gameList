// Coordinates of differences (x, y, width, height) relative to image
const differences = [
  { x: 120, y: 80, w: 40, h: 40 },
  { x: 280, y: 150, w: 35, h: 35 },
  { x: 50, y: 220, w: 30, h: 30 },
  { x: 360, y: 300, w: 25, h: 25 },
  { x: 200, y: 350, w: 30, h: 30 }
];

let foundCount = 0;
const totalDiff = differences.length;
const img2 = document.getElementById('img2');
const foundDisplay = document.getElementById('found');
const totalDisplay = document.getElementById('total-diff');
const timerDisplay = document.getElementById('timer');
const message = document.getElementById('message');
let timeLeft = 60;
let timer;

totalDisplay.textContent = totalDiff;
foundDisplay.textContent = foundCount;

// Start Timer
function startTimer() {
  clearInterval(timer);
  timeLeft = 60;
  timerDisplay.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      message.textContent = `⏰ Time's up! You found ${foundCount} out of ${totalDiff} differences.`;
    }
  }, 1000);
}

// Check if click is inside a difference area
function isInDiff(x, y, diff) {
  return x >= diff.x && x <= diff.x + diff.w && y >= diff.y && y <= diff.y + diff.h;
}

// Handle click
img2.addEventListener('click', (e) => {
  const rect = img2.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  let hit = false;
  differences.forEach((diff, index) => {
    if (!diff.found && isInDiff(clickX, clickY, diff)) {
      diff.found = true;
      hit = true;
      foundCount++;
      foundDisplay.textContent = foundCount;

      const marker = document.createElement('div');
      marker.classList.add('found-marker');
      marker.style.left = `${diff.x}px`;
      marker.style.top = `${diff.y}px`;
      img2.parentElement.appendChild(marker);

      if (foundCount === totalDiff) {
        clearInterval(timer);
        message.textContent = "🎉 Congratulations! You found all differences!";
      }
    }
  });

  if (!hit) {
    const wrongMarker = document.createElement('div');
    wrongMarker.classList.add('wrong-marker');
    wrongMarker.style.left = `${clickX - 15}px`;
    wrongMarker.style.top = `${clickY - 15}px`;
    img2.parentElement.appendChild(wrongMarker);
    setTimeout(() => wrongMarker.remove(), 800);
  }
});

// Restart game
document.getElementById('restart').addEventListener('click', () => {
  foundCount = 0;
  foundDisplay.textContent = foundCount;
  message.textContent = '';
  differences.forEach(diff => diff.found = false);

  // Remove markers
  document.querySelectorAll('.found-marker').forEach(el => el.remove());
  document.querySelectorAll('.wrong-marker').forEach(el => el.remove());

  startTimer();
});

// Initialize
startTimer();
