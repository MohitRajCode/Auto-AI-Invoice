const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require("dotenv").config();

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("ERROR: GEMINI_API_KEY is not set in .env");
        return;
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        let output = "";
        if (data.models) {
            output += "Available Models:\n";
            data.models.forEach(m => {
                output += `- ${m.name}\n`;
            });
        } else {
            output += "Failed to list models: " + JSON.stringify(data);
        }

        fs.writeFileSync('models_list.txt', output);
        console.log("Output written to models_list.txt");

    } catch (err) {
        console.error("Error listing models:", err.message);
    }
}

listModels();
