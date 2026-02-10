import { adminAuth, adminDb } from "./_lib/firebaseAdmin.mjs";
import { callGemini } from "./_lib/gemini.mjs";

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  };
}

function pickLast(arr, n) {
  return Array.isArray(arr) ? arr.slice(Math.max(0, arr.length - n)) : [];
}

function toDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function buildStatsFromLogs(logs, startDate) {
  const filtered = logs.filter((l) => {
    const d = toDate(l.date);
    return d && d >= startDate;
  });

  const totals = filtered.reduce(
    (acc, l) => {
      acc.solved += Number(l.solved || 0);
      acc.correct += Number(l.correct || 0);
      acc.wrong += Number(l.wrong || 0);
      acc.sessions += 1;
      return acc;
    },
    { solved: 0, correct: 0, wrong: 0, sessions: 0 }
  );

  const denom = totals.correct + totals.wrong;
  const accuracy = denom > 0 ? Math.round((totals.correct / denom) * 100) : null;

  return { ...totals, accuracy };
}

async function buildUserSummary({ db, userType }) {
  const examType = userType === "mufettislik" ? "ziraat" : "yks";

  const subjectsSnap = await db
    .collection("subjects")
    .where("exam", "==", examType)
    .get();

  let totalTopics = 0;
  let completedTopics = 0;

  const allLogs = [];
  const perTopic = [];

  subjectsSnap.forEach((doc) => {
    const data = doc.data();
    const topics = Array.isArray(data.topics) ? data.topics : [];
    const topicDetails = data.topicDetails || {};

    totalTopics += topics.length;

    topics.forEach((topicName, i) => {
      const details = topicDetails[i] || {};
      if (details.completed) completedTopics++;

      const logs = Array.isArray(details.logs) ? details.logs : [];
      let topicSolved = 0;
      let topicCorrect = 0;
      let topicWrong = 0;

      logs.forEach((l) => {
        const entry = {
          date: l.date,
          solved: Number(l.solved || 0),
          correct: Number(l.correct || 0),
          wrong: Number(l.wrong || 0),
          book: l.book || "",
          subjectName: data.name,
          topicName,
        };
        allLogs.push(entry);
        topicSolved += entry.solved;
        topicCorrect += entry.correct;
        topicWrong += entry.wrong;
      });

      const denom = topicCorrect + topicWrong;
      const accuracy = denom > 0 ? Math.round((topicCorrect / denom) * 100) : null;

      perTopic.push({
        subjectName: data.name,
        topicName,
        solved: topicSolved,
        correct: topicCorrect,
        wrong: topicWrong,
        accuracy,
      });
    });
  });

  allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last7Start = new Date(todayStart);
  last7Start.setDate(last7Start.getDate() - 7);
  const last30Start = new Date(todayStart);
  last30Start.setDate(last30Start.getDate() - 30);

  const today = buildStatsFromLogs(allLogs, todayStart);
  const last7 = buildStatsFromLogs(allLogs, last7Start);
  const last30 = buildStatsFromLogs(allLogs, last30Start);

  // zayıf konu: en az 20 deneme ve accuracy düşük olanlar
  const weakTopics = perTopic
    .filter((t) => (t.correct + t.wrong) >= 20 && t.accuracy !== null)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 8);

  const progressPercent =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return {
    examType,
    progress: { totalTopics, completedTopics, progressPercent },
    today,
    last7,
    last30,
    weakTopics,
    recentActivities: allLogs.slice(0, 12),
  };
}

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

    const authHeader = event.headers.authorization || event.headers.Authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return json(401, { error: "Missing Authorization Bearer token" });

    const decoded = await adminAuth().verifyIdToken(token);
    const db = adminDb();

    const userSnap = await db.collection("users").doc(decoded.uid).get();
    const userData = userSnap.exists ? userSnap.data() : null;
    const userType = userData?.userType || "yks";
    const username = userData?.username || "Kullanıcı";

    const payload = JSON.parse(event.body || "{}");
    const message = String(payload.message || "").trim();
    if (!message) return json(400, { error: "Missing message" });

    const history = pickLast(payload.history, 12).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      content: String(m.content || ""),
    }));

    const summary = await buildUserSummary({ db, userType });

    const system = `
Sen bir sınav koçusun. Dil: Türkçe.
Kullanıcı ${userType === "mufettislik" ? "Müfettişlik" : "YKS"} sınavına hazırlanıyor.
Kural: Veride olmayan şeyleri kesin gibi söyleme. Eksik veri varsa soru sor.
Kural: Önerileri mümkünse sayıya bağla (hedef soru, tekrar, konu önceliği).
Kural: Yanlış yönlendirmemek için her öneriye kısa gerekçe ekle.
Kural: Samimi ve destekleyici bir dil kullan, kullanıcının adı ${username}.
`.trim();

    const userContent =
      `${message}\n\n<KULLANICI_OZETI_JSON>\n` + JSON.stringify(summary) + '\n</KULLANICI_OZETI_JSON>';

    const { text } = await callGemini({
      model: "gemini-2.5-flash",
      system,
      messages: [...history, { role: "user", content: userContent }],
    });

    return json(200, { reply: text });
  } catch (e) {
    console.error("AI Chat error:", e);
    return json(500, { error: e.message || "Server error" });
  }
};
