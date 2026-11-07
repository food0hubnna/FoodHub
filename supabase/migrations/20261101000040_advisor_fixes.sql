-- Fixes from the Supabase security and performance advisors. Behaviour is unchanged.

-- Trigger helpers get a fixed search_path.
alter function public.prevent_role_self_escalation() set search_path = public;
alter function public.set_banned_at() set search_path = public;
alter function public.set_daily_order_number() set search_path = public;
alter function public.set_delivered_at() set search_path = public;
alter function public.set_updated_at() set search_path = public;

-- Same rules, but auth.uid() is read once per query instead of once per row.
alter policy "Users can view own profile" on public.users
  using ((select auth.uid()) = id);
alter policy "Users can insert own profile" on public.users
  with check ((select auth.uid()) = id);
alter policy "Users can update own profile" on public.users
  using ((select auth.uid()) = id);
alter policy "Users can view own orders" on public.orders
  using ((select auth.uid()) = user_id);
alter policy "Users can view own order items" on public.order_items
  using (exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and orders.user_id = (select auth.uid())
  ));
alter policy "Users can view own order item addons" on public.order_item_addons
  using (exists (
    select 1 from public.order_items oi join public.orders o on o.id = oi.order_id
    where oi.id = order_item_addons.order_item_id and o.user_id = (select auth.uid())
  ));
alter policy "Students read their own reviews; admins read all" on public.order_reviews
  using (user_id = (select auth.uid()) or (select public.is_admin()));
alter policy "Students read their own ratings; admins read all" on public.order_item_ratings
  using (exists (
    select 1 from public.order_reviews r
    where r.order_id = order_item_ratings.order_id
      and (r.user_id = (select auth.uid()) or (select public.is_admin()))
  ));
alter policy "own push subscriptions" on public.push_subscriptions
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Indexes for foreign keys.
create index if not exists addons_restaurant_id_idx on public.addons (restaurant_id);
create index if not exists app_settings_offers_restaurant_id_idx on public.app_settings (offers_restaurant_id);
create index if not exists category_addons_addon_id_idx on public.category_addons (addon_id);
create index if not exists dishes_category_id_idx on public.dishes (category_id);
create index if not exists order_item_addons_addon_id_idx on public.order_item_addons (addon_id);
create index if not exists order_items_dish_id_idx on public.order_items (dish_id);
create index if not exists order_reviews_user_id_idx on public.order_reviews (user_id);
