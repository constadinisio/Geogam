// Importa las funciones y objetos necesarios de Firebase para la autenticación, la base de datos en tiempo real y Firestore.
import { auth, database, db } from "../../config/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- Variables de estado del juego ---
// Estas variables mantienen el estado de la partida actual.
let currentUser = null; // Almacena el objeto del usuario autenticado.
let preguntasJuego = []; // Array para almacenar las preguntas de la partida.
let preguntaActualIndex = 0; // Índice de la pregunta actual que se está mostrando.
let respuestasCorrectas = 0; // Contador de respuestas correctas.
let respuestasIncorrectas = 0; // Contador de respuestas incorrectas.
let monedasGanadas = 0; // Monedas acumuladas durante la partida.
let xpGanada = 0; // Experiencia (XP) acumulada durante la partida.
let rachaActual = 0; // Contador de respuestas correctas consecutivas.
let dificultadPartida = ''; // Dificultad de la partida ('Fácil', 'Media', 'Difícil').
let timerInterval = null; // Variable para controlar el temporizador de cada pregunta.

// Se ejecuta cuando el contenido del DOM ha sido completamente cargado.
document.addEventListener('DOMContentLoaded', () => {
    // Observa los cambios en el estado de autenticación del usuario.
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Si hay un usuario autenticado, lo guarda en currentUser.
            currentUser = user;
            // Obtiene la dificultad de la partida de los parámetros de la URL.
            const params = new URLSearchParams(window.location.search);
            dificultadPartida = params.get('dificultad');
            if (dificultadPartida) {
                // Si se especificó una dificultad, inicia la partida.
                await iniciarPartida();
            }
        } else {
            // Si no hay usuario autenticado, muestra una alerta y redirige a la página de login.
            alert("Debes iniciar sesión para jugar.");
            window.location.href = "/public/pages/login.html";
        }
    });
});

// Inicializa una nueva partida.
async function iniciarPartida() {
    // Obtiene las preguntas según la dificultad seleccionada.
    preguntasJuego = await obtenerPreguntas(dificultadPartida);
    if (preguntasJuego.length > 0) {
        // Si se encontraron preguntas, reinicia el estado del juego.
        preguntaActualIndex = 0;
        respuestasCorrectas = 0;
        respuestasIncorrectas = 0;
        monedasGanadas = 0;
        xpGanada = 0;
        rachaActual = 0;
        // Muestra la primera pregunta.
        mostrarPreguntaActual();
    } else {
        // Si no se encontraron preguntas, muestra un mensaje.
        document.getElementById('pregunta-enunciado').textContent = 'No se encontraron preguntas para esta dificultad.';
    }
}

// Obtiene un conjunto de preguntas de Firestore según la dificultad.
async function obtenerPreguntas(dificultad) {
    const preguntasRef = collection(db, 'preguntas');
    // Crea una consulta para filtrar las preguntas por dificultad.
    const q = query(preguntasRef, where('dificultad', '==', dificultad));
    const querySnapshot = await getDocs(q);
    const preguntas = [];
    querySnapshot.forEach((doc) => {
        // Añade cada pregunta encontrada al array.
        preguntas.push({ id: doc.id, ...doc.data() });
    });
    // Mezcla las preguntas aleatoriamente y devuelve las primeras 10.
    return preguntas.sort(() => Math.random() - 0.5).slice(0, 10);
}

// Muestra la pregunta actual en la interfaz de usuario.
function mostrarPreguntaActual() {
    const pregunta = preguntasJuego[preguntaActualIndex];
    const enunciadoEl = document.getElementById('pregunta-enunciado');
    const imagenEl = document.getElementById('pregunta-imagen');
    const opcionesContainer = document.getElementById('opciones-container');
    const timerEl = document.getElementById('timer');

    // Reinicia el temporizador para la nueva pregunta.
    clearInterval(timerInterval);
    let timeLeft = 15; // Tiempo límite de 15 segundos por pregunta.
    timerEl.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            // Si se acaba el tiempo, se considera una respuesta incorrecta.
            clearInterval(timerInterval);
            alert("¡Se acabó el tiempo!");
            respuestasIncorrectas++;
            rachaActual = 0; // Se reinicia la racha.
            siguientePregunta();
        }
    }, 1000);

    // Muestra la imagen de la pregunta si existe.
    if (pregunta.imagenNombre) {
        imagenEl.src = `/public/images/preguntas/${pregunta.imagenNombre}`;
        imagenEl.style.display = 'block';
        enunciadoEl.textContent = pregunta.enunciado || '';
    } else {
        imagenEl.style.display = 'none';
        enunciadoEl.textContent = pregunta.enunciado;
    }

    // Crea y muestra los botones de opción.
    opcionesContainer.innerHTML = '';
    const opciones = [...pregunta.opcionesIncorrectas, pregunta.respuestaCorrecta];
    // Mezcla las opciones aleatoriamente.
    opciones.sort(() => Math.random() - 0.5);

    opciones.forEach(opcion => {
        const botonOpcion = document.createElement('button');
        botonOpcion.textContent = opcion;
        botonOpcion.classList.add('menu-btn');
        botonOpcion.addEventListener('click', () => manejarRespuesta(opcion, pregunta.respuestaCorrecta));
        opcionesContainer.appendChild(botonOpcion);
    });
}

// Procesa la respuesta seleccionada por el usuario.
function manejarRespuesta(opcionSeleccionada, respuestaCorrecta) {
    clearInterval(timerInterval); // Detiene el temporizador.

    if (opcionSeleccionada === respuestaCorrecta) {
        // Si la respuesta es correcta:
        respuestasCorrectas++;
        rachaActual++;
        
        // Calcula las monedas y XP ganadas según la dificultad.
        let monedasPorRespuesta = 10, xpPorRespuesta = 15; // Fácil
        if(dificultadPartida === 'Media') { monedasPorRespuesta = 20; xpPorRespuesta = 25; }
        if(dificultadPartida === 'Difícil') { monedasPorRespuesta = 30; xpPorRespuesta = 35; }

        // Aplica un bono por racha de respuestas correctas.
        let bonoRacha = 0;
        if (rachaActual >= 3) bonoRacha = 5 * (rachaActual - 2);

        monedasGanadas += monedasPorRespuesta + bonoRacha;
        xpGanada += xpPorRespuesta;

        alert(`¡Correcto! +${monedasPorRespuesta} monedas, +${xpPorRespuesta} XP. Racha: ${rachaActual}`);

    } else {
        // Si la respuesta es incorrecta:
        respuestasIncorrectas++;
        rachaActual = 0; // Se pierde la racha.
        alert('Incorrecto. Pierdes la racha.');
    }
    // Pasa a la siguiente pregunta.
    siguientePregunta();
}

// Avanza a la siguiente pregunta o finaliza el juego.
function siguientePregunta() {
    preguntaActualIndex++;
    if (preguntaActualIndex < preguntasJuego.length) {
        // Si quedan preguntas, muestra la siguiente.
        mostrarPreguntaActual();
    } else {
        // Si no quedan preguntas, muestra el resumen final.
        mostrarResumenFinal();
    }
}

// Muestra el resumen final de la partida.
async function mostrarResumenFinal() {
    clearInterval(timerInterval); // Detiene el temporizador.
    // Otorga bonos finales por completar la partida.
    const bonoFinalMonedas = 100;
    const bonoFinalXP = 50;
    monedasGanadas += bonoFinalMonedas;
    xpGanada += bonoFinalXP;

    // Actualiza los datos del usuario en la base de datos.
    await actualizarDatosUsuario();

    // Muestra la pantalla de resumen con las estadísticas finales.
    const gameContainer = document.getElementById('pregunta-container');
    gameContainer.innerHTML = `
        <div class="menu" id="resumen-final">
            <div class="menu-header">¡Partida Completada!</div>
            <hr class="menu-divider" />
            <div class="menu-body">
                <img src="/public/images/fondorecuadro2.webp" alt="Decoración" class="menu-img" />
                <div class="menu-options" style="flex-direction: column;">
                    <p>Respuestas Correctas: ${respuestasCorrectas}</p>
                    <p>Respuestas Incorrectas: ${respuestasIncorrectas}</p>
                    <p>Monedas Obtenidas: ${monedasGanadas} (+${bonoFinalMonedas} de bono)</p>
                    <p>Experiencia Ganada: ${xpGanada} (+${bonoFinalXP} de bono)</p>
                    <a href="niveles.html" class="menu-btn">Jugar de Nuevo</a>
                    <a href="/public/pages/menu.html" class="menu-btn">Menú Principal</a>
                </div>
            </div>
        </div>
    `;
}

// Actualiza las monedas, XP y nivel del usuario en la Realtime Database.
async function actualizarDatosUsuario() {
    if (!currentUser) return; // No hace nada si no hay un usuario.

    const userRef = ref(database, 'users/' + currentUser.uid);
    try {
        const snapshot = await get(userRef);
        let userData = { coins: 0, level: 1, xp: 0 };

        if (snapshot.exists()) {
            userData = snapshot.val();
        }

        // 1. Actualiza las monedas.
        userData.coins = (userData.coins || 0) + monedasGanadas;

        // 2. Actualiza el XP y maneja la subida de nivel.
        let nivelActual = userData.level || 1;
        let xpActual = (userData.xp || 0) + xpGanada;

        let xpParaSiguienteNivel = Math.floor(100 * Math.pow(nivelActual, 1.5));

        // Comprueba si el usuario ha ganado suficiente XP para subir de nivel.
        while (xpActual >= xpParaSiguienteNivel) {
            nivelActual++;
            xpActual -= xpParaSiguienteNivel;
            xpParaSiguienteNivel = Math.floor(100 * Math.pow(nivelActual, 1.5));
            // Notifica al usuario sobre la subida de nivel.
            setTimeout(() => alert(`¡Felicidades! ¡Has subido al nivel ${nivelActual}!`), 500);
        }

        userData.level = nivelActual;
        userData.xp = xpActual;

        // 3. Guarda todos los datos actualizados en la base de datos.
        await update(userRef, userData);
        console.log("Datos del usuario (monedas y XP) actualizados en la base de datos.");

    } catch (error) {
        console.error("Error al actualizar los datos del usuario: ", error);
    }
}
