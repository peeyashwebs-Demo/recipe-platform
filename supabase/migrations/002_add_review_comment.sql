-- Adds written feedback to the ratings table, turning it into a full review.
alter table public.ratings
  add column if not exists comment text;

-- Allow anyone to read reviews (needed for the public feedback section)
drop policy if exists "Ratings are viewable by everyone" on public.ratings;
create policy "Ratings are viewable by everyone"
  on public.ratings for select
  using (true);

-- Only signed-in users can post/update their own review
drop policy if exists "Users can insert their own rating" on public.ratings;
create policy "Users can insert their own rating"
  on public.ratings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own rating" on public.ratings;
create policy "Users can update their own rating"
  on public.ratings for update
  using (auth.uid() = user_id);
