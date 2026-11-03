alter table public.orders
  drop column delivery_block,
  drop column delivery_room;

alter table public.users
  drop column hostel_block,
  drop column room_number;
