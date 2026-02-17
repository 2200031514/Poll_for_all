-- 1. Add evidence_url to votes
alter table votes add column if not exists evidence_url text;

-- 2. Create Storage Bucket 'vote-evidence'
-- Note: 'storage' schema access might require direct dashboard creation if this fails, 
-- but usually this works if extensions are enabled.
insert into storage.buckets (id, name, public)
values ('vote-evidence', 'vote-evidence', true)
on conflict (id) do nothing;

-- 3. Storage Policies
-- Allow authenticated users to upload to everyone folder (or organized by user/poll)
-- Simpler: Allow authenticated insert
drop policy if exists "Authenticated users can upload evidence" on storage.objects;
create policy "Authenticated users can upload evidence"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'vote-evidence' );

-- Allow public read (so owners can verify?)
drop policy if exists "Public can view evidence" on storage.objects;
create policy "Public can view evidence"
on storage.objects for select
to public
using ( bucket_id = 'vote-evidence' );
