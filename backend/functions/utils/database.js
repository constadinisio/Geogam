
// Importa los servicios de Firestore (doc, getDoc, etc.)
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// Importa la instancia CORRECTA y ya inicializada de la base de datos desde el archivo de configuración central.
import { db } from "../../config/firebase-config.js";

// --- Funciones para interactuar con Firestore ---
// Todas estas funciones ahora usarán la instancia 'db' importada, que es válida.

async function getUserCoins(userId) {
  if (!userId) throw new Error("User ID es inválido en getUserCoins");
  const docRef = doc(db, `users/${userId}`);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() && docSnap.data().monedas ? docSnap.data().monedas : 0;
}

async function updateUserCoins(userId, coins) {
  if (!userId) throw new Error("User ID es inválido en updateUserCoins");
  const docRef = doc(db, `users/${userId}`);
  await setDoc(docRef, { monedas: coins }, { merge: true });
}

async function getUserItems(userId) {
  if (!userId) throw new Error("User ID es inválido en getUserItems");
  const docRef = doc(db, `users/${userId}`);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() && docSnap.data().items ? docSnap.data().items : [];
}

async function addUserItem(userId, itemId) {
  if (!userId) throw new Error("User ID es inválido en addUserItem");
  const docRef = doc(db, `users/${userId}`);
  await updateDoc(docRef, {
    items: arrayUnion(itemId)
  });
}

async function getUserFrame(userId) {
  if (!userId) throw new Error("User ID es inválido en getUserFrame");
  const docRef = doc(db, `users/${userId}`);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() && docSnap.data().equippedFrame 
         ? docSnap.data().equippedFrame 
         : '/public/images/marco1.webp';
}

async function updateUserFrame(userId, frameUrl) {
  if (!userId) throw new Error("User ID es inválido en updateUserFrame");
  const docRef = doc(db, `users/${userId}`);
  await setDoc(docRef, { equippedFrame: frameUrl }, { merge: true });
}

// Exportamos la instancia de la base de datos (aunque no se use fuera) y todas las funciones.
export { db, getUserCoins, updateUserCoins, getUserItems, addUserItem, getUserFrame, updateUserFrame };
