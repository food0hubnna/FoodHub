-- Balayya Babu Biryani is Spice Magic's evening special: the note marks it,
-- and Home and the menu feature every dish whose note says "Evening special".
update public.dishes d
   set note = 'Evening special'
  from public.restaurants r
 where r.id = d.restaurant_id
   and r.name = 'Spice Magic Biryanis'
   and d.name = 'Balayya Babu Biryani';
