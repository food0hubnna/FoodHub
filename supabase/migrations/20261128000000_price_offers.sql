-- Price offers: a kitchen sells a few dishes at one flat price while the
-- admin has the offer on ("Any biryani ₹170").
--
-- Switching one on writes the offer price into dishes.price and keeps the
-- old price in dishes.was_price; switching it off puts the old price back.
-- So the menu, the bag and place_order() all read the real price with no
-- extra logic, and the menu shows was_price struck through.

alter table public.dishes
  add column was_price numeric(10,2) check (was_price is null or was_price > 0);

create table public.price_offers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  is_on boolean not null default false,
  title text not null check (length(title) between 1 and 80),
  price numeric(10,2) not null check (price > 0),
  dish_ids uuid[] not null check (cardinality(dish_ids) > 0),
  updated_at timestamptz not null default now()
);

alter table public.price_offers enable row level security;

create policy "Anyone can read price offers" on public.price_offers
  for select using (true);

grant select on public.price_offers to anon, authenticated;

-- The admin switch. Changes the dish prices in the same transaction.
create or replace function public.set_price_offer(p_id uuid, p_on boolean)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_offer price_offers;
begin
  if not is_admin() then raise exception 'not_admin'; end if;

  select * into v_offer from price_offers where id = p_id for update;
  if not found then raise exception 'not_found'; end if;
  if v_offer.is_on = p_on then return; end if;

  if p_on then
    update dishes
       set was_price = price, price = v_offer.price
     where id = any(v_offer.dish_ids) and was_price is null and price > v_offer.price;
  else
    update dishes
       set price = was_price, was_price = null
     where id = any(v_offer.dish_ids) and was_price is not null;
  end if;

  update price_offers set is_on = p_on, updated_at = now() where id = p_id;
end;
$$;

revoke execute on function public.set_price_offer(uuid, boolean) from public, anon;
grant execute on function public.set_price_offer(uuid, boolean) to authenticated;

insert into public.price_offers (restaurant_id, title, price, dish_ids)
select r.id, 'Any biryani ₹170', 170,
       array(select d.id from dishes d
              where d.restaurant_id = r.id
                and d.name in ('Chicken Dum Full', 'Chicken Fry Full', 'Chicken Mixed')
              order by d.sort_order, d.name)
  from restaurants r
 where r.name = 'Spice Magic Biryanis';
