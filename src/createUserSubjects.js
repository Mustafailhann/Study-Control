import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Kullanıcı tipine göre konuları oluşturur
 * @param {string} uid - Kullanıcı ID
 * @param {string} userType - "yks" veya "mufettislik"
 */
export async function createUserSubjects(uid, userType = "yks") {
  // Kullanıcı tipine göre hangi exam'i çekeceğimizi belirle
  const examType = userType === "mufettislik" ? "ziraat" : "yks";
  
  const q = query(
    collection(db, "subjects"),
    where("exam", "==", examType)
  );

  const snapshot = await getDocs(q);

  for (const subject of snapshot.docs) {
    const data = subject.data();

    const progress = {};
    data.topics.forEach(topic => {
      progress[topic] = false;
    });

    await setDoc(
      doc(db, "user_subjects", `${uid}_${subject.id}`),
      {
        uid,
        subjectId: subject.id,
        exam: data.exam,
        level: data.level,
        name: data.name,
        progress,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    );
  }
}
