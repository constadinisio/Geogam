// import { initializeApp } from "firebase/app"; // Elimina o comenta esta línea
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; // Elimina o comenta esta línea

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Tu configuración de Firebase aquí
const firebaseConfig = {
  apiKey: "AIzaSyBlNPoDmKgQLo1o__FHoXURa61Rbx5yuno",
  authDomain: "geogam-1700b.firebaseapp.com",
  projectId: "geogam-1700b",
  storageBucket: "geogam-1700b.appspot.com",
  messagingSenderId: "1007484716725",
  appId: "1:1007484716725:web:4ba44e16a5ed76e59060fc",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const registrationForm = document.getElementById("registrationForm"); // Asume que tu formulario tiene este ID
const errorMessageDiv = document.getElementById("errorMessage"); // Asume que tu div de errores tiene este ID

if (registrationForm) {
  registrationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Evento submit del formulario detectado.");

    const emailInput = registrationForm.querySelector("#email"); // Asume que tu campo de email tiene este ID
    const passwordInput = registrationForm.querySelector("#password"); // Asume que tu campo de contraseña tiene este ID
    const nombreInput = registrationForm.querySelector("#nombre"); // Asume que tu campo de nombre tiene este ID
    const apellidoInput = registrationForm.querySelector("#apellido"); // Asume que tu campo de apellido tiene este ID
    const usuarioInput = registrationForm.querySelector("#usuario"); // Asume que tu campo de usuario tiene este ID

    if (
      emailInput &&
      passwordInput &&
      nombreInput &&
      apellidoInput &&
      usuarioInput
    ) {
      console.log("Campos de email y contraseña encontrados.");
      const email = emailInput.value;
      const password = passwordInput.value;
      const nombre = nombreInput.value;
      const apellido = apellidoInput.value;
      const usuario = usuarioInput.value;

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Registro exitoso
          const user = userCredential.user;
          console.log("Usuario registrado:", user);
          // Redirigir a la página de menú
          window.location.href = "menu.html"; // Ajusta la URL si es necesario
        })
        .catch((error) => {
          // Ocurrió un error
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error("Error de registro:", errorCode, errorMessage);
          // Mostrar mensaje de error al usuario
          if (errorMessageDiv) {
            errorMessageDiv.textContent = errorMessage;
          }
        });
    } else {
      console.log("Campos de email o contraseña NO encontrados.");
      if (errorMessageDiv) {
        errorMessageDiv.textContent =
          "Error: Campos de email o contraseña no encontrados.";
      }
    }
  });
}
