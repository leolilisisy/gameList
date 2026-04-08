document.addEventListener('DOMContentLoaded', () => {
    const colorBox = document.getElementById('color-box');
    const scoreDisplay = document.getElementById('score');
    // const backButton = document.getElementById('back-button'); <-- REMOVE THIS LINE

    let score = 0;

    const colors = ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f', '#9b59b6', '#1abc9c'];

    function getRandomColor() {
        const randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex];
    }

    function updateScore() {
        score++;
        scoreDisplay.textContent = score;
    }

    function changeBoxColor() {
        colorBox.style.backgroundColor = getRandomColor();
    }

    colorBox.addEventListener('click', () => {
        updateScore();
        changeBoxColor();
    });
    changeBoxColor();
});