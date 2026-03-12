import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Fallback popular places for common cities (used when Gemini API is unavailable)
const FALLBACK_PLACES: Record<string, string[]> = {
    'london': ['Big Ben', 'Tower of London', 'Buckingham Palace', 'British Museum', 'London Eye', 'Hyde Park', 'Westminster Abbey', 'Tower Bridge'],
    'paris': ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Champs-Élysées', 'Sacré-Cœur', 'Arc de Triomphe', 'Musée d\'Orsay', 'Palace of Versailles'],
    'new york': ['Statue of Liberty', 'Central Park', 'Times Square', 'Empire State Building', 'Brooklyn Bridge', 'Metropolitan Museum of Art', 'Broadway', 'One World Observatory'],
    'tokyo': ['Senso-ji Temple', 'Shibuya Crossing', 'Meiji Shrine', 'Tokyo Skytree', 'Tsukiji Outer Market', 'Shinjuku Gyoen', 'Akihabara', 'Imperial Palace'],
    'dubai': ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Dubai Marina', 'Gold Souk', 'Dubai Frame', 'Jumeirah Mosque', 'Global Village'],
    'rome': ['Colosseum', 'Vatican Museums', 'Trevi Fountain', 'Pantheon', 'Roman Forum', 'Spanish Steps', 'St. Peter\'s Basilica', 'Piazza Navona'],
    'mumbai': ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Chhatrapati Shivaji Terminus', 'Haji Ali Dargah', 'Juhu Beach', 'Siddhivinayak Temple', 'Colaba Causeway'],
    'delhi': ['Red Fort', 'Qutub Minar', 'India Gate', 'Humayun\'s Tomb', 'Lotus Temple', 'Akshardham Temple', 'Chandni Chowk', 'Jama Masjid'],
    'manchester': ['Manchester Museum', 'Science and Industry Museum', 'Heaton Park', 'Manchester Cathedral', 'Castlefield Urban Heritage Park', 'Etihad Stadium', 'John Rylands Library', 'Northern Quarter'],
    'barcelona': ['Sagrada Familia', 'Park Güell', 'La Rambla', 'Casa Batlló', 'Gothic Quarter', 'Camp Nou', 'Casa Milà', 'Barceloneta Beach'],
    'istanbul': ['Hagia Sophia', 'Blue Mosque', 'Topkapi Palace', 'Grand Bazaar', 'Basilica Cistern', 'Galata Tower', 'Spice Bazaar', 'Bosphorus Cruise'],
    'singapore': ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa Island', 'Merlion Park', 'Chinatown', 'Orchard Road', 'Singapore Zoo', 'Clarke Quay'],
    'bangkok': ['Grand Palace', 'Wat Pho', 'Wat Arun', 'Chatuchak Weekend Market', 'Khao San Road', 'Jim Thompson House', 'Lumphini Park', 'Chinatown'],
    'sydney': ['Sydney Opera House', 'Harbour Bridge', 'Bondi Beach', 'Darling Harbour', 'Royal Botanic Garden', 'Taronga Zoo', 'The Rocks', 'Manly Beach'],
    'cairo': ['Pyramids of Giza', 'Egyptian Museum', 'Khan El Khalili', 'Al-Azhar Mosque', 'Citadel of Saladin', 'Nile River Cruise', 'Coptic Cairo', 'Cairo Tower'],
    'rajkot': ['Race Course Park', 'Watson Museum', 'Jubilee Garden', 'Ishwariya Temple', 'Aji Dam', 'Rotary Dolls Museum', 'Kaba Gandhi No Delo', 'Pradhyuman Park'],
    'ahmedabad': ['Sabarmati Ashram', 'Adalaj Stepwell', 'Kankaria Lake', 'Sidi Saiyyed Mosque', 'Akshardham Temple', 'Law Garden', 'Hutheesing Jain Temple', 'Science City'],
    'jaipur': ['Amer Fort', 'Hawa Mahal', 'City Palace', 'Jantar Mantar', 'Nahargarh Fort', 'Jal Mahal', 'Albert Hall Museum', 'Birla Mandir'],
};

function getFallbackPlaces(city: string): string[] | null {
    const normalized = city.toLowerCase().trim();
    return FALLBACK_PLACES[normalized] || null;
}

// Models to try in order — using a fallback chain avoids quota exhaustion on any single model
const GEMINI_MODELS = [
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
];

async function callGeminiForPlaces(apiKey: string, locationStr: string, modelName: string): Promise<string[]> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
            maxOutputTokens: 1024,
        },
    });

    const prompt = `List 8 popular tourist places to visit in ${locationStr}. Include famous landmarks, parks, museums, markets, and cultural attractions.

Return ONLY a JSON array of place name strings. No objects, no explanations.

Example response:
["Manchester Museum","Science and Industry Museum","Heaton Park","Manchester Cathedral","Castlefield Urban Heritage Park","Etihad Stadium","John Rylands Library","Northern Quarter"]`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // Strip markdown code fences if Gemini wraps the response
    const cleanedText = rawText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim();

    const parsed = JSON.parse(cleanedText);

    // Handle both raw array and { places: [...] } or similar object shapes
    let places: string[] = [];
    if (Array.isArray(parsed)) {
        places = parsed;
    } else if (parsed && typeof parsed === 'object') {
        const firstArrayValue = Object.values(parsed).find(v => Array.isArray(v));
        if (firstArrayValue) {
            places = firstArrayValue as string[];
        }
    }

    return places
        .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
        .map(p => p.trim())
        .slice(0, 12);
}

export async function GET(req: NextRequest) {
    const city = req.nextUrl.searchParams.get('city')?.trim();
    const country = req.nextUrl.searchParams.get('country')?.trim();

    if (!city) {
        console.warn('[/api/places] Missing city parameter');
        return NextResponse.json([]);
    }

    const locationStr = country ? `${city}, ${country}` : city;
    const apiKey = process.env.GEMINI_API_KEY;

    // Try Gemini API with model fallback chain
    if (apiKey) {
        for (const modelName of GEMINI_MODELS) {
            try {
                console.log(`[/api/places] Trying model ${modelName} for ${locationStr}...`);
                const places = await callGeminiForPlaces(apiKey, locationStr, modelName);
                if (places.length > 0) {
                    console.log(`[/api/places] ${modelName} returned ${places.length} places for ${locationStr}`);
                    return NextResponse.json(places);
                }
                console.warn(`[/api/places] ${modelName} returned empty array for ${locationStr}`);
            } catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                console.error(`[/api/places] ${modelName} failed for ${locationStr}:`, msg);
                // Continue to next model in the chain
            }
        }
    } else {
        console.error('[/api/places] GEMINI_API_KEY is not configured');
    }

    // Fallback to hardcoded places
    const fallback = getFallbackPlaces(city);
    if (fallback) {
        console.log(`[/api/places] Using fallback places for ${city} (${fallback.length} places)`);
        return NextResponse.json(fallback);
    }

    console.warn(`[/api/places] No places available for ${locationStr} (all models failed, no fallback)`);
    return NextResponse.json([]);
}
