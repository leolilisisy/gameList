# Dodge the Blocks

## Game Details  
**Name:** Dodge the Blocks  
**Description:**  
*Dodge the Blocks* is a fun, browser-based arcade game where you control a green square and try to dodge falling red blocks. Every block you successfully avoid increases your score by one point. The game ends when a block collides with your player — how long can you survive?

---

## Files Included  
- [x] **index.html**  
  - Sets up the main structure of the game.  
  - Links the CSS and JavaScript files.  
  - Includes the game container, player, and score display.  

- [x] **style.css**  
  - Defines the game’s look and layout.  
  - Styles the player, blocks, and game area.  
  - Uses a clean dark theme for contrast and readability.  

- [x] **script.js**  
  - Contains the game’s functionality and logic.  
  - Handles player movement via arrow keys.  
  - Spawns falling blocks at random positions.  
  - Detects collisions and manages the score system.  

---

## Additional Notes  

### **Controls**  
- Press **Left Arrow (←)** to move left.  
- Press **Right Arrow (→)** to move right.  

### **Gameplay Mechanics**  
- Red blocks fall continuously from the top of the game area.  
- Each block avoided adds **+1** to your score.  
- The game automatically restarts after a **Game Over** alert.  

### **Customization Ideas**  
- Change the `fallSpeed` variable in **script.js** to adjust difficulty.  
- Modify `setInterval(createBlock, 800)` to control block spawn rate.  
- Add sound effects, animations, or a restart button for a polished experience.  

---

## How to Play  
1. Open **index.html** in your web browser.  
2. Use the arrow keys to dodge falling red blocks.  
3. Try to get the highest score possible!  

---

## Built With  
- **HTML5** — Structure  
- **CSS3** — Styling  
- **JavaScript (ES6)** — Game Logic  

---

## Author Notes  
This project is a great starting point for learning basic **game development with JavaScript**.  
You can expand it by adding new features like multiple block types, increasing speed, or even a leaderboard!

---

✨ *Have fun dodging those blocks!*
