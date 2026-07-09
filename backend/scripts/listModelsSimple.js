const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function list() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const key = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.models) {
            data.models.forEach(m => console.log(m.name.replace("models/", "")));
        } else {
            console.log("No models found or error", JSON.stringify(data));
        }
    } catch (e) { console.log(e.message); }
}
list();
