import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const key = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    data.models.map(m => console.log(m.name));
}
run();
