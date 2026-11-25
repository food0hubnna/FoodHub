-- Boss Kitchen: Indo-Chinese noodles, fried rice and starters in three
-- sections (Veg / Egg / Chicken), on the normal delivery times. Uses
-- FoodHub's support number until the kitchen's own is set in admin.
with r as (
  insert into public.restaurants (name, phone, description, cuisine_tags, is_active)
  values ('Boss Kitchen', '+918464975652', null, '{Starters,FastFood}', true)
  returning id
), c as (
  insert into public.dish_categories (restaurant_id, name, sort_order)
  select r.id, s.name, s.sort_order
    from r cross join (values ('VEG', 0), ('EGG', 1), ('CHICKEN', 2)) as s(name, sort_order)
  returning id, restaurant_id, name
)
insert into public.dishes (restaurant_id, category_id, name, price, is_veg, sort_order)
select c.restaurant_id, c.id, d.name, d.price, d.is_veg, d.sort_order
from c
join (values
  ('VEG', 'Veg Noodles', 80, true, 0),
  ('VEG', 'Veg Fried Rice', 80, true, 1),
  ('VEG', 'Cashew Fried Rice', 140, true, 2),
  ('VEG', 'Cashew Paneer Fried Rice', 160, true, 3),
  ('VEG', 'Veg Manchurian', 90, true, 4),
  ('VEG', 'Veg Paneer', 120, true, 5),
  ('EGG', 'Egg Noodles', 90, false, 0),
  ('EGG', 'Egg Fried Rice', 90, false, 1),
  ('EGG', 'Egg Manchurian', 100, false, 2),
  ('CHICKEN', 'Chicken Noodles', 100, false, 0),
  ('CHICKEN', 'Chicken Fried Rice', 100, false, 1),
  ('CHICKEN', 'Chicken Manchurian', 150, false, 2),
  ('CHICKEN', 'Chilli Chicken (Pepper & Garlic)', 150, false, 3)
) as d(section, name, price, is_veg, sort_order) on d.section = c.name;
