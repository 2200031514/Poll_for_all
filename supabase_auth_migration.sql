-- Add require_auth column to polls
alter table polls add column if not exists require_auth boolean default false;

-- Add user_id to votes
alter table votes add column if not exists user_id uuid references auth.users(id);

-- Add unique constraint for user_id per poll
-- We want to allow anonymous votes (visitor_id) AND authenticated votes (user_id)
-- Constraints: 
-- 1. If user_id is present, it must be unique per poll.
-- 2. If visitor_id is present, it must be unique per poll (existing constraint handles this).

-- Drop existing constraint to relax it?
-- The existing constraint is: unique_vote_per_visitor unique (poll_id, visitor_id)
-- We keep that for anonymous fairness.

-- Add new constraint for auth fairness
create unique index if not exists unique_vote_per_user on votes (poll_id, user_id) where user_id is not null;

-- Update RLS policies to allow authenticated users to view/vote
-- "Anyone can vote" covers it, but let's be specific for clarity if needed.
-- Actually the existing insert check (true) is fine. 
-- We might want to restrict viewing votes or something? No, sticking to "Poll for All".

-- For create poll component:
-- We probably want policies that reference auth.uid() if we wanted to restrict editing, 
-- but for this simple app, we just create.

-- Ensure realtime still works (it triggers on any change to 'votes')
