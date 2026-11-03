alter table public.app_settings
  add column ordering_mode text not null default 'auto'
    check (ordering_mode in ('auto', 'open', 'closed'));

update public.app_settings
   set ordering_mode = case when ordering_enabled then 'auto' else 'closed' end;
create or replace function public.ordering_schedule_open(p_at timestamptz default now())
returns boolean
language sql
immutable
as $$
  select ((p_at at time zone 'Asia/Kolkata')::time >= time '10:30'
          and (p_at at time zone 'Asia/Kolkata')::time < time '12:45')
      or ((p_at at time zone 'Asia/Kolkata')::time >= time '13:30'
          and (p_at at time zone 'Asia/Kolkata')::time < time '19:00');
$$;
create or replace function public.ordering_is_open()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case ordering_mode
           when 'open' then true
           when 'closed' then false
           else public.ordering_schedule_open(now())
         end
    from app_settings;
$$;

revoke execute on function public.ordering_is_open() from public;
grant execute on function public.ordering_is_open() to anon, authenticated;
create or replace function public.place_order(
  p_restaurant_id uuid,
  p_items jsonb,
  p_contact_phone text,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_item_count int;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;
  if not exists (select 1 from users where id = v_user_id) then
    raise exception 'profile_missing';
  end if;
  if not public.ordering_is_open() then
    if (select ordering_mode from app_settings) = 'closed' then
      raise exception 'ordering_paused';
    end if;
    raise exception 'ordering_closed';
  end if;
  if current_user_is_banned() then
    raise exception 'banned';
  end if;
  if p_contact_phone is null or p_contact_phone !~ '^\+91[6-9][0-9]{9}$' then
    raise exception 'invalid_contact_phone';
  end if;
  if p_notes is not null and length(p_notes) > 200 then
    raise exception 'notes_too_long';
  end if;
  if not exists (select 1 from restaurants where id = p_restaurant_id and is_active) then
    raise exception 'restaurant_closed';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_cart';
  end if;

  create temporary table _items on commit drop as
    select (e->>'dish_id')::uuid as dish_id, (e->>'quantity')::int as quantity
    from jsonb_array_elements(p_items) e;

  select count(*) into v_item_count from _items;

  if exists (select 1 from _items where dish_id is null or quantity is null or quantity not between 1 and 20)
     or (select count(distinct dish_id) from _items) <> v_item_count then
    raise exception 'invalid_items';
  end if;

  if (select count(*) from _items i
        join dishes d on d.id = i.dish_id
       where d.restaurant_id = p_restaurant_id and d.is_available) <> v_item_count then
    raise exception 'dish_unavailable';
  end if;

  insert into orders (user_id, restaurant_id, contact_phone, notes, total_amount)
  values (v_user_id, p_restaurant_id, p_contact_phone, nullif(trim(p_notes), ''), 0)
  returning id into v_order_id;

  insert into order_items (order_id, dish_id, dish_name, unit_price, quantity)
  select v_order_id, d.id, d.name, d.price, i.quantity
  from _items i join dishes d on d.id = i.dish_id;

  update orders
     set total_amount = (select sum(subtotal) from order_items where order_id = v_order_id)
   where id = v_order_id;

  return v_order_id;
end;
$$;
