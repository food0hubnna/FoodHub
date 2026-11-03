alter table public.addons enable row level security;
alter table public.category_addons enable row level security;
alter table public.order_item_addons enable row level security;
create policy "Anyone can view addons" on public.addons for select using (true);
create policy "Admins can insert addons" on public.addons for insert with check (public.is_admin());
create policy "Admins can update addons" on public.addons for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete addons" on public.addons for delete using (public.is_admin());

create policy "Anyone can view category addons" on public.category_addons for select using (true);
create policy "Admins can insert category addons" on public.category_addons for insert with check (public.is_admin());
create policy "Admins can delete category addons" on public.category_addons for delete using (public.is_admin());
create policy "Users can view own order item addons" on public.order_item_addons
  for select using (
    exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.id = order_item_addons.order_item_id and o.user_id = auth.uid()
    )
  );
create policy "Admins can view all order item addons" on public.order_item_addons
  for select using (public.is_admin());
