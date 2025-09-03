// Carga volumen guardado (por defecto 0.5)
let effectsVolume = parseFloat(localStorage.getItem("effectsVolume") ?? "0.5");
if (Number.isNaN(effectsVolume)) effectsVolume = 0.5;

// Usa <audio id="click-sound"> si existe; si no, crea uno
let clickSoundEl = document.getElementById("click-sound");
let clickSound;

if (clickSoundEl instanceof HTMLAudioElement) {
  clickSound = clickSoundEl;
} else {
  // ⚠️ Ajustá la ruta a tu archivo de sonido
  clickSound = new Audio("/public/audio/click-4.mp3");
  clickSound.id = "click-sound";
  clickSound.preload = "auto";
  clickSound.style.display = "none";
  // lo agregamos cuando el DOM está listo (por si el body aún no existe)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => document.body.appendChild(clickSound));
  } else {
    document.body.appendChild(clickSound);
  }
}

// aplica volumen inicial
clickSound.volume = effectsVolume;

export function playClickSound() {
  try {
    clickSound.currentTime = 0;
    clickSound.volume = effectsVolume;
    clickSound.play();
  } catch (e) {
    // Silenciar errores de autoplay bloqueado, etc.
  }
}

export function setEffectsVolume(v) {
  const vol = Math.min(1, Math.max(0, Number(v)));
  effectsVolume = Number.isFinite(vol) ? vol : 0.5;
  localStorage.setItem("effectsVolume", String(effectsVolume));
  clickSound.volume = effectsVolume;
}

// Helper opcional: engancha el clic a elementos
export function wireClickSound(selector = "button, a, .nav-item, .btn-volver") {
  document.addEventListener("click", (e) => {
    const el = e.target.closest(selector);
    if (el) playClickSound();
  });
}
