import { auth, db } from "../../config/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, updateDoc, increment, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { checkMissions } from "../missions/mission-processor.js";

// --- Variables de estado del juego (SIN CAMBIOS) ---
let currentUser = null;
let preguntasJuego = [];
let preguntaActualIndex = 0;
let respuestasCorrectas = 0;
let monedasGanadas = 0;
let xpGanada = 0;
let rachaActual = 0;
let timerInterval = null;

// --- Elementos del DOM (serán asignados ahora) ---
let enunciadoEl, opcionesContainer, timerEl, gameContainer, gameTitleEl;

document.addEventListener('DOMContentLoaded', () => {
    // Obtenemos los elementos principales una sola vez
    gameContainer = document.querySelector('.game-background');
    enunciadoEl = document.getElementById('pregunta-enunciado');
    opcionesContainer = document.getElementById('opciones-container');
    timerEl = document.getElementById('timer');
    gameTitleEl = document.getElementById('game-title');

    const urlParams = new URLSearchParams(window.location.search);
    const dificultadSeleccionada = urlParams.get('dificultad');

    if (!dificultadSeleccionada) {
        if (enunciadoEl) {
            enunciadoEl.textContent = "ERROR: No se pudo determinar la dificultad.";
        }
        return;
    }

    // Actualizamos el título visualmente
    if (gameTitleEl) {
        gameTitleEl.innerHTML = `PREGUNTADOS: <strong>${dificultadSeleccionada.toUpperCase()}</strong>`;
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await iniciarPartida(dificultadSeleccionada);
        } else {
            alert("Debes iniciar sesión para jugar.");
            window.location.href = "/public/login.html";
        }
    });
});

async function iniciarPartida(dificultad) {
    // LÓGICA DE CARGA SIN CAMBIOS
    preguntasJuego = await obtenerPreguntasPorDificultad(dificultad);
    
    if (preguntasJuego.length > 0) {
        // LÓGICA DE REINICIO DE PARTIDA SIN CAMBIOS
        preguntaActualIndex = 0;
        respuestasCorrectas = 0;
        monedasGanadas = 0;
        xpGanada = 0;
        rachaActual = 0;
        mostrarPreguntaActual();
    } else {
        if(enunciadoEl) {
            enunciadoEl.textContent = `¡Oh, no! No se encontraron preguntas para esta dificultad.`;
        }
        if (opcionesContainer) {
            opcionesContainer.innerHTML = '';
        }
    }
}

// --- FUNCIÓN DE OBTENER PREGUNTAS DE FIRESTORE (SIN CAMBIOS) ---
async function obtenerPreguntasPorDificultad(dificultad) {
    const preguntasFiltradas = [];
    try {
        const q = query(collection(db, "preguntas"), where("dificultad", "==", dificultad));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
            preguntasFiltradas.push({ id: doc.id, ...doc.data() });
        });

        if (preguntasFiltradas.length > 0) {
            return preguntasFiltradas.sort(() => Math.random() - 0.5).slice(0, 5);
        } else {
            return [];
        }
    } catch (error) {
        console.error(`Error al cargar las preguntas:`, error);
        return [];
    }
}

function mostrarPreguntaActual() {
    const pregunta = preguntasJuego[preguntaActualIndex];
    
    // **MODIFICACIÓN**: Actualizamos el contenido de los elementos existentes
    if(enunciadoEl) enunciadoEl.textContent = pregunta.enunciado;
    if(opcionesContainer) opcionesContainer.innerHTML = ''; // Limpiamos opciones anteriores

    const opciones = [...pregunta.opcionesIncorrectas, pregunta.respuestaCorrecta];
    opciones.sort(() => Math.random() - 0.5);

    // **MODIFICACIÓN**: Creamos botones en lugar de enlaces <a>
    opciones.forEach(opcion => {
        const botonOpcion = document.createElement('button');
        botonOpcion.textContent = opcion;
        // No necesita clase, el CSS apunta a #opciones-container button
        
        botonOpcion.addEventListener('click', (e) => {
            e.preventDefault();
            // Pasamos el propio botón para poder aplicarle estilos
            manejarRespuesta(opcion, pregunta.respuestaCorrecta, botonOpcion);
        });
        if(opcionesContainer) opcionesContainer.appendChild(botonOpcion);
    });
    
    // --- LÓGICA DEL TEMPORIZADOR (SIN CAMBIOS) ---
    clearInterval(timerInterval);
    let timeLeft = 10;
    if(timerEl) timerEl.textContent = timeLeft + 's';

    timerInterval = setInterval(() => {
        timeLeft--;
        if(timerEl) timerEl.textContent = timeLeft + 's';
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            rachaActual = 0;
            // **MODIFICACIÓN**: Añadimos feedback visual para timeout
            if(opcionesContainer) opcionesContainer.querySelectorAll('button').forEach(btn => btn.disabled = true);
            setTimeout(siguientePregunta, 1500); // Esperar antes de pasar
        }
    }, 1000);
}

// **MODIFICACIÓN**: Aceptamos el botón pulsado como argumento
function manejarRespuesta(opcionSeleccionada, respuestaCorrecta, botonPulsado) {
    clearInterval(timerInterval);
    
    // **MODIFICACIÓN**: Deshabilitar todos los botones y aplicar estilos
    if(opcionesContainer) opcionesContainer.querySelectorAll('button').forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === respuestaCorrecta) {
            btn.classList.add('correct');
        } else {
            btn.classList.add('incorrect');
        }
    });

    // --- LÓGICA DE PUNTUACIÓN (SIN CAMBIOS) ---
    const preguntaActual = preguntasJuego[preguntaActualIndex];
    if (opcionSeleccionada === respuestaCorrecta) {
        respuestasCorrectas++;
        rachaActual++;
        let monedasPorRespuesta = 10, xpPorRespuesta = 15;
        if (preguntaActual.dificultad.toLowerCase() === 'media') { monedasPorRespuesta = 20; xpPorRespuesta = 25; }
        if (preguntaActual.dificultad.toLowerCase() === 'difícil') { monedasPorRespuesta = 30; xpPorRespuesta = 35; }
        const bonoRacha = rachaActual >= 3 ? 5 * (rachaActual - 2) : 0;
        monedasGanadas += monedasPorRespuesta + bonoRacha;
        xpGanada += xpPorRespuesta;
    } else {
        rachaActual = 0;
        // **MODIFICACIÓN**: Aplicar estilo al botón incorrecto que se pulsó
        if (botonPulsado) {
            botonPulsado.classList.remove('incorrect');
            botonPulsado.classList.add('selected-incorrect');
        }
    }

    // **MODIFICACIÓN**: Esperamos 1.5s para que el usuario vea la respuesta
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

    // **MODIFICACIÓN**: Nuevo HTML para el resumen final
    if (gameContainer) {
        gameContainer.innerHTML = `
            <div class="menu-container" id="resumen-final" style="text-align: center; color: white;">
                <div class="game-title">¡Partida Finalizada!</div>
                <div class="resumen-body" style="background-color: rgba(0,0,0,0.2); border-radius: 15px; padding: 30px; margin-top: 20px;">
                    
                    <p style="font-size: 1.8rem; font-weight: bold; margin-bottom: 20px;">Aciertos: ${respuestasCorrectas} de ${preguntasJuego.length}</p>
                    
                    <div style="display: flex; justify-content: center; gap: 30px; font-size: 1.6rem; margin-bottom: 35px;">
                        <span style="color: white; font-weight: bold; -webkit-text-stroke: 1px black;">+${monedasGanadas} Monedas</span>
                        <span style="color: white; font-weight: bold; -webkit-text-stroke: 1px black;">+${xpGanada} XP</span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                        <a href="niveles.html" class="menu-btn" style="width: 220px;">Jugar de Nuevo</a>
                        <a href="/public/pages/menu.html" class="menu-btn" style="width: 220px;">Volver al Menú</a>
                    </div>
                </div>
            </div>
        `;
    }
}

// --- FUNCIÓN DE ACTUALIZAR DATOS (SIN CAMBIOS) ---
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