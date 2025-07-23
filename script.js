'use strict';

// ============ GLOBAL VARIABLES ============
var rows = 8;
var cols = 8;
var totalMines = 10;
var board = [];
var flagsPlaced = 0;
var remainingMines = totalMines;
var safeCellsLeft;
var timer = null;
var secondsPassed = 0;
var gameOver = false;
var firstClickDone = false;
var playerName = "";

// ============ DOM ELEMENTS ============
var boardContainer = document.getElementById("board");
var minesCounter = document.getElementById("mines-counter");
var stopwatch = document.getElementById("stopwatch");
var messageModal = document.getElementById("message-modal");
var modalContent = document.getElementById("modal-content");
var restartButton = document.getElementById("btn-restart");

// ============ INITIALIZATION ============
function startGame() {
    playerName = prompt("Enter your name (min 3 letters):");
    while (!playerName || playerName.length < 3) {
        playerName = prompt("Invalid name. Minimum 3 letters:");
    }

    gameOver = false;
    firstClickDone = false;
    secondsPassed = 0;
    safeCellsLeft = rows * cols - totalMines;
    board = [];
    flagsPlaced = 0;
    remainingMines = totalMines;
    updateMinesCounter();
    resetStopwatch();
    buildBoard();
}

// ============ BUILDING THE BOARD ============
function buildBoard() {
    boardContainer.innerHTML = "";
    for (var i = 0; i < rows; i++) {
        board[i] = [];
        for (var j = 0; j < cols; j++) {
            board[i][j] = {
                mine: false,
                revealed: false,
                flagged: false,
                number: 0
            };

            var cell = document.createElement("div");
            cell.className = "cell";
            cell.setAttribute("data-row", i);
            cell.setAttribute("data-col", j);

            cell.addEventListener("click", revealCell);
            cell.addEventListener("contextmenu", toggleFlag);

            boardContainer.appendChild(cell);
        }
    }
}

// ============ PLACE MINES ============
function placeMines(initialRow, initialCol) {
    var placed = 0;
    while (placed < totalMines) {
        var r = Math.floor(Math.random() * rows);
        var c = Math.floor(Math.random() * cols);

        if (
            !board[r][c].mine &&
            (r !== initialRow || c !== initialCol)
        ) {
            board[r][c].mine = true;
            placed++;
        }
    }

    calculateNumbers();
}

// ============ CALCULATE NUMBERS ============
function calculateNumbers() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            if (!board[i][j].mine) {
                board[i][j].number = countAdjacentMines(i, j);
            }
        }
    }
}

function countAdjacentMines(r, c) {
    var total = 0;
    for (var i = r - 1; i <= r + 1; i++) {
        for (var j = c - 1; j <= c + 1; j++) {
            if (i >= 0 && i < rows && j >= 0 && j < cols) {
                if (board[i][j].mine) {
                    total++;
                }
            }
        }
    }
    return total;
}

// ============ REVEAL CELL ============
function revealCell(event) {
    if (gameOver) return;

    var row = parseInt(this.getAttribute("data-row"), 10);
    var col = parseInt(this.getAttribute("data-col"), 10);
    var cell = board[row][col];

    if (!firstClickDone) {
        placeMines(row, col);
        startStopwatch();
        firstClickDone = true;
    }

    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;
    this.classList.add("revealed");

    if (cell.mine) {
        this.classList.add("mine");
        endGame(false);
    } else {
        if (cell.number > 0) {
            this.textContent = cell.number;
        } else {
            expandEmptyCells(row, col);
        }

        safeCellsLeft--;
        if (safeCellsLeft === 0) {
            endGame(true);
        }
    }
}

// ============ EXPAND EMPTY CELLS ============
function expandEmptyCells(row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (
                i >= 0 && i < rows &&
                j >= 0 && j < cols &&
                !board[i][j].revealed &&
                !board[i][j].mine
            ) {
                var cellElem = document.querySelector('[data-row="' + i + '"][data-col="' + j + '"]');
                board[i][j].revealed = true;
                cellElem.classList.add("revealed");

                if (board[i][j].number > 0) {
                    cellElem.textContent = board[i][j].number;
                } else {
                    expandEmptyCells(i, j);
                }

                safeCellsLeft--;
            }
        }
    }
}

// ============ FLAGGING ============
function toggleFlag(event) {
    event.preventDefault();

    if (gameOver) return;

    var row = parseInt(this.getAttribute("data-row"), 10);
    var col = parseInt(this.getAttribute("data-col"), 10);
    var cell = board[row][col];

    if (cell.revealed) return;

    if (cell.flagged) {
        cell.flagged = false;
        this.classList.remove("flagged");
        flagsPlaced--;
    } else {
        cell.flagged = true;
        this.classList.add("flagged");
        flagsPlaced++;
    }

    updateMinesCounter();
}

function updateMinesCounter() {
    minesCounter.textContent = totalMines - flagsPlaced;
}

// ============ TIMER ============
function startStopwatch() {
    stopwatch.textContent = "0";
    timer = setInterval(function () {
        secondsPassed++;
        stopwatch.textContent = secondsPassed;
    }, 1000);
}

function resetStopwatch() {
    clearInterval(timer);
    stopwatch.textContent = "0";
}

// ============ GAME END ============
function endGame(won) {
    gameOver = true;
    clearInterval(timer);

    if (won) {
        showMessage("🎉 You won, " + playerName + "!");
    } else {
        showMines();
        showMessage("💣 You lost, " + playerName + "!");
    }
}

function showMines() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            if (board[i][j].mine) {
                var cell = document.querySelector('[data-row="' + i + '"][data-col="' + j + '"]');
                cell.classList.add("mine");
            }
        }
    }
}

// ============ MODAL ============
function showMessage(msg) {
    modalContent.textContent = msg;
    messageModal.style.display = "block";
}

// ============ RESTART ============
restartButton.addEventListener("click", function () {
    messageModal.style.display = "none";
    startGame();
});

// ============ ON LOAD ============
window.addEventListener("load", startGame);
