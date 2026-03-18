import { NextRequest, NextResponse } from 'next/server';

const FALLBACK_PLACES: Record<string, string[]> = {
    'london': ['Eiffel Tower', 'Louvre Museum', 'Arc de Triomphe', 'Notre-Dame Cathedral', 'Sacre-Coeur', 'Musee d\'Orsay', 'Jardin des Tuileries', 'Palais Garnier'],
    'paris': ['Eiffel Tower', 'Louvre Museum', 'Arc de Triomphe', 'Notre-Dame Cathedral', 'Sacre-Coeur', 'Musee d\'Orsay', 'Jardin des Tuileries', 'Palais Garnier'],
    'new york': ['Statue of Liberty', 'Central Park', 'Empire State Building', 'Metropolitan Museum of Art', 'Times Square', 'Brooklyn Bridge', 'High Line', 'Top of the Rock'],
};

async function callAIForPlaces(apiKey: string, locationStr: string): Promise<string[]> {
    try {
        const prompt = `Return only a JSON array of up to 12 popular tourist attractions in "${locationStr}". Include iconic landmarks, parks, museums, and hidden gems. Return ONLY JSON array of strings. Example: ["Eiffel Tower", "Louvre Museum"]`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a local tour guide assistant. Return ONLY JSON.' },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' }
            }),
        });

        const data = await response.json();
        if (!response.ok) return [];

        const text = data.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(text);
        
        // Handle common JSON wrappers
        const places = Array.isArray(parsed) ? parsed : (parsed.places || parsed.results || parsed.attractions || []);

        return Array.isArray(places) ? places.filter(p => typeof p === 'string').map(p => p.trim()).slice(0, 12) : [];
    } catch (err) {
        console.error('Call AI For Places Error:', err);
        return [];
    }
}

export async function POST(req: Request) {
    try {
        const { locationStr } = await req.json();

        if (!locationStr) {
            return NextResponse.json({ places: [] });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey) {
            const places = await callAIForPlaces(apiKey, locationStr);
            if (places && places.length > 0) {
                return NextResponse.json({ places });
            }
        }

        // Fallback for demo
        const cityKey = locationStr.split(',')[0].trim().toLowerCase();
        const fallback = FALLBACK_PLACES[cityKey] || FALLBACK_PLACES['london']; // ultimate fallback
        return NextResponse.json({ places: fallback });
    } catch (err) {
        console.error('Places API Root Error:', err);
        return NextResponse.json({ places: [] });
    }
}
