# 🤝 Contributing to Mini JS Games Hub

Thank you for your interest in contributing! ❤️  
This project is open to everyone — from beginners to pros.

---
 
## 🧩 Ways You Can Contribute
- Add a **new mini-game**
- Fix **bugs or typos**
- Improve the **UI/UX**
- Write better **documentation**
- Suggest new **game ideas**

---

## 🛠️ How to Add a New Game

1. **Fork** this repository.  
2. **Create a folder** for your game under `/games/` (e.g., `/games/snake/`).  
3. Inside that folder, create:
   ```
   index.html
   style.css
   script.js
   ```
4. Add your game to the `games` array in `script.js`:
   ```javascript
   const games = [
     // ... existing games ...
     {
       name: "Your Game Name",
       path: "games/yourgame/index.html",
     },
   ];
   ```

5. Ensure your game appears automatically on the main page.
6. **Create an issue** first describing the game you want to add and wait for it to be assigned to you.
7. **Commit and push** your changes:
   ```bash
   git add .
   git commit -m "Added Your Game Name 🎮"
   git push origin main
   ```
8. Open a **Pull Request (PR)** and describe your game, referencing the issue number.

> 🎉 **Event Alert!** Join [Open Odyssey 2.0](https://open-odyssey.samarthtmsl.in) by Team Samarth, an official MLH event and flagship Hacktoberfest edition. From Oct 1-31, this global event unites developers and innovators on impactful projects.

---

## 🧹 Coding Guidelines
- Keep your code **simple and readable**.  
- Use **plain HTML, CSS, and JS** (no external libraries unless necessary).  
- Make sure the game runs directly in the browser.

---

## ⏳ Stale Issue & PR Policy  
### To keep the repository clean and active, we automatically mark inactive issues and pull requests as stale:  
- If an issue or PR has **no activity for 5 days**, it will be **marked as stale** with a comment.  
- If it remains inactive for **another 2 days**, it may be **automatically closed**.
- You can **remove the `stale` label** or **comment on the thread** to keep it open.

### This helps contributors focus on active work and keeps the project manageable. 🚀 

---

## 💬 Need Help?
Open an [issue](https://github.com/ritaban06/mini-js-games-hub/issues) for questions or discussions.  
We’re happy to guide you!

---

## 🌟 Reminder
This is a community-driven project.  
Let’s keep it fun, beginner-friendly, and educational for everyone!
