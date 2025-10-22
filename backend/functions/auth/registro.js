/**
 *  'registro.js' es el archivo encargado del procesamiento y validación de los datos ingresadas en el frontend.
 *  Este es utilizado en 'registro.html'.
 */

// Importa las funciones necesarias de Firebase Authentication y Realtime Database.
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { auth, database } from "../../config/firebase-config.js";

// Obtiene el formulario de registro y el div para mostrar mensajes de error del DOM.
const registrationForm = document.getElementById("registrationForm");
const errorMessageDiv = document.getElementById("errorMessage");

// Verifica si el formulario de registro existe en la página.
if (!registrationForm) {
    console.error("Error crítico: El formulario de registro #registrationForm no se encontró en la página.");
} else {
    // Agrega un event listener para el evento "submit" del formulario.
    registrationForm.addEventListener("submit", (e) => {
        // Previene el comportamiento por defecto del formulario (recargar la página).
        e.preventDefault();

        // Obtiene los elementos de entrada del formulario.
        const emailInput = registrationForm.querySelector("#email");
        const passwordInput = registrationForm.querySelector("#password");
        const nombreInput = registrationForm.querySelector("#nombre");
        const apellidoInput = registrationForm.querySelector("#apellido");
        const usuarioInput = registrationForm.querySelector("#usuario");

        // Verifica si todos los campos del formulario existen.
        if (emailInput && passwordInput && nombreInput && apellidoInput && usuarioInput) {
            // Obtiene los valores de los campos de entrada.
            const email = emailInput.value;
            const password = passwordInput.value;
            const nombre = nombreInput.value;
            const apellido = apellidoInput.value;
            const usuario = usuarioInput.value;

            // Valida que todos los campos estén completos.
            if (!email || !password || !nombre || !apellido || !usuario) {
                if (errorMessageDiv) {
                    errorMessageDiv.textContent = "Todos los campos son obligatorios.";
                }
                return; // Detiene la ejecución si falta algún campo.
            }
            
            // Crea un nuevo usuario en Firebase Authentication con el correo y la contraseña proporcionados.
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Si el usuario se crea con éxito, obtiene el objeto de usuario.
                    const user = userCredential.user;

                    // Guarda los datos adicionales del usuario en la Realtime Database de Firebase.
                    set(ref(database, 'users/' + user.uid), {
                        nombre: nombre,
                        apellido: apellido,
                        usuario: usuario,
                        email: email
                    }).then(() => {
                        // Si los datos se guardan correctamente, redirige al usuario a la página de login.
                        window.location.href = "login.html";
                    }).catch((dbError) => {
                        // Si hay un error al guardar los datos, muestra un mensaje de error.
                        if(errorMessageDiv) {
                            errorMessageDiv.textContent = "El usuario fue creado, pero hubo un error al guardar sus datos.";
                        }
                    });
                })
                .catch((error) => {
                    // Si hay un error al crear el usuario, maneja los diferentes códigos de error.
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    if (errorMessageDiv) {
                        // Traduce los códigos de error comunes de Firebase a mensajes más amigables para el usuario.
                        switch (errorCode) {
                            case 'auth/email-already-in-use':
                                errorMessageDiv.textContent = 'El correo electrónico ya está en uso.';
                                break;
                            case 'auth/invalid-email':
                                errorMessageDiv.textContent = 'El formato del correo electrónico no es válido.';
                                break;
                            case 'auth/weak-password':
                                errorMessageDiv.textContent = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
                                break;
                            default:
                                errorMessageDiv.textContent = `Error de registro: ${errorMessage}`;
                        }
                    }
                });
        } else {
            // Si faltan campos en el formulario, muestra un mensaje de error interno.
            if (errorMessageDiv) {
                errorMessageDiv.textContent = "Error interno: Faltan campos en el formulario.";
            }
        }
    });
}
