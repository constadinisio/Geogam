// --- Archivo de configuración para la vista de estadísticas ---

import { database } from "../../config/firebase-config.js"; //importa el archivo de la configuración de firebase para poder acceder a la base de datos
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js"; //linea de código fundamental para interactuar con la base de datos en tiempo real de Firebase

// --- Función principal para inicializar la vista de estadísticas ---
async function inicializarEstadisticas(event) {
    const { user } = event.detail; // Obtenemos el usuario directamente del evento disparado por el loader

    if (user) {
        console.log(`app-ready event received. User UID: ${user.uid}. Initializing statistics...`);
        // Usuario ha iniciado sesión, obtener sus datos
        const userRef = ref(database, 'users/' + user.uid);
        try {
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const userData = snapshot.val();
                actualizarVistaEstadisticas(userData, user.displayName);
            } else {
                console.warn(`Datos no encontrados para el usuario ${user.uid}. Mostrando valores por defecto.`);
                actualizarVistaEstadisticas({ level: 1, xp: 0, coins: 0 }, user.displayName);
            }
        } catch (error) {
            console.error("Error al obtener los datos del usuario: ", error);
            document.getElementById('nombre-usuario').textContent = 'Error al cargar';
        }
    } else {

        // Si el loader ya determinó que no hay usuario, redirigimos al login.
        console.log("Usuario no autenticado (recibido del loader), redirigiendo al login.");
        window.location.href = "/public/pages/login.html";
    }
}

// --- Función auxiliar para actualizar los elementos del DOM ---
function actualizarVistaEstadisticas(userData, displayName) {
    const nombreUsuarioEl = document.getElementById('nombre-usuario');
    const nivelUsuarioEl = document.getElementById('nivel-usuario');
    const monedasUsuarioEl = document.getElementById('monedas-usuario');
    const xpTextoEl = document.getElementById('xp-texto');
    const xpBar = document.getElementById('xp-bar-foreground');

    if (nombreUsuarioEl) nombreUsuarioEl.textContent = displayName || 'Usuario';
    if (nivelUsuarioEl) nivelUsuarioEl.textContent = userData.level || 1;
    if (monedasUsuarioEl) monedasUsuarioEl.textContent = userData.coins || 0;

    // Lógica de la barra de experiencia (XP)
    const nivelActual = userData.level || 1;
    const xpActual = userData.xp || 0;
    const xpParaSiguienteNivel = Math.floor(100 * Math.pow(nivelActual, 1.5));
    const progresoXP = (xpActual / xpParaSiguienteNivel) * 100;

    if (xpTextoEl) xpTextoEl.textContent = `${xpActual} / ${xpParaSiguienteNivel} XP`;
    if (xpBar) xpBar.style.width = `${progresoXP}%`;
}

// --- Punto de Entrada: Esperar la señal global de que la app está lista ---
document.addEventListener('app-ready', inicializarEstadisticas);
