import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/places/autofill?city=...&country=...&days=...
 *
 * Returns exactly `days` popular tourist place names for the given city.
 * Used to auto-fill the Day Schedule boxes with AI-suggested places.
 */
export async function GET(req: NextRequest) {
    const city = req.nextUrl.searchParams.get('city')?.trim();
    const country = req.nextUrl.searchParams.get('country')?.trim();
    const daysParam = req.nextUrl.searchParams.get('days');
    const numDays = Math.min(Math.max(parseInt(daysParam || '3', 10), 1), 10);

    if (!city) {
        return NextResponse.json({ places: [] });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ places: [] });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3,
                maxOutputTokens: 512,
            },
        });

        const locationStr = country ? `${city}, ${country}` : city;
        const prompt = `Return a JSON array of exactly ${numDays} popular tourist places in ${locationStr}. Pick the most iconic and must-visit attractions. Return ONLY place names as a JSON array of strings, nothing else. Example: ["Place 1","Place 2","Place 3"]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) {
            // Ensure we return exactly the requested number
            const places = parsed.slice(0, numDays);
            return NextResponse.json({ places });
        }

        return NextResponse.json({ places: [] });
    } catch {
        return NextResponse.json({ places: [] });
    }
}
