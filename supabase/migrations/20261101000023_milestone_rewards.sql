create table public.milestone_rewards (
  user_id    uuid primary key references public.users (id) on delete cascade,
  claimed_at timestamptz not null default now(),
  marked_by  uuid references public.users (id) on delete set null
);

alter table public.milestone_rewards enable row level security;
create policy "Students read own milestone reward"
  on public.milestone_rewards for select
  to authenticated
  using (user_id = auth.uid());
create policy "Admins read all milestone rewards"
  on public.milestone_rewards for select
  to authenticated
  using (public.is_admin());

create policy "Admins mark milestone rewards claimed"
  on public.milestone_rewards for insert
  to authenticated
  with check (public.is_admin() and marked_by = auth.uid());

create policy "Admins undo milestone rewards"
  on public.milestone_rewards for delete
  to authenticated
  using (public.is_admin());
