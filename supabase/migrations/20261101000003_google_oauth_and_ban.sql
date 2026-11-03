alter table public.users
  alter column phone set not null;

alter table public.users
  add constraint users_phone_key unique (phone);

alter table public.users
  add column is_banned boolean not null default false;
create or replace function public.current_user_is_banned()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_banned from public.users where id = auth.uid()),
    false
  );
$$;
drop policy "Users can create own orders" on public.orders;
create policy "Users can create own orders" on public.orders
  for insert with check (
    auth.uid() = user_id and not public.current_user_is_banned()
  );
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
as $$
begin
  if (new.role is distinct from old.role or new.is_banned is distinct from old.is_banned)
     and auth.role() = 'authenticated' then
    raise exception 'role and is_banned cannot be changed via the API';
  end if;
  return new;
end;
$$;
