import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const city = req.nextUrl.searchParams.get('city')?.trim();
    const country = req.nextUrl.searchParams.get('country')?.trim();

    if (!city) {
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
                temperature: 0.3,
                maxOutputTokens: 512,
            },
        });

        const locationStr = country ? `${city}, ${country}` : city;
        const prompt = `Return a JSON array of 8-12 popular tourist places/attractions in ${locationStr}. Include famous landmarks, parks, temples, museums, markets, and popular spots. Only return the JSON array of place name strings, nothing else. Example: ["Place 1","Place 2"]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        return NextResponse.json(
            Array.isArray(parsed) ? parsed.slice(0, 12) : []
        );
    } catch {
        return NextResponse.json([]);
    }
}
