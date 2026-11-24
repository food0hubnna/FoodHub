-- Shawarma Hub: an express kitchen, delivered within 40 minutes of ordering.
-- Uses FoodHub's support number until the kitchen's own is set in admin.
-- Dish photos are added later.
with r as (
  insert into public.restaurants (name, phone, description, cuisine_tags, is_active, delivery_minutes)
  values (
    'Shawarma Hub',
    '+918464975652',
    'Hot, freshly rolled chicken shawarmas, delivered within 40 minutes.',
    '{Shawarma}',
    true,
    40
  )
  returning id
), c as (
  insert into public.dish_categories (restaurant_id, name, sort_order)
  select id, 'Chicken Shawarmas', 0 from r
  returning id, restaurant_id
)
insert into public.dishes (restaurant_id, category_id, name, price, is_veg, sort_order)
select c.restaurant_id, c.id, d.name, d.price, false, d.sort_order
from c
cross join (values
  ('Chicken Shawarma', 110, 0),
  ('Chicken Special Shawarma', 150, 1),
  ('Peri-Peri Chicken Shawarma', 120, 2),
  ('Chicken Cheese Shawarma', 140, 3),
  ('Double Chicken Shawarma', 250, 4)
) as d(name, price, sort_order);
