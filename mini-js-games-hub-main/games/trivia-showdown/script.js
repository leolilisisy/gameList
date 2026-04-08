const startBtn = document.getElementById("start-btn");
const categorySelect = document.getElementById("category");
const gameSection = document.querySelector(".game-section");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const playerNameEl = document.getElementById("player-name");
const playerScoreEl = document.getElementById("player-score");
const timerEl = document.getElementById("timer");
const resultEl = document.getElementById("result");
const finalScoreEl = document.getElementById("final-score");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 15;
let timerInterval;

const questionBank = {
    general: [
        {q:"What is the capital of France?", a:["Paris","London","Berlin","Rome"], correct:"Paris"},
        {q:"Which ocean is the largest?", a:["Atlantic","Indian","Pacific","Arctic"], correct:"Pacific"}
    ],
    science: [
        {q:"What planet is known as the Red Planet?", a:["Mars","Earth","Jupiter","Venus"], correct:"Mars"},
        {q:"What gas do plants absorb?", a:["Oxygen","Carbon Dioxide","Nitrogen","Helium"], correct:"Carbon Dioxide"}
    ],
    history: [
        {q:"Who was the first President of the USA?", a:["George Washington","Abraham Lincoln","Thomas Jefferson","John Adams"], correct:"George Washington"},
        {q:"In which year did World War II end?", a:["1945","1939","1918","1965"], correct:"1945"}
    ],
    movies: [
        {q:"Who directed 'Jurassic Park'?", a:["Steven Spielberg","James Cameron","Christopher Nolan","Peter Jackson"], correct:"Steven Spielberg"},
        {q:"Which movie won Best Picture in 2020?", a:["Parasite","1917","Joker","Ford v Ferrari"], correct:"Parasite"}
    ],
    sports: [
        {q:"How many players in a soccer team?", a:["11","9","10","12"], correct:"11"},
        {q:"Which country won FIFA World Cup 2018?", a:["France","Croatia","Brazil","Germany"], correct:"France"}
    ]
};

function startGame() {
    const selectedCategory = categorySelect.value;
    questions = [...questionBank[selectedCategory]];
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = 15;
    gameSection.hidden = false;
    resultEl.hidden = true;
    updateScore();
    displayQuestion();
}

function displayQuestion() {
    resetState();
    if(currentQuestionIndex >= questions.length){
        endGame();
        return;
    }
    const currentQuestion = questions[currentQuestionIndex];
    questionEl.textContent = currentQuestion.q;
    currentQuestion.a.forEach(answer => {
        const button = document.createElement("button");
        button.textContent = answer;
        button.addEventListener("click", selectAnswer);
        answersEl.appendChild(button);
    });
    startTimer();
}

function resetState(){
    clearInterval(timerInterval);
    nextBtn.disabled = true;
    answersEl.innerHTML = "";
    timeLeft = 15;
    timerEl.textContent = timeLeft;
}

function startTimer(){
    timerInterval = setInterval(()=>{
        timeLeft--;
        timerEl.textContent = timeLeft;
        if(timeLeft<=0){
            clearInterval(timerInterval);
            nextBtn.disabled = false;
            Array.from(answersEl.children).forEach(btn=>{
                btn.disabled = true;
                if(btn.textContent === questions[currentQuestionIndex].correct){
                    btn.style.backgroundColor = "#74ebd5";
                }
            });
        }
    },1000);
}

function selectAnswer(e){
    clearInterval(timerInterval);
    const selectedBtn = e.target;
    const correct = questions[currentQuestionIndex].correct;
    if(selectedBtn.textContent === correct){
        score++;
        selectedBtn.style.backgroundColor = "#74ebd5";
    } else {
        selectedBtn.style.backgroundColor = "red";
        Array.from(answersEl.children).forEach(btn=>{
            if(btn.textContent===correct){
                btn.style.backgroundColor = "#74ebd5";
            }
        });
    }
    updateScore();
    Array.from(answersEl.children).forEach(btn=>btn.disabled=true);
    nextBtn.disabled = false;
}

function updateScore(){
    playerScoreEl.textContent = score;
}

function endGame(){
    gameSection.hidden = true;
    resultEl.hidden = false;
    finalScoreEl.textContent = `Your final score is: ${score} / ${questions.length}`;
}

startBtn.addEventListener("click", startGame);
nextBtn.addEventListener("click", ()=>{
    currentQuestionIndex++;
    displayQuestion();
});
restartBtn.addEventListener("click", startGame);
