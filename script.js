"use strict";

var ROWS = 8;
var COLS = 8;
var MINES = 10;

var grid = document.getElementById('grid');
var cells = [];
var mineLocations = [];
var revealedCells = 0;
var pistaUsada = false;

var gameOver = false;
var totalToReveal = ROWS * COLS - MINES;
var audioClick = new Audio('sounds/421415__jaszunio15__click_203.wav');
var audioExplosion = new Audio('sounds/478272__joao_janz__8-bit-explosion-1_3.wav');
var audioWin = new Audio('sounds/615100__mlaudio__magic_game_win_success_2.wav');
var audioLose = new Audio('sounds/253174__suntemple__retro-you-lose-sfx.wav');
let hintUsed;
let toastTimeoutId = null;
var timerInterval;
var secondsElapsed = 0;

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
  bgAudio.volume = 0.05; // Volumen bajo para la música de fondo
  bgAudio.src = bgTracks[currentTrackIndex];



  // Esperar interacción del usuario para reproducir
  document.body.addEventListener("click", () => {
    bgAudio.play().catch((error) => {
      console.error("Error al reproducir el audio:", error);
    });
    showTrackToast(bgTracks[currentTrackIndex]);
  }, { once: true });
  // Mostrar toast de la primera canción

  // Reproducir la siguiente pista al terminar la actual
  bgAudio.addEventListener("ended", () => {
    currentTrackIndex = (currentTrackIndex + 1) % bgTracks.length; // Ciclar entre las pistas
    bgAudio.src = bgTracks[currentTrackIndex];
    bgAudio.play();
    showTrackToast(bgTracks[currentTrackIndex]);
  });

  // Botón "Next" para cambiar a la siguiente pista
  const nextTrackButton = document.getElementById("next-track");
  nextTrackButton.addEventListener("click", () => {
    currentTrackIndex = (currentTrackIndex + 1) % bgTracks.length; // Ciclar entre las pistas
    bgAudio.src = bgTracks[currentTrackIndex];
    bgAudio.play().catch((error) => {
      console.error("Error al reproducir la siguiente pista:", error);
    });
    showTrackToast(bgTracks[currentTrackIndex]);
  });
});

function initializeGrid() {
  hintUsed = false;
  grid.innerHTML = "";
  cells = [];
  revealedCells = 0;
  mineLocations = [];
  gameOver = false;
  secondsElapsed = 0;
  clearInterval(timerInterval);
  startTimer();
  document.getElementById("message").textContent = "";
  updateStatusCounters();

  // Ajustar el diseño de la cuadrícula en CSS
  grid.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;
  grid.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;

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

  // NO colocar minas aquí


  // Ajustar tamaño de celda dinámicamente
  const gridSize = 500; // px, igual que tu max-width
  const cellSize = Math.floor(gridSize / Math.max(ROWS, COLS));
  document.querySelectorAll('.cell').forEach(cell => {
    cell.style.width = cellSize + "px";
    cell.style.height = cellSize + "px";
    cell.style.lineHeight = cellSize + "px";
    cell.style.fontSize = (cellSize * 0.4) + "px";
  });

  // Nueva bandera para saber si ya se colocaron minas
  window.minesPlaced = false;
}

function placeMinesSafe(safeRow, safeCol) {
  // Calcula las posiciones seguras (la celda y sus adyacentes)
  let safe = {};
  for (let i = Math.max(0, safeRow - 1); i <= Math.min(ROWS - 1, safeRow + 1); i++) {
    for (let j = Math.max(0, safeCol - 1); j <= Math.min(COLS - 1, safeCol + 1); j++) {
      safe[i + "," + j] = true;
    }
  }

  var placed = 0;
  while (placed < MINES) {
    var row = Math.floor(Math.random() * ROWS);
    var col = Math.floor(Math.random() * COLS);
    if (!cells[row][col].dataset.mine && !safe[row + "," + col]) {
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
        updateRemainingCounter();
        if (count === 0) revealEmptyCells(i, j);
      }
    }
  }
}

function handleCellClick(cell) {
  if (gameOver || cell.dataset.state !== 'hidden') return;

  var row = parseInt(cell.dataset.row);
  var col = parseInt(cell.dataset.col);

  // Si es el primer click, colocar minas evitando la celda y sus adyacentes
  if (!window.minesPlaced) {
    placeMinesSafe(row, col);
    window.minesPlaced = true;
  }

  if (cell.dataset.mine === 'true') {
    cell.textContent = '*';
    cell.classList.add('mine');
    audioExplosion.play();
    revealMines();
    showMessage('💥 Perdiste', true);
    gameOver = true;
    clearInterval(timerInterval);
  } else {
    audioClick.play();
    var count = countAdjacentMines(row, col);
    cell.textContent = count || '';
    cell.dataset.state = 'revealed';
    cell.classList.add('revealed');
    revealedCells++;
    updateRemainingCounter();
    if (count === 0) revealEmptyCells(row, col);
    if (revealedCells === totalToReveal) {
      audioWin.play();
      showMessage('🎉 Ganaste', false);
      gameOver = true;
      clearInterval(timerInterval);
      mostrarModalGanador();
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


function toggleTheme() {
  document.body.classList.toggle('light-mode');
  if (document.body.classList.contains('light-mode')) {
    localStorage.setItem('tema', 'claro');
  } else {
    localStorage.setItem('tema', 'oscuro');
  }
}

function updateRemainingCounter() {
  updateStatusCounters();
}

function startTimer() {
  timerInterval = setInterval(() => {
    secondsElapsed++;
    document.getElementById("timer").textContent = `⏱ Tiempo: ${secondsElapsed}s`;
  }, 1000);
}

function showMessage(msg, isError) {
  var msgEl = document.getElementById('message');
  msgEl.textContent = msg;
  msgEl.style.color = isError ? 'red' : 'lime';
}
function mostrarModalGanador() {
  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("nombreJugador").focus();
}

function guardarPuntaje(e) {
  if (e) e.preventDefault();
  const nombre = document.getElementById("nombreJugador").value.trim();
  if (nombre.length < 3) {
    alert("El nombre debe tener al menos 3 letras");
    return;
  }

  const dificultad = document.getElementById("difficulty-selector").value;
  const tiempo = secondsElapsed;
  const fecha = new Date().toLocaleString();

  const nuevoRegistro = {
    nombre,
    dificultad,
    tiempo,
    fecha
  };

  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  ranking.push(nuevoRegistro);
  localStorage.setItem("ranking", JSON.stringify(ranking));

  // Cerrar modal y redirigir
  document.getElementById("modal").classList.add("hidden");
  location.href = "ranking.html";
}

// Asociar el submit del form al guardarPuntaje
document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("form-nombre");
  if (form) form.onsubmit = guardarPuntaje;
});

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
  // Solo permitir si el juego está activo y no se usó la pista
  if (gameOver || pistaUsada) {
    // Mostrar toast si ya usó la pista
    showMessage("Ya usaste tu pista.", true);
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
      showMessage("", false);
      toastTimeoutId = null;
    }, 1750);
    return;
  }

  pistaUsada = true;

  // Mostrar todas las minas no reveladas
  mineLocations.forEach(function(loc) {
    const cell = cells[loc.row][loc.col];
    if (cell.dataset.state !== 'revealed') {
      cell.classList.add("mine");
      cell.textContent = "*";
    }
  });

  // Ocultar después de 1 segundo
  setTimeout(function () {
    mineLocations.forEach(function(loc) {
      const cell = cells[loc.row][loc.col];
      if (cell.dataset.state !== 'revealed') {
        cell.classList.remove("mine");
        cell.textContent = "";
      }
    });
  }, 1000);
}

function changeDifficulty(level) {
  switch (level) {
    case 'easy':
      ROWS = 8;
      COLS = 8;
      MINES = 10;
      break;
    case 'medium':
      ROWS = 12;
      COLS = 12;
      MINES = 25;
      break;
    case 'hard':
      ROWS = 16;
      COLS = 16;
      MINES = 40;
      break;
    default:
      console.error("Nivel de dificultad no válido:", level);
      return;
  }

  // Recalcular casillas a revelar según la dificultad
  totalToReveal = ROWS * COLS - MINES;

  // Reiniciar el juego con la nueva configuración
  resetGame();
  const message = `Dificultad cambiada a: ${level.toUpperCase()}`;
  showMessage(message, false);

  // Limpiar timeout anterior si existe
  if (toastTimeoutId) clearTimeout(toastTimeoutId);

  toastTimeoutId = setTimeout(() => {
    showMessage("", false);
    toastTimeoutId = null;
  }, 1750);
}

const trackNames = [
  "Ghostbusters (8 Bit Remix Cover Version) [Tribute to Ray Parker, Jr.] - 8 Bit Universe",
  "Star Wars Cantina Theme (8 Bit Remix Cover Version) - 8 Bit Universe",
  "Thriller (8 Bit Remix Cover Version) [Tribute to Michael Jackson] - 8 Bit Universe",
  "Stressed Out (8 Bit Remix Cover Version) [Tribute to Twenty One Pilots] - 8 Bit Universe",
  "Star Wars Imperial March Theme (8 Bit Remix Cover Version) - 8 Bit Universe",
  "Blue (Da Ba Dee) [8 Bit Tribute to Eiffel 65] - 8 Bit Universe"
];

function showTrackToast(trackPath) {
  // Determinar el índice de la pista según el array bgTracks
  const bgTracks = [
    "sounds/bg_music/1.mp3",
    "sounds/bg_music/2.mp3",
    "sounds/bg_music/3.mp3",
    "sounds/bg_music/4.mp3",
    "sounds/bg_music/5.mp3",
    "sounds/bg_music/6.mp3"
  ];
  const idx = bgTracks.indexOf(trackPath);
  const name = trackNames[idx] || "Canción desconocida";
  showMessage(`🎵 Sonando: ${name}`, false);

  // Limpiar timeout anterior si existe
  if (toastTimeoutId) clearTimeout(toastTimeoutId);

  // Crear nuevo timeout
  toastTimeoutId = setTimeout(() => {
    showMessage("", false);
    toastTimeoutId = null;
  }, 5000);
}

function updateStatusCounters() {
  document.getElementById("minas").textContent = MINES;
  document.getElementById("casillas").textContent = totalToReveal - revealedCells;
}

totalToReveal = ROWS * COLS - MINES;
initializeGrid();
