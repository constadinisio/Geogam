// backend/functions/misc/musicPlayer.js

// Obtener la referencia al elemento de audio
const backgroundMusic = document.getElementById('background-music');

// Función para guardar el estado de la música (tiempo actual)
function saveMusicState() {
  if (backgroundMusic) {
    localStorage.setItem('musicCurrentTime', backgroundMusic.currentTime);
  }
}

// Guardar el tiempo actual de la música antes de que la ventana se descargue (al navegar a otra página)
window.addEventListener('beforeunload', saveMusicState);

// Cuando los metadatos del audio se carguen, intentar establecer el tiempo guardado
if (backgroundMusic) {
  backgroundMusic.addEventListener('loadedmetadata', () => {
    const savedTime = localStorage.getItem('musicCurrentTime');
    if (savedTime) {
      backgroundMusic.currentTime = parseFloat(savedTime);
    }
  });
}

/**
 * Reproduce la música de fondo.
 */
export function playMusic() {
  if (backgroundMusic) {
    // El event listener 'loadedmetadata' de arriba se encargará de establecer el tiempo.
    // Solo necesitamos iniciar la reproducción.
    const playPromise = backgroundMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Error al intentar reproducir la música:", error);
        // La reproducción automática fue prevenida por el navegador.
      });
    }
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
    // También guardar el estado cuando la música es pausada manualmente
    saveMusicState();
  } else {
    console.warn("Elemento de audio con ID 'background-music' no encontrado.");
  }
}

/**
 * Establece el volumen de la música.
 * @param {number} volume - Un valor entre 0.0 y 1.0.
 */
export function setVolume(volume) {
  if (backgroundMusic) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    backgroundMusic.volume = clampedVolume;
  } else {
    console.warn("Elemento de audio con ID 'background-music' no encontrado.");
  }
}
