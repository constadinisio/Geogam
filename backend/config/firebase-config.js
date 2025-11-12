
// --- Archivo de Configuración Central de Firebase ---

// Importa las funciones necesarias de los SDK de Firebase que necesitas
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBlNPoDmKgQLo1o__FHoXURa61Rbx5yuno",
    authDomain: "geogam-1700b.firebaseapp.com",
    projectId: "geogam-1700b",
    storageBucket: "geogam-1700b.appspot.com",
    messagingSenderId: "1007484716725",
    appId: "1:1007484716725:web:4ba44e16a5ed76e59060fc",
    databaseURL: "https://geogam-1700b-default-rtdb.us-central1.firebasedatabase.app",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// --- EXPORTACIONES DE SERVICIOS DE FIREBASE ---
// Ahora exportamos correctamente cada servicio para que pueda ser importado
// en otros archivos.

// Exporta la instancia de Firestore Database (para perfiles, monedas, etc.)
export const db = getFirestore(app);

// Exporta la instancia de Firebase Authentication (para login, registro)
export const auth = getAuth(app);

// Exporta la instancia de Realtime Database (si todavía se usa en alguna parte)
export const database = getDatabase(app);
