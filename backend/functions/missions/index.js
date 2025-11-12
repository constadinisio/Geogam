
import { db } from "../../config/firebase-config.js";
import { collection, getDocs, query, where, doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { missions } from "../../data/missions.js";

async function checkMissionProgress(userId) {
  const userStats = await getUserStats(userId);
  if (!userStats) return;

  const userMissions = await getUserMissions(userId);

  for (const mission of missions) {
    if (userMissions[mission.id]?.completed) {
      continue;
    }

    let missionCompleted = false;
    switch (mission.condition.type) {
      case "perfectGames":
        if (userStats.perfectGames >= mission.condition.count) {
          missionCompleted = true;
        }
        break;
      case "accuracy":
        if (userStats.totalAccuracy >= mission.condition.percentage) {
          missionCompleted = true;
        }
        break;
      case "gamesPlayed":
        if (userStats.gamesPlayed >= mission.condition.count) {
          missionCompleted = true;
        }
        break;
      case "timePlayed":
        if (userStats.timePlayed >= mission.condition.minutes) {
          missionCompleted = true;
        }
        break;
    }

    if (missionCompleted) {
      await updateUserMissionProgress(userId, mission.id);
    }
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

async function updateUserMissionProgress(userId, missionId) {
  const missionDocRef = doc(db, "users", userId, "missions", missionId);
  await setDoc(missionDocRef, { completed: true }, { merge: true });
}

export { checkMissionProgress };
