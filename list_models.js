const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, '.env.local') });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

async function listModels() {
    console.log("Using API Key:", apiKey ? "FOUND" : "MISSING");
    if (!apiKey) return;
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // In @google/generative-ai, listModels is usually on the genAI instance or requires a direct fetch.
        // But we can just use the HTTP endpoint directly via node-fetch or native fetch.
        
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        
        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods.join(',')})`));
        } else {
            console.log("FAIL TO LIST MODELS:", data);
        }
    } catch (e) {
        console.error("SDK ERROR:", e.message);
    }
}

listModels();
