import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// La configuración de Firebase, incluyendo la URL de la base de datos es correcta.
const firebaseConfig = {
  apiKey: "AIzaSyBlNPoDmKgQLo1o__FHoXURa61Rbx5yuno",
  authDomain: "geogam-1700b.firebaseapp.com",
  projectId: "geogam-1700b",
  storageBucket: "geogam-1700b.appspot.com",
  messagingSenderId: "1007484716725",
  appId: "1:1007484716725:web:4ba44e16a5ed76e59060fc",
  // ¡URL CORREGIDA! Apuntando a la región us-central1
  databaseURL: "https://geogam-1700b-default-rtdb.us-central1.firebasedatabase.app",
};

// 1. Inicializa la aplicación de Firebase. Esto crea una instancia "default".
initializeApp(firebaseConfig);

// 2. Llama a getAuth() y getDatabase() sin argumentos.
// Estas funciones encontrarán automáticamente la instancia "default" que acabamos de crear.
const auth = getAuth();
const database = getDatabase();

// 3. Exporta solo las instancias de servicio que necesitamos.
export { auth, database };
