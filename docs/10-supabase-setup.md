# Supabase Setup with Manual SQL Execution

This document provides comprehensive instructions for setting up Supabase using Bolt's integration and manual SQL execution in the Supabase dashboard. Since local Supabase CLI can be problematic in some environments, this approach uses the hosted Supabase dashboard for all database operations.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Access to the Supabase dashboard

## Phase 1: Project Setup and Database Schema

### Step 1: Create Supabase Project

1. **Create New Project**:
   - Go to [database.new](https://database.new) or [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose your organization
   - Give it a name (e.g., "Somni Dream App")
   - Generate a secure database password (save this!)
   - Choose a region closest to your users
   - Click "Create new project"

2. **Get API Keys**:
   - Once provisioned, go to **Project Settings > API**
   - Copy the **Project URL** and **anon (public) key**
   - Keep these safe - you'll need them for environment variables

### Step 2: Connect to Supabase in Bolt

Use Bolt's "Connect to Supabase" button in the top right corner of the interface to set up the connection with your project credentials.

### Step 3: Execute Database Schema

Execute the following SQL snippets in order in your Supabase dashboard (**SQL Editor**):

#### Migration 1: Enable pgvector Extension

```sql
-- Enable pgvector extension for vector embeddings
create extension if not exists vector with schema extensions;
```

#### Migration 2: Create Core Tables and Types

```sql
/*
  # Core Schema Setup for Somni Dream App

  1. New Tables
    - `users_profile` - Extended user profile information
    - `dreams` - Core dream entries with vector embeddings
  
  2. Custom Types
    - `sleep_phase` - Enum for sleep phases
  
  3. Indexes
    - User-based queries on dreams
    - Vector similarity search with HNSW
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

-- 4. Create HNSW index for vector similarity search (only if vector column has data)
-- Note: This index will be created later when we have embeddings
-- create index if not exists idx_dreams_embedding on public.dreams using hnsw (embedding vector_l2_ops);
```

#### Migration 3: Row Level Security and Policies

```sql
/*
  # Row Level Security Setup

  1. Security
    - Enable RLS on all tables
    - Create policies for user data access
    - Ensure users can only access their own data
  
  2. Triggers
    - Auto-create user profile on signup
    - Update timestamps automatically
*/

-- 1. Enable RLS on the tables
alter table public.users_profile enable row level security;
alter table public.dreams enable row level security;

-- 2. Create policies for 'users_profile'
create policy "Users can view their own profile" on public.users_profile
  for select using (auth.uid() = id);

create policy "Users can insert their own profile" on public.users_profile
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.users_profile
  for update using (auth.uid() = id);

-- 3. Create policies for 'dreams'
create policy "Users can view their own dreams" on public.dreams
  for select using (auth.uid() = user_id);

create policy "Users can create their own dreams" on public.dreams
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own dreams" on public.dreams
  for update using (auth.uid() = user_id);

create policy "Users can delete their own dreams" on public.dreams
  for delete using (auth.uid() = user_id);

-- 4. Function and Trigger for new user profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users_profile (id, username, display_name)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name')
  );
  return new;
end;
$$;

-- Create trigger to call the function when new user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger handle_users_profile_updated_at
  before update on public.users_profile
  for each row execute procedure public.handle_updated_at();

create trigger handle_dreams_updated_at
  before update on public.dreams
  for each row execute procedure public.handle_updated_at();
```

#### Migration 4: Vector Search Functions

```sql
/*
  # Vector Search Functions

  1. Functions
    - `match_dreams` - Semantic similarity search for dreams
    - `generate_dream_embedding` - Helper for embedding generation
*/

-- Function for similarity search
create or replace function match_dreams(
  query_embedding vector(1536),
  match_threshold float default 0.78,
  match_count int default 10,
  filter_user_id uuid default null
)
returns table (
  id uuid,
  user_id uuid,
  raw_transcript text,
  refined_narrative text,
  created_at timestamp with time zone,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dreams.id,
    dreams.user_id,
    dreams.raw_transcript,
    dreams.refined_narrative,
    dreams.created_at,
    1 - (dreams.embedding <=> query_embedding) as similarity
  from public.dreams
  where 
    dreams.embedding is not null
    and (filter_user_id is null or dreams.user_id = filter_user_id)
    and 1 - (dreams.embedding <=> query_embedding) > match_threshold
  order by dreams.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create the HNSW index now (after we have the function)
create index if not exists idx_dreams_embedding 
on public.dreams using hnsw (embedding vector_cosine_ops)
where embedding is not null;
```

#### Migration 5: Additional Tables (Future Extensions)

```sql
/*
  # Additional Tables for Future Features

  1. Dream Analysis
  2. Dream Symbols
  3. Community Features (if needed)
*/

-- Dream Analysis Table
create table if not exists public.dream_analysis (
  id uuid not null default gen_random_uuid() primary key,
  dream_id uuid not null references public.dreams(id) on delete cascade,
  analysis_type text not null check (analysis_type in ('freudian', 'jungian', 'spiritual', 'neurobiological', 'cognitive', 'personal_pattern')),
  content text not null,
  confidence real check (confidence >= 0 and confidence <= 1),
  key_insights text[] default '{}',
  suggested_actions text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Dream Symbols Table
create table if not exists public.dream_symbols (
  id uuid not null default gen_random_uuid() primary key,
  dream_id uuid not null references public.dreams(id) on delete cascade,
  name text not null,
  category text not null,
  confidence real check (confidence >= 0 and confidence <= 1),
  position integer,
  personal_meaning text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on new tables
alter table public.dream_analysis enable row level security;
alter table public.dream_symbols enable row level security;

-- Policies for dream_analysis
create policy "Users can view analysis of their own dreams" on public.dream_analysis
  for select using (
    exists (
      select 1 from public.dreams 
      where dreams.id = dream_analysis.dream_id 
      and dreams.user_id = auth.uid()
    )
  );

create policy "Users can create analysis for their own dreams" on public.dream_analysis
  for insert with check (
    exists (
      select 1 from public.dreams 
      where dreams.id = dream_analysis.dream_id 
      and dreams.user_id = auth.uid()
    )
  );

-- Policies for dream_symbols
create policy "Users can view symbols of their own dreams" on public.dream_symbols
  for select using (
    exists (
      select 1 from public.dreams 
      where dreams.id = dream_symbols.dream_id 
      and dreams.user_id = auth.uid()
    )
  );

create policy "Users can create symbols for their own dreams" on public.dream_symbols
  for insert with check (
    exists (
      select 1 from public.dreams 
      where dreams.id = dream_symbols.dream_id 
      and dreams.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index if not exists idx_dream_analysis_dream_id on public.dream_analysis (dream_id);
create index if not exists idx_dream_symbols_dream_id on public.dream_symbols (dream_id);
create index if not exists idx_dream_symbols_name on public.dream_symbols (name);
```

## Environment Variables Setup

After completing the database setup, you'll need to configure environment variables in your applications.

### Mobile App (`.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Web App (`.env.local`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Verification Steps

After running all the SQL migrations:

1. **Check Tables**: Go to **Table Editor** in your Supabase dashboard and verify all tables are created:
   - `users_profile`
   - `dreams`
   - `dream_analysis`
   - `dream_symbols`

2. **Check Policies**: Go to **Authentication > Policies** and verify RLS policies are in place

3. **Test Authentication**: Try signing up a test user to ensure the trigger creates a profile

4. **Check Functions**: Go to **Database > Functions** and verify the custom functions exist

## Next Steps

1. **Initialize Supabase clients** in both mobile and web applications
2. **Implement authentication flows** using the new schema
3. **Create API services** that interact with the dreams and profiles tables
4. **Set up real-time subscriptions** for live data updates
5. **Implement vector similarity search** for dream analysis features

## Troubleshooting

### Common Issues

**RLS blocking queries**:
- Ensure you're authenticated when testing
- Check policy conditions match your use case
- Test policies in the SQL editor with `auth.uid()`

**Vector index creation fails**:
- The HNSW index requires existing vector data
- Add some test embeddings first, then create the index

**Trigger not firing**:
- Check that the trigger function exists
- Verify the trigger is attached to the correct table
- Test with a new user signup

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)

This setup provides a robust foundation for the Somni application with proper database version control through documented SQL snippets that can be executed manually in the Supabase dashboard.