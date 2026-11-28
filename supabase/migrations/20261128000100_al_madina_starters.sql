-- Al Madina starters at their normal prices, plus a ₹150 price offer on
-- both that the admin switches on and off (Offers → Price offers).
insert into public.dish_categories (restaurant_id, name, sort_order)
select r.id, 'Starters', 1 from restaurants r where r.name = 'Al Madina';

insert into public.dishes (restaurant_id, category_id, name, price, is_veg, sort_order, is_available)
select r.id, c.id, d.name, d.price, false, d.sort, true
  from restaurants r
  join dish_categories c on c.restaurant_id = r.id and c.name = 'Starters'
 cross join (values ('Chicken Lollipop (4 pcs)', 180, 0), ('Chicken Wings (8 pcs)', 200, 1)) as d(name, price, sort)
 where r.name = 'Al Madina';

insert into public.price_offers (restaurant_id, title, price, dish_ids)
select r.id, 'Starters ₹150', 150,
       array(select d.id from dishes d
              where d.restaurant_id = r.id
                and d.name in ('Chicken Lollipop (4 pcs)', 'Chicken Wings (8 pcs)')
              order by d.sort_order)
  from restaurants r
 where r.name = 'Al Madina';
