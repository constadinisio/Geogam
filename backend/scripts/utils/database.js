import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// La configuración de Firebase, incluyendo la URL de la base de datos es correcta.
const firebaseConfig = {
  apiKey: "AIzaSyBlNPoDmKgQLo1o__FHoXURa61Rbx5yuno",
  authDomain: "geogam-1700b.firebaseapp.com",
  projectId: "geogam-1700b",
  storageBucket: "geogam-1700b.appspot.com",
  messagingSenderId: "1007484716725",
  appId: "1:1007484716725:web:4ba44e16a5ed76e59060fc",
  databaseURL:
    "https://geogam-1700b-default-rtdb.us-central1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Funciones para interactuar con la base de datos

async function getUserCoins(userId) {
  const snapshot = await get(ref(db, `users/${userId}/coins`));
  return snapshot.exists() ? snapshot.val() : 0;
}

async function updateUserCoins(userId, coins) {
  await set(ref(db, `users/${userId}/coins`), coins);
}

async function getUserItems(userId) {
  const snapshot = await get(ref(db, `users/${userId}/items`));
  return snapshot.exists() ? snapshot.val() : [];
}

async function addUserItem(userId, itemId) {
  const items = await getUserItems(userId);
  if (!items.includes(itemId)) {
    items.push(itemId);
    await set(ref(db, `users/${userId}/items`), items);
  }
}

export { db, getUserCoins, updateUserCoins, getUserItems, addUserItem };
