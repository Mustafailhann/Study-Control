import { adminAuth, adminDb } from "./_lib/firebaseAdmin.mjs";

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return json(401, { error: "Missing Authorization Bearer token" });

    const decoded = await adminAuth().verifyIdToken(token);
    const db = adminDb();

    const snap = await db
      .collection("ai_reports")
      .where("uid", "==", decoded.uid)
      .get();

    if (snap.empty) return json(200, { report: null });

    // Bellekte sırala (composite index olmamasını telafi etmek için)
    const docs = snap.docs.map(d => ({ doc: d, data: d.data() }));
    docs.sort((a, b) => {
      const tA = a.data.createdAt?.toDate?.()?.getTime() || Date.parse(a.data.createdAt) || 0;
      const tB = b.data.createdAt?.toDate?.()?.getTime() || Date.parse(b.data.createdAt) || 0;
      return tB - tA;
    });

    const doc = docs[0].doc;
    const data = doc.data();

    // Firestore Timestamp'ı JSON-friendly formata çevir
    const report = {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
    };

    return json(200, { report });
  } catch (e) {
    console.error("Get latest report error:", e);
    return json(500, { error: e.message || "Server error" });
  }
};
