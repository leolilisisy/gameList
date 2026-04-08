const correctOrder = [
    "bottom bun",
    "patty",
    "cheese",
    "lettuce",
    "tomato",
    "top bun"
  ];
  
  let currentIndex = 0;
  const builtBurger = document.getElementById("built-burger");
  const message = document.getElementById("message");
  
  document.querySelectorAll(".ingredient").forEach(btn => {
    btn.addEventListener("click", () => {
      const chosen = btn.dataset.item;
      if (chosen === correctOrder[currentIndex]) {
        const layer = document.createElement("div");
        layer.textContent = chosen;
        layer.className = "layer";
        builtBurger.appendChild(layer);
        currentIndex++;
        message.textContent = "Nice! Keep going 🍔";
  
        if (currentIndex === correctOrder.length) {
          message.textContent = "🎉 You made a perfect burger!";
        }
      } else {
        message.textContent = "❌ Wrong ingredient! Try again.";
      }
    });
  });
  