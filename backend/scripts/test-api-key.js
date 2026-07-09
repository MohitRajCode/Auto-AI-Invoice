import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

const invoiceTemplate = {
  invoiceNumber: `INV-1234`,
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  fromBusinessName: "",
  fromEmail: "",
  fromAddress: "",
  fromPhone: "",
  client: { name: "", email: "", address: "", phone: "" },
  items: [{ id: "1", description: "", qty: 1, unitPrice: 0 }],
  taxPercent: 18,
  notes: ""
};

const promptText = "Mohit bought an apple with only each apple cost 1 rs";

const fullPrompt = `
You are an invoice generation assistant.

Task:
  - Analyze the user's input text and produce a valid JSON object only (no explanatory text).
  - The JSON MUST match the schema below (include all fields even if empty).
  - Ensure all dates are ISO 'YYYY-MM-DD' strings and numeric fields are numbers.

Schema:
${JSON.stringify(invoiceTemplate, null, 2)}

User input:
${promptText}

Output: valid JSON only (no surrounding code fences, no commentary).
`;

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });
    console.log("Raw Response:\n", response.text);
    const text = response.text.trim();
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    const jsonText = text.slice(firstBrace, lastBrace + 1);
    const data = JSON.parse(jsonText);
    console.log("Parsed JSON:\n", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
