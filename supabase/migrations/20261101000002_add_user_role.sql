create type public.user_role as enum ('student', 'admin');

alter table public.users
  add column role public.user_role not null default 'student';
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$;
create policy "Admins can update any order" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins can insert restaurants" on public.restaurants
  for insert with check (public.is_admin());
create policy "Admins can update restaurants" on public.restaurants
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete restaurants" on public.restaurants
  for delete using (public.is_admin());

create policy "Admins can insert dish categories" on public.dish_categories
  for insert with check (public.is_admin());
create policy "Admins can update dish categories" on public.dish_categories
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete dish categories" on public.dish_categories
  for delete using (public.is_admin());

create policy "Admins can insert dishes" on public.dishes
  for insert with check (public.is_admin());
create policy "Admins can update dishes" on public.dishes
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete dishes" on public.dishes
  for delete using (public.is_admin());
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.role() = 'authenticated' then
    raise exception 'role cannot be changed via the API';
  end if;
  return new;
end;
$$;

create trigger prevent_role_self_escalation
  before update on public.users
  for each row execute function public.prevent_role_self_escalation();
