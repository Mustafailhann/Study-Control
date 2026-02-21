import { adminAuth, adminDb } from "./_lib/firebaseAdmin.mjs";
import { callGemini } from "./_lib/gemini.mjs";

function json(statusCode, body) {
    return {
        statusCode,
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
    };
}

export const handler = async (event) => {
    try {
        if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

        // 1. Auth check
        const authHeader = event.headers.authorization || event.headers.Authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return json(401, { error: "Missing Authorization Bearer token" });

        const decoded = await adminAuth().verifyIdToken(token);
        const uid = decoded.uid;
        const db = adminDb();

        // 2. Parse request body
        const payload = JSON.parse(event.body || "{}");
        const { imageBase64, note = "" } = payload;

        if (!imageBase64) {
            return json(400, { error: "Missing imageBase64 data" });
        }

        // Prepare exactly base64 data (strip data:image/...;base64, prefix if exists)
        let b64Data = imageBase64;
        let mimeType = "image/jpeg"; // default

        if (b64Data.startsWith("data:")) {
            const parts = b64Data.split(",");
            if (parts.length === 2) {
                const header = parts[0];
                b64Data = parts[1];
                const match = header.match(/data:(.*?);/);
                if (match) {
                    mimeType = match[1];
                }
            }
        }

        // 3. System prompt
        const systemInstruction = `
Sen uzman, anlayışlı ve motive edici bir sınav koçu ve eğitmensin. 
Kullanıcı sana yapamadığı veya yanlış yaptığı bir test sorusunun fotoğrafını gönderiyor.
Görevlerin:
1. Soruyu (varsa metni, şekilleri, grafikleri ve şıkları) dikkatlice analiz et.
2. Öğrencinin soruyu tam olarak anlayabilmesi için adım adım, mantığını anlatarak detaylı bir çözüm yap.
3. Varsa kullanıcının eklediği nota ("Bu sorunun B şıkkı neden yanlış?" vb.) doğrudan ve net bir şekilde cevap ver.
4. Çıktıyı okunaklı bir Markdown formatında (başlıklar, listeler, kalın yazılar) ver.

Lütfen doğrudan çözümle başla, kendini tanıtmaya gerek yok.
`.trim();

        const userText = note.trim()
            ? `Kullanıcının bu soru hakkındaki notu/sorusu: "${note}"\n\nLütfen görseldeki soruyu çöz ve notuma cevap ver.`
            : `Lütfen görseldeki soruyu adım adım çöz.`;

        const messages = [
            {
                role: "user",
                content: [
                    { text: userText },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: b64Data
                        }
                    }
                ]
            }
        ];

        // 4. Call Gemini directly
        // Using gemini-2.5-flash as it natively supports multimodal vision inputs
        const { text } = await callGemini({
            model: "gemini-2.5-flash",
            system: systemInstruction,
            messages: messages,
        });

        return json(200, { ok: true, solution: text });
    } catch (e) {
        console.error("Solve question error:", e);
        return json(500, { error: e.message || "Server error" });
    }
};
