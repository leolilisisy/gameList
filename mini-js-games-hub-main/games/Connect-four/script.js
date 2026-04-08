document.addEventListener('DOMContentLoaded', () => {
    const ROWS = 6;
    const COLS = 7;
    const PLAYER_RED = 'red';
    const PLAYER_YELLOW = 'yellow';
    const startGameBtn = document.getElementById('start-game-btn');
    const startScreen = document.getElementById('start-screen');
    const gameArea = document.getElementById('game-area');
    const gameBoard = document.getElementById('game-board');
    const gameStatusEl = document.getElementById('game-status');
    const playAgainBtn = document.getElementById('play-again-btn');

    let board = [];
    let currentPlayer = PLAYER_RED;
    let gameOver = false;

    function init() {
        gameOver = false;
        currentPlayer = PLAYER_RED;
        playAgainBtn.classList.add('hidden');
        gameBoard.style.cursor = 'pointer';
        createBoard();
        updateGameStatus();
    }

    startGameBtn.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        gameArea.classList.remove('hidden');
        init();
    });

    function createBoard() {
        gameBoard.innerHTML = '';
        board = [];
        for (let c = 0; c < COLS; c++) {
            board.push(Array(ROWS).fill(null));
        }
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const slot = document.createElement('div');
                slot.classList.add('slot');
                slot.dataset.col = c;
                slot.dataset.row = (ROWS - 1) - r;
                gameBoard.appendChild(slot);
            }
        }
    }

    gameBoard.addEventListener('click', handleBoardClick);
    gameBoard.addEventListener('mouseover', handleMouseOver);
    gameBoard.addEventListener('mouseout', handleMouseOut);
    playAgainBtn.addEventListener('click', init);

    function handleMouseOver(e) {
        if (gameOver) return;
        const col = e.target.closest('.slot')?.dataset.col;
        if (col) {
            document.querySelectorAll(`.slot[data-col='${col}']`).forEach(slot => {
                slot.classList.add('column-hover');
            });
        }
    }

    function handleMouseOut(e) {
        const col = e.target.closest('.slot')?.dataset.col;
        if (col) {
            document.querySelectorAll(`.slot[data-col='${col}']`).forEach(slot => {
                slot.classList.remove('column-hover');
            });
        }
    }

    function handleBoardClick(e) {
        if (gameOver) return;
        const col = parseInt(e.target.closest('.slot')?.dataset.col);
        if (isNaN(col)) return;
        const row = board[col].findIndex(slot => slot === null);

        if (row === -1) {
            // Column is full — show feedback
            indicateFullColumn(col);
            return;
        }

        board[col][row] = currentPlayer;
        dropPiece(col, row, currentPlayer);
        if (checkForWin(col, row)) {
            endGame(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} wins!`);
        } else if (board.flat().every(slot => slot !== null)) {
            endGame("It's a tie!");
        } else {
            switchPlayer();
        }
    }


    function dropPiece(col, row, player) {
        const slot = document.querySelector(`.slot[data-col='${col}'][data-row='${row}']`);
        const piece = document.createElement('div');
        piece.classList.add('piece', player);
        slot.appendChild(piece);
    }

    function switchPlayer() {
        currentPlayer = (currentPlayer === PLAYER_RED) ? PLAYER_YELLOW : PLAYER_RED;
        updateGameStatus();
    }

    function updateGameStatus() {
        gameStatusEl.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
        gameStatusEl.style.color = currentPlayer === PLAYER_RED ? '#ef4444' : '#facc15';
    }

    function checkForWin(col, row) {
        const player = board[col][row];

        function checkDirection(dc, dr) {
            let count = 0;
            for (let i = -3; i <= 3; i++) {
                const c = col + i * dc;
                const r = row + i * dr;
                if (c >= 0 && c < COLS && r >= 0 && r < ROWS && board[c][r] === player) {
                    count++;
                    if (count === 4) return true;
                } else {
                    count = 0;
                }
            }
            return false;
        }
        return checkDirection(1, 0) || checkDirection(0, 1) || checkDirection(1, 1) || checkDirection(1, -1);
    }

    function endGame(message) {
        gameOver = true;
        gameStatusEl.textContent = message;
        gameStatusEl.style.color = '#ffffff';
        playAgainBtn.classList.remove('hidden');
        gameBoard.style.cursor = 'not-allowed';
    }
    function indicateFullColumn(col) {
        const slots = document.querySelectorAll(`.slot[data-col='${col}']`);
        slots.forEach(slot => slot.classList.add('full-column-warning'));
        setTimeout(() => {
            slots.forEach(slot => slot.classList.remove('full-column-warning'));
        }, 500);
    }

});

