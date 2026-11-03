alter table public.dishes
  add column photo_path text
    check (photo_path ~ '^dishes/[0-9a-f-]{36}-[0-9]{10,13}\.webp$');
alter table public.restaurants
  add column cover_path text
    check (cover_path ~ '^covers/[0-9a-f-]{36}-[0-9]{10,13}\.webp$');
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-photos', 'menu-photos', true, 2097152,
        array['image/webp', 'image/jpeg', 'image/png']);
create policy "Admins can upload menu photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'menu-photos' and (select public.is_admin()));

create policy "Admins can replace menu photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'menu-photos' and (select public.is_admin()))
  with check (bucket_id = 'menu-photos' and (select public.is_admin()));

create policy "Admins can delete menu photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'menu-photos' and (select public.is_admin()));
