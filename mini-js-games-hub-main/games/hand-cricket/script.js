const OPT = [0, 1, 2, 4, 6];
let totalBalls = 0;
let ball = 0;
let wicket = 0;
let score = 0;
let gameActive = false;

const setupSection = document.getElementById('setup-section');
const gameSection = document.getElementById('game-section');
const oversInput = document.getElementById('overs-input');
const currentScoreDisplay = document.getElementById('current-score');
const remainingBallsDisplay = document.getElementById('remaining-balls');
const scoreTableBody = document.querySelector('#score-table tbody');
const bowlerChoiceDisplay = document.getElementById('bowler-choice');
const batsmanChoiceDisplay = document.getElementById('batsman-choice');
const ballResultDisplay = document.getElementById('ball-result');
const runButtons = document.querySelectorAll('.options button');
const resetButton = document.getElementById('reset-button');

function startGame() {
    const overs = parseInt(oversInput.value);
    if (isNaN(overs) || overs < 1) {
        alert("Please enter a valid number of overs (1 or more).");
        return;
    }
    
    totalBalls = overs * 6;
    gameActive = true;
    resetState();
    setupSection.style.display = 'none';
    gameSection.style.display = 'block';
    updateDisplay();
}

function resetState() {
    ball = 0;
    wicket = 0;
    score = 0;
    scoreTableBody.innerHTML = '';
    bowlerChoiceDisplay.textContent = '-';
    batsmanChoiceDisplay.textContent = '-';
    ballResultDisplay.textContent = 'Waiting...';
    resetButton.style.display = 'none';
    runButtons.forEach(button => button.disabled = false);
    gameActive = true;
}

function takeShot(bats) {
    if (!gameActive) return;

    const bowl = OPT[Math.floor(Math.random() * OPT.length)];
    batsmanChoiceDisplay.textContent = bats;
    bowlerChoiceDisplay.textContent = bowl;
    
    let resultText = '';
    let batsEntry, bowlEntry;
    
    if (bats === bowl) {
        wicket += 1;
        batsEntry = 'W';
        bowlEntry = `WKT ${wicket}`;
        resultText = 'OUT!';
        ballResultDisplay.style.color = 'red';
    } else {
        score += bats;
        batsEntry = bats;
        bowlEntry = '-';
        resultText = `${bats} RUN${bats === 1 ? '' : 'S'}!`;
        ballResultDisplay.style.color = (bats === 4 || bats === 6) ? 'blue' : 'green';
    }
    
    ball += 1;
    ballResultDisplay.textContent = resultText;
    updateDisplay();
    updateScoreTable(batsEntry, bowlEntry);
    checkGameOver();
}

function checkGameOver() {
    if (wicket >= 2) {
        endGame("Game Over! Two wickets down.");
    } else if (ball >= totalBalls) {
        endGame("Overs completed. Game Over!");
    }
}

function endGame(message) {
    gameActive = false;
    runButtons.forEach(button => button.disabled = true);
    ballResultDisplay.textContent = message;
    resetButton.style.display = 'block';
    updateDisplay();
}

function updateDisplay() {
    const completeOvers = Math.floor(ball / 6);
    const ballsInCurrentOver = ball % 6;
    const oversDisplay = `${completeOvers}.${ballsInCurrentOver}`;
    currentScoreDisplay.textContent = `Score: ${score}/${wicket} (${oversDisplay} overs)`;
    
    const ballsRemaining = totalBalls - ball;
    if (gameActive) {
        remainingBallsDisplay.textContent = `Balls remaining: ${ballsRemaining}`;
    } else {
        remainingBallsDisplay.textContent = `Final Score: ${score}/${wicket} from ${oversDisplay} overs.`;
    }
}

function updateScoreTable(batsEntry, bowlEntry) {
    const newRow = scoreTableBody.insertRow(0);
    const ballCell = newRow.insertCell(0);
    const completeOvers = Math.floor((ball - 1) / 6);
    const ballInOver = ((ball - 1) % 6) + 1;
    ballCell.textContent = `${completeOvers}.${ballInOver}`;
    
    const batsmanCell = newRow.insertCell(1);
    batsmanCell.textContent = batsEntry;
    
    const bowlerCell = newRow.insertCell(2);
    bowlerCell.textContent = bowlEntry;
    
    if (batsEntry === 'W') {
        newRow.style.backgroundColor = '#ffcccc';
    }
}

function resetGame() {
    setupSection.style.display = 'block';
    gameSection.style.display = 'none';
    resetState();
}
