-- Add created_by to polls to track ownership
alter table polls add column if not exists created_by uuid references auth.users(id);

-- Update RLS for polls
-- 1. Create: Only authenticated users
drop policy if exists "Anyone can create a poll." on polls;
create policy "Authenticated users can create polls" 
on polls for insert 
to authenticated 
with check (auth.uid() = created_by);

-- 2. Select: Anyone can view (still public read) or restrict? 
-- "share it with anyone" implies public READ, but maybe voting is restricted.
-- Let's keep public read for now so they can see the question before logging in.
-- But for Dashboard "My Polls", we need efficient query.

-- Update RLS for votes
-- 1. Insert: Only authenticated users
drop policy if exists "Anyone can vote" on votes;
create policy "Authenticated users can vote"
on votes for insert
to authenticated
with check (auth.uid() = user_id);

-- 2. Select: "My Votes"
-- Users should be able to see their own votes.
-- Public can see aggregated results (which we do by counting, so we need read access).
-- Let's keep read access public for simple counting.

-- Index for Dashboard performance
create index if not exists polls_created_by_idx on polls(created_by);
create index if not exists votes_user_id_idx on votes(user_id);
