-- PAWS N' PLAY - dog photos. Run ONCE in Supabase > SQL Editor > New query > Run.
-- Adds a photo field to each dog and a private storage area for the pictures
-- (JPG/PNG/WEBP, 2 MB limit; the website shrinks photos to about 150 KB before uploading).

alter table public.dogs add column if not exists photo_path text
  check (photo_path is null or char_length(photo_path) <= 300);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dog-photos', 'dog-photos', false, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 2097152,
  allowed_mime_types = excluded.allowed_mime_types;

-- A customer can add and delete pictures only inside their own folder.
create policy dogphoto_add on storage.objects for insert to authenticated
  with check (bucket_id = 'dog-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- A customer sees their own pictures; staff and admins see all of them.
create policy dogphoto_read on storage.objects for select to authenticated
  using (bucket_id = 'dog-photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff()));

create policy dogphoto_delete on storage.objects for delete to authenticated
  using (bucket_id = 'dog-photos' and (storage.foldername(name))[1] = auth.uid()::text);
