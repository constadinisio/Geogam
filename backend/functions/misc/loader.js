import { auth } from '../../config/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const loadingScreen = document.getElementById('pantalla_de_carga');
const mainContent = document.getElementById('main-content');

// --- Promise que resuelve con el estado de autenticación inicial ---
function verificarAutenticacion() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, 
            (user) => { // Éxito
                unsubscribe();
                resolve(user); // Resuelve la promesa CON el objeto user
            },
            (error) => { // Error
                unsubscribe();
                reject(error);
            }
        );
    });
}

// --- Función principal que se ejecuta al cargar el script ---
(async function inicializarApp() {
    if (!loadingScreen || !mainContent) {
        console.error('Error crítico: No se encontraron los elementos #pantalla_de_carga o #main-content.');
        if(mainContent) mainContent.style.display = 'block';
        return;
    }

    mainContent.style.display = 'none';

    try {
        // 1. Esperar a que tengamos el estado de autenticación (el objeto user o null)
        const user = await verificarAutenticacion();

        // 2. ¡LISTO! Despachar el evento con el objeto user en la propiedad 'detail'
        console.log(`Firebase auth ready. User state confirmed. Firing app-ready event.`);
        document.dispatchEvent(new CustomEvent('app-ready', { detail: { user } }));
        
        // 3. Mostrar el contenido y ocultar la carga
        mainContent.style.display = 'block'; 
        loadingScreen.style.display = 'none';

    } catch (error) {
        console.error('Fallo en la inicialización de la app:', error);
        loadingScreen.innerHTML = `
            <div style="text-align: center; color: white; font-family: 'Cinzel', serif;">
                <h1>Error</h1>
                <p>No se pudo cargar la aplicación.</p>
                <p><small>${error.message}</small></p>
            </div>
        `;
    }
})();
