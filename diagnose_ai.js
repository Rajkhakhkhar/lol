const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Load env
dotenv.config({ path: path.join(__dirname, '.env.local') });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

async function testGemini() {
    console.log("Checking Gemini API Key:", apiKey ? "EXISTS (Length: " + apiKey.length + ")" : "MISSING");
    if (!apiKey) return;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        console.log("--- Sending test prompt to Gemini (gemini-flash-latest) ---");
        const result = await model.generateContent("List 3 landmarks in Mumbai in JSON format: [{\"name\":\"...\"}]");
        
        const candidate = result?.response?.candidates?.[0];
        if (!candidate) throw new Error("No candidates returned from AI response");
        const part = candidate?.content?.parts?.[0];
        const text = part?.text?.trim() || "EMPTY TEXT";
        
        console.log("AI RESPONSE:\n", text);
    } catch (error) {
        console.error("GEMINI ERROR FULL:", error);
    }
}

testGemini();
