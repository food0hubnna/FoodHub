create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
as $$
begin
  if (new.role is distinct from old.role or new.is_banned is distinct from old.is_banned)
     and auth.role() = 'authenticated' then
    raise exception 'role and is_banned cannot be changed via the API';
  end if;

  if new.phone is distinct from old.phone and auth.role() = 'authenticated' then
    if old.is_banned then
      raise exception 'phone cannot be changed while banned';
    end if;
    if exists (
      select 1 from public.orders
      where orders.user_id = old.id
        and orders.status in ('pending', 'confirmed', 'preparing', 'out_for_delivery')
    ) then
      raise exception 'phone cannot be changed while an order is in progress';
    end if;
  end if;

  return new;
end;
$$;
