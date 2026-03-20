import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
    console.log("AI Suggestions: API route triggered");

    let city = "";
    let country = "";
    let interests: string[] = [];

    try {
        const body = await req.json().catch(() => ({}));
        city = body.city || "";
        country = body.country || "";
        interests = body.interests || [];

        if (!city || !country) {
            console.error("AI Suggestions Error: Missing city or country");
            return Response.json({ success: false, message: "Missing city or country", places: [] }, { status: 400 });
        }

        // Use 'gemini-flash-latest' - diagnostic tests confirm 1.5-flash returns 404 while this works
        const modelName = "gemini-flash-latest";
        console.log("Using Gemini model:", modelName);
        const model = genAI.getGenerativeModel({ model: modelName });

        const interestsText = interests.length > 0 ? ` that match these categories: ${interests.join(", ")}` : "";

        const prompt = `
            Suggest 8 to 10 popular tourist places in ${city}, ${country}${interestsText}.
            Return ONLY a valid JSON array of objects in this exact schema, with no markdown code blocks or extra text:
            [
              {
                "placeName": "Name of the place",
                "shortDescription": "1-2 sentence description",
                "category": "landmark, nature, food, culture, shopping, or adventure"
              }
            ]
            STRICT RULES:
            - Minimum 8 places, Maximum 10 places.
            - Valid JSON format only.
            - No markdown blocks like \`\`\`json.
            - If interests are provided, PRIORITIZE those categories.
        `;

        const result = await model.generateContent(prompt);
        
        // SAFE EXTRACTION as requested
        const candidate = result?.response?.candidates?.[0];
        const part = candidate?.content?.parts?.[0];
        const text = part?.text?.trim() || "";

        console.log("AI Suggestions: Raw response snippet:", text.substring(0, 100));

        // ✅ CLEAN RESPONSE: Remove markdown formatting
        const cleanText = text.replace(/```json|```/g, "").trim();

        let places: any[] = [];
        let isFallback = false;

        try {
            places = JSON.parse(cleanText);
            if (!Array.isArray(places)) throw new Error("Not an array");
        } catch (parseError) {
            console.error("AI Suggestions: JSON parse failed. Using fallback.");
            places = getFallbackPlaces(city);
            isFallback = true;
        }

        // FORCE MINIMUM COUNT: Pad with fallbacks if count < 6
        if (places.length < 6) {
            console.log(`AI Suggestions: Pading places (current: ${places.length}) to reach minimum.`);
            const fallbackList = getFallbackPlaces(city);
            for (const f of fallbackList) {
                if (places.length >= 8) break; // Aim for 8 total
                // Only add if not already in list
                if (!places.some(p => p.placeName.toLowerCase() === f.placeName.toLowerCase())) {
                    places.push(f);
                }
            }
            isFallback = true;
        }

        // Final trim to avoid overwhelming UI (max 10)
        const finalPlaces = places.slice(0, 10);

        return Response.json({ success: true, places: finalPlaces, isFallback });

    } catch (error: any) {
        console.error("AI Suggestions: Fatal ERROR:", error);
        
        // MANDATORY: Never return error to user - use fallback
        return Response.json({ 
            success: true, 
            places: getFallbackPlaces(city || "this city"),
            isFallback: true
        });
    }
}

// MANDATORY HARD FALLBACK SYSTEM
function getFallbackPlaces(city: string) {
    return [
        { "placeName": `${city} City Center`, "shortDescription": "Vibrant central area.", "category": "landmark" },
        { "placeName": `${city} Local Market`, "shortDescription": "Authentic local shopping.", "category": "shopping" },
        { "placeName": `${city} Central Park`, "shortDescription": "Relaxing green space.", "category": "nature" },
        { "placeName": `${city} Old Town`, "shortDescription": "Historical and cultural heart.", "category": "culture" },
        { "placeName": `${city} Food Street`, "shortDescription": "Best local street food.", "category": "food" },
        { "placeName": `${city} Museum`, "shortDescription": "Rich history and artifacts.", "category": "culture" },
        { "placeName": `${city} Mall`, "shortDescription": "Modern shopping destination.", "category": "shopping" },
        { "placeName": `${city} Lake`, "shortDescription": "Scenic waterfront views.", "category": "nature" }
    ];
}