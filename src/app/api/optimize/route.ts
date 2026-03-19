import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini SDK with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * AI Optimization Route
 * Receives a travel plan (TripFormData) and returns an optimized itinerary.
 * Uses "human-travel-agent" logic to check proximity, opening hours, and consistency.
 */
export async function POST(req: Request) {
  try {
    const { plan } = await req.json();

    if (!plan) {
      return Response.json({ error: "No plan provided" }, { status: 400 });
    }

    // System instruction for the "Human Travel Agent" AI
    const systemInstruction = `You are a world-class human travel agent and route optimizer. 
Your task is to review and optimize a draft travel itinerary.
- Minimize travel time between locations.
- Ensure logical grouping (e.g., group nearby attractions on the same day).
- Check typical opening hours and suggest logical sequences (e.g., café for breakfast, museum for morning).
- Handle multi-day logistics.
- Return ONLY valid JSON in the specific format:
{
  "days": [
    {
      "day": number,
      "activities": [
        { "time": "HH:MM AM/PM", "place": "Name of place", "note": "Reason for inclusion/change" }
      ]
    }
  ],
  "changes": ["String list explaining key optimizations"]
}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: { responseMimeType: "application/json" }
    });
    const userPrompt = `Optimize this travel plan: ${JSON.stringify(plan)}. 
    Ensure proximity and logical time-flow. 
    Use the provided JSON structure. 
    Notes: Follow these constraints: ${plan.constraints?.max_attractions_per_day || 5} attractions/day, ${plan.constraints?.daily_rest_hours || 2}h rest.`;

    const result = await model.generateContent(`${systemInstruction}\n\nUser Plan: ${userPrompt}`);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini Response:", text);

    try {
      const optimizedPlan = JSON.parse(text);
      return Response.json(optimizedPlan);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", text);
      return Response.json({ error: "AI returned invalid JSON" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Gemini Optimization API Error:", error);
    return Response.json({ error: error.message || "Something went wrong during optimization" }, { status: 500 });
  }
}