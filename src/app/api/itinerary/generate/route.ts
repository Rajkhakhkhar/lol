import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/itinerary/generate
 *
 * Accepts: { city, country, days }
 * Returns a structured AI-generated itinerary with 3-4 places per day
 * and realistic visiting times.
 *
 * Response format:
 * {
 *   itinerary: [
 *     {
 *       day: 1,
 *       places: [
 *         { name: "Place Name", time: "09:00" },
 *         ...
 *       ]
 *     },
 *     ...
 *   ]
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const city = (body.city || '').trim();
        const country = (body.country || '').trim();
        const days = Math.min(Math.max(parseInt(body.days || '1', 10), 1), 14);

        if (!city) {
            return NextResponse.json({ itinerary: [] });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ itinerary: [] });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.7,
                maxOutputTokens: 4096,
            },
        });

        const locationStr = country ? `${city}, ${country}` : city;

        const prompt = `Create a travel itinerary for a visitor traveling to ${locationStr} for ${days} day${days > 1 ? 's' : ''}. Suggest 3-4 places to visit per day. Include famous landmarks, parks, museums, markets, and cultural attractions. Also suggest realistic visiting times for each place.

Return ONLY a JSON array where each element represents one day. Each day has a "day" number and a "places" array. Each place has a "name" (string) and a "time" (string in 24-hour HH:MM format).

Spread the places across morning, afternoon, and evening. Start mornings around 09:00 and space places 2-3 hours apart.

Example response format:
[
  {
    "day": 1,
    "places": [
      { "name": "Race Course Park", "time": "09:00" },
      { "name": "Watson Museum", "time": "11:30" },
      { "name": "Jubilee Garden", "time": "14:00" },
      { "name": "Aji Dam", "time": "16:30" }
    ]
  },
  {
    "day": 2,
    "places": [
      { "name": "Ishwariya Temple", "time": "09:00" },
      { "name": "Lakhota Lake", "time": "11:00" },
      { "name": "Baps Mandir", "time": "14:30" }
    ]
  }
]

Return ONLY the JSON array, no other text.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) {
            // Validate and normalize the response
            const itinerary = parsed.slice(0, days).map((dayData: { day?: number; places?: Array<{ name?: string; time?: string }> }, index: number) => {
                const places = Array.isArray(dayData.places)
                    ? dayData.places
                        .filter((p: { name?: string; time?: string }) => p && typeof p.name === 'string' && p.name.trim())
                        .map((p: { name?: string; time?: string }) => ({
                            name: p.name!.trim(),
                            time: typeof p.time === 'string' && /^\d{2}:\d{2}$/.test(p.time) ? p.time : '10:00',
                        }))
                        .slice(0, 5) // cap at 5 places per day
                    : [];

                return {
                    day: dayData.day || index + 1,
                    places,
                };
            });

            return NextResponse.json({ itinerary });
        }

        return NextResponse.json({ itinerary: [] });
    } catch {
        return NextResponse.json({ itinerary: [] });
    }
}
