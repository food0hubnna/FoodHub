-- Kitchen deals: one deal per kitchen, each with its own admin switch.
-- A deal counts the dishes of one menu section (or one dish in it) and
-- pays out by tier:
--   - a gift tier: the student picks one of its free gifts, added to the
--     order as a free line (no dish row needed, e.g. "Thums Up (1 L)");
--   - a money tier: rupees off.
-- Gift deals give the highest tier reached, once per order. Money deals
-- with `repeat` pay every tier as often as it fits (11 + 5 + 5 ...).
-- The cart applies a deal by itself when the bag qualifies; it is the
-- order's one offer (discount_offer = 'deal'). place_order() re-checks it.

create table public.kitchen_deals (
  restaurant_id uuid primary key references public.restaurants (id) on delete cascade,
  is_on boolean not null default false,
  title text not null check (length(title) between 1 and 80),
  -- What is counted, for "Add 2 more biryanis": singular / plural.
  unit text not null,
  units text not null,
  count_section text not null,
  count_dish text,
  repeat boolean not null default false,
  tiers jsonb not null check (jsonb_typeof(tiers) = 'array' and jsonb_array_length(tiers) > 0),
  updated_at timestamptz not null default now()
);

alter table public.kitchen_deals enable row level security;

create policy "Anyone can read kitchen deals" on public.kitchen_deals
  for select using (true);
create policy "Admins can update kitchen deals" on public.kitchen_deals
  for update to authenticated using ((select is_admin())) with check ((select is_admin()));

grant select on public.kitchen_deals to anon, authenticated;
grant update (is_on, updated_at) on public.kitchen_deals to authenticated;

insert into public.kitchen_deals (restaurant_id, title, unit, units, count_section, count_dish, repeat, tiers)
select r.id, d.title, d.unit, d.units, d.section, d.dish, d.repeat, d.tiers::jsonb
  from (values
    ('Spice Magic Biryanis', 'Biryani freebies', 'biryani', 'biryanis', 'Biryanis', null, false,
     '[{"min": 5, "label": "Buy 5 biryanis, get 1 Mini Fry or Mini Dum Biryani free",
        "gifts": [{"name": "Mini Fry Biryani", "quantity": 1}, {"name": "Mini Dum Biryani", "quantity": 1}]},
       {"min": 10, "label": "Buy 10 biryanis, get a Chicken Starter or 2 Mini Biryanis free",
        "gifts": [{"name": "Chicken Starter", "quantity": 1}, {"name": "Mini Dum Biryani", "quantity": 2},
                  {"name": "Mini Fry Biryani", "quantity": 2}]}]'),
    ('A1 Biryani Point', 'Biryani freebies', 'biryani', 'biryanis', 'Biryani', null, false,
     '[{"min": 5, "label": "Buy 5 biryanis, get a 1 L Thums Up free",
        "gifts": [{"name": "Thums Up (1 L)", "quantity": 1}]},
       {"min": 10, "label": "Buy 10 biryanis, get a full Chicken 65 Biryani free",
        "gifts": [{"name": "Chicken 65 Biryani (Full)", "quantity": 1}]}]'),
    ('Shawarma Hub', 'Shawarma combos', 'Chicken Shawarma', 'Chicken Shawarmas', 'Chicken Shawarmas', 'Chicken Shawarma', true,
     '[{"min": 5, "label": "Friends combo: 5 Chicken Shawarmas for ₹500 (₹50 off)", "off": 50},
       {"min": 11, "label": "Party combo: 11 Chicken Shawarmas for ₹1000 (₹210 off)", "off": 210}]')
  ) as d(name, title, unit, units, section, dish, repeat, tiers)
  join public.restaurants r on r.name = d.name;

alter table public.orders
  drop constraint orders_discount_offer_check,
  add constraint orders_discount_offer_check
    check (discount_offer in ('pct5', 'pct10', 'pct20', 'biryani', 'deal'));

-- place_order(): the live definition with a new last argument (which gift
-- the student picked) and the 'deal' offer. Each replacement must match
-- exactly once, or nothing is changed.
do $migration$
declare
  def text := pg_get_functiondef('public.place_order(uuid,jsonb,text,text,text,jsonb)'::regprocedure);
  patched text;
  edits text[][] := array[
    array[
      $a$p_free_items jsonb DEFAULT NULL::jsonb)$a$,
      $b$p_free_items jsonb DEFAULT NULL::jsonb, p_deal_gift integer DEFAULT NULL::integer)$b$
    ],
    array[
      $a$  v_free_count int;
$a$,
      $b$  v_free_count int;
  v_deal kitchen_deals;
  v_deal_count int := 0;
  v_deal_left int;
  v_deal_off numeric := 0;
  v_tier jsonb;
  v_gift jsonb;
$b$
    ],
    array[
      $a$if p_offer not in ('pct5', 'pct10', 'pct20', 'biryani')$a$,
      $b$if p_offer not in ('pct5', 'pct10', 'pct20', 'biryani', 'deal')$b$
    ],
    array[
      $a$    elsif v_has_free then
      raise exception 'invalid_items';
    end if;$a$,
      $b$    elsif p_offer = 'deal' then
      if v_has_free then raise exception 'invalid_items'; end if;
      select * into v_deal from kitchen_deals where restaurant_id = p_restaurant_id and is_on;
      if not found then raise exception 'offer_unavailable'; end if;
      select coalesce(sum((e->>'quantity')::int), 0) into v_deal_count
        from jsonb_array_elements(p_items) e
        join dishes d on d.id = (e->>'dish_id')::uuid
        join dish_categories c on c.id = d.category_id
       where d.restaurant_id = p_restaurant_id
         and c.name = v_deal.count_section
         and (v_deal.count_dish is null or d.name = v_deal.count_dish);
      if v_deal.repeat then
        v_deal_left := v_deal_count;
        for v_tier in select t from jsonb_array_elements(v_deal.tiers) t order by (t->>'min')::int desc loop
          v_deal_off := v_deal_off + (v_deal_left / (v_tier->>'min')::int) * coalesce((v_tier->>'off')::numeric, 0);
          v_deal_left := v_deal_left % (v_tier->>'min')::int;
        end loop;
        if v_deal_off <= 0 then raise exception 'offer_not_eligible'; end if;
      else
        select t into v_tier from jsonb_array_elements(v_deal.tiers) t
         where (t->>'min')::int <= v_deal_count order by (t->>'min')::int desc limit 1;
        if v_tier is null then raise exception 'offer_not_eligible'; end if;
        if v_tier ? 'gifts' then
          if p_deal_gift is null or p_deal_gift < 0 or p_deal_gift >= jsonb_array_length(v_tier->'gifts') then
            raise exception 'offer_not_eligible';
          end if;
          v_gift := v_tier->'gifts'->p_deal_gift;
        else
          v_deal_off := coalesce((v_tier->>'off')::numeric, 0);
        end if;
      end if;
    elsif v_has_free then
      raise exception 'invalid_items';
    end if;$b$
    ],
    array[
      $a$  select coalesce(sum(subtotal) filter (where not is_free), 0) into v_paid_total$a$,
      $b$  if v_gift is not null then
    insert into order_items (order_id, dish_id, dish_name, unit_price, quantity, is_free)
    values (v_order_id, null, v_gift->>'name', 0, greatest(coalesce((v_gift->>'quantity')::int, 1), 1), true);
  end if;

  select coalesce(sum(subtotal) filter (where not is_free), 0) into v_paid_total$b$
    ],
    array[
      $a$    else 0
  end;$a$,
      $b$    when 'deal' then least(v_deal_off, v_paid_total)
    else 0
  end;$b$
    ]
  ];
  i int;
begin
  patched := def;
  for i in 1 .. array_length(edits, 1) loop
    if (length(patched) - length(replace(patched, edits[i][1], ''))) / length(edits[i][1]) <> 1 then
      raise exception 'place_order() changed: edit % did not match exactly once', i;
    end if;
    patched := replace(patched, edits[i][1], edits[i][2]);
  end loop;
  drop function public.place_order(uuid, jsonb, text, text, text, jsonb);
  execute patched;
end
$migration$;

revoke execute on function public.place_order(uuid, jsonb, text, text, text, jsonb, integer) from public, anon;
grant execute on function public.place_order(uuid, jsonb, text, text, text, jsonb, integer) to authenticated, service_role;

-- Balayya Babu Biryani: Spice Magic's evening special, sold out until the
-- admin switches it on.
insert into public.dishes (restaurant_id, category_id, name, price, is_veg, sort_order, is_available)
select c.restaurant_id, c.id, 'Balayya Babu Biryani', 260, false, 8, false
  from public.dish_categories c
  join public.restaurants r on r.id = c.restaurant_id
 where r.name = 'Spice Magic Biryanis' and c.name = 'Biryanis';
