const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const movesDisplay = document.getElementById("moves");
const restartBtn = document.getElementById("restart");

const width = 8;
const colors = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"];
let squares = [];
let score = 0;
let moves = 15;
let candyBeingDragged = null;
let candyBeingReplaced = null;

function createBoard() {
  for (let i = 0; i < width * width; i++) {
    const square = document.createElement("div");
    square.setAttribute("draggable", true);
    square.setAttribute("id", i);
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    square.style.backgroundColor = randomColor;
    square.classList.add("candy");
    grid.appendChild(square);
    squares.push(square);
  }
}

function dragStart() {
  candyBeingDragged = this;
}

function dragDrop() {
  candyBeingReplaced = this;
}

function dragEnd() {
  const draggedId = parseInt(candyBeingDragged.id);
  const replacedId = parseInt(candyBeingReplaced.id);
  const validMoves = [
    draggedId - 1,
    draggedId + 1,
    draggedId - width,
    draggedId + width,
  ];
  const validMove = validMoves.includes(replacedId);

  if (validMove && moves > 0) {
    moves--;
    movesDisplay.textContent = moves;

    let tempColor = candyBeingReplaced.style.backgroundColor;
    candyBeingReplaced.style.backgroundColor =
      candyBeingDragged.style.backgroundColor;
    candyBeingDragged.style.backgroundColor = tempColor;

    checkMatches();
  }
}

function checkMatches() {
  for (let i = 0; i < squares.length - 2; i++) {
    let rowOfThree = [i, i + 1, i + 2];
    let color = squares[i].style.backgroundColor;

    if (
      rowOfThree.every(
        (index) => squares[index] && squares[index].style.backgroundColor === color
      )
    ) {
      score += 10;
      scoreDisplay.textContent = score;
      rowOfThree.forEach((index) => {
        squares[index].style.backgroundColor = "";
      });
    }
  }
  dropCandies();
}

function dropCandies() {
  for (let i = 0; i < 56; i++) {
    if (squares[i + width].style.backgroundColor === "") {
      squares[i + width].style.backgroundColor =
        squares[i].style.backgroundColor;
      squares[i].style.backgroundColor = "";
    }
  }

  for (let i = 0; i < width; i++) {
    if (squares[i].style.backgroundColor === "") {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      squares[i].style.backgroundColor = randomColor;
    }
  }
}

function restartGame() {
  grid.innerHTML = "";
  squares = [];
  score = 0;
  moves = 15;
  scoreDisplay.textContent = score;
  movesDisplay.textContent = moves;
  createBoard();
  addDragListeners();
}

function addDragListeners() {
  squares.forEach((square) => {
    square.addEventListener("dragstart", dragStart);
    square.addEventListener("dragover", (e) => e.preventDefault());
    square.addEventListener("drop", dragDrop);
    square.addEventListener("dragend", dragEnd);
  });
}

createBoard();
addDragListeners();
restartBtn.addEventListener("click", restartGame);

setInterval(checkMatches, 100);
