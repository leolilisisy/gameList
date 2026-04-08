const buttons = document.querySelectorAll('.choices button');
const playerScoreEl = document.getElementById('player-score');
const computerScoreEl = document.getElementById('computer-score');
const messageEl = document.getElementById('message');
const roundResultEl = document.getElementById('round-result');
const targetSelect = document.getElementById('target');
const resetBtn = document.getElementById('reset');

let playerScore = 0;
let computerScore = 0;

function computerMove() {
  const moves = ['rock','paper','scissors'];
  return moves[Math.floor(Math.random()*moves.length)];
}

function decide(player, comp){
  if(player === comp) return 'tie';
  if(
    (player === 'rock' && comp === 'scissors') ||
    (player === 'paper' && comp === 'rock') ||
    (player === 'scissors' && comp === 'paper')
  ) return 'player';
  return 'computer';
}

function updateScores(){
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;
}

function checkEnd(){
  const target = Number(targetSelect.value);
  if(playerScore >= target || computerScore >= target){
    buttons.forEach(b => b.disabled = true);
    if(playerScore > computerScore){
      messageEl.textContent = `You won the match! (${playerScore}–${computerScore})`;
    } else if(computerScore > playerScore){
      messageEl.textContent = `Computer wins the match! (${computerScore}–${playerScore})`;
    } else {
      messageEl.textContent = `Match ended in a tie (${playerScore}–${computerScore})`;
    }
    roundResultEl.textContent = 'Press Reset to play again.';
  }
}

buttons.forEach(btn => btn.addEventListener('click', (e) => {
  const player = e.currentTarget.dataset.move;
  const comp = computerMove();
  const winner = decide(player, comp);

  if(winner === 'tie'){
    messageEl.textContent = `Both chose ${player}. It's a tie.`;
    roundResultEl.textContent = '';
    return;
  }

  if(winner === 'player'){
    playerScore++;
    messageEl.textContent = `You chose ${player}. Computer chose ${comp}. You win this round.`;
  } else {
    computerScore++;
    messageEl.textContent = `You chose ${player}. Computer chose ${comp}. Computer wins this round.`;
  }

  updateScores();
  checkEnd();
}));

resetBtn.addEventListener('click', ()=>{
  playerScore = 0;
  computerScore = 0;
  updateScores();
  messageEl.textContent = `First to ${targetSelect.value} wins. Make your move!`;
  roundResultEl.textContent = '';
  buttons.forEach(b => b.disabled = false);
});

// Initialize UI
updateScores();
messageEl.textContent = `First to ${targetSelect.value} wins. Make your move!`;
