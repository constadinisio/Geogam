import { auth, db } from "../../config/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-options-container');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                let userLevel = 1;

                if (userDocSnap.exists() && userDocSnap.data().nivel) {
                    userLevel = parseInt(userDocSnap.data().nivel, 10) || 1;
                }

                actualizarBotonesDificultad(userLevel);

            } catch (error) {
                console.error("Error al obtener el nivel del usuario:", error);
                actualizarBotonesDificultad(1); // Por seguridad, bloquear si hay error
            }
        } else {
            // Si no hay usuario, redirigir al login. 
            // Opcionalmente, puedes simplemente bloquear todo.
            window.location.href = "/public/login.html";
        }
    });

    // Este listener previene el clic en los botones bloqueados.
    // Se pone fuera del onAuthStateChanged para que se registre una sola vez.
    if (menuContainer) {
        menuContainer.addEventListener('click', (e) => {
            const lockedButton = e.target.closest('.btn-nivel.locked');
            if (lockedButton) {
                e.preventDefault(); // Esta es la línea clave que previene la navegación.
                const requiredLevel = lockedButton.dataset.requiredLevel;
                if (requiredLevel) {
                    alert(`Debes alcanzar el Nivel ${requiredLevel} para desbloquear esta dificultad.`);
                }
            }
        });
    }
});

function actualizarBotonesDificultad(nivel) {
    const btnMedio = document.getElementById('btn-nivel-medio');
    const btnDificil = document.getElementById('btn-nivel-dificil');

    if (!btnMedio || !btnDificil) return;

    // Nivel Medio (requiere nivel 5)
    if (nivel >= 5) {
        btnMedio.classList.remove('locked');
    } else {
        btnMedio.classList.add('locked');
        btnMedio.dataset.requiredLevel = 5;
    }

    // Nivel Difícil (requiere nivel 10)
    if (nivel >= 10) {
        btnDificil.classList.remove('locked');
    } else {
        btnDificil.classList.add('locked');
        btnDificil.dataset.requiredLevel = 10;
    }
}
