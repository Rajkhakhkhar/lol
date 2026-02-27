import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
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

        const prompt = `Return only a JSON array of country names that start with or closely match: "${query}". No explanation. Only array. Max 8 results. Example: ["India","Indonesia"]`;

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
