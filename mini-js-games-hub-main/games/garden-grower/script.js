const garden = document.getElementById('garden');
const message = document.getElementById('message');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const bgMusic = document.getElementById('bg-music');

let soilSpots = [];
let growthIntervals = [];
let isRunning = false;

const plantColors = ["#76c893","#ff6f61","#ffcc33","#8e44ad","#3498db"];

function createGarden(spots = 12) {
    garden.innerHTML = '';
    soilSpots = [];
    for (let i = 0; i < spots; i++) {
        const soil = document.createElement('div');
        soil.className = 'soil';
        soil.dataset.plantStage = 0;
        soil.addEventListener('click', () => plantSeed(soil));
        garden.appendChild(soil);
        soilSpots.push(soil);
    }
}

function plantSeed(soil) {
    if(!isRunning) return;
    if(soil.dataset.plantStage > 0) return;
    
    soil.dataset.plantStage = 1;
    const plant = document.createElement('div');
    plant.className = 'plant';
    plant.style.background = plantColors[Math.floor(Math.random()*plantColors.length)];
    soil.appendChild(plant);

    let stage = 1;
    const interval = setInterval(() => {
        if(!isRunning) return;
        stage++;
        if(stage > 5) {
            clearInterval(interval);
            return;
        }
        soil.dataset.plantStage = stage;
        plant.style.height = 20 + stage*10 + 'px';
        plant.style.width = 20 + stage*10 + 'px';
        plant.style.boxShadow = `0 0 ${10*stage}px ${stage*5}px ${plant.style.background}`;
    }, 2000);
    growthIntervals.push(interval);
}

startBtn.addEventListener('click', () => {
    isRunning = true;
    bgMusic.play();
    message.textContent = "Garden is growing 🌱";
});

pauseBtn.addEventListener('click', () => {
    isRunning = false;
    bgMusic.pause();
    message.textContent = "Paused ⏸️";
});

restartBtn.addEventListener('click', () => {
    isRunning = false;
    bgMusic.pause();
    bgMusic.currentTime = 0;
    growthIntervals.forEach(i=>clearInterval(i));
    growthIntervals = [];
    createGarden();
    message.textContent = "Restarted 🌸";
});

createGarden();
