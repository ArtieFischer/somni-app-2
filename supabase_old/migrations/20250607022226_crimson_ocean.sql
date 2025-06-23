/*
  # Core Schema Setup for Somni Dream App

  1. New Tables
    - `users_profile` - Extended user profile information
    - `dreams` - Core dream entries with vector embeddings
  
  2. Custom Types
    - `sleep_phase` - Enum for sleep phases
  
  3. Indexes
    - User-based queries on dreams
    - Vector similarity search preparation
*/

-- Create custom ENUM types for structured data
create type public.sleep_phase as enum ('rem', 'nrem', 'light', 'deep', 'awake');

-- 1. Users Profile Table
create table if not exists public.users_profile (
  id uuid not null references auth.users(id) on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  is_premium boolean default false not null,
  onboarding_completed boolean default false not null,
  sleep_schedule jsonb,
  lucid_dream_settings jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 24)
);

comment on table public.users_profile is 'Public profile information for each user, extending auth.users.';

-- 2. Dreams Table
create table if not exists public.dreams (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  raw_transcript text,
  refined_narrative text,
  audio_url text,
  sleep_phase public.sleep_phase,
  is_lucid boolean default false,
  mood_before smallint check (mood_before >= 1 and mood_before <= 5),
  mood_after smallint check (mood_after >= 1 and mood_after <= 5),
  embedding vector(1536) -- For OpenAI's 'text-embedding-3-small' model
);

comment on table public.dreams is 'Stores individual dream entries and their vector embeddings.';

-- 3. Create indexes for faster queries
create index if not exists idx_dreams_user_id on public.dreams (user_id);
create index if not exists idx_dreams_created_at on public.dreams (created_at desc);
create index if not exists idx_users_profile_username on public.users_profile (username);

-- Note: Vector index will be created in a later script after vector functions are set up