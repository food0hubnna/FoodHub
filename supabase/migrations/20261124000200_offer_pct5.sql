-- 5% off, alongside 10% and 20%: its own switch, per-kitchen switches like
-- the others, and place_order() accepts and prices it.
alter table public.app_settings
  add column offer_pct5 boolean not null default false;

alter table public.orders
  drop constraint orders_discount_offer_check,
  add constraint orders_discount_offer_check
    check (discount_offer in ('pct5', 'pct10', 'pct20', 'biryani'));

alter table public.offer_restaurant_exclusions
  drop constraint offer_restaurant_exclusions_offer_check,
  add constraint offer_restaurant_exclusions_offer_check
    check (offer in ('pct5', 'pct10', 'pct20'));

-- place_order(): the live definition with exactly three spots changed. Each
-- replacement must match once, or nothing is changed.
do $migration$
declare
  def text := pg_get_functiondef('public.place_order(uuid,jsonb,text,text,text,jsonb)'::regprocedure);
  patched text;
  edits text[][] := array[
    array[
      $a$if p_offer not in ('pct10', 'pct20', 'biryani')$a$,
      $b$if p_offer not in ('pct5', 'pct10', 'pct20', 'biryani')
       or (p_offer = 'pct5' and not v_settings.offer_pct5)$b$
    ],
    array[
      $a$or (p_offer in ('pct10', 'pct20') and exists ($a$,
      $b$or (p_offer in ('pct5', 'pct10', 'pct20') and exists ($b$
    ],
    array[
      $a$when 'pct10' then round(v_paid_total * 0.10)$a$,
      $b$when 'pct5' then round(v_paid_total * 0.05)
    when 'pct10' then round(v_paid_total * 0.10)$b$
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
  execute patched;
end
$migration$;
