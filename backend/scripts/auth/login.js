// login.js

// 1. Importar las funciones necesarias del SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 2. Tu configuración de Firebase (REEMPLAZA ESTO CON TUS CLAVES)
const firebaseConfig = {
  apiKey: "AIzaSyBlNPoDmKgQLo1o__FHoXURa61Rbx5yuno",
  authDomain: "geogam-1700b.firebaseapp.com",
  projectId: "geogam-1700b",
  storageBucket: "geogam-1700b.appspot.com",
  messagingSenderId: "1007484716725",
  appId: "1:1007484716725:web:4ba44e16a5ed76e59060fc",
};

// 3. Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Obtenemos la instancia de Authentication

// 4. Seleccionar elementos del DOM
const formLogin = document.getElementById("form-login");
const mensajeError = document.getElementById("mensaje-error");

// 5. Añadir el evento 'submit' al formulario
formLogin.addEventListener("submit", async (e) => {
  e.preventDefault(); // Evita que la página se recargue

  const email = formLogin["email"].value;
  const password = formLogin["contrasena"].value;

  try {
    // 6. Usar la función de Firebase para iniciar sesión
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log("¡Login exitoso!");
    sessionStorage.setItem("fromLogin", "true"); // Establece la bandera
    console.log(
      "Valor de 'fromLogin' en sessionStorage después de establecerlo:",
      sessionStorage.getItem("fromLogin")
    ); // Verifica el valor
    window.location.href = "menu.html"; // Redirige
  } catch (error) {
    // 7. Manejar los errores de inicio de sesión
    console.error("Error al iniciar sesión:", error.code);

    let mensaje = "Ocurrió un error. Inténtalo de nuevo.";
    if (error.code === "auth/user-not-found") {
      mensaje = "El correo electrónico no está registrado.";
    } else if (error.code === "auth/wrong-password") {
      mensaje = "La contraseña es incorrecta.";
    } else if (error.code === "auth/invalid-credential") {
      mensaje =
        "Las credenciales son incorrectas. Verifica el email y la contraseña.";
    }

    mensajeError.textContent = mensaje;
    mensajeError.style.display = "block"; // Muestra el mensaje de error
  }
});
