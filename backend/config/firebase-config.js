// Es la configuración para que firebase se conecte con la base de datos.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// La configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBlNPoDmKgQLo1o__FHoXURa61Rbx5yuno",
  authDomain: "geogam-1700b.firebaseapp.com",
  projectId: "geogam-1700b",
  storageBucket: "geogam-1700b.appspot.com",
  messagingSenderId: "1007484716725",
  appId: "1:1007484716725:web:4ba44e16a5ed76e59060fc",
  databaseURL: "https://geogam-1700b-default-rtdb.us-central1.firebasedatabase.app",
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Obtener acceso a los diferentes servicios de Firebase
const auth = getAuth(app);
const database = getDatabase(app); // Para Realtime Database (la que ya usas)
const db = getFirestore(app);       // Para Cloud Firestore (la que usaremos para el juego)

// Exportar los servicios para que puedan ser usados en otros archivos
export { auth, database, db };
