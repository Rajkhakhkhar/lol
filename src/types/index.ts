// ============================================================
// Iconéra – Core Type Definitions
// ============================================================

// ── User ─────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// ── Trip ─────────────────────────────────────────────────────
export type TripStatus = 'draft' | 'planning' | 'generating' | 'ready' | 'error';
export type TravelPace = 'relaxed' | 'moderate' | 'intensive';
export type TravelType = 'solo' | 'couple' | 'family' | 'friends' | 'business';
export type TransportMode = 'walking' | 'public_transport' | 'car' | 'taxi' | 'mixed';
export type TimePreference = 'morning' | 'afternoon' | 'evening' | 'flexible';
export type EnvironmentPreference = 'indoor' | 'outdoor' | 'mixed';

export interface Trip {
  id: string;
  user_id: string;
  destination_country: string;
  destination_city: string;
  arrival_datetime: string;
  departure_datetime: string;
  hotel_location: string;
  hotel_checkin_time: string;
  hotel_checkout_time: string;
  transport_mode: TransportMode;
  status: TripStatus;
  created_at: string;
  updated_at: string;
}

// ── Trip Preferences ─────────────────────────────────────────
export const INTEREST_TAGS = [
  'Adventure', 'Nature', 'Shopping', 'Historical',
  'Nightlife', 'Food', 'Luxury', 'Religious',
  'Festivals', 'Photography', 'Art', 'Beach',
  'Architecture', 'Museums', 'Local Culture', 'Wellness'
] as const;

export type InterestTag = typeof INTEREST_TAGS[number];

export interface TripPreferences {
  id: string;
  trip_id: string;
  adults: number;
  children: number;
  children_ages: number[];
  travel_type: TravelType;
  travel_pace: TravelPace;
  accessibility_needs: boolean;
  interests: InterestTag[];
  must_visit_places: string[];
  environment_preference: EnvironmentPreference;
  time_preference: TimePreference;
  total_budget: number;
  currency: string;
  daily_budget_cap: number;
  created_at: string;
}

// ── Trip Constraints ─────────────────────────────────────────
export interface FixedBooking {
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes?: string;
}

export interface TripConstraints {
  id: string;
  trip_id: string;
  max_attractions_per_day: number;
  daily_rest_hours: number;
  avoid_crowded: boolean;
  fixed_bookings: FixedBooking[];
  created_at: string;
}

// ── Itinerary ────────────────────────────────────────────────
export type ActivityType = 'attraction' | 'meal' | 'travel' | 'rest' | 'hotel' | 'fixed_booking' | 'free_time';

export interface ItineraryActivity {
  id: string;
  order: number;
  type: ActivityType;
  name: string;
  description: string;
  location: string;
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  duration_minutes: number;
  travel_time_from_previous: number;
  estimated_cost: number;
  notes?: string;
  opening_hours?: string;
  rating?: number;
}

export interface ItineraryDay {
  day_number: number;
  date: string;
  theme: string;
  activities: ItineraryActivity[];
  daily_cost_estimate: number;
  total_travel_time: number;
  weather_note?: string;
}

export interface Itinerary {
  id: string;
  trip_id: string;
  days: ItineraryDay[];
  total_estimated_cost: number;
  optimization_score: number;
  generation_notes: string[];
  created_at: string;
  updated_at: string;
}

// ── Attractions Cache ────────────────────────────────────────
export interface CachedAttraction {
  id: string;
  place_id: string;
  name: string;
  city: string;
  country: string;
  location: string;
  latitude: number;
  longitude: number;
  rating: number;
  types: string[];
  opening_hours: Record<string, string>;
  average_visit_duration: number;
  estimated_cost: number;
  photo_url?: string;
  cached_at: string;
  expires_at: string;
}

// ── Form State ───────────────────────────────────────────────
export interface TravelerInfoForm {
  adults: number;
  children: number;
  children_ages: number[];
  travel_type: TravelType;
  travel_pace: TravelPace;
  accessibility_needs: boolean;
}

export interface TravelLogisticsForm {
  destination_country: string;
  destination_city: string;
  arrival_datetime: string;
  departure_datetime: string;
  hotel_location: string;
  hotel_checkin_time: string;
  hotel_checkout_time: string;
  transport_mode: TransportMode;
}

export interface BudgetForm {
  total_budget: number;
  currency: string;
  daily_budget_cap: number;
}

export interface InterestsForm {
  interests: InterestTag[];
  must_visit_places: string[];
  environment_preference: EnvironmentPreference;
  time_preference: TimePreference;
}

export interface ConstraintsForm {
  max_attractions_per_day: number;
  daily_rest_hours: number;
  avoid_crowded: boolean;
  fixed_bookings: FixedBooking[];
}

export interface TripFormData {
  traveler_info: TravelerInfoForm;
  travel_logistics: TravelLogisticsForm;
  budget: BudgetForm;
  interests: InterestsForm;
  constraints: ConstraintsForm;
}

// ── API Response ─────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ── AI Engine Types ──────────────────────────────────────────
export interface AIConstraintModel {
  trip_id: string;
  destination: { city: string; country: string };
  dates: { arrival: string; departure: string };
  hotel: { location: string; checkin: string; checkout: string };
  travelers: { adults: number; children: number; ages: number[]; type: TravelType; pace: TravelPace };
  budget: { total: number; daily_cap: number; currency: string };
  interests: InterestTag[];
  must_visit: string[];
  preferences: { environment: EnvironmentPreference; time: TimePreference; accessibility: boolean };
  constraints: { max_per_day: number; rest_hours: number; avoid_crowded: boolean };
  fixed_bookings: FixedBooking[];
  attractions: AttractionData[];
  transport_mode: TransportMode;
}

export interface AttractionData {
  name: string;
  location: string;
  opening_time: string;
  closing_time: string;
  estimated_duration: number;
  estimated_cost: number;
  rating: number;
  types: string[];
  travel_time_from_hotel?: number;
}

export interface GeminiItineraryResponse {
  days: ItineraryDay[];
  total_estimated_cost: number;
  optimization_score: number;
  notes: string[];
}
