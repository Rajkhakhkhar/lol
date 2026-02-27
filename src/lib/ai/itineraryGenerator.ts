import { GoogleGenerativeAI } from '@google/generative-ai';
import { createLogger } from '../logger';
import { getAttractions, getEstimatedTravelTime } from '../services/attractions';
import { validateItinerary, autoFixItinerary } from './validator';
import { getDaysBetween } from '../utils';
import type {
    TripFormData, AIConstraintModel, GeminiItineraryResponse,
    ItineraryDay, AttractionData,
} from '@/types';

const logger = createLogger('AI:ItineraryGenerator');

// ── Build structured constraint model ────────────────────────
async function buildConstraintModel(
    tripId: string,
    formData: TripFormData
): Promise<AIConstraintModel> {
    const { travel_logistics, traveler_info, budget, interests, constraints } = formData;

    // Fetch attractions
    const attractions = await getAttractions(
        travel_logistics.destination_city,
        travel_logistics.destination_country,
        interests.interests
    );

    // Estimate travel times from hotel
    const attractionsWithTravel: AttractionData[] = [];
    for (const attraction of attractions) {
        const travelTime = await getEstimatedTravelTime(
            travel_logistics.hotel_location || travel_logistics.destination_city,
            attraction.location,
            travel_logistics.transport_mode === 'walking' ? 'walking' : 'driving'
        );
        attractionsWithTravel.push({
            ...attraction,
            travel_time_from_hotel: travelTime,
        });
    }

    return {
        trip_id: tripId,
        destination: {
            city: travel_logistics.destination_city,
            country: travel_logistics.destination_country,
        },
        dates: {
            arrival: travel_logistics.arrival_datetime,
            departure: travel_logistics.departure_datetime,
        },
        hotel: {
            location: travel_logistics.hotel_location,
            checkin: travel_logistics.hotel_checkin_time,
            checkout: travel_logistics.hotel_checkout_time,
        },
        travelers: {
            adults: traveler_info.adults,
            children: traveler_info.children,
            ages: traveler_info.children_ages,
            type: traveler_info.travel_type,
            pace: traveler_info.travel_pace,
        },
        budget: {
            total: budget.total_budget,
            daily_cap: budget.daily_budget_cap,
            currency: budget.currency,
        },
        interests: interests.interests,
        must_visit: interests.must_visit_places,
        preferences: {
            environment: interests.environment_preference,
            time: interests.time_preference,
            accessibility: traveler_info.accessibility_needs,
        },
        constraints: {
            max_per_day: constraints.max_attractions_per_day,
            rest_hours: constraints.daily_rest_hours,
            avoid_crowded: constraints.avoid_crowded,
        },
        fixed_bookings: constraints.fixed_bookings,
        attractions: attractionsWithTravel,
        transport_mode: travel_logistics.transport_mode,
    };
}

// ── Build Gemini prompt ──────────────────────────────────────
function buildPrompt(model: AIConstraintModel): string {
    const numDays = getDaysBetween(model.dates.arrival, model.dates.departure);

    return `You are a professional travel itinerary optimizer. Generate a detailed ${numDays}-day travel itinerary as STRICT JSON.

TRIP DETAILS:
- Destination: ${model.destination.city}, ${model.destination.country}
- Dates: ${model.dates.arrival} to ${model.dates.departure} (${numDays} days)
- Hotel: ${model.hotel.location} (Check-in: ${model.hotel.checkin}, Check-out: ${model.hotel.checkout})
- Travelers: ${model.travelers.adults} adults, ${model.travelers.children} children
- Travel Type: ${model.travelers.type} | Pace: ${model.travelers.pace}
- Transport: ${model.transport_mode}
- Budget: ${model.budget.total} ${model.budget.currency} total, ${model.budget.daily_cap} ${model.budget.currency}/day cap
- Interests: ${model.interests.join(', ')}
- Must Visit: ${model.must_visit.join(', ') || 'None specified'}
- Environment: ${model.preferences.environment} | Time: ${model.preferences.time}
- Accessibility: ${model.preferences.accessibility ? 'Required' : 'Not required'}

CONSTRAINTS:
- Max ${model.constraints.max_per_day} attractions per day
- ${model.constraints.rest_hours} hours rest/downtime per day
- Avoid crowded places: ${model.constraints.avoid_crowded}
${model.fixed_bookings.length > 0 ? `- Fixed bookings: ${JSON.stringify(model.fixed_bookings)}` : ''}

AVAILABLE ATTRACTIONS:
${JSON.stringify(model.attractions, null, 2)}

RULES:
1. Day 1 starts AFTER hotel check-in (${model.hotel.checkin})
2. Last day must have check-out by ${model.hotel.checkout}
3. Respect all opening/closing hours
4. Include realistic travel time between locations (15-30 min minimum)
5. Include meal breaks (breakfast ~30min, lunch ~60min, dinner ~75min)
6. Include rest periods per constraints
7. Stay within daily budget cap
8. Prioritize must-visit places
9. Group nearby attractions on the same day
10. Match time preferences (${model.preferences.time})
11. Each activity needs: id(uuid), order, type, name, description, location, start_time(HH:MM), end_time(HH:MM), duration_minutes, travel_time_from_previous, estimated_cost, notes, opening_hours

RESPOND WITH ONLY THIS JSON STRUCTURE (no markdown, no explanation):
{
  "days": [
    {
      "day_number": 1,
      "date": "YYYY-MM-DD",
      "theme": "Day theme",
      "activities": [
        {
          "id": "uuid",
          "order": 1,
          "type": "hotel|attraction|meal|travel|rest|fixed_booking|free_time",
          "name": "Activity Name",
          "description": "Brief description",
          "location": "Location",
          "start_time": "HH:MM",
          "end_time": "HH:MM",
          "duration_minutes": 60,
          "travel_time_from_previous": 0,
          "estimated_cost": 0,
          "notes": "",
          "opening_hours": "HH:MM-HH:MM"
        }
      ],
      "daily_cost_estimate": 0,
      "total_travel_time": 0
    }
  ],
  "total_estimated_cost": 0,
  "optimization_score": 85,
  "notes": ["Note 1"]
}`;
}

// ── Call Gemini API ──────────────────────────────────────────
async function callGemini(prompt: string): Promise<GeminiItineraryResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        logger.warn('Gemini API key not configured, generating fallback itinerary');
        throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
            maxOutputTokens: 8192,
        },
    });

    logger.info('Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
        const parsed = JSON.parse(text) as GeminiItineraryResponse;
        logger.info('Gemini response parsed successfully');
        return parsed;
    } catch {
        logger.error('Failed to parse Gemini response', { text: text.substring(0, 500) });
        throw new Error('Gemini returned invalid JSON');
    }
}

// ── Generate fallback itinerary ──────────────────────────────
function generateFallbackItinerary(model: AIConstraintModel): GeminiItineraryResponse {
    const numDays = getDaysBetween(model.dates.arrival, model.dates.departure);
    const startDate = new Date(model.dates.arrival);
    const days: ItineraryDay[] = [];

    let attractionIndex = 0;
    const perDay = Math.min(model.constraints.max_per_day, model.attractions.length);

    for (let d = 0; d < numDays; d++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];

        const isFirst = d === 0;
        const isLast = d === numDays - 1;

        const dayActivities = [];
        let order = 1;
        let currentTime = isFirst ? parseInt(model.hotel.checkin.split(':')[0]) * 60 + parseInt(model.hotel.checkin.split(':')[1] || '0') : 8 * 60;

        // Hotel start
        dayActivities.push({
            id: crypto.randomUUID(),
            order: order++,
            type: 'hotel' as const,
            name: isFirst ? 'Hotel Check-in' : 'Leave Hotel',
            description: isFirst ? 'Check into hotel and freshen up' : 'Start the day\'s adventure',
            location: model.hotel.location || model.destination.city,
            start_time: `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${(currentTime % 60).toString().padStart(2, '0')}`,
            end_time: `${Math.floor((currentTime + 30) / 60).toString().padStart(2, '0')}:${((currentTime + 30) % 60).toString().padStart(2, '0')}`,
            duration_minutes: 30,
            travel_time_from_previous: 0,
            estimated_cost: 0,
            notes: '',
        });
        currentTime += 30;

        // Breakfast
        dayActivities.push({
            id: crypto.randomUUID(),
            order: order++,
            type: 'meal' as const,
            name: 'Breakfast',
            description: `Enjoy breakfast in ${model.destination.city}`,
            location: model.hotel.location || model.destination.city,
            start_time: `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${(currentTime % 60).toString().padStart(2, '0')}`,
            end_time: `${Math.floor((currentTime + 45) / 60).toString().padStart(2, '0')}:${((currentTime + 45) % 60).toString().padStart(2, '0')}`,
            duration_minutes: 45,
            travel_time_from_previous: 0,
            estimated_cost: 15,
            notes: '',
        });
        currentTime += 45;

        // Morning attractions
        let dailyCost = 15;
        const endTime = isLast ? parseInt(model.hotel.checkout.split(':')[0]) * 60 : 21 * 60;

        for (let a = 0; a < perDay && attractionIndex < model.attractions.length; a++) {
            const attraction = model.attractions[attractionIndex];
            const travelTime = attraction.travel_time_from_hotel || 20;
            currentTime += travelTime;

            if (currentTime + attraction.estimated_duration > endTime - 60) break;

            dayActivities.push({
                id: crypto.randomUUID(),
                order: order++,
                type: 'attraction' as const,
                name: attraction.name,
                description: `Visit ${attraction.name}`,
                location: attraction.location,
                start_time: `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${(currentTime % 60).toString().padStart(2, '0')}`,
                end_time: `${Math.floor((currentTime + attraction.estimated_duration) / 60).toString().padStart(2, '0')}:${((currentTime + attraction.estimated_duration) % 60).toString().padStart(2, '0')}`,
                duration_minutes: attraction.estimated_duration,
                travel_time_from_previous: travelTime,
                estimated_cost: attraction.estimated_cost,
                opening_hours: `${attraction.opening_time}-${attraction.closing_time}`,
                notes: `Rating: ${attraction.rating}/5`,
            });

            dailyCost += attraction.estimated_cost;
            currentTime += attraction.estimated_duration;
            attractionIndex++;

            // Lunch break after 2nd attraction
            if (a === 1 && currentTime < endTime - 120) {
                dayActivities.push({
                    id: crypto.randomUUID(),
                    order: order++,
                    type: 'meal' as const,
                    name: 'Lunch',
                    description: `Lunch in ${model.destination.city}`,
                    location: model.destination.city,
                    start_time: `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${(currentTime % 60).toString().padStart(2, '0')}`,
                    end_time: `${Math.floor((currentTime + 60) / 60).toString().padStart(2, '0')}:${((currentTime + 60) % 60).toString().padStart(2, '0')}`,
                    duration_minutes: 60,
                    travel_time_from_previous: 10,
                    estimated_cost: 20,
                    notes: '',
                });
                dailyCost += 20;
                currentTime += 70;
            }
        }

        // Dinner (if not last day)
        if (!isLast && currentTime < endTime - 90) {
            const dinnerTime = Math.max(currentTime + 20, 19 * 60);
            dayActivities.push({
                id: crypto.randomUUID(),
                order: order++,
                type: 'meal' as const,
                name: 'Dinner',
                description: `Dinner in ${model.destination.city}`,
                location: model.destination.city,
                start_time: `${Math.floor(dinnerTime / 60).toString().padStart(2, '0')}:${(dinnerTime % 60).toString().padStart(2, '0')}`,
                end_time: `${Math.floor((dinnerTime + 75) / 60).toString().padStart(2, '0')}:${((dinnerTime + 75) % 60).toString().padStart(2, '0')}`,
                duration_minutes: 75,
                travel_time_from_previous: 15,
                estimated_cost: 30,
                notes: '',
            });
            dailyCost += 30;
        }

        // Hotel end
        if (isLast) {
            dayActivities.push({
                id: crypto.randomUUID(),
                order: order++,
                type: 'hotel' as const,
                name: 'Hotel Check-out',
                description: 'Check out and depart',
                location: model.hotel.location || model.destination.city,
                start_time: model.hotel.checkout,
                end_time: model.hotel.checkout,
                duration_minutes: 30,
                travel_time_from_previous: 20,
                estimated_cost: 0,
                notes: 'Ensure early packing',
            });
        }

        days.push({
            day_number: d + 1,
            date: dateStr,
            theme: d === 0 ? 'Arrival & Exploration' : isLast ? 'Departure Day' : `Day ${d + 1} Adventure`,
            activities: dayActivities,
            daily_cost_estimate: dailyCost,
            total_travel_time: dayActivities.reduce((s, a) => s + (a.travel_time_from_previous || 0), 0),
        });
    }

    const totalCost = days.reduce((s, d) => s + d.daily_cost_estimate, 0);

    return {
        days,
        total_estimated_cost: totalCost,
        optimization_score: 72,
        notes: ['Fallback itinerary generated — connect Gemini API for AI-optimized results'],
    };
}

// ── Main export ──────────────────────────────────────────────
export async function generateItinerary(
    tripId: string,
    formData: TripFormData
): Promise<GeminiItineraryResponse> {
    logger.info('Starting itinerary generation', { tripId });

    // 1. Build constraint model
    const constraintModel = await buildConstraintModel(tripId, formData);
    logger.info('Constraint model built', { attractions: constraintModel.attractions.length });

    let itineraryResponse: GeminiItineraryResponse;

    try {
        // 2. Generate with Gemini
        const prompt = buildPrompt(constraintModel);
        itineraryResponse = await callGemini(prompt);
    } catch (error) {
        logger.warn('Gemini generation failed, using fallback', { error: String(error) });
        itineraryResponse = generateFallbackItinerary(constraintModel);
    }

    // 3. Validate
    const validation = validateItinerary(itineraryResponse.days, constraintModel);
    logger.info('Validation result', validation);

    // 4. Auto-fix if needed
    if (!validation.valid) {
        logger.info('Auto-fixing itinerary...');
        itineraryResponse.days = autoFixItinerary(itineraryResponse.days);
        itineraryResponse.notes.push(...validation.warnings);
        itineraryResponse.notes.push('Itinerary was auto-adjusted to resolve time conflicts');
    }

    if (validation.warnings.length > 0) {
        itineraryResponse.notes.push(...validation.warnings);
    }

    logger.info('Itinerary generation complete', {
        days: itineraryResponse.days.length,
        cost: itineraryResponse.total_estimated_cost,
        score: itineraryResponse.optimization_score,
    });

    return itineraryResponse;
}
