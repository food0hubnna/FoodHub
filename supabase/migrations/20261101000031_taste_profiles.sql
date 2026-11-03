create table public.taste_profiles (
  user_id     uuid primary key references public.users (id) on delete cascade,
  avatar      text check (avatar ~ '^[a-z0-9-]{1,32}$'),
  spice_level smallint check (spice_level between 1 and 5),
  diet        text check (diet in ('veg', 'egg', 'nonveg')),
  cravings    text[] not null default '{}'
              check (cravings <@ array['biryani', 'fried-rice', 'noodles', 'starters',
                                       'curries', 'chicken', 'paneer', 'egg',
                                       'juices', 'fruits', 'desserts']::text[]),
  updated_at  timestamptz not null default now()
);

create trigger set_updated_at before update on public.taste_profiles
  for each row execute function public.set_updated_at();

alter table public.taste_profiles enable row level security;
create policy "Students read own taste profile"
  on public.taste_profiles for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Students create own taste profile"
  on public.taste_profiles for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Students update own taste profile"
  on public.taste_profiles for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
