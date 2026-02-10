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
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snap.empty) return json(200, { report: null });

    const doc = snap.docs[0];
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
