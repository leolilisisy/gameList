(() => {
  const wordEl = document.getElementById("word");
  const lettersEl = document.getElementById("letters");
  const livesEl = document.getElementById("lives");
  const guessedEl = document.getElementById("guessed");
  const statusEl = document.getElementById("status");
  const newGameBtn = document.getElementById("new-game");
  const giveUpBtn = document.getElementById("give-up");
  const i18n = window.SiteI18n;

  const WORDS = [
    "javascript", "hangman", "developer", "browser", "function",
    "variable", "object", "prototype", "algorithm", "interface",
    "asynchronous", "promise", "callback", "document", "element",
  ];

  const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
  const MAX_WRONG = 6;

  let answer = "";
  let guessed = new Set();
  let wrong = 0;

  function pickWord() {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }

  function renderWord() {
    const out = answer
      .split("")
      .map((char) => (guessed.has(char) ? char : "_"))
      .join(" ");
    wordEl.textContent = out;

    if (!out.includes("_")) {
      statusEl.textContent = i18n.t("gameHangman.win");
      statusEl.style.color = "";
      disableAllLetters();
    }
  }

  function renderLetters() {
    lettersEl.innerHTML = "";
    ALPHABET.forEach((letter) => {
      const button = document.createElement("button");
      button.textContent = letter;
      button.dataset.letter = letter;
      button.addEventListener("click", () => handleGuess(letter, button));
      lettersEl.appendChild(button);
    });
  }

  function handleGuess(letter, button) {
    if (button.classList.contains("used")) return;

    button.classList.add("used");
    guessed.add(letter);
    updateGuessedDisplay();

    if (answer.includes(letter)) {
      button.classList.add("correct");
    } else {
      button.classList.add("wrong");
      wrong++;
      livesEl.textContent = MAX_WRONG - wrong;
    }

    renderWord();
    checkLose();
  }

  function updateGuessedDisplay() {
    const entries = Array.from(guessed).sort();
    guessedEl.textContent = entries.length
      ? entries.join(", ")
      : i18n.t("gameHangman.guessedNone");
  }

  function disableAllLetters() {
    document.querySelectorAll("#letters button").forEach((button) => {
      button.classList.add("used");
    });
  }

  function checkLose() {
    if (wrong < MAX_WRONG) return;

    statusEl.textContent = i18n.t("gameHangman.lose", { answer });
    statusEl.style.color = "rgba(251,113,133,1)";
    revealAnswer();
    disableAllLetters();
  }

  function revealAnswer() {
    wordEl.textContent = answer.split("").join(" ");
  }

  function startGame() {
    answer = pickWord();
    guessed = new Set();
    wrong = 0;
    livesEl.textContent = MAX_WRONG;
    statusEl.textContent = "";
    statusEl.style.color = "";
    renderLetters();
    renderWord();
    updateGuessedDisplay();
  }

  newGameBtn.addEventListener("click", startGame);
  giveUpBtn.addEventListener("click", () => {
    statusEl.textContent = i18n.t("gameHangman.gaveUp", { answer });
    statusEl.style.color = "rgba(249,115,22,1)";
    revealAnswer();
    disableAllLetters();
  });

  window.addEventListener("keydown", (event) => {
    const letter = event.key.toLowerCase();
    if (!/^[a-z]$/.test(letter)) return;
    const button = document.querySelector(`#letters button[data-letter="${letter}"]`);
    if (button) handleGuess(letter, button);
  });

  window.addEventListener("site-language-change", updateGuessedDisplay);

  startGame();
})();
