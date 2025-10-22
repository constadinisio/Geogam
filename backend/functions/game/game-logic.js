import { db } from "../../config/firebase-config.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => { //Cuando carga toda la página inicia la siguiente orden.
    const nivelFacilBtn = document.getElementById('nivel-facil');
    const nivelMedioBtn = document.getElementById('nivel-medio');
    const nivelDificilBtn = document.getElementById('nivel-dificil');

    if (nivelFacilBtn) {
        nivelFacilBtn.addEventListener('click', (e) => {
            e.preventDefault(); // cancela el evento si es cancelable 
            iniciarJuego('Fácil');
        });
    }

    if (nivelMedioBtn) {
        nivelMedioBtn.addEventListener('click', (e) => {
            e.preventDefault();
            iniciarJuego('Media');
        });
    }

    if (nivelDificilBtn) {
        nivelDificilBtn.addEventListener('click', (e) => {
            e.preventDefault();
            iniciarJuego('Difícil');
        });
    }
});

function iniciarJuego(dificultad) {
    // Redirigir a la página del juego con la dificultad como parámetro
    window.location.href = `juego.html?dificultad=${dificultad}`;
}
