alter table public.app_settings
  add column last_open_push_at timestamptz,
  add column recent_open_messages int[] not null default '{}';
alter table public.push_subscriptions
  add column notify_open boolean not null default true;
