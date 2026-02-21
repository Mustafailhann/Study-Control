import { db } from "./firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

export const BADGES = {
    FIRST_STEP: { id: "first_step", icon: "🐣", name: "İlk Adım (Çırak)", desc: "500 XP'ye ulaştın." },
    TIME_BENDER: { id: "time_bender", icon: "⏱️", name: "Zaman Bükücü", desc: "10 Pomodoro tamamladın." },
    QUESTION_HUNTER: { id: "question_hunter", icon: "🔥", name: "Soru Avcısı", desc: "Tek oturuşta 100+ soru logladın." },
    IRON_WILL: { id: "iron_will", icon: "🛡️", name: "Demir İrade", desc: "3 gün üst üste Pomodoro yaptın." },
    MOCK_MASTER: { id: "mock_master", icon: "🎯", name: "Deneme Kurdu", desc: "5 Deneme sınavı kaydettin." }
};

export const calculateLevel = (xp) => {
    return Math.floor(Math.sqrt(xp / 10)) + 1;
};

// Next level requirement: (Level)^2 * 10
export const getNextLevelXp = (level) => {
    return Math.pow(level, 2) * 10;
};

/**
 * processGamification
 * Evaluates XP gains, counts stats, and awards badges.
 * @param {string} uid User ID
 * @param {number} xpToAdd Amount of XP to add
 * @param {object} actionData Details about the action { type: 'pomodoro' | 'question', count?: number }
 * @returns {object} { newXP, newLevel, newBadgesUnlocked }
 */
export const processGamification = async (uid, xpToAdd, actionData = {}) => {
    if (!uid) return null;

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    let stats = userData.gamificationStats || { pomodorosTotal: 0, lastPomodoroDate: null, pomodoroStreak: 0, mockExamsTotal: 0 };

    // 1. Add XP
    currentXP += xpToAdd;

    // 2. Update Stats
    const todayStr = new Date().toLocaleDateString("tr-TR");
    if (actionData.type === "pomodoro") {
        stats.pomodorosTotal += 1;

        // Streak logic
        if (stats.lastPomodoroDate !== todayStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toLocaleDateString("tr-TR");

            if (stats.lastPomodoroDate === yesterdayStr) {
                stats.pomodoroStreak += 1;
            } else {
                stats.pomodoroStreak = 1; // reset streak if gap or first time
            }
            stats.lastPomodoroDate = todayStr;
        }
    } else if (actionData.type === "mock_exam") {
        stats.mockExamsTotal = (stats.mockExamsTotal || 0) + 1;
    }

    // 3. Evaluate Badges
    let newBadgesUnlocked = [];
    const checkAndAward = (badgeKey) => {
        const badge = BADGES[badgeKey];
        if (!badges.includes(badge.id)) {
            badges.push(badge.id);
            newBadgesUnlocked.push(badge);
        }
    };

    if (currentXP >= 500) checkAndAward("FIRST_STEP");
    if (stats.pomodorosTotal >= 10) checkAndAward("TIME_BENDER");
    if (actionData.type === "question" && actionData.count >= 100) checkAndAward("QUESTION_HUNTER");
    if (stats.pomodoroStreak >= 3) checkAndAward("IRON_WILL");
    if (stats.mockExamsTotal >= 5) checkAndAward("MOCK_MASTER");

    // 4. Save to Firestore
    const updateData = {
        xp: currentXP,
        badges,
        gamificationStats: stats
    };

    if (snap.exists()) {
        await updateDoc(userRef, updateData);
    } else {
        await setDoc(userRef, updateData, { merge: true });
    }

    return {
        newXP: currentXP,
        newLevel: calculateLevel(currentXP),
        newBadgesUnlocked
    };
};
