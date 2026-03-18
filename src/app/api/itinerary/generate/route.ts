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

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ itinerary: [] });
        }

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
  }
]`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a travel assistant. Return ONLY JSON.' },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' }
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('OpenAI Error:', data);
            return NextResponse.json({ itinerary: [] });
        }

        const text = data.choices?.[0]?.message?.content || '[]';
        const parsed = JSON.parse(text);
        
        // Handle if OpenAI returns { "itinerary": [...] } or just the array
        const finalArray = Array.isArray(parsed) ? parsed : (parsed.itinerary || parsed.days || []);

        if (Array.isArray(finalArray)) {
            // Validate and normalize the response
            const itinerary = finalArray.slice(0, days).map((dayData: { day?: number; places?: Array<{ name?: string; time?: string }> }, index: number) => {
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
