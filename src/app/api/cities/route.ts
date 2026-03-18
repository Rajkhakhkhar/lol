import { NextRequest, NextResponse } from 'next/server';

// GET — return city suggestions as a plain array
export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get('q')?.trim();
    // The original code had a 'country' parameter, but the new code removes it from the searchParams.
    // Keeping the original 'country' parameter for consistency with the prompt's implied removal,
    // but the new prompt for OpenAI doesn't use it.
    // const country = req.nextUrl.searchParams.get('country')?.trim();

    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return NextResponse.json([]);

        // The prompt is adjusted to not include the country, as per the provided change.
        const prompt = `Return only a JSON array of cities matching "${query}". No explanation. Return ONLY JSON array of strings. Example: ["London, UK", "Los Angeles, USA"]`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a city database assistant. Return ONLY JSON.' },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' }
            }),
        });

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(text);
        // OpenAI might return an object like { "cities": [...] } or { "results": [...] }
        // or directly an array if the system prompt is very strict.
        const cities = Array.isArray(parsed) ? parsed : (parsed.cities || parsed.results || []);

        return NextResponse.json(Array.isArray(cities) ? cities.slice(0, 8) : []);
    } catch {
        return NextResponse.json([]);
    }
}

// POST — validate that a city belongs to a country
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { city, country } = body as { city?: string; country?: string };
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey || !city || !country) {
            // If no API key, or missing city/country, skip validation (allow through)
            return NextResponse.json({ valid: true });
        }

        const prompt = `Is the city "${city}" in the country "${country}"? Return ONLY a JSON object: { "valid": boolean }.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a geo-validator. Return ONLY JSON.' },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' }
            }),
        });

        const data = await response.json();
        // Default to '{"valid":true}' on error or unexpected response to allow through
        const text = data.choices?.[0]?.message?.content || '{"valid":true}';
        const parsed = JSON.parse(text);
        
        // Use nullish coalescing to default to true if parsed.valid is undefined or null
        return NextResponse.json({ valid: parsed.valid ?? true });
    } catch {
        // On error, allow through to not block the user
        return NextResponse.json({ valid: true });
    }
}
