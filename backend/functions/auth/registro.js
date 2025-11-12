
/**
 *  'registro.js' es el archivo encargado del procesamiento y validación de los datos ingresados en el frontend.
 *  Este es utilizado en 'registro.html'.
 */

import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, firestore } from "../../../config/firebase-config.js";
import { missions } from "../../data/missions.js";

const registrationForm = document.getElementById("registrationForm");
const errorMessageDiv = document.getElementById("errorMessage");

if (!registrationForm) {
    console.error("Error crítico: El formulario de registro #registrationForm no se encontró en la página.");
} else {
    registrationForm.addEventListener("submit", (e) => {
        e.preventDefault();

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

            if (!email || !password || !nombre || !apellido || !usuario) {
                if (errorMessageDiv) {
                    errorMessageDiv.textContent = "Todos los campos son obligatorios.";
                }
                return;
            }
            
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;

                    // Prepara el mapa de misiones para el nuevo usuario
                    const userMissions = {};
                    missions.forEach(mission => {
                        userMissions[mission.id] = { completada: false };
                    });

                    // Estructura de datos completa para Cloud Firestore
                    const newUserDoc = {
                        nombre: nombre,
                        apellido: apellido,
                        usuario: usuario,
                        email: email,
                        monedas: 0,
                        estadisticas: {
                            partidasJugadas: 0,
                            partidasGanadas: 0,
                            porcentajeVictorias: 0,
                            preguntasCorrectas: 0,
                            preguntasIncorrectas: 0,
                            porcentajeAciertos: 0,
                            rachaActual: 0,
                            rachaMaxima: 0,
                            partidasGanadasCorrectas: 0, // Métrica para "El Erudito Impecable"
                            mejorPorcentajeAciertos: 0, // Métrica para "Precisión de Cirujano"
                            tiempoJuego: 0 // Métrica para "Media Maratón"
                        },
                        misiones: userMissions
                    };

                    // Guarda el nuevo documento de usuario en Cloud Firestore
                    setDoc(doc(firestore, 'users', user.uid), newUserDoc)
                        .then(() => {
                            window.location.href = "login.html";
                        })
                        .catch((dbError) => {
                            if(errorMessageDiv) {
                                errorMessageDiv.textContent = "El usuario fue creado, pero hubo un error al guardar sus datos.";
                                console.error("Error al guardar en Firestore: ", dbError);
                            }
                        });
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    if (errorMessageDiv) {
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
            if (errorMessageDiv) {
                errorMessageDiv.textContent = "Error interno: Faltan campos en el formulario.";
            }
        }
    });
}
