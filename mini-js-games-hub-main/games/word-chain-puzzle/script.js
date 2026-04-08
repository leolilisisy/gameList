// Simple sound effects using Web Audio API
function playSound(frequency, duration, type = 'sine') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        // Silently fail if Web Audio API not supported
    }
}

const wordLists = {
    animals: {
        easy: ['cat', 'dog', 'bird', 'fish', 'cow', 'pig', 'duck', 'bee', 'ant', 'fox'],
        medium: ['elephant', 'giraffe', 'kangaroo', 'penguin', 'dolphin', 'turtle', 'rabbit', 'squirrel', 'butterfly', 'octopus'],
        hard: ['hippopotamus', 'rhinoceros', 'chimpanzee', 'crocodile', 'porcupine', 'armadillo', 'platypus', 'quokka', 'axolotl', 'narwhal']
    },
    food: {
        easy: ['apple', 'bread', 'cheese', 'egg', 'milk', 'rice', 'soup', 'tea', 'cake', 'fish'],
        medium: ['sandwich', 'pasta', 'salad', 'pizza', 'burger', 'cookie', 'yogurt', 'cereal', 'smoothie', 'taco'],
        hard: ['spaghetti', 'lasagna', 'quiche', 'souffle', 'casserole', 'ratatouille', 'bouillabaisse', 'tiramisu', 'pavlova', 'baklava']
    },
    technology: {
        easy: ['phone', 'mouse', 'screen', 'code', 'web', 'app', 'data', 'file', 'net', 'chip'],
        medium: ['computer', 'keyboard', 'software', 'internet', 'browser', 'database', 'network', 'program', 'device', 'system'],
        hard: ['algorithm', 'encryption', 'microprocessor', 'cybersecurity', 'virtualization', 'quantumcomputing', 'blockchain', 'artificialintelligence', 'machinelearning', 'neuralnetwork']
    },
    colors: {
        easy: ['red', 'blue', 'green', 'yellow', 'pink', 'black', 'white', 'gray', 'brown', 'orange'],
        medium: ['purple', 'violet', 'indigo', 'turquoise', 'magenta', 'crimson', 'azure', 'emerald', 'amber', 'scarlet'],
        hard: ['chartreuse', 'cerulean', 'vermillion', 'ultramarine', 'saffron', 'cobalt', 'maroon', 'taupe', 'ecru', 'fuchsia']
    },
    countries: {
        easy: ['usa', 'china', 'india', 'brazil', 'russia', 'japan', 'germany', 'france', 'uk', 'italy'],
        medium: ['canada', 'australia', 'mexico', 'spain', 'southkorea', 'indonesia', 'netherlands', 'turkey', 'saudiarabia', 'switzerland'],
        hard: ['argentina', 'kazakhstan', 'algeria', 'uzbekistan', 'mozambique', 'ecuador', 'azerbaijan', 'belarus', 'panama', 'uruguay']
    },
    sports: {
        easy: ['run', 'jump', 'swim', 'ball', 'game', 'play', 'win', 'team', 'goal', 'race'],
        medium: ['football', 'basketball', 'tennis', 'soccer', 'baseball', 'hockey', 'golf', 'boxing', 'cycling', 'skiing'],
        hard: ['volleyball', 'cricket', 'rugby', 'badminton', 'squash', 'fencing', 'archery', 'wrestling', 'judo', 'taekwondo']
    },
    music: {
        easy: ['song', 'note', 'beat', 'sing', 'play', 'band', 'rock', 'pop', 'jazz', 'rap'],
        medium: ['guitar', 'piano', 'drums', 'violin', 'flute', 'trumpet', 'saxophone', 'microphone', 'headphones', 'speaker'],
        hard: ['symphony', 'orchestra', 'concerto', 'sonata', 'rhapsody', 'ballad', 'etude', 'prelude', 'fugue', 'cantata']
    }
};

let currentCategory = '';
let currentDifficulty = '';
let chain = [];
let usedWords = new Set();
let score = 0;
let timeLeft = 60;
let timerInterval;
let highScore = localStorage.getItem('wordChainHighScore') || 0;

const setupDiv = document.getElementById('setup');
const gameDiv = document.getElementById('game');
const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');
const startBtn = document.getElementById('start-btn');
const chainDiv = document.getElementById('chain');
const wordInput = document.getElementById('word-input');
const submitBtn = document.getElementById('submit-btn');
const hintBtn = document.getElementById('hint-btn');
const lastLetterSpan = document.getElementById('last-letter');
const scoreSpan = document.getElementById('score');
const timerSpan = document.getElementById('timer');
const messageDiv = document.getElementById('message');
const highScoreSpan = document.getElementById('high-score');

startBtn.addEventListener('click', startGame);
submitBtn.addEventListener('click', submitWord);
hintBtn.addEventListener('click', giveHint);
wordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        submitWord();
    }
});

// Initialize high score display
highScoreSpan.textContent = highScore;

function startGame() {
    currentCategory = categorySelect.value;
    currentDifficulty = difficultySelect.value;
    const words = wordLists[currentCategory][currentDifficulty];
    const startWord = words[Math.floor(Math.random() * words.length)];
    
    chain = [startWord];
    usedWords = new Set([startWord.toLowerCase()]);
    score = 0;
    timeLeft = 60;
    
    updateDisplay();
    setupDiv.style.display = 'none';
    gameDiv.style.display = 'block';
    
    startTimer();
    wordInput.focus();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerSpan.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function submitWord() {
    const word = wordInput.value.trim().toLowerCase();
    if (!word) return;
    
    const lastWord = chain[chain.length - 1];
    const lastLetter = lastWord.slice(-1).toLowerCase();
    
    if (word[0] !== lastLetter) {
        playSound(200, 0.3, 'sawtooth'); // Error sound
        showMessage('Word must start with "' + lastLetter.toUpperCase() + '"', 'error');
        return;
    }
    
    if (usedWords.has(word)) {
        playSound(200, 0.3, 'sawtooth');
        showMessage('Word already used!', 'error');
        return;
    }
    
    if (!wordLists[currentCategory][currentDifficulty].includes(word)) {
        playSound(200, 0.3, 'sawtooth');
        showMessage('Word not in ' + currentCategory + ' (' + currentDifficulty + ') category!', 'error');
        return;
    }
    
    // Valid word
    chain.push(word);
    usedWords.add(word);
    score += 10; // 10 points per word
    updateDisplay();
    wordInput.value = '';
    playSound(800, 0.2); // Success sound
    showMessage('Good! Next word starts with "' + word.slice(-1).toUpperCase() + '"', 'success');
}

function updateDisplay() {
    chainDiv.innerHTML = '';
    chain.forEach(word => {
        const span = document.createElement('span');
        span.textContent = word;
        chainDiv.appendChild(span);
    });
    
    const lastWord = chain[chain.length - 1];
    lastLetterSpan.textContent = lastWord.slice(-1).toUpperCase();
    
    scoreSpan.textContent = score;
}

function giveHint() {
    const lastWord = chain[chain.length - 1];
    const lastLetter = lastWord.slice(-1).toLowerCase();
    const availableWords = wordLists[currentCategory][currentDifficulty].filter(word => 
        word[0].toLowerCase() === lastLetter && !usedWords.has(word.toLowerCase())
    );
    
    if (availableWords.length === 0) {
        playSound(200, 0.3, 'sawtooth');
        showMessage('No more words available starting with "' + lastLetter.toUpperCase() + '"!', 'error');
        return;
    }
    
    const hintWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    playSound(600, 0.2);
    showMessage('Try: ' + hintWord.charAt(0).toUpperCase() + hintWord.slice(1), 'info');
    score = Math.max(0, score - 5); // Penalty for hint
    scoreSpan.textContent = score;
}

function endGame() {
    clearInterval(timerInterval);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('wordChainHighScore', highScore);
        highScoreSpan.textContent = highScore;
        showMessage('New High Score! Final score: ' + score, 'success');
    } else {
        showMessage('Time\'s up! Final score: ' + score, 'info');
    }
    
    submitBtn.disabled = true;
    hintBtn.disabled = true;
    wordInput.disabled = true;
    
    // Allow restart
    setTimeout(() => {
        setupDiv.style.display = 'block';
        gameDiv.style.display = 'none';
        submitBtn.disabled = false;
        hintBtn.disabled = false;
        wordInput.disabled = false;
    }, 5000);
}

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 3000);
}