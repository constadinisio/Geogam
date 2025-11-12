import { auth, db } from "../../config/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, updateDoc, setDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { banderas } from "../../data/banderas.js";
import { checkMissions } from "../missions/mission-processor.js";

// --- Variables de estado del juego ---
let currentUser = null;
let preguntasJuego = [];
let preguntaActualIndex = 0;
let respuestasCorrectas = 0;
let monedasGanadas = 0;
let xpGanada = 0;
let rachaActual = 0;
let dificultadPartida = '';
let timerInterval = null;

// --- Elementos del DOM ---
let opcionesContainer, timerEl, juegoContainer, imagenEl;

document.addEventListener('DOMContentLoaded', () => {
    opcionesContainer = document.getElementById('opciones-container');
    timerEl = document.getElementById('timer');
    juegoContainer = document.getElementById('juego-container');
    imagenEl = document.getElementById('bandera-imagen');

    const params = new URLSearchParams(window.location.search);
    dificultadPartida = params.get('dificultad');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            const containerBanderas = document.querySelector('.container-banderas');

            if (dificultadPartida) {
                // Si hay dificultad, se inicia el juego
                if (containerBanderas) containerBanderas.style.display = 'none';
                if (juegoContainer) juegoContainer.style.display = 'block';
                iniciarPartida();
            } else {
                // Si no hay dificultad, se muestra la pantalla de bienvenida
                if (containerBanderas) containerBanderas.style.display = 'block';
                if (juegoContainer) juegoContainer.style.display = 'none';
            }
        } else {
            alert("Debes iniciar sesión para jugar este modo.");
            window.location.href = "/public/login.html";
        }
    });
});

function iniciarPartida() {
    const preguntasFiltradas = banderas.filter(b => b.dificultad === dificultadPartida);
    preguntasJuego = preguntasFiltradas.sort(() => Math.random() - 0.5).slice(0, 5);

    if (preguntasJuego.length > 0) {
        preguntaActualIndex = 0;
        respuestasCorrectas = 0;
        monedasGanadas = 0;
        xpGanada = 0;
        rachaActual = 0;
        mostrarPreguntaActual();
    } else {
        if(juegoContainer) juegoContainer.innerHTML = '<p style="color: white; text-align: center;">No hay preguntas para esta dificultad.</p>';
    }
}

function mostrarPreguntaActual() {
    if (!juegoContainer || !opcionesContainer || !timerEl || !imagenEl) return;

    const pregunta = preguntasJuego[preguntaActualIndex];
    imagenEl.src = `/public/images/banderas/${pregunta.imagenNombre}`;
    opcionesContainer.innerHTML = '';

    const opciones = [...pregunta.opcionesIncorrectas, pregunta.respuestaCorrecta];
    opciones.sort(() => Math.random() - 0.5);

    opciones.forEach(opcion => {
        const botonOpcion = document.createElement('a');
        botonOpcion.textContent = opcion;
        botonOpcion.classList.add('menu-btn');
        botonOpcion.href = '#';
        botonOpcion.addEventListener('click', (e) => {
            e.preventDefault();
            manejarRespuesta(opcion, pregunta.respuestaCorrecta);
        });
        opcionesContainer.appendChild(botonOpcion);
    });

    clearInterval(timerInterval);
    let timeLeft = 15;
    timerEl.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            rachaActual = 0;
            siguientePregunta();
        }
    }, 1000);
}

function manejarRespuesta(opcionSeleccionada, respuestaCorrecta) {
    clearInterval(timerInterval);

    if (opcionSeleccionada === respuestaCorrecta) {
        respuestasCorrectas++;
        rachaActual++;
        
        let monedasPorRespuesta = 10, xpPorRespuesta = 15;
        if(dificultadPartida === 'Media') { monedasPorRespuesta = 20; xpPorRespuesta = 25; }
        if(dificultadPartida === 'Difícil') { monedasPorRespuesta = 30; xpPorRespuesta = 35; }

        const bonoRacha = rachaActual >= 3 ? 5 * (rachaActual - 2) : 0;
        monedasGanadas += monedasPorRespuesta + bonoRacha;
        xpGanada += xpPorRespuesta;

    } else {
        rachaActual = 0;
    }
    siguientePregunta();
}

function siguientePregunta() {
    preguntaActualIndex++;
    if (preguntaActualIndex < preguntasJuego.length) {
        mostrarPreguntaActual();
    } else {
        mostrarResumenFinal();
    }
}

async function mostrarResumenFinal() {
    clearInterval(timerInterval);
    await actualizarDatosYRevisarMisiones();

    if (juegoContainer) {
        juegoContainer.innerHTML = `
            <div class="menu-container" id="resumen-final" style="text-align: center;">
                <div class="menu-header">¡Partida Completada!</div>
                <div class="resumen-body" style="background-image: url('/public/images/fondorecuadro2.webp'); background-size: 100% 100%; background-repeat: no-repeat; background-position: center; min-height: 400px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px; margin-top: 20px;">
                    
                    <p style="font-family: 'Cinzel', serif; color: black; font-size: 1.5rem; font-weight: bold;">Aciertos: ${respuestasCorrectas} de ${preguntasJuego.length}</p>
                    <p style="font-family: 'Cinzel', serif; color: #FFD700; font-size: 1.5rem; font-weight: bold; -webkit-text-stroke: 1px black;">Monedas: +${monedasGanadas}</p>
                    <p style="font-family: 'Cinzel', serif; color: #00FFFF; font-size: 1.5rem; font-weight: bold; -webkit-text-stroke: 1px black;">XP: +${xpGanada}</p>
                    
                    <div style="margin-top: 30px;">
                        <a href="niveles-banderas.html" class="menu-btn">Jugar de Nuevo</a>
                        <a href="banderas.html" class="menu-btn">Volver al Menú</a>
                    </div>
                </div>
            </div>
        `;
    }
}

async function actualizarDatosYRevisarMisiones() {
    if (!currentUser) return;
    const userDocRef = doc(db, "users", currentUser.uid);

    const gameResult = {
        correctAnswers: respuestasCorrectas,
        isPerfectGame: preguntasJuego.length > 0 && respuestasCorrectas === preguntasJuego.length
    };

    try {
        // 1. Actualiza las estadísticas principales del usuario
        await updateDoc(userDocRef, {
            'monedas': increment(monedasGanadas),
            'xp': increment(xpGanada),
            'estadisticas.partidasJugadas': increment(1),
            'estadisticas.preguntasCorrectas': increment(respuestasCorrectas),

            'estadisticas.preguntasIncorrectas': increment(preguntasJuego.length - respuestasCorrectas)
        });

        // 2. Llama al procesador de misiones con el resultado de la partida
        await checkMissions(currentUser.uid, gameResult);

    } catch (error) {
        console.error("Error al actualizar estadísticas y misiones: ", error);
    }
}
