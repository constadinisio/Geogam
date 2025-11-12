
import { db } from "../../config/firebase-config.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { missions as allMissions } from "../../data/missions.js";
import { auth } from "../../config/firebase-config.js";

document.addEventListener("DOMContentLoaded", async () => {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            await loadMissions(user.uid);
        } else {
            console.log("No user is signed in.");
            window.location.href = '/public/login.html';
        }
    });
});

async function loadMissions(userId) {
    const missionsListContainer = document.getElementById("misiones-lista");
    const userStats = await getUserStats(userId);
    const userMissions = await getUserMissions(userId);

    const missionsByCat = allMissions.reduce((acc, mission) => {
        const category = mission.category === 'General' ? 'Offline' : 'Online';
        acc[category] = acc[category] || [];
        acc[category].push(mission);
        return acc;
    }, {});

    missionsListContainer.innerHTML = '';

    for (const category in missionsByCat) {
        const categoryTitle = document.createElement("div");
        categoryTitle.classList.add('mision-category');
        categoryTitle.textContent = category;
        missionsListContainer.appendChild(categoryTitle);

        for (const mission of missionsByCat[category]) {
            const missionElement = document.createElement("div");
            missionElement.classList.add("mision-item");

            const progress = getMissionProgress(mission, userStats);
            const isCompleted = userMissions[mission.id]?.completed || false;

            missionElement.innerHTML = `
                <div class="mision-texto">
                    <p>${mission.description}</p>
                </div>
                <div class="mision-recompensa">
                    <img src="/public/images/moneda.webp" alt="Moneda" class="moneda-icon">
                    <span>${mission.reward.coins}</span>
                </div>
                <div class="mision-progreso-barra">
                    <div class="progreso" style="width: ${isCompleted ? 100 : (progress.current / progress.total) * 100}%;"></div>
                </div>
                ${isCompleted ? '<div class="mision-completa">&#10004;</div>' : ''}
            `;
            missionsListContainer.appendChild(missionElement);
        }
    }
}

function getMissionProgress(mission, userStats) {
    if (!userStats) return { current: 0, total: mission.condition.count || mission.condition.percentage || mission.condition.minutes };

    switch (mission.condition.type) {
        case "gamesPlayed":
            return { current: userStats.gamesPlayed || 0, total: mission.condition.count };
        case "perfectGames":
            return { current: userStats.perfectGames || 0, total: mission.condition.count };
        case "accuracy":
            return { current: userStats.totalAccuracy || 0, total: mission.condition.percentage };
        case "timePlayed":
            return { current: Math.floor((userStats.timePlayed || 0)), total: mission.condition.minutes };
        default:
            return { current: 0, total: mission.condition.count || mission.condition.percentage || mission.condition.minutes };
    }
}

async function getUserStats(userId) {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data().stats : null;
}

async function getUserMissions(userId) {
    const missionsCollectionRef = collection(db, "users", userId, "missions");
    const missionsSnapshot = await getDocs(missionsCollectionRef);
    const userMissions = {};
    missionsSnapshot.forEach(doc => {
        userMissions[doc.id] = doc.data();
    });
    return userMissions;
}
