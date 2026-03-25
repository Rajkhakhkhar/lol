-- EYEKON database schema for Supabase
-- Run this in the Supabase SQL editor before using auth in the app.

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_email on public.profiles(email);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = case
      when excluded.full_name <> '' then excluded.full_name
      else public.profiles.full_name
    end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.trips (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  destination_country text not null,
  destination_city text not null,
  arrival_datetime timestamptz not null,
  departure_datetime timestamptz not null,
  hotel_location text not null default '',
  hotel_checkin_time text not null default '14:00',
  hotel_checkout_time text not null default '11:00',
  transport_mode text not null default 'mixed'
    check (transport_mode in ('walking', 'public_transport', 'car', 'taxi', 'mixed', 'airplane', 'bus', 'two-wheeler')),
  same_hotel_for_all_days boolean not null default true,
  day_plans jsonb not null default '[]'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'planning', 'generating', 'ready', 'error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_trips_user_id on public.trips(user_id);
create index if not exists idx_trips_status on public.trips(status);
create index if not exists idx_trips_destination on public.trips(destination_city, destination_country);

create table if not exists public.trip_preferences (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null unique references public.trips (id) on delete cascade,
  adults integer not null default 1 check (adults >= 1),
  children integer not null default 0 check (children >= 0),
  children_ages jsonb not null default '[]'::jsonb,
  travel_type text not null default 'solo'
    check (travel_type in ('solo', 'couple', 'family', 'friends', 'business')),
  travel_pace text not null default 'moderate'
    check (travel_pace in ('relaxed', 'moderate', 'intensive')),
  accessibility_needs boolean not null default false,
  interests jsonb not null default '[]'::jsonb,
  must_visit_places jsonb not null default '[]'::jsonb,
  environment_preference text not null default 'mixed'
    check (environment_preference in ('indoor', 'outdoor', 'mixed')),
  time_preference text not null default 'flexible'
    check (time_preference in ('morning', 'afternoon', 'evening', 'flexible')),
  total_budget numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  daily_budget_cap numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_trip_preferences_trip_id on public.trip_preferences(trip_id);

create table if not exists public.trip_constraints (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null unique references public.trips (id) on delete cascade,
  max_attractions_per_day integer not null default 5 check (max_attractions_per_day >= 1),
  daily_rest_hours numeric(4, 1) not null default 2 check (daily_rest_hours >= 0),
  avoid_crowded boolean not null default false,
  fixed_bookings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_trip_constraints_trip_id on public.trip_constraints(trip_id);

create table if not exists public.itineraries (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  days jsonb not null default '[]'::jsonb,
  total_estimated_cost numeric(12, 2) not null default 0,
  optimization_score numeric(5, 2) not null default 0,
  generation_notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_itineraries_trip_id on public.itineraries(trip_id);

create table if not exists public.attractions_cache (
  id uuid primary key default uuid_generate_v4(),
  place_id text unique not null,
  name text not null,
  city text not null,
  country text not null,
  location text not null default '',
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  rating numeric(3, 1) default 0,
  types jsonb not null default '[]'::jsonb,
  opening_hours jsonb not null default '{}'::jsonb,
  average_visit_duration integer not null default 60,
  estimated_cost numeric(8, 2) default 0,
  photo_url text,
  cached_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index if not exists idx_attractions_cache_city on public.attractions_cache(city, country);
create index if not exists idx_attractions_cache_place_id on public.attractions_cache(place_id);
create index if not exists idx_attractions_cache_expires on public.attractions_cache(expires_at);

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_preferences enable row level security;
alter table public.trip_constraints enable row level security;
alter table public.itineraries enable row level security;
alter table public.attractions_cache enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can manage own trips" on public.trips;
create policy "Users can manage own trips" on public.trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own preferences" on public.trip_preferences;
create policy "Users can manage own preferences" on public.trip_preferences
  for all using (
    exists (
      select 1 from public.trips
      where public.trips.id = trip_preferences.trip_id
        and public.trips.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.trips
      where public.trips.id = trip_preferences.trip_id
        and public.trips.user_id = auth.uid()
    )
  );

drop policy if exists "Users can manage own constraints" on public.trip_constraints;
create policy "Users can manage own constraints" on public.trip_constraints
  for all using (
    exists (
      select 1 from public.trips
      where public.trips.id = trip_constraints.trip_id
        and public.trips.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.trips
      where public.trips.id = trip_constraints.trip_id
        and public.trips.user_id = auth.uid()
    )
  );

drop policy if exists "Users can manage own itineraries" on public.itineraries;
create policy "Users can manage own itineraries" on public.itineraries
  for all using (
    exists (
      select 1 from public.trips
      where public.trips.id = itineraries.trip_id
        and public.trips.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.trips
      where public.trips.id = itineraries.trip_id
        and public.trips.user_id = auth.uid()
    )
  );

drop policy if exists "Attractions cache is public" on public.attractions_cache;
create policy "Attractions cache is public" on public.attractions_cache
  for select using (true);

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_profiles_updated_at on public.profiles;
create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

drop trigger if exists tr_trips_updated_at on public.trips;
create trigger tr_trips_updated_at
  before update on public.trips
  for each row execute function public.update_updated_at();

drop trigger if exists tr_itineraries_updated_at on public.itineraries;
create trigger tr_itineraries_updated_at
  before update on public.itineraries
  for each row execute function public.update_updated_at();
