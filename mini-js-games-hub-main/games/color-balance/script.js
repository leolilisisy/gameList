const targetColorBox = document.getElementById("target-color");
const currentColorBox = document.getElementById("current-color");
const redSlider = document.getElementById("red-slider");
const greenSlider = document.getElementById("green-slider");
const blueSlider = document.getElementById("blue-slider");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const practiceBtn = document.getElementById("practice-btn");
const challengeBtn = document.getElementById("challenge-btn");
const successSound = document.getElementById("success-sound");
const failSound = document.getElementById("fail-sound");

let targetColor = {r:0, g:0, b:0};
let timer = 30;
let score = 0;
let interval = null;
let running = false;

function randomColor() {
    return {
        r: Math.floor(Math.random()*256),
        g: Math.floor(Math.random()*256),
        b: Math.floor(Math.random()*256)
    };
}

function updateCurrentColor() {
    const r = parseInt(redSlider.value);
    const g = parseInt(greenSlider.value);
    const b = parseInt(blueSlider.value);
    currentColorBox.style.background = `rgb(${r},${g},${b})`;
}

function updateTargetColor() {
    targetColorBox.style.background = `rgb(${targetColor.r},${targetColor.g},${targetColor.b})`;
}

function colorDistance(c1,c2){
    return Math.sqrt((c1.r-c2.r)**2 + (c1.g-c2.g)**2 + (c1.b-c2.b)**2)/441.67;
}

function startGame(duration=30){
    targetColor = randomColor();
    updateTargetColor();
    timer = duration;
    timerEl.textContent = timer;
    running = true;
    interval = setInterval(()=>{
        if(timer>0) {
            timer--;
            timerEl.textContent = timer;
        } else {
            endRound();
        }
    },1000);
}

function pauseGame(){
    running = false;
    clearInterval(interval);
}

function restartGame(){
    pauseGame();
    score=0;
    scoreEl.textContent=score;
    startGame();
}

function endRound(){
    pauseGame();
    const currentColor = {
        r: parseInt(redSlider.value),
        g: parseInt(greenSlider.value),
        b: parseInt(blueSlider.value)
    };
    const dist = colorDistance(currentColor,targetColor);
    const roundScore = Math.max(0, Math.floor((1-dist)*1000));
    score += roundScore;
    scoreEl.textContent = score;
    if(roundScore>800){
        successSound.play();
    } else {
        failSound.play();
    }
    alert(`Round finished! Score: ${roundScore}`);
    startGame();
}

startBtn.addEventListener("click", ()=> startGame());
pauseBtn.addEventListener("click", ()=> pauseGame());
restartBtn.addEventListener("click", ()=> restartGame());
practiceBtn.addEventListener("click", ()=> startGame(999));
challengeBtn.addEventListener("click", ()=> startGame(15));

redSlider.addEventListener("input", updateCurrentColor);
greenSlider.addEventListener("input", updateCurrentColor);
blueSlider.addEventListener("input", updateCurrentColor);

// initial color
updateCurrentColor();
