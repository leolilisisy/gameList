const choices = document.querySelectorAll('.choice');
const playerChoiceText = document.getElementById('player-choice');
const computerChoiceText = document.getElementById('computer-choice');
const resultText = document.getElementById('result-text');
const playerScoreSpan = document.getElementById('player-score');
const computerScoreSpan = document.getElementById('computer-score');

let playerScore = 0;
let computerScore = 0;

choices.forEach(button => {
  button.addEventListener('click', () => {
    const playerChoice = button.dataset.choice;
    const computerChoice = getComputerChoice();
    const result = getWinner(playerChoice, computerChoice);

    playerChoiceText.textContent = `You chose: ${formatChoice(playerChoice)}`;
    computerChoiceText.textContent = `Computer chose: ${formatChoice(computerChoice)}`;
    resultText.textContent = result;

    updateScore(result);
  });
});

function getComputerChoice() {
  const options = ['rock', 'paper', 'scissors'];
  return options[Math.floor(Math.random() * 3)];
}

function getWinner(player, computer) {
  if (player === computer) return "It's a draw 😐";
  if (
    (player === 'rock' && computer === 'scissors') ||
    (player === 'paper' && computer === 'rock') ||
    (player === 'scissors' && computer === 'paper')
  ) return "You win! 🎉";
  return "You lose! 💀";
}

function updateScore(result) {
  if (result.includes("win")) {
    playerScore++;
    playerScoreSpan.textContent = playerScore;
  } else if (result.includes("lose")) {
    computerScore++;
    computerScoreSpan.textContent = computerScore;
  }
}

function formatChoice(choice) {
  if (choice === 'rock') return '✊ Rock';
  if (choice === 'paper') return '✋ Paper';
  return '✌️ Scissors';
}
