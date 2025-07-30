// script.js
"use strict";

var ROWS = 8;
var COLS = 8;
var MINES = 10;

var grid = document.getElementById('grid');
var cells = [];
var mineLocations = [];
var revealedCells = 0;
var gameOver = false;
var audioClick = new Audio('sounds/421415__jaszunio15__click_203.wav');
var audioExplosion = new Audio('sounds/478272__joao_janz__8-bit-explosion-1_3.wav');
var audioWin = new Audio('sounds/615100__mlaudio__magic_game_win_success_2.wav');
var audioLose = new Audio('sounds/253174__suntemple__retro-you-lose-sfx.wav');
let hintUsed;

document.addEventListener("DOMContentLoaded", () => {
  const bgTracks = [
    "sounds/bg_music/1.mp3",
    "sounds/bg_music/2.mp3",
    "sounds/bg_music/3.mp3",
    "sounds/bg_music/4.mp3",
    "sounds/bg_music/5.mp3",
    "sounds/bg_music/6.mp3"
  ];

  let currentTrackIndex = 0;
  const bgAudio = document.getElementById("bg-audio");

  // Configurar el audio de fondo
  bgAudio.volume = 0.01; // Volumen bajo para la música de fondo
  bgAudio.src = bgTracks[currentTrackIndex];

  // Esperar interacción del usuario para reproducir
  document.body.addEventListener("click", () => {
    bgAudio.play().catch((error) => {
      console.error("Error al reproducir el audio:", error);
    });
  }, { once: true });

  // Reproducir la siguiente pista al terminar la actual
  bgAudio.addEventListener("ended", () => {
    currentTrackIndex = (currentTrackIndex + 1) % bgTracks.length; // Ciclar entre las pistas
    bgAudio.src = bgTracks[currentTrackIndex];
    bgAudio.play();
  });

  // Botón "Next" para cambiar a la siguiente pista
  const nextTrackButton = document.getElementById("next-track");
  nextTrackButton.addEventListener("click", () => {
    currentTrackIndex = (currentTrackIndex + 1) % bgTracks.length; // Ciclar entre las pistas
    bgAudio.src = bgTracks[currentTrackIndex];
    bgAudio.play().catch((error) => {
      console.error("Error al reproducir la siguiente pista:", error);
    });
  });
});

function initializeGrid() {
  hintUsed = false;
  grid.innerHTML = "";
  cells = [];
  revealedCells = 0;
  mineLocations = [];
  gameOver = false;
  document.getElementById("message").textContent = "";

  for (var i = 0; i < ROWS; i++) {
    cells[i] = [];
    for (var j = 0; j < COLS; j++) {
      var cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.dataset.state = 'hidden';
      cell.oncontextmenu = function(e) {
        e.preventDefault();
        toggleFlag(this);
      };
      cell.onclick = function() {
        handleCellClick(this);
      };
      grid.appendChild(cell);
      cells[i][j] = cell;
    }
  }
  placeMines();
}

function placeMines() {
  var placed = 0;
  while (placed < MINES) {
    var row = Math.floor(Math.random() * ROWS);
    var col = Math.floor(Math.random() * COLS);
    if (!cells[row][col].dataset.mine) {
      cells[row][col].dataset.mine = 'true';
      mineLocations.push({ row: row, col: col });
      placed++;
    }
  }
}

function countAdjacentMines(row, col) {
  var count = 0;
  for (var i = Math.max(0, row - 1); i <= Math.min(ROWS - 1, row + 1); i++) {
    for (var j = Math.max(0, col - 1); j <= Math.min(COLS - 1, col + 1); j++) {
      if (cells[i][j].dataset.mine === 'true') count++;
    }
  }
  return count;
}

function revealEmptyCells(row, col) {
  for (var i = Math.max(0, row - 1); i <= Math.min(ROWS - 1, row + 1); i++) {
    for (var j = Math.max(0, col - 1); j <= Math.min(COLS - 1, col + 1); j++) {
      var cell = cells[i][j];
      if (cell.dataset.state === 'hidden') {
        var count = countAdjacentMines(i, j);
        cell.textContent = count || '';
        cell.dataset.state = 'revealed';
        cell.classList.add('revealed');
        revealedCells++;
        if (count === 0) revealEmptyCells(i, j);
      }
    }
  }
}

function handleCellClick(cell) {
  if (gameOver || cell.dataset.state !== 'hidden') return;

  var row = parseInt(cell.dataset.row);
  var col = parseInt(cell.dataset.col);

  if (cell.dataset.mine === 'true') {
    cell.textContent = '*';
    cell.classList.add('mine');
    audioExplosion.play();
    revealMines();
    showMessage('💥 Perdiste', true);
    gameOver = true;
  } else {
    audioClick.play();
    var count = countAdjacentMines(row, col);
    cell.textContent = count || '';
    cell.dataset.state = 'revealed';
    cell.classList.add('revealed');
    revealedCells++;
    if (count === 0) revealEmptyCells(row, col);
    if (revealedCells === ROWS * COLS - MINES) {
      audioWin.play();
      showMessage('🎉 Ganaste', false);
      gameOver = true;
      saveScore();
    }
  }
}

function toggleFlag(cell) {
  if (cell.dataset.state === 'hidden') {
    cell.textContent = '🚩';
    cell.dataset.state = 'flagged';
  } else if (cell.dataset.state === 'flagged') {
    cell.textContent = '';
    cell.dataset.state = 'hidden';
  }
}

function revealMines() {
  mineLocations.forEach(function(loc) {
    var cell = cells[loc.row][loc.col];
    cell.textContent = '*';
    cell.classList.add('mine');
  });
  audioLose.play();
}

function showMessage(msg, isError) {
  var msgEl = document.getElementById('message');
  msgEl.textContent = msg;
  msgEl.style.color = isError ? 'red' : 'lime';
}

function resetGame() {
  initializeGrid();
}

function saveScore() {
  var player = prompt("Tu nombre:");
  if (!player || player.length < 3) return;
  var score = {
    name: player,
    date: new Date().toLocaleString(),
    revealed: revealedCells
  };
  var scores = JSON.parse(localStorage.getItem("scores")) || [];
  scores.push(score);
  localStorage.setItem("scores", JSON.stringify(scores));
}



function showBombsTemporarily() {
  if (hintUsed) {
    showMessage("Ya utilizaste la pista.", true);
    setTimeout(() => {
      showMessage("", false);
    }, 1750);
    return;
  }
  hintUsed = true;
  mineLocations.forEach(function(loc) {
    cells[loc.row][loc.col].classList.add("mine");
  });
  setTimeout(function () {
    mineLocations.forEach(function(loc) {
      if (cells[loc.row][loc.col].dataset.state !== 'revealed') {
        cells[loc.row][loc.col].classList.remove("mine");
        cells[loc.row][loc.col].textContent = "";
      }
    });
  }, 1000);
}

initializeGrid();
