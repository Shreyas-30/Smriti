-- 001_initial_schema.sql

-- Extensions
create extension if not exists "pgcrypto";

-- =========
-- USERS (profile table extending auth.users)
-- =========
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

-- Create a profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========
-- ELDERS
-- =========
create table if not exists public.elders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  full_name text not null,
  phone text,
  preferred_language text not null default 'hi-en', -- 'hi' | 'en' | 'hi-en'
  whatsapp_number text,
  relationship text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_elders_updated_at on public.elders;
create trigger trg_elders_updated_at
before update on public.elders
for each row execute function public.set_updated_at();

create index if not exists idx_elders_user_id on public.elders(user_id);

-- =========
-- PROMPTS
-- =========
create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  text_en text not null,
  text_hi text not null,
  difficulty text not null default 'easy', -- easy | medium | deep
  order_index int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_prompts_active on public.prompts(is_active, order_index);

-- =========
-- RECORDINGS
-- =========
create table if not exists public.recordings (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid not null references public.elders(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id),
  audio_url text,
  duration_seconds int,
  language_detected text,
  transcription_status text not null default 'pending', -- pending | processing | completed | failed
  transcription_text text,
  transcription_language text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_recordings_updated_at on public.recordings;
create trigger trg_recordings_updated_at
before update on public.recordings
for each row execute function public.set_updated_at();

create index if not exists idx_recordings_elder_id on public.recordings(elder_id);
create index if not exists idx_recordings_prompt_id on public.recordings(prompt_id);

-- =========
-- STORIES
-- =========
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  recording_id uuid not null references public.recordings(id) on delete cascade,
  elder_id uuid not null references public.elders(id) on delete cascade,
  ai_generated_text text,
  human_edited_text text,
  status text not null default 'draft', -- draft | in_review | approved | published
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_stories_updated_at on public.stories;
create trigger trg_stories_updated_at
before update on public.stories
for each row execute function public.set_updated_at();

create index if not exists idx_stories_elder_id on public.stories(elder_id);
create index if not exists idx_stories_status on public.stories(status);

-- =========
-- PROJECTS
-- =========
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  elder_id uuid references public.elders(id) on delete set null,
  title text not null,
  description text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create index if not exists idx_projects_user_id on public.projects(user_id);

-- =========
-- SUBSCRIPTIONS
-- =========
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan text not null default 'basic',
  status text not null default 'active',
  razorpay_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);

-- =========
-- ADMIN CHECK (for review access)
-- Uses JWT app_metadata.role === 'admin'
-- =========
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- =========
-- RLS
-- =========
alter table public.users enable row level security;
alter table public.elders enable row level security;
alter table public.prompts enable row level security;
alter table public.recordings enable row level security;
alter table public.stories enable row level security;
alter table public.projects enable row level security;
alter table public.subscriptions enable row level security;

-- USERS: only self (or admin)
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
on public.users for select
using (id = auth.uid() or public.is_admin());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
on public.users for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- ELDERS: owner can read/write (or admin)
drop policy if exists "elders_select_owner" on public.elders;
create policy "elders_select_owner"
on public.elders for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "elders_insert_owner" on public.elders;
create policy "elders_insert_owner"
on public.elders for insert
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "elders_update_owner" on public.elders;
create policy "elders_update_owner"
on public.elders for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "elders_delete_owner" on public.elders;
create policy "elders_delete_owner"
on public.elders for delete
using (user_id = auth.uid() or public.is_admin());

-- PROMPTS: readable by authenticated users; writable by admin only
drop policy if exists "prompts_select_auth" on public.prompts;
create policy "prompts_select_auth"
on public.prompts for select
using (auth.uid() is not null);

drop policy if exists "prompts_write_admin" on public.prompts;
create policy "prompts_write_admin"
on public.prompts for all
using (public.is_admin())
with check (public.is_admin());

-- RECORDINGS: owner of elder can read/write (or admin)
drop policy if exists "recordings_select_owner" on public.recordings;
create policy "recordings_select_owner"
on public.recordings for select
using (
  public.is_admin()
  or exists (
    select 1 from public.elders e
    where e.id = recordings.elder_id
      and e.user_id = auth.uid()
  )
);

drop policy if exists "recordings_insert_owner" on public.recordings;
create policy "recordings_insert_owner"
on public.recordings for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.elders e
    where e.id = recordings.elder_id
      and e.user_id = auth.uid()
  )
);

drop policy if exists "recordings_update_owner" on public.recordings;
create policy "recordings_update_owner"
on public.recordings for update
using (
  public.is_admin()
  or exists (
    select 1 from public.elders e
    where e.id = recordings.elder_id
      and e.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.elders e
    where e.id = recordings.elder_id
      and e.user_id = auth.uid()
  )
);

drop policy if exists "recordings_delete_owner" on public.recordings;
create policy "recordings_delete_owner"
on public.recordings for delete
using (
  public.is_admin()
  or exists (
    select 1 from public.elders e
    where e.id = recordings.elder_id
      and e.user_id = auth.uid()
  )
);

-- STORIES: owner of elder can read; admin can review; owner can create (or admin)
drop policy if exists "stories_select_owner" on public.stories;
create policy "stories_select_owner"
on public.stories for select
using (
  public.is_admin()
  or exists (
    select 1 from public.elders e
    where e.id = stories.elder_id
      and e.user_id = auth.uid()
  )
);

drop policy if exists "stories_insert_owner" on public.stories;
create policy "stories_insert_owner"
on public.stories for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.elders e
    where e.id = stories.elder_id
      and e.user_id = auth.uid()
  )
);

drop policy if exists "stories_update_owner_or_admin" on public.stories;
create policy "stories_update_owner_or_admin"
on public.stories for update
using (
  public.is_admin()
  or exists (
    select 1 from public.elders e
    where e.id = stories.elder_id
      and e.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.elders e
    where e.id = stories.elder_id
      and e.user_id = auth.uid()
  )
);

-- PROJECTS: only owner (or admin)
drop policy if exists "projects_select_owner" on public.projects;
create policy "projects_select_owner"
on public.projects for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "projects_insert_owner" on public.projects;
create policy "projects_insert_owner"
on public.projects for insert
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "projects_update_owner" on public.projects;
create policy "projects_update_owner"
on public.projects for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "projects_delete_owner" on public.projects;
create policy "projects_delete_owner"
on public.projects for delete
using (user_id = auth.uid() or public.is_admin());

-- SUBSCRIPTIONS: only owner (or admin)
drop policy if exists "subs_select_owner" on public.subscriptions;
create policy "subs_select_owner"
on public.subscriptions for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "subs_insert_owner" on public.subscriptions;
create policy "subs_insert_owner"
on public.subscriptions for insert
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "subs_update_owner" on public.subscriptions;
create policy "subs_update_owner"
on public.subscriptions for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "subs_delete_owner" on public.subscriptions;
create policy "subs_delete_owner"
on public.subscriptions for delete
using (user_id = auth.uid() or public.is_admin());
