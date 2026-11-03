alter table public.dishes
  drop constraint dishes_photo_path_check,
  add constraint dishes_photo_path_check
    check (photo_path ~ '^dishes/[0-9a-f-]{36}-[0-9]{10,13}\.(webp|jpg)$');

alter table public.restaurants
  drop constraint restaurants_cover_path_check,
  add constraint restaurants_cover_path_check
    check (cover_path ~ '^covers/[0-9a-f-]{36}-[0-9]{10,13}\.(webp|jpg)$');
