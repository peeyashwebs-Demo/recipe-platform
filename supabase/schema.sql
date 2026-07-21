-- Moxn Recipe Platform — Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'creator', 'admin')),
  unit_preference text default 'metric' check (unit_preference in ('metric', 'imperial')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Recipes table
create table public.recipes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  cover_image_url text,
  author_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'draft' check (status in ('draft', 'published', 'flagged', 'archived')),
  prep_time_minutes integer default 0,
  cook_time_minutes integer default 0,
  serving_base integer default 1,
  difficulty text default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  diet_tags jsonb default '[]'::jsonb,
  rating_average numeric(3,2) default 0,
  rating_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ingredients table
create table public.ingredients (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  name text not null,
  amount numeric(10,2) default 0,
  unit text default 'g',
  substitutions jsonb default '[]'::jsonb,
  order_index integer default 0
);

-- Steps table
create table public.steps (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  step_number integer not null,
  text text not null,
  media_url text,
  timer_seconds integer
);

-- Collections table
create table public.collections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  recipe_ids uuid[] default '{}',
  created_at timestamptz default now()
);

-- Ratings table
create table public.ratings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  score integer not null check (score between 1 and 5),
  created_at timestamptz default now(),
  unique(user_id, recipe_id)
);

-- Audit log table
create table public.audit_log (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.profiles(id) not null,
  action text not null,
  target_type text not null check (target_type in ('recipe', 'user', 'collection')),
  target_id uuid not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Flagged content table
create table public.flagged_content (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  reason text not null,
  reported_by uuid references public.profiles(id) not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz default now()
);

-- Indexes
create index idx_recipes_author on public.recipes(author_id);
create index idx_recipes_status on public.recipes(status);
create index idx_ingredients_recipe on public.ingredients(recipe_id);
create index idx_steps_recipe on public.steps(recipe_id);
create index idx_ratings_recipe on public.ratings(recipe_id);
create index idx_collections_user on public.collections(user_id);
create index idx_audit_log_admin on public.audit_log(admin_id);
create index idx_flagged_status on public.flagged_content(status);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.ingredients enable row level security;
alter table public.steps enable row level security;
alter table public.collections enable row level security;
alter table public.ratings enable row level security;
alter table public.audit_log enable row level security;
alter table public.flagged_content enable row level security;

-- Profiles: users can read all, update own
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Recipes: published are public, authors manage own
create policy "Published recipes are viewable by everyone"
  on public.recipes for select using (status = 'published' or author_id = auth.uid());

create policy "Authors can insert own recipes"
  on public.recipes for insert with check (auth.uid() = author_id);

create policy "Authors can update own recipes"
  on public.recipes for update using (auth.uid() = author_id);

create policy "Authors can delete own recipes"
  on public.recipes for delete using (auth.uid() = author_id);

-- Ingredients & Steps: follow recipe visibility
create policy "Ingredients visible with recipe"
  on public.ingredients for select using (
    exists (select 1 from public.recipes where id = recipe_id and (status = 'published' or author_id = auth.uid()))
  );

create policy "Steps visible with recipe"
  on public.steps for select using (
    exists (select 1 from public.recipes where id = recipe_id and (status = 'published' or author_id = auth.uid()))
  );

-- Collections: private to owner
create policy "Users can manage own collections"
  on public.collections for all using (auth.uid() = user_id);

-- Ratings: readable by all, managed by owner
create policy "Ratings are viewable by everyone"
  on public.ratings for select using (true);

create policy "Users can manage own ratings"
  on public.ratings for all using (auth.uid() = user_id);

-- Audit log: admin only
create policy "Admins can view audit log"
  on public.audit_log for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Flagged content: admin only
create policy "Admins can manage flagged content"
  on public.flagged_content for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Function to update recipe rating averages
create or replace function public.update_recipe_rating()
returns trigger as $$
begin
  update public.recipes
  set
    rating_average = (select coalesce(avg(score), 0) from public.ratings where recipe_id = new.recipe_id),
    rating_count = (select count(*) from public.ratings where recipe_id = new.recipe_id)
  where id = new.recipe_id;
  return new;
end;
$$ language plpgsql;

create trigger on_rating_change
  after insert or update or delete on public.ratings
  for each row execute function public.update_recipe_rating();

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'User'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
