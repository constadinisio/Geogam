
// --- Archivo de configuración para la vista de estadísticas ---

// Importa Firestore DB y funciones en lugar de Realtime Database
import { db } from "../../config/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- Función para calcular el nivel y XP basado en el XP total ---
// Esto convierte el XP total de Firestore al sistema de niveles que la UI necesita.
function calculateLevelInfo(totalXp) {
    let level = 1;
    let xpNeededForNextLevel = Math.floor(100 * Math.pow(level, 1.5));

    while (totalXp >= xpNeededForNextLevel) {
        totalXp -= xpNeededForNextLevel;
        level++;
        xpNeededForNextLevel = Math.floor(100 * Math.pow(level, 1.5));
    }

    return {
        level: level,
        xpInLevel: Math.floor(totalXp),
        xpForNextLevel: xpNeededForNextLevel,
    };
}


// --- Función principal para inicializar la vista de estadísticas ---
async function inicializarEstadisticas(event) {
    const { user } = event.detail;

    if (user) {
        console.log(`Estadisticas: Leyendo datos de Firestore para el usuario ${user.uid}...`);
        // Usuario ha iniciado sesión, obtener sus datos de Firestore
        const userDocRef = doc(db, 'users', user.uid);
        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const userData = docSnap.data();
                // Adaptamos los datos de Firestore a lo que la vista espera
                const viewData = {
                    xp: userData.xp || 0,
                    monedas: userData.monedas || 0,
                    displayName: user.displayName
                };
                actualizarVistaEstadisticas(viewData);
            } else {
                console.warn(`Documento no encontrado en Firestore para el usuario ${user.uid}. Mostrando valores por defecto.`);
                actualizarVistaEstadisticas({ xp: 0, monedas: 0, displayName: user.displayName });
            }
        } catch (error) {
            console.error("Error al obtener los datos del usuario de Firestore: ", error);
            document.getElementById('nombre-usuario').textContent = 'Error al cargar';
        }
    } else {
        console.log("Usuario no autenticado, redirigiendo al login.");
        window.location.href = "/public/pages/login.html";
    }
}

// --- Función auxiliar para actualizar los elementos del DOM ---
function actualizarVistaEstadisticas(viewData) {
    const nombreUsuarioEl = document.getElementById('nombre-usuario');
    const nivelUsuarioEl = document.getElementById('nivel-usuario');
    const monedasUsuarioEl = document.getElementById('monedas-usuario');
    const xpTextoEl = document.getElementById('xp-texto');
    const xpBar = document.getElementById('xp-bar-foreground');

    // Calculamos el nivel actual basado en el XP total
    const levelInfo = calculateLevelInfo(viewData.xp);

    if (nombreUsuarioEl) nombreUsuarioEl.textContent = viewData.displayName || 'Usuario';
    if (nivelUsuarioEl) nivelUsuarioEl.textContent = levelInfo.level;
    // Usamos 'monedas' de Firestore
    if (monedasUsuarioEl) monedasUsuarioEl.textContent = viewData.monedas;

    // Lógica de la barra de experiencia (XP)
    const progresoXP = (levelInfo.xpInLevel / levelInfo.xpForNextLevel) * 100;

    if (xpTextoEl) xpTextoEl.textContent = `${levelInfo.xpInLevel} / ${levelInfo.xpForNextLevel} XP`;
    if (xpBar) xpBar.style.width = `${progresoXP}%`;
}

// --- Punto de Entrada: Esperar la señal global de que la app está lista ---
document.addEventListener('app-ready', inicializarEstadisticas);
