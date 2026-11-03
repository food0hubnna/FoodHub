create table public.favorite_dishes (
  user_id    uuid not null references public.users (id) on delete cascade,
  dish_id    uuid not null references public.dishes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, dish_id)
);
create index favorite_dishes_user_created_idx
  on public.favorite_dishes (user_id, created_at desc);
create index favorite_dishes_dish_idx on public.favorite_dishes (dish_id);

alter table public.favorite_dishes enable row level security;
create policy "Students read own favourite dishes"
  on public.favorite_dishes for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Students add own favourite dishes"
  on public.favorite_dishes for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Students remove own favourite dishes"
  on public.favorite_dishes for delete
  to authenticated
  using (user_id = (select auth.uid()));
