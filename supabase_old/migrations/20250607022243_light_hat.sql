/*
  # Additional Tables for Future Features

  1. Dream Analysis
  2. Dream Symbols
  3. RLS Policies for new tables
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