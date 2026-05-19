-- Queer Atlas - Now news image storage (admin-managed)
-- Purpose:
-- 1) Create a dedicated storage bucket for Now editorial images.
-- 2) Allow public read for rendering in the app.
-- 3) Restrict uploads/updates/deletes to admins only via public.qa_is_admin().
--
-- Pre-req:
-- - public.qa_is_admin() exists (from world-news-sync/core RLS scripts).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'qa-now-news',
  'qa-now-news',
  true,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists qa_now_news_images_read on storage.objects;
create policy qa_now_news_images_read
on storage.objects
for select
using (bucket_id = 'qa-now-news');

drop policy if exists qa_now_news_images_insert_admin on storage.objects;
create policy qa_now_news_images_insert_admin
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'qa-now-news'
  and public.qa_is_admin()
);

drop policy if exists qa_now_news_images_update_admin on storage.objects;
create policy qa_now_news_images_update_admin
on storage.objects
for update
to authenticated
using (
  bucket_id = 'qa-now-news'
  and public.qa_is_admin()
)
with check (
  bucket_id = 'qa-now-news'
  and public.qa_is_admin()
);

drop policy if exists qa_now_news_images_delete_admin on storage.objects;
create policy qa_now_news_images_delete_admin
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'qa-now-news'
  and public.qa_is_admin()
);
