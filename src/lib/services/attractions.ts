import { createLogger } from '../logger';
import type { AttractionData } from '@/types';

const logger = createLogger('Service:Attractions');

// ── Google Places API ────────────────────────────────────────
async function fetchFromGooglePlaces(city: string, country: string, interests: string[]): Promise<AttractionData[]> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
        logger.warn('Google Places API key not configured, using fallback');
        return [];
    }

    try {
        const query = `top attractions in ${city}, ${country} ${interests.join(' ')}`;
        const res = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
        );
        const data = await res.json();

        if (data.status !== 'OK') {
            logger.warn('Google Places API error', { status: data.status });
            return [];
        }

        const attractions: AttractionData[] = [];

        for (const place of data.results.slice(0, 15)) {
            // Fetch details for opening hours
            let opening = '09:00';
            let closing = '18:00';

            try {
                const detailsRes = await fetch(
                    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=opening_hours&key=${apiKey}`
                );
                const details = await detailsRes.json();
                if (details.result?.opening_hours?.periods?.[0]) {
                    const period = details.result.opening_hours.periods[0];
                    opening = `${String(period.open?.hours ?? 9).padStart(2, '0')}:${String(period.open?.minutes ?? 0).padStart(2, '0')}`;
                    closing = `${String(period.close?.hours ?? 18).padStart(2, '0')}:${String(period.close?.minutes ?? 0).padStart(2, '0')}`;
                }
            } catch {
                logger.debug('Could not fetch place details', { placeId: place.place_id });
            }

            attractions.push({
                name: place.name,
                location: place.formatted_address || `${city}, ${country}`,
                opening_time: opening,
                closing_time: closing,
                estimated_duration: 90,
                estimated_cost: estimateCost(place.types || []),
                rating: place.rating || 4.0,
                types: place.types || [],
            });
        }

        logger.info(`Fetched ${attractions.length} attractions from Google Places`);
        return attractions;
    } catch (error) {
        logger.error('Google Places API fetch failed', error);
        return [];
    }
}

function estimateCost(types: string[]): number {
    if (types.includes('museum')) return 15;
    if (types.includes('amusement_park')) return 40;
    if (types.includes('restaurant')) return 25;
    if (types.includes('park')) return 0;
    if (types.includes('church') || types.includes('place_of_worship')) return 5;
    if (types.includes('shopping_mall')) return 30;
    return 10;
}

// ── Fallback Mock Attractions ────────────────────────────────
function getMockAttractions(city: string, interests: string[]): AttractionData[] {
    const mockData: Record<string, AttractionData[]> = {
        default: [
            { name: `${city} Historical Museum`, location: `Downtown ${city}`, opening_time: '09:00', closing_time: '17:00', estimated_duration: 120, estimated_cost: 15, rating: 4.5, types: ['museum', 'historical'] },
            { name: `${city} Central Park`, location: `Central ${city}`, opening_time: '06:00', closing_time: '22:00', estimated_duration: 90, estimated_cost: 0, rating: 4.7, types: ['park', 'nature'] },
            { name: `${city} Art Gallery`, location: `Art District, ${city}`, opening_time: '10:00', closing_time: '18:00', estimated_duration: 90, estimated_cost: 12, rating: 4.3, types: ['art_gallery', 'museum'] },
            { name: `${city} Old Town`, location: `Historic Quarter, ${city}`, opening_time: '00:00', closing_time: '23:59', estimated_duration: 150, estimated_cost: 0, rating: 4.6, types: ['historical', 'landmark'] },
            { name: `${city} Shopping District`, location: `Main Street, ${city}`, opening_time: '10:00', closing_time: '21:00', estimated_duration: 120, estimated_cost: 50, rating: 4.2, types: ['shopping', 'entertainment'] },
            { name: `${city} Cathedral`, location: `Cathedral Square, ${city}`, opening_time: '08:00', closing_time: '18:00', estimated_duration: 60, estimated_cost: 5, rating: 4.8, types: ['church', 'historical'] },
            { name: `${city} Food Market`, location: `Market Street, ${city}`, opening_time: '07:00', closing_time: '15:00', estimated_duration: 90, estimated_cost: 20, rating: 4.5, types: ['food', 'market'] },
            { name: `${city} Observation Deck`, location: `Tower District, ${city}`, opening_time: '09:00', closing_time: '22:00', estimated_duration: 60, estimated_cost: 18, rating: 4.4, types: ['viewpoint', 'landmark'] },
            { name: `${city} Botanical Garden`, location: `Garden District, ${city}`, opening_time: '09:00', closing_time: '17:00', estimated_duration: 90, estimated_cost: 8, rating: 4.3, types: ['garden', 'nature'] },
            { name: `${city} Night Market`, location: `Riverside, ${city}`, opening_time: '18:00', closing_time: '23:00', estimated_duration: 120, estimated_cost: 25, rating: 4.6, types: ['nightlife', 'food', 'shopping'] },
            { name: `${city} Adventure Park`, location: `Outskirts, ${city}`, opening_time: '09:00', closing_time: '18:00', estimated_duration: 180, estimated_cost: 35, rating: 4.5, types: ['amusement_park', 'adventure'] },
            { name: `${city} Local Cooking Class`, location: `Central ${city}`, opening_time: '10:00', closing_time: '14:00', estimated_duration: 180, estimated_cost: 45, rating: 4.7, types: ['food', 'experience'] },
        ]
    };

    const attractions = mockData.default;

    // Score by interest relevance
    if (interests.length > 0) {
        const interestLower = interests.map(i => i.toLowerCase());
        attractions.sort((a, b) => {
            const scoreA = a.types.filter(t => interestLower.some(i => t.includes(i) || i.includes(t))).length;
            const scoreB = b.types.filter(t => interestLower.some(i => t.includes(i) || i.includes(t))).length;
            return scoreB - scoreA;
        });
    }

    return attractions;
}

// ── Main Export ──────────────────────────────────────────────
export async function getAttractions(city: string, country: string, interests: string[]): Promise<AttractionData[]> {
    logger.info('Fetching attractions', { city, country, interests });

    // Try Google Places first
    let attractions = await fetchFromGooglePlaces(city, country, interests);

    // Fallback to mock data
    if (attractions.length === 0) {
        logger.info('Using fallback mock attractions');
        attractions = getMockAttractions(city, interests);
    }

    return attractions;
}

// ── Travel Time Estimation ───────────────────────────────────
export async function getEstimatedTravelTime(
    origin: string,
    destination: string,
    mode: string = 'driving'
): Promise<number> {
    const apiKey = process.env.GOOGLE_DISTANCE_MATRIX_API_KEY;

    if (!apiKey) {
        // Fallback: estimate 20 min average
        return 20;
    }

    try {
        const res = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=${mode}&key=${apiKey}`
        );
        const data = await res.json();

        if (data.rows?.[0]?.elements?.[0]?.duration) {
            return Math.ceil(data.rows[0].elements[0].duration.value / 60);
        }

        return 20;
    } catch {
        logger.warn('Distance Matrix API failed, using fallback');
        return 20;
    }
}
