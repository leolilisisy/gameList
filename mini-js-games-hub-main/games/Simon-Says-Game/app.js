let h2 = document.querySelector("h2");
let gameSqe = [];
let userSqe = [];

let started = false;
let hightestScore = 0;
let level = 0;

let btns = ["red", "yellow", "green", "blue"]
document.addEventListener("keypress", function () {
    if (started == false) {
        started = true;
        levelUp();
    }
});

function gameFlash(btn) {
    btn.classList.add("gameFlash");
    setTimeout(function () {
        btn.classList.remove("gameFlash");
    }, 300);
}

function userFlash(btn) {
    btn.classList.add("userFlash");
    setTimeout(function () {
        btn.classList.remove("userFlash");
    }, 300);
}

function levelUp() {
    userSqe = [];
    level++;
    h2.innerText = `Level ${level}`;

    let randIndex = Math.floor(Math.random() * 4);
    let randColor = btns[randIndex];
    let randBtn = document.querySelector(`.${randColor}`);
    gameSqe.push(randColor);
    gameFlash(randBtn);
}

function checkSqe(index) {
    if (userSqe[index] == gameSqe[index]) {
        if (userSqe.length == gameSqe.length) {
            setTimeout(levelUp(), 1000);
        }
    } else {
        h2.innerHTML = `Game Over! Your Score is <b>${level}</b> <br> Press any key to start the game.. `;
        let body = document.querySelector("body");
        let score = document.querySelector(".score");
        hightestScore = Math.max(hightestScore, level);
        score.innerHTML = `Your hightest score : ${hightestScore}`
        body.style.backgroundColor = "#FF0B55";
        setTimeout(function () {
            body.style.backgroundColor = "white";
        }, 200)
        restart();
    }
}

function btnPress() {
    userFlash(this);

    let btnColor = this.getAttribute("id");
    userSqe.push(btnColor);
    checkSqe(btnColor.length - 1);
}

let allBtn = document.querySelectorAll(".btn");
for (btn of allBtn) {
    btn.addEventListener("click", btnPress);
}

function restart() {
    started = false;
    level = 0;
    gameSqe = [];
    userSqe = [];
}