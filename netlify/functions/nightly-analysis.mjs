import { adminDb } from "./_lib/firebaseAdmin.mjs";
import { callGemini } from "./_lib/gemini.mjs";

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  };
}

// 23:40 Türkiye saati (UTC+3) = 20:40 UTC
export const config = { schedule: "40 20 * * *" };

function trDateKey() {
  const trNow = new Date(Date.now() + 3 * 60 * 60 * 1000);
  return trNow.toISOString().slice(0, 10);
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

async function buildUserSummaryForReport({ db, userType }) {
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
        completed: details.completed || false,
        shouldStudy: details.shouldStudy || false,
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

  // zayıf konular: en az 20 deneme ve accuracy düşük olanlar
  const weakTopics = perTopic
    .filter((t) => (t.correct + t.wrong) >= 20 && t.accuracy !== null)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 8);

  // güçlü konular: en az 20 deneme ve accuracy yüksek olanlar
  const strongTopics = perTopic
    .filter((t) => (t.correct + t.wrong) >= 20 && t.accuracy !== null)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5);

  // çalışılmamış/az çalışılmış konular
  const unstudiedTopics = perTopic
    .filter((t) => t.solved < 10)
    .slice(0, 10);

  const progressPercent =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return {
    examType,
    progress: { totalTopics, completedTopics, progressPercent },
    today,
    last7,
    last30,
    weakTopics,
    strongTopics,
    unstudiedTopics,
    recentActivities: allLogs.slice(0, 15),
  };
}

export const handler = async (event) => {
  try {
    const db = adminDb();
    const usersSnap = await db.collection("users").get();

    const dateKey = trDateKey();
    const results = [];

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const user = userDoc.data();
      const userType = user?.userType || "yks";
      const username = user?.username || "Kullanıcı";

      const summary = await buildUserSummaryForReport({ db, userType });

      const system = `
Sen bir sınav koçusun. Dil: Türkçe.
Bugünün tarihinde (${dateKey}) kullanıcının ${userType === "mufettislik" ? "Müfettişlik" : "YKS"} sınavı çalışmalarını analiz ediyorsun.
Çıktı MUTLAKA JSON formatında olmalı.
Kural: Veride olmayan şeyi uydurma. Eksik veri varsa "questions" alanında sor.
Kural: Öneriler ölçülebilir olsun (hedef soru sayısı, hangi konular, kaç gün).
Kural: Her önerinin yanında kısa gerekçe olsun.
Kural: Samimi, destekleyici ve motive edici bir dil kullan.
`.trim();

      const userPrompt = `
Kullanıcı: ${username}
Tarih: ${dateKey}

<KULLANICI_OZETI_JSON>
${JSON.stringify(summary, null, 2)}
</KULLANICI_OZETI_JSON>

Lütfen bu JSON şemasına göre günlük analiz raporu oluştur:
{
  "headline": "string - Günün özet başlığı (motivasyonel)",
  "todaySummary": "string - Bugünün çalışma özeti",
  "insights": [
    {
      "title": "string - İçgörü başlığı",
      "detail": "string - Detaylı açıklama",
      "metric": "string - Hangi metrikten çıkarıldı"
    }
  ],
  "tomorrowPlan": [
    {
      "task": "string - Yarın yapılacak iş",
      "why": "string - Neden bu iş",
      "target": "string - Hedef (örn: 50 soru, 2 saat)"
    }
  ],
  "next7Days": {
    "focus": "string - Haftanın odak noktası",
    "dailyTargets": [
      {
        "day": "string - Gün (örn: Salı)",
        "subjects": ["string - Dersler"],
        "target": "string - Günlük hedef"
      }
    ]
  },
  "weakAreas": [
    {
      "subject": "string - Ders",
      "topic": "string - Konu",
      "reason": "string - Neden zayıf",
      "action": "string - Ne yapmalı"
    }
  ],
  "motivation": "string - Motivasyon mesajı",
  "questions": ["string - Kullanıcıya sorulacak sorular (varsa)"],
  "confidence": {
    "level": "low" | "medium" | "high",
    "notes": "string - Güven seviyesi hakkında notlar"
  }
}
`.trim();

      const { text } = await callGemini({
        model: "gemini-2.5-flash",
        system,
        messages: [{ role: "user", content: userPrompt }],
        responseMimeType: "application/json",
      });

      let report;
      try {
        report = JSON.parse(text);
      } catch (parseError) {
        report = { parseError: true, raw: text, error: parseError.message };
      }

      await db.collection("ai_reports").add({
        uid,
        username,
        userType,
        dateKey,
        createdAt: new Date(),
        model: "gemini-2.5-flash",
        summary,
        report,
      });

      results.push({ uid, username, ok: true });
    }

    return json(200, { ok: true, dateKey, analyzed: results.length, results });
  } catch (e) {
    console.error("Nightly analysis error:", e);
    return json(500, { error: e.message || "Server error" });
  }
};
