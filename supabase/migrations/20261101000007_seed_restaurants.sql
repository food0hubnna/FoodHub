do $$
begin
  if exists (select 1 from public.restaurants) then
    raise exception 'restaurants table is not empty - seed already applied?';
  end if;
end;
$$;
with r as (
  insert into public.restaurants (name, phone, description, cuisine_tags, is_active)
  values ('Al Madina', '+918464975652', 'A taste of comfort. Any biryani ₹170.', array['Biryani'], true)
  returning id
),
c as (
  insert into public.dish_categories (restaurant_id, name, sort_order)
  select r.id, 'Biryani', 0 from r
  returning id, name
)
insert into public.dishes (restaurant_id, category_id, name, price, is_veg, note, sort_order)
select r.id, c.id, v.name, v.price, v.is_veg, v.note::text, v.sort_order
from r, c, (values
    ('Chicken Dum Biryani', 170, false, null, 0),
    ('Chicken Fry Biryani', 170, false, null, 1),
    ('Mixed Chicken Biryani', 170, false, null, 2)
) as v (name, price, is_veg, note, sort_order);
with r as (
  insert into public.restaurants (name, phone, description, cuisine_tags, is_active)
  values ('A1 Biryani Point', '+918464975652', 'Taste that stays with you. 1000 ml box, sufficient for one person.', array['Biryani'], true)
  returning id
),
c as (
  insert into public.dish_categories (restaurant_id, name, sort_order)
  select r.id, 'Biryani', 0 from r
  returning id, name
)
insert into public.dishes (restaurant_id, category_id, name, price, is_veg, note, sort_order)
select r.id, c.id, v.name, v.price, v.is_veg, v.note::text, v.sort_order
from r, c, (values
    ('A1 Dum Biryani', 190, false, '1000 ml box', 0),
    ('A1 Fry Pieces Biryani', 200, false, '1000 ml box', 1),
    ('A1 Mixed Biryani', 210, false, '1000 ml box', 2)
) as v (name, price, is_veg, note, sort_order);
with r as (
  insert into public.restaurants (name, phone, description, cuisine_tags, is_active)
  values ('Spice Magic Biryanis', '+918464975652', 'Authentic taste, rich flavour, always fresh. Free delivery for VIT-AP students.', array['Biryani', 'Combos'], true)
  returning id
),
c as (
  insert into public.dish_categories (restaurant_id, name, sort_order)
  select r.id, v.name, v.sort_order
  from r, (values
    ('Biryanis', 0),
    ('Combo Packs', 1),
    ('Family Pack Buckets', 2)
  ) as v (name, sort_order)
  returning id, name
)
insert into public.dishes (restaurant_id, category_id, name, price, is_veg, note, sort_order)
select r.id, c.id, v.name, v.price, v.is_veg, v.note::text, v.sort_order
from r, (values
    ('Biryanis', 'Chicken Dum Mini', 130, false, null, 0),
    ('Biryanis', 'Chicken Fry Mini', 150, false, null, 1),
    ('Biryanis', 'Chicken Dum Full', 190, false, null, 2),
    ('Biryanis', 'Chicken Fry Full', 210, false, null, 3),
    ('Biryanis', 'Chicken Mixed', 210, false, null, 4),
    ('Biryanis', 'Chicken Moghlai Biryani', 260, false, null, 5),
    ('Biryanis', 'Chicken 65 Biryani', 260, false, null, 6),
    ('Combo Packs', 'Chicken Dum Combo Pack', 300, false, 'Dum biryani + lollipop + Thums Up peg bottle', 0),
    ('Combo Packs', 'Chicken Fry Combo Pack', 300, false, 'Fry biryani + chilli wings + Thums Up peg bottle', 1),
    ('Combo Packs', 'Chicken Mixed Combo Pack', 300, false, 'Mixed biryani + chicken wings + Thums Up peg bottle', 2),
    ('Family Pack Buckets', 'Chicken Dum Bucket', 600, false, null, 0),
    ('Family Pack Buckets', 'Chicken Fry Bucket', 650, false, null, 1),
    ('Family Pack Buckets', 'Chicken Mixed Bucket', 700, false, null, 2)
) as v (cat, name, price, is_veg, note, sort_order)
join c on c.name = v.cat;
