begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('venue-gallery-v1','venue-gallery-v1',false,4194304,array['image/webp'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

-- The venue gallery API checks the venue assignment and writes with the service role.
-- Keep unrelated permissive Storage policies from granting direct client access.
drop policy if exists qa_venue_gallery_api_only on storage.objects;
create policy qa_venue_gallery_api_only on storage.objects as restrictive
for all to anon, authenticated
using (bucket_id <> 'venue-gallery-v1')
with check (bucket_id <> 'venue-gallery-v1');

commit;
