drop policy if exists "Authenticated users can upload to Mjo docs" on storage.objects;

create policy "Authenticated users can upload to Mjo docs"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'Mjo docs');