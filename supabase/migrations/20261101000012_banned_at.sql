alter table public.users add column banned_at timestamptz;

create or replace function public.set_banned_at()
returns trigger
language plpgsql
as $$
begin
  if new.is_banned and not old.is_banned then
    new.banned_at := now();
  elsif not new.is_banned and old.is_banned then
    new.banned_at := null;
  end if;
  return new;
end;
$$;

create trigger set_banned_at
  before update on public.users
  for each row
  execute function public.set_banned_at();
