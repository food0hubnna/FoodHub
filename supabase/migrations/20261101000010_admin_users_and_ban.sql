create policy "Admins can view all users" on public.users
  for select using (public.is_admin());
create policy "Admins can view all order items" on public.order_items
  for select using (public.is_admin());
create policy "Admins can update any user" on public.users
  for update using (public.is_admin()) with check (public.is_admin());
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.role() = 'authenticated' then
    raise exception 'role cannot be changed via the API';
  end if;

  if new.is_banned is distinct from old.is_banned
     and auth.role() = 'authenticated' and not public.is_admin() then
    raise exception 'is_banned cannot be changed via the API';
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
