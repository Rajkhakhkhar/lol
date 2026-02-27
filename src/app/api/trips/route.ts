import { NextRequest, NextResponse } from 'next/server';
import { createTrip } from '@/lib/db/trips';
import { generateItinerary } from '@/lib/ai/itineraryGenerator';
import { saveItinerary, updateTripStatus } from '@/lib/db/trips';
import { createLogger } from '@/lib/logger';
import type { TripFormData, ApiResponse, GeminiItineraryResponse } from '@/types';

const logger = createLogger('API:Trips');

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { formData, userId } = body as { formData: TripFormData; userId?: string };

        if (!formData) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: 'Missing form data' },
                { status: 400 }
            );
        }

        // Use provided userId or generate a demo one
        const effectiveUserId = userId || '00000000-0000-0000-0000-000000000000';

        logger.info('Creating trip', { userId: effectiveUserId });

        // 1. Save trip to database (graceful fallback if DB not connected)
        let tripId: string;
        try {
            const trip = await createTrip(effectiveUserId, formData);
            tripId = trip.id;
        } catch (dbError) {
            logger.warn('DB save failed, proceeding with generated ID', dbError);
            tripId = crypto.randomUUID();
        }

        // 2. Update status to generating
        try {
            await updateTripStatus(tripId, 'generating');
        } catch {
            // non-critical
        }

        // 3. Generate itinerary
        let itinerary: GeminiItineraryResponse;
        try {
            itinerary = await generateItinerary(tripId, formData);
        } catch (aiError) {
            logger.error('Itinerary generation failed', aiError);
            try { await updateTripStatus(tripId, 'error'); } catch { /* */ }
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: 'Failed to generate itinerary' },
                { status: 500 }
            );
        }

        // 4. Save itinerary to DB
        try {
            await saveItinerary(tripId, {
                days: itinerary.days,
                total_estimated_cost: itinerary.total_estimated_cost,
                optimization_score: itinerary.optimization_score,
                generation_notes: itinerary.notes,
            });
        } catch (saveError) {
            logger.warn('Failed to save itinerary to DB', saveError);
        }

        return NextResponse.json<ApiResponse<{ tripId: string; itinerary: GeminiItineraryResponse }>>(
            {
                success: true,
                data: { tripId, itinerary },
                message: 'Itinerary generated successfully',
            },
            { status: 201 }
        );
    } catch (error) {
        logger.error('Unexpected error', error);
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
