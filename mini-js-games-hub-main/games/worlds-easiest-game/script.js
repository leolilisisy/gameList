const easyBtn = document.getElementById("easy-btn");
const feedback = document.getElementById("feedback");
const resetBtn = document.getElementById("reset-btn");

const successMessages = [
    "🎉 Congrats! You’re a genius!",
    "✨ That was too easy, right?",
    "🏆 You’ve won! Incredible!",
    "😁 You nailed it instantly!",
    "🚀 Success! That was lightning fast!"
];

const failureMessages = [
    "😅 Try again, it's really easy!",
    "🤔 Almost! But not quite...",
    "😜 Don’t overthink it!",
];

// Handle click
easyBtn.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * successMessages.length);
    feedback.textContent = successMessages[randomIndex];

    // Hide main button, show reset
    easyBtn.classList.add("hidden");
    resetBtn.classList.remove("hidden");
});

// Reset game
resetBtn.addEventListener("click", () => {
    feedback.textContent = "";
    easyBtn.classList.remove("hidden");
    resetBtn.classList.add("hidden");
});
