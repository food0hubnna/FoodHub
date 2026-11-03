update public.app_settings
   set ordering_mode = case when public.ordering_is_open() then 'open' else 'closed' end
 where ordering_mode = 'auto';
alter table public.app_settings drop constraint if exists app_settings_ordering_mode_check;
alter table public.app_settings
  add constraint app_settings_ordering_mode_check check (ordering_mode in ('open', 'closed')),
  alter column ordering_mode set default 'open';
create or replace function public.ordering_is_open()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select ordering_mode = 'open' from app_settings;
$$;
drop function if exists public.ordering_schedule_open(timestamptz);
