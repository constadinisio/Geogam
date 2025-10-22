import { auth, database } from "../../config/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userRef = ref(database, 'users/' + user.uid);
            try {
                const snapshot = await get(userRef);
                let userLevel = 1;
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    userLevel = userData.level || 1;
                }
                
                actualizarBotonesDificultad(userLevel);

            } catch (error) {
                console.error("Error al obtener el nivel del usuario: ", error);
                // Si hay un error, por seguridad, mantenemos los niveles bloqueados
                actualizarBotonesDificultad(1);
            }
        } else {
            // Si no hay usuario, redirigir al login, ya que es necesario para jugar
            window.location.href = "/public/pages/login.html";
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
        btnMedio.href = 'juego.html?dificultad=Media';
    } else {
        btnMedio.classList.add('locked');
        btnMedio.innerHTML = 'Media <span class="lock-icon">&#128274;</span> (Nivel 5)';
        btnMedio.removeAttribute('href');
    }

    // Nivel Difícil: Requiere nivel 10
    if (nivel >= 10) {
        btnDificil.classList.remove('locked');
        btnDificil.innerHTML = 'Difícil';
        btnDificil.href = 'juego.html?dificultad=Difícil';
    } else {
        btnDificil.classList.add('locked');
        btnDificil.innerHTML = 'Difícil <span class="lock-icon">&#128274;</span> (Nivel 10)';
        btnDificil.removeAttribute('href');
    }
}
