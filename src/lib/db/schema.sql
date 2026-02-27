-- ============================================================
-- Iconéra – Database Schema (Supabase / PostgreSQL)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ── Trips ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination_country TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  arrival_datetime TIMESTAMPTZ NOT NULL,
  departure_datetime TIMESTAMPTZ NOT NULL,
  hotel_location TEXT NOT NULL DEFAULT '',
  hotel_checkin_time TEXT NOT NULL DEFAULT '14:00',
  hotel_checkout_time TEXT NOT NULL DEFAULT '11:00',
  transport_mode TEXT NOT NULL DEFAULT 'mixed'
    CHECK (transport_mode IN ('walking','public_transport','car','taxi','mixed')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','planning','generating','ready','error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_destination ON trips(destination_city, destination_country);

-- ── Trip Preferences ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
  adults INTEGER NOT NULL DEFAULT 1 CHECK (adults >= 1),
  children INTEGER NOT NULL DEFAULT 0 CHECK (children >= 0),
  children_ages JSONB NOT NULL DEFAULT '[]',
  travel_type TEXT NOT NULL DEFAULT 'solo'
    CHECK (travel_type IN ('solo','couple','family','friends','business')),
  travel_pace TEXT NOT NULL DEFAULT 'moderate'
    CHECK (travel_pace IN ('relaxed','moderate','intensive')),
  accessibility_needs BOOLEAN NOT NULL DEFAULT FALSE,
  interests JSONB NOT NULL DEFAULT '[]',
  must_visit_places JSONB NOT NULL DEFAULT '[]',
  environment_preference TEXT NOT NULL DEFAULT 'mixed'
    CHECK (environment_preference IN ('indoor','outdoor','mixed')),
  time_preference TEXT NOT NULL DEFAULT 'flexible'
    CHECK (time_preference IN ('morning','afternoon','evening','flexible')),
  total_budget NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  daily_budget_cap NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trip_preferences_trip_id ON trip_preferences(trip_id);

-- ── Trip Constraints ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_constraints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
  max_attractions_per_day INTEGER NOT NULL DEFAULT 5 CHECK (max_attractions_per_day >= 1),
  daily_rest_hours NUMERIC(4,1) NOT NULL DEFAULT 2 CHECK (daily_rest_hours >= 0),
  avoid_crowded BOOLEAN NOT NULL DEFAULT FALSE,
  fixed_bookings JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trip_constraints_trip_id ON trip_constraints(trip_id);

-- ── Itineraries ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  days JSONB NOT NULL DEFAULT '[]',
  total_estimated_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  optimization_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  generation_notes JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_itineraries_trip_id ON itineraries(trip_id);

-- ── Attractions Cache ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attractions_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  rating NUMERIC(3,1) DEFAULT 0,
  types JSONB NOT NULL DEFAULT '[]',
  opening_hours JSONB NOT NULL DEFAULT '{}',
  average_visit_duration INTEGER NOT NULL DEFAULT 60,
  estimated_cost NUMERIC(8,2) DEFAULT 0,
  photo_url TEXT,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_attractions_cache_city ON attractions_cache(city, country);
CREATE INDEX idx_attractions_cache_place_id ON attractions_cache(place_id);
CREATE INDEX idx_attractions_cache_expires ON attractions_cache(expires_at);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own trips" ON trips
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON trip_preferences
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own constraints" ON trip_constraints
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own itineraries" ON itineraries
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- Attractions cache is publicly readable
ALTER TABLE attractions_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attractions cache is public" ON attractions_cache
  FOR SELECT USING (true);

-- ── Auto-update timestamp trigger ────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_itineraries_updated_at
  BEFORE UPDATE ON itineraries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
