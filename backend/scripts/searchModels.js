const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function search() {
    try {
        const key = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes("flash")) {
                    console.log(m.name.replace("models/", ""));
                }
            });
        }
    } catch (e) { console.log(e.message); }
}
search();
