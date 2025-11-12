import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../../config/firebase-config.js";
import { missions as allMissions } from "../../data/missions.js";

/**
 * Revisa y actualiza las misiones de un usuario basándose en los resultados de la última partida y sus estadísticas totales.
 * @param {string} userId El UID del usuario.
 * @param {object} gameResult Los resultados de la partida recién terminada.
 * @param {number} gameResult.correctAnswers El número de respuestas correctas en la partida.
 * @param {boolean} gameResult.isPerfectGame Si la partida fue perfecta (todas las respuestas correctas).
 */
export async function checkMissions(userId, gameResult = {}) {
    if (!userId) {
        console.error("checkMissions fue llamada sin un userId.");
        return;
    }

    try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            console.error(`Usuario con ID ${userId} no encontrado.`);
            return;
        }

        const userData = userDoc.data();
        const userStats = userData.estadisticas || {};
        const userMissions = userData.misiones || {};
        let totalReward = 0;
        const updates = {};

        // Incrementar estadísticas de partidas perfectas si aplica
        if (gameResult.isPerfectGame) {
            updates['estadisticas.partidasGanadasCorrectas'] = increment(1);
        }

        for (const mission of allMissions) {
            // Solo procesar misiones que el usuario tiene y no ha completado
            if (userMissions[mission.id] && !userMissions[mission.id].completada) {
                let isCompleted = false;

                switch (mission.condition.type) {
                    // --- Misiones basadas en la partida actual ---
                    case "correctAnswers":
                        if (gameResult.correctAnswers >= mission.condition.count) {
                            isCompleted = true;
                        }
                        break;

                    // --- Misiones basadas en estadísticas acumuladas ---
                    case "perfectGames":
                        // Usamos userStats.partidasGanadasCorrectas y le sumamos 1 si la partida actual fue perfecta
                        const currentPerfectGames = userStats.partidasGanadasCorrectas || 0;
                        const totalPerfectGames = currentPerfectGames + (gameResult.isPerfectGame ? 1 : 0);
                        if (totalPerfectGames >= mission.condition.count) {
                            isCompleted = true;
                        }
                        break;

                    case "gamesPlayed":
                        // Las partidas jugadas se incrementan en otro lado, aquí solo comparamos
                        if ((userStats.partidasJugadas || 0) + 1 >= mission.condition.count) {
                            isCompleted = true;
                        }
                        break;

                    // Otros tipos de misiones que dependen de stats acumuladas
                    // case "accuracy": ...
                    // case "timePlayed": ...
                }

                if (isCompleted) {
                    updates[`misiones.${mission.id}.completada`] = true;
                    totalReward += mission.reward.coins;
                }
            }
        }

        if (Object.keys(updates).length > 0) {
            updates['monedas'] = increment(totalReward);
            await updateDoc(userDocRef, updates);
        } else {
            console.log("No se completaron nuevas misiones en esta partida.");
        }

    } catch (error) {
        console.error("Error al verificar las misiones:", error);
    }
}
