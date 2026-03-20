import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const tripData = await req.json();

        if (!tripData) {
            return NextResponse.json({ success: false, error: 'Trip data is required' }, { status: 400 });
        }

        // --- AUTHENTICATION & MODEL SELECTION ---
        // Using GOOGLE_API_KEY as primary, fallback to GEMINI_API_KEY
        // To list all available models, you can use:
        // const models = await genAI.listModels();
        // console.log(models);
        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
        const modelName = "gemini-1.5-flash-latest"; // Optimized model for v1beta access

        // --- DEVELOPMENT / FALLBACK LOGIC ---
        if (!apiKey || apiKey.includes('your_')) {
            console.warn("[AI] Gemini API Key is missing. Returning fallback plan.");
            return NextResponse.json({
                success: true,
                isFallback: true,
                plan: {
                    title: `Your trip to ${tripData.country || 'the destination'}`,
                    itinerary: [
                        { day: 1, activity: "Arrive and explore the city center." },
                        { day: 2, activity: "Visit local museums and enjoy traditional dinner." },
                        { day: 3, activity: "Relax at a local park before departure." }
                    ],
                    tips: "Be sure to check local weather and try the street food!"
                }
            });
        }
        
        // --- LLM EXECUTION ---
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName }); // Ensure correct model choice

        const prompt = `
            Act as an expert travel planner. 
            Based on this trip data: ${JSON.stringify(tripData)}
            Generate a personalized travel plan in JSON format with:
            - title: A catchy title for the trip.
            - summary: A 2-sentence overview.
            - itinerary: An array of objects [{day: number, activity: string}].
            - tips: A few helpful travel tips.
            
            Return ONLY the raw JSON. No markdown code blocks (no \`\`\`json).
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean text - removing blocks just in case
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const plan = JSON.parse(cleanedText);

        return NextResponse.json({ success: true, plan });

    } catch (error: any) {
        console.error('Error generating AI travel plan:', error);
        
        // Detailed error for safe response
        let clientMessage = "AI service encountered an issue. Please try again.";
        if (error.message?.includes('Safety')) clientMessage = "Your trip preferences triggered a safety filter. Try modifying them.";
        if (error.message?.includes('API key')) clientMessage = "AI Authentication failed. Check Server config.";

        return NextResponse.json({ 
            success: false, 
            error: clientMessage,
            fallbackMessage: "Please check your connectivity or API limits."
        }, { status: 500 });
    }
}
