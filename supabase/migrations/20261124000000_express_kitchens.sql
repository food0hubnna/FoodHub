-- Express kitchens: delivered within N minutes of ordering instead of at the
-- fixed lunch / evening times. Null means the kitchen follows the normal
-- times (src/lib/date.ts deliveryWindow()).
alter table public.restaurants
  add column delivery_minutes int check (delivery_minutes between 5 and 180);

comment on column public.restaurants.delivery_minutes is
  'Express delivery: delivered within this many minutes of ordering. Null = the normal fixed delivery times.';
