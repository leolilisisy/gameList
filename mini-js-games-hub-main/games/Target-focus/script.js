let score = 0;

function spawnTarget() {
  const target = document.createElement("div");
  target.classList.add("target");

  // Random position
  const x = Math.random() * (window.innerWidth - 60);
  const y = Math.random() * (window.innerHeight - 60);
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  document.body.appendChild(target);

  // Click event
  target.onclick = () => {
    score++;
    document.getElementById("score").innerText = `Score: ${score}`;
    target.remove();
  };

  // Remove if not clicked in 800ms
  setTimeout(() => {
    if (document.body.contains(target)) {
      target.remove();
      score = Math.max(0, score - 1); // Penalty for missing
      document.getElementById("score").innerText = `Score: ${score}`;
    }
  }, 800);
}

// Spawn target every second
setInterval(spawnTarget, 1000);
