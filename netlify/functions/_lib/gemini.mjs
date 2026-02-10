const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function callGemini({ model, system, messages, responseMimeType }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY");

  const url = `${API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const body = {
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    contents: messages.map((m) => ({
      role: m.role, // "user" | "model"
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature: 0.4,
      responseMimeType,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Gemini API error");

  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";

  return { text, raw: data };
}
