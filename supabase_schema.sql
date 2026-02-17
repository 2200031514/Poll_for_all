-- Create tables
create table polls (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table options (
  id uuid default gen_random_uuid() primary key,
  poll_id uuid references polls(id) on delete cascade not null,
  text text not null
);

create table votes (
  id uuid default gen_random_uuid() primary key,
  poll_id uuid references polls(id) on delete cascade not null,
  option_id uuid references options(id) on delete cascade not null,
  visitor_id text, -- for fingerprinting
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_vote_per_visitor unique (poll_id, visitor_id)
);

-- Enable RLS
alter table polls enable row level security;
alter table options enable row level security;
alter table votes enable row level security;

-- Policies
-- Anyone can read polls and options
create policy "Public polls are viewable by everyone." on polls for select using (true);
create policy "Public options are viewable by everyone." on options for select using (true);

-- Anyone can insert polls and options (for creation)
create policy "Anyone can create a poll." on polls for insert with check (true);
create policy "Anyone can create options." on options for insert with check (true);

-- Anyone can view votes (to see results) - aggregated or individual?
-- Let's allow reading individual votes for simplicity in realtime client, 
-- or we can use a postgres function for counts. 
-- For now, allow reading votes to count them on client.
create policy "Anyone can view votes" on votes for select using (true);

-- Anyone can vote (insert), but unique constraint handles duplicates
create policy "Anyone can vote" on votes for insert with check (true);

-- Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table votes;
commit;
