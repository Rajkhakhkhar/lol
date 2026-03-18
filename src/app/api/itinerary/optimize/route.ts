import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import type { TripFormData } from '@/types';

// Simple global cooldown for demo purposes
let lastCallTime = 0;

export async function POST(req: NextRequest) {
    try {
        const now = Date.now();
        if (now - lastCallTime < 10000) {
            return NextResponse.json({ 
                success: false, 
                error: "Too many requests. Please wait 10 seconds." 
            }, { status: 429 });
        }
        lastCallTime = now;

        console.log("API CALLED ONCE - /api/itinerary/optimize");

        const body = await req.json();
        const { formData } = body as { formData: TripFormData };

        if (!formData) {
            return NextResponse.json({ success: false, error: 'Missing form data' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'Gemini API key not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash-latest'
        });

        // Other config removed for brevity unless needed for JSON mode
        const modelWithJSON = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash-latest',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
            },
        });

        const { destination_city, destination_country, arrival_datetime, departure_datetime } = formData.travel_logistics;
        const tripDays = formData.day_plans.length;
        
        // Prepare Current Plan string
        const planStr = formData.day_plans.map(dp => {
            const places = dp.places.map(p => `${p.time} - ${p.name}`).join(', ');
            return `Day ${dp.dayNumber}: ${places || 'No activities planned yet'}`;
        }).join('\n');

        const prompt = `
User is planning a trip.

Details:
- Destination: ${destination_city}, ${destination_country}
- Trip Duration: ${tripDays} days
- Dates: ${arrival_datetime} to ${departure_datetime}

User's Current Plan:
${planStr}

Interests: ${formData.interests.interests.join(', ')}
Must-visit: ${formData.interests.must_visit_places.join(', ')}
Constraints: Max ${formData.constraints.max_attractions_per_day} attractions/day, ${formData.constraints.daily_rest_hours}h rest, Avoid Crowded: ${formData.constraints.avoid_crowded}.

Your task:
1. Analyze the plan.
2. Identify issues:
   - closed days (e.g., museum closed on Sunday)
   - bad timing
   - unrealistic grouping
3. Suggest better plan:
   - reorder places
   - move activities across days if needed
4. Assign realistic visiting times.
5. DO NOT remove places unless absolutely necessary.

Return ONLY a valid JSON object. Do not include any explanations, markdown code blocks, or preamble.
The JSON must follow this structure EXACTLY:
{
  "days": [
    {
      "day": number,
      "activities": [
        {
          "time": "HH:MM AM/PM",
          "place": "Place Name",
          "note": "Optional short suggestion"
        }
      ]
    }
  ],
  "changes": [
    "Short explanation of a change made"
  ]
}
`;

        const result = await modelWithJSON.generateContent(prompt);
        const text = result.response.text();
        
        // Extract JSON using regex logic for maximum robustness
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No valid JSON found in Gemini response:', text);
            return NextResponse.json({ success: false, error: 'No valid JSON found' }, { status: 500 });
        }

        try {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json({ success: true, data: parsed });
        } catch (parseError) {
            console.error('JSON parsing failed:', text);
            return NextResponse.json({ success: false, error: 'Invalid JSON format' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Gemini Optimization Error:', error);
        if (error.message?.includes("429")) {
            return NextResponse.json({
                success: false,
                error: "AI quota exceeded. Please wait 1 minute and try again."
            }, { status: 429 });
        }
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
