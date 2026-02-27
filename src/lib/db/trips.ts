import { supabaseAdmin } from './supabase';
import { createLogger } from '../logger';
import type {
    Trip, TripPreferences, TripConstraints,
    Itinerary, TripFormData, TripStatus
} from '@/types';

const logger = createLogger('DB:Trips');

// ── Create Trip with all related data ────────────────────────
export async function createTrip(userId: string, formData: TripFormData) {
    logger.info('Creating trip', { userId, destination: formData.travel_logistics.destination_city });

    // Insert trip
    const { data: trip, error: tripError } = await supabaseAdmin
        .from('trips')
        .insert({
            user_id: userId,
            destination_country: formData.travel_logistics.destination_country,
            destination_city: formData.travel_logistics.destination_city,
            arrival_datetime: formData.travel_logistics.arrival_datetime,
            departure_datetime: formData.travel_logistics.departure_datetime,
            hotel_location: formData.travel_logistics.hotel_location,
            hotel_checkin_time: formData.travel_logistics.hotel_checkin_time,
            hotel_checkout_time: formData.travel_logistics.hotel_checkout_time,
            transport_mode: formData.travel_logistics.transport_mode,
            status: 'planning' as TripStatus,
        })
        .select()
        .single();

    if (tripError) {
        logger.error('Failed to create trip', tripError);
        throw new Error(`Failed to create trip: ${tripError.message}`);
    }

    // Insert preferences
    const { error: prefError } = await supabaseAdmin
        .from('trip_preferences')
        .insert({
            trip_id: trip.id,
            adults: formData.traveler_info.adults,
            children: formData.traveler_info.children,
            children_ages: formData.traveler_info.children_ages,
            travel_type: formData.traveler_info.travel_type,
            travel_pace: formData.traveler_info.travel_pace,
            accessibility_needs: formData.traveler_info.accessibility_needs,
            interests: formData.interests.interests,
            must_visit_places: formData.interests.must_visit_places,
            environment_preference: formData.interests.environment_preference,
            time_preference: formData.interests.time_preference,
            total_budget: formData.budget.total_budget,
            currency: formData.budget.currency,
            daily_budget_cap: formData.budget.daily_budget_cap,
        });

    if (prefError) {
        logger.error('Failed to create preferences', prefError);
        throw new Error(`Failed to create preferences: ${prefError.message}`);
    }

    // Insert constraints
    const { error: conError } = await supabaseAdmin
        .from('trip_constraints')
        .insert({
            trip_id: trip.id,
            max_attractions_per_day: formData.constraints.max_attractions_per_day,
            daily_rest_hours: formData.constraints.daily_rest_hours,
            avoid_crowded: formData.constraints.avoid_crowded,
            fixed_bookings: formData.constraints.fixed_bookings,
        });

    if (conError) {
        logger.error('Failed to create constraints', conError);
        throw new Error(`Failed to create constraints: ${conError.message}`);
    }

    logger.info('Trip created successfully', { tripId: trip.id });
    return trip as Trip;
}

// ── Get Trip with all related data ───────────────────────────
export async function getTripWithDetails(tripId: string) {
    const { data: trip, error } = await supabaseAdmin
        .from('trips')
        .select(`
      *,
      trip_preferences(*),
      trip_constraints(*),
      itineraries(*)
    `)
        .eq('id', tripId)
        .single();

    if (error) {
        logger.error('Failed to fetch trip', error);
        throw new Error(`Failed to fetch trip: ${error.message}`);
    }

    return trip;
}

// ── Get all user trips ───────────────────────────────────────
export async function getUserTrips(userId: string) {
    const { data, error } = await supabaseAdmin
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        logger.error('Failed to fetch trips', error);
        throw new Error(`Failed to fetch trips: ${error.message}`);
    }

    return data as Trip[];
}

// ── Update trip status ───────────────────────────────────────
export async function updateTripStatus(tripId: string, status: TripStatus) {
    const { error } = await supabaseAdmin
        .from('trips')
        .update({ status })
        .eq('id', tripId);

    if (error) {
        logger.error('Failed to update trip status', error);
        throw new Error(`Failed to update trip status: ${error.message}`);
    }
}

// ── Save itinerary ───────────────────────────────────────────
export async function saveItinerary(tripId: string, itinerary: Omit<Itinerary, 'id' | 'trip_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseAdmin
        .from('itineraries')
        .insert({
            trip_id: tripId,
            days: itinerary.days,
            total_estimated_cost: itinerary.total_estimated_cost,
            optimization_score: itinerary.optimization_score,
            generation_notes: itinerary.generation_notes,
        })
        .select()
        .single();

    if (error) {
        logger.error('Failed to save itinerary', error);
        throw new Error(`Failed to save itinerary: ${error.message}`);
    }

    // Mark trip as ready
    await updateTripStatus(tripId, 'ready');

    logger.info('Itinerary saved', { tripId, itineraryId: data.id });
    return data;
}

// ── Delete trip ──────────────────────────────────────────────
export async function deleteTrip(tripId: string) {
    const { error } = await supabaseAdmin
        .from('trips')
        .delete()
        .eq('id', tripId);

    if (error) {
        logger.error('Failed to delete trip', error);
        throw new Error(`Failed to delete trip: ${error.message}`);
    }
}
