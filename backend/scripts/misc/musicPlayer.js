// backend/scripts/misc/musicPlayer.js

// Obtener la referencia al elemento de audio
const backgroundMusic = document.getElementById('background-music');

/**
 * Reproduce la música de fondo.
 */
export function playMusic() {
  if (backgroundMusic) {
    backgroundMusic.play().catch(error => {
      console.error("Error al intentar reproducir la música:", error);
      // Esto a menudo ocurre debido a las políticas de reproducción automática de los navegadores.
      // Considera añadir un botón para iniciar la reproducción.
    });
  } else {
    console.warn("Elemento de audio con ID 'background-music' no encontrado.");
  }
}

/**
 * Pausa la música de fondo.
 */
export function pauseMusic() {
  if (backgroundMusic) {
    backgroundMusic.pause();
  } else {
    console.warn("Elemento de audio con ID 'background-music' no encontrado.");
  }
}

/**
 * Establece el volumen de la música de fondo.
 * @param {number} volume - El nivel de volumen (entre 0.0 y 1.0).
 */
export function setVolume(volume) {
  if (backgroundMusic) {
    // Asegurarse de que el volumen esté dentro del rango válido [0, 1]
    const clampedVolume = Math.max(0, Math.min(1, volume));
    backgroundMusic.volume = clampedVolume;
  } else {
    console.warn("Elemento de audio con ID 'background-music' no encontrado.");
  }
}

// Opcional: reproducir la música al cargar el script,
// pero ten en cuenta las políticas de reproducción automática del navegador.
// playMusic();