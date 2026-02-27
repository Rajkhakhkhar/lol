import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// GET — return city suggestions as a plain array
export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get('q')?.trim();
    const country = req.nextUrl.searchParams.get('country')?.trim();

    if (!country || !query || query.length < 2) {
        return NextResponse.json([]);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json([]);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
                maxOutputTokens: 256,
            },
        });

        const prompt = `Return only a JSON array of real cities in ${country} that match: "${query}". No explanation. Only array. Max 8 results. Example: ["Delhi","Mumbai"]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        return NextResponse.json(
            Array.isArray(parsed) ? parsed.slice(0, 8) : []
        );
    } catch {
        return NextResponse.json([]);
    }
}

// POST — validate that a city belongs to a country
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { city, country } = body as { city?: string; country?: string };

        if (!city || !country) {
            return NextResponse.json({ valid: false });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // If no API key, skip validation (allow through)
            return NextResponse.json({ valid: true });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0,
                maxOutputTokens: 32,
            },
        });

        const prompt = `Is "${city}" a real city in "${country}"? Return only a JSON object: {"valid": true} or {"valid": false}. No explanation.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text) as { valid: boolean };

        return NextResponse.json({ valid: !!parsed.valid });
    } catch {
        // On error, allow through to not block the user
        return NextResponse.json({ valid: true });
    }
}
