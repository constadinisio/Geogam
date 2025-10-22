/**
 *  'login.js' es el archivo encargado del procesamiento y validación de las credenciales ingresadas en el frontend.
 *  Este es utilizado en 'login.html'.
 */

// 1. Importar las funciones necesarias del SDK de Firebase
import {
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth } from "../../config/firebase-config.js";

// 4. Seleccionar elementos del DOM
const formLogin = document.getElementById("form-login");
const mensajeError = document.getElementById("mensaje-error");

// 5. Agregar un listener para el evento 'submit' del formulario
if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevenir el envío tradicional del formulario

    // Obtener los valores de email y contraseña
    const email = formLogin.email.value;
    const password = formLogin.contrasena.value; // Corregido para usar el nombre correcto del campo

    // 6. Iniciar sesión con Firebase
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // 7. Redirigir al usuario al menú principal (o a donde quieras)
        window.location.href = "/public/pages/menu.html"; //_blank
      })
      .catch((error) => {
        // 8. Manejar errores de inicio de sesión
        console.error("Error de inicio de sesión:", error.code, error.message);
        if (mensajeError) {
          switch (error.code) {
            case "auth/user-not-found":
              mensajeError.textContent = "El correo electrónico no está registrado.";
              break;
            case "auth/wrong-password":
              mensajeError.textContent = "La contraseña es incorrecta.";
              break;
            case "auth/invalid-email":
              mensajeError.textContent = "El formato del correo electrónico no es válido.";
              break;
            default:
              mensajeError.textContent =
                "Ocurrió un error. Por favor, inténtalo de nuevo.";
          }
        }
      });
  });
}


