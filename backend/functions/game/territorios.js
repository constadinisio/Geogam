import { auth, db } from "../../config/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { territorios } from '../../data/territorios.js';
import { checkMissions } from "../missions/mission-processor.js";

// --- Variables de estado del juego (SIN CAMBIOS) ---
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
let enunciadoEl, opcionesContainer, timerEl, juegoContainer, imagenEl, containerTerritorios;

document.addEventListener('DOMContentLoaded', () => {
    // Asignamos todos los elementos del DOM que vamos a necesitar
    enunciadoEl = document.getElementById('pregunta-enunciado');
    opcionesContainer = document.getElementById('opciones-container');
    timerEl = document.getElementById('timer');
    juegoContainer = document.getElementById('juego-container');
    imagenEl = document.getElementById('pregunta-imagen');
    containerTerritorios = document.querySelector('.container-territorios'); // Pantalla de bienvenida

    const params = new URLSearchParams(window.location.search);
    dificultadPartida = params.get('dificultad');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            // **MODIFICACIÓN**: Misma lógica de visibilidad, pero con los nuevos contenedores
            if (dificultadPartida) {
                if (containerTerritorios) containerTerritorios.style.display = 'none';
                if (juegoContainer) juegoContainer.style.display = 'block';
                iniciarPartida();
            } else {
                if (containerTerritorios) containerTerritorios.style.display = 'block';
                if (juegoContainer) juegoContainer.style.display = 'none';
            }
        } else {
            alert("Debes iniciar sesión para jugar este modo.");
            window.location.href = "/public/login.html";
        }
    });
});

function iniciarPartida() {
    // --- LÓGICA DE CARGA Y FILTRADO (SIN CAMBIOS) ---
    const preguntasFiltradas = territorios.filter(p => p.dificultad === dificultadPartida);
    preguntasJuego = preguntasFiltradas.sort(() => Math.random() - 0.5).slice(0, 5);

    if (preguntasJuego.length > 0) {
        // --- LÓGICA DE REINICIO DE PARTIDA (SIN CAMBIOS) ---
        preguntaActualIndex = 0;
        respuestasCorrectas = 0;
        monedasGanadas = 0;
        xpGanada = 0;
        rachaActual = 0;
        mostrarPreguntaActual();
    } else {
        if (juegoContainer) {
            juegoContainer.innerHTML = '<p style="color: white; text-align: center; font-size: 1.5rem;">No hay preguntas para esta dificultad.</p>';
        }
    }
}

function mostrarPreguntaActual() {
    if (!enunciadoEl || !opcionesContainer || !timerEl || !imagenEl) return;

    const pregunta = preguntasJuego[preguntaActualIndex];

    // **MODIFICACIÓN**: Actualizamos el contenido de los elementos de la nueva interfaz
    enunciadoEl.textContent = pregunta.pregunta;
    imagenEl.src = `/public/images/territorios/${pregunta.imagenNombre}`;
    imagenEl.alt = pregunta.pregunta; // Mejoramos la accesibilidad
    opcionesContainer.innerHTML = '';

    const opciones = [...pregunta.opcionesIncorrectas, pregunta.respuestaCorrecta];
    opciones.sort(() => Math.random() - 0.5);

    // **MODIFICACIÓN**: Creamos botones <button> en lugar de enlaces <a>
    opciones.forEach(opcion => {
        const botonOpcion = document.createElement('button');
        botonOpcion.textContent = opcion;
        
        botonOpcion.addEventListener('click', (e) => {
            e.preventDefault();
            // Pasamos el botón para poder aplicarle los estilos de correcto/incorrecto
            manejarRespuesta(opcion, pregunta.respuestaCorrecta, botonOpcion);
        });
        opcionesContainer.appendChild(botonOpcion);
    });

    // --- LÓGICA DEL TEMPORIZADOR (SIN CAMBIOS, SOLO TEXTO) ---
    clearInterval(timerInterval);
    let timeLeft = 10;
    timerEl.textContent = timeLeft + "s";

    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft + "s";
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            rachaActual = 0;
            // Damos feedback visual antes de pasar a la siguiente
            opcionesContainer.querySelectorAll('button').forEach(btn => btn.disabled = true);
            setTimeout(siguientePregunta, 1500);
        }
    }, 1000);
}

// **MODIFICACIÓN**: Aceptamos el botón pulsado para el feedback visual
function manejarRespuesta(opcionSeleccionada, respuestaCorrecta, botonPulsado) {
    clearInterval(timerInterval);

    // **MODIFICACIÓN**: Deshabilitamos botones y aplicamos clases de estilo
    opcionesContainer.querySelectorAll('button').forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === respuestaCorrecta) {
            btn.classList.add('correct');
        } else {
            btn.classList.add('incorrect');
        }
    });
    
    // --- LÓGICA DE PUNTUACIÓN (SIN CAMBIOS) ---
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
        // Aplicamos el estilo de "mal seleccionado"
        if (botonPulsado) {
            botonPulsado.classList.remove('incorrect');
            botonPulsado.classList.add('selected-incorrect');
        }
    }
    
    // Esperamos 1.5 segundos para mostrar la siguiente pregunta
    setTimeout(siguientePregunta, 1500);
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

    // **MODIFICACIÓN**: Reemplazamos el contenedor del juego con el nuevo resumen estilizado
    if (juegoContainer) {
        juegoContainer.innerHTML = `
            <div class="game-background">
                <div class="menu-container" id="resumen-final" style="text-align: center; color: white;">
                    <div class="game-title">¡Partida Finalizada!</div>
                    <div class="resumen-body" style="background-color: rgba(0,0,0,0.2); border-radius: 15px; padding: 30px; margin-top: 20px;">
                        
                        <p style="font-size: 1.8rem; font-weight: bold; margin-bottom: 20px;">Aciertos: ${respuestasCorrectas} de ${preguntasJuego.length}</p>
                        
                        <div style="display: flex; justify-content: center; gap: 30px; font-size: 1.6rem; margin-bottom: 35px;">
                            <span style="color: white; font-weight: bold; -webkit-text-stroke: 1px black;">+${monedasGanadas} Monedas</span>
                            <span style="color: white; font-weight: bold; -webkit-text-stroke: 1px black;">+${xpGanada} XP</span>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                            <a href="territorios.html" class="menu-btn" style="width: 220px;">Jugar de Nuevo</a>
                            <a href="../offline-mode.html" class="menu-btn" style="width: 220px;">Volver al Menú</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// --- FUNCIÓN DE ACTUALIZAR DATOS EN FIRESTORE (SIN CAMBIOS) ---
async function actualizarDatosYRevisarMisiones() {
    if (!currentUser) return;
    const userDocRef = doc(db, "users", currentUser.uid);

    const gameResult = {
        correctAnswers: respuestasCorrectas,
        isPerfectGame: preguntasJuego.length > 0 && respuestasCorrectas === preguntasJuego.length
    };

    try {
        await updateDoc(userDocRef, {
            'monedas': increment(monedasGanadas),
            'xp': increment(xpGanada),
            'estadisticas.partidasJugadas': increment(1),
            'estadisticas.preguntasCorrectas': increment(respuestasCorrectas),
            'estadisticas.preguntasIncorrectas': increment(preguntasJuego.length - respuestasCorrectas)
        });
        await checkMissions(currentUser.uid, gameResult);
    } catch (error) {
        console.error("Error al actualizar estadísticas y misiones: ", error);
    }
}
