// Mantén solo la importación de las funciones que necesitas directamente del CDN
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Mantén la importación de la instancia 'auth' desde tu archivo de configuración
import { auth, database } from "../../config/firebase-config.js"; // <-- Asegúrate de que esta ruta sea correcta

/**
 * Cierra la sesión del usuario actual y redirige a la página de login.
 */
export function logout() {
  signOut(auth)
    .then(() => {
      console.log("Usuario deslogueado.");
      window.location.href = "/public/login.html"; // Ajusta la ruta si es necesario
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
    if (user) {
      // El usuario está logueado
      const userId = user.uid;
      const userRef = ref(database, 'users/' + userId);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          // Ahora puedes usar los datos del usuario, por ejemplo, para mostrarlos en el perfil
          console.log("Datos del usuario:", userData);
          // Aquí puedes llamar a una función para actualizar la UI con los datos del usuario
          updateProfileUI(userData);
        } else {
          console.log("No hay datos disponibles para este usuario.");
        }
      }).catch((error) => {
        console.error("Error al obtener los datos del usuario:", error);
      });
    } else {
      console.log("Usuario no logueado. Redirigiendo a login.");
      window.location.href = "/public/login.html"; // Ajusta la ruta si es necesario
    }
  });
}

function updateProfileUI(userData) {
  // Suponiendo que tienes elementos en tu HTML con estos IDs
  const usuarioElement = document.querySelector(".user-input");

  if (usuarioElement) {
    usuarioElement.textContent = "Usuario: " + userData.usuario;
  }
}
