# 💣 Buscaminas - DAW2025 Final

**Proyecto Final para la materia Desarrollo y Arquitecturas Web (DAW) - Año 2025**

Este proyecto consiste en una implementación web del clásico juego **Minesweeper (Buscaminas)**, construido con tecnologías web puras: HTML5, CSS3 y JavaScript (ES5). El propósito es aplicar buenas prácticas de desarrollo frontend, estructuras dinámicas y lógica interactiva en el navegador.

---

## 🎮 Descripción del Juego

El objetivo del juego es descubrir todas las celdas que **no** contienen minas. Cada celda descubierta mostrará un número que indica cuántas minas hay en sus celdas adyacentes. Puedes marcar posibles minas con banderas para evitar perder.

- **Click izquierdo:** Revelar celda.
- **Click derecho:** Marcar/desmarcar celda con bandera.
- **Chording:** Si una celda con número tiene la cantidad correcta de banderas alrededor, puedes hacer click sobre ella para revelar automáticamente las celdas vecinas.

---

## 📦 Tecnologías Usadas

- HTML5 (estructura del documento)
- CSS3 (estilos y diseño responsivo con Flexbox)
- JavaScript ES5 (lógica del juego)
- LocalStorage (para guardar puntuaciones)
- Modales personalizados (sin uso de `alert`)
- Validaciones manuales con JS puro (sin HTML5 validations)

---

## 🧩 Características Principales

- Tablero dinámico (por defecto 8x8, 10 minas).
- Minas distribuidas aleatoriamente.
- Modo de expansión recursivo automático de celdas vacías.
- Contador de minas restantes.
- Temporizador que inicia con el primer click.
- Modales para mensajes de victoria y derrota.
- Reinicio de partida sin recargar la página.
- Validación del nombre del jugador (mínimo 3 letras).
- Página de contacto con validaciones personalizadas y uso de `mailto:`.
- Estilos consistentes y responsivos.
- Código estructurado, ordenado y documentado.

---

## 🌑 Funcionalidades Extra (Deseadas)

- Modo claro / modo oscuro accesible.
- Sonidos al ganar o perder.
- Guardado de resultados en LocalStorage (nombre, puntaje, duración, fecha).
- Modal con ranking ordenable por puntaje o fecha.
- Selector de dificultad:
  - Fácil: 8x8, 10 minas
  - Medio: 12x12, 25 minas
  - Difícil: 16x16, 40 minas

---

## 📁 Estructura del Proyecto

DAW2025-FINAL/
│
├── index.html # Página principal con el juego
├── contacto.html # Página de contacto con formulario
├── css/
│ └── styles.css # Estilos principales
├── js/
│ ├── juego.js # Lógica principal del juego
│ ├── eventos.js # Manejadores de eventos
│ └── ranking.js # Gestión del ranking y LocalStorage
├── assets/
│ ├── img/ # Imágenes del juego
│ └── sounds/ # Sonidos (opcional)
├── README.md
└── .gitignore


---

## 🧪 Validaciones y Buenas Prácticas

- Código 100% indentado, sin líneas vacías ni comentarios innecesarios.
- Nombres consistentes (`camelCase` o `kebab-case`).
- Uso de `'use strict'` en todos los archivos JS.
- Uso exclusivo de `addEventListener` para eventos.
- Estilos escritos sin uso de `!important`, `float`, ni `inline styles`.

---

## 🔗 Recursos y Enlaces

- Juego original como inspiración: [minesweeper.online](https://minesweeper.online/es/)
- Repositorio GitHub del proyecto: [DAW2025-FINAL - Minesweeper](https://github.com/LozMat/DAW2025-FINAL) <!-- Reemplaza con tu link -->

---

## 📬 Contacto

Incluye una sección de contacto accesible desde el sitio, con un formulario validado por JavaScript que permite enviar un mensaje desde el cliente a través de la aplicación de correo predeterminada del sistema.

---

## 🧙🏻‍♂️ Consideraciones Finales

Este proyecto busca no sólo cumplir con los requisitos técnicos sino también fomentar una arquitectura limpia, modular y accesible. Cada línea de código fue escrita con el propósito de acercar la tecnología al usuario, sin sacrificar legibilidad ni experiencia.
