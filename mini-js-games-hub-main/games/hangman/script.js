// Simple Hangman game
(() => {
  const wordEl = document.getElementById('word');
  const lettersEl = document.getElementById('letters');
  const livesEl = document.getElementById('lives');
  const guessedEl = document.getElementById('guessed');
  const statusEl = document.getElementById('status');
  const newGameBtn = document.getElementById('new-game');
  const giveUpBtn = document.getElementById('give-up');

  // Word list - you can expand this
  const WORDS = [
    'javascript','hangman','developer','browser','function',
    'variable','object','prototype','algorithm','interface',
    'asynchronous','promise','callback','document','element'
  ];

  const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

  let answer = '';
  let guessed = new Set();
  let wrong = 0;
  const MAX_WRONG = 6;

  function pickWord(){
    return WORDS[Math.floor(Math.random()*WORDS.length)];
  }

  function renderWord(){
    const out = answer.split('').map(ch => (guessed.has(ch) ? ch : '_')).join(' ');
    wordEl.textContent = out;
    if (!out.includes('_')) {
      statusEl.textContent = 'You Win! 🎉';
      statusEl.style.color = '';
      disableAllLetters();
    }
  }

  function renderLetters(){
    lettersEl.innerHTML = '';
    ALPHABET.forEach(letter => {
      const btn = document.createElement('button');
      btn.textContent = letter;
      btn.dataset.letter = letter;
      btn.addEventListener('click', () => handleGuess(letter, btn));
      lettersEl.appendChild(btn);
    });
  }

  function handleGuess(letter, btn){
    if (btn.classList.contains('used')) return;
    btn.classList.add('used');
    guessed.add(letter);
    updateGuessedDisplay();

    if (answer.includes(letter)) {
      btn.classList.add('correct');
    } else {
      btn.classList.add('wrong');
      wrong++;
      livesEl.textContent = MAX_WRONG - wrong;
    }

    renderWord();
    checkLose();
  }

  function updateGuessedDisplay(){
    const arr = Array.from(guessed).sort();
    guessedEl.textContent = arr.length ? arr.join(', ') : '—';
  }

  function disableAllLetters(){
    document.querySelectorAll('#letters button').forEach(b => {
      b.classList.add('used');
    });
  }

  function checkLose(){
    if (wrong >= MAX_WRONG) {
      statusEl.textContent = `You lost — the word was "${answer}".`;
      statusEl.style.color = 'rgba(251,113,133,1)';
      revealAnswer();
      disableAllLetters();
    }
  }

  function revealAnswer(){
    wordEl.textContent = answer.split('').join(' ');
  }

  function startGame(){
    answer = pickWord();
    guessed = new Set();
    wrong = 0;
    livesEl.textContent = MAX_WRONG;
    statusEl.textContent = '';
    statusEl.style.color = '';
    renderLetters();
    renderWord();
    updateGuessedDisplay();
  }

  newGameBtn.addEventListener('click', startGame);
  giveUpBtn.addEventListener('click', () => {
    statusEl.textContent = `Given up — the word was "${answer}".`;
    statusEl.style.color = 'rgba(249,115,22,1)';
    revealAnswer();
    disableAllLetters();
  });

  // keyboard support
  window.addEventListener('keydown', (e) => {
    const letter = e.key.toLowerCase();
    if (!/^[a-z]$/.test(letter)) return;
    const btn = document.querySelector(`#letters button[data-letter="${letter}"]`);
    if (btn) handleGuess(letter, btn);
  });

  // start first game on load
  startGame();
})();
