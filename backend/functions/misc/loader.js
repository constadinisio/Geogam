
// Importa los servicios de autenticación (auth) y la base de datos (db) desde la configuración centralizada.
import { auth, db } from '../../config/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/**
 * Muestra el contenido principal y oculta la pantalla de carga.
 * CORREGIDO: Se elimina el optional chaining ('?.') para máxima compatibilidad.
 */
function showMainContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.style.display = 'block';
    }
    const loader = document.getElementById('pantalla_de_carga');
    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * Dispara un evento global con los detalles del usuario.
 */
function dispatchAppReady(user) {
    const event = new CustomEvent('app-ready', { detail: { user } });
    document.dispatchEvent(event);
    console.log(`Loader: 'app-ready' event dispatched. User: ${user ? user.uid : 'null'}`);
}

/**
 * Función principal del Loader.
 */
onAuthStateChanged(auth, async (user) => {
    const publicPaths = [
        '/public/login.html',
        '/public/registro.html',
        '/public/pages/creditos.html' 
    ];
    const isPublicPage = publicPaths.some(path => window.location.pathname.includes(path));

    if (user) {
        // --- USUARIO AUTENTICADO ---
        console.log(`Loader: Usuario autenticado (UID: ${user.uid}).`);
        try {
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);
            if (!docSnap.exists()) {
                console.error(`Error de consistencia: El usuario ${user.uid} está autenticado pero no tiene documento en Firestore.`);
            }
        } catch (error) {
            console.error("Loader: Error al verificar el documento del usuario en Firestore:", error);
        }
        dispatchAppReady(user);
        showMainContent();
    } else {
        // --- USUARIO NO AUTENTICADO ---
        console.log("Loader: No hay usuario autenticado.");
        if (isPublicPage) {
            dispatchAppReady(null);
            showMainContent();
        } else {
            console.log("Loader: Redirigiendo al login desde una página privada.");
            window.location.href = '/public/login.html';
        }
    }
});
