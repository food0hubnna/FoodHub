alter table public.users
  drop constraint users_phone_key;
create or replace function public.current_user_is_banned()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users banned_by_phone
    where banned_by_phone.phone = (
      select phone from public.users where id = auth.uid()
    )
    and banned_by_phone.is_banned = true
  );
$$;
