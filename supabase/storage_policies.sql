-- Run after creating public buckets: staff-photos, site-images

create policy "public_read_site_storage"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('staff-photos', 'site-images'));

create policy "admin_insert_site_storage"
on storage.objects for insert
to authenticated
with check (bucket_id in ('staff-photos', 'site-images'));

create policy "admin_update_site_storage"
on storage.objects for update
to authenticated
using (bucket_id in ('staff-photos', 'site-images'));

create policy "admin_delete_site_storage"
on storage.objects for delete
to authenticated
using (bucket_id in ('staff-photos', 'site-images'));
