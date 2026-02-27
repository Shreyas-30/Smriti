-- 004_rename_caregiver_to_curator.sql
-- Renames signup_type value 'caregiver' → 'curator' and updates the default + trigger.

-- Update existing rows
update public.users
set signup_type = 'curator'
where signup_type = 'caregiver';

-- Update column default
alter table public.users
alter column signup_type set default 'curator';

-- Recreate trigger function with updated value
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_signup_type text;
begin
  v_signup_type := coalesce(new.raw_user_meta_data->>'signup_type', 'curator');

  insert into public.users (id, first_name, last_name, phone, signup_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name',  ''),
    new.raw_user_meta_data->>'phone',
    v_signup_type
  )
  on conflict (id) do nothing;

  -- For curator signups, also create the storyteller record
  if v_signup_type = 'curator' then
    insert into public.storytellers (user_id, first_name, last_name, phone)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'storyteller_first_name', ''),
      coalesce(new.raw_user_meta_data->>'storyteller_last_name',  ''),
      new.raw_user_meta_data->>'storyteller_phone'
    );
  end if;

  return new;
end;
$$;
