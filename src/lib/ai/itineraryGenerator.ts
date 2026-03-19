import { GoogleGenerativeAI } from "@google/generative-ai";
import { createLogger } from '../logger';
import { getDaysBetween } from '../utils';
import type { TripFormData, GeminiItineraryResponse } from '@/types';

const logger = createLogger('AI:ItineraryGenerator');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateItinerary(
    tripId: string,
    formData: TripFormData
): Promise<GeminiItineraryResponse> {
    logger.info('Starting itinerary generation with Gemini (flash-latest)');
    
    const { destination_city, destination_country, arrival_datetime, departure_datetime } = formData.travel_logistics;
    const days = getDaysBetween(arrival_datetime, departure_datetime);
    
    const prompt = `Create a detailed ${days}-day travel itinerary for ${destination_city}, ${destination_country}.
    Budget: ${formData.budget.total_budget} ${formData.budget.currency}.
    Travelers: ${formData.traveler_info.adults} adults.
    Interests: ${formData.interests.interests.join(', ')}.
    Include morning, afternoon, and evening activities with times and estimated costs.
    Return ONLY a single valid JSON object following this interface:
    interface GeminiItineraryResponse {
      days: Array<{
        day_number: number;
        date: string;
        theme: string;
        activities: Array<{
          id: string;
          order: number;
          type: "attraction" | "meal" | "hotel" | "travel" | "rest";
          name: string;
          description: string;
          location: string;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          estimated_cost: number;
          notes: string;
        }>;
        daily_cost_estimate: number;
        total_travel_time: number;
      }>;
      total_estimated_cost: number;
      optimization_score: number;
      notes: string[];
    }`;

    try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash-latest",
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const parsed = JSON.parse(text) as GeminiItineraryResponse;
        
        // Ensure each day has a date
        parsed.days.forEach((day, i) => {
            const date = new Date(arrival_datetime);
            date.setDate(date.getDate() + i);
            day.date = date.toISOString().split('T')[0];
        });
        
        return parsed;

    } catch (error) {
        logger.error('Gemini call failed', error);
        throw error;
    }
}
