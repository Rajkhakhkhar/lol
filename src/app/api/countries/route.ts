import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json([]);
        }

        const prompt = `Return only a JSON array of country names that start with or closely match: "${query}". No explanation. Only array. Max 8 results. Example: ["India","Indonesia"]`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a geo-data assistant. Return ONLY a JSON array.' },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' }
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('OpenAI Error:', data);
            return NextResponse.json([]);
        }

        const text = data.choices?.[0]?.message?.content || '{}';
        const parsedData = JSON.parse(text);
        const countries = Array.isArray(parsedData) ? parsedData : (parsedData.countries || parsedData.results || []);

        return NextResponse.json(
            Array.isArray(countries) ? countries.slice(0, 8) : []
        );
    } catch {
        return NextResponse.json([]);
    }
}
