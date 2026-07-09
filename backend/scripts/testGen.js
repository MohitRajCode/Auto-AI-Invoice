const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require("dotenv").config();

const logFile = 'test_output.txt';
// Clear previous log file
fs.writeFileSync(logFile, '');

function log(message) {
  fs.appendFileSync(logFile, message + '\n');
  console.log(message);
}

async function testModel(modelName) {
  log(`\nTesting ${modelName}...`);
  if (!process.env.GEMINI_API_KEY) {
    log("ERROR: GEMINI_API_KEY is not set in .env");
    return;
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: modelName });
  try {
    const prompt = `
          You are an expert data extraction assistant. Your task is to extract invoice details from natural language text and return them as a JSON object.
          
          The JSON object should match this structure:
          {
            "client": {
              "name": "string or empty",
              "email": "string or empty",
              "address": "string or empty",
              "phone": "string or empty"
            },
            "items": [
              {
                "description": "string",
                "qty": number,
                "unitPrice": number
              }
            ],
            "dueDate": "YYYY-MM-DD or empty",
            "currency": "INR or USD etc",
            "notes": "string or empty",
            "invoiceNumber": "string (extract or generate e.g. INV-001)"
          }
          
          Rules:
          1. If specific details are missing, leave them as empty strings or 0.
          2. If you infer a currency (e.g. $ -> USD, ₹ -> INR), use it. Default to INR if unclear.
          3. Return ONLY the JSON object. Do not include markdown formatting like \`\`\`json.
          4. Today's date is ${new Date().toISOString().slice(0, 10)}. Use this for relative date calculations.
          5. ALWAYS generate a unique 'invoiceNumber' if not found in text. Format: INV-XXXX.

          Input Text:
          Create an invoice for John Doe, 2 items of Web Design at $500 each.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    log(`SUCCESS: ${modelName}`);
    log("Raw Response: " + text);

    try {
      const data = JSON.parse(text);
      if (data.invoiceNumber) {
        log("VALIDATION SUCCESS: invoiceNumber found: " + data.invoiceNumber);
      } else {
        log("VALIDATION FAILED: invoiceNumber missing in JSON");
      }
    } catch (e) {
      log("VALIDATION FAILED: Could not parse JSON. " + e.message);
    }

  } catch (err) {
    log(`FAILED: ${modelName}`);
    log("Error details: " + err.message);
  }
}

async function run() {
  await testModel("gemini-flash-latest");
  await testModel("gemini-2.0-flash-lite-001");
  // await testModel("gemini-2.5-flash"); // Might be too new/unstable
}

run();
