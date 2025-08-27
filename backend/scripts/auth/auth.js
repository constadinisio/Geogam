// Mantén solo la importación de las funciones que necesitas directamente del CDN
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Mantén la importación de la instancia 'auth' desde tu archivo de configuración
import { auth } from "../../config/firebase-config.js"; // <-- Asegúrate de que esta ruta sea correcta y que 'auth' se exporte en ese archivo

/**
 * Cierra la sesión del usuario actual y redirige a la página de login.
 */
export function logout() {
  signOut(auth)
    .then(() => {
      console.log("Usuario deslogueado.");
      window.location.href = "login.html"; // Ajusta la ruta si es necesario
    })
    .catch((error) => {
      console.error("Error al desloguear:", error);
    });
}

/**
 * Verifica el estado de autenticación del usuario.
 * Si no hay usuario logueado, redirige a la página de login.
 */
export function checkAuthState() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      console.log("Usuario no logueado. Redirigiendo a login.");
      window.location.href = "login.html"; // Ajusta la ruta si es necesario
    }
  });
}