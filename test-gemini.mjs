import fs from 'fs';
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const key = process.env.VITE_GEMINI_API_KEY;
const url = `${API_BASE}/models/gemini-1.5-flash:generateContent?key=${key}`;

const body = {
  contents: [{
    role: "user",
    parts: [
      { text: "What is this?" },
      {
        inline_data: {
          mime_type: "image/png",
          data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        }
      }
    ]
  }]
};

const res = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

console.log(await res.json());
