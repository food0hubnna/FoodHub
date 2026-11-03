alter table public.taste_profiles drop constraint taste_profiles_cravings_check;
alter table public.taste_profiles
  add constraint taste_profiles_cravings_check
    check (cravings <@ array['biryani', 'combos', 'buckets', 'chicken']::text[]);
