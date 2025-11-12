import { auth, db } from "../../config/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Usamos la referencia a Firestore (db), no a Realtime Database.
            const userDocRef = doc(db, 'users', user.uid);
            try {
                const docSnap = await getDoc(userDocRef);
                let userXP = 0;
                if (docSnap.exists()) {
                    userXP = docSnap.data().xp || 0;
                }
                // Calcula el nivel basado en la XP (asumiendo 1000 XP por nivel)
                const userLevel = Math.floor(userXP / 1000) + 1;
                
                actualizarBotonesDificultad(userLevel);

            } catch (error) {
                console.error("Error al obtener los datos del usuario: ", error);
                // En caso de error, mantenemos los niveles bloqueados por seguridad.
                actualizarBotonesDificultad(1);
            }
        } else {
            // Si no hay usuario, se le debería redirigir al login.
            console.warn("Usuario no autenticado en la página de niveles.");
            // Por ahora, simplemente se mantienen los niveles bloqueados.
            actualizarBotonesDificultad(1);
        }
    });
});

function actualizarBotonesDificultad(nivel) {
    const btnMedio = document.getElementById('btn-nivel-medio');
    const btnDificil = document.getElementById('btn-nivel-dificil');

    // Nivel Medio: Requiere nivel 5
    if (nivel >= 5) {
        btnMedio.classList.remove('locked');
        btnMedio.innerHTML = 'Media';
        // Se asigna el enlace solo si está desbloqueado
        btnMedio.href = 'banderas.html?dificultad=Media';
    } else {
        btnMedio.classList.add('locked');
        btnMedio.innerHTML = 'Media <span class="lock-icon">&#128274;</span> (Nivel 5)';
        btnMedio.removeAttribute('href'); // Se quita el enlace si está bloqueado
    }

    // Nivel Difícil: Requiere nivel 10
    if (nivel >= 10) {
        btnDificil.classList.remove('locked');
        btnDificil.innerHTML = 'Difícil';
        btnDificil.href = 'banderas.html?dificultad=Difícil';
    } else {
        btnDificil.classList.add('locked');
        btnDificil.innerHTML = 'Difícil <span class="lock-icon">&#128274;</span> (Nivel 10)';
        btnDificil.removeAttribute('href');
    }

    // Añadir un listener para alertar al usuario si intenta hacer clic en un nivel bloqueado
    document.querySelectorAll('.menu-btn.locked').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Previene cualquier navegación
            alert('Debes alcanzar el nivel requerido para desbloquear esta dificultad.');
        });
    });
}
