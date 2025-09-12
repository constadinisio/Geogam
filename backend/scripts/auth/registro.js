import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { auth, database } from "../../config/firebase-config.js";

const registrationForm = document.getElementById("registrationForm");
const errorMessageDiv = document.getElementById("errorMessage");

if (!registrationForm) {
    console.error("Error crítico: El formulario de registro #registrationForm no se encontró en la página.");
} else {
    registrationForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Paso 1: El formulario de registro fue enviado.");

        const emailInput = registrationForm.querySelector("#email");
        const passwordInput = registrationForm.querySelector("#password");
        const nombreInput = registrationForm.querySelector("#nombre");
        const apellidoInput = registrationForm.querySelector("#apellido");
        const usuarioInput = registrationForm.querySelector("#usuario");

        if (emailInput && passwordInput && nombreInput && apellidoInput && usuarioInput) {
            const email = emailInput.value;
            const password = passwordInput.value;
            const nombre = nombreInput.value;
            const apellido = apellidoInput.value;
            const usuario = usuarioInput.value;

            console.log("Paso 2: Campos del formulario encontrados. Valores:", { email, password, nombre, apellido, usuario });

            if (!email || !password || !nombre || !apellido || !usuario) {
                console.error("Error: Uno o más campos del formulario están vacíos.");
                if (errorMessageDiv) {
                    errorMessageDiv.textContent = "Todos los campos son obligatorios.";
                }
                return; // Detener la ejecución
            }
            
            console.log("Paso 3: Intentando crear el usuario en Firebase Auth...");
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log("Paso 4: ¡Éxito! Usuario creado en Firebase Auth con UID:", user.uid);

                    console.log("Paso 5: Intentando guardar datos adicionales en Realtime Database...");
                    set(ref(database, 'users/' + user.uid), {
                        nombre: nombre,
                        apellido: apellido,
                        usuario: usuario,
                        email: email
                    }).then(() => {
                        console.log("Paso 6: ¡Éxito! Datos guardados en la base de datos.");
                        console.log("Paso 7: Redirigiendo a la página de login...");
                        window.location.href = "login.html"; // Redirección reactivada
                    }).catch((dbError) => {
                        console.error("Error en Paso 6: No se pudieron guardar los datos en la base de datos.", dbError);
                        if(errorMessageDiv) {
                            errorMessageDiv.textContent = "El usuario fue creado, pero hubo un error al guardar sus datos.";
                        }
                    });
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error("Error en Paso 3: Falló la creación del usuario.", { errorCode, errorMessage });
                    if (errorMessageDiv) {
                        // Traducir errores comunes de Firebase
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
            console.error("Error en Paso 2: No se encontraron todos los campos del formulario. Revisa los IDs: #email, #password, #nombre, #apellido, #usuario.");
            if (errorMessageDiv) {
                errorMessageDiv.textContent = "Error interno: Faltan campos en el formulario.";
            }
        }
    });
}
