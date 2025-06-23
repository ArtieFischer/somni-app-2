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